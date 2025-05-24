// Показати лоадер
function showLoader() {
  document.getElementById('loader').style.display = 'flex';
}

// Сховати лоадер
function hideLoader() {
  const loader = document.getElementById('loader');
  loader.style.opacity = '0';
  loader.style.pointerEvents = 'none';
  setTimeout(() => {
    loader.style.display = 'none';
    document.getElementById('globeCanvas').style.opacity = '1';
    document.getElementById('playPauseButton').style.display = 'block';
    document.getElementById('audioControls').style.display = 'flex';
  }, 500);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered'))
    .catch(err => console.log('SW registration failed:', err));
}

// Обробник кнопки паузи
document.getElementById('playPauseButton').addEventListener('change', function(e) {
  isPaused = !e.target.checked;
  controls.autoRotate = e.target.checked;
  
  if (isPaused) {
    audioManager.sounds.bgMusic.pause();
  } else {
    audioManager.sounds.bgMusic.play();
  }
});

// Ініціалізація гри
let game = {
  active: false,
  score: 0,
  timeLeft: 60,
  timerId: null,
  currentCountry: null,
  // Add reference to normalization function
  normalizeName: normalizeCountryName
};

function startGame() {
  if(game.active) return;
  
  game.active = true;
  game.score = 0;
  game.timeLeft = 60;
  
  document.getElementById('gameResults').style.display = 'none';
  document.getElementById('gamePanel').style.display = 'block'; // Показуємо панель гри
  updateGameDisplay();
  
  generateNewCountry();
  
  game.timerId = setInterval(() => {
    game.timeLeft--;
    updateGameDisplay();
    
    if(game.timeLeft <= 0) endGame();
  }, 1000);
}

function generateNewCountry() {
  const availableCountries = countriesData
    .filter(c => c.properties.NAME && c.properties.NAME !== game.currentCountry)
    .map(c => c.properties.NAME);

  if(availableCountries.length === 0) {
    console.error('Немає доступних країн для гри');
    return;
  }
  
  game.currentCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)];
  console.log('Нова цільова країна:', game.currentCountry);
  document.getElementById('currentTarget').textContent = game.currentCountry;
  
  // Додано примусове оновлення відображення
  setTimeout(() => {
    updateGameDisplay();
  }, 0);
}

function handleGameClick(countryName) {
  if(!game.active) return;
  
  const current = normalizeCountryName(game.currentCountry);
  const clicked = normalizeCountryName(countryName);
  
  if(current === clicked) {
      game.score++;
      document.getElementById('currentTarget').classList.add('correct');
      audioManager.playSound('correct');
      setTimeout(() => {
          document.getElementById('currentTarget').classList.remove('correct');
          generateNewCountry();
      }, 500);
      updateGameDisplay();
  } else {
      document.getElementById('currentTarget').classList.add('wrong');
      audioManager.playSound('wrong');
      setTimeout(() => document.getElementById('currentTarget').classList.remove('wrong'), 500);
  }
}

function updateGameDisplay() {
  document.getElementById('gameScore').textContent = game.score;
  document.getElementById('gameTimer').textContent = game.timeLeft;
}

function endGame() {
  game.active = false;
  clearInterval(game.timerId);
  document.getElementById('gameResults').style.display = 'block';
  document.getElementById('gamePanel').style.display = 'none';
  document.getElementById('finalScore').textContent = game.score;
  audioManager.sounds.bgMusic.pause(); // Зміна з stop() на pause()
}

function restartGame() {
  endGame();
  startGame();
}

// Запуск додатка
let audioManager;

async function init() {
  try {
    audioManager = new AudioManager();
    showLoader();
    initScene();

    await new Promise(resolve => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve);
    });

    await Promise.all([
      createGlobe(),
      loadCountries(),
      new Promise(resolve => setTimeout(resolve, 2000))
    ]);

    initTooltip();
    animate();
    
    // Ініціалізація гри
    const gameOverlay = document.getElementById('gameOverlay');
    gameOverlay.style.display = 'block';
    gameOverlay.classList.add('active'); // Додаємо активний стан
    
    document.getElementById('startGameBtn').addEventListener('click', () => {
      audioManager.startAmbient(); // Запуск музики при старті гри
      startGame();
    });

  } catch (error) {
    console.error("Помилка ініціалізації:", error);
  } finally {
    hideLoader();
  }
}

// Функція кліку
function handleCountryClick(event) {
  audioManager.playSound('click');
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(globe);

  if (intersects.length > 0) {
      const intersectPoint = intersects[0].point;
      const { lat, lon } = cartesianToLatLon(intersectPoint);

      let foundCountry = null;
      let countryCode = null;

      for (const feature of countriesData) {
          const countryName = feature.properties.NAME || feature.properties.name;
          if (isPointInCountry(lat, lon, feature)) {
              foundCountry = countryName;
              countryCode = feature.properties.ISO_A2 || feature.properties.ISO_A3;
              break;
          }
      }

      // Special handling for Russia
      if (foundCountry === "Russia") {
          foundCountry = "Свиногорія";
          if (game.active) {
              handleGameClick(foundCountry);
              return;
          }
          showPigCountryStats();
          return;
      }

      // Handle game click if active
      if (game.active && foundCountry) {
          const normalize = (str) => str.toLowerCase().replace(/[^a-zа-яїієґ]/g, '');
          const target = normalize(game.currentCountry);
          const clicked = normalize(foundCountry);

          if (target === clicked) {
              game.score++;
              document.getElementById('currentTarget').classList.add('correct');
              audioManager.playSound('correct');
              setTimeout(() => {
                  document.getElementById('currentTarget').classList.remove('correct');
                  generateNewCountry();
              }, 500);
          } else {
              document.getElementById('currentTarget').classList.add('wrong');
              audioManager.playSound('wrong');
              setTimeout(() => {
                  document.getElementById('currentTarget').classList.remove('wrong');
              }, 500);
          }
          updateGameDisplay();
          return;
      }

      if (foundCountry && countryCode) {
          showCountryStats(foundCountry, countryCode);
      }
  }
}

// Запуск після завантаження
if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}