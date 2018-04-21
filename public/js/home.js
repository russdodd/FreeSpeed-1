var is_highlighted = '0';

$(document).ready(function () {
  document.getElementById(is_highlighted).className = "type_selector_button_selected";
  document.getElementById(is_highlighted).disabled = true;
  document.getElementById('graph_title').innerHTML = document.getElementById(is_highlighted).textContent;


});

function toggleType(id) {
  is_highlighted = id;

  for (var i = 0; i < 3; i++) {
    if (i == is_highlighted) {
      document.getElementById(i).className = "type_selector_button_selected";
      document.getElementById(i).disabled = true;
      document.getElementById('graph_title').innerHTML = document.getElementById(i).textContent;

    } else {
      document.getElementById(i).className = "type_selector_button";
      document.getElementById(i).disabled = false;
    }
  }
}

function selectRower(id) {
  console.log("row clicked");
  var element = document.getElementById(id);
  if (element.className == "rower") {
    element.className = "rower_selected";
  } else {
    element.className = "rower";
  }
}
