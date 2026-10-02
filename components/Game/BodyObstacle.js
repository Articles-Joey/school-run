import { CuboidCollider } from "@react-three/rapier";
import { memo, useState } from "react";
import ScrollingBody from "./ScrollingPhysics";
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

    return (
        <ScrollingBody
            obstacle={obstacle}
            rotation={randomRotation}
        >
            <CuboidCollider
                args={[0.35, 0.5, 0.5]}
                sensor
            />
            <BodyVisual safeMode={safeMode} />
        </ScrollingBody>
    );
}
