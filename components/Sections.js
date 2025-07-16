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

import { useGameStore } from "@/hooks/useGameStore";
import Walls from "./Walls";
// import { RepeatWrapping } from "three";
// import { HoodiePlayerDeadModel } from "./PlayerModels/HoodiePlayerDead";

// import { SuitWomanModel } from './PlayerModels/SuitWoman';
// import { Model as ModelManBeach } from '@/components/Games/Assets/Quaternius/men/Beach';

import { BloodSplatModel } from '@/components/Models/BloodSplat';
import { DeadBody } from "@/components/Models/DeadBody";
// import { degToRad } from "three/src/math/MathUtils.js";

function Decorations(props) {

    const ref = useRef();

    // const obstacles = useRef([])

    const {
        distance,
        obstacles,
        setObstacles,
        gameOver
    } = useGameStore()

    // Generate initial obstacles
    useEffect(() => {

        if (obstacles?.length !== 0) return

        let initialObstacles = []

        for (let i = 0; i < 10; i++) {
            initialObstacles.push({ position: [generateRandomInteger(-1, 1), 0, -i * 10], id: i })
        }

        setObstacles(initialObstacles)

    }, [])

    useFrame(() => {

        if (gameOver) return

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
                id: Date.now(), // Ensure unique ID
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

    return (
        <group ref={ref} position={[0, 0, 0]}>

            {/* Render Obstacles */}
            {obstacles?.map((obstacle) => (
                <Obstacle
                    key={obstacle.id}
                    obstacle={obstacle}
                />
            ))}

            {/* <group>{leftSideMemo}</group> */}
            {/* <group>{rightSideMemo}</group> */}

        </group>
    )
}

export default Decorations

function Obstacle({ obstacle }) {

    const alreadyTriggeredRef = useRef(false)

    const [alreadyTriggered, setAlreadyTriggered] = useState(false);

    // useEffect(() => {

    //     console.log("alreadyTriggeredRef", alreadyTriggeredRef)

    //     if (alreadyTriggeredRef.current) {
    //         console.log("alreadyTriggeredRef.current changed")
    //         setAlreadyTriggered(true)
    //     }
    // }, [alreadyTriggeredRef])

    const [ref, api] = useBox(() => ({
        // mass: 0,
        // type: 'Static',
        isTrigger: true,
        onCollide: (e) => {

            // console.log("collide detected!", alreadyTriggeredRef.current)

            // Could not pass trigger state via userData to player as state was always stale so now just passing the obstacle id now and player will prevent recalling game over for the same obstacle id after restart

            // alreadyTriggeredRef.current = true
            // setAlreadyTriggered(true)

        },
        args: [0.7, 1, 1],
        position: obstacle.position,
        userData: {
            isObstacle: true,
            id: obstacle.id
        }
    }))

    useEffect(() => {

        api.position.set(...obstacle.position)

    }, [obstacle.position])

    return (
        <group>

            <Walls
                position={obstacle.position}
            />

            <group>
                <mesh ref={ref}>

                    <group position={[0, 0, 0.5]}>
                        <DeadBody
                            // position={[-0.15 , 0, -8.5]}
                            rotation={[0, 0, 0]}
                            action="Death"
                        />
                    </group>

                    <BloodSplatModel
                        position={[0, 0, 0]}
                        rotation={[0, -140 * Math.PI / 180, 0]}
                    />

                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial
                        color="red"
                        transparent={true}
                        opacity={0}
                    />
                </mesh>
            </group>

        </group>
    )
}