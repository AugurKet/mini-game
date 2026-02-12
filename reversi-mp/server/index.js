import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors({ origin: true }));
app.get("/", (_, res) => res.send("Reversi multiplayer server is running."));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, methods: ["GET", "POST"] }
});

/** --------------------------
 * Game / Rules (Server-Authoritative)
 * -------------------------- */

const SIZE = 8;
const rooms = new Map(); // code -> room

function makeRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid confusing chars
  let code = "";
  for (let i = 0; i < 5; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

function createInitialState() {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  // Standard Reversi initial setup (center 4)
  board[3][3] = "W";
  board[3][4] = "B";
  board[4][3] = "B";
  board[4][4] = "W";

  const state = {
    board,
    turn: "B",
    status: "waiting", // waiting | playing | ended
    winner: null,      // "B" | "W" | "D" | null
    lastMove: null,    // {r,c,by} | null
    message: "Waiting for opponent..."
  };
  return state;
}

function inBounds(r, c) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

function opponent(color) {
  return color === "B" ? "W" : "B";
}

function countPieces(board) {
  let B = 0, W = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === "B") B++;
      else if (board[r][c] === "W") W++;
    }
  }
  return { B, W };
}

function getFlips(board, color, r, c) {
  // returns list of positions to flip if move is legal, else []
  if (!inBounds(r, c) || board[r][c] !== null) return [];
  const opp = opponent(color);
  const flips = [];

  for (const [dr, dc] of DIRS) {
    let rr = r + dr, cc = c + dc;
    const line = [];
    while (inBounds(rr, cc) && board[rr][cc] === opp) {
      line.push([rr, cc]);
      rr += dr;
      cc += dc;
    }
    if (line.length > 0 && inBounds(rr, cc) && board[rr][cc] === color) {
      flips.push(...line);
    }
  }
  return flips;
}

function getValidMoves(board, color) {
  const moves = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const flips = getFlips(board, color, r, c);
      if (flips.length > 0) moves.push({ r, c });
    }
  }
  return moves;
}

function cloneBoard(board) {
  return board.map(row => row.slice());
}

function applyMove(state, color, r, c) {
  const board = cloneBoard(state.board);
  const flips = getFlips(board, color, r, c);
  if (flips.length === 0) return { ok: false, reason: "Illegal move." };

  board[r][c] = color;
  for (const [fr, fc] of flips) board[fr][fc] = color;

  // Determine next turn (handle pass rules)
  let nextTurn = opponent(color);
  const nextMoves = getValidMoves(board, nextTurn);
  const curMoves = getValidMoves(board, color);

  let status = "playing";
  let winner = null;
  let message = "";

  if (nextMoves.length === 0 && curMoves.length === 0) {
    // Game ended
    status = "ended";
    const { B, W } = countPieces(board);
    if (B > W) winner = "B";
    else if (W > B) winner = "W";
    else winner = "D";
    message = `Game over. ${winner === "D" ? "Draw" : (winner === "B" ? "Black" : "White") + " wins"} (${B}-${W}).`;
  } else if (nextMoves.length === 0) {
    // Opponent must pass, current player goes again
    nextTurn = color;
    message = `${nextTurn === "B" ? "Black" : "White"} plays again (opponent has no moves).`;
  } else {
    message = `${nextTurn === "B" ? "Black" : "White"}'s turn.`;
  }

  const newState = {
    ...state,
    board,
    turn: nextTurn,
    status,
    winner,
    lastMove: { r, c, by: color },
    message
  };

  return { ok: true, state: newState };
}

function publicState(room) {
  const { B, W } = countPieces(room.state.board);
  const valid = getValidMoves(room.state.board, room.state.turn);
  return {
    ...room.state,
    score: { B, W },
    validMoves: valid // for highlighting on client
  };
}

/** --------------------------
 * Socket.IO
 * -------------------------- */

io.on("connection", (socket) => {
  socket.on("createRoom", () => {
    let code;
    do { code = makeRoomCode(); } while (rooms.has(code));

    const room = {
      code,
      players: {
        B: socket.id,
        W: null
      },
      state: createInitialState()
    };

    rooms.set(code, room);
    socket.join(code);

    socket.emit("roomCreated", {
      code,
      yourColor: "B",
      state: publicState(room)
    });

    // Mark waiting
    room.state.status = "waiting";
    room.state.message = "Waiting for opponent...";
  });

  socket.on("joinRoom", ({ code }) => {
    const room = rooms.get(code);
    if (!room) {
      socket.emit("errorMessage", "Room not found.");
      return;
    }
    if (room.players.W && room.players.B) {
      socket.emit("errorMessage", "Room is full.");
      return;
    }

    // If creator disconnected and left B empty, fill B first; else fill W.
    if (!room.players.B) room.players.B = socket.id;
    else if (!room.players.W) room.players.W = socket.id;

    socket.join(code);

    // Start game if both players present
    if (room.players.B && room.players.W) {
      room.state.status = "playing";
      room.state.turn = "B";
      room.state.message = "Black's turn.";
      io.to(code).emit("stateUpdated", { state: publicState(room) });

      // Notify each player their color
      io.to(room.players.B).emit("roomJoined", { code, yourColor: "B", state: publicState(room) });
      io.to(room.players.W).emit("roomJoined", { code, yourColor: "W", state: publicState(room) });
    } else {
      // Only one player in room
      socket.emit("roomJoined", {
        code,
        yourColor: room.players.B === socket.id ? "B" : "W",
        state: publicState(room)
      });
      io.to(code).emit("stateUpdated", { state: publicState(room) });
    }
  });

  socket.on("makeMove", ({ code, r, c }) => {
    const room = rooms.get(code);
    if (!room) {
      socket.emit("errorMessage", "Room not found.");
      return;
    }
    if (room.state.status !== "playing") {
      socket.emit("errorMessage", "Game is not in playing state.");
      return;
    }

    const color =
      room.players.B === socket.id ? "B" :
      room.players.W === socket.id ? "W" : null;

    if (!color) {
      socket.emit("errorMessage", "You are not a player in this room.");
      return;
    }
    if (room.state.turn !== color) {
      socket.emit("errorMessage", "Not your turn.");
      return;
    }

    const result = applyMove(room.state, color, r, c);
    if (!result.ok) {
      socket.emit("errorMessage", result.reason);
      return;
    }

    room.state = result.state;
    io.to(code).emit("stateUpdated", { state: publicState(room) });
  });

  socket.on("leaveRoom", ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;

    if (room.players.B === socket.id) room.players.B = null;
    if (room.players.W === socket.id) room.players.W = null;

    socket.leave(code);

    // If nobody left, delete room
    if (!room.players.B && !room.players.W) {
      rooms.delete(code);
      return;
    }

    // Otherwise pause game
    room.state.status = "waiting";
    room.state.message = "A player left. Waiting for opponent...";
    io.to(code).emit("stateUpdated", { state: publicState(room) });
  });

  socket.on("disconnect", () => {
    // Clean up any rooms this socket was in
    for (const [code, room] of rooms.entries()) {
      let changed = false;
      if (room.players.B === socket.id) { room.players.B = null; changed = true; }
      if (room.players.W === socket.id) { room.players.W = null; changed = true; }

      if (changed) {
        if (!room.players.B && !room.players.W) {
          rooms.delete(code);
        } else {
          room.state.status = "waiting";
          room.state.message = "A player disconnected. Waiting for opponent...";
          io.to(code).emit("stateUpdated", { state: publicState(room) });
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on :${PORT}`);
});
