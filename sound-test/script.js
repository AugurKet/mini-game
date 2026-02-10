// Sound Test — Hearing Range Sweep (High -> Low)
// Uses Web Audio API. Works best with headphones.

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

const waveTypeEl = document.getElementById("waveType");
const startFreqEl = document.getElementById("startFreq");
const endFreqEl = document.getElementById("endFreq");
const durationEl = document.getElementById("duration");

const volumeEl = document.getElementById("volume");
const volLabelEl = document.getElementById("volLabel");

const freqNowEl = document.getElementById("freqNow");
const freqResultEl = document.getElementById("freqResult");
const msgEl = document.getElementById("msg");

let audioCtx = null;
let osc = null;
let gain = null;

let sweepStartTime = 0;
let sweepDuration = 0;
let fStart = 0;
let fEnd = 0;

let rafId = null;
let running = false;

function setMsg(text){ msgEl.textContent = text; }

function ensureAudio(){
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function setUIRunning(isRunning){
  running = isRunning;
  startBtn.disabled = isRunning;
  stopBtn.disabled = !isRunning;
  startFreqEl.disabled = isRunning;
  endFreqEl.disabled = isRunning;
  durationEl.disabled = isRunning;
  waveTypeEl.disabled = isRunning;
}

function currentFreqAt(t){
  // Linear interpolation between fStart and fEnd over duration
  const p = Math.min(1, Math.max(0, t / sweepDuration));
  return fStart + (fEnd - fStart) * p;
}

function tick(){
  if (!running || !audioCtx) return;

  const t = audioCtx.currentTime - sweepStartTime;
  const f = currentFreqAt(t);

  freqNowEl.textContent = Math.round(f);

  if (t >= sweepDuration){
    // reached the end naturally
    finishTest(fEnd, true);
    return;
  }

  rafId = requestAnimationFrame(tick);
}

function startTest(){
  const s = Number(startFreqEl.value);
  const e = Number(endFreqEl.value);
  const d = Number(durationEl.value);

  if (!Number.isFinite(s) || !Number.isFinite(e) || !Number.isFinite(d)){
    setMsg("Please enter valid numbers.");
    return;
  }
  if (d <= 0){
    setMsg("Duration must be > 0.");
    return;
  }

  ensureAudio();

  // Some browsers require user gesture to resume audio
  if (audioCtx.state === "suspended") audioCtx.resume();

  // Build audio graph
  osc = audioCtx.createOscillator();
  gain = audioCtx.createGain();

  osc.type = waveTypeEl.value;

  const vol = Number(volumeEl.value) / 100;
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  // Sweep setup
  fStart = s;
  fEnd = e;
  sweepDuration = d;
  sweepStartTime = audioCtx.currentTime;

  // Smooth frequency ramp
  osc.frequency.setValueAtTime(fStart, sweepStartTime);
  osc.frequency.linearRampToValueAtTime(fEnd, sweepStartTime + sweepDuration);

  osc.start();

  setUIRunning(true);
  setMsg("Playing… press Stop when you can’t hear it.");
  freqResultEl.textContent = "—";

  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
}

function finishTest(resultFreq, endedNaturally){
  // Stop audio safely
  if (osc){
    try { osc.stop(); } catch {}
    try { osc.disconnect(); } catch {}
    osc = null;
  }
  if (gain){
    try { gain.disconnect(); } catch {}
    gain = null;
  }

  setUIRunning(false);
  cancelAnimationFrame(rafId);
  rafId = null;

  freqNowEl.textContent = "—";
  freqResultEl.textContent = Math.round(resultFreq);

  if (endedNaturally){
    setMsg("Sweep finished. Your result is the end frequency.");
  } else {
    setMsg("Stopped. Result saved.");
  }
}

function stopTest(){
  if (!running || !audioCtx) return;

  const t = audioCtx.currentTime - sweepStartTime;
  const resultFreq = currentFreqAt(t);
  finishTest(resultFreq, false);
}

function reset(){
  if (running) stopTest();
  freqNowEl.textContent = "—";
  freqResultEl.textContent = "—";
  setMsg("Tap Start to begin.");
}

volumeEl.addEventListener("input", () => {
  volLabelEl.textContent = volumeEl.value;
  if (gain && audioCtx){
    const vol = Number(volumeEl.value) / 100;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  }
});

startBtn.addEventListener("click", startTest);
stopBtn.addEventListener("click", stopTest);
resetBtn.addEventListener("click", reset);

// init label
volLabelEl.textContent = volumeEl.value;
setMsg("Tap Start to begin.");
