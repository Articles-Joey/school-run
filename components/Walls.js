// import { useCylinder } from "@react-three/cannon";
import { Text } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react"

// import generateRandomInteger from "util/generateRandomInteger"
import { ModelDoorway } from "@/components/Models/doorway";
import { BookcaseClosedDoorsModel } from "@/components/Models/BookcaseClosedDoors";

import getRandomHexColor from "@/util/getRandomHexColor"

function Ring(props) {
    const [zPosition, setZPosition] = useState(props.position[2]);
    const [hasPassed, setHasPassed] = useState(false);
    const [hasPassedFar, setHasPassedFar] = useState(false);
    const ref = useRef();

    // const [refCylinder] = useCylinder(() => ({
    //     mass: 0,
    //     rotation: [-Math.PI / 2, 0, 0],
    //     ...props,
    // }));

    // useFrame(() => {
    //     if (ref.current) {
    //         const newZ = ref.current.position.z + 0.05;
    //         ref.current.position.z = newZ;
    //         setZPosition(newZ);

    //         if (
    //             newZ
    //             <
    //             Math.abs(props.position[2]) + 30
    //         ) {
    //             setHasPassed(false)
    //         } else {
    //             setHasPassed(true)
    //         }

    //         if (
    //             newZ
    //             <
    //             Math.abs(props.position[2]) + 30
    //         ) {
    //             setHasPassedFar(false)
    //         } else {
    //             setHasPassedFar(true)
    //         }

    //     }
    // });

    const randomColor = useMemo(() => {
        return getRandomHexColor()
    }, [])

    // const ring = useMemo(() => {

    //     return (

    //     )

    // }, [zPosition])

    // function hasPassed(pos) {

    //     if (
    //         zPosition.toFixed(0)
    //         >
    //         Math.abs(pos)
    //     ) {
    //         return true
    //     } else {
    //         return false
    //     }

    // }

    return (
        <group ref={ref}>

            {
                // (
                //     zPosition.toFixed(0)
                //     <
                //     Math.abs(props.position[2])
                // )
                // &&
                <group>

                    {!hasPassedFar &&
                        <mesh position={props.position}>
                            <torusGeometry attach="geometry" args={[1, 0.1]} />
                            <meshStandardMaterial
                                attach="material"
                                color={randomColor}
                                transparent={true}
                                opacity={hasPassed ? 0.1 : 1}
                            />
                        </mesh>
                    }

                    {!hasPassedFar && <mesh
                        // ref={refCylinder}as
                        opacity={hasPassed ? 0.1 : 1}
                        transparent={true}
                        position={props.position}
                        rotation={[-Math.PI / 2, 0, 0]}
                    >

                        <cylinderGeometry args={[0.5, 0.5, 0.25]} />

                        <meshStandardMaterial {...props} opacity={hasPassed ? 0.1 : 0.5} transparent={true} color="gray" />

                        {((Math.abs(props.position[2]) - zPosition.toFixed(0)) < 100) &&
                            <Text
                                position={[0, -1, 1]}
                                scale={0.6}
                                color="black" rotation={[Math.PI / 2, 0, 0]} anchorX="center" anchorY="middle"
                            >
                                {Math.abs(props.position[2])}/{zPosition.toFixed(0)}
                                <meshStandardMaterial attach="material" opacity={hasPassed ? 0 : 1} />
                            </Text>
                        }

                    </mesh>}

                </group>
            }



        </group>
    );
}

import * as THREE from 'three'

import { useTexture } from "@react-three/drei"
import { RepeatWrapping } from "three";
import { degToRad } from "three/src/math/MathUtils.js";

