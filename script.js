const displayDiv = document.querySelector('.words-display')
const input = document.querySelector('#typing-input')
document.querySelector('.timer')


let sentence = ''
let typedWords = []
let isPlaying = false
let intervalId;
let currentPassage = []
let passages = null
let currentWordIndex = 0
let startTime = null;
let endTime = null;
let totalWordsTyped = 0;
let correctWords = 0;
let incorrectWords = 0;


/**
 * Fetches and initializes passages from the JSON file.
 * Sets up the initial passage for typing.
 */
async function initializePassages() {
  try {
    const response = await fetch('./passages.json')
    const data = await response.json()
    passages = data.passages
    await getNewPassage()
  } catch (error) {
    console.error('Error loading passages:', error)
  }
}

/**
 * Selects and displays a new random passage based on difficulty length.
 * @param {string} length - Difficulty level ('short', 'medium', or 'long')
 */
function getNewPassage(length = 'short') {
  const filteredPassages = passages.filter(p => p.lengthCategory === length);
  const index = randomNumber(filteredPassages.length);
  currentPassage = filteredPassages[index].content.split(' ');
  displayWords();
}

function displayWords() {
  let wordNr = 0
  displayDiv.innerHTML = ''
  
  currentPassage.forEach(word => {
    const span = document.createElement('span')
    span.dataset.wordnr = wordNr++
    span.textContent = word
    displayDiv.appendChild(span)
  })
}

/**
 * Handles the main game logic when user is typing.
 * Starts timer, updates styling, and tracks statistics.
 */
function startGame() {
  if (!isPlaying) {
    isPlaying = true;
    startTime = Date.now();
    startTimer();
  }
  
  const results = compareInput(input.value);
  updatePassageStyling(results);
  
  // Update word counts
  const completedWords = results.filter(r => !r.isCurrent);
  totalWordsTyped = completedWords.length;
  correctWords = completedWords.filter(r => r.status === "correct").length;
  incorrectWords = completedWords.filter(r => r.status === "incorrect").length;
  
  updateStats();

  if (isGameComplete(results)) {
    endTime = Date.now();
    handleCompletion(results);
  }
}

function updatePassageStyling(results) {
  const passageSpans = document.querySelectorAll('.words-display span')

  passageSpans.forEach((span) => {
    const index = parseInt(span.dataset.wordnr)
    const result = results[index]

    span.className = `word-${result.status}`
    if (result.isCurrent) {
      span.classList.add('word-current')
    }
  })
}

/**
 * Compares user input against the current passage.
 * @param {string} userInput - The current text in the input field
 * @returns {Array<Object>} Array of word status objects
 */
function compareInput(userInput) {
  const userWords = userInput.trim().split(" ")
  const currentWord = userWords[userWords.length - 1]
  const previousWords = userWords.slice(0, -1)
  
  // Reset character counts
  correctChars = 0;
  totalChars = userInput.trim().length;
  
  return currentPassage.map((word, index) => {
    // For completed words
    if (index < previousWords.length) {
      if (previousWords[index] === word) {
        correctChars += word.length;
        if (index < previousWords.length - 1) correctChars++; // Count space if not last word
        return { word, status: "correct", isCurrent: false }
      }
      return { word, status: "incorrect", isCurrent: false }
    }
    // For current word being typed
    else if (index === previousWords.length) {
      // Count correct characters in current word
      let correctInCurrentWord = 0;
      for (let i = 0; i < currentWord.length && i < word.length; i++) {
        if (currentWord[i] === word[i]) {
          correctInCurrentWord++;
        }
      }
      correctChars += correctInCurrentWord;

      // Determine word status
      if (currentWord.length === 0) {
        return { word, status: "current", isCurrent: true }
      }
      if (currentWord.length > word.length || !word.startsWith(currentWord)) {
        return { word, status: "incorrect", isCurrent: true }
      }
      if (currentWord.length === word.length && currentWord === word) {
        return { word, status: "correct", isCurrent: true }
      }
      return { word, status: "current", isCurrent: true }
    }
    // For words not typed yet
    else {
      return { word, status: "pending", isCurrent: false }
    }
  })
}

function startTimer() {

  let totalSeconds = 0

  if(!intervalId) {
    intervalId = setInterval( () => {
      totalSeconds++
      document.querySelector('#seconds').innerHTML = pad(totalSeconds % 60)
      document.querySelector('#minutes').innerHTML = pad(parseInt(totalSeconds / 60))
    }, 1000)
  }
}


function stopTimer() {
  if (isGameFinished) {
    clearInterval(intervalId)
    isPlaying = false
  }
}

function pad(timer) {
  let timerString = timer + ""
  if (timerString.length < 2) {
    return `0${timerString}`
  } else {
    return timerString
  }
}


function randomNumber(number){
  return Math.floor(Math.random() * number)
}


/**
 * Initializes the application.
 * Sets up event listeners and initial game state.
 */
function init() {
  // Clear input field on page load
  input.value = '';
  
  initializePassages();
  makeAccessible();
  initTheme();
  
  // Add initial difficulty selector
  document.querySelector('.input-container').insertAdjacentHTML('beforebegin', `
    <div class="difficulty-selector">
      <h3>Select Difficulty</h3>
      <div class="difficulty-buttons">
        <button class="difficulty-btn" data-length="short">Easy</button>
        <button class="difficulty-btn" data-length="medium">Medium</button>
        <button class="difficulty-btn" data-length="long">Hard</button>
      </div>
    </div>
  `);

  // Event listeners
  input.addEventListener('input', handleInput);
  document.addEventListener('keydown', handleKeyboard);
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      resetGame();
      getNewPassage(btn.dataset.length);
    });
  });
}


