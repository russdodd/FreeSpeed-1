var is_highlighted = '0';
var current_stat = 0;
var toggle_types = ["Power", "Speed", "Slip", "Wash", "Stroke/Min", "Catch Angle",
  "Finish Angle", "Max Force Angle", "Max Force", "Avg Force", "Work", "Distance/Stroke", "Heart Rate"];
var toggle_vals = ["power","speedGPS","slip","wash","strokeRate","catch","finish","maxForceAngle","forceMax","forceAvg","work","distancePerStrokeGPS","heartRateBPM"];
var results = {
    total: 0,
    bad: 0
  };

$(document).ready(function () {
  document.getElementById(is_highlighted).className = "type_selector_button_selected";
  document.getElementById(is_highlighted).disabled = true;
  document.getElementById('graph_title').innerHTML = document.getElementById(is_highlighted).textContent;
  document.getElementById('dropdown_button').innerHTML = toggle_types[current_stat] + "<span class=\"caret\"></span>";
  document.getElementById('dropdown_button').value = toggle_vals[current_stat];
  $.post("/get-workouts", function(res) {
    var sel = $("#workouts");
    for(var i = 0; i < res.length; i++) {
      var opt = document.createElement('li');
      opt.value = res[i].id;
      opt.innerHTML = decodeURI(res[i].date) + ' ' +  decodeURI(res[i].type);
      sel[0].appendChild(opt);
    }
  $("#workouts").val($("#workouts option:first").val());
  getData();
  });


  test('1', "Speed");
  test('2', "Slip");
  test('3', "Wash");
  test('4', "Stroke/Min");
  test('5', "Catch Angle");
  test('6', "Finish Angle");
  test('7', "Max Force Angle");
  test('8', "Max Force");
  test('9', "Avg Force");
  test('10', "Work");
  test('11', "Distance/Stroke");
  test('12', "Heart Rate");
  test('0', "Power");
  console.log("Of " + results.total + " tests, " +
    results.bad + " failed, " +
    (results.total - results.bad) + " passed.");

});

function get_stat() {
  return toggle_types[current_stat];
}

function toggleType(id) {
  is_highlighted = id;
  current_stat = parseInt(id);
  document.getElementById('dropdown_button').innerHTML = toggle_types[current_stat] + "<span class=\"caret\"></span>";
  document.getElementById('dropdown_button').value = toggle_vals[current_stat];

  for (var i = 0; i < 13; i++) {
    if (i == is_highlighted) {
      document.getElementById(i).className = "type_selector_button_selected";
      document.getElementById(i).disabled = true;
      document.getElementById('graph_title').innerHTML = document.getElementById(i).textContent;

    } else {
      document.getElementById(i).className = "type_selector_button";
      document.getElementById(i).disabled = false;
    }
  }
  updateGraph(); //function from the graph.js file
  return document.getElementById(is_highlighted).innerHTML;
}

function selectRower(id) {
  console.log("row clicked");
  var element = document.getElementById(id);
  if (element.className == "rower") {
    $(".rower_selected").addClass("rower").removeClass("rower_selected");
    element.className = "rower_selected";
  } else {
    element.className = "rower";
  }
  updateGraph();
  updateCurAverages();
}

//$("#workouts").on("change", function(){
//  var sel = this;//$("#workouts");
/*
$("#workouts").on("change", function(){
  console.log("workout selected");
  var sel = $("#workouts");
  $.post("/get-workout-data", {workoutID: sel.val()}, function(res){
    console.log(res);
  });
  for(var i = 0; i < res.workouts.length; i++) {
    var opt = document.createElement('option');
    opt.value = res.workouts[i].id;
    opt.innerHTML = decodeURI(res.workouts[i].date) + ' ' +  decodeURI(res.workouts[i].type);
    sel[0].appendChild(opt);
  }
});
*/

function test(then, expected) {
  results.total++;
  var result = toggleType(then);
  if (result !== expected) {
    results.bad++;
    console.log("Expected " + expected +
      ", but was " + result);
  }
}
