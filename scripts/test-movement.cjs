// Run with: node scripts/test-movement.cjs
// Exercise frame callbacks and store selectors without WebGL or new dependencies.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
let THREE;
const { loadBindings } = require("next/dist/build/swc");

const root = path.resolve(__dirname, "..");
const compiled = new Map();
const noop = () => null;
const settings = {
    safeMode: true,
    debug: false,
    graphicsQuality: "High",
    disableDeath: false,
};
const settingsStore = Object.assign((selector) => selector(settings), {
    getState: () => settings,
});

function events() {
    const listeners = new Map();
    return {
        addEventListener(type, fn, options) {
            if (!listeners.has(type)) listeners.set(type, new Map());
            listeners
                .get(type)
                .set(fn, options === true || Boolean(options?.capture));
        },
        removeEventListener(type, fn) {
            listeners.get(type)?.delete(fn);
        },
        emit(type, value = {}) {
            const event = {
                target: { tagName: "CANVAS" },
                defaultPrevented: false,
                immediateStopped: false,
                preventDefault() {
                    this.defaultPrevented = true;
                },
                stopImmediatePropagation() {
                    this.immediateStopped = true;
                },
                ...value,
            };
            const callbacks = [...(listeners.get(type) ?? [])].sort(
                (a, b) => Number(b[1]) - Number(a[1]),
            );
            for (const [fn] of callbacks) {
                fn(event);
                if (event.immediateStopped) break;
            }
            return event;
        },
        size: () =>
            [...listeners.values()].reduce((sum, set) => sum + set.size, 0),
    };
}

