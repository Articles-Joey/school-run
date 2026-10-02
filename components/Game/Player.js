import { useFrame, useThree } from "@react-three/fiber";
import { useCompoundBody, useCylinder } from "@react-three/cannon";
import { memo, useEffect, useMemo, useRef } from "react";
import { Vector3 } from "three";
import * as THREE from "three";
import { useKeyboardRef } from "@/hooks/useKeyboard";

import { useControllerStore } from "@/hooks/useControllerStore";
import { useGameStore, getRunStep } from "@/hooks/useGameStore";

import { ModelFpsRigAkm } from "@/components/Models/FpsRigAkm";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";
import { ModelHand } from "@/components/Models/Human hand";
import { degToRad } from "three/src/math/MathUtils.js";
import { useStore } from "@/hooks/useStore";
import { useAudioStore } from "@/hooks/useAudioStore";

import useUserToken from "@articles-media/articles-dev-box/useUserToken";
import useUserDetails from "@articles-media/articles-dev-box/useUserDetails";
import { ModelHoodieCharacter } from "../Models/HoodieCharacter";
import { ModelBloodSplat } from "../Models/BloodSplat";
import RollManager from "./RollManager";
import BlobShadow from "./BlobShadow";
import smoothPlayerPosition from "@/util/smoothPlayerPosition";
import {
    installMovementDiagnostics,
    recordMovementCommand,
    recordMovementFrame,
    recordPhysicsSample,
    recordPlayerCommit,
} from "@/util/movementDiagnostics";

// import getAssetSource from "@/util/getAssetSource";
import getAssetSource from "@articles-media/articles-dev-box/getAssetSource";

const JUMP_FORCE = 6;
const SPEED = 4;
const MOVE_RANGE = 2.5;
const WEAPON_WORLD_Y = 0.4;

function playSound(audioFile, modifier = 0.5) {
    // REMOVED: if (safeMode) return
    // Reason: Safe mode should change the sound type (handled in playDeathSound),
    // not mute the game entirely. If you want a global mute, use a separate 'isMuted' state.

    const game_volume = useAudioStore.getState().audioSettings.game_volume;
    const audio = new Audio(getAssetSource(audioFile));
    audio.volume = (game_volume / 100) * modifier;

    // Return the promise so calling functions can use .catch()
    return audio.play();
}

function GunFlickerForJump() {
    const keys = useKeyboardRef();
    const wasJumping = useRef(false);
    const flickerUntil = useRef(0);
    const lightRef = useRef();

    useFrame(({ clock }) => {
        const jumping = Boolean(
            keys.current.jump ||
            useTouchControlsStore.getState().touchControls.jump,
        );
        if (jumping && !wasJumping.current) {
            flickerUntil.current = clock.elapsedTime + 0.4;
        }
        wasJumping.current = jumping;
        if (lightRef.current) {
            lightRef.current.visible = clock.elapsedTime < flickerUntil.current;
            if (lightRef.current.visible) {
                lightRef.current.intensity = Math.random() * 10;
            }
        }
    });

    return (
        <pointLight
            ref={lightRef}
            position={[0, 0.5, 4.5]}
            intensity={5}
            distance={5}
            color="orange"
            visible={false}
        />
    );
}

