/***********************************************************
 * Author: Maverick Sanchez
 * For UCI Homework # 17 - Leaflet web viz
 * *********************************************************
 */

/***********************************************************
 * Set up US center
 * *********************************************************
 */

let us_latlng = {
    lat: 37.8,
    lng: -96.9
};

/***********************************************************
 * Set up tiles to create base maps
 * *********************************************************
 */

let satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 12,
    id: "mapbox.streets-satellite",
    accessToken: API_KEY
});

let outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 12,
    id: "mapbox.outdoors",
    accessToken: API_KEY
});

let whitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 12,
    id: "mapbox.light",
    accessToken: API_KEY
});


/***********************************************************
 * Functions to color legends and convert time from API
 * *********************************************************
 */

let markerSize = d3.scaleLinear()
    .domain([0, 8])
    .range([0, 30]);

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

/***********************************************************
 * Functions that will be called from inside GeoJson parsing
 * *********************************************************
 */

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: function (event) { layer = event.target; },
        mouseout: function (event) { geoJson.resetStyle(event.target); }
    });
    
    layer.bindTooltip("<b>Time:</b> " + time_converter(parseInt(feature.properties.time)) + 
                        " <b>Magnitude:</b> " + feature.properties.mag + "<br> <b>Place:</b> " + feature.properties.place);
    
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
const plateData = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// We will utilize featureGroup (extension of LayerGroup) so we can use bring to front
let geoJson, plateJson;
let geoJsonLayer = L.featureGroup();
let plateJsonLayer = L.featureGroup();

// Grabbing our GeoJSON eartquake
d3.json(geoData, function (data) {
    geoJson = L.geoJson(data, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
    }).addTo(geoJsonLayer);
});

// Grabbing our GeoJSON plates
d3.json(plateData, function (data) {
    plateJson = L.geoJson(data, {
        style: { 
            color: "darkorange",
            fillOpacity: 0
        }
    }).addTo(plateJsonLayer);
});


/***********************************************************
 * Set up controls
 * *********************************************************
 */

let myMap = L.map("map", {
    center: [us_latlng.lat, us_latlng.lng],
    zoom: 4.4,
    layers: [satellitemap, geoJsonLayer, plateJsonLayer]
});

let legend = L.control({ position: 'bottomright' });
legend.onAdd = addLegend;
legend.addTo(myMap);

let baseMaps = {
    "Satellite Map": satellitemap,
    "Grayscale Map": whitemap,
    "Outdoor Map": outdoormap
};

let overLayMaps = {
    "Earthquake": geoJsonLayer,
    "Plates": plateJsonLayer
};

L.control.layers(baseMaps, overLayMaps, { collapsed: false }).addTo(myMap);

/***********************************************************
 * When the layers are interchanged, the bubble map has to be on top
 * *********************************************************
 */

myMap.on("overlayadd", function () {
    geoJsonLayer.bringToFront();
});

