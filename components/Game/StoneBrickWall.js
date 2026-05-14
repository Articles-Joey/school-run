import { useTexture } from "@react-three/drei";
import { RepeatWrapping } from "three";

export default function StoneBrickWall(props) {

    const base_link = `${process.env.NEXT_PUBLIC_CDN}games/US Tycoon/Textures/StoneBricksSplitface001/`

    const texture = useTexture({
        map: `${base_link}StoneBricksSplitface001_COL_1K.jpg`,
        // displacementMap: `${base_link}StoneBricksSplitface001_DISP_1K.jpg`,
        normalMap: `${base_link}StoneBricksSplitface001_NRM_1K.jpg`,
        // roughnessMap: `${base_link}StoneBricksSplitface001_BUMP_1K.jpg`,
        // aoMap: `${base_link}StoneBricksSplitface001_AO_1K.jpg`,
    })

    texture.map.repeat.set(4, 2.5);
    texture.map.wrapS = texture.map.wrapT = RepeatWrapping;

    return (
        <group {...props}>
            <mesh receiveShadow>
                <planeGeometry {...props} />
                <meshStandardMaterial {...texture} />
            </mesh>
        </group>
    )

};