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
import Walls from "./Walls";
// import { RepeatWrapping } from "three";
// import { HoodiePlayerDeadModel } from "./PlayerModels/HoodiePlayerDead";

// import { SuitWomanModel } from './PlayerModels/SuitWoman';
// import { Model as ModelManBeach } from '@/components/Games/Assets/Quaternius/men/Beach';

import { BloodSplatModel } from '@/components/Models/BloodSplat';
import { DeadBody } from "@/components/Models/DeadBody";
import { WetFloorSign } from "./Models/WetFloorSign";
import { useStore } from "@/hooks/useStore";
import { degToRad } from "three/src/math/MathUtils.js";
import { FireLine } from "./Game/FireLine";
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
        newObstacles = newObstacles.filter((obstacle) => obstacle.position[2] <= 10);

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
                    position={obstacle.position}
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

function BodyObstacle({ obstacle }) {
    const safeMode = useStore((state) => state.safeMode);

    const randomRotation = useMemo(() => {
        return [0, Math.random() * Math.PI * 2, 0];
    }, []);

    const leftSideMemo = useMemo(() => {

        return [...Array(60)].map((item, i) => {
            return (
                <group
                    key={i}
                    position={[2, 0, -(i * 20)]}
                >

                    <ChairModel
                        scale={2}
                        position={[1, 0, 0.5]}
                        rotation={[0, -Math.PI, 0]}
                    />

                    <DeskModel
                        scale={2}
                    />

                    <group
                        scale={0.1}
                        position={[0.1, 0.77, -0.4]}
                    >
                        <Witch
                            rotation={[0, 20 * Math.PI / 180, 0]}
                        />
                        <Duck
                            position={[1.5, 0, 0]}
                            rotation={[0, 20 * Math.PI / 180, 0]}
                        />
                        <Dog
                            position={[3, 0, 0]}
                            rotation={[0, 20 * Math.PI / 180, 0]}
                        />
                        <Bear
                            position={[4.5, 0, 0]}
                            rotation={[0, 20 * Math.PI / 180, 0]}
                        />
                        <PearModel
                            position={[6, 0, 0]}
                            rotation={[0, 20 * Math.PI / 180, 0]}
                            scale={6}
                        />
                        <TelevisionVintageModel
                            position={[15, 14, 0]}
                            rotation={[0, -30 * Math.PI / 180, 0]}
                            scale={18}
                        />
                    </group>

                </group>
            )
        })

    }, [])

    const rightSideMemo = useMemo(() => {

        return [...Array(60)].map((item, i) => {
            return (
                <group
                    key={i}
                    position={[-3.5, 0, -(i * 20)]}
                >

                    <ChairModel
                        scale={2}
                        position={[1, 0, 0.5]}
                        rotation={[0, -Math.PI, 0]}
                    />

                    <DeskModel
                        scale={2}
                    />

                    <ComputerScreenModel
                        position={[0, 0.77, -0.4]}
                        rotation={[0, 20 * Math.PI / 180, 0]}
                    />

                    <ComputerScreenModel
                        position={[0.4, 0.77, -0.55]}
                        rotation={[0, 0 * Math.PI / 180, 0]}
                    />

                    <ComputerKeyboardModel
                        position={[0.2, 0.77, -0.2]}
                        rotation={[0, 20 * Math.PI / 180, 0]}
                    />

                </group>
            )
        })

    }, [])

    const [ref, api] = useBox(() => ({
        isTrigger: true,
        args: [0.7, 1, 1],
        position: obstacle.position,
        rotation: randomRotation, // Syncs physics body with visual rotation
        userData: {
            isObstacle: true,
            id: obstacle.id
        }
    }));

    // Update position if the obstacle prop changes
    useEffect(() => {
        api.position.set(...obstacle.position);
    }, [obstacle.position, api]);

    return (
        <group>

            

            {/* <group>{leftSideMemo}</group>
            <group>{rightSideMemo}</group> */}

            {/* The physics ref is on this mesh; it will now use randomRotation */}
            <mesh ref={ref}>
                
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial transparent opacity={0} />

                {/* Models are children, they will inherit the rotation from 'ref' */}
                <group position={[0, 0, 0.5]}>
                    {!safeMode ? (
                        <DeadBody action="Death" />
                    ) : (
                        <>
                            <WetFloorSign
                                position={[0, 0, -0.15]}
                            />
                            <WetFloorSign
                                position={[0, 0, -0.85]}
                            />
                        </>
                    )}
                </group>

                {/* {!safeMode && ( */}
                <BloodSplatModel
                    position={[-0.1, 0, -0.3]}
                    rotation={[0, -140 * Math.PI / 180, 0]}
                />
                {/* )} */}

            </mesh>

        </group>
    );
}

function DroneObstacle({ obstacle }) {
    const droneY = 1.5;

    const [ref, api] = useBox(() => ({
        isTrigger: true,
        args: [0.8, 0.3, 0.8],
        position: [obstacle.position[0], droneY, obstacle.position[2]],
        userData: {
            isObstacle: true,
            id: obstacle.id
        }
    }));

    useEffect(() => {
        api.position.set(obstacle.position[0], droneY, obstacle.position[2]);
    }, [obstacle.position, api]);

    return (
        <mesh ref={ref}>
            <boxGeometry args={[0.8, 0.3, 0.8]} />
            <meshStandardMaterial transparent opacity={0} />
            <group>
                {/* Central body */}
                <mesh>
                    <boxGeometry args={[0.25, 0.1, 0.25]} />
                    <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
                </mesh>
                {/* Arms + rotors */}
                {[[-0.3, 0, -0.3], [0.3, 0, -0.3], [-0.3, 0, 0.3], [0.3, 0, 0.3]].map((rPos, i) => (
                    <group key={i} position={rPos}>
                        <mesh rotation={[0, Math.PI / 4, 0]}>
                            <boxGeometry args={[0.28, 0.03, 0.03]} />
                            <meshStandardMaterial color="#444" />
                        </mesh>
                        <mesh position={[0, 0.03, 0]}>
                            <cylinderGeometry args={[0.1, 0.1, 0.02, 8]} />
                            <meshStandardMaterial color="#555" metalness={0.6} />
                        </mesh>
                    </group>
                ))}
                {/* Camera lens */}
                <mesh position={[0, -0.08, 0.1]}>
                    <sphereGeometry args={[0.035, 8, 8]} />
                    <meshStandardMaterial color="#f00" emissive="#f00" emissiveIntensity={1} />
                </mesh>
            </group>
        </mesh>
    );
}