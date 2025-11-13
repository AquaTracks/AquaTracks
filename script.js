    function initMap(mapDataUrl){
        const map = L.map('map').setView([8.3603,124.8684],17);

    const openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom:19,
        attribution:'&copy; OpenStreetMap contributors'
    });

    const satellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {attribution:'Tiles (c) Esri - Source: Esri, Maxar, Earthstar Geographics, GIS User Community'}
    );   


    openStreetMap.addTo(map);
    console.log("Base map tile layer loaded" + Date());

    const markerGroups ={};

    fetch(mapDataUrl)
        .then(response => response.json())
        .then(data => {
            data.forEach( pin => {
                const type = pin.locationType || "Other";

                if(!markerGroups[type]){
                    markerGroups[type] = L.layerGroup();
                }

                const marker = L.marker([pin.lat,pin.lng]).addTo(map);
                const img = `<img src='${pin.img}' class="popup-image">`;
                marker.bindPopup(`${img}<br><b> ${pin.title} </b><br> ${pin.description}<br> ${pin.locationType}`);
                console.log(`${pin.name} Loaded ` +Date());

                markerGroups[type].addLayer(marker);
            });


            Object.values(markerGroups).forEach(group => group.addTo(map));

            const baseMaps={
                "OpenStreetMap":openStreetMap,
                "Satellite": satellite
            }

            const overlayMaps={};

            Object.keys(markerGroups).forEach(type=>{
                overlayMaps[type] = markerGroups[type];
            });
            

            L.control.layers(baseMaps,overlayMaps,{collapsed:false}).addTo(map);
        })
        .catch(err => console.error('Error loading JSON', err));
    }
document.addEventListener("DOMContentLoaded",()=>{
    initMap('maps.json');
;});