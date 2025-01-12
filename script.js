const displayDiv = document.querySelector('.words-display')
const input = document.querySelector('#typing-input')
document.querySelector('.timer')


let sentence = ''
let typedWords = []
let isPlaying = false
let intervalId;


async function getPassageArray (){
  const response = await fetch('./passages.json')
  const data = await response.json()
  const index = randomNumber(data.passages.length)

  const passage = data.passages[index]
  const passageArray = passage.content.split(' ')
  
  return passageArray
}

async function displayWords() {

  // get passage
  const passageArray  = await getPassageArray()

  let wordNr = 0

  
    // Display each word in the Word-display
    passageArray.forEach(word  => {
    const span = document.createElement('span')
    span.dataset.wordnr = wordNr++
    span.textContent = word
    displayDiv.appendChild(span)
  });
}

function startGame(){
  isPlaying = true
  startTimer()
  
  const results =  compareInput(input.value)
  updatePassageStyling(results)

}


  // Split user input into words
async function compareInput(userInput) {
  const passageArray  = await getPassageArray()

  // break down the passage in to words
  const userInputArray = userInput.trim().split(" "); // Split input by spaces
  
  const results = passageArray.map((word, index) => {
    if (userInputArray[index] === undefined) {
      return { word, status: "missing" }; // User hasn't typed this word yet
    } else if (userInputArray[index] === word) {
      // Word matches
      console.log(document.querySelector(`span[data-wordnr=${index}]`))
    } else {
      return { word, status: "incorrect" }; // Word doesn't match
    }
  });
  console.log(results)

  return results
}

function checkInput(input) {
  const typedWords = []
  input.split(' ').push(typedWords)
  typedWords.forEach(word => {
  });
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
  // getPassage()
  displayWords()

}


document.addEventListener('DOMContentLoaded', init)
input.addEventListener('input', startGame)
// document.addEventListener('keydown', addTypedWord)