import { Canvas, useThree } from '@react-three/fiber';
import { Debug, Physics } from '@react-three/cannon';
import { Center, Image, OrbitControls, Plane, Sky, Stats, Text, Text3D } from '@react-three/drei'

import Player from './Player';
// import RainbowCube from './RainbowCube';
// import generateRandomInteger from 'util/generateRandomInteger';
// import OneWayPlatform from './Platforms/OneWayPlatform';
import { memo, useMemo } from 'react';
// import MovingPlatform from './Platforms/MovingPlatform';
import { useGameStore } from '@/hooks/useGameStore';
// import Bounds from '../Ocean Rings/Bounds';
// import Rings from '../Ocean Rings/Rings';
import getRandomHexColor from '@/util/getRandomHexColor';
import Sections from './Game/Sections';
import Floor from './Floor';
import Walls from './Walls';
import { SuitWomanModel } from './PlayerModels/SuitWoman';
import { BloodSplatModel } from './Models/BloodSplat';
import { useStore } from '@/hooks/useStore';

const BackWalls = memo(function BackWalls(props) {

    // const { numberOfPlatforms, start } = props

    // const generateRandomPlatforms = useMemo(() => {

    //     const originalMaterial = [...Array(numberOfPlatforms)].map((item, i) => {
    //         return (
    //             <OneWayPlatform key={i} color="pink" position={[generateRandomInteger(-1.5, 1.5), (start + (i * 1.5)), 0]} />
    //         )
    //     })

    //     return originalMaterial

    // }, [])

    return (
        <>
            {[...Array(60)].map((item, i) => {
                return (
                    <mesh key={i} position={[0, 5, -(i * 20)]}>
                        <planeGeometry attach="geometry" args={[20, 10]} />
                        <meshStandardMaterial
                            transparent={true}
                            opacity={0.1}
                            color={getRandomHexColor()}
                        />
                    </mesh>
                )
            })}
        </>
    )
})

function GameCanvas(props) {

    const {
        // setPlayerData, 
        players
    } = props;

    // const generateRandomPlatforms = useMemo((platformNumbers) => {

    //     const originalMaterial = [...Array(platformNumbers)].map((item, i) => {
    //         return (
    //             <OneWayPlatform key={i} color="pink" position={[generateRandomInteger(-1.5, 1.5), (16 + (i * 1.5)), 0]} />
    //         )
    //     })

    //     return originalMaterial

    // }, [])

    // const { 
    //     playerLocation,
    //     distance
    // } = useGameStore()

    const debug = useStore(state => state.debug)
    const darkMode = useStore(state => state.darkMode)

    return (
        <Canvas camera={{ fov: 45, position: [0, 5, 20] }}>

            {process.env.NODE_ENV === 'development' && <>
                <Stats className="stats-overlay" />
            </>}

            {/* <color
                attach="background"
                args={[0, 0, 0]}
            /> */}

            {darkMode ?
                <>
                    <ambientLight intensity={0.1} />
                    <Sky sunPosition={[100, -1, 20]} />
                </>
                :
                <>
                    <ambientLight intensity={0.5} />
                    <Sky sunPosition={[100, 10, 20]} />
                </>
            }

            {/* <color attach="background" args={['#215776']} /> */}

            {/* Add your 3D scene components here */}
            {/* <ambientLight intensity={2} /> */}
            {/* <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} /> */}
            <pointLight
                position={[0, 3, 3]}
                intensity={10}
            />

            <pointLight
                position={[0, 3, -10]}
                intensity={10}
            />

            <pointLight
                position={[0, 3, -30]}
                intensity={10}
            />

            {/* <BackWalls /> */}

            {/* <SuitWomanModel
                position={[0, 0, -7]}
                rotation={[0, -140 * Math.PI / 180, 0]}
            /> */}

            {/* Lanes */}
            {/* <group>
                <mesh position={[-1, 0, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial
                        color={'yellow'}
                        transparent={true}
                        opacity={0.5}
                    />
                </mesh>
                
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial
                        color={'red'}
                        transparent={true}
                        opacity={0.5}
                    />
                </mesh>
    
                <mesh position={[1, 0, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial
                        color={'yellow'}
                        transparent={true}
                        opacity={0.5}
                    />
                </mesh>
            </group> */}

            <Physics
                gravity={[0, -15, 0]}
                contactMaterial={{ friction: 0.5 }}
            >

                {debug ? (
                    <Debug color="black" scale={1}>
                        <GameContent />
                    </Debug>
                ) : (
                    <GameContent />
                )}

                {/* <Debug color="black" scale={1}>

                    <Sections />

                    <Floor
                        position={[0, 0, 0]}
                    />

                    <Player
                        position={[0, 1, 0]}
                    />

                </Debug> */}

            </Physics>

            <OrbitControls
                target={[0, 1, 0]}
            />

        </Canvas>
    )
}

const GameContent = () => (
    <>
        <Sections />
        <Floor position={[0, -0.125, 0]} />
        <Player position={[0, 1, 0]} />
    </>
);

export default memo(GameCanvas)