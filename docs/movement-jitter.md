# Comparing keyboard movement timing

The current player resolves keyboard and touch left/right to the same digital
axis, then uses the same physics commands and visual smoothing. Full-stick gamepad
input also reaches the same speed. Partially tilted gamepad input is slower.
Keyboard repeats are suppressed before React/global hotkey handlers and do not
publish new input snapshots. A passing simulated-input test cannot establish the
cause of a browser frame stall.

## Capture the actual development session

After `/play` has loaded on the development server, open the browser console:

```js
schoolRunMovement.start("keyboard");
```

Focus the game and move with A/D for ten seconds, reproducing the stutter. Release
the keys, then repeat with the on-screen controls in the same browser and window:

```js
schoolRunMovement.start("touch");
```

Optionally record `schoolRunMovement.start("gamepad")` with the stick fully tilted.
Use the same graphics, camera, viewport and DevTools setup for each capture. Keep
alternating directions so the character moves instead of sitting at a lane edge.
Each recording stops and logs a result automatically. To copy all results:

```js
copy(JSON.stringify(schoolRunMovement.results, null, 2));
```

`copy` is a browser DevTools console helper. The recording API is available only
in development and makes no network requests. It does no per-frame logging or
React/Zustand updates. Recording is inactive until `start()` is called. Source
counts include idle time spent returning focus from the console.

## Read the evidence

- `keyRepeats` can be high. `keyboardTransitions` should increase only when A/D
  changes held state (including clearing held keys on blur); repeats must not
  increase it. `blurEvents` reveals focus losses. `playerCommits` counts actual
  Player React commits during the recording (unrelated game state can cause some).
- `frameTimeMs` and `framesOver25Ms` expose rendering stalls. Compare keyboard
  and touch using the same display refresh rate; 25 ms is a fixed reporting
  threshold, not a universal frame budget.
- `keyboardEventDeliveryMs` measures the event timestamp to the capture listener.
  `keyboardTransitionToFrameMs` measures an accepted input change to the next
  player frame. These do not include hardware or display latency.
- `physicsReplyGapMs` and `physicsSampleAgeAtFrameMs` expose irregular/stale worker
  feedback. Large gaps with steady render intervals point toward physics/worker
  timing; gaps in both need a browser Performance trace to establish the cause.
- `maxVisualErrorX` measures separation between the collider and smoothed character.
  The exponential follower adds visual delay for all input types; this metric
  alone cannot explain a keyboard-only difference.
- `sourceFrames` shows which inputs actually reached Player. This checkout reads
  `controllerState.axes`, but contains no mounted caller of `setControllerState`.
  A controller that maps to keyboard keys will appear as keyboard input.

The installed Cannon provider also drops a step request when its transferable
buffers are still in the worker, while resetting its elapsed-time accumulator.
This is a shared timing risk under load, not evidence that A/D causes it. A live
capture is needed before changing physics scheduling again.
