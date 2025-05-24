class AudioManager {
  constructor() {
    this.sounds = {
      click: new Howl({ src: ['sounds/click.wav'] }),
      open: new Howl({ src: ['sounds/open.mp3'] }),
      close: new Howl({ src: ['sounds/close.mp3'] }),
      bgMusic: new Howl({
        src: ['sounds/ambient.mp3'],
        loop: true,
        volume: 0.4
      })
    };
    
    this.isMuted = false; // Додаємо внутрішній стан мьюта
    this.initControls();
    this.startAmbient();
  }

  initControls() {
    const toggleBtn = document.getElementById('toggleSound');
    const volumeControl = document.getElementById('volumeControl');
    
    // Встановлюємо початковий стан іконки
    toggleBtn.textContent = this.isMuted ? '🔇' : '🔊';
    
    toggleBtn.addEventListener('click', () => {
      this.toggleMute();
      toggleBtn.textContent = this.isMuted ? '🔇' : '🔊';
    });
    
    volumeControl.addEventListener('input', (e) => {
      if (!this.isMuted) { // Змінюємо гучність тільки якщо не мьютимо
        Howler.volume(parseFloat(e.target.value));
      }
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
  
    startAmbient() {
      this.sounds.bgMusic.play();
      
      // Автопродовження при взаємодії користувача
      document.addEventListener('click', () => {
        if (Howler.ctx.state === 'suspended') {
          Howler.ctx.resume();
        }
      }, { once: true });
    }
  
    playSound(name) {
      if (!Howler.muted) {
        this.sounds[name].play();
      }
    }
  }