//94THoF 2 seat 20180417 0706am

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var anyDB = require('any-db');
var bcrypt = require('bcrypt-nodejs');
 

var conn = anyDB.createConnection('sqlite3://freespeed.db');
conn.query('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, permission INTEGER, firstName TEXT, lastName TEXT)');
conn.query('CREATE TABLE IF NOT EXISTS boats (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, size INTEGER)');
conn.query('CREATE TABLE IF NOT EXISTS workouts (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, type TEXT)');
conn.query('CREATE TABLE IF NOT EXISTS workoutUserBoat (id INTEGER PRIMARY KEY AUTOINCREMENT, workoutID INTEGER, userID INTEGER, boatID INTEGER, startTime TEXT)');
conn.query('CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY AUTOINCREMENT, workoutUserBoatID INTEGER, interval INTEGER, distanceGPS REAL, distanceIMP REAL, elapsedTime TEXT, splitGPS TEXT, speedGPS REAL, splitIMP REAL, speedIMP REAL, strokeRate REAL, totalStrokes INTEGER, distancePerStrokeGPS REAL,distancePerStrokeIMP REAL, heartRateBPM INTEGER, power INTEGER, catch INTEGER, slip INTEGER, finish INTEGER, wash INTEGER, forceAvg INTEGER, work INTEGER, forceMax INTEGER, maxForceAngle INTEGER, GPSLat REAL, GPSLon REAL)')

var engines = require('consolidate');
var colors = require('colors');
var path = require('path');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.engine('html', engines.hogan);
app.set('views', __dirname + '/templates');
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function(request, response){
  console.log('- Request received:', request.method.cyan, request.url.underline);
  response.redirect('/login');
});

app.get('/login', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  response.sendFile('public/login.html', {root: __dirname });
});

app.get('/sign-up', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  response.sendFile('public/signup.html', {root: __dirname });
});

app.get('/main/coach/:coachUsername', function(request, response){
	 console.log('- Request received:', request.method.cyan, request.url.underline);
	response.render('home.html', {username: request.params.coachUsername});
})

app.get('/main/rower/:rowerUsername', function(request, response){
	 console.log('- Request received:', request.method.cyan, request.url.underline);
	response.render('home.html', {username: request.params.rowerUsername});
})

app.post('/personal-data-page', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  response.sendFile('public/personal_page.html', {root: __dirname });
});

app.post('/data-upload', function(request, response) {

  console.log('- Request received:', request.method.cyan, request.url.underline);
  response.sendFile('public/personal_page.html', {root: __dirname });
});

app.post('/validate-login-credetials', function(request, response){
	var username = escape(request.body.username);
	var password = escape(request.body.password); 
	conn.query('SELECT * FROM users WHERE username=$1', [username], function(error, result){
		if(error){
			console.log(error);
		}else{
			if(result.rows.length == 0){
				io.to(request.body.socketID).emit('usernameNotFound', {});
			}else{
				var hashedPassword = result.rows[0].password; 
				bcrypt.compare(password, hashedPassword, function(err, res) {
   					 if(res){
   					 	//password was correct
   					 	var permission = result.rows[0].permission;
   					 	if(permission == 1){
   					 		//verified coach
   					 		//eventually attach a token here 
   					 		io.to(request.body.socketID).emit('validCredentials', {permission: 1, username: username});
   					 		//response.redirect('/main/coach/' + username);
   					 		//io.to(request.body.socketID).emit('usernameNotFoun', {});
   					 	}else{
   					 		//verified rower
   					 		//eventually attach a token here 
   					 		io.to(request.body.socketID).emit('validCredentials', {permission: 0, username: username}); 
   					 	}
   					 }else{
   					 	io.to(request.body.socketID).emit('incorrectPassword', {});
   					 }
				});
			}
		}
	})
})

app.post('/add-new-user', function(request, response) {
	var username = escape(request.body.username);
	var firstName = escape(request.body.firstname);
	var lastName = escape(request.body.lastname); 
	var password = escape(request.body.password); 
	var confirmPassword = escape(request.body.confirmPassword);
	var permission = request.body.permission;
	console.log(permission)

	//check if any of the values are empty
	if(username === '' || password === '' || lastName === '' || firstName === '' || confirmPassword === ''){
		console.log("missing fields inside if satement");
		io.to(request.body.socketID).emit('missingFields', {});
	//check if passwords do not match
	}else if(password !== confirmPassword){
		console.log("in unequal passwords")
		console.log(request.body.socketID)
		io.to(request.body.socketID).emit('unequalPasswords', {});
	}else if(password.length < 8){
		io.to(request.body.socketID).emit('passwordTooShort', {});
	}else{
		//check if the username already exists
		conn.query("SELECT * FROM users WHERE username=$1", username, function(error, result){
			if(error){
				console.log(error);
			}else{
				//username already exists
				if(result.rowCount != 0){
					io.to(request.body.socketID).emit('usernameExists', {});
				//username does not exist, add it to the database
				}else{
					bcrypt.hash(password, bcrypt.genSaltSync(10), null, function(err, hash){
						if(err){
							console.log(err);
						}else{
							console.log(hash);
	 						conn.query('INSERT INTO users (username, password, permission, firstname, lastname) VALUES($1, $2, $3, $4, $5)',
	 						[username, hash, permission, firstName, lastName], function(error, result){
								if(error){
									console.log(error);
								}else{
									console.log("successful insert");
								}
							})
						}
					}); 
				}
			}
		})
	}
})


/// socket events 

io.on('connection', function(socket){

})

server.listen(8080);
console.log('listening on 8080');
