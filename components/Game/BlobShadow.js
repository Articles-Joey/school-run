import { useMemo } from "react";
import { CanvasTexture } from "three";

let sharedTexture;

function getShadowTexture() {
    if (!sharedTexture) {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 128;
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, "rgba(0,0,0,1)");
        gradient.addColorStop(0.5, "rgba(0,0,0,0.5)");
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
        sharedTexture = new CanvasTexture(canvas);
    }
    return sharedTexture;
}

// Fake contact shadow: a soft dark disc laid flat on the floor.
export default function BlobShadow({
    size = 1,
    opacity = 0.5,
    shadowRef,
    ...props
}) {
    const map = useMemo(getShadowTexture, []);

    return (
        <mesh
            ref={shadowRef}
            rotation={[-Math.PI / 2, 0, 0]}
            renderOrder={1}
            {...props}
        >
            <planeGeometry args={[size, size]} />
            <meshBasicMaterial
                map={map}
                transparent
                opacity={opacity}
                depthWrite={false}
                toneMapped={false}
            />
        </mesh>
    );
}
