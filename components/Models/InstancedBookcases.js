import React, { useMemo } from "react";
import { useGLTF, Merged } from "@react-three/drei";

// import getAssetSource from "@/util/getAssetSource";
import getAssetSource from "@articles-media/articles-dev-box/getAssetSource";

const link = getAssetSource(`models/bookcaseClosedDoors-transformed.glb`);

export function InstancedBookcases({ children }) {
    const { nodes } = useGLTF(link);

    const meshes = useMemo(
        () => ({
            Bookcase: nodes["bookcaseClosedDoors(Clone)"],
            Door: nodes.doorLeft,
        }),
        [nodes],
    );

    return (
        <Merged meshes={meshes}>{(instances) => children(instances)}</Merged>
    );
}

useGLTF.preload(link);
