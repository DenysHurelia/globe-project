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
      
      this.initControls();
      this.startAmbient();
    }
  
    initControls() {
      const toggleBtn = document.getElementById('toggleSound');
      const volumeControl = document.getElementById('volumeControl');
      
      // Обробник вимкнення звуку
      toggleBtn.addEventListener('click', () => {
        Howler.mute(!Howler.muted);
        toggleBtn.textContent = Howler.muted ? '🔇' : '🔊';
      });
      
      // Регулятор гучності
      volumeControl.addEventListener('input', (e) => {
        Howler.volume(parseFloat(e.target.value));
      });
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