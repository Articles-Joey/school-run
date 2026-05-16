import { useGameStore } from "@/hooks/useGameStore";
import { useBox, useCylinder } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react"
import { ModelSawBlade } from "../Models/SawBlade";
import { degToRad } from "three/src/math/MathUtils.js";
import { useStore } from "@/hooks/useStore";
import { ModelMetalSupport } from "../Models/Metal Support";

const MOVE_RANGE = 2.5

export default function HorizontalObstacle({ obstacle }) {
    const obstacleY = 1.5;
    const initialX = obstacle.position[0];

    // const { freeze, gameOver } = useGameStore();

    const safeMode = useStore((state) => state.safeMode);

    const [ref, api] = useBox(() => ({
        type: 'Dynamic',
        isTrigger: true,
        args: [5, 0.3, 0.8],

        // position: [obstacle.position[0], droneY, obstacle.position[2]],
        position: [0, obstacleY, obstacle.position[2]],

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

        // const t = state.clock.getElapsedTime();
        // const xOffset = Math.sin(t * 2) * MOVE_RANGE;
        api.position.set(0, obstacleY, obstacle.position[2]);

    });

    // useEffect(() => {
    //     api.position.set(obstacle.position[0], obstacleY, obstacle.position[2]);
    // }, [obstacle.position, api]);

    return (
        <mesh ref={ref}>

            <boxGeometry args={[0.8, 0.3, 0.8]} />
            <meshStandardMaterial transparent opacity={0} />

            <group>

                {safeMode ?
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
                    :
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
                }

            </group>

        </mesh>
    );
}