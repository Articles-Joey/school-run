// Opt-in development diagnostics. Recording allocates buffers once, then writes
// numbers without logging, updating React, or publishing Zustand state per frame.
const CAPACITY = 20000;
let recording = null;

function summarize(values, count) {
    if (!count) return { samples: 0, mean: null, p95: null, max: null };
    const sorted = Array.from(values.subarray(0, count)).sort((a, b) => a - b);
    const round = (value) => Math.round(value * 100) / 100;
    return {
        samples: count,
        mean: round(sorted.reduce((sum, value) => sum + value, 0) / count),
        p95: round(sorted[Math.ceil(count * 0.95) - 1]),
        max: round(sorted[count - 1]),
    };
}

export function createMovementRecording(label, startedAt) {
    const frameTimes = new Float64Array(CAPACITY);
    const physicsGaps = new Float64Array(CAPACITY);
    const physicsAges = new Float64Array(CAPACITY);
    const inputDelays = new Float64Array(CAPACITY);
    const eventDelays = new Float64Array(CAPACITY);
    const sourceFrames = {
        keyboard: 0,
        touch: 0,
        gamepad: 0,
        idle: 0,
        mixed: 0,
    };
    let frames = 0;
    let physicsSamples = 0;
    let ageSamples = 0;
    let inputSamples = 0;
    let eventSamples = 0;
    let lastPhysicsAt = null;
    let pendingInputAt = null;
    let slowFrames = 0;
    let maxVisualError = 0;
    let keyDowns = 0;
    let keyRepeats = 0;
    let keyUps = 0;
    let keyboardTransitions = 0;
    let movementCommands = 0;
    let playerCommits = 0;
    let blurEvents = 0;

    return {
        keyEvent(event, now) {
            if (event.code !== "KeyA" && event.code !== "KeyD") return;
            if (event.type === "keyup") keyUps++;
            else if (event.repeat) keyRepeats++;
            else keyDowns++;
            // Event timestamp -> listener measures delivery delay. Use only the
            // performance timeline time origin, as used by modern browsers.
            const delay = now - event.timeStamp;
            if (
                Number.isFinite(delay) &&
                delay >= 0 &&
                delay < 60000 &&
                eventSamples < CAPACITY
            )
                eventDelays[eventSamples++] = delay;
        },
        keyboardTransition(action, now) {
            if (action !== "moveLeft" && action !== "moveRight") return;
            keyboardTransitions++;
            pendingInputAt ??= now;
        },
        physicsSample(now) {
            if (lastPhysicsAt !== null && physicsSamples < CAPACITY)
                physicsGaps[physicsSamples++] = now - lastPhysicsAt;
            lastPhysicsAt = now;
        },
        movementCommand() {
            movementCommands++;
        },
        playerCommit() {
            playerCommits++;
        },
        blur() {
            blurEvents++;
        },
        frame(now, delta, keyboard, touch, gamepad, physicalX, visualX) {
            if (frames >= CAPACITY) return;
            const ms = delta * 1000;
            frameTimes[frames++] = ms;
            if (ms > 25) slowFrames++;
            if (lastPhysicsAt !== null)
                physicsAges[ageSamples++] = now - lastPhysicsAt;
            if (pendingInputAt !== null) {
                inputDelays[inputSamples++] = now - pendingInputAt;
                pendingInputAt = null;
            }
            const active =
                Number(keyboard !== 0) +
                Number(touch !== 0) +
                Number(Math.abs(gamepad) > 0.3);
            const source =
                active > 1
                    ? "mixed"
                    : keyboard
                      ? "keyboard"
                      : touch
                        ? "touch"
                        : Math.abs(gamepad) > 0.3
                          ? "gamepad"
                          : "idle";
            sourceFrames[source]++;
            maxVisualError = Math.max(
                maxVisualError,
                Math.abs(physicalX - visualX),
            );
        },
        result(now) {
            return {
                label,
                durationMs: Math.round(now - startedAt),
                frames,
                truncated: frames === CAPACITY,
                sourceFrames: { ...sourceFrames },
                frameTimeMs: summarize(frameTimes, frames),
                framesOver25Ms: slowFrames,
                physicsReplyGapMs: summarize(physicsGaps, physicsSamples),
                physicsSampleAgeAtFrameMs: summarize(physicsAges, ageSamples),
                keyboardEventDeliveryMs: summarize(eventDelays, eventSamples),
                keyboardTransitionToFrameMs: summarize(
                    inputDelays,
                    inputSamples,
                ),
                keyDowns,
                keyRepeats,
                keyUps,
                keyboardTransitions,
                movementCommands,
                playerCommits,
                blurEvents,
                maxVisualErrorX: Math.round(maxVisualError * 10000) / 10000,
            };
        },
    };
}

export function recordKeyboardTransition(action) {
    if (recording) recording.keyboardTransition(action, performance.now());
}

export function recordPhysicsSample() {
    if (recording) recording.physicsSample(performance.now());
}

export function recordMovementCommand() {
    recording?.movementCommand();
}

export function recordPlayerCommit() {
    recording?.playerCommit();
}

export function recordMovementFrame(
    delta,
    keyboard,
    touch,
    gamepad,
    physicalX,
    visualX,
) {
    if (recording)
        recording.frame(
            performance.now(),
            delta,
            keyboard,
            touch,
            gamepad,
            physicalX,
            visualX,
        );
}

export function installMovementDiagnostics() {
    if (process.env.NODE_ENV !== "development" || typeof window === "undefined")
        return;
    let timer;
    const results = [];
    const onKey = (event) => recording?.keyEvent(event, performance.now());
    const onBlur = () => recording?.blur();
    const detach = () => {
        clearTimeout(timer);
        window.removeEventListener("keydown", onKey, true);
        window.removeEventListener("keyup", onKey, true);
        window.removeEventListener("blur", onBlur);
    };
    const api = {
        results,
        start(label = "keyboard", durationMs = 10000) {
            if (
                !Number.isFinite(durationMs) ||
                durationMs < 1000 ||
                durationMs > 60000
            )
                throw new Error(
                    "Choose a capture duration between 1000 and 60000 ms.",
                );
            if (recording) api.stop();
            recording = createMovementRecording(label, performance.now());
            // Window capture observes physical repeats before the game suppresses
            // them at document capture. It does not change event propagation.
            window.addEventListener("keydown", onKey, true);
            window.addEventListener("keyup", onKey, true);
            window.addEventListener("blur", onBlur);
            timer = setTimeout(() => api.stop(), durationMs);
            return `Recording ${label} for ${durationMs / 1000}s. Focus the game and move left/right.`;
        },
        stop() {
            if (!recording) return null;
            const capture = recording;
            recording = null;
            detach();
            const result = capture.result(performance.now());
            results.push(result);
            console.info("Movement timing capture", result);
            return result;
        },
    };
    window.schoolRunMovement = api;
    return () => {
        recording = null;
        detach();
        if (window.schoolRunMovement === api) delete window.schoolRunMovement;
    };
}
