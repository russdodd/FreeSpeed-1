var ind1 = "elapsedTime";
var ind2 = "power";
var username = ""
var global_data = [];

var margin = {top: 20, right: 100, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%H:%M:%S.%L").parse,
    bisectDate = d3.bisector(function(d) { return d[ind1]; }).left,
    formatValue = d3.format(",.2f"),
    formatTime = d3.time.format("%H:%M:%S"),
    formatCurrency = function(d) { return formatValue(d); };

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d[ind1]); })
    .y(function(d) { return y(d[ind2]); });

function d3Init(){
  var data = [];
  /*if (n==global_data.length){
    global_data.forEach(function(d){
      data = data.concat(d);
    });
  } else {
    data = global_data[n];
  }*/
  data = global_data[username];
  console.log(username);
  console.log(data);
  x.domain(d3.extent(data, function(d) { return d[ind1]; }));
  y.domain(d3.extent(data, function(d) { return d[ind2]; }));
  console.log("x",x);
  
  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]);
    console.log("mouse", d3.mouse(this)[0]);
    console.log("x0",x0);
    var i = bisectDate(data, x0, 1);
    console.log("i",i);
    var d0 = data[i - 1];
    var d1 = data[i];
    console.log("d1",d1);
    var d = x0 - d0[ind1] > d1[ind1] - x0 ? d1 : d0;
    var time = 
    focus.attr("transform", "translate(" + x(d[ind1]) + "," + y(d[ind2]) + ")");
    focus.select("text").text(formatCurrency(d[ind2]) + ", " + formatTime(d[ind1]));
    console.log("d",d);

  }

  var svg = d3.select("svg :first-child");

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("fill", "none")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end");

  
      drawLines([data], svg);


  var focus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("circle")
      .attr("r", 4.5);

  focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

  svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);

}

function drawLines(data,svg) {
  for (var dataIdx = 0; dataIdx < data.length; dataIdx++){
  svg.append("path")
      .datum(data[dataIdx])
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  }
}
/*
function makeUL() {
    $("#dataRadios").empty();
    var list = $("#dataRadios")[0];

    for(var i = 0; i < global_data.length + 1; i++) {
        var item = document.createElement('li');

        var x = document.createElement("INPUT");
        x.setAttribute("type", "radio");
        x.setAttribute("id", "radio_" + i);
        x.setAttribute("name", "data");
        x.setAttribute("value", i);
        if(i==0){
          x.setAttribute("checked", "checked");
        }
        item.appendChild(x);

        list.appendChild(item);
    }
    $(":radio").change(function() {
      $("svg :first-child").empty();
      d3Init(this.value);
    });
}*/
function cleanData(){
  //var clean_data = [];
  global_data.forEach(function(piece) {
    //var clean_piece = [];
    piece.elapsedTime = parseDate(piece.elapsedTime + "00")
    piece.splitGPS = parseDate(piece.splitGPS + "00")
    
    //clean_data.push(clean_piece);
  });
  //global_data = clean_data;
}

function updateGraph(){
  ind2 = $(".type_selector_button_selected").val();
  username = $(".rower_selected")[0].id;
  $("svg :first-child").empty();
  d3Init();
}

function groupByUsername(){
  partitionedData = {};
  for(var i = 0; i < global_data.length; i++){
    if (!partitionedData[global_data[i].username]){
      partitionedData[global_data[i].username] = [];
    }
    partitionedData[global_data[i].username].push(global_data[i]);
  }
  for (var username in partitionedData){
    partitionedData[username].sort(function(a, b){
      if(a["id"] > b["id"]) return 1;
      if(a["id"] < b["id"]) return -1;
      return 0;
    });
  }
  global_data = partitionedData
}
function populateUsersList(){
  var ul = $("#rowers_list");
       for (var username in global_data){
          var li = document.createElement('li');
          li.id = username;
          li.classList.add('rower');
          li.onclick = function(){selectRower(this.id)};
          li.innerHTML = decodeURI(global_data[username][0].firstName) + ' ' +  decodeURI(global_data[username][0].lastName);
          ul.append(li);
          }
          $(".rower")[0].classList.add("rower_selected");
}

$( document ).ready(function() {
    var svg = d3.select("#d3Graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  $("#workouts").on("change", function(){
    console.log("workout selected");
    var sel = $("#workouts");
    $.post("/get-workout-data", {workoutID: sel.val()}, function(res){
      console.log(res);
      global_data = res;
      cleanData();
      groupByUsername();
      $("#rowers_list").empty();
      populateUsersList();
      updateGraph();
    });
  });
  /*$("#submitData").click(function() {
    ind2 = parseInt($("#idxToGraphX").val());
    ind2 = parseInt($("#idxToGraphY").val());
      $("svg :first-child").empty();
      console.log(global_data);
      cleanData();
      makeUL();
      d3Init(0);
  }}); */   
  console.log( "ready!" );
  //parseCsvInit(path, d3Init)
  
});









