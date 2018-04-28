//94THoF 2 seat 20180417 0706am

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var anyDB = require('any-db');
var bcrypt = require('bcrypt-nodejs');


var conn = anyDB.createConnection('sqlite3://freespeed.db');
conn.query('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, permission INTEGER NOT NULL, firstName TEXT NOT NULL, lastName TEXT NOT NULL)');
conn.query('CREATE TABLE IF NOT EXISTS boats (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, size INTEGER NOT NULL)');
conn.query('SELECT * FROM boats', function (err, res) {
    if (res.rowCount === 0) {
      /* NOTE: BOATS TABLE SHOULD BE PRE-POPULATED*/
      conn.query('INSERT INTO boats (name, size) values ("Baker", 8)');
      conn.query('INSERT INTO boats (name, size) values ("94", 8)');
    }
});
conn.query('CREATE TABLE IF NOT EXISTS workouts (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, type TEXT NOT NULL)');
conn.query('CREATE TABLE IF NOT EXISTS workoutUserBoat (id INTEGER PRIMARY KEY AUTOINCREMENT, workoutID INTEGER NOT NULL, username TEXT NOT NULL, boatID INTEGER NOT NULL)');
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
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

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

app.post('/upload-data-information', function(request, response) {
  var sql = "SELECT username, firstName, lastName FROM users";
  var json = {};
  conn.query(sql, function(err, res) {
    if (err === null) {
      json.users = res.rows;
      sql = "SELECT * FROM workouts ORDER BY date DESC";
      conn.query(sql, function(err, res){
        if (err === null) {
          json.workouts = res.rows;
          sql = "SELECT * FROM boats";
          conn.query(sql, function(err, res) {
            if (err === null) {
              json.boats = res.rows;
              console.log(json);
              response.json(json);
            } else {
              /*TODO: Handle Error*/
            }
          });
        } else {
          /*TODO: Handle Error*/
          console.log(err);
        }
      });
    } else {
      /*TODO: Handle Error*/
      console.log(err);
    }
  });
});

app.post('/data-upload', function(request, response) {
  // 1. Authenticate user is allowed to do what they did using JWT
  // 2. Authenticate that data uploaded is valid
  // 3. Upload data to database
  var data = JSON.parse(request.body.data);
  for (var i = 0; i < data.users.length; i++){
    data.users[i].per_stroke_data = parseCsv(data.users[i].per_stroke_data);
  }

  var code = Number(data.code);
  if (code === 0) {
    // Create New Workout + New boat
    createNewWorkout(data);
  } else if (code === 1) {
    // Create New Boat for existing workout
    createNewWorkoutUserBoat(data);
  } else if (code === 2) {
    //TODO: Update Existing Entry
  }
  console.log('- Request received:', request.method.cyan, request.url.underline);
});

app.post('/:userName/personal-data-page', function(request, response) {
  // 1. Authenticate user is allowed to make this post
  // 2. Figure out which workout they want. If none is specified then you give
  //    most recent workout data
  // 3. fetch most recent workout of the user and give them all data
  var username = request.params.userName;
});

/*
 * This function creates a new workout and edits the workoutId of the request's
 * JSON file. It then calls createNewBoat()
 */
function createNewWorkout(data) {
  var sql = "INSERT INTO workouts (date, type) VALUES (?, ?)";

  data.users[0].per_stroke_data.startTime = changeDateFormat(data.users[0].per_stroke_data.startTime);
  conn.query(sql, [data.users[0].per_stroke_data.startTime, data.workoutType], function (err, row) {
    if (err === null) {
      data.workoutID = row.lastInsertId;
      for (var i = 0; i < data.users.length; i++) {
        var username = data.users[i].username;
        createNewWorkoutUserBoat(i, username, data);
      }
    } else {
      /*TODO: Handle Error */
      console.log(err);
    }
  });
}

function changeDateFormat(date) {
  var month = date.substring(0, 2);
  var dd = date.substring(3, 5);
  var yyyy = '20' + date.substring(6, 8);
  var hh = Number(date.substring(9,11));
  var mm = date.substring(12, 14);
  if (date.substring(14, 16) === 'pm') {
    if (hh != 12) {
      hh += 12;
    } else {
      hh = 0;
    }
  }
  if (hh < 10) {
    hh = '0' + String(hh);
  }
  time = yyyy + '-' + month + '-' + dd + ' ' + hh + ':' + mm;

  return time;
}


/*
 * This function expects the data to contain the corresponding workout id and adds
 * data to the workoutUserBoat table.
 */
function createNewWorkoutUserBoat(currUserInd, username, data) {
  var sql = "INSERT INTO workoutUserBoat (workoutID, username, boatID) VALUES (?, ?, ?)";
  conn.query(sql, [data.workoutID, username, data.boatID], function (err, row) {
    if (err === null) {
      console.log(String(username) + " has new workout data!");
      data.workoutUserBoatID = row.lastInsertId;
      insertData(currUserInd, data);
    } else {
      /*TODO: Handle Error*/
      console.log(err);
    }
  });
}

