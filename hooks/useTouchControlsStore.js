import { createWithEqualityFn as create } from "zustand/traditional";
import { persist } from "zustand/middleware";

const initialTouchControls = {
    jump: false,
    left: false,
    right: false,
    roll: false,
};

// Persist the UI preference, but keep live input on the original in-memory set.
// Zustand persist otherwise writes localStorage even when partialize omits input.
const useTouchControlsStore = create((set, get, api) =>
    persist(
        (setPreference) => ({
            enabled: false,
            setEnabled: (newValue) => setPreference({ enabled: newValue }),
            toggleEnabled: () => setPreference({ enabled: !get().enabled }),

            touchControls: initialTouchControls,
            movementInputs: { keyboard: 0, touch: 0 },
            setTouchControls: (patch, source = "touch") => {
                const state = get();
                let movementInputs = state.movementInputs;
                if ("left" in patch || "right" in patch) {
                    const previous = movementInputs[source];
                    const left = patch.left ?? previous < 0;
                    const right = patch.right ?? previous > 0;
                    const direction =
                        Number(Boolean(right)) - Number(Boolean(left));
                    if (direction !== previous)
                        movementInputs = {
                            ...movementInputs,
                            [source]: direction,
                        };
                }

                // Releasing one device must not cancel a direction held on the other.
                const direction =
                    movementInputs.keyboard || movementInputs.touch;
                const next = {
                    ...state.touchControls,
                    ...patch,
                    left: direction < 0,
                    right: direction > 0,
                };
                const controlsChanged = Object.keys(initialTouchControls).some(
                    (key) => next[key] !== state.touchControls[key],
                );
                if (!controlsChanged && movementInputs === state.movementInputs)
                    return;
                set({
                    movementInputs,
                    touchControls: controlsChanged ? next : state.touchControls,
                });
            },
        }),
        {
            name: "touch-controls-store", // unique name
            version: 2,
            partialize: (state) => ({
                enabled: state.enabled,
            }),
        },
    )(set, get, api),
);

export default useTouchControlsStore;
