var showUsers = false;
var showBoats = false;
var showWorkouts = false;
var modal = '<!-- The Modal -->'+
'<div id="myModal" class="modal">'+
''+
'  <!-- Modal content -->'+
'  <div class="modal-content">'+
'    <div class="modal-header">'+
'      <span class="close">×</span>'+
'      <h2>Upload Workout Data</h2>'+
'    </div>'+
'    <div class="modal-body">'+
'    <div id="dvImportSegments" class="fileupload ">'+
'    <fieldset>'+
'    Create New Workout: <input id="newWorkout" type="checkbox"><br>'+
'    Workouts:'+
'    <select id="workouts">'+
'     <option selected disabled>Choose Workout</option>'+
'    </select><br>'+
'          Workout Type: <input id="workoutType" type="text"><br>'+
'          Upload your CSV File'+
'          <input type="file" name="File Upload" id="txtFileUpload" accept=".csv"/>'+
'          <br>'+
'          Boat:'+
'          <select id="boat-dropdown">'+
'              <option selected>Choose Boat...</option>'+
'            </select><br>'+
'          <button id="submitUpload">submit</button>'+
'        </fieldset>'+
'    </div>'+
'  </div>'+
'    <div class="modal-footer">'+
'       <h3>Modal Footer</h3>'+
'    </div>'+
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
    firstElem.innerHTML = '<a href=#>' + response[i].firstName + " " + response[i].lastName + '</a>';
    newRow.appendChild(firstElem);
    newRow.appendChild(document.createElement("td")).appendChild(document.createTextNode(response[i].year));
    newRow.appendChild(document.createElement("td")).appendChild(document.createTextNode(response[i].email));
    var editRow = document.createElement("td");
    editRow.innerHTML = '<button onclick="openEditModal(this)"><img src="images/plus.png" height="25" width="25"></button>';
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
    var col = document.createElement("col");
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
    editRow.innerHTML = '<button onclick="editBoat()"><img src="images/edit.png" height="25" width="25"></button>';
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
      $(parent).append('<hr id="userLine">'+
                   '<div id="invite-user">'+
                   '<form action="/invite-user" method="post" id="inviteUserForm">'+
                   '  Invite New User:'+
                   '  <input id="emailAddress" type="email"> </input>'+
                   '  <input type="submit" value="submit"> </input>'+
                   '</form>'+
                   '</div>');
      var userForm = $('#inviteUserForm').submit(sendEmail);
      console.log(userForm);
    });
  } else {
    $('#manage-users-data-button').removeClass('manage-data-button-active').addClass('manage-data-button');
    $('#users').remove();
    $('#userLine').remove();
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
                  '<form action="/add-boat" method="post" id="addBoatForm">'+
                  '  <input id="boatName" type="text"> </input>'+
                  '  <input id="capacity" type="number"> </input>'+
                  '  <input type="submit" value="Submit">'+
                  '</form>'+
                  '</div>');
      var messageForm = $('#addBoatForm').submit(addBoat);
    });
  } else {
    $('#manage-boats-data-button').removeClass('manage-data-button-active').addClass('manage-data-button');
    $('#boats').remove();
    $('#add-boat').remove();
  }
}

function toggleWorkouts() {
  // showWorkouts = !showWorkouts;
  // var parent = $('#users-div');
  // if (showWorkouts) {
  //   $('#manage-workouts-data-button').removeClass('manage-data-button').addClass('manage-data-button-active');
  //   $(users).hide().appendTo(parent).show('slow');
  // } else {
  //   $('#manage-workouts-data-button').removeClass('manage-data-button-active').addClass('manage-data-button');
  //   $('#users').remove();
  //   $('#invite-user').remove();
  // }
}

