// Показати лоадер
function showLoader() {
    document.getElementById('loader').style.display = 'flex';
  }
  
  // Сховати лоадер
  function hideLoader() {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none'; // Дозволяє кліки через лоадер
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
  let audioManager;
  
  async function init() {
    try {
      audioManager = new AudioManager();
      showLoader();
      initScene();
  
      // Чекаємо на завантаження DOM
      await new Promise(resolve => {
        if (document.readyState === 'complete') resolve();
        else window.addEventListener('load', resolve);
      });
  
      // Завантажуємо основні компоненти
      await Promise.all([
        createGlobe(),
        loadCountries(),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
  
      initTooltip();
      animate();
      
    } catch (error) {
      console.error("Помилка ініціалізації:", error);
    } finally {
      hideLoader(); // Гарантоване приховування лоадера
    }
    
    // Ініціалізація кнопки паузи
    const playPauseButton = document.getElementById('playPauseButton');
    if (playPauseButton) {
      playPauseButton.addEventListener('change', function(e) {
        isPaused = !e.target.checked;
        controls.autoRotate = e.target.checked;
      });
    }
  }

// Запускаємо після завантаження
if (document.readyState === 'complete') {
    init();
} else {
    window.addEventListener('load', init);
}