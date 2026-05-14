import React, { useMemo, useRef, useState } from "react"

import { BookcaseClosedDoorsModel } from "@/components/Models/BookcaseClosedDoors";

import { ChairModel } from "../Models/Chair";
import { DeskModel } from "../Models/Desk";
import { ComputerScreenModel } from "../Models/ComputerScreen";
import { ComputerKeyboardModel } from "../Models/ComputerKeyboard";
import Witch from "../PlayerModels/Witch";
import Duck from "../PlayerModels/Duck";
import Dog from "../PlayerModels/Dog";
import Bear from "../PlayerModels/Bear";
import { PearModel } from "../Models/Pear";
import { TelevisionVintageModel } from "../Models/TelevisionVintage";
import { InstancedBookcases } from "../Models/InstancedBookcases";

export default function WallScene({ side }) {

    const isLeft = side === "left";

    const Bookcases = useMemo(() => {

        return (
            <InstancedBookcases>
                {(instances) => (
                    [...Array(10)].map((item, i) => (
                        <group
                            key={i}
                            position={[
                                isLeft ? -4 : 4, 
                                0, 
                                -(i * 0.75) + (isLeft ? 6 : 5)
                            ]}
                            scale={2}
                        >
                            <instances.Bookcase 
                                rotation={[0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]}
                            />
                            <instances.Door 
                                rotation={[0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]}
                                position={[
                                    isLeft ? -0.02 : 0.02, 
                                    0.115, 
                                    isLeft ? 0.04 : -0.04
                                ]}
                            />
                        </group>
                    ))
                )}
            </InstancedBookcases>
        )

    }, [isLeft])

    const DeskScene = useMemo(() => {

        return [...Array(1)].map((item, i) => {
            return (
                <group
                    key={i}
                    position={[
                        isLeft ? -4.3 : 3, 
                        0, 
                        0
                    ]}
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
                            position={
                                isLeft ? 
                                [-1, 14, 0] 
                                :
                                [6, 14, 0]
                            }
                            rotation={
                                isLeft ?
                                [0, 30 * Math.PI / 180, 0]
                                :
                                [0, -30 * Math.PI / 180, 0]
                            }
                            scale={18}
                        />

                    </group>

                </group>
            )
        })

    }, [isLeft])

    const DeskWithComputerScene = useMemo(() => {

        return [...Array(1)].map((item, i) => {
            return (
                <group
                    key={i}
                    position={[
                        isLeft ? -4.3 : 3, 
                        0, 
                        0
                    ]}
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

    }, [isLeft])

    const sceneIndex = useMemo(() => Math.floor(Math.random() * 3), []);

    const randomPickedScene = useMemo(() => {
        const scenes = [
            DeskScene, 
            DeskWithComputerScene, 
            Bookcases
        ];
        return scenes[sceneIndex];
    }, [sceneIndex, DeskScene, DeskWithComputerScene, Bookcases])

    return randomPickedScene

}