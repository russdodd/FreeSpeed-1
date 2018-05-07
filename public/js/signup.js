var socket = io.connect();
var socketID;
socket.on('connect', () => {socketID = socket.id});


function sendNewUserInfo(){
	var firstname = $("#first-name-input").val();
	var lastname = $("#last-name-input").val();
	var username = $("#username-input").val();
	var password = $("#password-input").val();
	var confirmPassword = $("#confirm-password-input").val();
	var permission = 0;
	var email = $('#email-input').val();
	var year = $('#class-year-input').val();
	$(".login-input").css("border-color", "black");
	$("#error-message").text("");

	if($('#radio-coach').is(':checked')){
		permission = 1;
	};
	$.post('/add-new-user', {firstname, lastname, username, password, confirmPassword, socketID, permission, email, year}, function(res){})
}

socket.on('missingFields', function(data){
	$(".login-input").css("border-color", "red");
	$("#error-message").text("Please enter values for all fields");
})

socket.on('unequalPasswords', function(data){
	console.log("in unequal passwords")
	$("#password-input").css("border-color", "red");
	$("#confirm-password-input").css("border-color", "red");
	$("#error-message").text("Passwords Do Not Match");

})

socket.on('passwordTooShort', function(data){
	console.log("in password too short")
	$("#password-input").css("border-color", "red");
	$("#confirm-password-input").css("border-color", "red");
	$("#error-message").text("Password must be at least 8 characters long.");
})

socket.on('usernameExists', function(data){
	console.log("in usernameExists");
	$("#username-input").css("border-color", "red");
	$("#error-message").text("Username Already Taken");
})

socket.on('successfulInsert', function(data){
	location.href = '/login';
})
