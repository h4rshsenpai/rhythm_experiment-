# Still / In Sync

Open `index.html` in a modern desktop browser. Audio begins only after the
participant clicks **Enter the room** or presses **A** or **L**.

## Researcher setup

Before a session, edit [`study-config.js`](./study-config.js):

```js
window.STUDY_CONFIG = {
  bpm: 96,
  timeSignature: [4, 4],
};
```

Reload the page after saving. `bpm` controls note, visual, and click timing.
The numerator of `timeSignature` defines each visual/audio downbeat. The
denominator is recorded in the readable configuration for the study meter;
this version schedules one metronome pulse per beat.

There is no participant account, browser storage, or result collection.
