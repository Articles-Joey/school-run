import { useFrame, useThree } from "@react-three/fiber"
import { useBox, useCompoundBody, useSphere, useCylinder } from "@react-three/cannon"
import { useGLTF, useAnimations, Text } from '@react-three/drei'
import { memo, useEffect, useMemo, useRef, useState } from "react"
import { Vector3 } from "three"
import * as THREE from 'three';
import { useKeyboard } from "@/hooks/useKeyboard"

import { useControllerStore } from '@/hooks/useControllerStore';
import { useGameStore, getActiveZone } from "@/hooks/useGameStore";

import { ModelFpsRigAkm } from "@/components/Models/FpsRigAkm"
import useTouchControlsStore from "@/hooks/useTouchControlsStore"
import { ModelHand } from "@/components/Models/Human hand"
import { degToRad } from "three/src/math/MathUtils.js"
import { useStore } from "@/hooks/useStore"
import { useAudioStore } from "@/hooks/useAudioStore"

import useUserToken from '@articles-media/articles-dev-box/useUserToken';
import useUserDetails from '@articles-media/articles-dev-box/useUserDetails';
import { ModelHoodieCharacter } from "../Models/HoodieCharacter"
import { ModelBloodSplat } from "../Models/BloodSplat"
import RollManager from "./RollManager"
import getAssetSource from "@/util/getAssetSource"

const JUMP_FORCE = 6;
const SPEED = 4;
const MOVE_RANGE = 2.5

let lastLocation

function myToFixed(i, digits) {
    var pow = Math.pow(10, digits);
    return Math.floor(i * pow) / pow;
}

function playSound(audioFile, modifier = 0.5) {
    // REMOVED: if (safeMode) return 
    // Reason: Safe mode should change the sound type (handled in playDeathSound), 
    // not mute the game entirely. If you want a global mute, use a separate 'isMuted' state.

    const game_volume = useAudioStore.getState().audioSettings.game_volume;
    const audio = new Audio(
        getAssetSource(audioFile)
    );
    audio.volume = (game_volume / 100) * modifier;

    // Return the promise so calling functions can use .catch()
    return audio.play();
}

function GunFlickerForJump() {
    const { jump } = useKeyboard()
    const { touchControls } = useTouchControlsStore()
    const [visible, setVisible] = useState(false)
    const timeoutRef = useRef(null)
    const lightRef = useRef()

    useEffect(() => {
        if (jump || touchControls.jump) {
            setVisible(true)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => {
                setVisible(false)
            }, 400)
        }
    }, [jump, touchControls.jump])

    useFrame(() => {
        if (visible && lightRef.current) {
            lightRef.current.intensity = Math.random() * 10
        }
    })

    if (!visible) return null

    return (
        <pointLight
            ref={lightRef}
            position={[0, 0.5, 4.5]}
            intensity={5}
            distance={5}
            color="orange"
        />
    )
}

