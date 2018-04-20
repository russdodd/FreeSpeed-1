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

csvData = [];
function upload() {

	console.log("hello");
	if (!browserSupportFileUpload()) {
		alert('The File APIs are not fully supported in this browser!');
	} else {
		var data = null;
		var file = $("#txtFileUpload")[0].files[0]
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function(event) {
        jsonData = {"code": 0,
      				"workoutID": -1,
      				"workoutType": $("#workout").val(),
      				"boatID": 1,
      				"users":[]
      			};
			csvData = event.target.result;
			userJson = {"per_stroke_data": csvData}
			userJson.username = $("#user").val();
      jsonData.users.push(userJson);
			/*sendCsv(csvData, fname, lname);*/
                //data = $.csv.toArrays(csvData);
                //if (data && data.length > 0) {
                //  alert('Imported -' + data.length + '- rows successfully!');
                //} else {
                //    alert('No data to import!');
                //}
            };
            reader.onerror = function() {
            	alert('Unable to read ' + file.fileName);
            }
        }
    }



$(document).ready(function() {

    // The event listener for the file upload
    $('#submitUpload').on('click', upload);
    /*document.getElementById('qbutton').addEventListener('click', getPower);*/

});

