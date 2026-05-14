import { useTexture } from "@react-three/drei";
import { RepeatWrapping } from "three";

export default function Ceiling(props) {

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