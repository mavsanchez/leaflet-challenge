/***********************************************************
 * Author: Maverick Sanchez
 * For UCI Homework # 17 - Leaflet web viz
 * *********************************************************
 */

/***********************************************************
 * Set up chart sizes
 * *********************************************************
 */

let us_latlng = {
    lat: 37.8,
    lng: -96.9
};

/***********************************************************
 * Set up tiles and controls
 * *********************************************************
 */

let streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 12,
    id: "mapbox.streets",
    accessToken: API_KEY
});

let darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 12,
    id: "mapbox.dark",
    accessToken: API_KEY
})

// Define a baseMaps object to hold our base layers
let baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
};

let myMap = L.map("map", {
    center: [us_latlng.lat, us_latlng.lng],
    zoom: 4.4,
    layers: [streetmap]
});

L.control.layers(baseMaps).addTo(myMap);

/***********************************************************
 * Functions to color legends and convert time from API
 * *********************************************************
 */

let markerSize = d3.scaleLinear()
    .domain([0, 8])
    .range([0, 50]);

function colorScale(val){
    if(val>=0 && val<1){ return "green"}
    else if (val >= 1 && val < 2) { return "yellow" }
    else if (val >= 2 && val < 3) { return "gold" }
    else if (val >= 3 && val < 4) { return "orange" }
    else if (val >= 4 && val < 5) { return "darkorange" }
    else { return "red" }
    
} 

function time_converter(timeval){
    let date = new Date(timeval * 1000)
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
}

function onEachFeature(feature, layer, latlng) {
    layer.on({
        mouseover: function (event) {
            layer = event.target;
        },
        mouseout: function (event) {
            geoJson.resetStyle(event.target);
        }
    });
    
    layer.bindTooltip("<b>Time:</b> " + time_converter(parseInt(feature.properties.time)) + " <b>Magnitude:</b> " + feature.properties.mag + "<br> <b>Place:</b> " + feature.properties.place);
}

function pointToLayer(feature, latlng) {
    return L.circleMarker(latlng, {
        fillOpacity: 0.75,
        color: "black",
        weight: 0.3,
        fillColor: colorScale(feature.properties.mag),
        radius: markerSize(feature.properties.mag)
    });
}

function addLegend() {
    let div = L.DomUtil.create('div', 'info legend'),
        magnitude = [0, 1, 2, 3, 4, 5],
        labels = [], from, to;

    for (let i = 0; i < magnitude.length; i++) {
        from = magnitude[i];
        to = magnitude[i + 1];
        labels.push('<i style="background:' + colorScale(from) + '"></i> ' + from + (to ? '&ndash;' + to : '+'));
    }
    div.innerHTML = labels.join('<br>');
    return div;
}

/***********************************************************
 * Parse USGS geojspn
 * *********************************************************
 */
const geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Grabbing our GeoJSON data..
d3.json(geoData, function (data) {

    geoJson = L.geoJson(data, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    }).addTo(myMap);

    let legend = L.control({ position: 'bottomright' });
    legend.onAdd = addLegend;
    legend.addTo(myMap);

});