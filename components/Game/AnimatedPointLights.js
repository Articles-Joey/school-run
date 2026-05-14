import { useGameStore } from "@/hooks/useGameStore";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

function FlickeringLight({ position, isFlickering }) {
    const lightRef = useRef();

    useFrame(({ clock }) => {
        if (!lightRef.current || !isFlickering) return;

        // Create a strobing/flickering effect using sine and random noise
        const time = clock.getElapsedTime();
        const flicker = Math.sin(time * 20) > 0.5 ? 1 : 0.2;
        const noise = Math.random() > 0.9 ? 0 : 1;
        
        lightRef.current.intensity = 1 * flicker * noise;
    });

    return (
        <pointLight
            ref={lightRef}
            position={position}
            intensity={5}
            distance={20}
            decay={2}
        />
    );
}

export default function AnimatedPointLights() {

    const distance = useGameStore(state => state.distance);

    const lights = useMemo(() => {
        const result = [];
        // Lights are spaced every 10 units
        const spacing = 10;
        const count = 5;

        // The world moves toward the player (Z increases).
        // A section at -10 will eventually reach 0 then 10 then 15 (where it is removed).
        // Distance is a tracker of meters run.
        
        // We want to show 5 lights that are "ahead" of the player.
        // If distance is 0, we show lights at distances 30, 20, 10, 0, -10 relative to player.
        // "Starting at 30 to -10" means relative Z of -30 to +10.
        
        // We use Math.floor(distance / spacing) to find which "set" of lights we are on.
        const baseIndex = Math.floor(distance / spacing);
        
        for (let i = -1; i < count - 1; i++) {
            const index = baseIndex + i;
            
            // The Z position of a light at 'index' when distance is 0 would be -index * spacing.
            // As distance increases, things move in +Z direction.
            const z = (distance % spacing) + (i * -spacing) - 10;
            
            // Consistently determine if this light-index should flicker (20% chance)
            // Using a simple hash-like function of the index to keep it stable
            const flickerSeed = Math.abs(Math.sin(index)) * 10000;
            const isFlickering = (flickerSeed % 100) < 20;

            result.push({
                id: index,
                position: [0, 3, z],
                isFlickering
            });
        }
        
        return result;
    }, [distance]);

    return (
        <>
            {lights.map(light => (
                <FlickeringLight
                    key={light.id}
                    position={light.position}
                    isFlickering={light.isFlickering}
                />
            ))}
        </>
    )

}