document.addEventListener('DOMContentLoaded', init)
input.addEventListener('input', startGame)
// document.addEventListener('keydown', addTypedWord)

/**
 * Resets the game state to initial values.
 * Clears timer, stats, and gets a new passage.
 */
function resetGame() {
  isPlaying = false;
  clearInterval(intervalId);
  intervalId = null;
  input.value = '';
  startTime = null;
  endTime = null;
  totalWordsTyped = 0;
  correctWords = 0;
  incorrectWords = 0;
  
  document.querySelector('#seconds').innerHTML = '00';
  document.querySelector('#minutes').innerHTML = '00';
  document.querySelector('.result-container').innerHTML = '';
  document.querySelector('.stats-container').innerHTML = '';
  
  const currentDifficulty = currentPassage.length <= 30 ? 'short' : 
                           currentPassage.length <= 50 ? 'medium' : 'long';
  getNewPassage(currentDifficulty);
  input.focus();
}

document.querySelector('#restart-button').addEventListener('click', resetGame)

/**
 * Calculates current typing statistics (WPM and accuracy).
 * @returns {Object} Object containing WPM and accuracy percentages
 */
function calculateStats() {
  if (!startTime) return { wpm: 0, accuracy: 100 };
  
  const currentTime = Date.now();
  const elapsedTimeInMinutes = (currentTime - startTime) / 60000;
  
  // Prevent division by zero
  if (elapsedTimeInMinutes < 0.0001) return { wpm: 0, accuracy: 100 };
  
  // Calculate WPM based on all typed words
  const wpm = Math.round(totalWordsTyped / elapsedTimeInMinutes);
  
  // Calculate accuracy starting from 100% and decreasing based on errors
  const accuracy = totalWordsTyped > 0 
    ? Math.round(((totalWordsTyped - incorrectWords) / totalWordsTyped) * 100)
    : 100;
  
  return { wpm, accuracy };
}

function updateStats() {
  if (!startTime) return;
  
  const stats = calculateStats();
  document.querySelector('.stats-container').innerHTML = `
    <div class="stat">
      <div class="stat-value">${stats.wpm}</div>
      <div class="stat-label">WPM</div>
    </div>
    <div class="stat">
      <div class="stat-value">${stats.accuracy}%</div>
      <div class="stat-label">Accuracy</div>
    </div>
  `;
}

/**
 * Checks if the typing test is complete.
 * @param {Array<Object>} results - Array of word comparison results
 * @returns {boolean} True if all words are typed correctly
 */
function isGameComplete(results) {
  const lastWord = results[results.length - 1];
  const allWordsTyped = results.every(r => r.status === "correct" || r.status === "incorrect");
  
  // Game is complete if all words are typed and the last word is finished
  return allWordsTyped && lastWord.status !== "current";
}

/**
 * Handles the game completion state.
 * Displays final results and statistics.
 * @param {Array<Object>} results - Final word comparison results
 */
function handleCompletion(results) {
  // Calculate final stats before changing game state
  const timeInSeconds = parseInt(document.querySelector('#minutes').textContent) * 60 
                     + parseInt(document.querySelector('#seconds').textContent);
  const timeInMinutes = timeInSeconds / 60;
  
  // Use the same WPM calculation that worked during typing
  const finalWPM = Math.round(totalWordsTyped / timeInMinutes);
  
  // Calculate final accuracy the same way
  const finalAccuracy = totalWordsTyped > 0 
    ? Math.round(((totalWordsTyped - incorrectWords) / totalWordsTyped) * 100)
    : 100;
  
  const timeString = document.querySelector('.timer').textContent;
  const errors = incorrectWords;
  
  // Now we can change game state
  isPlaying = false;
  clearInterval(intervalId);
  
  document.querySelector('.result-container').innerHTML = `
    <div class="results-card">
      <h2>Test Complete!</h2>
      <div class="final-stats">
        <div class="stat-group">
          <div class="stat">
            <div class="stat-value">${finalWPM}</div>
            <div class="stat-label">WPM</div>
          </div>
          <div class="stat">
            <div class="stat-value">${finalAccuracy}%</div>
            <div class="stat-label">Accuracy</div>
          </div>
        </div>
        <div class="stat-details">
          <div class="detail-item">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${timeString}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Errors:</span>
            <span class="detail-value">${errors}</span>
          </div>
        </div>
      </div>
      <div class="result-actions">
        <button class="btn retry-btn" onclick="resetGame()">Try Again</button>
      </div>
    </div>
  `;
}

/**
 * Debounces a function to limit how often it can be called.
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait between calls
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Optimizes input handling
 * @param {Event} e - Input event
 */
const handleInput = debounce((e) => {
  startGame();
}, 16); // Roughly 60fps

/**
 * Adds keyboard handling
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyboard(e) {
  if (e.key === 'Escape') {
    resetGame();
  }
}

/**
 * Sets up accessibility attributes for key elements.
 * Improves screen reader compatibility.
 */
function makeAccessible() {
  input.setAttribute('aria-label', 'Type the text shown above');
  document.querySelector('.words-display').setAttribute('aria-label', 'Text to type');
  document.querySelector('.timer').setAttribute('aria-live', 'polite');
  document.querySelector('.stats-container').setAttribute('aria-live', 'polite');
}

/**
 * Toggles between light and dark theme.
 * Saves preference to localStorage.
 */
function toggleTheme() {
  const root = document.documentElement;
  const currentTheme = root.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  root.setAttribute('data-theme', newTheme);
  
  // Update button icon
  const themeToggle = document.querySelector('.theme-toggle');
  themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  
  // Save preference
  localStorage.setItem('theme', newTheme);
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const themeToggle = document.querySelector('.theme-toggle');
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  themeToggle.addEventListener('click', toggleTheme);
}