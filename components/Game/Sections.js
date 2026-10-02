import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

import { useGameStore, pickObstacleType } from "@/hooks/useGameStore";
import Walls from "./Walls";

import { useStore } from "@/hooks/useStore";
import { FireLine } from "./FireLine";
import DroneObstacle from "./DroneObstacle";
import BodyObstacle from "./BodyObstacle";
import HorizontalObstacle from "./HorizontalObstacle";

function GameSections() {
    const ref = useRef();

    const obstacles = useGameStore((state) => state.obstacles);
    const generateInitialObstacles = useGameStore(
        (state) => state.generateInitialObstacles,
    );

    const graphicsQuality = useStore((state) => state.graphicsQuality);

    useEffect(() => {
        generateInitialObstacles();
    }, [graphicsQuality, generateInitialObstacles]);

    useFrame(() => {
        const { gameOver, freeze, distance, obstacles, setObstacles } =
            useGameStore.getState();
        if (gameOver || freeze) return;

        // Physics advances positions; React only handles section replacement.
        if (!obstacles.some((obstacle) => obstacle.position[2] > 15)) return;
        const kept = obstacles.filter((obstacle) => obstacle.position[2] <= 15);

        while (kept.length < obstacles.length) {
            const lastObstacle = kept[kept.length - 1];
            const newPositionZ = lastObstacle
                ? lastObstacle.position[2] - 10
                : -10;

            kept.push({
                position: [Math.random() * 2 - 1, 0, newPositionZ],
                id: Date.now() + kept.length, // Ensure unique ID,
                obstacleType: pickObstacleType(distance),
            });
        }

        setObstacles(kept);
    }, -0.5);

    return (
        <group
            ref={ref}
            position={[0, 0, 0]}
        >
            {/* Render Obstacles */}
            {obstacles?.map((obstacle) => (
                <Section
                    key={obstacle.id}
                    obstacle={obstacle}
                />
            ))}
        </group>
    );
}

export default GameSections;

function Section({ obstacle }) {
    return (
        <>
            <Walls obstacle={obstacle} />

            {obstacle.obstacleType === "FireLine" && (
                <FireLine
                    // position={obstacle.position}
                    obstacle={obstacle}
                />
            )}
            {obstacle.obstacleType === "Body" && (
                <BodyObstacle obstacle={obstacle} />
            )}
            {obstacle.obstacleType === "Drone" && (
                <DroneObstacle obstacle={obstacle} />
            )}
            {obstacle.obstacleType === "Horizontal" && (
                <HorizontalObstacle obstacle={obstacle} />
            )}
        </>
    );
}
