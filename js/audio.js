class AudioManager {
  constructor() {
    this.sounds = {
      click: new Howl({ src: ['sounds/click.wav'], volume: 0.5 }),
      open: new Howl({ src: ['sounds/open.mp3'] }),
      close: new Howl({ src: ['sounds/close.mp3'] }),
      bgMusic: new Howl({
        src: ['sounds/ambient.mp3'],
        loop: true,
        volume: 0.4,
        autoplay: false // Вимкнуто автопрогравання
      })
    };
    
    this.isMuted = false;
    this.initControls();
  }

  startAmbient() {
    if (!this.isMuted && !this.sounds.bgMusic.playing()) {
      this.sounds.bgMusic.play();
    }
  }

  initControls() {
    const toggleBtn = document.getElementById('toggleSound');
    const volumeControl = document.getElementById('volumeControl');
    
    // Ініціалізація стану
    volumeControl.value = this.sounds.bgMusic.volume();
    toggleBtn.textContent = this.sounds.bgMusic.mute() ? '🔇' : '🔊';

    toggleBtn.addEventListener('click', () => {
      this.sounds.bgMusic.mute(!this.sounds.bgMusic.mute());
      toggleBtn.textContent = this.sounds.bgMusic.mute() ? '🔇' : '🔊';
    });
    
    volumeControl.addEventListener('input', (e) => {
      this.sounds.bgMusic.volume(parseFloat(e.target.value));
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);
    
    // Синхронізуємо гучність зі слайдером при вимкненні мьюта
    if (!this.isMuted) {
      Howler.volume(parseFloat(document.getElementById('volumeControl').value));
    }
  }  
    playSound(name) {
      if (!Howler.muted) {
        this.sounds[name].play();
      }
    }
  }