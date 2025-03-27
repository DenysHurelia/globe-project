// Глобальні змінні для елементів DOM
let modal, countryNameElement, statsContentElement, closeModalButton;

// Ініціалізація підказок
function initTooltip() {
    // Отримуємо елементи DOM
    modal = document.getElementById('countryModal');
    countryNameElement = document.getElementById('countryName');
    statsContentElement = document.getElementById('statsContent');
    closeModalButton = document.querySelector('.close-modal');
    
    // Перевіряємо, чи всі елементи існують
    if (!modal || !countryNameElement || !statsContentElement || !closeModalButton) {
        console.error('Не вдалося знайти всі необхідні DOM елементи');
        return;
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const tooltip = document.getElementById('countryTooltip');
    const highlight = document.getElementById('highlight');
    
    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(globe);
        if (intersects.length > 0) {
            const intersectPoint = intersects[0].point;
            const { lat, lon } = cartesianToLatLon(intersectPoint);
            
            let foundCountry = null;
            for (const feature of countriesData) {
                const countryName = feature.properties.NAME || feature.properties.name;
                if (isPointInCountry(lat, lon, feature)) {
                    foundCountry = countryName;
                    break;
                }
            }
            
            if (foundCountry === "Russia" && isPointInCrimea(lat, lon)) {
                foundCountry = "Ukraine";
            }
            
            if (foundCountry) {
                highlightCountryByName(foundCountry);
                tooltip.style.opacity = '1';
                tooltip.style.left = `${event.clientX + 15}px`;
                tooltip.style.top = `${event.clientY - 10}px`;
                tooltip.textContent = foundCountry;
                
                highlight.style.display = 'block';
                highlight.style.width = `${HIGHLIGHT_RADIUS * 100}px`;
                highlight.style.height = `${HIGHLIGHT_RADIUS * 100}px`;
                highlight.style.left = `${event.clientX}px`;
                highlight.style.top = `${event.clientY}px`;
            } else {
                clearHighlight();
                tooltip.style.opacity = '0';
                highlight.style.display = 'none';
            }
        }
    }
    
    function handleCountryClick(event) {
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
            
            // Спеціальна обробка для росії
            if (foundCountry === "Russia") {
                foundCountry = "Свиногорія";
                showPigCountryStats();
                return;
            }
            
            if (foundCountry && countryCode) {
                showCountryStats(foundCountry, countryCode);
            }
        }
    }
    
    // Спеціальна функція для відображення "статистики" Свиногорії
    function showPigCountryStats() {
        const pigFlagUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZtlicUc7jmwmLkYExvgQ6zdC3XteD2r3Z2w&s";
        
        statsContentElement.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Столиця:</span>
                <span class="stat-value">Москва (тимчасово не окупована)</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Населення:</span>
                <span class="stat-value">140 млн (з них 100% свиней)</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Площа:</span>
                <span class="stat-value">17 млн км² (легально 0)</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Валюта:</span>
                <span class="stat-value">Свинарабль (SBR)</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Мови:</span>
                <span class="stat-value">Свиняча</span>
            </div>
            <div style="margin-top: 20px; text-align: center;">
                <img src="${pigFlagUrl}" alt="Прапор Свиногорії" style="max-width: 200px; border: 1px solid #444;">
            </div>
        `;
        
        countryNameElement.textContent = "Свиногорія";
        modal.style.display = 'block';
        modal.classList.add('open');
    }
    
    async function showCountryStats(countryName, countryCode) {
        console.log(`Запит даних для ${countryName} (${countryCode})`);
        statsContentElement.innerHTML = '<p class="loading-text">Завантаження даних...</p>';
        countryNameElement.textContent = countryName;
        modal.style.display = 'block';
        modal.classList.add('open');
        
        try {
            // Використовуємо REST Countries API
            const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode.toLowerCase()}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            displayCountryStats(data[0]); // Беремо перший елемент масиву
        } catch (error) {
            console.error('Помилка отримання даних:', error);
            statsContentElement.innerHTML = `
                <p class="loading-text">Не вдалося завантажити дані</p>
                <p style="color: #aaa; font-size: 14px;">${error.message}</p>
            `;
        }
    }
    
    function displayCountryStats(countryData) {
        const { capital, population, area, currencies, languages, flags } = countryData;
        const currency = currencies ? Object.values(currencies)[0] : null;
        
        let html = `
            <div class="stat-row">
                <span class="stat-label">Столиця:</span>
                <span class="stat-value">${capital?.[0] || 'Н/Д'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Населення:</span>
                <span class="stat-value">${population ? population.toLocaleString() : 'Н/Д'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Площа:</span>
                <span class="stat-value">${area ? `${area.toLocaleString()} км²` : 'Н/Д'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Валюта:</span>
                <span class="stat-value">${currency ? `${currency.name} (${currency.symbol || ''})` : 'Н/Д'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Мови:</span>
                <span class="stat-value">${languages ? Object.values(languages).join(', ') : 'Н/Д'}</span>
            </div>
        `;
        
        // Додаємо прапор, якщо він є
        if (flags?.png) {
            html += `
                <div style="margin-top: 20px; text-align: center;">
                    <img src="${flags.png}" alt="Прапор" style="max-width: 100px; border: 1px solid #444;">
                </div>
            `;
        }
        
        statsContentElement.innerHTML = html;
    }
    
    // Обробники подій
    closeModalButton.addEventListener('click', () => {
        modal.classList.remove('open');
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('open');
        }
    });

    // Встановлюємо обробники
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', handleCountryClick);
    
    console.log("Обробники подій встановлено");
}