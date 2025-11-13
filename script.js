function initMap(mapDataUrl) {
  const map = L.map('map').setView([8.390397295307483, 124.88526599138835], 17);

  const openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 12,
    attribution: '&copy; OpenStreetMap contributors'
  });

  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles © Esri - Source: Esri, Maxar, Earthstar Geographics' }
  );

  openStreetMap.addTo(map);
  console.log("Base map tile layer loaded " + Date());

  const markerGroups = {};

  fetch(mapDataUrl)
    .then(response => response.json())
    .then(data => {
      data.forEach(pin => {
        const type = pin.locationType || "Other";

        if (!markerGroups[type]) {
          markerGroups[type] = L.layerGroup();
        }

        const marker = L.marker([pin.lat, pin.lng]);

        // When marker is clicked, update the info panel
        marker.on('click', () => {
          const infoPanel = document.getElementById('info-panel');
          infoPanel.innerHTML = `
            <img src="${pin.img}" alt="${pin.title}">
            <h3>${pin.title}</h3>
            <p><strong>Type:</strong> ${pin.locationType}</p>
            <p>${pin.description}</p>

          `;
        });

        markerGroups[type].addLayer(marker);
      });

      Object.values(markerGroups).forEach(group => group.addTo(map));

      const baseMaps = {
        "OpenStreetMap": openStreetMap,
        "Satellite": satellite
      };

      const overlayMaps = {};
      Object.keys(markerGroups).forEach(type => {
        overlayMaps[type] = markerGroups[type];
      });

      L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);
    })
    .catch(err => console.error('Error loading JSON', err));
}

document.addEventListener("DOMContentLoaded", () => {
  initMap('maps.json');
});
