// if (!('webkitSpeechRecognition' in window)) {
//   alert('get yourself a proper browser');
// }
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
let question = false;

recognition.onstart = function() {
  listening = true;
  console.log('Speech recognition service has started');
};

recognition.onend = function() {
  console.log('Speech recognition service disconnected');
};

const dictate = () => {
  console.log('dictating');
  recognition.start();
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
        getTheWeather(speechToText);
      };

      if (speechToText.includes('open a url')) {
        utterThis = new SpeechSynthesisUtterance('what URL do you want to open?');
        setVoice(utterThis);
        synth.speak(utterThis);
        recognition.abort();
        recognition.stop();
        question = true;
        return;
      };

      if (speechToText.includes('open') && question) {
        openUrl(speechToText.split(' ')[1]);
        question = false;
      };
    }
  };

  recognition.onend = recognition.start
  // recognition.start();
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
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${speech.split(' ')[5]}&appid=6aa90859f3e957ff6c77ec9b1bc86296&units=metric`)
  .then(function(response){
    return response.json();
  }).then(function(weather){
    if (weather.cod === '404') {
      utterThis = new SpeechSynthesisUtterance(`I cannot find the weather for ${speech.split(' ')[5]}`);
      setVoice(utterThis);
      synth.speak(utterThis);
      return
    }
    utterThis = new SpeechSynthesisUtterance(`the weather condition in ${weather.name} is mostly full of
    ${weather.weather[0].description} at a temperature of ${weather.main.temp} degrees Celcius`);
    setVoice(utterThis);
    synth.speak(utterThis);
  });
};

const speak = (action) => {
  utterThis = new SpeechSynthesisUtterance(action());
  setVoice(utterThis);
  synth.speak(utterThis);
};

const openUrl = (url) => {
  window.open(`http://${url}`,'_newtab');
};

const stripUrl = (str) =>  {
	return str.match(/[a-z]+[:.].*?(?=\s)/);
}

icon.addEventListener('click', () => {
  if (listening) {
    recognition.stop();
    return;
  }
  sound.play();
  dictate();
});

function populateVoiceList() {
  if(typeof speechSynthesis === 'undefined') {
    return;
  }

  voices = speechSynthesis.getVoices();

  for(i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
    
    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    document.getElementById("voiceSelect").appendChild(option);
  }
}

populateVoiceList();
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

const setVoice = (utterThis) => {
  const selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for(i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      utterThis.voice = voices[i];
    }
  }
};
