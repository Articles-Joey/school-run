import { useRef, useState } from 'react'

import { useBox } from '@react-three/cannon';

const floor_size = [10, 0.25, 2.5]

export default function Floor(props) {

    const [ref, api] = useBox(() => ({
        mass: 0,
        // friction: 0,
        position: props.position,
        args: floor_size, // Dimensions of the cube
        material: {
            // restitution: 0, // Adjust this value to control the bouncea
        },
    }));

    // Return the view, these are regular Threejs elements expressed in JSX
    return (
        <group
            ref={ref}
        >
        </group>
    )
}