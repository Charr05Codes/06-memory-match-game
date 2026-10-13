// The six emojis are duplicated to create six matching pairs.
const emojis = ['🐶', '🍎', '🚀', '🌈', '🐱', '🍕'];
const totalPairs = emojis.length;

const gameBoard = document.querySelector('#game-board');
const movesDisplay = document.querySelector('#moves');
const matchedPairsDisplay = document.querySelector('#matched-pairs');
const timerDisplay = document.querySelector('#timer');
const victoryMessage = document.querySelector('#victory-message');
const finalMovesDisplay = document.querySelector('#final-moves');
const finalTimeDisplay = document.querySelector('#final-time');
const restartButton = document.querySelector('#restart-button');

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let elapsedSeconds = 0;
let gameStarted = false;
let gameWon = false;
let timerInterval = null;
let mismatchTimeout = null;
let gameRound = 0;

// Fisher-Yates gives every possible card order a fair chance.
function shuffleCards(cards) {
  const shuffledCards = [...cards];

  for (let index = shuffledCards.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const temporaryCard = shuffledCards[index];
    shuffledCards[index] = shuffledCards[randomIndex];
    shuffledCards[randomIndex] = temporaryCard;
  }

  return shuffledCards;
}

function initializeGame() {
  gameRound += 1;
  clearTimeout(mismatchTimeout);
  stopTimer();

  firstCard = null;
  secondCard = null;
  lockBoard = false;
  moves = 0;
  matchedPairs = 0;
  elapsedSeconds = 0;
  gameStarted = false;
  gameWon = false;

  victoryMessage.hidden = true;
  updateScore();
  renderBoard();
}

function renderBoard() {
  const cardValues = shuffleCards([...emojis, ...emojis]);
  gameBoard.innerHTML = '';

  cardValues.forEach(function (emoji, index) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    card.dataset.emoji = emoji;
    card.dataset.index = index;
    card.setAttribute('role', 'gridcell');
    card.setAttribute('aria-label', 'Hidden card');

    card.innerHTML = `
      <span class="card-inner" aria-hidden="true">
        <span class="card-face card-back">?</span>
        <span class="card-face card-front">${emoji}</span>
      </span>
    `;

    card.addEventListener('click', flipCard);
    gameBoard.appendChild(card);
  });
}

function flipCard(event) {
  const selectedCard = event.currentTarget;

  if (lockBoard || gameWon || selectedCard === firstCard || selectedCard.classList.contains('is-matched')) {
    return;
  }

  if (!gameStarted) {
    gameStarted = true;
    startTimer();
  }

  selectedCard.classList.add('is-flipped');
  selectedCard.setAttribute('aria-label', `Revealed card: ${selectedCard.dataset.emoji}`);

  if (firstCard === null) {
    firstCard = selectedCard;
    return;
  }

  secondCard = selectedCard;
  moves += 1;
  updateScore();
  checkMatch();
}

function checkMatch() {
  lockBoard = true;

  if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
    firstCard.classList.add('is-matched');
    secondCard.classList.add('is-matched');
    firstCard.setAttribute('aria-label', `Matched card: ${firstCard.dataset.emoji}`);
    secondCard.setAttribute('aria-label', `Matched card: ${secondCard.dataset.emoji}`);
    matchedPairs += 1;
    updateScore();
    resetTurn();
    checkWin();
    return;
  }

  const currentRound = gameRound;
  mismatchTimeout = setTimeout(function () {
    if (currentRound === gameRound) {
      resetUnmatchedCards();
    }
  }, 1000);
}

function resetUnmatchedCards() {
  firstCard.classList.remove('is-flipped');
  secondCard.classList.remove('is-flipped');
  firstCard.setAttribute('aria-label', 'Hidden card');
  secondCard.setAttribute('aria-label', 'Hidden card');
  resetTurn();
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function updateScore() {
  movesDisplay.textContent = moves;
  matchedPairsDisplay.textContent = `${matchedPairs} / ${totalPairs}`;
  timerDisplay.textContent = formatTime(elapsedSeconds);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function startTimer() {
  timerInterval = setInterval(function () {
    elapsedSeconds += 1;
    timerDisplay.textContent = formatTime(elapsedSeconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function checkWin() {
  if (matchedPairs !== totalPairs) {
    return;
  }

  gameWon = true;
  stopTimer();
  finalMovesDisplay.textContent = `${moves} ${moves === 1 ? 'move' : 'moves'}`;
  finalTimeDisplay.textContent = formatTime(elapsedSeconds);
  victoryMessage.hidden = false;
}

function restartGame() {
  initializeGame();
}

restartButton.addEventListener('click', restartGame);
initializeGame();