function harness(bindings, game, nodeEnv = process.env.NODE_ENV) {
    const document = events();
    const window = events();
    const effects = [];
    const cleanups = [];
    const frames = [];
    const selectors = [];
    const bodies = [];
    const objects = new Map();
    let stateUpdates = 0;
    let unsubscribes = 0;
    const camera = new THREE.PerspectiveCamera();
    const touch = {
        touchControls: { left: false, right: false, jump: false, roll: false },
        setTouchControls(value) {
            touch.touchControls = value;
        },
    };
    const controller = { controllerState: { axes: [0] } };
    const createElement = (type, props, ...children) => ({
        type,
        props: { ...props, children },
    });
    const react = {
        createElement,
        memo: (component) => component,
        useRef: (current) => ({ current }),
        useMemo: (fn) => fn(),
        useCallback: (fn) => fn,
        useEffect: (fn) => effects.push(fn),
        useState(initial) {
            let value = typeof initial === "function" ? initial() : initial;
            return [
                value,
                (next) => {
                    stateUpdates++;
                    value = typeof next === "function" ? next(value) : next;
                },
            ];
        },
        useSyncExternalStore(subscribe, getSnapshot) {
            let value = getSnapshot();
            effects.push(() =>
                subscribe(() => {
                    const next = getSnapshot();
                    if (!Object.is(value, next)) stateUpdates++;
                    value = next;
                }),
            );
            return value;
        },
    };
    const gameHook = (selector) => {
        selectors.push(selector);
        return selector(game.useGameStore.getState());
    };
    Object.assign(gameHook, game.useGameStore);
    const useBody = (factory) => {
        const body = factory();
        const object = new THREE.Object3D();
        object.position.fromArray(body.position);
        object.rotation.fromArray(body.rotation ?? [0, 0, 0]);
        object.updateMatrix();
        object.matrixAutoUpdate = false;
        const ref = { current: object };
        const positionCalls = [];
        const velocityCalls = [];
        const impulseCalls = [];
        const positionSubscribers = new Set();
        const velocitySubscribers = new Set();
        const api = {
            position: {
                set: (...args) => positionCalls.push(args),
                subscribe(fn) {
                    positionSubscribers.add(fn);
                    fn(body.position);
                    return () => {
                        positionSubscribers.delete(fn);
                        unsubscribes++;
                    };
                },
            },
            velocity: {
                set: (...args) => velocityCalls.push(args),
                subscribe(fn) {
                    velocitySubscribers.add(fn);
                    fn([0, 0, 0]);
                    return () => {
                        velocitySubscribers.delete(fn);
                        unsubscribes++;
                    };
                },
            },
            applyImpulse: (impulse, point) =>
                impulseCalls.push({ impulse, point }),
        };
        bodies.push({
            body,
            ref,
            api,
            positionCalls,
            velocityCalls,
            impulseCalls,
            publishPosition(value) {
                body.position = value;
                ref.current.matrix.setPosition(...value);
                positionSubscribers.forEach((fn) => fn(value));
            },
            publishVelocity(value) {
                velocitySubscribers.forEach((fn) => fn(value));
            },
        });
        return [ref, api];
    };
    const mocks = {
        react,
        three: THREE,
        "@react-three/fiber": {
            useFrame: (fn, priority = 0) => frames.push({ fn, priority }),
            useThree: () => ({ camera, size: { width: 1400 } }),
        },
        "@react-three/cannon": {
            useBox: useBody,
            useCylinder: useBody,
            useCompoundBody: useBody,
        },
        "@/hooks/useStore": { useStore: settingsStore },
        "@/hooks/useGameStore": { ...game, useGameStore: gameHook },
        "@/hooks/useControllerStore": {
            useControllerStore: { getState: () => controller },
        },
        "@/hooks/useTouchControlsStore": {
            default: Object.assign((selector) => selector(touch), {
                getState: () => touch,
            }),
        },
        "@/hooks/useAudioStore": {
            useAudioStore: {
                getState: () => ({ audioSettings: { game_volume: 0 } }),
            },
        },
        "@articles-media/articles-dev-box/getAssetSource": {
            default: (value) => value,
        },
        "@articles-media/articles-dev-box/useUserToken": {
            default: () => ({ data: null }),
        },
        "@articles-media/articles-dev-box/useUserDetails": {
            default: () => ({ data: null }),
        },
    };
    const modules = new Map();
    function load(relativePath) {
        const filename = path.resolve(root, relativePath);
        if (modules.has(filename)) return modules.get(filename).exports;
        const loadedModule = { exports: {} };
        modules.set(filename, loadedModule);
        if (!compiled.has(filename)) {
            compiled.set(
                filename,
                bindings.transformSync(fs.readFileSync(filename, "utf8"), {
                    filename,
                    jsc: {
                        parser: { syntax: "ecmascript", jsx: true },
                        target: "es2022",
                        transform: { react: { runtime: "classic" } },
                    },
                    module: { type: "commonjs" },
                }).code,
            );
        }
        const resolve = (name) => {
            if (name === "react")
                return { __esModule: true, ...react, default: react };
            if (name === "./useStore") return mocks["@/hooks/useStore"];
            if (name in mocks) return { __esModule: true, ...mocks[name] };
            if (name === "@/hooks/useKeyboard")
                return load("hooks/useKeyboard.js");
            if (name === "zustand/traditional" || name.startsWith("three/"))
                return require(name);
            if (name === "@/util/generateRandomInteger")
                return load("util/generateRandomInteger.js");
            if (name === "@/util/smoothPlayerPosition")
                return load("util/smoothPlayerPosition.js");
            if (name === "@/util/movementDiagnostics")
                return load("util/movementDiagnostics.js");
            return new Proxy(
                { __esModule: true, default: noop },
                { get: (value, key) => value[key] ?? noop },
            );
        };
        new Function(
            "require",
            "module",
            "exports",
            "React",
            "document",
            "window",
            "Audio",
            "console",
            "process",
            compiled.get(filename),
        )(
            resolve,
            loadedModule,
            loadedModule.exports,
            react,
            document,
            window,
            class {
                play() {
                    return Promise.resolve();
                }
            },
            { log: noop, info: noop, warn: noop, error: noop },
            { env: { ...process.env, NODE_ENV: nodeEnv } },
        );
        return loadedModule.exports;
    }
    function attach(node) {
        if (!node || typeof node !== "object") return;
        if (Array.isArray(node)) {
            node.forEach(attach);
            return;
        }
        if (typeof node.type === "string" && node.props?.ref) {
            const ref = node.props.ref;
            ref.current ??= new THREE.Object3D();
            if (node.props.name) objects.set(node.props.name, ref.current);
            if (node.props.position)
                ref.current.position.fromArray(node.props.position);
            if (node.props.scale) ref.current.scale.fromArray(node.props.scale);
            if (node.props.rotation)
                ref.current.rotation.fromArray(node.props.rotation);
            if (node.type === "points") {
                ref.current.material = { uniforms: { uTime: { value: 0 } } };
                ref.current.geometry = { setDrawRange: noop };
            }
        }
        attach(node.props?.children);
    }
    return {
        load,
        react,
        frames,
        selectors,
        bodies,
        objects,
        touch,
        controller,
        document,
        window,
        get stateUpdates() {
            return stateUpdates;
        },
        get unsubscribes() {
            return unsubscribes;
        },
        mount(tree) {
            attach(tree);
            for (const effect of effects.splice(0)) {
                const cleanup = effect();
                if (typeof cleanup === "function") cleanups.push(cleanup);
            }
        },
        cleanup() {
            cleanups.splice(0).forEach((fn) => fn());
        },
        unmountLast() {
            cleanups.pop()?.();
        },
        tick(delta, elapsedTime = delta) {
            [...frames]
                .sort((a, b) => a.priority - b.priority)
                .forEach(({ fn }) =>
                    fn(
                        {
                            clock: {
                                elapsedTime,
                                getElapsedTime: () => elapsedTime,
                            },
                        },
                        delta,
                    ),
                );
        },
    };
}

