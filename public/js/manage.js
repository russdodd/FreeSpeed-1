var showUsers = false;
var showBoats = false;
var showWorkouts = false;
var data = [];
var data2 = [];
var data3 = [];
var modal = '<!-- The Modal -->'+
'<div id="myModal" class="usermodal">'+
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
'    Workouts:'+
'    <select id="workouts">'+
'     <option selected disabled>Choose Workout</option>'+
'    </select><br>'+
'          Workout Type: <input id="workoutType" type="text"><br>'+
'          Upload your CSV File'+
'          <input type="file" name="File Upload" id="txtFileUpload" accept=".csv"/>'+
'          <br>'+
'          Boat:'+
'          <select id="boat">'+
'              <option selected>Choose Boat...</option>'+
'            </select><br>'+
'          <button id="submitUpload">submit</button>'+
'          <input display="none" id="username">' +
'          </input>'+
'        </fieldset>'+
'    </div>'+
'  </div>'+
'    <div id="modal-footer">'+
'       <h3> Data Uploaded! </h3>' +
'    </div>'+
'</div>';
var modal2 = '<!-- The Modal -->'+
'<div id="myModal2" class="usermodal2">'+
''+
'  <!-- Modal content -->'+
'  <div class="modal-content">'+
'    <div class="modal-header">'+
'      <span class="closeModal">×</span>'+
'      <h2>Manage Workout</h2>'+
'    </div>'+
'    <div class="modal-body">'+
'    <div id="dvTables" class="fileupload ">'+
'    </div>'+
'  </div>'+
'    <div id="modal-footer-user2">'+
'       Data Uploaded!' +
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
    firstElem.setAttribute("value", response[i].email);
    firstElem.innerHTML = '<a href="/manage-data/' + response[i].email + '">' + response[i].firstName + " " + response[i].lastName + '</a>';
    newRow.appendChild(firstElem);
    newRow.appendChild(document.createElement("td")).appendChild(document.createTextNode(response[i].year));
    newRow.appendChild(document.createElement("td")).appendChild(document.createTextNode(response[i].email));
    var editRow = document.createElement("td");
    editRow.innerHTML = '<button onclick="openEditModal(this)"><img src="/images/plus.png" height="25" width="25"></button>';
    newRow.appendChild(editRow);
    var deleteRow = document.createElement("td");
    deleteRow.innerHTML = '<button onclick="deleteUser(this)"><img src="/images/delete.png" height="25" width="25"></button>';
    newRow.appendChild(deleteRow);
    users.appendChild(newRow);
  }

  return users;
}

function makeBoatsTable(response) {
  var boats = document.createElement("table");
  boats.setAttribute("class", "table");
  boats.setAttribute("id", "boats");
  var colWidths = ["25%", "25%", "25%"];
  for (var i = 0; i < colWidths.length; i++) {
    var col = document.createElement("col");
    col.setAttribute("width", colWidths[i]);
    boats.appendChild(col);
  }

  var boatsheaders = document.createElement("tr");
  boats.appendChild(boatsheaders);

  var headers = ["Name", "Capacity", ""];
  for (var i = 0; i < headers.length; i++) {
    boatsheaders.appendChild(document.createElement("th")).appendChild(document.createTextNode(headers[i]));
  }

  for (var i = 0; i < response.length; i++) {
    var newRow = document.createElement("tr");
    var firstElem = document.createElement("td");
    firstElem.setAttribute("value", response[i].id);
    newRow.appendChild(firstElem).appendChild(document.createTextNode(response[i].name));
    newRow.appendChild(document.createElement("td")).appendChild(document.createTextNode(response[i].size));
    var deleteRow = document.createElement("td");
    deleteRow.innerHTML = '<button onclick="deleteBoat(this)"><img src="/images/delete.png" height="25" width="25"></button>';
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
      $('#emailAddress').attr("placeholder", "Type Email");
      window.scrollTo(0,document.body.scrollHeight);
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
      $(parent).append('<hr id="boatLine">'+
        '<div id="add-boat">'+
                  '  Add Boat:'+
                  '<form action="/add-boat" method="post" id="addBoatForm">'+
                  '  <input id="boatName" type="text"> </input>'+
                  '  <input id="capacity" type="number"> </input>'+
                  '  <input type="submit" value="Submit">'+
                  '</form>'+
                  '</div>');
      var messageForm = $('#addBoatForm').submit(addBoat);
      $('#boatName').attr("placeholder", "Boat Name");
      $('#capacity').attr("placeholder", "Capacity");
      $.post("/upload-data-information", function(res) {
      console.log(res);

      var sel = $("#boat");
      for(var i = 0; i < res.boats.length; i++) {
        var opt = document.createElement('option');
        opt.value = res.boats[i].id;
        opt.innerHTML = decodeURI(res.boats[i].name) + ' ' +  "(" + res.boats[i].size + ")";
        sel[0].appendChild(opt);
         }
         document.getElementById('txtFileUpload2').addEventListener('change', uploadCSV2, false);
    });

      window.scrollTo(0,document.body.scrollHeight);
    });
  } else {
    $('#manage-boats-data-button').removeClass('manage-data-button-active').addClass('manage-data-button');
    $('#boats').remove();
    $('#boatLine').remove();
    $('#add-boat').remove();
  }
}

