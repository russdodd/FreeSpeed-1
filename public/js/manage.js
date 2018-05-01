var showUsers = false;
var showBoats = false;
var showWorkouts = false;
var users = '<table class="table" id="users">'+
            '  <tr>'+
            '    <th>Name</th>'+
            '    <th>Year</th>'+
            '    <th>Email</th>'+
            '    <th></th>'+
            '    <th></th>'+
            '  </tr>'+
            '  <tr>'+
            '    <td value="sanisett">Sathya Anisetti</td>'+
            '    <td>2020</td>'+
            '    <td>sathya_anisetti@brown.edu</td>'+
            '    <td><button><img src="images/edit.png" height="25" width="25"></button></td>'+
            '    <td><button onclick="deleteUser(this)"><img src="images/delete.png" height="25" width="25"></button></td>'+
            '  </tr>'+
            '  <tr>'+
            '    <td value="rdodd">Russell Dodd</td>'+
            '    <td>2018</td>'+
            '    <td>russell_dodd@brown.edu</td>'+
            '    <td><button><img src="images/edit.png" height="25" width="25"></button></td>'+
            '    <td><button onclick="deleteUser(this)"><img src="images/delete.png" height="25" width="25"></button></td>'+
            '  </tr>'+
            '  <tr>'+
            '    <td value="jfife">James Fife</td>'+
            '    <td>2019</td>'+
            '    <td>james_fife@brown.edu</td>'+
            '    <td><button><img src="images/edit.png" height="25" width="25"></button></td>'+
            '    <td><button onclick="deleteUser(this)"><img src="images/delete.png" height="25" width="25"></button></td>'+
            '  </tr>'+
            '  <tr>'+
            '    <td value="ayu9">Alexander Yu</td>'+
            '    <td>2020</td>'+
            '    <td>Alexander_Yu@brown.edu</td>'+
            '    <td><button><img src="images/edit.png" height="25" width="25"></button></td>'+
            '    <td><button onclick="deleteUser(this)"><img src="images/delete.png" height="25" width="25"></button></td>'+
            '  </tr>'+
            '</table>'+
            '<div id="invite-user">'+
            '  Invite New User:'+
            '  <input> </input>'+
            '</div>';
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


function toggleUsers() {
  showUsers = !showUsers;
  var parent = $('#users-div');
  if (showUsers) {
      $('#manage-users-data-button').removeClass('manage-data-button').addClass('manage-data-button-active');
    $(users).hide().appendTo(parent).show('slow');
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
    $('#manage-boats-data-button').removeClass('manage-data-button').addClass('manage-data-button-active');
    $(boats).hide().appendTo(parent).show('slow');
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
  }
  $.post('/remove-user', {username: username}, function(response) {
    console.log(response);
  });
}

function deleteBoat(elem) {
  result = window.prompt("ALERT! You are about to remove a boat. Type in: YES if you want to proceed.");
  parent = elem.parentElement.parentElement;
  boatID = parent.children[0].attributes[0].value;
  if (result === "YES") {
    parent.remove();
  }
  $.post('/remove-boat', {boatID: boatID}, function(response) {
    console.log(response);
  });
}
