function normWatts(data, max){
    data.features.forEach(function(ft){
        ft.properties["normPower"] = Math.max(ft.properties.power - 100, 0)/(max - 100) *100;
    });
}

function perc2color(perc) {
    var r, g, b = 0;
    if(perc > 50) {
        r = 255;
        g = Math.round(510 - 5.10 * perc);
    }
    else {
        g = 255;
        r = Math.round(5.10 * perc);
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
}

var mymap = L.map('mapid').setView([39.74739, -105], 13);
var gLayer;
function loadMap(data){
if(!!gLayer){
    mymap.removeLayer(gLayer);
}
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

function createFeatures(dataToFormat){
    var count = 0;
    var data = {};
    var bounds = {};
    var data = {}
    data["type"] = "FeatureCollection";
    data["features"] = [];
    var minLat = 500;
    var maxLat = -500;
    var minLng = 500;
    var maxLng = -500;
    var maxWatts = 0;
    var minWatts = 2000;
    dataToFormat.forEach(function(d) {
        var lat = d.GPSLat;
        var lng = d.GPSLon;
        var elem = {};
        var geometry = {};
        geometry['type'] = 'Point';
        geometry["coordinates"] = [lng, lat];
        elem['geometry'] = geometry;
        elem['type'] = 'Feature';
        elem['properties'] = {'popupContent': '', 'power': d.power};
        elem['id'] = count;
        count++;

        data["features"].push(elem);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minWatts = Math.min(d.power, minWatts);
        maxWatts = Math.max(d.power, maxWatts);
    });
    bounds['minLat'] = minLat;
    bounds['minLng'] = minLng;
    bounds['maxLat'] = maxLat;
    bounds['maxLng'] = maxLng;

    return [data, bounds, minWatts, maxWatts];
}

    var ret = createFeatures(data);
    var data = ret[0];
    var bounds = ret[1];
    var minWatts = ret[2];
    var maxWatts = ret[3];
    normWatts(data, maxWatts);
    /*console.log("my_data", my_data);
    var count = 0;
    var data = {};
    data["type"] = "FeatureCollection";
    data["features"] = [];
    var minLat = 500;
    var maxLat = -500;
    var minLng = 500;
    var maxLng = -500;

    Object.keys(my_data).forEach(function(key) {
        var lat = my_data[key][0];
        var lng = my_data[key][1];
        var elem = {};
        var geometry = {};
        geometry['type'] = 'Point';
        geometry["coordinates"] = [lat, lng];
        elem['geometry'] = geometry;
        elem['type'] = 'Feature';
        elem['properties'] = {'popupContent': ''};
        elem['id'] = count;
        count++;

        data["features"].push(elem);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
    });
    console.log("[[maxLat, maxLng],[minLat, minLng]]", [[maxLat, maxLng],[minLat, minLng]]);
    console.log("data", data);*/


      //.setView([-120.12,36.98], 13);
    var key = "pk.eyJ1Ijoicndkb2RkIiwiYSI6ImNqa2Z4M2xnaTBkYW4zcG85b2tvcHE3bDgifQ.lVq9pLj0iBAvHH5IHXGOqw";

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: key
    }).addTo(mymap);
      mymap.fitBounds([[bounds.maxLat,bounds.maxLng],[bounds.minLat, bounds.minLng]], {padding: [20, 20]});

    var myLines = [{
        "type": "LineString",
        "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
    }, {
        "type": "LineString",
        "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
    }];

    L.geoJSON(myLines).addTo(mymap);


      function onEachFeature(feature, layer) {
        var popupContent = "<p>Power: " +
                feature.properties.power + "</p>";

        layer.on('mouseover', function() { layer.openPopup(); });
        layer.on('mouseout', function() { layer.closePopup(); });
        layer.bindPopup(popupContent);
    }
    /*var group = new L.featureGroup;

        // map._layers gives all the layers of the map including main container
        // so looping in all those layers filtering those having feature   
        data['features'].forEach(function(ft){

           // here we can be more specific to feature for point, line etc.     
                 ft.geometry
         });

         console.log(group.getBounds());*/
      gLayer = L.geoJSON(data, {

        style: function (feature) {
            return feature.properties && feature.properties.style;
        },
        onEachFeature:onEachFeature,
        pointToLayer: function (feature, latlng) {
            var col = perc2color(feature.properties.normPower);
            return L.circleMarker(latlng, {
                radius: 7,
                fillColor: col,//"#ff7800",
                color: col,//"#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        }
    }).addTo(mymap);

}
/*L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);*/




/*
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 50
}).addTo(mymap);

L.marker([51.5, -0.09]).addTo(mymap)
    .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    .openPopup();*/
//d3.json("./../data_test/stations.json", function(error, my_data) {
 //     if (error) throw error;

    /*var bound = new google.maps.LatLngBounds();

    for (m in my_data){
        long = +my_data[m].longitude
        lat = +my_data[m].latitude

        bound.extend(new google.maps.LatLng(lat,long));
    }

    d3.selectAll('#map').attr("width",width-200);

    var map = new google.maps.Map(d3.select('#d3Graph').node(), {
        zoom: 1,
        center: new google.maps.LatLng(-25.363, 131.044),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    });

    map.fitBounds(bound);

    var overlay = new google.maps.OverlayView();

    overlay.onAdd = function() {
        var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
        .attr("class", "effective");

        overlay.draw = function() {
            var projection = this.getprojection(), padding = 10;

            var marker = layer.selectAll("svg")
            .data(my_data)
            .each(transform)
            .enter().append("svg")
            .each(transform)
            .attr("class", "marker");

            

            marker.append("circle")
            .attr("r", 12)
            .attr("cx", padding+5)
            .attr("cy", padding+5);

        function transform(d) {
                d = new google.maps.LatLng(+d.latitude, +d.longitude);
                d = projection.fromLatLngToDivPixel(d);
                return d3.select(this)
                .style("left", (d.x - padding) + "px")
                .style("top", (d.y - padding) + "px");
            }
        }
    }
    overlay.setMap(map);*/
//});


/*$( document ).ready(function() {
    loadMap();
});*/