import { useBox, useCylinder } from "@react-three/cannon";
import { useEffect } from "react"
import { useStore } from "@/hooks/useStore";
import { DeadBody } from "../Models/DeadBody";
import { ModelWetFloorSign } from "../Models/WetFloorSign";
import { ModelBloodSplat } from "../Models/BloodSplat";

export default function BodyObstacle({ obstacle }) {

    const safeMode = useStore((state) => state.safeMode);

    const randomRotation = useMemo(() => {
        return [0, Math.random() * Math.PI * 2, 0];
    }, []);

    const [ref, api] = useBox(() => ({
        isTrigger: true,
        args: [0.7, 1, 1],
        position: obstacle.position,
        rotation: randomRotation, // Syncs physics body with visual rotation
        userData: {
            isObstacle: true,
            id: obstacle.id
        }
    }));

    // Update position if the obstacle prop changes
    useEffect(() => {
        api.position.set(...obstacle.position);
    }, [obstacle.position, api]);

    return (
        <group>

            {/* <group>{leftSideMemo}</group>
            <group>{rightSideMemo}</group> */}

            {/* The physics ref is on this mesh; it will now use randomRotation */}
            <mesh ref={ref}>

                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial transparent opacity={0} />

                {/* Models are children, they will inherit the rotation from 'ref' */}
                <group position={[0, 0, 0.5]}>
                    {!safeMode ? (
                        <DeadBody action="Death" />
                    ) : (
                        <>
                            <ModelWetFloorSign
                                position={[0, 0, -0.15]}
                            />
                            <ModelWetFloorSign
                                position={[0, 0, -0.85]}
                            />
                        </>
                    )}
                </group>

                {/* {!safeMode && ( */}
                <ModelBloodSplat
                    position={[-0.1, 0, -0.3]}
                    rotation={[0, -140 * Math.PI / 180, 0]}
                />
                {/* )} */}

            </mesh>

        </group>
    );
}