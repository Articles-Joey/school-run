import { Canvas, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import {
    Center,
    Image,
    OrbitControls,
    Plane,
    Stats,
    Text,
    Text3D,
} from "@react-three/drei";

import Player from "./Player";
import { memo, Suspense, useLayoutEffect, useMemo } from "react";
import getRandomHexColor from "@/util/getRandomHexColor";
import Sections from "./Sections";
import Floor from "./Floor";
import { useStore } from "@/hooks/useStore";
import AnimatedPointLights from "./AnimatedPointLights";
import { useGameStore } from "@/hooks/useGameStore";
import { PHYSICS_STEP, ScrollingPhysics } from "./ScrollingPhysics";

const BackWalls = memo(function BackWalls(props) {
    // const { numberOfPlatforms, start } = props

    // const generateRandomPlatforms = useMemo(() => {

    //     const originalMaterial = [...Array(numberOfPlatforms)].map((item, i) => {
    //         return (
    //             <OneWayPlatform key={i} color="pink" position={[generateRandomInteger(-1.5, 1.5), (start + (i * 1.5)), 0]} />
    //         )
    //     })

    //     return originalMaterial

    // }, [])

    return (
        <>
            {[...Array(60)].map((item, i) => {
                return (
                    <mesh
                        key={i}
                        position={[0, 5, -(i * 20)]}
                    >
                        <planeGeometry
                            attach="geometry"
                            args={[20, 10]}
                        />
                        <meshStandardMaterial
                            transparent={true}
                            opacity={0.1}
                            color={getRandomHexColor()}
                        />
                    </mesh>
                );
            })}
        </>
    );
});

function Scene({ landingAnimationMode }) {
    const { camera } = useThree();

    useLayoutEffect(() => {
        if (landingAnimationMode) {
            camera.position.set(2, 2.5, 3.5);
            camera.lookAt(0, 1.5, 0);
        }
    }, [landingAnimationMode, camera]);

    return null;
}

function GameCanvas({ landingAnimationMode }) {
    const debug = useStore((state) => state.debug);
    const darkMode = useStore((state) => state.darkMode);
    const showStats = useStore((state) => state?.debugConfig?.showStats);
    const cameraMode = useGameStore((state) => state.cameraMode);
    const graphicsQuality = useStore((state) => state.graphicsQuality);

    // Fully fogged before the last loaded section (10 units each) so the hallway end is never visible
    const fogFar =
        graphicsQuality === "High"
            ? 70
            : graphicsQuality === "Medium"
              ? 32
              : 18;
    const fogColor = darkMode ? "#020203" : "#101216";

    return (
        <Canvas
            shadows
            camera={{ fov: 45, position: [0, 5, 20] }}
        >
            <Scene landingAnimationMode={landingAnimationMode} />

            {showStats && (
                <>
                    <Stats className="stats-overlay" />
                </>
            )}

            {/* <color
                attach="background"
                args={[0, 0, 0]}
            /> */}

            {/* Background must equal the fog color or the hallway end shows as a hard edge */}
            <color
                attach="background"
                args={[fogColor]}
            />
            <fog
                attach="fog"
                args={[fogColor, 2, fogFar]}
            />

            <ambientLight
                color="#2a3050"
                intensity={darkMode ? 0.3 : 0.55}
            />

            {/* <color attach="background" args={['#215776']} /> */}

            {/* Add your 3D scene components here */}
            {/* <ambientLight intensity={2} /> */}
            {/* <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} /> */}

            {/* Shadow caster for props; frustum is sized to cover the sections ahead of the player */}
            <directionalLight
                position={[2, 6, 4]}
                color="#a8b8ff"
                intensity={darkMode ? 0.45 : 0.75}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-8}
                shadow-camera-right={8}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
                shadow-camera-near={0.5}
                shadow-camera-far={40}
                shadow-bias={-0.0005}
                shadow-normalBias={0.02}
            />

            <AnimatedPointLights />

            {/* <BackWalls /> */}

            {/* <SuitWomanModel
                position={[0, 0, -7]}
                rotation={[0, -140 * Math.PI / 180, 0]}
            /> */}

            {/* Lanes */}
            {/* <group>
                <mesh position={[-1, 0, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial
                        color={'yellow'}
                        transparent={true}
                        opacity={0.5}
                    />
                </mesh>
                
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial
                        color={'red'}
                        transparent={true}
                        opacity={0.5}
                    />
                </mesh>
    
                <mesh position={[1, 0, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial
                        color={'yellow'}
                        transparent={true}
                        opacity={0.5}
                    />
                </mesh>
            </group> */}

            <Suspense fallback={null}>
                <Physics
                    gravity={[0, -15, 0]}
                    timeStep={PHYSICS_STEP}
                    interpolate
                    updatePriority={-1}
                    colliders={false}
                    debug={debug}
                >
                    <ScrollingPhysics>
                        <Suspense>
                            <Sections />
                            <Floor position={[0, -0.125, 0]} />
                        </Suspense>

                        {!landingAnimationMode && (
                            <Suspense>
                                <Player />
                            </Suspense>
                        )}
                    </ScrollingPhysics>
                </Physics>
            </Suspense>

            {cameraMode === "Free" && <OrbitControls target={[0, 1, 0]} />}
        </Canvas>
    );
}

export default memo(GameCanvas);
