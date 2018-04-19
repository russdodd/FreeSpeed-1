
function sendNewUserInfo(){
	var firstname = $.('#first-name-input').val();
	var lastname = $.('#last-name-input').val();
	var username = $.('#username-input').val();
	var password = $.('#password-input').val();
	var confimPassword = $.('#confirm-password-input').val();  

	$.post('/add-new-user', {firstname, lastname, username, password, confimPassword}, function(res){
		
	})
}
