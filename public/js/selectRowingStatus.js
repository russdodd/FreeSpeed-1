console.log("in the file")

function sendResponse(){
	console.log("in here")
	var permission = 0;
	var year = 2022;


	if($('#2021').is(':checked')){
		year = 2021;
	}else if($('#2020').is(':checked')){
		year = 2020;
	}else if($('#2019').is(':checked')){
		year = 2019;
	}else if($('#2018').is(':checked')){
		year = 2018;
	}

	if($('#radio-coach').is(':checked')){
		permission = 1;
		year = 3000;
	}

	$.post('/updatePermission', {permission, year}, function(res){
		window.location.href = "/profile";
	})
}