function groupByBoat(data) {
  var partitionedData = {};
  for (var i = 0 ; i < data.length; i++){
    if (!partitionedData[data[i].name]){
      partitionedData[data[i].name] = [];
    }
    partitionedData[data[i].name].push(data[i]);
  }
  return partitionedData;
}

function deleteUsersData(workoutID, email){
  console.log("stuff", workoutID, email);
  $.post('/remove-data-workoutId', {workoutID: workoutID, email: email}, function(res) {
    console.log(res);
    makeWorkoutsModalTable(workoutID);
  });
}
function addDataToWorkout(){
  var email = $("#username2").val();
}

function makeWorkoutsModalTable(workoutID) {
  $("#dvTables").empty();
  var workouts = document.createElement("table");
  workouts.setAttribute("class", "table");
  workouts.setAttribute("id", "workouts");
  $.post("/get-workout-info", {workoutID: workoutID}, function(res) {
      console.log(res);
      var data = groupByBoat(res.data); 
      for (var boat in data){
        var boatLabel = '<strong>' + boat + '</strong>';
        $('#dvTables').append(boatLabel);

        var trHTML = '';
        trHTML += '<table class="table" style="">'
        for (var i = 0; i < 3; i++) {
          trHTML += '<col width="25%">'
        }



        $.each(data[boat], function (i, row) {
            trHTML += '<tr value="' + row.email + '"><td>' + row.firstName + '</td><td>' + row.lastName + 
            '</td><td><button onclick="deleteUsersData(' + workoutID + ',' + '&#39;' + row.email + '&#39;'+ ')"><img src="/images/delete.png" height="25" width="25"></button></td></tr>';
        });
        trHTML += '</table>'
        $('#dvTables').append(trHTML)
      }
      $.post("/upload-data-information", function(res) {
      console.log(res);

      var trHTML = '';
        trHTML += '<table class="table" style="">'
        var widths = ["20%", "20%", "30%", "6%"];
        for (var i = 0; i < 4; i++) {
          trHTML += '<col width="'+ widths[i] +'">';
        }
        trHTML += '<tr><td>' +
        '<select id="username2" class="username">' +
              '<option selected>Choose Athlete...</option>' +
            '</select>' +
            '</td><td>' + 
            '<select id="boat">' +
              '<option selected>Choose Boat...</option>' +
            '</select>' + 
            '</td><td>' + 
            '<input type="file" name="File Upload" multiple="true" id="txtFileUpload2" accept=".csv"/>' +
            '</td><td><button onclick="upload2(' + workoutID + ')"><img src="/images/plus.png" height="25" width="25"></button></td></tr>';
            trHTML += '</table>';
        $('#dvTables').append(trHTML);
      var sel = $("#username2");
       for(var i = 0; i < res.users.length; i++) {
          var opt = document.createElement('option');
          opt.value = res.users[i].email;
          opt.innerHTML = decodeURI(res.users[i].firstName) + ' ' +  decodeURI(res.users[i].lastName);
          sel[0].appendChild(opt);
          }

      var sel = $("#boat");
      for(var i = 0; i < res.boats.length; i++) {
        var opt = document.createElement('option');
        opt.value = res.boats[i].id;
        opt.innerHTML = decodeURI(res.boats[i].name) + ' ' +  "(" + res.boats[i].size + ")";
        sel[0].appendChild(opt);
         }
         document.getElementById('txtFileUpload2').addEventListener('change', uploadCSV2, false);
    });
      /*
      var sel = $("#username");
       for(var i = 0; i < res.users.length; i++) {
          var opt = document.createElement('option');
          opt.value = res.users[i].email;
          opt.innerHTML = decodeURI(res.users[i].firstName) + ' ' +  decodeURI(res.users[i].lastName);
          sel[0].appendChild(opt);
          }
      var sel = $("#workouts");
      for(var i = 0; i < res.workouts.length; i++) {
        var opt = document.createElement('option');
        opt.value = res.workouts[i].id;
        opt.innerHTML = decodeURI(res.workouts[i].date) + ' ' +  decodeURI(res.workouts[i].type);
        sel[0].appendChild(opt);
         }
         */

     /* var sel = $("#boat");
      for(var i = 0; i < res.boats.length; i++) {
        var opt = document.createElement('option');
        opt.value = res.boats[i].id;
        opt.innerHTML = decodeURI(res.boats[i].name) + ' ' +  "(" + res.boats[i].size + ")";
        sel[0].appendChild(opt);
         }*/
    });
}

