/** Researcher settings. Reload the page after changing these values. */
window.STUDY_CONFIG = {
  lanes: { bpm: 96, timeSignature: [4, 4] },
  calibration: {
    // Every course has four listen-only cues, a two-second pause, then four 4/4 measures.
    bpm: 120,
    familiarisationCues: 4,
    interPhaseDelaySeconds: 2,
    responseMeasures: 4,
    timeSignature: [4, 4],
    pitches: [400, 800, 1200],
  },
};
