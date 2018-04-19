function sendLoginCredentials(event){
	event.preventDefault();

	var username = $.('#username-input').val();
	var password = $.('#password-input').val(); 

	$.post('validateLogin', {username: username, password: password}, function(res){}

	)
}