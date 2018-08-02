/*var width = 700;
var height = 580;

// Create SVG
var svg2 = d3.select( "body" )
    .append( "svg" )
    .attr( "width", width )
    .attr( "height", height );

// Append empty placeholder g element to the SVG
// g will contain geometry elements
var g2 = svg2.append( "g" );
aa = [-122.490402, 37.786453]; //Added from block
  bb = [-122.389809, 37.72728]; //Added from block
var albersProjection = d3.geoAlbers()
    .scale(1000) //Added from block
    .center([-106, 37.5]); //Added from block
    .translate( [width/2,height/2] );

var geoPath = d3.geoPath()
    .projection( albersProjection );

g2.selectAll( "path" )
    .data( neighborhoods_json.features )
    .enter()
    .append( "path" )
    .attr( "fill", "#ccc" )
    .attr( "stroke", "#333")
    .attr( "d", geoPath );*/

    <!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Point on a map D3</title>

<script src="http://d3js.org/d3.v4.min.js" charset="utf-8"></script>
<script src="http://d3js.org/topojson.v1.min.js"></script>

<style type="text/css">
    .feature {
        fill: none;
        stroke: grey;
        stroke-width: 1px;
        stroke-linejoin: round;
    }
    .mesh {
        fill: none;
        stroke: lightgrey;
        stroke-width: 2px;
        stroke-linejoin: round;
    }
    h1 {
        font-family: sans-serif;
    }
</style>
</head>
<body>
    <h1>Point in the north west part of SF</h1>


<script type="text/javascript">

var width = 950,
    height = 550;

// set projection
var projection = d3.geoMercator();

// create path variable
var path = d3.geoPath()
    .projection(projection);


d3.json("us.json", function(error, topo) { console.log(topo);

    states = topojson.feature(topo, topo.objects.states).features

    // set projection parameters
    projection
      .scale(1000)
      .center([-106, 37.5])

      var margin = {top: 50, right: 100, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    // create svg variable
    var svg = d3.select("#d3Graph").append("svg")
    .attr("id", "svg1")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var svg = d3.select("svg :first-child");

    // points
    aa = [-122.490402, 37.786453];
    bb = [-122.389809, 37.72728];

    console.log(projection(aa),projection(bb));

    // add states from topojson
    svg.selectAll("path")
      .data(states).enter()
      .append("path")
      .attr("class", "feature")
      .style("fill", "steelblue")
      .attr("d", path);

    // put boarder around states 
    svg.append("path")
      .datum(topojson.mesh(topo, topo.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);

    // add circles to svg
    svg.selectAll("circle")
        .data([aa,bb]).enter()
        .append("circle")
        .attr("cx", function (d) { console.log(projection(d)); return projection(d)[0]; })
        .attr("cy", function (d) { return projection(d)[1]; })
        .attr("r", "8px")
        .attr("fill", "red")

});

</script>
    
</body>
</html>