import { useFrame, useThree } from "@react-three/fiber"
import { useBox, useSphere } from "@react-three/cannon"
import { useGLTF, useAnimations, Text } from '@react-three/drei'
import { memo, useEffect, useRef } from "react"
import { Vector3 } from "three"
import * as THREE from 'three';
import { useKeyboard } from "@/hooks/useKeyboard"

import { useControllerStore } from '@/hooks/useControllerStore';
import { useControlsStore, useGameStore } from "@/hooks/useGameStore";

// import ClownfishModel from "./PlayerModels/Clownfish"
// import BoneFishModel from "./PlayerModels/BoneFish"

import { useLocalStorageNew } from "@/hooks/useLocalStorageNew"

import { HoodiePlayerModel } from "./PlayerModels/HoodiePlayer"
import { FpsRigAkmModel } from "./Models/FpsRigAkm"
// import { useSelector } from "react-redux"
import axios from "axios"
// import { SuitWomanModel } from "./PlayerModels/SuitWoman"

const JUMP_FORCE = 6;
const SPEED = 4;

let lastLocation

function myToFixed(i, digits) {
    var pow = Math.pow(10, digits);

    return Math.floor(i * pow) / pow;
}

function PlayerBase(props) {

    // const { setPlayerData, teleportPlayer, setTeleportPlayer } = props;

    // const userReduxState = useSelector((state) => state.auth.user_details)
    const userReduxState = false

    const {
        cameraMode, setCameraMode,
        teleport, setTeleport,
        setPlayerLocation,
        maxHeight, setMaxHeight,
        shift, setShift,
        distance, setDistance,
        addDistance,
        gameOver,
        setGameOver,
        setHighScore,
        debug
    } = useGameStore()

    const {
        touchControls, setTouchControls
    } = useControlsStore()

    const { controllerState, setControllerState } = useControllerStore()

    const [character, setCharacter] = useLocalStorageNew("game:ocean-rings:character", {
        model: 'Clownfish',
        color: '#000000'
    })

    function saveHighScore() {

        let currentDistance = useGameStore.getState().distance

        currentDistance = currentDistance.toFixed(2)

        const bestDistance = useGameStore.getState().highScore
        // const setHighScore = useGameStore.getState().setHighScore

        console.log("Save high score called with distance of", currentDistance)

        if (currentDistance > bestDistance) {
            console.log("New all time high score was achieved", currentDistance, bestDistance)
            setHighScore(+currentDistance)

            // If signed in player then save to DB
            if (userReduxState?._id) {
                axios.post('/api/user/community/games/scoreboard/set', {
                    game: 'School Run',
                    value: +currentDistance
                })
                    .then(response => {
                        console.log(response.data)
                    })
                    .catch(response => {
                        console.log(response.data)
                    })
            }
        }

    }

    // Attach event listeners when the component mounts
    useEffect(() => {

        if (controllerState.axes && Math.abs(controllerState?.axes[0]) > 0.3) {

            if (controllerState?.axes[0] > 0) {
                api.position.set([-1, 5, 0]);
            } else {
                api.position.set([1, 5, 0]);
            }

        }

    }, [controllerState]);

    useEffect(() => {

        if (teleport) {

            console.log("Teleport has been called!", teleport)
            api.position.set(teleport[0], teleport[1], teleport[2]);
            setTeleport(false)

        }

    }, [teleport]);

    const { moveBackward, moveForward, moveRight, moveLeft, jump, shift: isShifting, crouch } = useKeyboard()

    const { camera } = useThree()

    const lastObstacleRef = useRef(false)

    const [ref, api] = useBox(() => ({
        mass: 1,
        args: [0.6, 0.75, 0.75],
        material: {
            friction: 0.5 // Adjust this value to control friction
        },
        angularFactor: [0, 0, 0],
        // friction: 0,
        position: [0, 2, 0],
        onCollide: (e) => {

            // console.log("Test Collide Test", e?.body)

            if (e.body.userData.isObstacle && e.body.userData.id !== lastObstacleRef.current) {

                console.log("Player hit an obstacle", e?.body.userData)
                lastObstacleRef.current = e?.body.userData.id
                setGameOver(true)

                saveHighScore()

            }

        }
    }))

    const [refLeft] = useBox(() => ({
        mass: 0,
        type: "Static",
        args: [0.75, 0.75, 0.75],
        material: {
            friction: 0.5
        },
        angularFactor: [0, 0, 0],
        position: [-2, 1, 0],
    }))

    const [refRight] = useBox(() => ({
        mass: 0,
        type: "Static",
        args: [0.75, 0.75, 0.75],
        material: {
            friction: 0.5
        },
        angularFactor: [0, 0, 0],
        position: [2, 1, 0],
    }))

    const material = new THREE.MeshPhysicalMaterial({
        color: 'green',
        opacity: debug ? 0.5 : 0,
        transparent: true
    });

    const vel = useRef([0, 0, 0])
    useEffect(() => {
        api.velocity.subscribe((v) => vel.current = v)
    }, [api.velocity])

    const pos = useRef([0, 0, 0])
    useEffect(() => {

        api.position.subscribe((p) => pos.current = p)

    }, [api.position])

    useEffect(() => {
        console.log("Shift", isShifting)
        setShift(isShifting)
    }, [isShifting])

    useFrame(() => {

        // setDistance((prevDistance) => prevDistance + 1 * delta)

        if (!gameOver) {
            addDistance(0.1)
        }

        if (cameraMode == "Player") {
            camera.position.copy(new Vector3(0, 2, (pos.current[2] + 5)))
            camera.lookAt(new Vector3(0, 1, (pos.current[2] + 0)))
        }

        let posX = 0
        if (pos.current[0]) {
            posX = myToFixed(pos.current[0], 2)
        }

        // console.log(pos.current[1])
        let posY = 0
        if (pos.current[1]) {
            posY = myToFixed(pos.current[1], 2)
        }

        let posZ = 0
        if (pos.current[2]) {
            posZ = myToFixed(pos.current[2], 2)
        }

        // console.log(posX)

        let newLocation = new Vector3(posX, posY, posZ)

        if (JSON.stringify(lastLocation) !== JSON.stringify(newLocation)) {
            // console.log(newLocation, lastLocation)
            setPlayerLocation(newLocation)
            lastLocation = newLocation
        }
        // else {
        //     console.log("location unchanged")
        // }

        if (pos.current[1] > maxHeight) {
            setMaxHeight(pos.current[1].toFixed(2))
        }

        const direction = new Vector3()

        const frontVector = new Vector3(
            0,
            (moveBackward ? -1 : 0) - (moveForward ? -1 : 0),
            0
        )

        const sideVector = new Vector3(
            (moveLeft || touchControls.left ? 1 : 0) - (moveRight || touchControls.right ? 1 : 0),
            0,
            0,
        )

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(SPEED * (shift ? 2 : 1))
            .applyEuler(camera.rotation)

        api.velocity.set(direction.x, vel.current[1], 0)

        if ((jump || touchControls.jump) && Math.abs(vel.current[1]) < 0.05) {

            console.log("Jump understood")

            api.velocity.set(vel.current[0], JUMP_FORCE, vel.current[2])

            if (
                touchControls.jump
                // ||
                // touchControls.left
                // ||
                // touchControls.right
            ) {
                setTouchControls({
                    ...touchControls,
                    jump: false,
                    // left: false,
                    // right: false
                })
            }
        }

    })

    return (
        <group>

            <mesh
                ref={ref}
                // {...props}
                // position={position}
                material={material}
            >
                <boxGeometry
                    args={[1, 1]}
                />

                <HoodiePlayerModel
                    position={[0, -0.11, 0]}
                    rotation={[0, -Math.PI, 0]}
                />

                <FpsRigAkmModel
                    position={[-0.18, 0.6, 3.5]}
                    rotation={[0, Math.PI / 2, 0]}
                    scale={0.1}
                />

                {/* <Text
                    color="black" position={[0, -0.7, 0]} scale={0.3} anchorX="center" anchorY="middle"
                >
                    Player ({character.model})
                </Text> */}
            </mesh>

        </group>
    )
}

export default memo(PlayerBase)