class App {
  constructor () {
    window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.synth = window.speechSynthesis;
    this.icon = document.querySelector('i.fa.fa-microphone');
    this.paragraph = document.createElement('p');
    this.container = document.querySelector('.text-box');
    this.sound = document.querySelector('.sound');
    this.listening = false;
    this.question = false;
    this.appendParagraph();
    this.voices = [];
    this.initializeVoicePopulation();
    this.handleMicIconClick();
    this.watchRecognition();
    this.cachedWeather = false;
  }
  
  appendParagraph() {
    this.container.appendChild(this.paragraph);
  }

  populateVoiceList() {
    if(typeof speechSynthesis === 'undefined') {
      return;
    }
    
    this.voices = speechSynthesis.getVoices();
    let i;
  
    for(i = 0; i < this.voices.length ; i++) {
      let option = document.createElement('option');
      option.textContent = this.voices[i].name + ' (' + this.voices[i].lang + ')';
      
      if(this.voices[i].default) {
        option.textContent += ' -- DEFAULT';
      }
  
      option.setAttribute('data-lang', this.voices[i].lang);
      option.setAttribute('data-name', this.voices[i].name);
      document.getElementById("voiceSelect").appendChild(option);
    }
  }

  initializeVoicePopulation() {
    this.populateVoiceList();
    if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = this.populateVoiceList;
    }
  }

  handleMicIconClick() {
    this.icon.addEventListener('click', () => {
      if (this.listening) {
        this.recognition.stop();
        return;
      }
      this.sound.play();
      this.dictate();
    });
  }

  watchRecognition() {
    this.recognition.onstart = function() {
      this.listening = true;
      console.log('Speech recognition service has started');
    };
    
    this.recognition.onend = function() {
      console.log('Speech recognition service disconnected');
    };
  }

  dictate() {
    console.log('dictating...');
    this.recognition.start();
    this.recognition.onresult = (event) => {
      const speechToText = Array.from(event.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('');
      
      this.paragraph.textContent = speechToText;
  
      if (event.results[0].isFinal) {
        this.container.scrollTo(0, this.container.scrollHeight);
        this.paragraph = document.createElement('p');
        this.appendParagraph();

        this.handleRequest(speechToText);
      }
    };
    // this.recognition.onend = this.recognition.start
  }

  speak(action) {
    const utterThis = new SpeechSynthesisUtterance(action());
    this.setVoice(utterThis);
    this.synth.speak(utterThis);
  }

  setVoice(utterThis) {
    const selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
    let i;
    for(i = 0; i < this.voices.length ; i++) {
      if(this.voices[i].name === selectedOption) {
        utterThis.voice = this.voices[i];
      }
    }
  }

  handleRequest(speech) {
    if (speech.includes('what is the time')) {
      this.speak(this.getTime);
    };

    if (speech.includes('what is today\'s date')) {
      this.speak(this.getDate);
    };

    if (speech.includes('what is the weather in')) {
      this.getWeather(speech);
    };

    if (speech.includes('open a url')) {
      const utterThis = new SpeechSynthesisUtterance('what URL do you want to open?');
      this.setVoice(utterThis);
      this.synth.speak(utterThis);
      this.recognition.abort();
      this.recognition.stop();
      this.question = true;
      return;
    };

    if (speech.includes('open') && this.question) {
      this.openUrl(speech.split(' ')[1]);
      this.question = false;
    };
  }

  getTime() {
    const time = new Date(Date.now());
    return `the time is ${time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
  }

  getDate() {
    const time = new Date(Date.now())
    return `today is ${time.toLocaleDateString()}`;
  }

  getWeather(speech) {
    self = this;
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${speech.split(' ')[5]}&appid=6aa90859f3e957ff6c77ec9b1bc86296&units=metric`
    if ('caches' in window) {
      /*
       * Check if the service worker has already cached this city's weather
       * data. If the service worker has the data, then display the cached
       * data while the app fetches the latest data.
       */
      caches.match(url).then(function(response) {
        if (response) {
          self.cachedWeather = true;
          response.json().then(function updateFromCache(json) {
            if (json.cod === '404') {
              const utterThis = new SpeechSynthesisUtterance(`I cannot find the weather for ${speech.split(' ')[5]}`);
              self.setVoice(utterThis);
              self.synth.speak(utterThis);
              return;
            }
            const utterThis = new SpeechSynthesisUtterance(`the weather condition in ${json.name} is mostly full of
            ${json.weather[0].description} at a temperature of ${json.main.temp} degrees Celcius`);
            self.setVoice(utterThis);
            self.synth.speak(utterThis);
          });
        }
      });
    }
    fetch(url)
    .then(function(response){
      return response.json();
    }).then(function(weather){
      if (self.cachedWeather) {
        return;
      }
      if (weather.cod === '404') {
        const utterThis = new SpeechSynthesisUtterance(`I cannot find the weather for ${speech.split(' ')[5]}`);
        self.setVoice(utterThis);
        self.synth.speak(utterThis);
        return;
      }
      const utterThis = new SpeechSynthesisUtterance(`the weather condition in ${weather.name} is mostly full of
      ${weather.weather[0].description} at a temperature of ${weather.main.temp} degrees Celcius`);
      self.setVoice(utterThis);
      self.synth.speak(utterThis);
    });
  }

  openUrl(url) {
    window.open(`http://${url}`,'_newtab');
  }
}

const speechRec = new App();

// add service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
           .register('./service-worker.js')
           .then(function() { console.log('Service Worker Registered'); });
}

