/* Geo Quiz — Guess the Flag (Simple Version)
   - Put your flag images in /flags/
   - Update the list below to match your filenames
*/

// ====== SETTINGS ======
const QUESTIONS_PER_GAME = 10;

// ====== COUNTRY DATA ======
// IMPORTANT: the "flag" path must match your uploaded file name exactly.
const COUNTRIES = [
  { name: "Malaysia", flag: "flags/malaysia.png" },
  { name: "Singapore", flag: "flags/singapore.png" },
  { name: "Japan", flag: "flags/japan.png" },
  { name: "South Korea", flag: "flags/south-korea.png" },
  { name: "China", flag: "flags/china.png" },
  { name: "India", flag: "flags/india.png" },
  { name: "Australia", flag: "flags/australia.png" },
  { name: "New Zealand", flag: "flags/new-zealand.png" },
  { name: "United Kingdom", flag: "flags/united-kingdom.png" },
  { name: "United States", flag: "flags/united-states.png" },
  { name: "France", flag: "flags/france.png" },
  { name: "Germany", flag: "flags/germany.png" },
  { name: "Italy", flag: "flags/italy.png" },
  { name: "Spain", flag: "flags/spain.png" },
  { name: "Brazil", flag: "flags/brazil.png" },
  { name: "Canada", flag: "flags/canada.png" },
  { name: "Egypt", flag: "flags/egypt.png" },
  { name: "Saudi Arabia", flag: "flags/saudi-arabia.png" },
  { name: "Indonesia", flag: "flags/indonesia.png" },
  { name: "South Africa", flag: "flags/south-africa.png" },
];

// ====== ELEMENTS ======
const scoreEl = document.getElementById("score");
const qIndexEl = document.getElementById("qIndex");
const qTotalEl = document.getElementById("qTotal");
const flagImgEl = document.getElementById("flagImg");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

// ====== STATE ======
let score = 0;
let qIndex = 0;          // 0-based index
let usedIndices = new Set();
let currentQuestion = null; // { correctCountry, options[] }
let locked = false;

// ====== UTIL ======
function randInt(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(arr) {
  // Fisher-Yates
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickUniqueCountryIndex() {
  if (usedIndices.size >= COUNTRIES.length) usedIndices.clear();

  let idx;
  do { idx = randInt(COUNTRIES.length); }
  while (usedIndices.has(idx));

  usedIndices.add(idx);
  return idx;
}

function setFeedback(text, type = "muted") {
  feedbackEl.textContent = text;
  feedbackEl.className = `feedback ${type}`;
}

function setStats() {
  scoreEl.textContent = String(score);
  qIndexEl.textContent = String(qIndex + 1);
  qTotalEl.textContent = String(QUESTIONS_PER_GAME);
}

function clearChoices() {
  choicesEl.innerHTML = "";
}

// ====== GAME ======
function buildQuestion() {
  const correctIdx = pickUniqueCountryIndex();
  const correctCountry = COUNTRIES[correctIdx];

  // pick 3 wrong options
  const wrongs = [];
  const used = new Set([correctIdx]);

  while (wrongs.length < 3) {
    const idx = randInt(COUNTRIES.length);
    if (used.has(idx)) continue;
    used.add(idx);
    wrongs.push(COUNTRIES[idx]);
  }

  const options = shuffle([correctCountry, ...wrongs]).map(c => c.name);

  return { correctCountry, options };
}

function renderQuestion() {
  locked = false;
  nextBtn.disabled = true;
  setFeedback("Choose the correct country.", "muted");
  clearChoices();

  currentQuestion = buildQuestion();

  flagImgEl.src = currentQuestion.correctCountry.flag;
  flagImgEl.alt = `Flag of ${currentQuestion.correctCountry.name}`;

  currentQuestion.options.forEach((name) => {
    const btn = document.createElement("button");
    btn.className = "choiceBtn";
    btn.type = "button";
    btn.textContent = name;
    btn.addEventListener("click", () => onChoose(btn, name));
    choicesEl.appendChild(btn);
  });

  setStats();
}

function revealCorrectAnswer() {
  const correctName = currentQuestion.correctCountry.name;
  const buttons = choicesEl.querySelectorAll("button.choiceBtn");
  buttons.forEach(btn => {
    if (btn.textContent === correctName) btn.classList.add("correct");
  });
}

function lockChoices() {
