document.addEventListener('DOMContentLoaded', () => {
  // --- Elements (match your HTML IDs) ---
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
  const mainMenuButton = document.getElementById('main-menu-button');

  // Back buttons
  const backFromDifficultyBtn = document.getElementById('back-from-difficulty');
  const backFromChoiceBtn = document.getElementById('back-from-choice');

  // Screens
  const gameModeSelection = document.getElementById('game-mode-selection');
  const difficultySelection = document.getElementById('difficulty-selection');
  const playerChoiceContainer = document.getElementById('player-choice-container');
  const gameContainer = document.getElementById('game-container');

  // Score + Turn
  const scoreX = document.querySelector('#score-x .score');
  const scoreO = document.querySelector('#score-o .score');
  const turnIndicator = document.getElementById('turn-indicator');

  // Sounds (optional – make sure paths exist or comment these three lines)
  const moveSound = document.getElementById('move-sound');
  const winSound = document.getElementById('win-sound');
  const drawSound = document.getElementById('draw-sound');

  // --- State ---
  let currentPlayer = 'X';
  let playerSymbol = 'X';
  let computerSymbol = 'O';
  let gameBoard = ['', '', '', '', '', '', '', '', ''];
  let isGameActive = true;
  let isPlayerVsComputer = false;
  let difficultyLevel = 'easy';
  let scores = { X: 0, O: 0 };

  const winningConditions = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  const messages = {
    win: (p) => `Player ${p} wins!`,
    youWin: 'You win!',
    youLose: 'You lose!',
    draw: "It's a draw!",
    playerTurn: (p) => `Player ${p}'s turn`,
    yourTurn: 'Your turn',
    computerTurn: "Computer is thinking...",
    winQuote: "Awesome! You're a pro!",
    loseQuote: "Don't give up! You'll get it next time!",
    drawQuote: 'A worthy opponent!',
  };

  // --- Helpers ---
  const playSound = (el) => { if (el) { el.currentTime = 0; el.play().catch(()=>{}); } };

  const updateScores = (winner) => {
    if (!winner) return;
    scores[winner]++;
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
  };

  const updateTurnIndicator = () => {
    turnIndicator.textContent = isGameActive ? `Turn: ${currentPlayer}` : '';
  };

  const clearBoardUI = () => {
    cells.forEach(c => { c.textContent = ''; c.className = 'cell'; });
  };

  const resetState = () => {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    currentPlayer = 'X';
    clearBoardUI();
    subMessage.textContent = '';
    statusMessage.textContent = isPlayerVsComputer ? (playerSymbol === 'X' ? messages.yourTurn : messages.computerTurn)
                                                   : messages.playerTurn('X');
    updateTurnIndicator();
    // If AI goes first
    if (isPlayerVsComputer && playerSymbol === 'O') {
      currentPlayer = 'X';
      setTimeout(handleComputerMove, 500);
    }
  };

  const resetGame = () => {
    scores = { X: 0, O: 0 };
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    resetState();
  };

  const checkWin = (board, player) => {
    for (const [a,b,c] of winningConditions) {
      if (board[a] === player && board[b] === player && board[c] === player) return [a,b,c];
    }
    return null;
  };

  const endGame = (winner, combo=null) => {
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
      if (combo) combo.forEach(i => cells[i].classList.add('winning-cell'));
    } else {
      playSound(drawSound);
      statusMessage.textContent = messages.draw;
      subMessage.textContent = messages.drawQuote;
    }
  };

  const handlePlayerMove = (cell, index) => {
    gameBoard[index] = currentPlayer;
    cell.textContent = currentPlayer;
    playSound(moveSound);

    const winCombo = checkWin(gameBoard, currentPlayer);
    if (winCombo) return endGame(currentPlayer, winCombo);
    if (!gameBoard.includes('')) return endGame(null);

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

    if (isPlayerVsComputer) {
      statusMessage.textContent = (currentPlayer === playerSymbol) ? messages.yourTurn : messages.computerTurn;
    } else {
      statusMessage.textContent = messages.playerTurn(currentPlayer);
    }
    updateTurnIndicator();

    if (isGameActive && isPlayerVsComputer && currentPlayer !== playerSymbol) {
      setTimeout(handleComputerMove, 400 + Math.random()*600); // slight thinking delay
    }
  };

  const handleCellClick = (e) => {
    const cell = e.target;
    const idx = parseInt(cell.getAttribute('data-cell-index'));
    if (!isGameActive) return;
    if (gameBoard[idx] !== '') return;
    if (isPlayerVsComputer && currentPlayer !== playerSymbol) return;
    handlePlayerMove(cell, idx);
  };

  // --- AI ---
  const getEasyMove = () => {
    const avail = gameBoard.map((v,i)=> v===''?i:null).filter(v=>v!==null);
    return avail.length ? avail[Math.floor(Math.random()*avail.length)] : undefined;
  };

  const minimax = (board, player) => {
    const avail = board.map((v,i)=> v===''?i:null).filter(v=>v!==null);

    if (checkWin(board, playerSymbol)) return { score: -10 };
    if (checkWin(board, computerSymbol)) return { score: 10 };
    if (avail.length === 0) return { score: 0 };

    const moves = [];
    for (const i of avail) {
      const move = { index: i };
      board[i] = player;

      if (player === computerSymbol) {
        move.score = minimax(board, playerSymbol).score;
      } else {
        move.score = minimax(board, computerSymbol).score;
      }
      board[i] = '';
      moves.push(move);
    }

    if (player === computerSymbol) {
      return moves.reduce((best, m) => m.score > best.score ? m : best, {score: -Infinity});
    } else {
      return moves.reduce((best, m) => m.score < best.score ? m : best, {score: Infinity});
    }
  };

  const handleComputerMove = () => {
    if (!isGameActive || currentPlayer === playerSymbol) return;
    let moveIndex = (difficultyLevel === 'easy')
      ? getEasyMove()
      : minimax(gameBoard, computerSymbol).index;

    if (moveIndex !== undefined) handlePlayerMove(cells[moveIndex], moveIndex);
  };

  // --- Screen helpers ---
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
  const startGame = () => {
    gameModeSelection.classList.add('hidden');
    difficultySelection.classList.add('hidden');
    playerChoiceContainer.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    resetState();
  };

  // --- Listeners ---
  cells.forEach(c => c.addEventListener('click', handleCellClick));

  mainMenuButton.addEventListener('click', () => { resetGame(); showGameMode(); });
  restartButton.addEventListener('click', resetState);

  playerVsPlayerBtn.addEventListener('click', () => { isPlayerVsComputer = false; showPlayerChoice(); });
  playerVsComputerBtn.addEventListener('click', () => { isPlayerVsComputer = true; showDifficultySelection(); });

  difficultyEasyBtn.addEventListener('click', () => { difficultyLevel = 'easy'; showPlayerChoice(); });
  difficultyHardBtn.addEventListener('click', () => { difficultyLevel = 'hard'; showPlayerChoice(); });

  chooseXBtn.addEventListener('click', () => { playerSymbol = 'X'; computerSymbol = 'O'; startGame(); });
  chooseOBtn.addEventListener('click', () => { playerSymbol = 'O'; computerSymbol = 'X'; startGame(); });

  backFromDifficultyBtn.addEventListener('click', showGameMode);
  backFromChoiceBtn.addEventListener('click', () => { isPlayerVsComputer ? showDifficultySelection() : showGameMode(); });

  // Initial screen
  showGameMode();
});