import { useGameStore } from "@/hooks/useGameStore";
import { useBox, useCylinder } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react"

const MOVE_RANGE = 2.5

function Rotor({ position }) {
    return (
        <group position={position}>
            <mesh rotation={[0, Math.PI / 4, 0]}>
                <boxGeometry args={[0.28, 0.03, 0.03]} />
                <meshStandardMaterial color="#444" />
            </mesh>
            <mesh position={[0, 0.03, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.02, 8]} />
                <meshStandardMaterial color="#555" metalness={0.6} />
            </mesh>
        </group>
    );
}

export default function DroneObstacle({ obstacle }) {
    const droneY = 1.5;
    const initialX = obstacle.position[0];

    // const { freeze, gameOver } = useGameStore();

    const [ref, api] = useBox(() => ({
        isTrigger: true,
        args: [0.8, 0.3, 0.8],

        // position: [obstacle.position[0], droneY, obstacle.position[2]],
        position: [0, droneY, obstacle.position[2]],

        userData: {
            isObstacle: true,
            id: obstacle.id
        }
    }));

    useFrame((state) => {

        if (
            useGameStore.getState().freeze 
            || 
            useGameStore.getState().gameOver
        ) return;

        // if (obstacle.position[2] < -30) return;

        const t = state.clock.getElapsedTime();
        const xOffset = Math.sin(t * 2) * MOVE_RANGE;
        api.position.set(initialX + xOffset, droneY, obstacle.position[2]);

    });

    // useEffect(() => {
    //     api.position.set(obstacle.position[0], droneY, obstacle.position[2]);
    // }, [obstacle.position, api]);

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
                    <Rotor key={i} position={rPos} />
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