function StoneBrickFloor(props) {

    const base_link = `${process.env.NEXT_PUBLIC_CDN}games/US Tycoon/Textures/StoneBricksSplitface001/`

    const texture = useTexture({
        map: `${base_link}StoneBricksSplitface001_COL_1K.jpg`,
        // displacementMap: `${base_link}StoneBricksSplitface001_DISP_1K.jpg`,
        normalMap: `${base_link}StoneBricksSplitface001_NRM_1K.jpg`,
        // roughnessMap: `${base_link}StoneBricksSplitface001_BUMP_1K.jpg`,
        // aoMap: `${base_link}StoneBricksSplitface001_AO_1K.jpg`,
    })

    texture.map.repeat.set(20, 1.25);
    texture.map.wrapS = texture.map.wrapT = THREE.RepeatWrapping;

    return (
        <group {...props}>
            <mesh receiveShadow>
                <planeGeometry {...props} />
                <meshStandardMaterial {...texture} />
            </mesh>
        </group>
    )

};

function Walls({ position }) {

    const ref = useRef();

    const rings = useMemo(() => {

        return [...Array(10)].map((item, i) => {
            return (
                <group
                    key={i}
                    position={[0, 0, -(i * 0.75) + 6]}
                    scale={2}
                >
                    <BookcaseClosedDoorsModel
                        rotation={[0, Math.PI / 2, 0]}
                        position={[-2, 0, 0]}
                    // position={[generateRandomInteger(-3, 3), (generateRandomInteger(-3, 3) + 5), -(i * 20)]}
                    />
                    <BookcaseClosedDoorsModel
                        rotation={[0, -Math.PI / 2, 0]}
                        position={[2, 0, -0.5]}
                    // position={[generateRandomInteger(-3, 3), (generateRandomInteger(-3, 3) + 5), -(i * 20)]}
                    />
                    {/* <BookcaseClosedDoorsModel
                        position={[0, 0, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                    /> */}
                    {/* <Ring
                        // position={[generateRandomInteger(-3, 3), (generateRandomInteger(-3, 3) + 5), -(i * 20)]}
                    /> */}
                </group>
            )
        })

    }, [])

    return (
        <group ref={ref} position={[0, 0, position[2]]}>

            <StoneBrickFloor
                rotation={[0, -Math.PI / 2, 0]}
                position={[4.5, 1.5, 0]}
                args={[10, 3]}
            />

            <StoneBrickFloor
                rotation={[0, Math.PI / 2, 0]}
                position={[-4.5, 1.5, 0]}
                args={[10, 3]}
            />

            <WhiteTileFloor
                args={[10, 10]}
                position={[0, 0, 0]}
                rotation={[-90 * Math.PI / 180, 0, 0]}
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

            {rings}

        </group>
    )
}

export default Walls

function WhiteTileFloor(props) {

    const base_link = `${process.env.NEXT_PUBLIC_CDN}games/US Tycoon/Textures/Tiles107_1K-JPG/`

    const texture = useTexture({
        map: `${base_link}Tiles107_1K-JPG_Color.jpg`,
        // displacementMap: `${base_link}GroundSand005_DISP_1K.jpg`,
        // normalMap: `${base_link}GroundSand005_NRM_1K.jpg`,
        // roughnessMap: `${base_link}GroundSand005_BUMP_1K.jpg`,
        // aoMap: `${base_link}GroundSand005_AO_1K.jpg`,
    })

    texture.map.repeat.set(4, 4);
    texture.map.wrapS = texture.map.wrapT = RepeatWrapping;

    return (
        <group {...props}>
            <mesh>
                <planeGeometry {...props} />
                <meshStandardMaterial {...texture} />
            </mesh>
        </group>
    )

};

function Ceiling(props) {

    const base_link = `textures/OfficeCeiling/OfficeCeiling006_1K-JPG_Color.jpg`

    const texture = useTexture({
        map: base_link,
        // displacementMap: `${base_link}GroundSand005_DISP_1K.jpg`,
        // normalMap: `${base_link}GroundSand005_NRM_1K.jpg`,
        // roughnessMap: `${base_link}GroundSand005_BUMP_1K.jpg`,
        // aoMap: `${base_link}GroundSand005_AO_1K.jpg`,
    })

    texture.map.repeat.set(2, 1);
    texture.map.wrapS = texture.map.wrapT = RepeatWrapping;

    return (
        <group {...props}>
            <mesh>
                <planeGeometry {...props} />
                <meshStandardMaterial {...texture} />
            </mesh>
        </group>
    )

};