import * as THREE from "three";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider } from "@react-three/rapier";
import ScrollingBody from "./ScrollingPhysics";
import { useStore } from "@/hooks/useStore";

// basic fire vertex shader
const vertexShader = `
  uniform float uTime;
  uniform float uSize;
  
  attribute float aSpeed;
  attribute float aRandomOffset;
  
  varying float vLife;
  varying float vRandom;

  void main() {
    // 1. Calculate Life Cycle (0.0 to 1.0) based on time, individual speed, and offset
    // The modulo operation causes respawning
    float life = mod(uTime * aSpeed + aRandomOffset, 1.0);
    vLife = life; // Pass to fragment shader
    vRandom = aRandomOffset; // Pass random value for noise color variation

    // 2. Base Position
    vec3 newPosition = position;

    // 3. Apply Upward Movement (Fire rising)
    // It rises higher as life increases
    float riseAmount = life * 2.5; 
    newPosition.y += riseAmount;

    // 4. Apply Horizontal Turbulent "Wiggle"
    // Using sine waves based on life and position to simulate flickering smoke/flame
    newPosition.x += sin(life * 10.0 + position.z + aRandomOffset) * 0.1 * life;
    newPosition.z += cos(life * 10.0 + position.x + aRandomOffset) * 0.1 * life;

    // Project position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // 5. Size Attenuation (Particle gets smaller near death, and further from camera)
    float sizeLifecycle = sin(life * 3.14159); // Scale up then down
    gl_PointSize = uSize * sizeLifecycle;
    
    // Perspective sizing (farther particles are smaller)
    gl_PointSize *= (1.0 / - viewPosition.z);
  }
`;

// basic fire fragment shader
const fragmentShader = `
  varying float vLife;
  varying float vRandom;

  void main() {
    // 1. Make the point circular instead of square
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    // Soft radial gradient
    float strength = 0.05 / distanceToCenter - 0.1;

    // 2. Define Colors
    vec3 colorCore = vec3(1.0, 0.9, 0.5); // Bright Yellow/White inner
    vec3 colorMiddle = vec3(1.0, 0.3, 0.0); // Orange
    vec3 colorEdge = vec3(0.5, 0.0, 0.0);   // Dark Red smoke
    
    // 3. Mix Colors based on vLife (goes white -> yellow -> orange -> red -> transparent)
    vec3 color = colorCore;
    color = mix(color, colorMiddle, step(0.1, vLife)); // Quick transition from core to middle
    color = mix(color, colorEdge, smoothstep(0.1, 0.8, vLife)); // Smooth transition to edge
    
    // Add slight random noise to color variation
    color.r += vRandom * 0.1;

    // 4. Apply transparency and final color
    // It fades out completely at end of life (vLife -> 1.0)
    float alpha = strength * (1.0 - vLife);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// safe mode/blue fire fragment shader
const blueFragmentShader = `
  varying float vLife;
  varying float vRandom;

  void main() {
    // 1. Make the point circular instead of square
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    // Soft radial gradient
    float strength = 0.05 / distanceToCenter - 0.1;

    // 2. Define Colors (Blue/Cyan theme)
    vec3 colorCore = vec3(0.5, 0.9, 1.0);   // Bright Cyan/White inner
    vec3 colorMiddle = vec3(0.1, 0.4, 1.0); // Bright Blue
    vec3 colorEdge = vec3(0.0, 0.1, 0.5);   // Dark Blue smoke
    
    // 3. Mix Colors based on vLife
    vec3 color = colorCore;
    color = mix(color, colorMiddle, step(0.1, vLife));
    color = mix(color, colorEdge, smoothstep(0.1, 0.8, vLife));
    
    // Add slight random noise to color variation
    color.b += vRandom * 0.1;

    // 4. Apply transparency and final color
    float alpha = strength * (1.0 - vLife);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

function createParticleAttributes(count, length, spread) {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * length;
        positions[i3 + 1] = Math.random() * 0.1;
        positions[i3 + 2] = (Math.random() - 0.5) * spread;
        speeds[i] = 0.2 + Math.random() * 0.5;
        randoms[i] = Math.random();
    }

    return [positions, speeds, randoms];
}