function PlayerBase(props) {
    useEffect(() => installMovementDiagnostics(), []);
    useEffect(() => {
        if (process.env.NODE_ENV === "development") recordPlayerCommit();
    });
    const debug = useStore((state) => state.debug);

    // Selectors only; subscribing to the whole store re-renders on every distance tick
    const teleport = useGameStore((s) => s.teleport);
    const setTeleport = useGameStore((s) => s.setTeleport);
    const gameOver = useGameStore((s) => s.gameOver);
    const setGameOver = useGameStore((s) => s.setGameOver);
    const setHighScore = useGameStore((s) => s.setHighScore);
    const isRolling = useGameStore((state) => state.isRolling);

    const {
        data: userToken,
        error: userTokenError,
        isLoading: userTokenLoading,
        mutate: userTokenMutate,
    } = useUserToken(process.env.NEXT_PUBLIC_GAME_PORT);

    const {
        data: userDetails,
        error: userDetailsError,
        isLoading: userDetailsLoading,
        mutate: userDetailsMutate,
    } = useUserDetails({
        token: userToken,
    });

    const setTouchControls = useTouchControlsStore((s) => s.setTouchControls);

    const bloodElapsed = useRef(0);
    const bloodRef = useRef();

    // const saferMode = useGameStore((state) => state.saferMode);
    const safeMode = useStore((state) => state.safeMode);

    function saveHighScore() {
        let currentDistance = useGameStore.getState().distance;

        currentDistance = currentDistance.toFixed(2);

        const bestDistance = useGameStore.getState().highScore;
        // const setHighScore = useGameStore.getState().setHighScore

        console.log("Save high score called with distance of", currentDistance);

        if (currentDistance > bestDistance) {
            console.log(
                "New all time high score was achieved",
                currentDistance,
                bestDistance,
            );
            setHighScore(+currentDistance);

            // If signed in player then save to DB
            if (userToken) {
                const baseLink =
                    process.env.NODE_ENV === "development"
                        ? "http://localhost:3001"
                        : "https://articles.media";

                fetch(`${baseLink}/api/user/community/games/scoreboard/set`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-articles-api-key": userToken,
                    },
                    body: JSON.stringify({
                        game: "School Run",
                        value: +(+currentDistance || 0).toFixed(0),
                    }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        console.log(data);
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });
            }
        }
    }

    function playDeathSound() {
        const safeMode = useStore.getState().safeMode;
        console.log("Playing death sound, safe mode is", safeMode);

        let soundPath = safeMode
            ? "audio/floraphonic-cartoon-slide-whistle-down-2-176648.mp3"
            : "audio/universfield-man-scream-010-277572.mp3";

        if (!safeMode) {
            playSound("audio/dennish18-machine-gun-129929.mp3");
        }

        // Catch the autoplay restriction error smoothly
        playSound(soundPath)?.catch((error) => {
            console.warn(
                "Audio autoplay blocked. Waiting for user interaction.",
                error,
            );
        });
    }

    const keys = useKeyboardRef();
    const directionRef = useRef(new Vector3());
    const visualRef = useRef();
    const visualPosition = useRef(new Vector3(0, 2, 0));
    const jumpPending = useRef(false);

    const { camera, size } = useThree();

    const lastObstacleRef = useRef(false);

    const cylinderHeight = 1.5;
    const CROUCH_HEIGHT = 0.75;

    const calculateChaserDistance = () => {
        if (size.width < 600) {
            return 7.25;
        } else if (size.width < 1200) {
            return -0.25;
        } else {
            return -0.5;
        }
    };

    // Actual Player Sphere
    const [ref, api] = useCompoundBody(() => ({
        mass: 1,
        position: [0, 2, 0],
        angularFactor: [0, 0, 0],
        linearDamping: 0,
        linearFactor: [1, 1, 0],
        material: {
            // Lateral speed is controlled by input; floor friction would brake it.
            friction: 0,
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
                type: "Sphere",
                args: [0.2],
                position: [0, -cylinderHeight / 2 + 0.125, 0], // Offset to the bottom (-height/2)
            },
        ],
        onCollide: (e) => {
            if (
                e.body.userData.isObstacle &&
                !useGameStore.getState().gameOver &&
                e.body.userData.id !== lastObstacleRef.current
            ) {
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

    useEffect(() => {
        if (teleport) {
            api.position.set(teleport[0], teleport[1], teleport[2]);
            jumpPending.current = false;
            setTeleport(false);
        }
    }, [teleport, api.position, setTeleport]);

    // External hitbox for when not rolling
    const rollRef = useRef(isRolling);
    useEffect(() => {
        if (isRolling) {
            rollRef.current = true;
        } else {
            rollRef.current = false;
        }
    }, [isRolling]);
    const [hitboxRef, hitboxApi] = useCylinder(() => ({
        args: [0.25, 0.25, cylinderHeight, 8],
        position: [0, 2, 0],
        type: "Kinematic",
        // type: 'Static',
        isTrigger: true,
        onCollide: (e) => {
            // collide fires every physics step while overlapping; gameOver guard stops repeated sound/fetch
            if (
                !rollRef.current &&
                e.body.userData.isObstacle &&
                !useGameStore.getState().gameOver &&
                e.body.userData.id !== lastObstacleRef.current
            ) {
                console.log(
                    "Player hit an obstacle (upper hitbox)",
                    e?.body.userData,
                    isRolling,
                );
                lastObstacleRef.current = e?.body.userData.id;

                if (!useStore.getState().disableDeath) {
                    setGameOver(true);
                    saveHighScore();
                    playDeathSound();
                }
            }
        },
    }));

    const material = useMemo(
        () =>
            new THREE.MeshPhysicalMaterial({
                color: "green",
                opacity: debug ? 0.5 : 0,
                transparent: true,
            }),
        [debug],
    );

    const vel = useRef([0, 0, 0]);
    const lastMovementX = useRef(0);
    useEffect(() => {
        return api.velocity.subscribe((v) => {
            vel.current = v;
            // Acknowledge the jump before allowing another one. Old grounded
            // samples can arrive while the jump command is still in flight.
            if (v[1] > 0.05) jumpPending.current = false;
        });
    }, [api.velocity]);

    const pos = useRef([0, 2, 0]);
    const lastHitboxPosition = useRef([0, 2, 0]);
    useEffect(() => {
        return api.position.subscribe((p) => {
            pos.current = p;
            if (process.env.NODE_ENV === "development") recordPhysicsSample();
        });
    }, [api.position]);

    const shadowRef = useRef();
    const weaponRef = useRef();

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

    useFrame((state, delta) => {
        const { jump } = keys.current;
        const { touchControls, movementInputs } =
            useTouchControlsStore.getState();
        const {
            shift,
            cameraMode,
            gameOver: ended,
            freeze,
            distance,
            addDistance,
        } = useGameStore.getState();

        // Sections runs first at priority -1, using this same distance and delta.
        // Keep scoring here so it starts only once the player has loaded.
        if (!ended && !freeze) addDistance(getRunStep(distance, delta));

        const renderedPosition = smoothPlayerPosition(
            visualPosition.current,
            pos.current,
            delta,
        );
        if (visualRef.current)
            visualRef.current.position.copy(renderedPosition);

        // Weapon follows the player on X/Z only; Y is fixed in world space
        if (weaponRef.current) {
            weaponRef.current.position.set(
                renderedPosition.x,
                WEAPON_WORLD_Y,
                renderedPosition.z + calculateChaserDistance(),
            );
        }

        if (shadowRef.current) {
            // Body Y when standing: capsule bottom sphere (r=0.2) resting on the floor at y=0
            const restingY = cylinderHeight / 2 - 0.125 + 0.2;
            const airHeight = Math.max(0, renderedPosition.y - restingY);
            const fade = Math.max(0.3, 1 - airHeight / 3);

            shadowRef.current.position.set(
                renderedPosition.x,
                0.015,
                renderedPosition.z,
            );
            shadowRef.current.scale.setScalar(fade);
            shadowRef.current.material.opacity = 0.6 * fade;
        }

        if (bloodRef.current) {
            bloodElapsed.current = gameOver ? bloodElapsed.current + delta : 0;
            const bloodScale = Math.min(
                1,
                Math.max(0, bloodElapsed.current - 1),
            );
            bloodRef.current.visible =
                Boolean(gameOver) && bloodElapsed.current >= 1;
            bloodRef.current.scale.set(bloodScale, 1, bloodScale);
        }

        if (cameraMode == "Player") {
            let cameraZOffset = 5;
            if (size.width < 600) {
                cameraZOffset = 13;
            } else if (size.width < 1200) {
                // cameraZOffset = 7.5
            }

            camera.position.set(0, 2, renderedPosition.z + cameraZOffset);
            camera.lookAt(0, 1, renderedPosition.z);
        }

        // Not writing player position/maxHeight to the store per frame: nothing reads them and each write re-rendered every store subscriber.
        // Keyboard A/D and the joystick both write these same shared flags.
        const inputAxis =
            (touchControls.right ? 1 : 0) - (touchControls.left ? 1 : 0);
        // Read controller input without subscribing React to gamepad polling.
        const controllerAxis =
            useControllerStore.getState().controllerState.axes?.[0] ?? 0;
        const movementAxis =
            inputAxis || (Math.abs(controllerAxis) > 0.3 ? controllerAxis : 0);
        const direction = directionRef.current;
        direction
            .set(movementAxis, 0, 0)
            .multiplyScalar(
                (rollRef.current ? SPEED / 2 : SPEED) * (shift ? 2 : 1),
            )
            .applyEuler(camera.rotation);

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

        // Mass is 1: an X-only impulse changes lateral velocity without
        // overwriting gravity/jump velocity with an older worker sample.
        const velocityChange = direction.x - lastMovementX.current;
        if (velocityChange !== 0) {
            api.applyImpulse([velocityChange, 0, 0], [0, 0, 0]);
            if (process.env.NODE_ENV === "development") recordMovementCommand();
        }
        lastMovementX.current = direction.x;
        if (process.env.NODE_ENV === "development") {
            recordMovementFrame(
                delta,
                movementInputs.keyboard,
                movementInputs.touch,
                controllerAxis,
                pos.current[0],
                renderedPosition.x,
            );
        }
        const hitboxPosition = lastHitboxPosition.current;
        if (
            pos.current[0] !== hitboxPosition[0] ||
            pos.current[1] !== hitboxPosition[1] ||
            pos.current[2] !== hitboxPosition[2]
        ) {
            hitboxApi.position.set(
                pos.current[0],
                pos.current[1],
                pos.current[2],
            );
            hitboxPosition[0] = pos.current[0];
            hitboxPosition[1] = pos.current[1];
            hitboxPosition[2] = pos.current[2];
        }

        if (
            (jump || touchControls.jump) &&
            !jumpPending.current &&
            Math.abs(vel.current[1]) < 0.05
        ) {
            console.log("Jump understood", pos.current[1]);

            if (pos.current[1] > 1) {
                // Still in air, don't allow jump
                return;
            }

            const safeMode = useStore.getState().safeMode;
            if (!safeMode) {
                playSound("audio/dennish18-machine-gun-129929.mp3");
            } else {
                playSound("audio/mixkit-arrow-whoosh-1491.mp3", 1);
            }

            api.applyImpulse([0, JUMP_FORCE - vel.current[1], 0], [0, 0, 0]);
            jumpPending.current = true;

            if (touchControls.jump) setTouchControls({ jump: false });
        }
    }, -0.5);

    return (
        <group>
            <RollManager />

            <BlobShadow
                shadowRef={shadowRef}
                size={1.1}
            />

            <mesh ref={hitboxRef}>
                {debug && (
                    <>
                        <cylinderGeometry
                            args={[0.25, 0.25, cylinderHeight, 8]}
                        />
                        <meshStandardMaterial
                            color="red"
                            transparent
                            opacity={0.5}
                        />
                    </>
                )}
            </mesh>

            <mesh
                ref={ref}
                // {...props}
                // position={position}
                material={material}
            />

            {/* The worker owns the collider matrix; visuals follow it independently. */}
            <group
                ref={visualRef}
                name="player-visual"
                position={[0, 2, 0]}
            >
                {/* <boxGeometry
                    args={[1, 1]}
                /> */}

                <ModelHoodieCharacter
                    position={[0, -cylinderHeight / 2 - 0.075, 0]}
                    rotation={[0, -Math.PI, 0]}
                />

                {!safeMode && (
                    <group
                        ref={bloodRef}
                        scale={[0, 1, 0]}
                        position={[-0.1, -cylinderHeight / 2 - 0.08, 1.5]}
                        rotation={[0, (-140 * Math.PI) / 180, 0]}
                        visible={false}
                    >
                        <ModelBloodSplat />
                    </group>
                )}

                {/* <Text
                    color="black" position={[0, -0.7, 0]} scale={0.3} anchorX="center" anchorY="middle"
                >
                    Player ({character.model})
                </Text> */}
            </group>

            {/* Not a child of the physics body: position is driven in useFrame so jumps never move it */}
            <group ref={weaponRef}>
                {safeMode ? (
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
                ) : (
                    <>
                        <ModelFpsRigAkm
                            position={[-0.18, 0.3, 3.5]}
                            rotation={[0, Math.PI / 2, 0]}
                            scale={0.1}
                        />
                        <GunFlickerForJump />
                    </>
                )}
            </group>
        </group>
    );
}

export default memo(PlayerBase);
