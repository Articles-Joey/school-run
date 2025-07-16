import { useRef, useEffect } from 'react';

import { useGLTF, useAnimations } from '@react-three/drei'
import { useGameStore } from '@/hooks/useGameStore';

const link = `${process.env.NEXT_PUBLIC_CDN}games/School Run/Hoodie Character.glb`

export function HoodiePlayerModel(props) {

    const {
        characterAnimation
    } = useGameStore()

    const group = useRef()
    const { nodes, materials, animations } = useGLTF(link)
    const { actions } = useAnimations(animations, group)

    const stopAllAnimations = () => {
        Object.keys(actions).forEach(actionName => {
            actions[actionName]?.stop();
        });
    };

    useEffect(() => {

        console.log("Actions", actions)

        actions[characterAnimation].play();

        return () => {
            stopAllAnimations();
        };

    }, [actions, characterAnimation]);

    return (
        <group ref={group} {...props} dispose={null}>
            <group name="Root_Scene">
                <group name="RootNode">
                    <group name="CharacterArmature" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
                        <primitive object={nodes.Root} />
                    </group>
                    <group name="Casual_Feet" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
                        <skinnedMesh
                            name="Casual_Feet_1"
                            geometry={nodes.Casual_Feet_1.geometry}
                            material={materials.White}
                            skeleton={nodes.Casual_Feet_1.skeleton}
                        />
                        <skinnedMesh
                            name="Casual_Feet_2"
                            geometry={nodes.Casual_Feet_2.geometry}
                            material={materials.Purple}
                            skeleton={nodes.Casual_Feet_2.skeleton}
                        />
                    </group>
                    <group name="Casual_Legs" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
                        <skinnedMesh
                            name="Casual_Legs_1"
                            geometry={nodes.Casual_Legs_1.geometry}
                            material={materials.Skin}
                            skeleton={nodes.Casual_Legs_1.skeleton}
                        />
                        <skinnedMesh
                            name="Casual_Legs_2"
                            geometry={nodes.Casual_Legs_2.geometry}
                            material={materials.LightBlue}
                            skeleton={nodes.Casual_Legs_2.skeleton}
                        />
                    </group>
                    <group name="Casual_Head" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
                        <skinnedMesh
                            name="Casual_Head_1"
                            geometry={nodes.Casual_Head_1.geometry}
                            material={materials.Skin}
                            skeleton={nodes.Casual_Head_1.skeleton}
                        />
                        <skinnedMesh
                            name="Casual_Head_2"
                            geometry={nodes.Casual_Head_2.geometry}
                            material={materials.Eyebrows}
                            skeleton={nodes.Casual_Head_2.skeleton}
                        />
                        <skinnedMesh
                            name="Casual_Head_3"
                            geometry={nodes.Casual_Head_3.geometry}
                            material={materials.Eye}
                            skeleton={nodes.Casual_Head_3.skeleton}
                        />
                        <skinnedMesh
                            name="Casual_Head_4"
                            geometry={nodes.Casual_Head_4.geometry}
                            material={materials.Hair}
                            skeleton={nodes.Casual_Head_4.skeleton}
                        />
                    </group>
                    <group
                        name="Casual_Body"
                        position={[0, 0.007, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        scale={100}>
                        <skinnedMesh
                            name="Casual_Body_1"
                            geometry={nodes.Casual_Body_1.geometry}
                            material={materials.Purple}
                            skeleton={nodes.Casual_Body_1.skeleton}
                        />
                        <skinnedMesh
                            name="Casual_Body_2"
                            geometry={nodes.Casual_Body_2.geometry}
                            material={materials.Skin}
                            skeleton={nodes.Casual_Body_2.skeleton}
                        />
                    </group>
                </group>
            </group>
        </group>
    )
}

useGLTF.preload(link)
