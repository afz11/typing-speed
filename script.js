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

function getNewPassage() {
  const index = randomNumber(passages.length)
  currentPassage = passages[index].content.split(' ')
  displayWords()
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

function startGame() {
  if (!isPlaying) {
    isPlaying = true
    startTimer()
  }
  
  const results = compareInput(input.value)
  updatePassageStyling(results)
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

function compareInput(userInput) {
  const userWords = userInput.trim().split(" ")
  const currentWord = userWords[userWords.length - 1]
  const previousWords = userWords.slice(0, -1)
  
  return currentPassage.map((word, index) => {
    // For completed words
    if (index < previousWords.length) {
      return {
        word,
        status: previousWords[index] === word ? "correct" : "incorrect",
        isCurrent: false
      }
    }
    // For the current word being typed
    else if (index === previousWords.length) {
      return {
        word,
        status: word.startsWith(currentWord) ? "correct" : "incorrect",
        isCurrent: true
      }
    }
    // For words not typed yet
    else {
      return { word, status: "missing", isCurrent: false }
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


function init() {
  initializePassages()
}


document.addEventListener('DOMContentLoaded', init)
input.addEventListener('input', startGame)
// document.addEventListener('keydown', addTypedWord)

function resetGame() {
  isPlaying = false
  clearInterval(intervalId)
  intervalId = null
  input.value = ''
  document.querySelector('#seconds').innerHTML = '00'
  document.querySelector('#minutes').innerHTML = '00'
  getNewPassage()
}

document.querySelector('#restart-button').addEventListener('click', resetGame)