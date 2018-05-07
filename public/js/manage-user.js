$(document).ready(function() {
  $.post(window.location.pathname, function(res) {
    console.log(res);
    var workouts = document.createElement("table");
    workouts.setAttribute("class", "table");
    workouts.setAttribute("id", "user_workouts");
    var colWidths = ["10%", "30%", "20%"];
    for (var i = 0; i < colWidths.length; i++) {
      var col = document.createElement("col")
      col.setAttribute("width", colWidths[i]);
      workouts.appendChild(col);
    }

    var workouts_headers = document.createElement("tr");
    workouts.appendChild(workouts_headers);

    var headers = ["ID", "Date", "Type"];
    for (var i = 0; i < headers.length; i++) {
      workouts_headers.appendChild(document.createElement("th")).appendChild(document.createTextNode(headers[i]));
    }

    for (var i = 0; i < res.length; i++) {
      var newRow = document.createElement("tr");
      var firstElem = document.createElement("td");
      firstElem.setAttribute("value", res[i].id);
      firstElem.setAttribute("id", "workouts_id");
      firstElem.innerHTML = res[i].id;
      newRow.appendChild(firstElem);
      newRow.appendChild(document.createElement("td")).appendChild(document.createTextNode(res[i].date));
      newRow.appendChild(document.createElement("td")).appendChild(document.createTextNode(res[i].type));
      var deleteRow = document.createElement("td");
      deleteRow.setAttribute("id", "delete_row");
      deleteRow.innerHTML = '<button onclick="deleteUser(this)"><img src="/images/delete.png" height="25" width="25"></button>';
      newRow.appendChild(deleteRow);
      workouts.appendChild(newRow);
    }

    var parent = $('#main-container');
    $(workouts).appendTo(parent);
    console.log("YOYOYOY");
  });
});
