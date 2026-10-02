import { createContext, useContext, useEffect, useRef, useState } from "react";
import { RigidBody, useBeforePhysicsStep } from "@react-three/rapier";
import { getRunStep, useGameStore } from "@/hooks/useGameStore";

export const PHYSICS_STEP = 1 / 60;
const ScrollingContext = createContext(null);

// Advance the hallway and every obstacle together, once per physics step.
// The registry avoids depending on the order of individual component callbacks.
export function ScrollingPhysics({ children }) {
    const [bodies] = useState(() => new Set());
    const elapsed = useRef(0);

    useBeforePhysicsStep(() => {
        const { gameOver, freeze, distance, obstacles } =
            useGameStore.getState();
        if (!gameOver && !freeze) {
            elapsed.current += PHYSICS_STEP;
            const step = getRunStep(distance, PHYSICS_STEP);
            for (const obstacle of obstacles) obstacle.position[2] += step;
        }

        // Also submit stationary targets when stopped, clearing kinematic velocity.
        for (const update of bodies) update(elapsed.current);
    });

    return (
        <ScrollingContext.Provider value={bodies}>
            {children}
        </ScrollingContext.Provider>
    );
}

// Visuals and sensors share Rapier's interpolated transform. No manual mesh
// position writes, worker messages, or React state updates while scrolling.
export default function ScrollingBody({
    obstacle,
    x = obstacle.position[0],
    y = obstacle.position[1],
    sway = false,
    rotation,
    isObstacle = true,
    children,
}) {
    const bodies = useContext(ScrollingContext);
    const body = useRef(null);
    const [initialPosition] = useState(() => [x, y, obstacle.position[2]]);

    useEffect(() => {
        const target = { x, y, z: obstacle.position[2] };
        const update = (elapsed) => {
            if (!body.current) return;
            target.x = x + (sway ? Math.sin(elapsed * 2) * 2.5 : 0);
            target.z = obstacle.position[2];
            body.current.setNextKinematicTranslation(target);
        };
        bodies.add(update);
        return () => bodies.delete(update);
    }, [bodies, obstacle, x, y, sway]);

    return (
        <RigidBody
            ref={body}
            type="kinematicPosition"
            colliders={false}
            position={initialPosition}
            rotation={rotation}
            userData={{ isObstacle, id: obstacle.id }}
        >
            {children}
        </RigidBody>
    );
}
