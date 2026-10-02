import { CuboidCollider } from "@react-three/rapier";
import ScrollingBody from "./ScrollingPhysics";
import { ModelSawBlade } from "../Models/SawBlade";
import { degToRad } from "three/src/math/MathUtils.js";
import { useStore } from "@/hooks/useStore";
import { ModelMetalSupport } from "../Models/Metal Support";

export default function HorizontalObstacle({ obstacle }) {
    const obstacleY = 1.5;
    const safeMode = useStore((state) => state.safeMode);

    return (
        <ScrollingBody
            obstacle={obstacle}
            x={0}
            y={obstacleY}
        >
            <CuboidCollider
                args={[2.5, 0.15, 0.4]}
                sensor
            />
            <group
                position={[0, -obstacleY + 0.015, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[3.4, 0.65, 1]}
            >
                <mesh>
                    <circleGeometry args={[0.7, 32]} />
                    <meshBasicMaterial
                        color="#111"
                        transparent
                        opacity={0.16}
                        depthWrite={false}
                    />
                </mesh>
                <mesh position={[0, 0, 0.003]}>
                    <circleGeometry args={[0.48, 32]} />
                    <meshBasicMaterial
                        color="#111"
                        transparent
                        opacity={0.24}
                        depthWrite={false}
                    />
                </mesh>
            </group>

            <group>
                {safeMode ? (
                    <>
                        <group position={[0, -0.2, 0]}>
                            <ModelMetalSupport
                                position={[-2.74, 0, 0]}
                                rotation={[degToRad(0), degToRad(90), 0]}
                                scale={0.5}
                            />

                            <ModelMetalSupport
                                position={[0, 0, 0]}
                                rotation={[degToRad(0), degToRad(90), 0]}
                                scale={0.5}
                            />

                            <ModelMetalSupport
                                position={[2.74, 0, 0]}
                                rotation={[degToRad(0), degToRad(90), 0]}
                                scale={0.5}
                            />
                        </group>
                    </>
                ) : (
                    <>
                        <group
                            rotation={[degToRad(50), 0, 0]}
                            position={[0, 0.1, 0]}
                            dispose={null}
                        >
                            <ModelSawBlade
                                position={[-1.6, 0, 0]}
                                rotation={[degToRad(60), 0, 0]}
                                scale={0.5}
                            />

                            <ModelSawBlade
                                position={[0, 0, 0]}
                                rotation={[degToRad(60), 0, 0]}
                                scale={0.5}
                            />

                            <ModelSawBlade
                                position={[1.6, 0, 0]}
                                rotation={[degToRad(60), 0, 0]}
                                scale={0.5}
                            />
                        </group>
                    </>
                )}
            </group>
        </ScrollingBody>
    );
}
