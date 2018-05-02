//94THoF 2 seat 20180417 0706am
//94THoF 2 seat 20180417 0706am
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20');
var session = require('express-session');
var cookieSession = require('cookie-session');
var LocalStrategy = require('passport-local').Strategy; 

conn.query('CREATE TABLE IF NOT EXISTS googlePassportUsers (id INTEGER, permission INTEGER, firstName TEXT, lastName TEXT, email TEXT, organization TEXT, year INTEGER)');

app.use(cookieSession({
	maxAge: 24 * 60 * 60 *1000,
	keys: ['freespeedCookieSessionKey1320'] 
}))

//initialize passport and session for passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
	console.log("in serialize user")
	done(null, user.id); 
})

passport.deserializeUser((id, done) => {
	conn.query('SELECT * FROM googlePassportUsers WHERE id=$1', [id], function(error, result){
		if(error){
			console.log("error when deserializing user")
			console.log(error)
		}else{
			var user = result.rows[0].id
			done(null, user)
		}
	})
})

const authCheck = (request, response, next) => {
	if(request.user){
		//executes if user is logged in
		next()
	}else{
		response.redirect('/login')
	}
}

//values from google
//186582549927-k2u8qhib86iibneciakpptqmihqi68d7.apps.googleusercontent.com
//	BMP666T4cOBlpbLaykZWBfYf
passport.use(
	new GoogleStrategy({
		callbackURL: '/auth/google/redirect',
		clientID:'186582549927-k2u8qhib86iibneciakpptqmihqi68d7.apps.googleusercontent.com',
		clientSecret: 'BMP666T4cOBlpbLaykZWBfYf'
		}, (accessToken, refreshToken, profile, done) => {
			console.log("passport callback fired")
			console.log(profile)
		
			var id =  profile.id
			var firstname = profile.name.givenName
			var lastname = profile.name.familyName
			var email = profile.emails[0].value
			var domainArray = email.split('@')
			var domain = domainArray[1]
	
			conn.query('SELECT * FROM googlePassportUsers WHERE id=$1', [id], function(error, result){
				if(error){
					console.log("error when finding google user from database")
					console.log(error)
				}else{
					console.log("result.rows.length " + result.rows.length)
					if(result.rows.length == 0){
						//user is not found, must be added to the database
						console.log("user not in database");
						var insertQuery = 'INSERT INTO googlePassportUsers (id, permission, firstname, lastname, email, organization, year) VALUES($1, $2, $3, $4, $5, $6, $7)';
						conn.query(insertQuery, [id, 3, firstname, lastname, email, domain, 1000], function(error, result){
							if(error){
								console.log("error when inserting new user")
								console.log(error)
							}else{
								//console.log("successfulInsert");
								//console.log(result.rows)
								var user = {
									id: id,
    								permission: 3,
    								firstName: firstname,
    								lastName: lastname,
    								email: email,
   									organization: domain 
   								}
								done(null, user); 
							}
						})
					}else{
						//user is in the database
						//console.log("user in the database")
						//console.log(result.rows[0])
						var user = result.rows[0]
						done(null, user)
					}
				}
			})

		})
)

app.get('/login', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  response.sendFile('public/login.html', {root: __dirname });
});


//auth with google
app.get('/auth/google', passport.authenticate('google', {
	scope:['profile', 'email']
})); 

app.get('/auth/google/redirect', passport.authenticate('google'), function(request, response){
	//hangle with passport
	//console.log(request.user)
	
	if(request.user.permission == 3){
		//redirrect to the page where they choose if they're a rower or a coach
		//this is the first time they've logged in
		response.redirect('/selectRowingStatus')
	} else{
		response.send("demo profile");
	}
});

app.get('/selectRowingStatus', authCheck, function(request, response){
	console.log('- Request received:', request.method.cyan, request.url.underline);
	response.sendFile('public/selectRowingStatus.html', {root: __dirname});
})

app.post('/updatePermission', authCheck, function(request, response){
	var permission = request.body.permission;
	var year = request.body.year;
	console.log(year)
	userID = request.user;
	conn.query('UPDATE googlePassportUsers SET permission=$1 year=$2 WHERE id=$3', [permission, year, userID], function(error, result){
		if(error){
			console.log("error setting permission")
			console.log(error)
		}else{
			response.send("demo profile")
		}
	})
})

app.get('/dashboard', authCheck, function(request, response){

})

app.get('/auth/logout', function(request, response){
	//hangle with passport 
	request.logout()
	response.redirect('/'); 
});

