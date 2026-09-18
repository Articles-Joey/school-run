import React, { useMemo, useRef, useState } from "react";

// import { BookcaseClosedDoorsModel } from "@/components/Models/BookcaseClosedDoors";

// import { ChairModel } from "../Models/Chair";
import { ModelChair } from "../Models/Chair";
import { ModelDesk } from "../Models/Desk";
import { ModelComputerScreen } from "../Models/ComputerScreen";
import { ModelComputerKeyboard } from "../Models/ComputerKeyboard";
import { ModelTelevisionVintage } from "../Models/TelevisionVintage";
import { InstancedBookcases } from "../Models/InstancedBookcases";

import { ModelDuck } from "../Models/Duck";
import { ModelDog } from "../Models/Dog";
import { ModelWitch } from "../Models/Witch";
import { ModelBear } from "../Models/Bear";
import { ModelPear } from "../Models/Pear";

export default function WallScene({ side }) {
    const isLeft = side === "left";

    const Bookcases = useMemo(() => {
        return (
            <InstancedBookcases>
                {(instances) =>
                    [...Array(10)].map((item, i) => (
                        <group
                            key={i}
                            position={[
                                isLeft ? -4 : 4,
                                0,
                                -(i * 0.75) + (isLeft ? 6 : 5),
                            ]}
                            scale={2}
                        >
                            <instances.Bookcase
                                rotation={[
                                    0,
                                    isLeft ? Math.PI / 2 : -Math.PI / 2,
                                    0,
                                ]}
                            />
                            <instances.Door
                                rotation={[
                                    0,
                                    isLeft ? Math.PI / 2 : -Math.PI / 2,
                                    0,
                                ]}
                                position={[
                                    isLeft ? -0.02 : 0.02,
                                    0.115,
                                    isLeft ? 0.04 : -0.04,
                                ]}
                            />
                        </group>
                    ))
                }
            </InstancedBookcases>
        );
    }, [isLeft]);

    const DeskScene = useMemo(() => {
        return [...Array(1)].map((item, i) => {
            return (
                <group
                    key={i}
                    position={[isLeft ? -4.3 : 3, 0, 0]}
                >
                    <ModelChair
                        scale={2}
                        position={[1, 0, 0.5]}
                        rotation={[0, -Math.PI, 0]}
                    />

                    <ModelDesk scale={2} />

                    <group
                        scale={0.1}
                        position={[0.1, 0.77, -0.4]}
                    >
                        <ModelWitch rotation={[0, (20 * Math.PI) / 180, 0]} />
                        <ModelDuck
                            position={[1.5, 0, 0]}
                            rotation={[0, (20 * Math.PI) / 180, 0]}
                        />
                        <ModelDog
                            position={[3, 0, 0]}
                            rotation={[0, (20 * Math.PI) / 180, 0]}
                        />
                        <ModelBear
                            position={[4.5, 0, 0]}
                            rotation={[0, (20 * Math.PI) / 180, 0]}
                        />
                        <ModelPear
                            position={[6, 0, 0]}
                            rotation={[0, (20 * Math.PI) / 180, 0]}
                            scale={6}
                        />

                        <ModelTelevisionVintage
                            position={isLeft ? [-1, 14, 0] : [6, 14, 0]}
                            rotation={
                                isLeft
                                    ? [0, (30 * Math.PI) / 180, 0]
                                    : [0, (-30 * Math.PI) / 180, 0]
                            }
                            scale={18}
                        />
                    </group>
                </group>
            );
        });
    }, [isLeft]);

    const DeskWithComputerScene = useMemo(() => {
        return [...Array(1)].map((item, i) => {
            return (
                <group
                    key={i}
                    position={[isLeft ? -4.3 : 3, 0, 0]}
                >
                    <ModelChair
                        scale={2}
                        position={[1, 0, 0.5]}
                        rotation={[0, -Math.PI, 0]}
                    />

                    <ModelDesk scale={2} />

                    <ModelComputerScreen
                        position={[0, 0.77, -0.4]}
                        rotation={[0, (20 * Math.PI) / 180, 0]}
                    />

                    <ModelComputerScreen
                        position={[0.4, 0.77, -0.55]}
                        rotation={[0, (0 * Math.PI) / 180, 0]}
                    />

                    <ModelComputerKeyboard
                        position={[0.2, 0.77, -0.2]}
                        rotation={[0, (20 * Math.PI) / 180, 0]}
                    />
                </group>
            );
        });
    }, [isLeft]);

    const sceneIndex = useMemo(() => Math.floor(Math.random() * 3), []);

    const randomPickedScene = useMemo(() => {
        const scenes = [DeskScene, DeskWithComputerScene, Bookcases];
        return scenes[sceneIndex];
    }, [sceneIndex, DeskScene, DeskWithComputerScene, Bookcases]);

    return randomPickedScene;
}