export function FireLine({
    obstacle,
    count = 5000, // Number of particles
    length = 3, // How long the line is
    spread = 0.1, // How wide/thick the line base is
    size = 100, // Base particle size
    ...props
}) {
    const safeMode = useStore((state) => state.safeMode);

    // const obstaclePosition = obstacle.position

    const pointsRef = useRef();

    // 1. Generate geometry attributes once (positions, speeds, random numbers)
    const [positions, speeds, randoms] = useMemo(
        () => createParticleAttributes(count, length, spread),
        [count, length, spread],
    );

    // 2. Create the shader material configuration
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uSize: { value: size },
        }),
        [size],
    );

    // 3. Update time uniform every frame for animation
    useFrame((state) => {
        if (obstacle.position[2] < -50) return;

        if (pointsRef.current) {
            pointsRef.current.material.uniforms.uTime.value =
                state.clock.elapsedTime;

            // Dynamically adjust particle count (draw range) based on distance
            // Drops to 0 at z=-50, increases in percentages every 10 units
            const z = obstacle.position[2];
            let visiblePercent = 0;

            if (z > -10) {
                visiblePercent = 1.0; // 100%
            } else if (z > -20) {
                visiblePercent = 0.8; // 80%
            } else if (z > -30) {
                visiblePercent = 0.6; // 60%
            } else if (z > -40) {
                visiblePercent = 0.4; // 40%
            } else if (z > -50) {
                visiblePercent = 0.2; // 20%
            } else {
                visiblePercent = 0.0; // 0%
            }

            pointsRef.current.geometry.setDrawRange(
                0,
                Math.floor(count * visiblePercent),
            );
        }
    });

    return (
        <ScrollingBody obstacle={obstacle}>
            <CuboidCollider
                args={[1.5, 1.5, 0.1]}
                sensor
            />
            <group
                position={[0, 0.015, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[length / 1.4, 0.45, 1]}
            >
                <mesh>
                    <circleGeometry args={[0.7, 32]} />
                    <meshBasicMaterial
                        color="#111"
                        transparent
                        opacity={0.16}
                        depthWrite={false}
                    />
                </mesh>
                <mesh position={[0, 0, 0.003]}>
                    <circleGeometry args={[0.48, 32]} />
                    <meshBasicMaterial
                        color="#111"
                        transparent
                        opacity={0.24}
                        depthWrite={false}
                    />
                </mesh>
            </group>
            <points
                ref={pointsRef}
                {...props}
                frustumCulled={false}
            >
                <bufferGeometry>
                    {/* Core position data */}
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        array={positions}
                        itemSize={3}
                    />
                    {/* Custom attributes for the shader */}
                    <bufferAttribute
                        attach="attributes-aSpeed"
                        count={speeds.length}
                        array={speeds}
                        itemSize={1}
                    />
                    <bufferAttribute
                        attach="attributes-aRandomOffset"
                        count={randoms.length}
                        array={randoms}
                        itemSize={1}
                    />
                </bufferGeometry>

                {!safeMode && (
                    <shaderMaterial
                        blending={THREE.AdditiveBlending} // CRITICAL for "glow" look
                        depthWrite={false} // Prevents ugly black squares behind particles
                        transparent // Required for alpha blending
                        vertexColors // Useful if passing colors directly
                        uniforms={uniforms}
                        vertexShader={vertexShader}
                        fragmentShader={fragmentShader}
                    />
                )}
                {safeMode && (
                    <shaderMaterial
                        blending={THREE.AdditiveBlending} // CRITICAL for "glow" look
                        depthWrite={false} // Prevents ugly black squares behind particles
                        transparent // Required for alpha blending
                        vertexColors // Useful if passing colors directly
                        uniforms={uniforms}
                        vertexShader={vertexShader}
                        fragmentShader={blueFragmentShader}
                    />
                )}
            </points>
        </ScrollingBody>
    );
}
