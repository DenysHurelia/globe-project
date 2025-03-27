// Показати лоадер
function showLoader() {
    document.getElementById('loader').style.display = 'flex';
  }
  
  // Сховати лоадер
  function hideLoader() {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
      document.getElementById('globeCanvas').style.opacity = '1';
      document.getElementById('playPauseButton').style.display = 'block';
    }, 500);
  }
  
  // Обробник кнопки паузи
  document.getElementById('playPauseButton').addEventListener('change', function(e) {
    isPaused = !e.target.checked;
    controls.autoRotate = e.target.checked;
  });
  
  // Запуск додатка
  async function init() {
    showLoader();
    initScene();
    
    // Чекаємо на завантаження DOM
    await new Promise(resolve => {
        if (document.readyState === 'complete') {
            resolve();
        } else {
            window.addEventListener('load', resolve);
        }
    });
    
    console.log("DOM завантажено, ініціалізація сцени...");
    
    await Promise.all([
        createGlobe(),
        loadCountries(),
        new Promise(resolve => setTimeout(resolve, 2000)) // Мінімальний час завантаження
    ]);
    
    console.log("Сцена створена, ініціалізація підказок...");
    initTooltip();
    
    console.log("Запуск анімації...");
    animate();
    hideLoader();
    
    // Обробник кнопки паузи
    const playPauseButton = document.getElementById('playPauseButton');
    if (playPauseButton) {
        playPauseButton.addEventListener('change', function(e) {
            isPaused = !e.target.checked;
            controls.autoRotate = e.target.checked;
        });
    }
    
    console.log("Ініціалізація завершена");
}

// Запускаємо після завантаження
if (document.readyState === 'complete') {
    init();
} else {
    window.addEventListener('load', init);
}