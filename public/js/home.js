var is_highlighted = '0';

$(document).ready(function () {
  document.getElementById(is_highlighted).className = "type_selector_button_selected";
  document.getElementById(is_highlighted).disabled = true;
  document.getElementById('graph_title').innerHTML = document.getElementById(is_highlighted).textContent;
  $.post("/get-workouts", function(res) {
    console.log(res);
    var sel = $("#workouts");
    for(var i = 0; i < res.length; i++) {
      var opt = document.createElement('option');
      opt.value = res[i].id;
      opt.innerHTML = decodeURI(res[i].date) + ' ' +  decodeURI(res[i].type);
      sel[0].appendChild(opt);
    }
  });
  

});

function toggleType(id) {
  is_highlighted = id;

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