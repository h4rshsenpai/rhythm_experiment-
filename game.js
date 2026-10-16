const $ = (selector) => document.querySelector(selector);

const room = $('#room');
const notesElement = $('#notes');
const particlesElement = $('#particles');
const message = $('#message');
const subcopy = $('#subcopy');
const chapter = $('#chapter');
const progress = $('#progress');
const startButton = $('#startButton');
const lanes = { left: $('#leftLane'), right: $('#rightLane') };

const FALLBACK_CONFIG = { bpm: 96, timeSignature: [4, 4] };
const NOTE_PATTERN = [
  'left', 'right', 'left', 'left', 'right', 'left', 'right', 'right',
  'left', 'right', 'left', 'right', 'right', 'left', 'left', 'right',
  'left', 'right', 'left', 'right', 'right', 'left', 'right', 'left',
];
const NOTE_LEAD_SECONDS = 1.85;

const studyConfig = readStudyConfig(window.STUDY_CONFIG);
const secondsPerBeat = 60 / studyConfig.bpm;
const beatsPerBar = studyConfig.timeSignature[0];

let audioContext;
let masterGain;
let visualStartTime = 0;
let audioStartTime = 0;
let isStarted = false;
let isFinished = false;
let score = 0;
let scheduledNotes = [];
let animationFrame;
let nextMetronomeBeat = 1;

function readStudyConfig(candidate) {
  const bpm = Number(candidate?.bpm);
  const signature = candidate?.timeSignature;
  const validSignature = Array.isArray(signature)
    && signature.length === 2
    && signature.every((value) => Number.isInteger(value) && value > 0);

  if (Number.isFinite(bpm) && bpm > 0 && validSignature) {
    return { bpm, timeSignature: signature };
  }

  console.warn('Invalid STUDY_CONFIG; using the default 96 BPM in 4/4.', candidate);
  return FALLBACK_CONFIG;
}

function nowInSeconds() {
  return performance.now() / 1000;
}

function createAudio() {
  audioContext = new AudioContext();
  audioStartTime = audioContext.currentTime;
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.16;
  masterGain.connect(audioContext.destination);
  scheduleMetronome();
}

function playTone(at, frequency, duration, type, volume) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, at);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(gain).connect(masterGain);
  oscillator.start(at);
  oscillator.stop(at + duration + 0.03);
}

function scheduleMetronome() {
  if (!isStarted || isFinished) return;

  // Look ahead to keep metronome timing steady when rendering is busy.
  const scheduleUntil = audioContext.currentTime + 3;
  while (audioStartTime + nextMetronomeBeat * secondsPerBeat < scheduleUntil) {
    const beatNumber = nextMetronomeBeat;
    const at = audioStartTime + beatNumber * secondsPerBeat;
    const isDownbeat = beatNumber % beatsPerBar === 0;
    playTone(at, isDownbeat ? 104 : 78, 0.13, 'sine', isDownbeat ? 0.45 : 0.18);
    if (beatNumber % 2 === 1) playTone(at, 330, 0.045, 'triangle', 0.035);
    nextMetronomeBeat += 1;
  }

  window.setTimeout(scheduleMetronome, 2600);
}

function prepareNotes() {
  const introDuration = beatsPerBar * secondsPerBeat;
  scheduledNotes = NOTE_PATTERN.map((side, index) => ({
    side,
    time: visualStartTime + introDuration + index * secondsPerBeat,
    done: false,
    element: null,
  }));
}

function startExperience() {
  if (isStarted) return;

  isStarted = true;
  visualStartTime = nowInSeconds();
  createAudio();
  prepareNotes();
  startButton.classList.add('hide');
  chapter.textContent = `COURSE 01 · ${studyConfig.bpm} BPM · ${studyConfig.timeSignature.join('/')}`;
  message.textContent = 'Follow the quiet current';
  subcopy.textContent = 'A for left, L for right. There is room to be close.';
  tick();
}

function tick() {
  if (!isStarted || isFinished) return;

  const now = nowInSeconds();
  const phase = ((now - visualStartTime) / secondsPerBeat) * Math.PI * 2;
  room.style.setProperty('--pulse', ((Math.sin(phase) + 1) / 2).toFixed(2));
  scheduledNotes.forEach((note) => updateNote(note, now));

  if (scheduledNotes.length && scheduledNotes.every((note) => note.done)) finishExperience();
  if (!isFinished) animationFrame = requestAnimationFrame(tick);
}

function updateNote(note, now) {
  const secondsUntilHit = note.time - now;
  if (secondsUntilHit < NOTE_LEAD_SECONDS && secondsUntilHit > -0.22 && !note.element) {
    note.element = createNoteElement(note.side);
    notesElement.append(note.element);
  }
  if (note.element) positionNote(note, secondsUntilHit);

  if (secondsUntilHit < -0.23 && !note.done) {
    note.done = true;
    note.element?.remove();
    showFeedback('Reset Flow', 'Let the next beat arrive.');
  }
}

