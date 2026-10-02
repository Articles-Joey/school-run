import { useFrame, useThree } from "@react-three/fiber";
import {
    BallCollider,
    CylinderCollider,
    RigidBody,
    useAfterPhysicsStep,
    useBeforePhysicsStep,
} from "@react-three/rapier";
import { memo, useEffect, useRef } from "react";
import { Vector3 } from "three";
import { useKeyboardRef } from "@/hooks/useKeyboard";
import { useControllerStore } from "@/hooks/useControllerStore";
import { useGameStore, getRunStep } from "@/hooks/useGameStore";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";
import { useStore } from "@/hooks/useStore";
import { useAudioStore } from "@/hooks/useAudioStore";
import useUserToken from "@articles-media/articles-dev-box/useUserToken";
import getAssetSource from "@articles-media/articles-dev-box/getAssetSource";
import { ModelFpsRigAkm } from "@/components/Models/FpsRigAkm";
import { ModelHand } from "@/components/Models/Human hand";
import { ModelHoodieCharacter } from "../Models/HoodieCharacter";
import { ModelBloodSplat } from "../Models/BloodSplat";
import { degToRad } from "three/src/math/MathUtils.js";
import RollManager from "./RollManager";
import BlobShadow from "./BlobShadow";
import { PHYSICS_STEP } from "./ScrollingPhysics";

const JUMP_SPEED = 6;
const SPEED = 4;
const MOVE_RANGE = 2.5;
const RESTING_Y = 0.825;
const WEAPON_WORLD_Y = 0.4;

function playSound(audioFile, modifier = 0.5) {
    const gameVolume = useAudioStore.getState().audioSettings.game_volume;
    const audio = new Audio(getAssetSource(audioFile));
    audio.volume = (gameVolume / 100) * modifier;
    return audio.play();
}

function GunFlickerForJump({ flashUntil }) {
    const light = useRef(null);
    useFrame(({ clock }) => {
        if (!light.current) return;
        light.current.visible = clock.elapsedTime < flashUntil.current;
        if (light.current.visible) light.current.intensity = Math.random() * 10;
    });
    return (
        <pointLight
            ref={light}
            position={[0, 0.5, 4.5]}
            intensity={5}
            distance={5}
            color="orange"
            visible={false}
        />
    );
}

