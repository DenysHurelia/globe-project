# 3D Глобус з інформацією про країни 🌍

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) 
[![Three.js](https://img.shields.io/badge/Three.js-r128-blue.svg)](https://threejs.org/)

## 📌 Опис
Інтерактивний 3D глобус з:
- Підсвічуванням країн при наведенні
- Інформаційними підказками
- Плавним обертанням

![image](https://github.com/user-attachments/assets/3722b773-1328-49f4-9dc0-e0bd06da30c9)

## 🛠 Технології
```javascript
// Основні технології:
- Three.js (для 3D візуалізації)
- OrbitControls (для навігації)
- TopoJSON (для обробки геоданих)
- Natural Earth (кордони країн)
```

## 🚀 Інструкція з запуску

 1. Клонуйте репозиторій
```git clone https://github.com/DenysHurelia/globe-project.git```

 2. Перейдіть у папку проекту
```cd globe-project```

 3. Запустіть (виберіть один варіант):
 Варіант 1: Відкрийте index.html у браузері
 Варіант 2 (рекомендовано): Запустіть локальний сервер
```npx serve```

## 📂 Структура проекту
```
├── css
│   ├── styles.css
├── js
│   ├── constants.js
│   ├── countries.js
│   ├── globe.js
│   ├── helpers.js
│   ├── main.js
│   ├── tooltip.js
└── index.html
```

## ⚙️ Налаштування

// У файлі index.html знайдіть і змініть:

```
const GLOBE_RADIUS = 5;          // Розмір глобуса
controls.autoRotateSpeed = 0.5;  // Швидкість обертання
highlightColor = 0x00ff00;       // Колір підсвічування
```