Promise.all([loadBindings(), import("three")])
    .then(([bindings, three]) => {
        THREE = three;
        const bootstrap = harness(bindings, {});
        const game = bootstrap.load("hooks/useGameStore.js");
        const store = game.useGameStore;
        const reset = () =>
            store.setState({
                distance: 0,
                freeze: false,
                gameOver: 0,
                obstacles: [],
                teleport: false,
                isRolling: false,
                shift: false,
            });

        test("holding movement keys never schedules jump/roll React updates", () => {
            for (const action of ["jump", "roll"]) {
                const h = harness(bindings, game);
                h.load("hooks/useKeyboard.js").useKeyboard(action);
                h.mount();
                h.document.emit("keydown", { code: "KeyD" });
                for (let i = 0; i < 600; i++)
                    h.document.emit("keydown", { code: "KeyD", repeat: true });
                h.document.emit("keyup", { code: "KeyD" });
                assert.equal(h.stateUpdates, 0);
                h.document.emit("keydown", {
                    code: action === "jump" ? "Space" : "KeyS",
                });
                assert.equal(h.stateUpdates, 1);
                h.cleanup();
                assert.equal(h.document.size() + h.window.size(), 0);
            }
        });

        test("movement refs stay pressed during repeats and clear on blur", () => {
            const h = harness(bindings, game);
            const keys = h.load("hooks/useKeyboard.js").useKeyboardRef();
            h.mount();
            h.document.emit("keydown", { code: "KeyA" });
            for (let i = 0; i < 600; i++)
                h.document.emit("keydown", { code: "KeyA", repeat: true });
            assert.equal(keys.current.moveLeft, true);
            assert.equal(h.stateUpdates, 0);
            h.window.emit("blur");
            assert.equal(keys.current.moveLeft, false);
            assert.ok(
                Object.values(keys.current).every((value) => value === false),
            );
            h.cleanup();
        });

        test("overlapping A/D presses reverse immediately, ignore old-key repeats, and resume the remaining held key", () => {
            for (const [first, second, speed] of [
                ["KeyA", "KeyD", -4],
                ["KeyD", "KeyA", 4],
            ]) {
                reset();
                const h = harness(bindings, game);
                h.mount(h.load("components/Game/Player.js").default({}));
                h.document.emit("keydown", { code: first });
                h.tick(1 / 60);
                h.document.emit("keydown", { code: second });
                h.tick(1 / 60);
                // Reversal must change -4 to +4 (or vice versa) in one command,
                // without braking to zero while the old key is still held.
                assert.deepEqual(
                    h.bodies[0].impulseCalls.map((call) => call.impulse[0]),
                    [speed, -2 * speed],
                );
                for (let i = 0; i < 180; i++) {
                    h.document.emit("keydown", { code: first, repeat: true });
                    h.tick(1 / 60);
                }
                assert.equal(h.bodies[0].impulseCalls.length, 2);
                h.document.emit("keyup", { code: second });
                h.tick(1 / 60);
                h.document.emit("keyup", { code: first });
                h.tick(1 / 60);
                assert.deepEqual(
                    h.bodies[0].impulseCalls.map((call) => call.impulse[0]),
                    [speed, -2 * speed, 2 * speed, -speed],
                );
                assert.equal(h.stateUpdates, 0);
                h.cleanup();
            }
        });

        test("releasing the older direction does not interrupt the newer direction", () => {
            const h = harness(bindings, game);
            const keys = h.load("hooks/useKeyboard.js").useKeyboardRef();
            h.mount();
            h.document.emit("keydown", { code: "KeyA" });
            h.document.emit("keydown", { code: "KeyD" });
            const rightSnapshot = keys.current;
            assert.equal(rightSnapshot.moveLeft, false);
            assert.equal(rightSnapshot.moveRight, true);
            h.document.emit("keyup", { code: "KeyA" });
            assert.equal(keys.current, rightSnapshot);
            h.document.emit("keyup", { code: "KeyD" });
            assert.equal(keys.current.moveLeft, false);
            assert.equal(keys.current.moveRight, false);
            h.cleanup();
        });

        test("A/D repeats preserve one shared snapshot and bypass global hotkey listeners", () => {
            for (const code of ["KeyA", "KeyD"]) {
                const h = harness(bindings, game);
                const action = code === "KeyA" ? "moveLeft" : "moveRight";
                let globalKeyDowns = 0;
                const hotkeyListener = () => globalKeyDowns++;
                // Global listeners may be installed before game components mount.
                h.document.addEventListener("keydown", hotkeyListener);
                const keyboard = h.load("hooks/useKeyboard.js");
                const playerKeys = keyboard.useKeyboardRef();
                const weaponKeys = keyboard.useKeyboardRef();
                keyboard.useKeyboard("roll");
                h.mount();
                assert.equal(h.document.size(), 3); // Shared down/up + hotkeys.
                assert.equal(h.window.size(), 1);
                let storeUpdates = 0;
                const unsubscribe = store.subscribe(() => storeUpdates++);

                const firstDown = h.document.emit("keydown", { code });
                assert.equal(firstDown.immediateStopped, false);
                assert.equal(globalKeyDowns, 1);
                const heldSnapshot = playerKeys.current;
                assert.equal(heldSnapshot[action], true);
                for (let i = 0; i < 600; i++) {
                    const repeat = h.document.emit("keydown", {
                        code,
                        repeat: true,
                    });
                    assert.equal(repeat.immediateStopped, true);
                    assert.equal(repeat.defaultPrevented, true);
                    assert.equal(playerKeys.current, heldSnapshot);
                    assert.equal(weaponKeys.current, heldSnapshot);
                }
                // Duplicate downs are idempotent even without a reliable repeat flag.
                h.document.emit("keydown", { code });
                assert.equal(playerKeys.current, heldSnapshot);
                assert.equal(globalKeyDowns, 1);
                assert.equal(h.stateUpdates, 0);
                assert.equal(storeUpdates, 0);

                h.document.emit("keyup", { code });
                assert.equal(playerKeys.current[action], false);
                assert.notEqual(playerKeys.current, heldSnapshot);
                assert.equal(weaponKeys.current, playerKeys.current);
                unsubscribe();
                h.cleanup();
                assert.equal(h.document.size(), 1);
                assert.equal(h.window.size(), 0);
                h.document.removeEventListener("keydown", hotkeyListener);
            }
        });

        test("the full keyboard hook publishes once per press/release and supports overlapping jump keys", () => {
            const h = harness(bindings, game);
            const keyboard = h.load("hooks/useKeyboard.js");
            const keys = keyboard.useKeyboardRef();
            keyboard.useKeyboard();
            h.mount();
            h.document.emit("keydown", { code: "KeyA" });
            for (let i = 0; i < 600; i++)
                h.document.emit("keydown", { code: "KeyA", repeat: true });
            assert.equal(h.stateUpdates, 1);
            h.document.emit("keyup", { code: "KeyA" });
            h.document.emit("keyup", { code: "KeyA" });
            assert.equal(h.stateUpdates, 2);

            h.document.emit("keydown", { code: "KeyW" });
            const jumpSnapshot = keys.current;
            h.document.emit("keydown", { code: "Space" });
            h.document.emit("keyup", { code: "KeyW" });
            assert.equal(keys.current, jumpSnapshot);
            assert.equal(keys.current.jump, true);
            assert.equal(h.stateUpdates, 3);
            h.document.emit("keyup", { code: "Space" });
            assert.equal(keys.current.jump, false);
            assert.equal(h.stateUpdates, 4);
            h.cleanup();
        });

        test("typing, browser shortcuts and non-game hotkeys pass through the game listener", () => {
            const h = harness(bindings, game);
            const keys = h.load("hooks/useKeyboard.js").useKeyboardRef();
            h.mount();
            const idleSnapshot = keys.current;
            for (const input of [
                { code: "KeyA", target: { tagName: "INPUT" } },
                { code: "KeyD", target: { tagName: "TEXTAREA" } },
                { code: "KeyS", target: { tagName: "SELECT" } },
                { code: "KeyA", target: { isContentEditable: true } },
                { code: "KeyA", composedPath: () => [{ tagName: "INPUT" }] },
                { code: "KeyA", ctrlKey: true },
                { code: "KeyD", metaKey: true },
                { code: "KeyS", altKey: true },
                { code: "KeyA", isComposing: true },
                { code: "KeyP" },
                { code: "Slash" },
            ]) {
                for (const repeat of [false, true]) {
                    const event = h.document.emit("keydown", {
                        ...input,
                        repeat,
                    });
                    assert.equal(event.defaultPrevented, false);
                    assert.equal(event.immediateStopped, false);
                    assert.equal(keys.current, idleSnapshot);
                }
            }
            // Even when a gameplay key is held, modified shortcut events pass through.
            h.document.emit("keydown", { code: "KeyA" });
            const shortcut = h.document.emit("keydown", {
                code: "KeyA",
                ctrlKey: true,
                repeat: true,
            });
            assert.equal(shortcut.defaultPrevented, false);
            assert.equal(shortcut.immediateStopped, false);
            h.document.emit("keyup", { code: "KeyA" });
            assert.equal(keys.current.moveLeft, false);
            h.cleanup();
        });

        test("unmounting one keyboard consumer keeps the others connected; blur and remount reset held keys", () => {
            const h = harness(bindings, game);
            const keyboard = h.load("hooks/useKeyboard.js");
            const playerKeys = keyboard.useKeyboardRef();
            h.mount();
            keyboard.useKeyboardRef();
            h.mount();
            assert.equal(h.document.size() + h.window.size(), 3);
            h.unmountLast();
            assert.equal(h.document.size() + h.window.size(), 3);
            h.document.emit("keydown", { code: "KeyD" });
            assert.equal(playerKeys.current.moveRight, true);
            h.window.emit("blur");
            h.document.emit("keydown", { code: "KeyD", repeat: true });
            assert.equal(playerKeys.current.moveRight, false);
            h.document.emit("keyup", { code: "KeyD" });
            h.document.emit("keydown", { code: "KeyD" });
            assert.equal(playerKeys.current.moveRight, true);
            h.cleanup();
            assert.equal(h.document.size() + h.window.size(), 0);

            const remountedKeys = keyboard.useKeyboardRef();
            h.mount();
            assert.equal(remountedKeys.current.moveRight, false);
            h.document.emit("keydown", { code: "KeyD", repeat: true });
            assert.equal(remountedKeys.current.moveRight, false);
            h.document.emit("keyup", { code: "KeyD" });
            h.document.emit("keydown", { code: "KeyD" });
            assert.equal(remountedKeys.current.moveRight, true);
            h.cleanup();
        });

        test("world and score advance equally at 30, 60 and 144 Hz", () => {
            for (const hz of [30, 60, 144]) {
                reset();
                const h = harness(bindings, game);
                h.mount(h.load("components/Game/Sections.js").default({}));
                h.mount(h.load("components/Game/Player.js").default({}));
                const obstacle = { id: "test", position: [0, 0, -1000] };
                store.setState({ obstacles: [obstacle] });
                for (let i = 0; i < hz; i++) h.tick(1 / hz);
                assert.ok(Math.abs(store.getState().distance - 6) < 1e-10);
                assert.ok(Math.abs(obstacle.position[2] + 994) < 1e-9);
                assert.ok(h.frames[0].priority < 0);
            }
        });

        test("freeze, game over, landing mode and tab resume preserve world rules", () => {
            reset();
            const h = harness(bindings, game);
            h.mount(h.load("components/Game/Sections.js").default({}));
            const obstacle = { id: "test", position: [0, 0, 0] };
            store.setState({ obstacles: [obstacle] });
            h.tick(1 / 60);
            assert.equal(store.getState().distance, 0);
            assert.equal(obstacle.position[2], 0.1);
            store.setState({ freeze: true });
            h.tick(1);
            store.setState({ freeze: false, gameOver: true });
            h.tick(1);
            assert.equal(obstacle.position[2], 0.1);
            assert.ok(Math.abs(game.getRunStep(0, 10) - 0.6) < 1e-10);
            assert.equal(game.getRunStep(749.5, 1 / 60), 0.125);
            assert.ok(Math.abs(game.getRunStep(750, 1 / 60) - 0.15) < 1e-10);
        });

        test("sustained left/right input keeps world motion and score in sync", () => {
            for (const code of ["KeyA", "KeyD"]) {
                reset();
                const h = harness(bindings, game);
                h.mount(h.load("components/Game/Sections.js").default({}));
                h.mount(h.load("components/Game/Player.js").default({}));
                const obstacle = { id: "test", position: [0, 0, -1000] };
                store.setState({ obstacles: [obstacle] });
                h.document.emit("keydown", { code });
                for (let i = 0; i < 600; i++) {
                    h.document.emit("keydown", { code, repeat: true });
                    h.tick(1 / 60);
                }
                assert.ok(Math.abs(store.getState().distance - 60) < 1e-9);
                assert.ok(Math.abs(obstacle.position[2] + 940) < 1e-8);
                assert.equal(h.stateUpdates, 0);
                assert.equal(h.bodies[0].impulseCalls.length, 1);
                h.document.emit("keyup", { code });
                h.tick(1 / 60);
                assert.equal(h.bodies[0].impulseCalls.length, 2);
                h.cleanup();
            }
        });

        test("keyboard, touch and full-stick gamepad produce identical movement with delayed worker samples", () => {
            const traces = [];
            for (const source of ["keyboard", "touch", "gamepad"]) {
                reset();
                const h = harness(bindings, game);
                h.mount(h.load("components/Game/Player.js").default({}));
                const visual = h.objects.get("player-visual");
                const positions = [];
                let previousAxis = 0;
                for (let frame = 0; frame < 720; frame++) {
                    const phase = frame % 120;
                    const axis =
                        phase < 10 ? 0 : phase < 60 ? -1 : phase < 70 ? 0 : 1;
                    if (source === "keyboard") {
                        if (axis !== previousAxis) {
                            if (previousAxis)
                                h.document.emit("keyup", {
                                    code: previousAxis < 0 ? "KeyA" : "KeyD",
                                });
                            if (axis)
                                h.document.emit("keydown", {
                                    code: axis < 0 ? "KeyA" : "KeyD",
                                });
                        } else if (axis && frame % 4 === 0) {
                            h.document.emit("keydown", {
                                code: axis < 0 ? "KeyA" : "KeyD",
                                repeat: true,
                            });
                        }
                    } else if (source === "touch") {
                        h.touch.touchControls.left = axis < 0;
                        h.touch.touchControls.right = axis > 0;
                    } else {
                        h.controller.controllerState.axes[0] = axis;
                    }
                    // All sources receive the same irregular worker feedback,
                    // including several render frames without a position reply.
                    if (frame % 3 === 0 && frame % 13 !== 0) {
                        h.bodies[0].publishPosition([
                            Math.sin(frame / 40),
                            0.825,
                            0,
                        ]);
                        h.bodies[0].publishVelocity([axis * 4, 0, 0]);
                    }
                    h.tick(1 / 144, frame / 144);
                    positions.push(visual.position.toArray());
                    previousAxis = axis;
                }
                traces.push({
                    commands: h.bodies[0].impulseCalls,
                    positions,
                    hitboxCommands: h.bodies[1].positionCalls,
                    stateUpdates: h.stateUpdates,
                });
                h.cleanup();
            }
            assert.ok(traces[0].commands.length > 10);
            assert.equal(traces[0].stateUpdates, 0);
            assert.deepEqual(traces[0], traces[1]);
            assert.deepEqual(traces[0], traces[2]);
        });

        test("movement timing captures distinguish repeated events, input changes, frame stalls and stale physics", () => {
            const h = harness(bindings, game);
            const { createMovementRecording } = h.load(
                "util/movementDiagnostics.js",
            );
            const capture = createMovementRecording("keyboard", 0);
            capture.physicsSample(0);
            capture.keyEvent(
                { code: "KeyD", type: "keydown", timeStamp: 3 },
                5,
            );
            capture.keyboardTransition("moveRight", 5);
            capture.movementCommand();
            capture.frame(16, 0.016, 1, 0, 0, 0.1, 0.05);
            for (let i = 0; i < 30; i++) {
                capture.keyEvent(
                    {
                        code: "KeyD",
                        type: "keydown",
                        repeat: true,
                        timeStamp: 20,
                    },
                    21,
                );
            }
            capture.physicsSample(32);
            capture.frame(32, 0.016, 1, 0, 0, 0.2, 0.1);
            capture.keyEvent(
                { code: "KeyD", type: "keyup", timeStamp: 35 },
                36,
            );
            capture.keyboardTransition("moveRight", 36);
            capture.movementCommand();
            capture.playerCommit();
            capture.frame(82, 0.05, 0, 0, 0, 0.2, 0.15);
            const result = capture.result(100);
            assert.equal(result.keyRepeats, 30);
            assert.equal(result.keyboardTransitions, 2);
            assert.equal(result.keyDowns, 1);
            assert.equal(result.keyUps, 1);
            assert.equal(result.movementCommands, 2);
            assert.equal(result.playerCommits, 1);
            assert.equal(result.framesOver25Ms, 1);
            assert.equal(result.frameTimeMs.max, 50);
            assert.equal(result.physicsReplyGapMs.max, 32);
            assert.equal(result.physicsSampleAgeAtFrameMs.max, 50);
            assert.equal(result.keyboardEventDeliveryMs.max, 2);
            assert.equal(result.keyboardTransitionToFrameMs.max, 46);
            assert.equal(result.maxVisualErrorX, 0.1);
            assert.deepEqual(result.sourceFrames, {
                keyboard: 2,
                touch: 0,
                gamepad: 0,
                idle: 1,
                mixed: 0,
            });
        });

        test("development timing capture is inactive by default and removes listeners when stopped or unmounted", () => {
            reset();
            const h = harness(bindings, game, "development");
            h.mount(h.load("components/Game/Player.js").default({}));
            const api = h.window.schoolRunMovement;
            assert.ok(api);
            assert.equal(h.window.size(), 1); // Only the existing keyboard blur listener.
            assert.equal(api.stop(), null);
            try {
                api.start("keyboard");
                assert.equal(h.window.size(), 4);
                h.window.emit("keydown", {
                    type: "keydown",
                    code: "KeyD",
                    timeStamp: performance.now(),
                });
                h.document.emit("keydown", { code: "KeyD" });
                h.tick(1 / 60);
                h.document.emit("keydown", { code: "KeyD", repeat: true });
                h.tick(1 / 60);
                const result = api.stop();
                assert.equal(result.keyboardTransitions, 1);
                assert.equal(result.movementCommands, 1);
                assert.equal(result.playerCommits, 0);
                assert.equal(result.sourceFrames.keyboard, 2);
                assert.equal(h.window.size(), 1);
                assert.equal(api.results.length, 1);
                api.start("touch");
                api.start("gamepad");
                assert.equal(h.window.size(), 4);
                assert.equal(api.results.length, 2);
            } finally {
                h.cleanup();
            }
            assert.equal(h.window.schoolRunMovement, undefined);
            assert.equal(h.window.size() + h.document.size(), 0);

            const production = harness(bindings, game, "production");
            production.mount(
                production.load("components/Game/Player.js").default({}),
            );
            assert.equal(production.window.schoolRunMovement, undefined);
            production.cleanup();
        });

        test("sections notify React only when an obstacle recycles", () => {
            reset();
            const h = harness(bindings, game);
            h.mount(h.load("components/Game/Sections.js").default({}));
            const obstacle = { id: "test", position: [0, 0, 14] };
            const obstacles = [obstacle];
            store.setState({ obstacles });
            h.tick(1 / 60);
            assert.equal(store.getState().obstacles, obstacles);
            obstacle.position[2] = 15;
            h.tick(1 / 60);
            assert.notEqual(store.getState().obstacles, obstacles);
            assert.equal(store.getState().obstacles.length, 1);
            assert.notEqual(store.getState().obstacles[0].id, "test");
        });

        test("lights recycle by section and move continuously across the boundary", () => {
            reset();
            const h = harness(bindings, game);
            const tree = h
                .load("components/Game/AnimatedPointLights.js")
                .default();
            const lights = tree.props.children[0];
            const light = lights[1].type(lights[1].props); // index 0 survives a section boundary
            h.mount(light);
            store.setState({ distance: 9.9 });
            h.tick(1 / 60);
            assert.ok(
                Math.abs(light.props.ref.current.position.z + 0.1) < 1e-10,
            );
            assert.equal(h.selectors[0](store.getState()), 0);
            store.setState({ distance: 10.1 });
            h.tick(1 / 60);
            assert.ok(
                Math.abs(light.props.ref.current.position.z - 0.1) < 1e-10,
            );
            assert.equal(h.selectors[0](store.getState()), 1);
            assert.equal(h.stateUpdates, 0);
        });

        test("HUD updates only on displayed changes; hidden death screen stays quiet", () => {
            for (const [file, expectedMax] of [
                ["UiOverlay", 6],
                ["LeftPanel", 6],
                ["DeathScreen", 0],
            ]) {
                reset();
                const h = harness(bindings, game);
                h.load(`components/UI/${file}.js`).default({});
                let previous = h.selectors.map((selector) =>
                    selector(store.getState()),
                );
                let renders = 0;
                for (let i = 1; i <= 60; i++) {
                    store.setState({ distance: i / 10 });
                    const values = h.selectors.map((selector) =>
                        selector(store.getState()),
                    );
                    if (
                        values.some(
                            (value, index) =>
                                !Object.is(value, previous[index]),
                        )
                    )
                        renders++;
                    previous = values;
                }
                assert.equal(renders, expectedMax);
            }
        });

        test("idle movement avoids worker spam and key release sends a stop immediately", () => {
            reset();
            const h = harness(bindings, game);
            h.mount(h.load("components/Game/Player.js").default({}));
            for (let i = 0; i < 60; i++) h.tick(1 / 60);
            assert.equal(h.bodies[0].velocityCalls.length, 0);
            assert.equal(h.bodies[1].positionCalls.length, 0);
            h.document.emit("keydown", { code: "KeyD" });
            h.tick(1 / 60);
            h.document.emit("keyup", { code: "KeyD" });
            h.tick(1 / 60);
            assert.deepEqual(
                h.bodies[0].impulseCalls.map((call) => call.impulse),
                [
                    [4, 0, 0],
                    [-4, 0, 0],
                ],
            );
            assert.equal(h.bodies[0].velocityCalls.length, 0);
            h.cleanup();
        });

        test("lane boundaries block outward movement while allowing the return direction", () => {
            reset();
            const h = harness(bindings, game);
            h.mount(h.load("components/Game/Player.js").default({}));
            h.bodies[0].body.position[0] = 2.5;
            h.document.emit("keydown", { code: "KeyD" });
            h.tick(1 / 60);
            assert.equal(h.bodies[0].impulseCalls.length, 0);
            h.document.emit("keyup", { code: "KeyD" });
            h.document.emit("keydown", { code: "KeyA" });
            h.tick(1 / 60);
            assert.deepEqual(
                h.bodies[0].impulseCalls.at(-1).impulse,
                [-4, 0, 0],
            );
            store.setState({ shift: true });
            h.tick(1 / 60);
            assert.deepEqual(
                h.bodies[0].impulseCalls.at(-1).impulse,
                [-4, 0, 0],
            );
            h.cleanup();
        });

        test("player input, jumping and subscription cleanup work without per-frame React updates", () => {
            reset();
            const h = harness(bindings, game);
            h.mount(h.load("components/Game/Player.js").default({}));
            h.document.emit("keydown", { code: "KeyD" });
            h.tick(1 / 60);
            assert.deepEqual(
                h.bodies[0].impulseCalls.at(-1).impulse,
                [4, 0, 0],
            );
            h.document.emit("keyup", { code: "KeyD" });
            h.controller.controllerState.axes[0] = -0.5;
            h.tick(1 / 60);
            assert.deepEqual(
                h.bodies[0].impulseCalls.at(-1).impulse,
                [-6, 0, 0],
            );
            h.controller.controllerState.axes[0] = 0;
            h.touch.touchControls.left = true;
            h.tick(1 / 60);
            assert.deepEqual(
                h.bodies[0].impulseCalls.at(-1).impulse,
                [-2, 0, 0],
            );
            h.bodies[0].body.position[1] = 0.825;
            h.touch.touchControls.jump = true;
            h.tick(1 / 60);
            assert.deepEqual(
                h.bodies[0].impulseCalls.at(-1).impulse,
                [0, 6, 0],
            );
            assert.equal(h.touch.touchControls.jump, false);
            assert.equal(h.stateUpdates, 0);
            assert.ok(Math.abs(store.getState().distance - 0.4) < 1e-10);
            h.cleanup();
            assert.equal(h.unsubscribes, 2);
            assert.equal(h.document.size() + h.window.size(), 0);
        });

        test("character visuals smooth delayed physics samples while the collider stays authoritative", () => {
            reset();
            const h = harness(bindings, game);
            h.mount(h.load("components/Game/Player.js").default({}));
            const visual = h.objects.get("player-visual");
            const collider = h.bodies[0];
            assert.notEqual(visual, collider.ref.current);
            collider.publishPosition([0.2, 2, 0]);
            h.tick(1 / 144);
            const first = visual.position.x;
            assert.ok(first > 0 && first < 0.2);
            h.tick(1 / 144); // No new worker response; visual still moves smoothly.
            assert.ok(visual.position.x > first && visual.position.x < 0.2);
            assert.equal(collider.ref.current.matrix.elements[12], 0.2);
            assert.deepEqual(collider.positionCalls, []);
            assert.deepEqual(h.bodies[1].positionCalls.at(-1), [0.2, 2, 0]);
            collider.publishPosition([-0.2, 2, 0]);
            const beforeReverse = visual.position.x;
            h.tick(1 / 144);
            assert.ok(
                visual.position.x < beforeReverse && visual.position.x > -0.2,
            );
            collider.publishPosition([10, 2, 0]);
            h.tick(1 / 144);
            assert.equal(visual.position.x, 10); // Teleport snaps immediately.
            h.cleanup();
        });

        test("visual smoothing is independent of render rate and snaps after a tab resume", () => {
            const h = harness(bindings, game);
            const smooth = h.load("util/smoothPlayerPosition.js").default;
            const expected = 0.5 * (1 - Math.exp(-40 * 0.5));
            for (const hz of [30, 60, 144]) {
                const current = new THREE.Vector3(0, 2, 0);
                const target = [0.5, 2, 0];
                for (let i = 0; i < hz / 2; i++)
                    smooth(current, target, 1 / hz);
                assert.ok(Math.abs(current.x - expected) < 1e-12);
                assert.deepEqual(target, [0.5, 2, 0]);
            }
            const current = new THREE.Vector3(0, 2, 0);
            smooth(current, [0.2, 2, 0], 1);
            assert.equal(current.x, 0.2);
        });

        test("a jump is sent only once while grounded worker feedback is still stale", () => {
            reset();
            const h = harness(bindings, game);
            h.mount(h.load("components/Game/Player.js").default({}));
            h.bodies[0].publishPosition([0, 0.825, 0]);
            h.document.emit("keydown", { code: "Space" });
            for (let i = 0; i < 20; i++) h.tick(1 / 144);
            assert.deepEqual(
                h.bodies[0].impulseCalls.map((call) => call.impulse),
                [[0, 6, 0]],
            );
            h.bodies[0].publishVelocity([0, 5.75, 0]);
            h.tick(1 / 144);
            assert.equal(h.bodies[0].impulseCalls.length, 1);
            h.cleanup();
        });

        test("real Cannon physics keeps lateral speed steady and preserves jump velocity through reversals", () => {
            const CANNON = require(
                require.resolve("cannon-es", {
                    paths: [
                        path.dirname(
                            require.resolve("@react-three/cannon/package.json"),
                        ),
                    ],
                }),
            );
            reset();
            const h = harness(bindings, game);
            h.mount(h.load("components/Game/Player.js").default({}));
            h.mount(
                h
                    .load("components/Game/Floor.js")
                    .default({ position: [0, -0.125, 0] }),
            );
            const player = h.bodies[0];
            const playerProps = player.body;
            const floorProps = h.bodies.at(-1).body;
            const world = new CANNON.World({
                gravity: new CANNON.Vec3(0, -15, 0),
            });
            world.defaultContactMaterial.contactEquationStiffness = 1e6;
            const body = new CANNON.Body({
                mass: playerProps.mass,
                position: new CANNON.Vec3(...playerProps.position),
                angularFactor: new CANNON.Vec3(...playerProps.angularFactor),
                linearFactor: new CANNON.Vec3(...playerProps.linearFactor),
                linearDamping: playerProps.linearDamping,
                material: new CANNON.Material(playerProps.material),
            });
            const shape = playerProps.shapes[0];
            body.addShape(
                new CANNON.Sphere(shape.args[0]),
                new CANNON.Vec3(...shape.position),
            );
            const floor = new CANNON.Body({
                mass: floorProps.mass,
                position: new CANNON.Vec3(...floorProps.position),
                material: new CANNON.Material(floorProps.material),
            });
            floor.addShape(
                new CANNON.Box(
                    new CANNON.Vec3(...floorProps.args.map((size) => size / 2)),
                ),
            );
            world.addBody(body);
            world.addBody(floor);
            let applied = 0;
            const step = () => {
                h.tick(1 / 60);
                while (applied < player.impulseCalls.length) {
                    const call = player.impulseCalls[applied++];
                    body.applyImpulse(
                        new CANNON.Vec3(...call.impulse),
                        new CANNON.Vec3(...call.point),
                    );
                }
                world.step(1 / 60);
                player.publishPosition(body.position.toArray());
                player.publishVelocity(body.velocity.toArray());
            };
            for (let i = 0; i < 120; i++) step(); // Settle onto the floor.
            const groundedY = body.position.y;
            assert.ok(Math.abs(groundedY - 0.825) < 0.001);
            for (let cycle = 0; cycle < 20; cycle++) {
                const code = cycle % 2 ? "KeyA" : "KeyD";
                const speed = cycle % 2 ? -4 : 4;
                h.document.emit("keydown", { code });
                for (let i = 0; i < 15; i++) {
                    step();
                    assert.ok(Math.abs(body.velocity.x - speed) < 1e-10);
                    assert.ok(Math.abs(body.position.y - groundedY) < 0.001);
                }
                h.document.emit("keyup", { code });
            }
            h.document.emit("keydown", { code: "KeyD" });
            h.touch.touchControls.jump = true;
            step();
            const upwardVelocity = body.velocity.y;
            assert.ok(upwardVelocity > 5.5);
            h.document.emit("keyup", { code: "KeyD" });
            h.document.emit("keydown", { code: "KeyA" });
            step();
            assert.ok(Math.abs(body.velocity.x + 4) < 1e-10);
            assert.ok(
                Math.abs(body.velocity.y - (upwardVelocity - 15 / 60)) < 1e-10,
            );
            assert.equal(player.velocityCalls.length, 0);
            assert.equal(player.impulseCalls.length, 23);
            h.cleanup();
        });

        test("obstacle visuals and physics receive the same current-frame position", () => {
            for (const [file, exportName] of [
                ["BodyObstacle", "default"],
                ["DroneObstacle", "default"],
                ["HorizontalObstacle", "default"],
                ["FireLine", "FireLine"],
            ]) {
                reset();
                const h = harness(bindings, game);
                const obstacle = { id: "test", position: [1, 0, -5] };
                const tree = h
                    .load(`components/Game/${file}.js`)
                    [exportName]({ obstacle, count: 5 });
                h.mount(tree);
                obstacle.position[2] = -4.8;
                h.tick(1 / 60, 0);
                const body = h.bodies[0];
                assert.equal(body.ref.current.matrix.elements[14], -4.8);
                assert.equal(body.positionCalls.at(-1)[2], -4.8);
            }
        });
    })
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
