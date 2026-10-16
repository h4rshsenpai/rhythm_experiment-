# Still / In Sync

Open `index.html` in a modern browser. The start screen contains two levels:

- **Two Lanes** preserves the original A/L rhythm experience.
- **Pitch Calibration** is a mobile-friendly one-pad tapping task. It presents three 30-second courses in a newly randomized order on each run. The timing is identical for all courses: 120 BPM (one cue every 500 ms), with four listen-only familiarisation cues. Only the sine-click pitch changes: 400, 800, or 1200 Hz.

In Pitch Calibration, tap the large pad (or press Space) once for every cue after the familiarisation period. Each course records matched taps, missed and extra responses, and mean absolute asynchrony. On completion, the complete raw result object is available as `window.latestPitchCalibration` in the browser console; a compact table is also logged there.

## Researcher setup

Edit [`study-config.js`](./study-config.js) before loading the page and reload after saving. The default calibration values are intentionally fixed so that pitch is the only course-level manipulation:

```js
window.STUDY_CONFIG = {
  lanes: { bpm: 96, timeSignature: [4, 4] },
  calibration: {
    bpm: 120,
    familiarisationCues: 4,
    trialDurationSeconds: 30,
    pitches: [400, 800, 1200],
  },
};
```
