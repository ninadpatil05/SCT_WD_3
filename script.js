document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const statusMessage = document.getElementById('status-message');
    const subMessage = document.getElementById('sub-message');
    const restartButton = document.getElementById('restart-button');
    const playerVsPlayerBtn = document.getElementById('player-vs-player');
    const playerVsComputerBtn = document.getElementById('player-vs-computer');
    const difficultyEasyBtn = document.getElementById('difficulty-easy');
    const difficultyHardBtn = document.getElementById('difficulty-hard');
    const chooseXBtn = document.getElementById('choose-x');
    const chooseOBtn = document.getElementById('choose-o');
    const mainMenuButton = document.getElementById('main-menu-button'); // Corrected from back-from-game

    // Back buttons
    const backFromDifficultyBtn = document.getElementById('back-from-difficulty');
    const backFromChoiceBtn = document.getElementById('back-from-choice');

    // UI containers
    const gameModeSelection = document.getElementById('game-mode-selection');
    const difficultySelection = document.getElementById('difficulty-selection');
    const playerChoiceContainer = document.getElementById('player-choice-container');
    const gameContainer = document.getElementById('game-container');

    const scoreX = document.querySelector('#score-x .score');
    const scoreO = document.querySelector('#score-o .score');
    const turnIndicator = document.getElementById('turn-indicator');

    const moveSound = document.getElementById('move-sound');
    const winSound = document.getElementById('win-sound');
    const drawSound = document.getElementById('draw-sound');

    let currentPlayer = 'X';
    let playerSymbol = 'X';
    let computerSymbol = 'O';
    let gameBoard = ['', '', '', '', '', '', '', '', ''];
    let isGameActive = true;
    let isPlayerVsComputer = false;
    let difficultyLevel = 'easy';
    let scores = { X: 0, O: 0 };

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const messages = {
        win: (player) => `Player ${player} wins!`,
        youWin: 'You win!',
        youLose: 'You lose!',
        draw: 'It\'s a draw!',
        playerTurn: (player) => `Player ${player}'s turn`,
        yourTurn: 'Your turn',
        computerTurn: 'The computer\'s turn',
        winQuote: 'Awesome! You\'re a pro!',
        loseQuote: 'Don\'t give up! You\'ll get it next time!',
        drawQuote: 'A worthy opponent!',
    };

    const playSound = (sound) => {
        if (sound) {
            sound.currentTime = 0;
            sound.play();
        }
    };

    const updateScores = (winner) => {
        if (winner) {
            scores[winner]++;
            scoreX.textContent = scores.X;
            scoreO.textContent = scores.O;
        }
    };
    
    const updateTurnIndicator = () => {
        if (isGameActive) {
            turnIndicator.textContent = `Turn: ${currentPlayer}`;
        } else {
            turnIndicator.textContent = '';
        }
    };

    const resetState = () => {
        gameBoard = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        currentPlayer = 'X';
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('winning-cell');
        });
        subMessage.textContent = '';
        updateTurnIndicator();
    };
    
    const resetGame = () => {
        scores.X = 0;
        scores.O = 0;
        scoreX.textContent = scores.X;
        scoreO.textContent = scores.O;
        resetState();
    };

    const startGame = () => {
        gameModeSelection.classList.add('hidden');
        difficultySelection.classList.add('hidden');
        playerChoiceContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        resetState();
        
        if (isPlayerVsComputer) {
            statusMessage.textContent = (playerSymbol === 'X') ? messages.yourTurn : messages.computerTurn;
            if (playerSymbol === 'O') {
                currentPlayer = 'X';
                setTimeout(handleComputerMove, 500);
            }
        } else {
            statusMessage.textContent = messages.playerTurn('X');
        }
        updateTurnIndicator();
    };

    const handlePlayerMove = (cell, index) => {
        gameBoard[index] = currentPlayer;
        cell.textContent = currentPlayer;
        playSound(moveSound);
        
        const winningCombination = checkWin(gameBoard, currentPlayer);

        if (winningCombination) {
            endGame(currentPlayer, winningCombination);
            return;
        }

        if (!gameBoard.includes('')) {
            endGame(null); // Draw
            return;
        }
        
        currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
        
        if (isPlayerVsComputer) {
            statusMessage.textContent = (currentPlayer === playerSymbol) ? messages.yourTurn : messages.computerTurn;
        } else {
            statusMessage.textContent = messages.playerTurn(currentPlayer);
        }
        updateTurnIndicator();
        
        if (isGameActive && isPlayerVsComputer && currentPlayer !== playerSymbol) {
            setTimeout(handleComputerMove, 500);
        }
    };

    const handleCellClick = (e) => {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

        if (gameBoard[clickedCellIndex] !== '' || !isGameActive) {
            return;
        }
        
        if (isPlayerVsComputer && currentPlayer !== playerSymbol) {
            return;
        }

        handlePlayerMove(clickedCell, clickedCellIndex);
    };

    const checkWin = (board, player) => {
        for (const condition of winningConditions) {
            if (board[condition[0]] === player && board[condition[1]] === player && board[condition[2]] === player) {
                return condition;
            }
        }
        return null;
    };

    const endGame = (winner, winningCombination = null) => {
        isGameActive = false;
        updateTurnIndicator();
        if (winner) {
            updateScores(winner);
            playSound(winSound);
            if (isPlayerVsComputer && winner === playerSymbol) {
                statusMessage.textContent = messages.youWin;
                subMessage.textContent = messages.winQuote;
            } else if (isPlayerVsComputer && winner === computerSymbol) {
                statusMessage.textContent = messages.youLose;
                subMessage.textContent = messages.loseQuote;
            } else {
                statusMessage.textContent = messages.win(winner);
                subMessage.textContent = messages.winQuote;
            }
            highlightWinningCells(winningCombination);
        } else {
            playSound(drawSound);
            statusMessage.textContent = messages.draw;
            subMessage.textContent = messages.drawQuote;
        }
    };

    const highlightWinningCells = (winningCombination) => {
        winningCombination.forEach(index => {
            cells[index].classList.add('winning-cell');
        });
    };
    
    const handleComputerMove = () => {
        if (!isGameActive || currentPlayer === playerSymbol) return;

        let moveIndex;
        if (difficultyLevel === 'easy') {
            moveIndex = getEasyMove();
        } else {
            moveIndex = minimax(gameBoard, computerSymbol).index;
        }

        if (moveIndex !== undefined) {
             handlePlayerMove(cells[moveIndex], moveIndex);
        }
    };

    const getEasyMove = () => {
        const availableCells = gameBoard
            .map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null);
        
        if (availableCells.length > 0) {
            return availableCells[Math.floor(Math.random() * availableCells.length)];
        }
        return undefined;
    };
    
    const minimax = (newBoard, player) => {
        const availSpots = newBoard.map((val, i) => (val === '') ? i : null).filter(v => v !== null);

        if (checkWin(newBoard, playerSymbol)) {
            return { score: -10 };
        } else if (checkWin(newBoard, computerSymbol)) {
            return { score: 10 };
        } else if (availSpots.length === 0) {
            return { score: 0 };
        }

        const moves = [];
        for (let i = 0; i < availSpots.length; i++) {
            const move = {};
            move.index = availSpots[i];
            newBoard[availSpots[i]] = player;

            if (player === computerSymbol) {
                const result = minimax(newBoard, playerSymbol);
                move.score = result.score;
            } else {
                const result = minimax(newBoard, computerSymbol);
                move.score = result.score;
            }

            newBoard[availSpots[i]] = '';
            moves.push(move);
        }

        let bestMove;
        if (player === computerSymbol) {
            let bestScore = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
        return moves[bestMove];
    };
    
    const showGameMode = () => {
        gameContainer.classList.add('hidden');
        difficultySelection.classList.add('hidden');
        playerChoiceContainer.classList.add('hidden');
        gameModeSelection.classList.remove('hidden');
    };

    const showDifficultySelection = () => {
        playerChoiceContainer.classList.add('hidden');
        difficultySelection.classList.remove('hidden');
    };

    const showPlayerChoice = () => {
        difficultySelection.classList.add('hidden');
        playerChoiceContainer.classList.remove('hidden');
    };

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    
    mainMenuButton.addEventListener('click', () => {
        resetGame(); // Reset scores and board
        showGameMode(); // Go back to the main menu
    });
    
    restartButton.addEventListener('click', resetState);

    playerVsPlayerBtn.addEventListener('click', () => {
        isPlayerVsComputer = false;
        showPlayerChoice();
    });

    playerVsComputerBtn.addEventListener('click', () => {
        isPlayerVsComputer = true;
        showDifficultySelection();
    });

    difficultyEasyBtn.addEventListener('click', () => {
        difficultyLevel = 'easy';
        showPlayerChoice();
    });

    difficultyHardBtn.addEventListener('click', () => {
        difficultyLevel = 'hard';
        showPlayerChoice();
    });
    
    chooseXBtn.addEventListener('click', () => {
        playerSymbol = 'X';
        computerSymbol = 'O';
        startGame();
    });

    chooseOBtn.addEventListener('click', () => {
        playerSymbol = 'O';
        computerSymbol = 'X';
        startGame();
    });
    
    backFromDifficultyBtn.addEventListener('click', showGameMode);
    backFromChoiceBtn.addEventListener('click', () => {
        isPlayerVsComputer ? showDifficultySelection() : showGameMode();
    });
});