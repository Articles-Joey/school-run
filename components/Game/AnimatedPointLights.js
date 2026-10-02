import { useGameStore } from "@/hooks/useGameStore";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

const SPACING = 10;

function FlickeringLight({ index, isFlickering }) {
    const lightRef = useRef();

    useFrame(({ clock }) => {
        if (!lightRef.current) return;
        // Keep each light's world position stable when its neighbors recycle.
        lightRef.current.position.z =
            useGameStore.getState().distance - index * SPACING - 10;
        if (!isFlickering) return;

        // Create a strobing/flickering effect using sine and random noise
        const time = clock.getElapsedTime();
        const flicker = Math.sin(time * 20) > 0.5 ? 1 : 0.2;
        const noise = Math.random() > 0.9 ? 0 : 1;

        lightRef.current.intensity = 1 * flicker * noise;
    });

    return (
        <pointLight
            ref={lightRef}
            position={[0, 3, 0]}
            intensity={5}
            distance={20}
            decay={2}
        />
    );
}

export default function AnimatedPointLights() {
    // React only adds/removes lights when a whole section has passed.
    const baseIndex = useGameStore((state) =>
        Math.floor(state.distance / SPACING),
    );

    const lights = useMemo(() => {
        const result = [];
        // Lights are spaced every 10 units
        const count = 5;

        for (let i = -1; i < count - 1; i++) {
            const index = baseIndex + i;

            // Consistently determine if this light-index should flicker (20% chance)
            // Using a simple hash-like function of the index to keep it stable
            const flickerSeed = Math.abs(Math.sin(index)) * 10000;
            const isFlickering = flickerSeed % 100 < 20;

            result.push({
                id: index,
                isFlickering,
            });
        }

        return result;
    }, [baseIndex]);

    return (
        <>
            {lights.map((light) => (
                <FlickeringLight
                    key={light.id}
                    index={light.id}
                    isFlickering={light.isFlickering}
                />
            ))}
        </>
    );
}
