const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");

let board = Array(9).fill("");
let currentPlayer = "X";
let isGameOver = false;
let gameMode = null; // 'PVP' or 'AI'

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6]             // diagonals
];

function renderBoard() {
  boardEl.innerHTML = "";
  board.forEach((val, i) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = val;
    cell.onclick = () => handleMove(i);
    boardEl.appendChild(cell);
  });
}

function handleMove(index) {
  if (board[index] || isGameOver || gameMode === null) return;

  board[index] = currentPlayer;
  renderBoard();

  if (checkWinner(currentPlayer)) {
    statusEl.textContent = `Player ${currentPlayer} wins!`;
    isGameOver = true;
    return;
  }

  if (!board.includes("")) {
    statusEl.textContent = "It's a draw!";
    isGameOver = true;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusEl.textContent = `Player ${currentPlayer}'s turn`;

  if (gameMode === "AI" && currentPlayer === "O" && !isGameOver) {
    setTimeout(computerMove, 500);
  }
}

function computerMove() {
  const emptyIndexes = board.map((val, i) => val === "" ? i : null).filter(i => i !== null);
  const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  handleMove(randomIndex);
}

function checkWinner(player) {
  return winningCombos.some(combo =>
    combo.every(index => board[index] === player)
  );
}

function restartGame() {
  board = Array(9).fill("");
  currentPlayer = "X";
  isGameOver = false;
  renderBoard();

  if (gameMode === null) {
    statusEl.textContent = "Choose a mode";
  } else {
    statusEl.textContent = `Player ${currentPlayer}'s turn`;
  }
}

function setMode(mode) {
  gameMode = mode;
  restartGame();
}

renderBoard();

