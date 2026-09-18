import { memo, useEffect, useRef } from "react";

import { useGameStore } from "@/hooks/useGameStore";
import { useKeyboard } from "@/hooks/useKeyboard";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";

const RollManager = memo(function RollManager() {
    const { roll } = useKeyboard();
    const touchRoll = useTouchControlsStore(
        (state) => state.touchControls.roll,
    );
    const setTouchControls = useTouchControlsStore(
        (state) => state.setTouchControls,
    );

    const setCharacterAnimation = useGameStore(
        (state) => state.setCharacterAnimation,
    );
    const setIsRolling = useGameStore((state) => state.setIsRolling);
    const setRollCooldown = useGameStore((state) => state.setRollCooldown);

    // We don't necessarily need to read these if we aren't using them in the effect
    const isRolling = useGameStore((state) => state.isRolling);
    const rollCooldown = useGameStore((state) => state.rollCooldown);

    // 1. Use refs to store the timeout IDs so they persist across renders
    const rollingTimeoutRef = useRef(null);
    const cooldownTimeoutRef = useRef(null);

    useEffect(() => {
        console.log("Handle touch roll change:", touchRoll);
        setTouchControls({
            ...useTouchControlsStore.getState().touchControls,
            roll: false,
        });
    }, [touchRoll]);

    useEffect(() => {
        // ONLY execute when the key is pressed (roll becomes true)
        if (roll || touchRoll) {
            console.log("Roll activated!", roll);

            // Optional: Clear existing timers if the user manages to roll again before it finishes
            clearTimeout(rollingTimeoutRef.current);
            clearTimeout(cooldownTimeoutRef.current);

            // 1. Start the roll sequence immediately
            setIsRolling(true);
            setRollCooldown(false);

            // 2. Assign the timeout to the ref
            rollingTimeoutRef.current = setTimeout(() => {
                console.log("Rolling ended, starting cooldown");
                setIsRolling(false);
                setRollCooldown(true);

                // 3. Assign the second timeout to the ref
                cooldownTimeoutRef.current = setTimeout(() => {
                    setRollCooldown(false);
                }, 500);
            }, 1500);
        }

        // NO CLEANUP HERE.
        // If we put clearTimeout here, it will kill the timer when `roll` changes back to false.
    }, [roll, touchRoll, setIsRolling, setRollCooldown]);

    // 2. Separate useEffect for unmount cleanup ONLY
    useEffect(() => {
        return () => {
            setIsRolling(false);
            setRollCooldown(false);
            // This only runs when the RollManager component is destroyed
            clearTimeout(rollingTimeoutRef.current);
            clearTimeout(cooldownTimeoutRef.current);
        };
    }, []);

    return null;
});

export default RollManager;
