var showUsers = false;
var showBoats = false;
var showWorkouts = false;

var boats = '<table class="table" id="boats">'+
            '  <tr>'+
            '    <th>Name</th>'+
            '    <th>Capacity</th>'+
            '    <th></th>'+
            '    <th></th>'+
            '  </tr>'+
            '  <tr>'+
            '    <td value="0">Baker</td>'+
            '    <td>8</td>'+
            '    <td><button><img src="images/edit.png" height="25" width="25"></button></td>'+
            '    <td><button><img src="images/delete.png" height="25" width="25"></button></td>'+
            '  </tr>'+
            '  <tr>'+
            '    <td value="1">\'94</td>'+
            '    <td>8</td>'+
            '    <td><button><img src="images/edit.png" height="25" width="25"></button></td>'+
            '    <td><button><img src="images/delete.png" height="25" width="25"></button></td>'+
            '</table>'+
            '<div id="add-boat">'+
            '  Add Boat:'+
            '  <input> </input>'+
            '  <input> </input>'+
            '</div>';

function makeUserTable(response) {
  var users = document.createElement("table");
  users.setAttribute("class", "table");
  users.setAttribute("id", "users");
  var colWidths = ["35%", "5%", "50%", "5%", "5%"];
  for (var i = 0; i < colWidths.length; i++) {
    var col = document.createElement("col")
    col.setAttribute("width", colWidths[i]);
    users.appendChild(col);
  }

  var usersheaders = document.createElement("tr");
  users.appendChild(usersheaders);

  var headers = ["Name", "Year", "Email", "", ""];
  for (var i = 0; i < headers.length; i++) {
    usersheaders.appendChild(document.createElement("th")).appendChild(document.createTextNode(headers[i]));
  }

  for (var i = 0; i < response.length; i++) {
    var newRow = document.createElement("tr");
    var firstElem = document.createElement("td");
    firstElem.setAttribute("value", response[i].username);
    newRow.appendChild(firstElem).appendChild(document.createTextNode(response[i].firstName + " " + response[i].lastName));
    newRow.appendChild(document.createElement("td")).appendChild(document.createTextNode(response[i].year));
    newRow.appendChild(document.createElement("td")).appendChild(document.createTextNode(response[i].email));
    var editRow = document.createElement("td");
    editRow.innerHTML = '<button><img src="images/edit.png" height="25" width="25"></button>';
    newRow.appendChild(editRow);
    var deleteRow = document.createElement("td");
    deleteRow.innerHTML = '<button onclick="deleteUser(this)"><img src="images/delete.png" height="25" width="25"></button>';
    newRow.appendChild(deleteRow);
    users.appendChild(newRow);
  }

  return users;
}

function makeBoatsTable(response) {
  var boats = document.createElement("table");
  boats.setAttribute("class", "table");
  boats.setAttribute("id", "boats");
  var colWidths = ["25%", "25%", "25%", "25%"];
  for (var i = 0; i < colWidths.length; i++) {
    var col = document.createElement("col")
    col.setAttribute("width", colWidths[i]);
    boats.appendChild(col);
  }

  var boatsheaders = document.createElement("tr");
  boats.appendChild(boatsheaders);

  var headers = ["Name", "Capacity", "", ""];
  for (var i = 0; i < headers.length; i++) {
    boatsheaders.appendChild(document.createElement("th")).appendChild(document.createTextNode(headers[i]));
  }

  for (var i = 0; i < response.length; i++) {
    var newRow = document.createElement("tr");
    var firstElem = document.createElement("td");
    firstElem.setAttribute("value", response[i].id);
    newRow.appendChild(firstElem).appendChild(document.createTextNode(response[i].name));
    newRow.appendChild(document.createElement("td")).appendChild(document.createTextNode(response[i].size));
    var editRow = document.createElement("td");
    editRow.innerHTML = '<button><img src="images/edit.png" height="25" width="25"></button>';
    newRow.appendChild(editRow);
    var deleteRow = document.createElement("td");
    deleteRow.innerHTML = '<button onclick="deleteBoat(this)"><img src="images/delete.png" height="25" width="25"></button>';
    newRow.appendChild(deleteRow);
    boats.appendChild(newRow);
  }

  return boats;
}

function toggleUsers() {
  showUsers = !showUsers;
  var parent = $('#users-div');
  if (showUsers) {
    $.post('/get-user-data', function(response) {
      var users = makeUserTable(response);
      $('#manage-users-data-button').removeClass('manage-data-button').addClass('manage-data-button-active');
      $(users).hide().appendTo(parent).show('slow');
      $(parent).append('<div id="invite-user">'+
                   '  Invite New User:'+
                   '  <input> </input>'+
                   '</div>');
    });
  } else {
    $('#manage-users-data-button').removeClass('manage-data-button-active').addClass('manage-data-button');
    $('#users').remove();
    $('#invite-user').remove();
  }
}

function toggleBoats() {
  showBoats = !showBoats;
  var parent = $('#users-div');
  if (showBoats) {
    $.post('/get-boat-data', function(response) {
      var boats = makeBoatsTable(response);
      $('#manage-boats-data-button').removeClass('manage-data-button').addClass('manage-data-button-active');
      $(boats).hide().appendTo(parent).show('slow');
      $(parent).append('<div id="add-boat">'+
                  '  Add Boat:'+
                  '  <input> </input>'+
                  '  <input> </input>'+
                  '</div>');
    });
  } else {
    $('#manage-boats-data-button').removeClass('manage-data-button-active').addClass('manage-data-button');
    $('#boats').remove();
    $('#add-boat').remove();
  }
}

function toggleWorkouts() {
  showWorkouts = !showWorkouts;
  var parent = $('#users-div');
  if (showWorkouts) {
    $('#manage-workouts-data-button').removeClass('manage-data-button').addClass('manage-data-button-active');
    $(users).hide().appendTo(parent).show('slow');
  } else {
    $('#manage-workouts-data-button').removeClass('manage-data-button-active').addClass('manage-data-button');
    $('#users').remove();
    $('#invite-user').remove();
  }
}

function deleteUser(elem) {
  result = window.prompt("ALERT! You are about to remove a user. Type in: YES if you want to proceed.");
  parent = elem.parentElement.parentElement;
  username = parent.children[0].attributes[0].value;
  if (result === "YES") {
    parent.remove();
    $.post('/remove-user', {username: username}, function(response) {
      console.log(response);
    });
  }
}

function deleteBoat(elem) {
  result = window.prompt("ALERT! You are about to remove a boat. Type in: YES if you want to proceed.");
  parent = elem.parentElement.parentElement;
  boatID = parent.children[0].attributes[0].value;
  if (result === "YES") {
    parent.remove();
  $.post('/remove-boat', {boatID: boatID}, function(response) {
    console.log(response);
  });
  }
}

$(document).ready(function() {
  toggleBoats();
});
