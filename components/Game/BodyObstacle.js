import { useBox, useCylinder } from "@react-three/cannon";
import { memo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useStore } from "@/hooks/useStore";
import { DeadBody } from "../Models/DeadBody";
import { ModelWetFloorSign } from "../Models/WetFloorSign";
import { ModelBloodSplat } from "../Models/BloodSplat";

// Obstacle position changes every frame; the visuals only depend on safeMode
const BodyVisual = memo(function BodyVisual({ safeMode }) {
    return (
        <>
            <group position={[0, 0, 0.5]}>
                {!safeMode ? (
                    <DeadBody action="Death" />
                ) : (
                    <>
                        <ModelWetFloorSign position={[0, 0, -0.15]} />
                        <ModelWetFloorSign position={[0, 0, -0.85]} />
                    </>
                )}
            </group>

            <ModelBloodSplat
                position={[-0.1, 0, -0.3]}
                rotation={[0, (-140 * Math.PI) / 180, 0]}
            />
        </>
    );
});

export default function BodyObstacle({ obstacle }) {
    const safeMode = useStore((state) => state.safeMode);

    const [randomRotation] = useState(() => {
        return [0, Math.random() * Math.PI * 2, 0];
    });

    const [ref, api] = useBox(() => ({
        isTrigger: true,
        args: [0.7, 1, 1],
        position: obstacle.position,
        rotation: randomRotation, // Syncs physics body with visual rotation
        userData: {
            isObstacle: true,
            id: obstacle.id,
        },
    }));

    useFrame(() => {
        // Render at the current world position, without waiting for the worker.
        if (ref.current) {
            ref.current.position.set(...obstacle.position);
            ref.current.updateMatrix();
        }
        api.position.set(...obstacle.position);
    });

    return (
        <group>
            {/* <group>{leftSideMemo}</group>
            <group>{rightSideMemo}</group> */}

            {/* The physics ref is on this mesh; it will now use randomRotation */}
            <mesh ref={ref}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                    transparent
                    opacity={0}
                />

                {/* Models are children, they will inherit the rotation from 'ref' */}
                <BodyVisual safeMode={safeMode} />
            </mesh>
        </group>
    );
}
