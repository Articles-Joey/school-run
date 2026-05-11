import { useBox, useCylinder } from "@react-three/cannon";
import { Text, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from '@react-three/drei'
import { memo, useEffect, useMemo, useRef, useState } from "react"

import generateRandomInteger from "@/util/generateRandomInteger"
// import getRandomHexColor from "util/getRandomHexColor"

import { ChairModel } from "@/components/Models/Chair";
import { DeskModel } from "@/components/Models/Desk";
import { ComputerScreenModel } from "@/components/Models/ComputerScreen";
import { ComputerKeyboardModel } from "@/components/Models/ComputerKeyboard";
import Witch from "@/components/PlayerModels/Witch";
import Duck from "@/components/PlayerModels/Duck";
import Dog from "@/components/PlayerModels/Dog";
import Bear from "@/components/PlayerModels/Bear";
import { PearModel } from "@/components/Models/Pear";
import { TelevisionVintageModel } from "@/components/Models/TelevisionVintage";

import { useGameStore, OBSTACLE_TYPES, pickObstacleType } from "@/hooks/useGameStore";
import Walls from "../Walls";
// import { RepeatWrapping } from "three";
// import { HoodiePlayerDeadModel } from "./PlayerModels/HoodiePlayerDead";

// import { SuitWomanModel } from './PlayerModels/SuitWoman';
// import { Model as ModelManBeach } from '@/components/Games/Assets/Quaternius/men/Beach';

import { BloodSplatModel } from '@/components/Models/BloodSplat';
import { DeadBody } from "@/components/Models/DeadBody";
import { WetFloorSign } from "../Models/WetFloorSign";
import { useStore } from "@/hooks/useStore";
import { degToRad } from "three/src/math/MathUtils.js";
import { FireLine } from "./FireLine";
import DroneObstacle from "./DroneObstacle";
import BodyObstacle from "./BodyObstacle";
// import { degToRad } from "three/src/math/MathUtils.js";

function Decorations(props) {

    const ref = useRef();

    // const obstacles = useRef([])

    const {
        distance,
        obstacles,
        setObstacles,
        gameOver,
        freeze,
        generateInitialObstacles
    } = useGameStore();

    const graphicsQuality = useStore((state) => state.graphicsQuality);

    // Generate initial obstacles
    useEffect(() => {

        generateInitialObstacles()

        // const max = 10

        // const obstacleCount = graphicsQuality === "High" ? max : graphicsQuality === "Medium" ? max / 2 : max / 4;

        // if (obstacles?.length !== 0) return

        // let initialObstacles = []

        // for (let i = 0; i < obstacleCount; i++) {
        //     initialObstacles.push({ position: [generateRandomInteger(-1, 1), 0, -i * 10], id: i })
        // }

        // setObstacles(initialObstacles)

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

        return

        // let newObstacles = obstacles.map(obstacle => {
        //     obstacle.position[2] += 0.1
        //     return obstacle
        // })

        // setObstacles(newObstacles)

        // return

        // // console.log("obstacles", obstacles.current)

        // // Update obstacles' positions and remove them if they go behind the player
        // obstacles.current.forEach((obstacle, index) => {
        //     obstacle.position[2] += 0.1 // Move towards the player

        //     // if (obstacle.position[2] < distance + 5) {
        //     //     // Remove obstacle if it goes behind the player
        //     //     obstacles.current.splice(index, 1)
        //     //     // Add a new obstacle in front
        //     //     const newObstacle = {
        //     //         position: [0, 0, obstacles.current[obstacles.current.length - 1]?.position[2] - 10 || -10],
        //     //         id: Date.now(),
        //     //     }
        //     //     obstacles.current.push(newObstacle)
        //     // }
        // })

        return

        if (ref.current) {
            const newZ = ref.current.position.z + 0.05;
            ref.current.position.z = newZ;
        }
    });

    return (
        <group ref={ref} position={[0, 0, 0]}>

            {/* Render Obstacles */}
            {obstacles?.map((obstacle) => (
                <Obstacle
                    key={obstacle.id}
                    obstacle={obstacle}
                />
            ))}

        </group>
    )
}

export default Decorations

function Obstacle({ obstacle }) {
    // if (obstacle.obstacleType === "Body") return <BodyObstacle obstacle={obstacle} />;
    // if (obstacle.obstacleType === "Drone") return <DroneObstacle obstacle={obstacle} />;
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

