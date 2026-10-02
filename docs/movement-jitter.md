# Movement and physics

The game uses `@react-three/rapier` 2 with a fixed 60 Hz simulation and native
render interpolation. `GameCanvas` runs physics before the character's camera,
shadow, and weapon attachments read its displayed position.

## Input

- A/D and the touch joystick share `useTouchControlsStore` and the same movement
  calculation. Keyboard takes priority while held; releasing it restores any
  direction still held on touch. A/D overlap uses the most recently pressed key.
- One shared window capture listener handles keyboard input. Both native repeat
  events and duplicate keydowns are consumed without publishing to Zustand,
  React, or the movement loop. The browser still generates repeat events.
- W and Space share jump; releasing one while the other is held keeps jump active.
  S starts a roll. Blur, hidden tabs, and final unmount clear held keys.
- Runtime input bypasses persistence, and the touch setter rejects identical
  values. Only the on-screen-controls preference goes to local storage.
- Controller axes retain their existing dead zone (0.3). This checkout reads
  `controllerState.axes`; it has no mounted caller of `setControllerState`.
  Controllers mapped to keyboard events continue through the keyboard path.

## Simulation

`ScrollingPhysics` advances obstacle positions once per fixed step, then supplies
kinematic targets to the obstacle and hallway bodies together. Rapier interpolates
both. React only adds/removes sections when they recycle.

`Player` reads held input before each physics step and updates lateral velocity
only when it changes. Jumping sets vertical speed to 6 using current synchronous
physics state, with floor contacts confirming that the player is grounded.
Movement speed remains 4 (2 during a roll), the lane limit is ±2.5, and gravity
is -15. Existing debug speed boost, post-game movement, and world freeze behavior
are retained.

A radius-0.2 foot sphere at local Y=-0.625 supports the character. A radius-0.25,
height-1.5 sensor is attached to the same rigid body. Upper-body overlaps are
ignored during rolls; foot overlaps remain active. Current sensor overlaps are
checked after every step so ending a roll inside an obstacle still causes death.
The game-over guard prevents duplicate sound/score submission.

Obstacle dimensions are unchanged; Rapier box arguments are half extents.
Automatic mesh colliders are disabled. Safe-mode models, death audio, score
submission, shadows, camera modes, particle effects, and collider debugging remain.

The former worker subscriptions, independently moved upper hitbox, exponential
visual follower, timing recorder, and obsolete engine-specific test harness have
been removed. No test scripts are needed to run the game.

## Gameplay review

After loading `/play`, check held A/D, reversals, release at either lane edge,
W/Space jumps, S rolls beneath overhead obstacles, touch controls, controller
input, death/restart, world freeze, and debug teleport/colliders. Check a roll
ending while an obstacle still overlaps the upper body. These need a browser
playthrough; static checks alone cannot establish visual smoothness.