/*function makeWorkoutsModalTable(response) {
  var workouts = document.createElement("table");
  workouts.setAttribute("class", "table");
  workouts.setAttribute("id", "workouts");
  var colWidths = ["25%", "25%", "25%"];
  for (var i = 0; i < colWidths.length; i++) {
    var col = document.createElement("col");
    col.setAttribute("width", colWidths[i]);
    workouts.appendChild(col);
  }

  var workoutsheaders = document.createElement("tr");
  workouts.appendChild(workoutsheaders);

  var headers = ["Date", "Type", ""];
  for (var i = 0; i < headers.length; i++) {
    workoutsheaders.appendChild(document.createElement("th")).appendChild(document.createTextNode(headers[i]));
  }

  for (var i = 0; i < response.length; i++) {
    var newRow = document.createElement("tr");
    var firstElem = document.createElement("td");
    firstElem.setAttribute("value", response[i].id);
    newRow.appendChild(firstElem).appendChild(document.createTextNode(response[i].date));
    newRow.appendChild(document.createElement("td")).appendChild(document.createTextNode(response[i].type));
    var deleteRow = document.createElement("td");
    deleteRow.innerHTML = '<button onclick="deleteWorkout(this)"><img src="/images/delete.png" height="25" width="25"></button>';
    newRow.appendChild(deleteRow);
    workouts.appendChild(newRow);
  }

  return workouts;
}*/

function makeWorkoutsTable(response) {
  var workouts = document.createElement("table");
  workouts.setAttribute("class", "table");
  workouts.setAttribute("id", "workouts");
  var colWidths = ["25%", "25%", "25%"];
  for (var i = 0; i < colWidths.length; i++) {
    var col = document.createElement("col");
    col.setAttribute("width", colWidths[i]);
    workouts.appendChild(col);
  }

  var workoutsheaders = document.createElement("tr");
  workouts.appendChild(workoutsheaders);

  var headers = ["Date", "Type", ""];
  for (var i = 0; i < headers.length; i++) {
    workoutsheaders.appendChild(document.createElement("th")).appendChild(document.createTextNode(headers[i]));
  }
  console.log(response);
  for (var i = 0; i < response.length; i++) {
    var newRow = document.createElement("tr");
    $(newRow).val(response[i].id);
    var firstElem = document.createElement("td");
    var secElem = document.createElement("td");
    firstElem.classList.add('clickable');
    secElem.classList.add('clickable');
    newRow.appendChild(firstElem).appendChild(document.createTextNode(response[i].date));
    newRow.appendChild(secElem).appendChild(document.createTextNode(response[i].type));
    var deleteRow = document.createElement("td");
    deleteRow.innerHTML = '<button onclick="deleteWorkout($(this))"><img src="/images/delete.png" height="25" width="25"></button>';
    newRow.appendChild(deleteRow);
    workouts.appendChild(newRow);
  }

  return workouts;
}
function openWorkoutsModal(workoutID) {
  $(modal2).appendTo('#manage-data-container');
  $('#modal-footer-user').hide();
  var span = document.getElementsByClassName("closeModal")[0];
  span.onclick = function() {
    $('#myModal2').remove();
  }
  window.onclick = function(event) {
    if (event.target === document.getElementById('myModal2')) {
      $('#myModal2').remove();
    }
  }
  makeWorkoutsModalTable(workoutID);
}

