import React, { useMemo, useRef, useState } from "react";

import { ModelDoorway } from "@/components/Models/doorway";
import { degToRad } from "three/src/math/MathUtils.js";

import Windows from "./Windows";
import WallScene from "./WallScene";
import StoneBrickWall from "./StoneBrickWall";
import WhiteTileFloor from "./WhiteTileFloor";
import Ceiling from "./Ceiling";

export default function Walls({ position }) {
    const ref = useRef();

    return (
        <group
            ref={ref}
            position={[0, 0, position[2]]}
        >
            <StoneBrickWall
                rotation={[0, -Math.PI / 2, 0]}
                position={[4.5, 1.5, 0]}
                args={[10, 3]}
            />

            <StoneBrickWall
                rotation={[0, -Math.PI / 2, 0]}
                scale={[1, 1, -1]}
                position={[-4.5, 1.5, 0]}
                args={[10, 3]}
            />

            <WhiteTileFloor
                args={[10, 10]}
                position={[0, 0, 0]}
                rotation={[(-90 * Math.PI) / 180, 0, 0]}
            />

            <ModelDoorway
                position={[-4.5, 0, -3.5]}
                scale={2.5}
                rotation={[0, degToRad(-90), 0]}
            />

            <ModelDoorway
                position={[4.5, 0, -2.5]}
                scale={2.5}
                rotation={[0, degToRad(90), 0]}
            />

            <Ceiling
                position={[0.3, 4, 0]}
                args={[20, 10]}
                rotation={[degToRad(90), degToRad(0), degToRad(-0)]}
            />

            <Windows />

            <WallScene side="left" />
            <WallScene side="right" />
        </group>
    );
}
