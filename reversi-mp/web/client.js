// ✅ Put your deployed server URL here (example):
// const SERVER_URL = "https://your-server.onrender.com";
const SERVER_URL = "http://localhost:3000";

const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });

// UI refs
const connBadge = document.getElementById("connBadge");
const btnCreate = document.getElementById("btnCreate");
const btnJoin = document.getElementById("btnJoin");
const btnLeave = document.getElementById("btnLeave");
const roomInput = document.getElementById("roomInput");
const roomCodeEl = document.getElementById("roomCode");
const yourColorEl = document.getElementById("yourColor");
const turnEl = document.getElementById("turn");
const scoreEl = document.getElementById("score");
const msgEl = document.getElementById("msg");
const boardEl = document.getElementById("board");

let roomCode = null;
let yourColor = null;
let state = null;

// --- Connection badge
socket.on("connect", () => {
  connBadge.textContent = "Connected";
  connBadge.style.borderColor = "rgba(45,212,191,0.45)";
});
socket.on("disconnect", () => {
  connBadge.textContent = "Disconnected";
  connBadge.style.borderColor = "rgba(251,113,133,0.45)";
});

// --- Server events
socket.on("errorMessage", (text) => {
  msg(text, true);
});

socket.on("roomCreated", ({ code, yourColor: yc, state: st }) => {
  roomCode = code;
  yourColor = yc;
  state = st;
  roomCodeEl.textContent = roomCode;
  yourColorEl.textContent = labelColor(yourColor);
  btnLeave.disabled = false;
  msg(`Room created: ${roomCode}. Share it with your friend.`);
  render();
});

socket.on("roomJoined", ({ code, yourColor: yc, state: st }) => {
  roomCode = code;
  yourColor = yc;
  state = st;
  roomCodeEl.textContent = roomCode;
  yourColorEl.textContent = labelColor(yourColor);
  btnLeave.disabled = false;
  msg(`Joined room: ${roomCode}.`);
  render();
});

socket.on("stateUpdated", ({ state: st }) => {
  state = st;
  render();
});

// --- Buttons
btnCreate.addEventListener("click", () => {
  socket.emit("createRoom");
});

btnJoin.addEventListener("click", () => {
  const code = (roomInput.value || "").trim().toUpperCase();
  if (!code) return msg("Enter a room code.", true);
  socket.emit("joinRoom", { code });
});

btnLeave.addEventListener("click", () => {
  if (!roomCode) return;
  socket.emit("leaveRoom", { code: roomCode });
  resetLocal("You left the room.");
});

// --- Helpers
function labelColor(c) {
  if (c === "B") return "Black";
  if (c === "W") return "White";
  return "-";
}

function msg(text, isError = false) {
  msgEl.textContent = text;
  msgEl.style.borderColor = isError ? "rgba(251,113,133,0.55)" : "rgba(38,52,85,0.8)";
}

function resetLocal(message) {
  roomCode = null;
  yourColor = null;
  state = null;
  roomCodeEl.textContent = "-";
  yourColorEl.textContent = "-";
  turnEl.textContent = "-";
  scoreEl.textContent = "-";
  btnLeave.disabled = true;
  msg(message || "Enter or create a room to start.");
  renderEmptyBoard();
}

// --- Rendering
function render() {
  if (!state) {
    renderEmptyBoard();
    return;
  }

  turnEl.textContent = labelColor(state.turn);
  const B = state.score?.B ?? 0;
  const W = state.score?.W ?? 0;
  scoreEl.textContent = `Black ${B} : ${W} White`;

  msg(state.message || "");

  renderBoard(state);
}

function renderEmptyBoard() {
  boardEl.innerHTML = "";
  for (let i = 0; i < 64; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    boardEl.appendChild(cell);
  }
}

function renderBoard(st) {
  boardEl.innerHTML = "";

  const hints = new Set((st.validMoves || []).map(m => `${m.r},${m.c}`));
  const last = st.lastMove ? `${st.lastMove.r},${st.lastMove.c}` : null;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const key = `${r},${c}`;

      // highlight legal moves for the player whose turn it is (only if it's your turn)
      if (st.status === "playing" && roomCode && yourColor && st.turn === yourColor && hints.has(key)) {
        cell.classList.add("hint");
      }

      if (last === key) cell.classList.add("lastMove");

      const v = st.board[r][c];
      if (v === "B" || v === "W") {
        const p = document.createElement("div");
        p.className = "piece " + (v === "B" ? "black" : "white");
        cell.appendChild(p);
      }

      cell.addEventListener("click", () => onCellClick(r, c));
      boardEl.appendChild(cell);
    }
  }
}

function onCellClick(r, c) {
  if (!roomCode || !state) return;
  if (state.status !== "playing") return;
  if (!yourColor) return;

  // client-side guard (server still validates)
  if (state.turn !== yourColor) return msg("Not your turn.", true);

  socket.emit("makeMove", { code: roomCode, r, c });
}