function addRowHandlers() {
  var rows = $("#workouts > tr")
  for (i = 0; i < rows.length; i++) {
    var currentRow = rows[i];
    var createClickHandler = function(row) {
      return function() {
        //alert("ayy");
        openWorkoutsModal($(row).val());

      };
    };
    currentRow.onclick = createClickHandler(currentRow);
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
  showWorkouts = !showWorkouts;
  var parent = $('#users-div');
  if (showWorkouts) {
    $.post('/get-workouts', function(response) {
      var workouts = makeWorkoutsTable(response);
      $('#manage-workouts-data-button').removeClass('manage-data-button').addClass('manage-data-button-active');
      $(workouts).hide().appendTo(parent).show('slow');

$.post("/upload-data-information", function(res) {
      console.log(res);

      var trHTML = '';
        trHTML += '<table id="add_workout_table" class="table" style="">'
        var widths = ["20%", "20%", "20%", "30%", "6%"];
        for (var i = 0; i < 4; i++) {
          trHTML += '<col width="'+ widths[i] +'">';
        }
        trHTML += '<tr><td>' +
        '<input id="workoutType2" placeholder="enter type" type="text">' +
        '</td><td>' +
        '<select id="username3" class="username">' +
              '<option selected>Choose Athlete...</option>' +
            '</select>' +
            '</td><td>' + 
            '<select id="boat2">' +
              '<option selected>Choose Boat...</option>' +
            '</select>' + 
            '</td><td>' + 
            '<input type="file" name="File Upload" multiple="true" id="txtFileUpload3" accept=".csv"/>' +
            '</td><td><button onclick="upload3()"><img src="/images/plus.png" height="25" width="25"></button></td></tr>';
            trHTML += '</table>';
        $(parent).append(trHTML);
      var sel = $("#username3");
       for(var i = 0; i < res.users.length; i++) {
          var opt = document.createElement('option');
          opt.value = res.users[i].email;
          opt.innerHTML = decodeURI(res.users[i].firstName) + ' ' +  decodeURI(res.users[i].lastName);
          sel[0].appendChild(opt);
          }

      var sel = $("#boat2");
      for(var i = 0; i < res.boats.length; i++) {
        var opt = document.createElement('option');
        opt.value = res.boats[i].id;
        opt.innerHTML = decodeURI(res.boats[i].name) + ' ' +  "(" + res.boats[i].size + ")";
        sel[0].appendChild(opt);
         }
         document.getElementById('txtFileUpload3').addEventListener('change', uploadCSV3, false);
    });


      window.scrollTo(0,document.body.scrollHeight);
      //addRowHandlers();
      $(".clickable").click(function(){
        openWorkoutsModal($(this).parent().val());
      });

    });
  } else {
    $('#manage-workouts-data-button').removeClass('manage-data-button-active').addClass('manage-data-button');
    $('#workouts').remove();
    $('#workoutLine').remove();
    $('#add-workout').remove();
    $('#addWorkoutForm').remove();
    $('#workoutType').remove();
    $("#add_workout_table").remove();
  }
}
function addWorkout(event) {
  event.preventDefault();
  var boatName = $('#boatName')[0].value;
  var capacity = $('#capacity')[0].value;
  var parent = $('#users-div');
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

function addBoat(event) {
  event.preventDefault();
  var boatName = $('#boatName')[0].value;
  var capacity = $('#capacity')[0].value;
  var parent = $('#users-div');
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

function deleteUser(elem) {
  parent = elem.parentElement.parentElement;
  username = parent.children[0].attributes[0].value;
  if (username === $('meta[name=username]').attr("content")) {
    alert("Cannot delete yourself!");
    return;
  }
  result = window.prompt("ALERT! You are about to remove a user. Type in: YES if you want to proceed.");
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

function deleteWorkout(elem) {
  console.log("elem",elem);
  var result = window.prompt("ALERT! You are about to remove a workout. Type in: YES if you want to proceed.");
  var parent = elem.parent().parent();
  var workoutID = parent.val();
  if (result === "YES") {
    parent.remove();
  $.post('/remove-workout', {workoutID: workoutID}, function(response) {
    console.log(response);
  });
  }
}

function browserSupportFileUpload() {
  var isCompatible = false;
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    isCompatible = true;
  }
  return isCompatible;
}

function uploadCSV() {
  if (!browserSupportFileUpload()) {
    alert('The File APIs are not fully supported in this browser!');
  } else {
    //var data = null;
    var file = $("#txtFileUpload")[0].files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event) {
        data = event.target.result;
    };
    reader.onerror = function() {
      alert('Unable to read ' + file.fileName);
    };
  }
}
function uploadCSV2() {
  if (!browserSupportFileUpload()) {
    alert('The File APIs are not fully supported in this browser!');
  } else {
    //var data = null;
    var file = $("#txtFileUpload2")[0].files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event) {
        data2 = event.target.result;
    };
    reader.onerror = function() {
      alert('Unable to read ' + file.fileName);
    };
  }
}

function uploadCSV3() {
  if (!browserSupportFileUpload()) {
    alert('The File APIs are not fully supported in this browser!');
  } else {
    //var data = null;
    var file = $("#txtFileUpload3")[0].files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event) {
        data3 = event.target.result;
    };
    reader.onerror = function() {
      alert('Unable to read ' + file.fileName);
    };
  }
}

