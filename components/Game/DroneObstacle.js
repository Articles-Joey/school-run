import { CuboidCollider } from "@react-three/rapier";
import ScrollingBody from "./ScrollingPhysics";

function Rotor({ position }) {
    return (
        <group position={position}>
            <mesh rotation={[0, Math.PI / 4, 0]}>
                <boxGeometry args={[0.28, 0.03, 0.03]} />
                <meshStandardMaterial color="#444" />
            </mesh>
            <mesh position={[0, 0.03, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.02, 8]} />
                <meshStandardMaterial
                    color="#555"
                    metalness={0.6}
                />
            </mesh>
        </group>
    );
}

export default function DroneObstacle({ obstacle }) {
    const droneY = 1.5;

    return (
        <ScrollingBody
            obstacle={obstacle}
            y={droneY}
            sway
        >
            <CuboidCollider
                args={[0.4, 0.15, 0.4]}
                sensor
            />
            {/* Keep the fake shadow just above the floor as the drone moves. */}
            <group
                position={[0, -droneY + 0.015, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[1, 0.7, 1]}
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
                {/* Central body */}
                <mesh>
                    <boxGeometry args={[0.25, 0.1, 0.25]} />
                    <meshStandardMaterial
                        color="#222"
                        metalness={0.8}
                        roughness={0.3}
                    />
                </mesh>
                {/* Arms + rotors */}
                {[
                    [-0.3, 0, -0.3],
                    [0.3, 0, -0.3],
                    [-0.3, 0, 0.3],
                    [0.3, 0, 0.3],
                ].map((rPos, i) => (
                    <Rotor
                        key={i}
                        position={rPos}
                    />
                ))}
                {/* Camera lens */}
                <mesh position={[0, -0.08, 0.1]}>
                    <sphereGeometry args={[0.035, 8, 8]} />
                    <meshStandardMaterial
                        color="#f00"
                        emissive="#f00"
                        emissiveIntensity={1}
                    />
                </mesh>
            </group>
        </ScrollingBody>
    );
}
