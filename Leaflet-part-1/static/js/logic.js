//  United States Geological Survey All Earthquakes from the Past 7 Days
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(url).then(function(data) {

    // Store the imported data to earthquakesData variable
    var earthquakesData = data;
    // Print the data
    console.log(earthquakesData);

    // Print the object keys
    console.log(Object.keys(earthquakesData));

    // Get the date that the data was generated
    var dataDate = new Date(earthquakesData.metadata.generated);
 
    // Create a object list with the target data columns
    var newData = [];
    for (var i = 0; i < earthquakesData.features.length; i++) {
        var time = new Date(earthquakesData.features[i].properties.time);
        newData.push({
            "time": time.toLocaleTimeString("en-US", options),
            "title": earthquakesData.features[i].properties.title,
            "url": earthquakesData.features[i].properties.url,
            "lat": earthquakesData.features[i].geometry.coordinates[0],
            "lon": earthquakesData.features[i].geometry.coordinates[1],
            "mag": earthquakesData.features[i].properties.mag,
            "depth": earthquakesData.features[i].geometry.coordinates[2]
        });
    };
    console.log(newData);

    // Create a geoJSON layer containing the features array and add a popup for each marker and send the layer to the createMap() function.
    let earthquakes = L.geoJSON(data.features, {
        onEachFeature: addPopup
    });

    // Call the function to load the map and the circles
    createMap(earthquakes, newData);
});

// Define the time format
var options = { year: 'numeric', month: 'numeric', day: 'numeric' };
options.timeZone = 'UTC';

// Define a function for each feature in the features array
function addPopup(feature, layer) {

    // Give each feature a popup describing the place and time of the earthquake
    return layer.bindPopup(`<h3> ${feature.properties.place} </h3> <hr> <p> ${Date(feature.properties.time)} </p>`);
}

// function to receive a layer of markers and plot map
function createMap(earthquakes, data) {

    // Define the base layers.
    var attribution =
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    var titleUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var OpenStreetMap = L.tileLayer(titleUrl, { attribution });

    // Creating a baseMaps object to base layers
    var baseMaps = {
        "OpenStreet": OpenStreetMap
    };


    // Create the circles for each data point 
    var earthquakeCircles = [];
    data.forEach(function (element) {

        // Select the color of the circle based on the depth of the earthquake
        var color = "";
        if (element.depth < 10) {
            color = "#80ff00";
        }
        else if (element.depth < 30) {
            color = "#bfff00";
        }
        else if (element.depth < 50) {
            color = "#ffff00";
        }
        else if (element.depth < 70) {
            color = "#ffc100";
        }
        else if (element.depth < 90) {
            color = "#ff7400";
        }
        else {
            color = "#ff0000";
        }

        // create a circles array
        circles = L.circle([element.lon, element.lat], {
            fillOpacity: .7,
            color: "black",
            weight: .5,
            fillColor: color,
            radius: element.mag * 18000
        }).bindPopup(`<h6 style="font-weight: bold;">${element.title}</h6> <hr> 
            <p>Date: ${element.time} UTC</p> 
            <p>Magnitude: ${element.mag} ml</p>
            <p>Depth: ${element.depth} km</p>
            <a href="${element.url}" target="_blank">More details...</a>`);
        earthquakeCircles.push(circles);
    });

    // Create a layerGroup for state's markers.
    var earthquakeLayer = L.layerGroup(earthquakeCircles);

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [40, -110],
        zoom: 5,
        fullscreenControl: true,
        layers: [OpenStreetMap, earthquakeLayer]

    });

    // Create a legend
    var myColors = ["#80ff00", "#bfff00", "#ffff00", "#ffc100", "#ff7400", "#ff0000"];
 
    var legend = L.control({position:'bottomright'});
    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend');
        labels = ["<div style='background-color: lightgray'><strong>&nbsp&nbspDepth (km)&nbsp&nbsp</strong></div>"];
        categories = ['-10 to 10', ' 10 to 30', ' 30 to 50', ' 50 to 70', ' 70 to 90', '90 above'];
        for (var i = 0; i < categories.length; i++) {
            div.innerHTML +=
                labels.push(
                    '<li class="circle" style="background-color:' + myColors[i] + '">' + categories[i] + '</li> '
                );
        }
        div.innerHTML = '<ul style="list-style-type:none; text-align: center">' + labels.join('') + '</ul>'
        return div;
    };
    legend.addTo(myMap);

    // Adding a Scale to the map
    L.control.scale()
        .addTo(myMap);

    // Create a layer control, Pass in our baseMaps and overlayMaps adding the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
    }).addTo(myMap);
};