function addBoat(event) {
  event.preventDefault();
  var boatName = $('#boatName')[0].value;
  var capacity = $('#capacity')[0].value;
  var parent = $('#users-div');
  console.log(boatName);
  $.post('/add-boat', {boatName: boatName, capacity: capacity},function(response) {
      $('#boats').remove();
      $('#add-boat').remove();
      var boats = makeBoatsTable(response);
      $(boats).hide().appendTo(parent).show('slow');
      $(parent).append('<div id="add-boat">'+
                  '  Add Boat:'+
                  '<form action="/add-boat" method="post" id="addBoatForm">'+
                  '  <input id="boatName" type="text"> </input>'+
                  '  <input id="capacity" type="number"> </input>'+
                  '  <input type="submit" value="Submit">'+
                  '</form>'+
                  '</div>');
      var messageForm = $('#addBoatForm').submit(addBoat);
  });
}

function editBoat() {

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

function openEditModal(elem) {
  console.log(modal);
  row = elem.parentElement.parentElement;
  username = row.children[0].attributes[0].value;
  $(modal).appendTo('#manage-data-container');
  var span = document.getElementsByClassName("close")[0];
  span.onclick = function() {
    $('#myModal').remove();
  }
  window.onclick = function(event) {
    if (event.target === document.getElementById('myModal')) {
      $('#myModal').remove();
    }
  }
  // The event listener for the file upload
  $('#submitUpload').on('click', upload);
  $.post("/upload-data-information", function(res) {
    console.log(res);
    // var sel = $("#workouts");
    // for(var i = 0; i < res.workouts.length; i++) {
    //   var opt = document.createElement('option');
    //   opt.value = res.workouts[i].id;
    //   opt.innerHTML = decodeURI(res.workouts[i].date) + ' ' +  decodeURI(res.workouts[i].type);
    //   sel[0].appendChild(opt);
    //    }
    // var sel = $("#boat");
    // for(var i = 0; i < res.boats.length; i++) {
    //   var opt = document.createElement('option');
    //   opt.value = res.boats[i].id;
    //   opt.innerHTML = decodeURI(res.boats[i].name) + ' ' +  "(" + res.boats[i].size + ")";
    //   sel[0].appendChild(opt);
    //    }
  });
}

function sendCsv(csv, fname, lname, time) {
  var postParameters = {csv: csv, fname: fname, lname: lname, time:time};
  $.post("/csv", postParameters,  function(responseJSON){
    //
  });
}

function browserSupportFileUpload() {
  var isCompatible = false;
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    isCompatible = true;
  }
  return isCompatible;
}
function uploadData(json_data) {
  $.post('/data-upload', json_data, function(res, err) {
    if (err != null){
      console.log(err);
    } else {
      console.log("success");
    }
  });
};

var csvData = [];
function upload() {
  if (!browserSupportFileUpload()) {
    alert('The File APIs are not fully supported in this browser!');
  } else {
    var data = null;
    var file = $("#txtFileUpload")[0].files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event) {
      var workoutId = $("#workouts").val();
      if ($("#newWorkout")[0].checked){
        workoutId = -1;
      } else if ($("#workouts").val() == null) {
        alert("No workout selected");
        return;
      }
      var jsonData = {"code": !Number($("#newWorkout")[0].checked),
              "workoutID": workoutId,
              "workoutType": $("#workoutType").val(),
              "boatID": $("#boat").val(),
              "users":[]
            };
      csvData = event.target.result;
      var userJson = {"per_stroke_data": csvData};
      userJson.username = $("#username").val();
      jsonData.users.push(userJson);
      var json_str = {data:JSON.stringify(jsonData)}

      uploadData(json_str);
      };
    reader.onerror = function() {
      alert('Unable to read ' + file.fileName);
    };
  }
}

function sendEmail(event) {
  event.preventDefault();
  $.post('/send-email', {email: document.getElementById('emailAddress').value}, function(res) {
    if (res.yo != 'err') {
      document.getElementById('emailAddress').value = '';
      var message = document.getElementById('email-message');
      if (message === null) {
        message = document.createElement('p');
        message.setAttribute("id", "email-message");
      }
      message.innerHTML = 'Success!';
      document.getElementById('invite-user').append(message);
    } else {
      var message = document.createElement('p').innerHTML = 'Error, Try again later';
      document.getElementById('invite-user').append(message);
    }
  });
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