function createNoteElement(side) {
  const element = document.createElement('div');
  element.className = `note ${side}`;
  element.style.setProperty('--note', side === 'left' ? '#c7a8ff' : '#9cebd4');
  return element;
}

function positionNote(note, secondsUntilHit) {
  const laneBox = lanes[note.side].getBoundingClientRect();
  const hitY = laneBox.top + laneBox.height * 0.82;
  const journey = 1 - secondsUntilHit / NOTE_LEAD_SECONDS;
  const y = window.innerHeight * 0.17 + (hitY - window.innerHeight * 0.17) * journey;

  note.element.style.top = `${y}px`;
  note.element.classList.toggle('live', secondsUntilHit < NOTE_LEAD_SECONDS && secondsUntilHit > -0.12);
}

function showFeedback(title, detail, restoreDefault = false) {
  message.textContent = title;
  subcopy.textContent = detail;
  if (!restoreDefault) return;

  window.setTimeout(() => {
    if (isFinished) return;
    message.textContent = 'Keep moving gently';
    subcopy.textContent = 'The room is listening.';
  }, 620);
}

function press(side) {
  if (!isStarted) {
    startExperience();
    return;
  }
  if (isFinished) return;

  const now = nowInSeconds();
  const note = closestAvailableNote(side, now);
  const timingError = note ? Math.abs(now - note.time) : Infinity;
  createBurst(side, timingError < 0.22);

  if (!note || timingError >= 0.22) {
    showFeedback('Reset Flow', 'No rush — meet the next marker.');
    return;
  }
  resolveHit(note, timingError);
}

function closestAvailableNote(side, now) {
  return scheduledNotes
    .filter((note) => note.side === side && !note.done)
    .sort((a, b) => Math.abs(a.time - now) - Math.abs(b.time - now))[0];
}

function resolveHit(note, timingError) {
  note.done = true;
  note.element?.remove();
  score += 1;
  progress.textContent = `${score} / ${NOTE_PATTERN.length}`;

  const inSync = timingError < 0.09;
  showFeedback(inSync ? 'In Sync' : 'Close', inSync ? 'Exactly where the pulse lands.' : 'Still part of the flow.', true);
  updateCourseProgress();
  if (score === NOTE_PATTERN.length) finishExperience();
}

function updateCourseProgress() {
  if (score === 8) {
    chapter.textContent = 'COURSE 01 · OPENING UP';
    room.style.background = 'radial-gradient(ellipse at 50% 68%,#394047,#191e27 43%,#11141b 75%)';
  }
  if (score === 16) {
    chapter.textContent = 'COURSE 01 · LAST TURN';
    subcopy.textContent = 'The room is bright now. Finish softly.';
  }
}

function createBurst(side, successful) {
  const laneBox = lanes[side].getBoundingClientRect();
  const color = side === 'left' ? '#c7a8ff' : '#9cebd4';
  const lane = lanes[side];

  lane.style.setProperty('--flash', color);
  lane.classList.add('flash');
  window.setTimeout(() => lane.classList.remove('flash'), 150);

  const particleCount = successful ? 13 : 5;
  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement('i');
    particle.className = 'particle';
    particle.style.left = `${laneBox.left + laneBox.width / 2}px`;
    particle.style.top = `${laneBox.top + laneBox.height * 0.82}px`;
    particle.style.setProperty('--c', side === 'left' ? '#d8c3ff' : '#b6f8e7');
    particle.style.setProperty('--x', `${(Math.random() - 0.5) * 120}px`);
    particle.style.setProperty('--y', `${-20 - Math.random() * 100}px`);
    particlesElement.append(particle);
    window.setTimeout(() => particle.remove(), 900);
  }
}

function finishExperience() {
  if (isFinished) return;

  isFinished = true;
  cancelAnimationFrame(animationFrame);
  room.classList.add('complete');
  chapter.textContent = 'COURSE COMPLETE';
  message.textContent = 'You moved with the room';
  subcopy.textContent = 'Take a breath. Press Begin again to restart.';
  startButton.textContent = 'Begin again ↵';
  startButton.classList.remove('hide');
  startButton.onclick = () => window.location.reload();
}

startButton.addEventListener('click', startExperience);
window.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  const key = event.key.toLowerCase();
  if (key === 'a') {
    event.preventDefault();
    press('left');
  }
  if (key === 'l') {
    event.preventDefault();
    press('right');
  }
  if (key === 'enter' && !isStarted) startExperience();
});