function PlayerBase(props) {

    const debug = useStore((state) => state.debug)

    const {
        cameraMode, setCameraMode,
        teleport, setTeleport,
        setPlayerLocation,
        maxHeight, setMaxHeight,
        shift, setShift,
        addDistance,
        gameOver,
        setGameOver,
        setHighScore,
        freeze,
    } = useGameStore()
    const isRolling = useGameStore(state => state.isRolling);

    const {
        data: userToken,
        error: userTokenError,
        isLoading: userTokenLoading,
        mutate: userTokenMutate
    } = useUserToken(
        process.env.NEXT_PUBLIC_GAME_PORT
    );

    const {
        data: userDetails,
        error: userDetailsError,
        isLoading: userDetailsLoading,
        mutate: userDetailsMutate
    } = useUserDetails({
        token: userToken
    });

    const {
        touchControls, setTouchControls
    } = useTouchControlsStore()

    const { controllerState, setControllerState } = useControllerStore()

    const [showBlood, setShowBlood] = useState(false)
    const [bloodScale, setBloodScale] = useState(0)

    // const saferMode = useGameStore((state) => state.saferMode);
    const safeMode = useStore((state) => state.safeMode);

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
            if (userToken) {

                const baseLink = process.env.NODE_ENV === 'development' ?
                    'http://localhost:3001'
                    :
                    'https://articles.media'

                fetch(`${baseLink}/api/user/community/games/scoreboard/set`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-articles-api-key': userToken
                    },
                    body: JSON.stringify({
                        game: 'School Run',
                        value: +(+currentDistance || 0).toFixed(0)
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });

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

    function playDeathSound() {
        const safeMode = useStore.getState().safeMode;
        console.log("Playing death sound, safe mode is", safeMode);

        let soundPath = safeMode
            ? 'audio/floraphonic-cartoon-slide-whistle-down-2-176648.mp3'
            : 'audio/universfield-man-scream-010-277572.mp3';

        if (!safeMode) {
            playSound('audio/dennish18-machine-gun-129929.mp3')
        }

        // Catch the autoplay restriction error smoothly
        playSound(soundPath)
            ?.catch(error => {
                console.warn("Audio autoplay blocked. Waiting for user interaction.", error);
            });
    };

    const { moveBackward, moveForward, moveRight, moveLeft, jump, shift: isShifting } = useKeyboard()

    const { camera, size } = useThree()

    const lastObstacleRef = useRef(false)

    const cylinderHeight = 1.5
    const CROUCH_HEIGHT = 0.75

    const calculateChaserDistance = () => {
        if (size.width < 600) {
            return 7.25
        } else if (size.width < 1200) {
            return -0.25
        } else {
            return -0.5
        }
    }

    // Actual Player Sphere
    const [ref, api] = useCompoundBody(() => ({
        mass: 1,
        position: [0, 2, 0],
        angularFactor: [0, 0, 0],
        material: {
            friction: 0.5,
        },
        // Define the shapes that make up the capsule
        shapes: [
            // {
            //     type: 'Cylinder',
            //     args: [0.2, 0.2, cylinderHeight, 5], // [radiusTop, radiusBottom, height, segments]
            //     position: [0, 0, 0]
            // },
            // {
            //     type: 'Sphere',
            //     args: [0.2],
            //     position: [0, cylinderHeight / 2 - 0.125, 0] // Offset to the top (height/2)
            // },
            {
                type: 'Sphere',
                args: [0.2],
                position: [0, -cylinderHeight / 2 + 0.125, 0] // Offset to the bottom (-height/2)
            },
        ],
        onCollide: (e) => {
            if (e.body.userData.isObstacle && e.body.userData.id !== lastObstacleRef.current) {
                console.log("Player hit an obstacle", e?.body.userData);
                lastObstacleRef.current = e?.body.userData.id;

                if (!useStore.getState().disableDeath) {
                    setGameOver(true);
                    saveHighScore();
                    playDeathSound();
                }
            }
        },
    }));

    // External hitbox for when not rolling
    const rollRef = useRef(isRolling);
    useEffect(() => {
        if (isRolling) {
            rollRef.current = true;
        } else {
            rollRef.current = false;
        }
    }, [isRolling])
    const [hitboxRef, hitboxApi] = useCylinder(() => ({
        args: [0.25, 0.25, cylinderHeight, 8],
        position: [0, 2, 0],
        type: 'Kinematic',
        // type: 'Static',
        isTrigger: true,
        onCollide: (e) => {
            if (
                !rollRef.current &&
                e.body.userData.isObstacle
                //  && 
                //  e.body.userData.id !== lastObstacleRef.current
            ) {
                console.log("Player hit an obstacle (upper hitbox)", e?.body.userData, isRolling);
                lastObstacleRef.current = e?.body.userData.id;

                if (!useStore.getState().disableDeath) {
                    setGameOver(true);
                    saveHighScore();
                    playDeathSound();
                }
            }
        },
    }));

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

    // useEffect(() => {
    //     console.log("Shift", isShifting)
    //     setShift(isShifting)
    // }, [isShifting])

    // useEffect(() => {
    //     console.log("Shift", isShifting)
    //     if (isShifting) {
    //         // Scale the whole body down
    //         api?.scale?.set(1, 0.5, 1)
    //     } else {
    //         // Reset to normal scale
    //         api?.scale?.set(1, 1, 1)
    //     }
    // }, [isShifting, api])

    useEffect(() => {
        if (gameOver) {
            const timeout = setTimeout(() => {
                setShowBlood(true)
            }, 1000)
            return () => clearTimeout(timeout)
        } else {
            setShowBlood(false)
            setBloodScale(0)
        }
    }, [gameOver])

    useFrame((state, delta) => {

        // setDistance((prevDistance) => prevDistance + 1 * delta)

        if (!gameOver && !freeze) {
            const currentDistance = useGameStore.getState().distance;
            const speedMultiplier = getActiveZone(currentDistance).speedMultiplier ?? 1;
            addDistance(0.1 * speedMultiplier)
        }

        if (showBlood && bloodScale < 1) {
            setBloodScale(prev => Math.min(1, prev + (1 * delta)))
        }

        if (cameraMode == "Player") {

            let cameraZOffset = 5
            if (size.width < 600) {
                cameraZOffset = 13
            } else if (size.width < 1200) {
                // cameraZOffset = 7.5
            }

            camera.position.copy(new Vector3(0, 2, (pos.current[2] + cameraZOffset)))
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
            .multiplyScalar((rollRef.current ? SPEED / 2 : SPEED) * (shift ? 2 : 1))
            .applyEuler(camera.rotation)

        // Limit movement to between -3 and 3 on the x-axis
        if (pos.current[0] <= -MOVE_RANGE && direction.x < 0) {
            direction.x = 0;
        } else if (pos.current[0] >= MOVE_RANGE && direction.x > 0) {
            direction.x = 0;
        }

        // NOTE - No movement if game over, but I think it is funny that you can still move and jump so leaving it like that for now
        // if (gameOver) {
        //     return
        // }

        api.velocity.set(direction.x, vel.current[1], 0)
        hitboxApi.position.set(pos.current[0], pos.current[1], pos.current[2])

        if (
            (jump || touchControls.jump)
            &&
            Math.abs(vel.current[1]) < 0.05
        ) {

            console.log("Jump understood", pos.current[1])

            if (pos.current[1] > 1) {
                // Still in air, don't allow jump
                return
            }

            const safeMode = useStore.getState().safeMode;
            if (!safeMode) {
                playSound('audio/dennish18-machine-gun-129929.mp3')
            } else {
                playSound('audio/mixkit-arrow-whoosh-1491.mp3', 1)
            }

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

            <RollManager />

            <mesh ref={hitboxRef}>
                {debug &&
                    <>
                        <cylinderGeometry args={[0.25, 0.25, cylinderHeight, 8]} />
                        <meshStandardMaterial color="red" transparent opacity={0.5} />
                    </>
                }
            </mesh>

            <mesh
                ref={ref}
                // {...props}
                // position={position}
                material={material}
            >
                {/* <boxGeometry
                    args={[1, 1]}
                /> */}

                <ModelHoodieCharacter
                    position={[0, -cylinderHeight / 2 - 0.075, 0]}
                    rotation={[0, -Math.PI, 0]}
                />

                {(showBlood && !safeMode) && (
                    <ModelBloodSplat
                        position={[-0.1, (-cylinderHeight / 2) - 0.08, 1.5]}
                        rotation={[0, -140 * Math.PI / 180, 0]}
                        scale={[bloodScale, 1, bloodScale]}
                    />
                )}

                {/* TODO - Reverse Y good for now but could be improved for performance I am guessing */}
                <group
                    position={[
                        0,
                        -pos.current[1] + .5,
                        calculateChaserDistance()
                    ]}
                >
                    {safeMode ?
                        <>
                            <ModelHand
                                position={[-0.18, -0.25, 3.5]}
                                rotation={[0, degToRad(90), 0]}
                                scale={0.1}
                            />

                            <ModelHand
                                position={[0.18, -0.25, 3.5]}
                                rotation={[0, degToRad(90), 0]}
                                scale={[0.1, 0.1, -0.1]}
                            />
                        </>
                        :
                        <>
                            <ModelFpsRigAkm
                                position={[-0.18, 0.3, 3.5]}
                                rotation={[0, Math.PI / 2, 0]}
                                scale={0.1}
                            />
                            <GunFlickerForJump />
                        </>
                    }
                </group>

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