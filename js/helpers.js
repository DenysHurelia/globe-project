// Допоміжні функції
function latLonToCartesian(lat, lon) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta),
      GLOBE_RADIUS * Math.cos(phi),
      GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta)
    );
  }
  
  function cartesianToLatLon(v) {
    const phi = Math.acos(v.y / GLOBE_RADIUS);
    const lat = 90 - phi * 180 / Math.PI;
    let theta = Math.atan2(v.z, -v.x);
    let lon = theta * 180 / Math.PI - 180;
    if(lon < -180) lon += 360;
    if(lon > 180) lon -= 360;
    return { lat, lon };
  }
  
  function pointInPolygon(lat, lon, vs) {
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0], yi = vs[i][1];
      const xj = vs[j][0], yj = vs[j][1];
      const intersect = ((yi > lat) !== (yj > lat)) &&
                        (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }
  
  function isPointInCountry(lat, lon, feature) {
    if (feature.geometry.type === 'Polygon') {
      return pointInPolygon(lat, lon, feature.geometry.coordinates[0]);
    } else if (feature.geometry.type === 'MultiPolygon') {
      for (let i = 0; i < feature.geometry.coordinates.length; i++) {
        if (pointInPolygon(lat, lon, feature.geometry.coordinates[i][0])) {
          return true;
        }
      }
    }
    return false;
  }
  
  function isPointInCrimea(lat, lon) {
    return lat >= 44 && lat <= 47 && lon >= 32 && lon <= 37;
  }