import { useTexture } from "@react-three/drei";
import { RepeatWrapping } from "three";

// import getAssetSource from "@/util/getAssetSource";
import getAssetSource from "@articles-media/articles-dev-box/getAssetSource";

const link = getAssetSource(`textures/FloorTile/`);

export default function WhiteTileFloor(props) {
    const texture = useTexture({
        map: `${link}Color.jpg`,
        // displacementMap: `${base_link}GroundSand005_DISP_1K.jpg`,
        // normalMap: `${base_link}GroundSand005_NRM_1K.jpg`,
        // roughnessMap: `${base_link}GroundSand005_BUMP_1K.jpg`,
        // aoMap: `${base_link}GroundSand005_AO_1K.jpg`,
    });

    texture.map.repeat.set(4, 4);
    texture.map.wrapS = texture.map.wrapT = RepeatWrapping;

    return (
        <group {...props}>
            <mesh receiveShadow>
                <planeGeometry {...props} />
                <meshStandardMaterial {...texture} />
            </mesh>
        </group>
    );
}
