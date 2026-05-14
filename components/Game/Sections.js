import { useFrame } from "@react-three/fiber";
import { memo, useEffect, useMemo, useRef, useState } from "react"

import { useGameStore, OBSTACLE_TYPES, pickObstacleType } from "@/hooks/useGameStore";
import Walls from "./Walls";

import { useStore } from "@/hooks/useStore";
import { FireLine } from "./FireLine";
import DroneObstacle from "./DroneObstacle";
import BodyObstacle from "./BodyObstacle";

function GameSections(props) {

    const ref = useRef();

    const {
        distance,
        obstacles,
        setObstacles,
        gameOver,
        freeze,
        generateInitialObstacles
    } = useGameStore();

    const graphicsQuality = useStore((state) => state.graphicsQuality);

    useEffect(() => {
        generateInitialObstacles()
    }, [graphicsQuality])

    useFrame(() => {

        if (gameOver || freeze) return

        let newObstacles = obstacles.map((obstacle) => ({
            ...obstacle,
            position: [obstacle.position[0], obstacle.position[1], obstacle.position[2] + 0.1], // Move toward the player
        }))

        // Filter out obstacles that went past the player
        newObstacles = newObstacles.filter((obstacle) => obstacle.position[2] <= 15);

        // Add new obstacles to maintain the array length
        while (newObstacles.length < obstacles.length) {
            const lastObstacle = newObstacles[newObstacles.length - 1];
            const newPositionZ = lastObstacle ? lastObstacle.position[2] - 10 : -10;

            newObstacles.push({
                position: [Math.random() * 2 - 1, 0, newPositionZ],
                id: Date.now(), // Ensure unique ID,
                obstacleType: pickObstacleType(OBSTACLE_TYPES),
            });
        }

        setObstacles(newObstacles);

    });

    return (
        <group ref={ref} position={[0, 0, 0]}>

            {/* Render Obstacles */}
            {obstacles?.map((obstacle) => (
                <Section
                    key={obstacle.id}
                    obstacle={obstacle}
                />
            ))}

        </group>
    )
}

export default GameSections

function Section({ obstacle }) {

    return (
        <>

            <Walls position={obstacle.position} />

            {obstacle.obstacleType === "FireLine" && (
                <FireLine
                    // position={obstacle.position}
                    obstacle={obstacle}
                />
            )}
            {obstacle.obstacleType === "Body" && (
                <BodyObstacle
                    obstacle={obstacle}
                />
            )}
            {obstacle.obstacleType === "Drone" && (
                <DroneObstacle
                    obstacle={obstacle}
                />
            )}
            
        </>
    );
}