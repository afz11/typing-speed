const displayDiv = document.querySelector('.words-display')
const input = document.querySelector('#typing-input')
document.querySelector('.timer')

console.log(displayDiv)

let sentence = ''
let typedWords = []
let isPlaying = false
let intervalId;


async function getPassage (){
  const response = await fetch('./passages.json')
  const data = await response.json()
  const index = randomNumber(data.passages.length)

  const passage = data.passages[index]
  
  return passage
}

async function displayWords() {

  // get passage
  const { content } = await getPassage()

  // break down the passage in to words
  const words = content.split(' ')
  let wordNr = 1

  
    // Display each word in the Word-display
  words.forEach(word  => {
    const span = document.createElement('span')
    span.dataset.wordnr = wordNr++
    span.textContent = word
    displayDiv.appendChild(span)
  });
}

function startGame(){
  isPlaying = true
  startTimer()
  
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