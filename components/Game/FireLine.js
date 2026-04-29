import * as THREE from 'three'
import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

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
`

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
`

export function FireLine({ 
  count = 5000,    // Number of particles
  length = 3,     // How long the line is
  spread = 0.1,   // How wide/thick the line base is
  size = 100,      // Base particle size
  ...props 
}) {
  const pointsRef = useRef()

  // 1. Generate geometry attributes once (positions, speeds, random numbers)
  const [positions, speeds, randoms] = useMemo(() => {
    const positions = new Float32Array(count * 3) // x, y, z
    const speeds = new Float32Array(count)
    const randoms = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // -- Define starting Positions --
      
      // X: Randomly along the length of the line (centered)
      positions[i3 + 0] = (Math.random() - 0.5) * length
      
      // Y: Start close to the ground (with slight random variance)
      positions[i3 + 1] = Math.random() * 0.1
      
      // Z: Randomly along the width (spread)
      positions[i3 + 2] = (Math.random() - 0.5) * spread

      // -- Define animation attributes --
      
      // How fast the particle rises (randomized for variance)
      speeds[i] = 0.2 + Math.random() * 0.5 
      
      // Used to randomize the respawn time so they don't all pop at once
      randoms[i] = Math.random()
    }

    return [positions, speeds, randoms]
  }, [count, length, spread])

  // 2. Create the shader material configuration
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSize: { value: size }
  }), [size])

  // 3. Update time uniform every frame for animation
  useFrame((state) => {
    if(pointsRef.current) {
      pointsRef.current.material.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <points ref={pointsRef} {...props} frustumCulled={false}>
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
      <shaderMaterial
        blending={THREE.AdditiveBlending} // CRITICAL for "glow" look
        depthWrite={false}               // Prevents ugly black squares behind particles
        transparent                      // Required for alpha blending
        vertexColors                     // Useful if passing colors directly
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </points>
  )
}