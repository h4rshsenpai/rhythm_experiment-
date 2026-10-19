# Still / In Sync

Open `index.html` in a modern browser. The site has four static pages:

- **Home** (`index.html`) introduces the study collection.
- **Experiments** (`experiments.html`) lists the available activities.
- **Pitch Calibration** (`calibration.html`) is the first experiment.
- **Two Lanes** (`two-lanes.html`) is the A/L rhythm experience.

## Pitch Calibration

Calibration presents three pitch courses (400, 800, and 1200 Hz) in a new random order on every run. Each course has four listen-only cues, a two-second silent pause, and four scored 4/4 measures (16 response cues at the default 120 BPM). After each non-final course, tap once more to begin the next course; that continuation tap is not scored. The final report is available to copy and as `window.latestPitchCalibration` in the browser console.

## Researcher setup

Edit [`study-config.js`](./study-config.js) before loading an experiment, then reload the page:

```js
window.STUDY_CONFIG = {
  lanes: { bpm: 96, timeSignature: [4, 4] },
  calibration: {
    bpm: 120,
    familiarisationCues: 4,
    interPhaseDelaySeconds: 2,
    responseMeasures: 4,
    timeSignature: [4, 4],
    pitches: [400, 800, 1200],
  },
};
```
