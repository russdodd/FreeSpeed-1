var socket = io.connect();
var socketID; 
socket.on('connect', () => {socketID = socket.id});

function sendLoginCredentials(){

	var username = $('#username-input').val();
	var password = $('#password-input').val(); 

	$.post('/validate-login-credetials', {username, password, socketID}, function(res){

	})
}

socket.on('usernameNotFound', function(data){
	$("#username-input").css("border-color", "red");
	$("#error-paragraph").text("User not found");
})

socket.on('incorrectPassword', function(data){
	$("#password-input").css("border-color", "red");
	$("#error-paragraph").text("Incorrect Password");
})

socket.on('validCredentials', function(data){
	//TODO: eventually check the token attached to data to validate the link 

	console.log("in validate credentials"); 
	var permission = data.permission; 
	if(permission == 0){
		var link = '/main/rower/' + data.username;
	}else{
		var link = 'main/coach/' + data.username; 
	}
	location.href = link; 
})

