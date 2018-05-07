var data = "";
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
  $.post('/data-upload', {data:JSON.stringify(jsonData)}, function(res, err) {
    if (err != null){
      console.log(err);
    } else {
      console.log("success");
    }
  });
};

function deleteWorkout(){
  var workoutId = $("#workouts").val();

}

function deleteData(){
  return;
}

/*function createWorkout(){
  var workoutId = $("#workouts").val();
  var data = {date: , type: }
}*/

function uploadCSV(file){
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function(event) {
    console.log("success");
    return event.target.result;
  };
  reader.onerror = function() {
    alert('Unable to read ' + file.fileName);
  };
}

function uploadData(){
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
            if (!browserSupportFileUpload()) {
    alert('The File APIs are not fully supported in this browser!');
  } else {
    //var data = null;
    var fileUploads = $("#txtFileUpload");
    for (var fileUploadsIdx = 0; fileUploadsIdx < fileUploads.length; fileUploadsIdx++){
      var files = fileUploads[fileUploadsIdx].files;
      var fileData = [];
      for (var fileIdx = 0; fileIdx < files.length; fileIdx++){
        fileData.push(uploadCSV(files[fileIdx]));
      }
      var userJson = {"per_stroke_data": fileData};
      userJson.username = $(".username")[fileUploadsIdx].value;
      userJson.boat = $("#boat")[fileUploadsIdx].value;
      jsonData.users.push(userJson);
      console.log(jsonData);      
    }
    uploadData(jsonData);
  }
}


/*function upload(){
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
      var userJson = {"per_stroke_data": data};
      userJson.username = $("#username").val();
      jsonData.users.push(userJson);
      console.log(jsonData);
      var json_str = {data:JSON.stringify(jsonData)}
  uploadData(json_str);
}*/

/*function uploadCSV() {
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
}*/

$(document).ready(function() {
    // The event listener for the file upload
    $('#submitUpload').on('click', uploadData);
    $.post("/upload-data-information", function(res) {
      console.log(res);
      var sel = $("#username");
       for(var i = 0; i < res.users.length; i++) {
          var opt = document.createElement('option');
          opt.value = res.users[i].username;
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

      var sel = $("#boat");
      for(var i = 0; i < res.boats.length; i++) {
        var opt = document.createElement('option');
        opt.value = res.boats[i].id;
        opt.innerHTML = decodeURI(res.boats[i].name) + ' ' +  "(" + res.boats[i].size + ")";
        sel[0].appendChild(opt);
         }
    });
  document.getElementById('txtFileUpload').addEventListener('change', uploadCSV, false);
    /*document.getElementById('qbutton').addEventListener('click', getPower);*/
});

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("user-dropdown").classList.toggle("show");
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
