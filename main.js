window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const recognition = new SpeechRecognition();
// recognition.continuous = true;
recognition.interimResults = true;
const synth = window.speechSynthesis;


const icon = document.querySelector('i.fa.fa-microphone')
let paragraph = document.createElement('p');
let container = document.querySelector('.text-box');
const sound = document.querySelector('.sound');
container.appendChild(paragraph);
let listening = false;

recognition.onstart = function() {
  listening = true;
  console.log('Speech recognition service has started');
};

recognition.onend = function() {
  console.log('Speech recognition service disconnected');
};

const dictate = () => {
  console.log('dictating');
  recognition.onresult = (event) => {
    const speechToText = Array.from(event.results)
    .map(result => result[0])
    .map(result => result.transcript)
    .join('');
    
    paragraph.textContent = speechToText;

    if (event.results[0].isFinal) {
      container.scrollTo(0, container.scrollHeight);
      paragraph = document.createElement('p');
      container.appendChild(paragraph);

      if (speechToText.includes('what is the time')) {
        speak(getTime);
      };

      if (speechToText.includes('what is today\'s date')) {
        speak(getDate);
      };

      if (speechToText.includes('what is the weather in')) {
        // speak(getTheWeather)
        getTheWeather(speechToText);
      };
    }
  };

  recognition.onend = recognition.start
  recognition.start();
};

const getTime = () => {
  const time = new Date(Date.now());
  return `the time is ${time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
};

const getDate = () => {
  const time = new Date(Date.now())
  return `today is ${time.toLocaleDateString()}`;
};

const getTheWeather = (speech) => {
  fetch(`http://api.openweathermap.org/data/2.5/weather?q=${speech.split(' ')[5]}&appid=6aa90859f3e957ff6c77ec9b1bc86296&units=metric`)
  .then(function(response){
    return response.json();
  }).then(function(weather){
    utterThis = new SpeechSynthesisUtterance(`the weather condition in ${weather.name} is mostly full of
    ${weather.weather[0].description} at a temperature of ${weather.main.temp} degrees Celcius`);
    synth.speak(utterThis);
  });
};

const speak = (action) => {
  utterThis = new SpeechSynthesisUtterance(action());
  synth.speak(utterThis);
};

icon.addEventListener('click', () => {
  if (listening) {
    recognition.stop();
    return;
  }
  sound.play();
  dictate();
});