function openEditModal(elem) {
  row = elem.parentElement.parentElement;
  username = row.children[0].attributes[0].value;
  $(modal).appendTo('#manage-data-container');
  $('#modal-footer').hide();
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
    var sel = $("#workouts");
    for (var i = 0; i < res.workouts.length; i++) {
      var opt = document.createElement('option');
      opt.value = res.workouts[i].id;
      opt.innerHTML = decodeURI(res.workouts[i].date) + ' ' +  decodeURI(res.workouts[i].type);
      sel[0].appendChild(opt);
    }

    var opt = document.createElement('option');
    opt.value = -1;
    opt.innerHTML = 'New Workout...';
    sel[0].appendChild(opt);

    sel = $("#boat");
    for (var i = 0; i < res.boats.length; i++) {
      var opt = document.createElement('option');
      opt.value = res.boats[i].id;
      opt.innerHTML = decodeURI(res.boats[i].name) + ' ' +  "(" + res.boats[i].size + ")";
      sel[0].appendChild(opt);
    }
    $("#username").val(username);
    console.log("#username")
    document.getElementById('txtFileUpload').addEventListener('change', uploadCSV, false);
  });

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

function uploadData(json_data) {
  $.post('/data-upload', json_data, function(res) {
    if (res.msg == null){
      console.log(err);
    } else {
      console.log(res);
      $('#modal-footer').show('slow');
    }
  });
};
function uploadData2(json_data) {
  $.post('/data-upload', json_data, function(res) {
    if (res.msg == null){
      console.log(err);
    } else {
      console.log(res);
      $('#modal-footer-user2').show('slow');
    }
  });
};

function uploadData3(json_data) {
  $.post('/data-upload', json_data, function(res) {
    if (res.msg == null){
      console.log(err);
    } else {
      console.log(res);
    }
  });
};

function upload(){
  $('#modal-footer').hide();
  var workoutId = $("#workouts").val();
  if ($("#workouts").val() == null) {
    alert("No workout selected");
    return;
  }
  var jsonData = {
    "workoutID": workoutId,
    "workoutType": $("#workoutType").val(),
    "boatID": $("#boat").val(),
    "users":[]
  };
  var userJson = {"per_stroke_data": data};
  userJson.username = $("#username").val();
  jsonData.users.push(userJson);
  var json_str = {data:JSON.stringify(jsonData)}
  uploadData(json_str);
}
function upload2(workoutId){
  $('#modal-footer-user2').hide();
  var jsonData = {
    "workoutID": workoutId,
    "boatID": $("#boat").val(),
    "users":[]
  };
  var userJson = {"per_stroke_data": [data2]};
  userJson.username = $("#username2").val();
  jsonData.users.push(userJson);
  console.log(jsonData);
  var json_str = {data:JSON.stringify(jsonData)}
  uploadData2(json_str);
  makeWorkoutsModalTable(workoutId);
}

function upload3(){
  var jsonData = {
    "workoutID": -1,
    "workoutType": $("#workoutType2").val(),
    "boatID": $("#boat2").val(),
    "users":[]
  };
  var userJson = {"per_stroke_data": [data3]};
  userJson.username = $("#username3").val();
  jsonData.users.push(userJson);
  console.log(jsonData);
  var json_str = {data:JSON.stringify(jsonData)}
  uploadData3(json_str);
  $('#users-div').empty();
  showWorkouts = !showWorkouts;
  toggleWorkouts();
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
