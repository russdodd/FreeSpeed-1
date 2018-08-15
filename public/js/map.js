function normStat(data, min, max){
    data.features.forEach(function(ft){
        ft.properties["normStat"] = (ft.properties.stat - min)/(max - min) *100;
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

var mymap;
var gLayer;
function loadMap(dataToFormat,ind){
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

    function createFeatures(dataToFormat,ind){
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
        var maxStat = -10000;
        var minStat = 10000;
        dataToFormat.forEach(function(d) {
            var lat = d.GPSLat;
            var lng = d.GPSLon;
            var elem = {};
            var geometry = {};
            geometry['type'] = 'Point';
            geometry["coordinates"] = [lng, lat];
            elem['geometry'] = geometry;
            elem['type'] = 'Feature';
            elem['properties'] = {'popupContent': '', 'stat': d[ind], 'statName': ind};
            elem['id'] = count;
            count++;

            data["features"].push(elem);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            minStat = Math.min(d[ind], minStat);
            maxStat = Math.max(d[ind], maxStat);
        });
        bounds['minLat'] = minLat;
        bounds['minLng'] = minLng;
        bounds['maxLat'] = maxLat;
        bounds['maxLng'] = maxLng;

        return [data, bounds, minStat, maxStat];
    }

    var ret = createFeatures(dataToFormat,ind);
    var data = ret[0];
    var bounds = ret[1];
    var minStat = ret[2];
    var maxStat = ret[3];
    normStat(data, minStat, maxStat);
    console.log("data",data);


    var maxBounds = [[bounds.maxLat,bounds.minLng],[bounds.minLat, bounds.maxLng]];
    var key = "pk.eyJ1Ijoicndkb2RkIiwiYSI6ImNqa2Z4M2xnaTBkYW4zcG85b2tvcHE3bDgifQ.lVq9pLj0iBAvHH5IHXGOqw";


    var osm = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 20,
        minZoom: 10,
        id: 'mapbox.streets',
        accessToken: key
    });//.addTo(mymap);
    if (!!mymap){
        mymap.remove();
    }
    mymap = new L.Map('mapid', {
      zoom: 5,
      layers: [osm],
      maxBoundsViscosity: 0.5
  });
    
    
    mymap.setMaxBounds(maxBounds, {padding: [100,100]});
    mymap.fitBounds(maxBounds, {padding: [100,100]});
    mymap.setMaxBounds(mymap.getBounds().pad(0.1));
    mymap.setMinZoom(mymap.getBoundsZoom(mymap.getBounds()));

    /*mymap.on('drag', function() {
        mymap.panInsideBounds(maxBounds, { animate: false},{padding: [2000, 2000] });
    });*/


    function onEachFeature(feature, layer) {
        var popupContent = "<p>" +
        feature.properties.statName + ": " + 
        feature.properties.stat + "</p>";

        layer.on('mouseover', function() { layer.openPopup(); });
        layer.on('mouseout', function() { layer.closePopup(); });
        layer.bindPopup(popupContent);
    }
    gLayer = L.geoJSON(data, {

    style: function (feature) {
        return feature.properties && feature.properties.style;
    },
    onEachFeature:onEachFeature,
    pointToLayer: function (feature, latlng) {
        var col = perc2color(feature.properties.normStat);
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

/*$( document ).ready(function() {
    loadMap();
});*/