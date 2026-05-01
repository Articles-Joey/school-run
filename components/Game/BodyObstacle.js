import { useBox, useCylinder } from "@react-three/cannon";
import { useEffect } from "react"
import { BloodSplatModel } from "../Models/BloodSplat";
import { useStore } from "@/hooks/useStore";
import { DeadBody } from "../Models/DeadBody";
import { WetFloorSign } from "../Models/WetFloorSign";

export default function BodyObstacle({ obstacle }) {

    const safeMode = useStore((state) => state.safeMode);

    const randomRotation = useMemo(() => {
        return [0, Math.random() * Math.PI * 2, 0];
    }, []);

    const leftSideMemo = useMemo(() => {

        return [...Array(60)].map((item, i) => {
            return (
                <group
                    key={i}
                    position={[2, 0, -(i * 20)]}
                >

                    <ChairModel
                        scale={2}
                        position={[1, 0, 0.5]}
                        rotation={[0, -Math.PI, 0]}
                    />

                    <DeskModel
                        scale={2}
                    />

                    <group
                        scale={0.1}
                        position={[0.1, 0.77, -0.4]}
                    >
                        <Witch
                            rotation={[0, 20 * Math.PI / 180, 0]}
                        />
                        <Duck
                            position={[1.5, 0, 0]}
                            rotation={[0, 20 * Math.PI / 180, 0]}
                        />
                        <Dog
                            position={[3, 0, 0]}
                            rotation={[0, 20 * Math.PI / 180, 0]}
                        />
                        <Bear
                            position={[4.5, 0, 0]}
                            rotation={[0, 20 * Math.PI / 180, 0]}
                        />
                        <PearModel
                            position={[6, 0, 0]}
                            rotation={[0, 20 * Math.PI / 180, 0]}
                            scale={6}
                        />
                        <TelevisionVintageModel
                            position={[15, 14, 0]}
                            rotation={[0, -30 * Math.PI / 180, 0]}
                            scale={18}
                        />
                    </group>

                </group>
            )
        })

    }, [])

    const rightSideMemo = useMemo(() => {

        return [...Array(60)].map((item, i) => {
            return (
                <group
                    key={i}
                    position={[-3.5, 0, -(i * 20)]}
                >

                    <ChairModel
                        scale={2}
                        position={[1, 0, 0.5]}
                        rotation={[0, -Math.PI, 0]}
                    />

                    <DeskModel
                        scale={2}
                    />

                    <ComputerScreenModel
                        position={[0, 0.77, -0.4]}
                        rotation={[0, 20 * Math.PI / 180, 0]}
                    />

                    <ComputerScreenModel
                        position={[0.4, 0.77, -0.55]}
                        rotation={[0, 0 * Math.PI / 180, 0]}
                    />

                    <ComputerKeyboardModel
                        position={[0.2, 0.77, -0.2]}
                        rotation={[0, 20 * Math.PI / 180, 0]}
                    />

                </group>
            )
        })

    }, [])

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
                            <WetFloorSign
                                position={[0, 0, -0.15]}
                            />
                            <WetFloorSign
                                position={[0, 0, -0.85]}
                            />
                        </>
                    )}
                </group>

                {/* {!safeMode && ( */}
                <BloodSplatModel
                    position={[-0.1, 0, -0.3]}
                    rotation={[0, -140 * Math.PI / 180, 0]}
                />
                {/* )} */}

            </mesh>

        </group>
    );
}