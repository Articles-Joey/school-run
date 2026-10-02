const FOLLOW_RATE = 40;
const SNAP_DISTANCE_SQUARED = 1;

// Smooth the rendered character between worker samples, without moving its collider.
export default function smoothPlayerPosition(current, target, delta) {
    const dx = target[0] - current.x;
    const dy = target[1] - current.y;
    const dz = target[2] - current.z;

    // Teleports and tab resumes should snap rather than sweep through the scene.
    if (delta > 0.1 || dx * dx + dy * dy + dz * dz > SNAP_DISTANCE_SQUARED) {
        return current.set(target[0], target[1], target[2]);
    }

    const blend = -Math.expm1(-FOLLOW_RATE * delta);
    current.x += dx * blend;
    current.y += dy * blend;
    current.z += dz * blend;
    return current;
}
