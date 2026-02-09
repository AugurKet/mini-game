/* Flag Rush — Timed (15s), auto-next, STOP on time, popup results, store best score */

const TIME_LIMIT_SECONDS = 15;
const BEST_KEY = "flagrush_best_correct";

const COUNTRIES = [
  { name: "Malaysia", flag: "flags/malaysia.png" },
  { name: "Singapore", flag: "flags/singapore.png" },
  { name: "Japan", flag: "flags/japan.png" },
  { name: "South Korea", flag: "flags/southkorea.png" },
  { name: "China", flag: "flags/china.png" },
  { name: "India", flag: "flags/india.png" },
  { name: "Australia", flag: "flags/australia.png" },
  { name: "New Zealand", flag: "flags/newzealand.png" },
  { name: "United Kingdom", flag: "flags/unitedkingdom.png" },
  { name: "United States", flag: "flags/unitedstates.png" },
  { name: "France", flag: "flags/france.png" },
  { name: "Germany", flag: "flags/germany.png" },
  { name: "Italy", flag: "flags/italy.png" },
  { name: "Spain", flag: "flags/spain.png" },
  { name: "Brazil", flag: "flags/brazil.png" },
  { name: "Canada", flag: "flags/canada.png" },
  { name: "Egypt", flag: "flags/egypt.png" },
  { name: "Saudi Arabia", flag: "flags/saudiarabia.png" },
  { name: "Indonesia", flag: "flags/indonesia.png" },
  { name: "South Africa", flag: "flags/southafrica.png" },
];

// Elements
const scoreEl = document.getElementById("score");
const attemptsEl = document.getElementById("attempts");
const timeLeftEl = document.getElementById("timeLeft");
const bestScoreEl = document.getElementById("bestScore");
const flagImgEl = document.getElementById("flagImg");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

// Modal
const modalEl = document.getElementById("resultModal");
const resultTextEl = document.getElementById("resultText");
const playAgainBtn = document.getElementById("playAgainBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

// State
let score = 0;
let attempts = 0;
let current = null;
let locked = false;

let timerId = null;
let pendingNextId = null;

let gameActive = false;
let timeLeft = TIME_LIMIT_SECONDS;

function randInt(max){ return Math.floor(Math.random() * max); }
function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getBest(){
  const v = Number(localStorage.getItem(BEST_KEY) || "0");
  return Number.isFinite(v) ? v : 0;
}
function setBest(v){
  localStorage.setItem(BEST_KEY, String(v));
}

function setFeedback(text, type="muted"){
  feedbackEl.textContent = text;
  feedbackEl.className = `feedback ${type}`;
}

function updateHUD(){
  scoreEl.textContent = String(score);
  attemptsEl.textContent = String(attempts);
  timeLeftEl.textContent = String(timeLeft);
  bestScoreEl.textContent = String(getBest());
}

function clearChoices(){ choicesEl.innerHTML = ""; }

function buildQuestion(){
  const correctIdx = randInt(COUNTRIES.length);
  const correctCountry = COUNTRIES[correctIdx];

  const wrongs = [];
  const used = new Set([correctIdx]);

  while (wrongs.length < 3){
    const idx = randInt(COUNTRIES.length);
    if (used.has(idx)) continue;
    used.add(idx);
    wrongs.push(COUNTRIES[idx]);
  }

  const options = shuffle([correctCountry, ...wrongs]).map(c => c.name);
  return { correctCountry, options };
}

function renderQuestion(){
  locked = false;
  clearChoices();

  current = buildQuestion();
  flagImgEl.src = current.correctCountry.flag;
  flagImgEl.alt = `Flag of ${current.correctCountry.name}`;

  current.options.forEach(name => {
    const btn = document.createElement("button");
    btn.className = "choiceBtn";
    btn.type = "button";
    btn.textContent = name;
    btn.disabled = !gameActive;

    btn.addEventListener("click", () => handleChoice(btn, name));
    choicesEl.appendChild(btn);
  });
}

function lockButtons(){
  const btns = choicesEl.querySelectorAll("button.choiceBtn");
  btns.forEach(b => (b.disabled = true));
}

function highlightCorrect(){
  const correctName = current.correctCountry.name;
  const btns = choicesEl.querySelectorAll("button.choiceBtn");
  btns.forEach(b => {
    if (b.textContent === correctName) b.classList.add("correct");
  });
}

function clearPendingNext(){
  if (pendingNextId){
    window.clearTimeout(pendingNextId);
    pendingNextId = null;
  }
}

function showModal(text){
  resultTextEl.textContent = text;
  modalEl.classList.remove("hidden");
}

function hideModal(){
  modalEl.classList.add("hidden");
}

function startGame(){
  if (gameActive) return;

  if (COUNTRIES.length < 4){
    setFeedback("Please add at least 4 countries in script.js.", "bad");
    return;
  }

  hideModal();
  clearPendingNext();

  score = 0;
  attempts = 0;
  timeLeft = TIME_LIMIT_SECONDS;
  gameActive = true;
  locked = false;

  startBtn.disabled = true;
  setFeedback("Go!", "muted");
  updateHUD();
  renderQuestion();

  if (timerId) window.clearInterval(timerId);
  timerId = window.setInterval(() => {
    timeLeft -= 1;
    updateHUD();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame(){
  if (!gameActive) return;

  gameActive = false;
  locked = true;
  startBtn.disabled = false;

  clearPendingNext();

  if (timerId){
    window.clearInterval(timerId);
    timerId = null;
  }

  lockButtons();

  const best = getBest();
  if (score > best) setBest(score);

  const accuracy = attempts === 0 ? 0 : Math.round((score / attempts) * 100);
  updateHUD();

  showModal(`Correct: ${score}\nAttempts: ${attempts}\nAccuracy: ${accuracy}%\nBest: ${getBest()}`);
  setFeedback("Game ended. See your result above.", "muted");
}

function handleChoice(btn, chosen){
  if (!gameActive || locked) return;
  locked = true;
  attempts += 1;

  const correctName = current.correctCountry.name;
  const ok = chosen === correctName;

  if (ok){
    score += 1;
    btn.classList.add("correct");
    setFeedback("Correct ✅", "good");
  } else {
    btn.classList.add("wrong");
    setFeedback(`Wrong ❌  ${correctName}`, "bad");
    highlightCorrect();
  }

  updateHUD();
  lockButtons();

  clearPendingNext();
  pendingNextId = window.setTimeout(() => {
    pendingNextId = null;
    if (!gameActive) return;
    setFeedback("Go!", "muted");
    renderQuestion();
  }, 280);
}

function restartGame(){
  if (timerId){
    window.clearInterval(timerId);
    timerId = null;
  }
  clearPendingNext();
  hideModal();

  gameActive = false;
  locked = false;

  score = 0;
  attempts = 0;
  timeLeft = TIME_LIMIT_SECONDS;

  startBtn.disabled = false;
  updateHUD();
  setFeedback("Tap Start to begin.", "muted");

  renderQuestion(); // shows a flag, but buttons disabled until start
}

// Events
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
playAgainBtn.addEventListener("click", startGame);
closeModalBtn.addEventListener("click", hideModal);

// Init
(function init(){
  updateHUD();
  setFeedback("Tap Start to begin.", "muted");
  renderQuestion();
})();
