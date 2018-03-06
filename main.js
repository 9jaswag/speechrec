window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition; // available in firefox and chrome and lives on top of the window object
const recognition = new SpeechRecognition();
recognition.interimResults = true; // Controls whether interim results should be returned (true) or not (false.)
//Interim results are results that are not yet final. popualates the speech as you speak
// has to be run via a server
const synth = window.speechSynthesis;

let p = document.createElement('p'); // we create a paragraph
let container = document.querySelector('.container'); // select our container
container.appendChild(p); // append it
// console.log(container);

recognition.addEventListener('result', e => { // add an eventlistener to the recognition
  const speechToText = Array.from(e.results) // list of result..not an array
    .map(result => result[0])
    .map(result => result.transcript)
    .join('') // join the peices in the array
  // console.log(speechToText) // something else must not be using your mic
    
    p.textContent = speechToText;

    if (e.results[0].isFinal) { // last - check if result is final
      p = document.createElement('p'); // create a new paragraph so it doesn't clear our previous text
      container.appendChild(p);
      // window.scrollTo(0, container.scrollHeight);

      if (speechToText.includes('ok google')) {
        voices = synth.getVoices();
        console.log(voices[32])
        utterThis = new SpeechSynthesisUtterance('how can I help you?');
        utterThis.voice == voices[32]
        synth.speak(utterThis);
      }

      if (speechToText.includes('what is today\'s date')) {
        voices = synth.getVoices();
        const time = new Date(Date.now())
        utterThis = new SpeechSynthesisUtterance(time.toLocaleDateString());
        utterThis.voice == voices[32]
        synth.speak(utterThis);
      }

      if (speechToText.includes('what is the time')) {
        voices = synth.getVoices();
        const time = new Date(Date.now())
        utterThis = new SpeechSynthesisUtterance(
          time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
        );
        utterThis.voice == voices[32]
        synth.speak(utterThis);
      }
    }
});

recognition.addEventListener('end', recognition.start); //  sec to last -another event listener to restart the recognition when it ends
recognition.start(); // start the recognition

// learn the basics of building speech to text apps in 10 mins