function parseCsv(data){
  var jsonData = {"data": []};
	var allRows = data.split(/\r?\n|\r/);
  for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
  		var rowCells = allRows[singleRow].split(',');
  		if (rowCells.length > 0 && rowCells[0] === 'Start Time:'){
  			jsonData.startTime = rowCells[1];
  		} else if (rowCells.length > 0 && rowCells[0] === 'Per-Stroke Data:'){
  			break;
  		}
  	}
  	singleRow+=4;
  for (; singleRow < allRows.length; singleRow++) {
  	var rowCells = allRows[singleRow].split(',');
    //console.log(rowCells);
  	if (rowCells.length == 24){
      rowCells[0] = parseInt(rowCells[0]);
      if (rowCells[1] == "---"){
        continue;
      } else {
        rowCells[1] = parseFloat(rowCells[1]);
      }
      rowCells[2] = parseFloat(rowCells[2]);
      rowCells[5] = parseFloat(rowCells[5]);
      rowCells[7] = parseFloat(rowCells[7]);
      rowCells[8] = parseFloat(rowCells[8]);
      rowCells[9] = parseInt(rowCells[9]);
      rowCells[10] = parseFloat(rowCells[10]);
      rowCells[11] = parseFloat(rowCells[11]);
      for (var i = 12; i < 22; i++){
        if (rowCells[i] == "---"){
          rowCells[i] = 0;
        } else {
          rowCells[i] = parseInt(rowCells[i]);
        }
      }
      if (rowCells[22] == "---"){
        rowCells[22] = 0.0;
      } else {
        rowCells[22] = parseFloat(rowCells[22]);
      }
      if (rowCells[23] == "---"){
        rowCells[23] = 0.0;
      } else {
        rowCells[23] = parseFloat(rowCells[23]);
      }
  		jsonData.data.push(rowCells);
  	}
  }
  return jsonData;
}

function insertData(currUserInd, data) {
  var sql = "INSERT INTO data (workoutUserBoatID, interval, distanceGPS, distanceIMP, elapsedTime, splitGPS, speedGPS, splitIMP, speedIMP, strokeRate, totalStrokes, distancePerStrokeGPS, distancePerStrokeIMP, heartRateBPM, power, catch, slip, finish, wash, forceAvg, work, forceMax, maxForceAngle, GPSLat, GPSLon)" +
  " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  for (var i = 0; i < data.users[currUserInd].per_stroke_data.data.length; i++) {
    var toInsert = [];
    toInsert.push(data.workoutUserBoatID);
    var concatArray = data.users[currUserInd].per_stroke_data.data[i];
    for (var j = 0; j < 24; j++) {
      if (j != 3 & j != 4 & j != 6) {
        concatArray[j] = Number(concatArray[j]);
      }
    }
    toInsert = toInsert.concat(concatArray);
    conn.query(sql, toInsert, function(err, res) {
      if (err === null) {
        console.log("Records succesfully added");
      } else {
        /*TODO: Handle Error*/
        console.log(err);
      }
    });
  }
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
	if (username === '' || password === '' || lastName === '' || firstName === '' || confirmPassword === ''){
		console.log("missing fields inside if satement");
		io.to(request.body.socketID).emit('missingFields', {});
	//check if passwords do not match
	} else if(password !== confirmPassword){
		console.log("in unequal passwords")
		console.log(request.body.socketID)
		io.to(request.body.socketID).emit('unequalPasswords', {});
	} else if(password.length < 8){
		io.to(request.body.socketID).emit('passwordTooShort', {});
	} else{
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
						} else {
							console.log(hash);
	 						conn.query('INSERT INTO users (username, password, permission, firstname, lastname) VALUES($1, $2, $3, $4, $5)',
	 						[username, hash, permission, firstName, lastName], function(error, result){
								if (error) {
									console.log(error);
								} else {
									io.to(request.body.socketID).emit('successfulInsert', {username: username, permission: permission});
								}
							})
						}
					});
				}
			}
		})
	}
})

app.post('/get-workouts', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  var sql = 'SELECT * FROM workouts';
  conn.query(sql, function(err, result) {
    if (err === null) {
      response.json(result.rows);
    } else {
      /*TODO: Handle Error*/
      console.log(err);
    }
  });
});

app.post('/get-workout-data', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  var sql = 'SELECT users.username, users.firstName, boats.name, data.* ' +
  'FROM workoutUserBoat JOIN users ON users.username = ' +
  'workoutUserBoat.username JOIN boats ON boats.id = ' +
  'workoutUserBoat.boatID JOIN data ON data.workoutUserBoatID = workoutUserBoat.id ' +
  'WHERE workoutID = ?';

  conn.query(sql, [response.workoutID], function(err, result) {
    if (err === null) {
      response.json(results.rows);
    } else {
      console.log(err);
    }
  });

});

/// socket events

io.on('connection', function(socket){

})

server.listen(8080);
console.log('listening on 8080');
