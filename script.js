const displayDiv = document.querySelector('.row1')



const getPassages = async () => {
  const response = await fetch('./passages.json')
  const data = await response.json()
  
  const passages = data.passages
  const randomPassage = passages.filter((passage)=> {
    const random = Math.floor(Math.random() * passages.length)
    if (passages.indexOf(passage) === random) {
      return passage
    }
  })
  const words = randomPassage[0].content.split(' ')
  let number = 1
  // displayDiv.innerHTML = 
  words.forEach(word => {
    const span = document.createElement('span')
    span.dataset.wordnr = number++ 
    span.textContent = word
    displayDiv.appendChild(span) 
  });

} 


// console.log(passage)

function init() {
  getPassages()

}


document.addEventListener('DOMContentLoaded', init)