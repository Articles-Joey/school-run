import { useEffect, useRef, useSyncExternalStore } from "react";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";

// Key Guide
// https://www.toptal.com/developers/keycode

const keyActionMap = {
    KeyW: "jump",
    KeyS: "roll",
    KeyA: "moveLeft",
    KeyD: "moveRight",
    Space: "jump",
    ShiftLeft: "shift",
};

// Movement is stored exclusively in useTouchControlsStore. These hooks only
// expose the remaining keyboard actions used by Player and RollManager.
const initialActions = {
    jump: false,
    shift: false,
    roll: false,
};

const pressedCodes = new Set();
const subscribers = new Set();
const editableTags = new Set(["INPUT", "TEXTAREA", "SELECT"]);
let actions = initialActions;

function publishAction(action, pressed) {
    if (action === "moveLeft" || action === "moveRight") {
        // Physical keys can overlap during a reversal. Use the newest held
        // direction so A -> A+D -> D does not insert a stop between directions.
        // Set iteration follows press order; ignored repeats never reorder it.
        let latestDirection;
        for (const code of pressedCodes) {
            const heldAction = keyActionMap[code];
            if (heldAction === "moveLeft" || heldAction === "moveRight")
                latestDirection = heldAction;
        }
        const direction =
            latestDirection === "moveLeft"
                ? -1
                : latestDirection === "moveRight"
                  ? 1
                  : 0;
        const input = useTouchControlsStore.getState();
        if (input.movementInputs.keyboard === direction) return;

        // A/D use the exact same flags and setter as the on-screen joystick.
        // Movement never publishes to the React keyboard hook or keyboard refs.
        input.setTouchControls(
            { left: direction < 0, right: direction > 0 },
            "keyboard",
        );
        return;
    }
    if (actions[action] === pressed) return;
    actions = { ...actions, [action]: pressed };
    subscribers.forEach((notify) => notify());
}

function isEditing(event) {
    const target = event.composedPath?.()[0] ?? event.target;
    return target?.isContentEditable || editableTags.has(target?.tagName);
}

function onKeyDown(event) {
    const action = keyActionMap[event.code];
    if (
        !action ||
        isEditing(event) ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.isComposing
    )
        return;

    // Consume repeats at window capture before document/React hotkey handlers.
    // A held key remains true; physics reads it without another event or write.
    // Also reject orphan repeats after a blur/remount until a fresh press occurs.
    if (event.repeat || pressedCodes.has(event.code)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
    }
    event.preventDefault();
    pressedCodes.add(event.code);
    publishAction(action, true);
}

function onKeyUp(event) {
    const action = keyActionMap[event.code];
    if (!action || !pressedCodes.delete(event.code)) return;
    // W and Space both map to jump; releasing one must not release the other.
    const stillPressed = [...pressedCodes].some(
        (code) => keyActionMap[code] === action,
    );
    publishAction(action, stillPressed);
}

function onBlur() {
    pressedCodes.clear();
    publishAction("moveLeft", false);
    if (!Object.values(actions).some(Boolean)) return;
    actions = initialActions;
    subscribers.forEach((notify) => notify());
}

function onVisibilityChange() {
    if (document.hidden) onBlur();
}

function subscribeKeyboard(notify) {
    if (subscribers.size === 0) {
        window.addEventListener("keydown", onKeyDown, true);
        window.addEventListener("keyup", onKeyUp, true);
        window.addEventListener("blur", onBlur);
        document.addEventListener("visibilitychange", onVisibilityChange);
    }
    subscribers.add(notify);
    return () => {
        subscribers.delete(notify);
        if (subscribers.size !== 0) return;
        window.removeEventListener("keydown", onKeyDown, true);
        window.removeEventListener("keyup", onKeyUp, true);
        window.removeEventListener("blur", onBlur);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        onBlur();
    };
}

export const useKeyboard = (watchedAction) => {
    const value = useSyncExternalStore(
        subscribeKeyboard,
        () => (watchedAction ? actions[watchedAction] : actions),
        () => (watchedAction ? initialActions[watchedAction] : initialActions),
    );
    return watchedAction
        ? { ...initialActions, [watchedAction]: value }
        : value;
};

// All consumers share one DOM listener. These refs never trigger React renders.
export const useKeyboardRef = () => {
    const keys = useRef(actions);
    useEffect(() => {
        keys.current = actions;
        return subscribeKeyboard(() => {
            keys.current = actions;
        });
    }, []);
    return keys;
};
