import { useRef, useState } from 'react'

import { useFrame } from '@react-three/fiber'
import { useBox } from '@react-three/cannon';
import { useTexture } from '@react-three/drei';

import * as THREE from 'three'
// import WhiteTileFloor from '../USA Tycoon/Floors/Tile';

// import { useGameStore } from './hooks/useGameStore';

const floor_size = [10, 0.25, 2.5]

function WhiteTileFloor(props) {

    const base_link = `${process.env.NEXT_PUBLIC_CDN}games/US Tycoon/Textures/Tiles107_1K-JPG/`

    const texture = useTexture({
        map: `${base_link}Tiles107_1K-JPG_Color.jpg`,
        // displacementMap: `${base_link}GroundSand005_DISP_1K.jpg`,
        // normalMap: `${base_link}GroundSand005_NRM_1K.jpg`,
        // roughnessMap: `${base_link}GroundSand005_BUMP_1K.jpg`,
        // aoMap: `${base_link}GroundSand005_AO_1K.jpg`,
    })

    texture.map.repeat.set(4, 20);
    texture.map.wrapS = texture.map.wrapT = THREE.RepeatWrapping;

    return (
        <group {...props}>
            <mesh>
                <planeGeometry {...props} />
                <meshStandardMaterial {...texture} />
            </mesh>
        </group>
    )

};

export default function Floor(props) {

    const { invisible } = props

    // This reference gives us  direct access to the THREE.Mesh object
    // const ref = useRef()

    const [ref, api] = useBox(() => ({
        mass: 0,
        // friction: 0,
        position: props.position,
        args: floor_size, // Dimensions of the cube
        material: {
            // restitution: 0, // Adjust this value to control the bouncea
        },
    }));

    useFrame(() => {

        return

        // Update the position of the box along the x-axis based on the current direction
        ref.current.position.z += 0.05 * 1;

        // Use api.position to update the position
        api.position.set(
            ref.current.position.x,
            ref.current.position.y,
            ref.current.position.z
        );

    });

    // Return the view, these are regular Threejs elements expressed in JSX
    return (
        <group
            ref={ref}
        >
            {/* <WhiteTileFloor
                args={[20, 100]}
                position={[3, 0, 0]}
                rotation={[-90 * Math.PI / 180, 0, 0]}
            /> */}
        </group>
    )

}