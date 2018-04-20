//94THoF 2 seat 20180417 0706am

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var anyDB = require('any-db');
var bcrypt = require('bcrypt-nodejs');


var conn = anyDB.createConnection('sqlite3://freespeed.db');
conn.query('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, permission INTEGER NOT NULL, firstName TEXT NOT NULL, lastName TEXT NOT NULL)');
conn.query('CREATE TABLE IF NOT EXISTS boats (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, size INTEGER NOT NULL)');
/* NOTE: BOATS TABLE SHOULD BE PRE-POPULATED*/
conn.query('CREATE TABLE IF NOT EXISTS workouts (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, type TEXT NOT NULL)');
conn.query('CREATE TABLE IF NOT EXISTS workoutUserBoat (id INTEGER PRIMARY KEY AUTOINCREMENT, workoutID INTEGER NOT NULL, username TEXT NOT NULL, boatID INTEGER NOT NULL, startTime TEXT NOT NULL)');
conn.query('CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY AUTOINCREMENT, workoutUserBoatID INTEGER NOT NULL, interval INTEGER, distanceGPS REAL, distanceIMP REAL, elapsedTime TEXT, splitGPS TEXT, speedGPS REAL, splitIMP REAL, speedIMP REAL, strokeRate REAL, totalStrokes INTEGER, distancePerStrokeGPS REAL,distancePerStrokeIMP REAL, heartRateBPM INTEGER, power INTEGER, catch INTEGER, slip INTEGER, finish INTEGER, wash INTEGER, forceAvg INTEGER, work INTEGER, forceMax INTEGER, maxForceAngle INTEGER, GPSLat REAL, GPSLon REAL)');

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

app.get('/personal-data-page', function(request, response) {
  // 1. Authenticate user is allowed to make this post
  // 2. fetch most recent workout of the user and give them all data
  console.log('- Request received:', request.method.cyan, request.url.underline);
  response.sendFile('public/personal_page.html', {root: __dirname });
});


app.get('/upload-data', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  response.sendFile('public/upload-data.html', {root: __dirname });
});

app.post('/data-upload', function(request, response) {
  // 1. Authenticate user is allowed to do what they did using JWT
  // 2. Authenticate that data uploaded is valid
  // 3. Upload data to database
  var data = request.body;
  var code = Number(request.body.code);
  if (code === 0) {
    // Create New Workout + New boat
    createNewWorkout(request.body);
  } else if (code === 1) {
    // Create New Boat for existing workout
    createNewBoatUsers(request.body);
  } else if (code === 2) {
    //TODO: Update Existing Entry
  }
  console.log('- Request received:', request.method.cyan, request.url.underline);
});

/*
 * This function creates a new workout and edits the workoutId of the request's
 * JSON file. It then calls createNewBoat()
 */
function createNewWorkout(data) {
  var sql = "INSERT INTO workouts (date, type) VALUES (?, ?)";
  conn.query(sql, [data.workoutDate, data.workoutType], function (err, row) {
    if (err === null) {
      data.workoutID = row.lastInsertId;
      for (var i = 0; i < data.numUsers; i++) {
        var username = data[makeJSON(i, "username", -1)];
        var startTime = data[makeJSON(i, "startTime", -1)];
        var numRows = data[makeJSON(i, "numberRows", -1)];
        createNewWorkoutUserBoat(i, startTime, username, data, numRows);
      }
    } else {
      /*TODO: Handle Error */
      console.log(err);
    }
  });
}

/*
 * This function expects the data to contain the corresponding workout id and adds
 * data to the workoutUserBoat table.
 */
function createNewWorkoutUserBoat(currUserInd, startTime, username, data, numRows) {
  var sql = "INSERT INTO workoutUserBoat (workoutID, username, boatID, startTime) VALUES (?, ?, ?, ?)";
  conn.query(sql, [data.workoutID, username, data.boatID, startTime], function (err, row) {
    if (err === null) {
      console.log(String(username) + " has new workout data!");
      data.workoutUserBoatID = row.lastInsertId;
      insertData(currUserInd, data, numRows);
    } else {
      /*TODO: Handle Error*/
      console.log(err);
    }
  });
}

function insertData(currUserInd, data, numRows) {
  var toInsert = [];
  var sql = "INSERT INTO data (workoutUserBoatID, interval, distanceGPS, distanceIMP, elapsedTime, splitGPS, speedGPS, splitIMP, speedIMP, strokeRate, totalStrokes, distancePerStrokeGPS, distancePerStrokeIMP, heartRateBPM, power, catch, slip, finish, wash, forceAvg, work, forceMax, maxForceAngle, GPSLat, GPSLon)" +
  " VALUES ";
  for (var i = 0; i < numRows; i++) {
    sql += "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?), ";
    toInsert.push(data.workoutUserBoatID);
    var concatArray = data[makeJSON(currUserInd, "per-stroke-data", i)];
    for (var j = 0; j < 24; j++) {
      if (j != 3 & j != 4 & j != 6) {
        concatArray[j] = Number(concatArray[j]);
      }
    }
    toInsert = toInsert.concat(concatArray);
  }
  sql = sql.slice(0, -2);
  conn.query(sql, toInsert, function(err, res) {
    if (err === null) {
      console.log("Records succesfully added");
    } else {
      /*TODO: Handle Error*/
      console.log(err);
    }
  });
}

function makeJSON(firstIndex, secondIndex, thirdIndex) {
  // if thirdIndex = -1;
  var string = "users[" + String(firstIndex) + "][" + String(secondIndex) + "]";
  if (thirdIndex != -1) {
    string += "[" + String(thirdIndex) +"][]";
  }

  return string;
}

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
