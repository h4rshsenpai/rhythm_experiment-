/** Researcher settings. Reload the page after changing these values. */
window.STUDY_CONFIG = {
  lanes: { bpm: 96, timeSignature: [4, 4] },
  calibration: {
    // All courses use the same 120 BPM timing (one cue every 500 ms).
    bpm: 120,
    familiarisationCues: 4,
    trialDurationSeconds: 10,
    pitches: [400, 800, 1200],
  },
};
