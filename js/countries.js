let countriesData = [];

// Завантаження кордонів країн
async function loadCountries() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries_ukr.geojson');
    
    if (!response.ok) {
      throw new Error(`HTTP помилка! Статус: ${response.status}`);
    }
    
    const geojson = await response.json();
    countriesData = geojson.features;
    
    geojson.features.forEach(feature => {
      const countryName = feature.properties.NAME;
      if (!countryName) return;
      
      const geometryType = feature.geometry.type;
      const coordinates = geometryType === 'MultiPolygon' 
        ? feature.geometry.coordinates.flat(1)
        : feature.geometry.coordinates;
      
      createCountryBorder(coordinates, countryName);
    });
    
  } catch (error) {
    console.error('Помилка завантаження кордонів:', error);
  }
}

// Створення кордонів країн
function createCountryBorder(coordinates, countryName) {
  coordinates.forEach(polygon => {
    const points = [];
    const isMultiPolygon = Array.isArray(polygon[0][0]);
    const rings = isMultiPolygon ? polygon : [polygon];
    
    rings.forEach(ring => {
      ring.forEach(coord => {
        const point = latLonToCartesian(coord[1], coord[0]);
        points.push(point);
      });
    });
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
      color: 0xffffff,
      linewidth: 1,
      transparent: true,
      opacity: 0.7
    });
    
    const line = new THREE.Line(geometry, material);
    line.name = countryName;
    line.userData = { 
      countryName: countryName,
      originalColor: material.color.clone() 
    };
    
    scene.add(line);
    countryMeshes.push(line);
  });
}

// Підсвітка країни
function highlightCountryByName(countryName) {
  if (currentHighlightedCountry === countryName) return;
  countryMeshes.forEach(mesh => {
    if (mesh.userData.countryName === currentHighlightedCountry) {
      mesh.material.color.copy(mesh.userData.originalColor);
      mesh.material.opacity = 0.7;
    }
  });
  countryMeshes.forEach(mesh => {
    if (mesh.userData.countryName === countryName) {
      mesh.material.color.set(0x00ff00);
      mesh.material.opacity = 1;
    }
  });
  currentHighlightedCountry = countryName;
}

// Очищення підсвітки
function clearHighlight() {
  countryMeshes.forEach(mesh => {
    mesh.material.color.copy(mesh.userData.originalColor);
    mesh.material.opacity = 0.7;
  });
  currentHighlightedCountry = null;
}