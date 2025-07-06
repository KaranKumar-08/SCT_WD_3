document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#0ff0fc" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { 
                enable: true, 
                distance: 150, 
                color: "#0ff0fc", 
                opacity: 0.2, 
                width: 1 
            },
            move: { 
                enable: true, 
                speed: 2, 
                direction: "none", 
                random: true, 
                straight: false, 
                out_mode: "out" 
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" }
            }
        }
    });

    // Game elements
    const board = document.getElementById('board');
    const cells = [];
    const status = document.getElementById('status');
    const playerX = document.getElementById('playerX');
    const playerO = document.getElementById('playerO');
    const scoreX = document.getElementById('scoreX');
    const scoreO = document.getElementById('scoreO');
    const resetBtn = document.getElementById('resetBtn');
    const modeBtn = document.getElementById('modeBtn');
    const themeBtn = document.getElementById('themeBtn');
    const historyList = document.getElementById('historyList');
    const historyCount = document.querySelector('.history-count');

    // Game state
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let vsComputer = false;
    let scores = { X: 0, O: 0 };
    let gameHistory = [];
    let currentTheme = 0;
    const themes = [
        { name: "Neon Blue", color: "#0ff0fc" },
        { name: "Neon Pink", color: "#ff2a6d" },
        { name: "Neon Purple", color: "#d300c5" },
        { name: "Neon Green", color: "#00ff88" }
    ];

    // Winning conditions
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    // Initialize the game board
    function initializeBoard() {
        board.innerHTML = '';
        cells.length = 0;
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
            cells.push(cell);
        }
        
        updatePlayerDisplay();
    }

    // Handle cell click
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        // If cell already filled or game not active, ignore
        if (gameState[clickedCellIndex] !== '' || !gameActive) {
            return;
        }
        
        // Make the move
        makeMove(clickedCell, clickedCellIndex, currentPlayer);
        
        // Check for win or draw
        checkResult();
        
        // If playing against computer and game still active
        if (vsComputer && gameActive && currentPlayer === 'O') {
            setTimeout(computerMove, 500);
        }
    }

    // Make a move
    function makeMove(cell, index, player) {
        gameState[index] = player;
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        
        // Switch player
        currentPlayer = player === 'X' ? 'O' : 'X';
        updatePlayerDisplay();
    }

    // Computer's move (simple AI)
    function computerMove() {
        let availableCells = [];
        
        // Find all empty cells
        gameState.forEach((cell, index) => {
            if (cell === '') {
                availableCells.push(index);
            }
        });
        
        if (availableCells.length > 0) {
            // Try to win if possible
            for (let condition of winningConditions) {
                let [a, b, c] = condition;
                if ((gameState[a] === 'O' && gameState[b] === 'O' && gameState[c] === '') ||
                    (gameState[a] === 'O' && gameState[c] === 'O' && gameState[b] === '') ||
                    (gameState[b] === 'O' && gameState[c] === 'O' && gameState[a] === '')) {
                    
                    let winningMove;
                    if (gameState[a] === '') winningMove = a;
                    else if (gameState[b] === '') winningMove = b;
                    else winningMove = c;
                    
                    if (availableCells.includes(winningMove)) {
                        makeMove(cells[winningMove], winningMove, 'O');
                        checkResult();
                        return;
                    }
                }
            }
            
            // Block player from winning
            for (let condition of winningConditions) {
                let [a, b, c] = condition;
                if ((gameState[a] === 'X' && gameState[b] === 'X' && gameState[c] === '') ||
                    (gameState[a] === 'X' && gameState[c] === 'X' && gameState[b] === '') ||
                    (gameState[b] === 'X' && gameState[c] === 'X' && gameState[a] === '')) {
                    
                    let blockingMove;
                    if (gameState[a] === '') blockingMove = a;
                    else if (gameState[b] === '') blockingMove = b;
                    else blockingMove = c;
                    
                    if (availableCells.includes(blockingMove)) {
                        makeMove(cells[blockingMove], blockingMove, 'O');
                        checkResult();
                        return;
                    }
                }
            }
            
            // Take center if available
            if (availableCells.includes(4)) {
                makeMove(cells[4], 4, 'O');
                checkResult();
                return;
            }
            
            // Take a corner if available
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(corner => availableCells.includes(corner));
            if (availableCorners.length > 0) {
                const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
                makeMove(cells[randomCorner], randomCorner, 'O');
                checkResult();
                return;
            }
            
            // Take any available cell
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            const randomCell = availableCells[randomIndex];
            makeMove(cells[randomCell], randomCell, 'O');
            checkResult();
        }
    }

    // Check game result
    function checkResult() {
        let roundWon = false;
        
        // Check all winning conditions
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            
            if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
                continue;
            }
            
            if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
                roundWon = true;
                
                // Highlight winning cells
                cells[a].classList.add('winner');
                cells[b].classList.add('winner');
                cells[c].classList.add('winner');
                break;
            }
        }
        
        // If won
        if (roundWon) {
            const winner = currentPlayer === 'X' ? 'O' : 'X';
            status.textContent = `Player ${winner} wins!`;
            gameActive = false;
            
            // Update scores
            scores[winner]++;
            if (winner === 'X') {
                scoreX.textContent = scores.X;
            } else {
                scoreO.textContent = scores.O;
            }
            
            // Add to history
            addToHistory(`Player ${winner} won`);
            return;
        }
        
        // If draw
        if (!gameState.includes('')) {
            status.textContent = "Game ended in a draw!";
            gameActive = false;
            addToHistory("Game was a draw");
            return;
        }
        
        // Continue game
        status.textContent = `Player ${currentPlayer}'s turn`;
    }

    // Update player display
    function updatePlayerDisplay() {
        if (currentPlayer === 'X') {
            playerX.classList.add('active');
            playerO.classList.remove('active');
        } else {
            playerX.classList.remove('active');
            playerO.classList.add('active');
        }
    }

    // Reset game
    function resetGame() {
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        status.textContent = `Player ${currentPlayer}'s turn`;
        initializeBoard();
    }

    // Add game result to history
    function addToHistory(result) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const historyItem = document.createElement('li');
        
        historyItem.innerHTML = `<span>${timeString}</span><span>${result}</span>`;
        
        if (historyList.firstChild) {
            historyList.insertBefore(historyItem, historyList.firstChild);
        } else {
            historyList.appendChild(historyItem);
        }
        
        gameHistory.unshift({ time: timeString, result: result });
        historyCount.textContent = gameHistory.length;
    }

    // Toggle game mode
    function toggleMode() {
        vsComputer = !vsComputer;
        if (vsComputer) {
            modeBtn.innerHTML = '<span class="btn-icon">👤</span><span class="btn-text">VS Player</span>';
            status.textContent = "VS Computer mode";
        } else {
            modeBtn.innerHTML = '<span class="btn-icon">🤖</span><span class="btn-text">VS Computer</span>';
            status.textContent = "VS Player mode";
        }
        resetGame();
    }

    // Change theme
    function changeTheme() {
        currentTheme = (currentTheme + 1) % themes.length;
        const theme = themes[currentTheme];
        
        // Update theme button
        themeBtn.innerHTML = `<span class="btn-icon">🎨</span><span class="btn-text">${theme.name}</span>`;
        
        // Update root variables
        document.documentElement.style.setProperty('--neon-blue', theme.color);
        
        // Update particles color
        if (window.pJSDom && window.pJSDom.length > 0) {
            window.pJSDom[0].pJS.particles.color.value = theme.color;
            window.pJSDom[0].pJS.particles.line_linked.color = theme.color;
            window.pJSDom[0].pJS.fn.particlesRefresh();
        }
    }

    // Event listeners
    resetBtn.addEventListener('click', resetGame);
    modeBtn.addEventListener('click', toggleMode);
    themeBtn.addEventListener('click', changeTheme);

    // Initialize the game
    initializeBoard();
});