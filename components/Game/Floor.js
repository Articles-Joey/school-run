import { CuboidCollider, RigidBody } from "@react-three/rapier";

export default function Floor({ position }) {
    return (
        <RigidBody
            type="fixed"
            position={position}
            colliders={false}
            userData={{ isGround: true }}
        >
            <CuboidCollider
                args={[5, 0.125, 1.25]}
                friction={0}
                restitution={0}
            />
        </RigidBody>
    );
}
