    var map = L.map('map').setView([coordinates[1], coordinates[0]], 9);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19  
}).addTo(map);


// console.log(coordinates);
// Add marker
  L.marker([coordinates[1], coordinates[0]]) // [lat, lng]
    .addTo(map)
    .bindPopup(`<h4>${locationName}</h4><p>Exact location shown after booking</p>`)
   