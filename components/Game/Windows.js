import { useMemo } from "react";
import { degToRad } from "three/src/math/MathUtils.js";

import { ModelBrokenWindow } from "../Models/BrokenWindow";
import { ModelUnbrokenWindow } from "../Models/UnbrokenWindow";

export default function Windows() {
    return (
        <group>
            <Window side={"left"} />

            <Window side={"right"} />
        </group>
    );
}

function Window({ side }) {
    const yPosition = side === "left" ? 3.5 : 3.5;
    const xPosition = side === "left" ? -4.5 : 4.5;

    const windowOptions = [
        <ModelUnbrokenWindow
            position={[xPosition, yPosition, -0.5]}
            scale={[1.7, 1.7, 19.7]}
            rotation={[0, degToRad(0), 0]}
        />,
        <ModelBrokenWindow
            position={[xPosition, yPosition - 0.02, -0.5]}
            scale={[1.7, 1.7, 19.7]}
            rotation={[0, degToRad(0), 0]}
        />,
    ];

    const selectedWindow = useMemo(() => {
        return windowOptions[Math.floor(Math.random() * windowOptions.length)];
    }, [side]);

    return selectedWindow;
}
