var width = 700;
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
    .center([-106, 37.5]);/* //Added from block
    .translate( [width/2,height/2] );*/

var geoPath = d3.geoPath()
    .projection( albersProjection );

g2.selectAll( "path" )
    .data( neighborhoods_json.features )
    .enter()
    .append( "path" )
    .attr( "fill", "#ccc" )
    .attr( "stroke", "#333")
    .attr( "d", geoPath );