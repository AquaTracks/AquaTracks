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
            <p>${pin.description}</p>

            <canvas id="pinChart1" width="300" height="200"></canvas>
            <canvas id="pinChart2" width="300" height="200"></canvas>
            <canvas id="pinChart3" width="300" height="200"></canvas>
          `;

          loadPinChart(pin.chart1, "pinChart1");
          loadPinChart(pin.chart2, "pinChart2");
          loadPinChart(pin.chart3, "pinChart3");
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

class LineChart {
  constructor(canvasId, dataUrl) {
    this.canvasId = canvasId;
    this.dataUrl = dataUrl;
    this.chart = null;
  }

  renderChart(data) {
    const ctx = document.getElementById(this.canvasId).getContext("2d");
    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [{
          label: "Water Availability",
          data: data.values,
          borderwidth: 2
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  async fetchData() {
    try {
      const response = await fetch(this.dataUrl);
      if (!response.ok) throw new Error('Failed to load data');

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }

  async init() {
    const data = await this.fetchData();
    if (data) {
      this.renderChart(data);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const chart = new LineChart("linechart", "linedata.json");
  chart.init();
});

let activeCharts = {};

async function loadPinChart(dataUrl, canvasId) {
  const response = await fetch(dataUrl);
  const chartData = await response.json();

  const ctx = document.getElementById(canvasId).getContext("2d");

  if (activeCharts[canvasId]) {
    activeCharts[canvasId].destroy();
  }

  activeCharts[canvasId] = new Chart(ctx, {
    type: "line",
    data: {
      labels: chartData.labels,
      datasets: [{
        label: "Water Availability",
        data: chartData.values,
        borderWidth: 2
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