function PlayerBase() {
    const teleport = useGameStore((s) => s.teleport);
    const setTeleport = useGameStore((s) => s.setTeleport);
    const setGameOver = useGameStore((s) => s.setGameOver);
    const setHighScore = useGameStore((s) => s.setHighScore);
    const safeMode = useStore((s) => s.safeMode);
    const { data: userToken } = useUserToken(process.env.NEXT_PUBLIC_GAME_PORT);

    const keys = useKeyboardRef();
    const body = useRef(null);
    const foot = useRef(null);
    const upperHitbox = useRef(null);
    const visual = useRef(null);
    const renderedPosition = useRef(new Vector3());
    const direction = useRef(new Vector3());
    const grounded = useRef(false);
    const bloodElapsed = useRef(0);
    const bloodRef = useRef(null);
    const weaponRef = useRef(null);
    const shadowRef = useRef(null);
    const flashUntil = useRef(0);
    const { camera, size, clock } = useThree();

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

    function hitObstacle(collider) {
        if (!collider.parent()?.userData?.isObstacle) return;
        // Both player colliders may overlap the same obstacle in this step.
        if (
            useGameStore.getState().gameOver ||
            useStore.getState().disableDeath
        )
            return;
        setGameOver(true);
        saveHighScore();
        playDeathSound();
    }

    useEffect(() => {
        if (!teleport || !body.current) return;
        body.current.setTranslation(
            { x: teleport[0], y: teleport[1], z: teleport[2] },
            true,
        );
        grounded.current = false;
        setTeleport(false);
    }, [teleport, setTeleport]);

    useBeforePhysicsStep(() => {
        const rigidBody = body.current;
        if (!rigidBody) return;

        const { touchControls } = useTouchControlsStore.getState();
        const { isRolling, shift } = useGameStore.getState();
        const inputAxis =
            Number(touchControls.right) - Number(touchControls.left);
        const controllerAxis =
            useControllerStore.getState().controllerState.axes?.[0] ?? 0;
        const axis =
            inputAxis || (Math.abs(controllerAxis) > 0.3 ? controllerAxis : 0);

        // All devices enter this one velocity path. Read Rapier directly so an
        // older physics sample can never overwrite the current jump velocity.
        direction.current
            .set(axis, 0, 0)
            .multiplyScalar((isRolling ? SPEED / 2 : SPEED) * (shift ? 2 : 1))
            .applyEuler(camera.rotation);

        const position = rigidBody.translation();
        const velocity = rigidBody.linvel();
        // Stop exactly at the lane edge. A debug teleport outside the lanes can
        // still move inward, without being snapped back while input is idle.
        let nextX = direction.current.x;
        if (nextX < 0)
            nextX = Math.max(
                nextX,
                Math.min(0, (-MOVE_RANGE - position.x) / PHYSICS_STEP),
            );
        else if (nextX > 0)
            nextX = Math.min(
                nextX,
                Math.max(0, (MOVE_RANGE - position.x) / PHYSICS_STEP),
            );
        let nextY = velocity.y;

        if (
            (keys.current.jump || touchControls.jump) &&
            grounded.current &&
            Math.abs(velocity.y) < 0.05
        ) {
            nextY = JUMP_SPEED;
            grounded.current = false;
            flashUntil.current = clock.elapsedTime + 0.4;
            const safe = useStore.getState().safeMode;
            playSound(
                safe
                    ? "audio/mixkit-arrow-whoosh-1491.mp3"
                    : "audio/dennish18-machine-gun-129929.mp3",
                safe ? 1 : 0.5,
            )?.catch(() => {});
            if (touchControls.jump)
                useTouchControlsStore
                    .getState()
                    .setTouchControls({ jump: false });
        }

        // Held input does not repeatedly publish state or wake the body.
        if (Math.abs(velocity.x - nextX) > 0.00001 || nextY !== velocity.y)
            rigidBody.setLinvel({ x: nextX, y: nextY, z: 0 }, true);
    });

    useAfterPhysicsStep((world) => {
        const { gameOver, freeze, distance, addDistance, isRolling } =
            useGameStore.getState();
        // Same fixed step and pre-step distance as ScrollingPhysics.
        if (!gameOver && !freeze)
            addDistance(getRunStep(distance, PHYSICS_STEP));

        grounded.current = false;
        if (foot.current) {
            world.contactPairsWith(foot.current, (other) => {
                if (!other.parent()?.userData?.isGround) return;
                world.contactPair(foot.current, other, (manifold) => {
                    if (
                        manifold.numSolverContacts() > 0 &&
                        body.current.translation().y > 0
                    )
                        grounded.current = true;
                });
            });
            world.intersectionPairsWith(foot.current, hitObstacle);
        }
        // Check current overlaps each step, including when a roll ends inside an
        // obstacle. Enter-only events would miss that case and transient overlaps
        // during frames containing several physics steps.
        if (!isRolling && upperHitbox.current)
            world.intersectionPairsWith(upperHitbox.current, hitObstacle);
    });

    // Rapier updates/interpolates at -1. Attachments read that exact displayed
    // position afterwards, with no additional smoothing or delayed hitbox body.
    useFrame((_, delta) => {
        if (!visual.current) return;
        const position = visual.current.getWorldPosition(
            renderedPosition.current,
        );
        const { gameOver, cameraMode } = useGameStore.getState();
        const chaserDistance =
            size.width < 600 ? 7.25 : size.width < 1200 ? -0.25 : -0.5;
        weaponRef.current?.position.set(
            position.x,
            WEAPON_WORLD_Y,
            position.z + chaserDistance,
        );

        if (shadowRef.current) {
            const airHeight = Math.max(0, position.y - RESTING_Y);
            const fade = Math.max(0.3, 1 - airHeight / 3);
            shadowRef.current.position.set(position.x, 0.015, position.z);
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
        if (cameraMode === "Player") {
            camera.position.set(0, 2, position.z + (size.width < 600 ? 13 : 5));
            camera.lookAt(0, 1, position.z);
        }
    }, -0.5);

    return (
        <group>
            <RollManager />
            <BlobShadow
                shadowRef={shadowRef}
                size={1.1}
            />
            <RigidBody
                ref={body}
                position={[0, 2, 0]}
                colliders={false}
                enabledRotations={[false, false, false]}
                enabledTranslations={[true, true, false]}
                linearDamping={0}
                angularDamping={0}
                canSleep={false}
                ccd
            >
                <BallCollider
                    ref={foot}
                    args={[0.2]}
                    position={[0, -0.625, 0]}
                    mass={1}
                    friction={0}
                    restitution={0}
                />
                <CylinderCollider
                    ref={upperHitbox}
                    args={[0.75, 0.25]}
                    sensor
                    mass={0}
                />
                <group
                    ref={visual}
                    name="player-visual"
                >
                    <ModelHoodieCharacter
                        position={[0, -RESTING_Y, 0]}
                        rotation={[0, -Math.PI, 0]}
                    />
                    {!safeMode && (
                        <group
                            ref={bloodRef}
                            scale={[0, 1, 0]}
                            position={[-0.1, -0.83, 1.5]}
                            rotation={[0, (-140 * Math.PI) / 180, 0]}
                            visible={false}
                        >
                            <ModelBloodSplat />
                        </group>
                    )}
                </group>
            </RigidBody>
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
                        <GunFlickerForJump flashUntil={flashUntil} />
                    </>
                )}
            </group>
        </group>
    );
}

export default memo(PlayerBase);
