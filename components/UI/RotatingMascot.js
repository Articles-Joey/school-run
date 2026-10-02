import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ModelBackpack } from "../Models/Backpack";
import { Suspense } from "react";

export default function RotatingMascot() {
    return (
        <div className="rotating-mascot-container w-100 h-100">
            <Suspense>
                <Canvas shadows>

                    <OrbitControls
                        autoRotate
                        enableZoom={false}
                        enablePan={false}
                        enableRotate={false}
                        autoRotateSpeed={10}
                    />

                    <ambientLight intensity={0.8} />
                    <pointLight
                        position={[-3, 3, 3]}
                        intensity={40}
                        distance={20}
                        decay={2}
                        castShadow
                        shadow-mapSize={[1024, 1024]}
                    />

                    <Suspense fallback={null}>
                        <ModelBackpack scale={3} />
                    </Suspense>
                    
                </Canvas>
            </Suspense>
        </div>
    );
}
