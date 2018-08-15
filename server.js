//piece types:
//0 - distance, 1 - time, 2 - strokes

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var anyDB = require('any-db');
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20');
var session = require('express-session');
var cookieSession = require('cookie-session');
var LocalStrategy = require('passport-local').Strategy;
var nodemailer = require('nodemailer');
const { spawn } = require('child_process');
var zerorpc = require("zerorpc");

var client = new zerorpc.Client();
client.connect("tcp://127.0.0.1:4242");
client.on("error", function(error) {
    console.error("RPC client error:", error);
  });

var emailBank = ['brownfreespeed@gmail.com', 'fifejames99@gmail.com', 'russell.dodd15@gmail.com', 'russell_dodd@brown.edu'];
var conn = anyDB.createConnection('sqlite3://freespeed.db');
conn.query('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, permission INTEGER NOT NULL, firstName TEXT NOT NULL, lastName TEXT NOT NULL, email TEXT NOT NULL, year INTEGER NOT NULL)');
conn.query('CREATE TABLE IF NOT EXISTS boats (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, size INTEGER NOT NULL)');
conn.query('SELECT * FROM boats', function (err, res) {
    if (res.rowCount === 0) {
      /* NOTE: BOATS TABLE SHOULD BE PRE-POPULATED*/
      conn.query('INSERT INTO boats (name, size) values ("Baker", 8)');
      conn.query('INSERT INTO boats (name, size) values ("94", 8)');
    }
});
conn.query('CREATE TABLE IF NOT EXISTS intervals (id INTEGER PRIMARY KEY AUTOINCREMENT, workoutUserBoatID INTEGER NOT NULL, start INTEGER NOT NULL, end INTEGER NOT NULL)');//, interval TEXT NOT NULL, type INTEGER NOT NULL)');
conn.query('CREATE TABLE IF NOT EXISTS workouts (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL, type TEXT NOT NULL)');
conn.query('CREATE TABLE IF NOT EXISTS workoutUserBoat (id INTEGER PRIMARY KEY AUTOINCREMENT, workoutID INTEGER NOT NULL, username TEXT NOT NULL, boatID INTEGER NOT NULL)');
conn.query('CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY AUTOINCREMENT, workoutUserBoatID INTEGER NOT NULL, interval INTEGER, distanceGPS REAL, distanceIMP REAL, elapsedTime TEXT, splitGPS TEXT, speedGPS REAL, splitIMP REAL, speedIMP REAL, strokeRate REAL, totalStrokes INTEGER, distancePerStrokeGPS REAL,distancePerStrokeIMP REAL, heartRateBPM INTEGER, power INTEGER, catch INTEGER, slip INTEGER, finish INTEGER, wash INTEGER, forceAvg INTEGER, work INTEGER, forceMax INTEGER, maxForceAngle INTEGER, GPSLat REAL, GPSLon REAL)');
conn.query('CREATE TABLE IF NOT EXISTS googlePassportUsers (id INTEGER, permission INTEGER, firstName TEXT, lastName TEXT, email TEXT, organization TEXT, year INTEGER)');

var engines = require('consolidate');
var colors = require('colors');
var path = require('path');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

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
		console.log("in auth check")
		conn.query('SELECT * FROM googlePassportUsers WHERE id=$1', [request.user], function(error, result){
			if(error){
				console.log("error in authcheck")
				console.log(error)
			}else{
				var emailToCheck = result.rows[0].email
				console.log("email to check is " + emailToCheck)
				if(emailBank.indexOf(emailToCheck) > -1){
					next()
				}else{
					request.logout();
					response.redirect('/errorPage');
				}
			}
		})
	}else{
		response.redirect('/login')
	}
}

const authCheck2 = (request, response, next) => {
	console.log("in authcheck2")
	if(request.user){
		console.log("authCheck2 success")
		response.redirect('/profile')
	}else{
		request.logout()
		next();
	}
}

passport.use(
	new GoogleStrategy({
		callbackURL: '/auth/google/redirect',
		clientID:'500155261938-rkv4mdgumottjv65s4rhtlgoc47d9isv.apps.googleusercontent.com',
		clientSecret: 'eJVp2uuai9g2slPb-ksWInfi'
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
   									organization: domain,
                   					 year: 3000
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

app.get('/auth/google', passport.authenticate('google', {
	scope:['profile', 'email']
}));

app.get('/auth/google/redirect', passport.authenticate('google'), function(request, response){
	console.log('- Request received:', request.method.cyan, request.url.underline);
	if(request.user.permission == 3){
		//redirrect to the page where they choose if they're a rower or a coach
		//this is the first time they've logged in
		response.redirect('/selectRowingStatus')
	} else{
		response.redirect("/profile");
	}
});
app.get('/', function(request, response){
  console.log('- Request received:', request.method.cyan, request.url.underline);
  response.redirect('/login');
});

app.engine('html', engines.hogan);
app.set('views', __dirname + '/templates');
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.get('/login', authCheck2, function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  response.sendFile('public/login.html', {root: __dirname });
});

app.get('/sign-up', function(request, response) {
   console.log('- Request received:', request.method.cyan, request.url.underline);
  request.logout();
  response.redirect('/');
});

app.get('/errorPage', function(request, response){

	conn.query('DELETE FROM googlePassportUsers WHERE id=$1', [request.user], function(error, result){
		if(error){
			console.log('issue when removing uninvied user');
			console.log(error)
		}else{
			request.logout();
			response.sendFile('public/errorPage.html', {root: __dirname });
		}
	})

})

app.get('/profile', authCheck, function(request, response){
	 console.log('- Request received:', request.method.cyan, request.url.underline);
   var userID = request.user;
   console.log("user ID" + userID)
   conn.query("SELECT * FROM googlePassportUsers WHERE id=$1", [userID], function(error, result){
 		if(error){
 			console.log("error setting permission")
 			console.log(error)
 		}else{
      //response.send("profile message" + result.rows[0].firstName);
      response.render('home.html', {firstname: result.rows[0].firstName, username: result.rows[0].email});
 		}
 	});
})

app.get('/upload-data', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  response.sendFile('public/upload-data.html', {root: __dirname });
});

app.get('/selectRowingStatus', authCheck, function(request, response){
	console.log('- Request received:', request.method.cyan, request.url.underline);
	response.sendFile('public/selectRowingStatus.html', {root: __dirname});
})

app.post('/updatePermission', authCheck, function(request, response){
  console.log('- Request received:', request.method.cyan, request.url.underline);
	var permission = request.body.permission;
  console.log("in update permission: permission = " + request.body.permission)
	var year = request.body.year;
	console.log(year)
	userID = request.user;
	conn.query("UPDATE googlePassportUsers SET permission=$1, year=$2 WHERE id=$3", [permission, year, userID], function(error, result){
		if(error){
			console.log("error setting permission")
			console.log(error)
		}else{
			response.redirect('/profile');
		}
	})
})

app.get('/auth/logout', function(request, response){
	//hangle with passport
	request.logout()
	response.redirect('/');
});

app.post('/upload-data-information', function(request, response) {
  var sql = "SELECT email, firstName, lastName FROM googlePassportUsers";
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

function deleteData(workoutUserBoatID) {
  var sql = "DELETE FROM data where workoutUserBoatID = $1";
  conn.query(sql,[workoutUserBoatID], function(err, res) {
    if (err === null) {
      console.log("removed data");
    } else {
      /*TODO: Handle Error*/
      console.log(err);
    }
  });
}

function deleteWorkoutUserBoat(workoutUserBoatID){
  var sql = "DELETE FROM workoutUserBoat where id = $1";
  conn.query(sql, [workoutUserBoatID], function(err, res) {
    if (err === null) {
      console.log("removed workoutUserBoatID");
    } else {
      /*TODO: Handle Error*/
      console.log(err);
    }
  });
}

function deleteWorkout(workoutID, response){
  var sql = "DELETE FROM workouts where id = $1";
  conn.query(sql, [workoutID], function(err, res) {
    if (err === null) {
      console.log("removed workout");
      response.json({msg: "success"});
    } else {
      /*TODO: Handle Error*/
      console.log(err);
    }
  });
}

app.post('/remove-workout', function(request, response) {
  // definitely need to authenticate here and make sure data belongs to user
  var workoutID = escape(request.body.workoutID);
  console.log("workoutID", workoutID);
  var sql = "SELECT id FROM workoutUserBoat WHERE workoutID=$1";
  var json = {};
  conn.query(sql, [workoutID], function(err, res) {
    if (err === null) {
      var workoutUserBoatIDs = res.rows;
      console.log("workoutUserBoatIDs", workoutUserBoatIDs);
      for(var i = 0; i < workoutUserBoatIDs.length; i++){
        deleteData(workoutUserBoatIDs[i].id);
        deleteWorkoutUserBoat(workoutUserBoatIDs[i].id);
      }
      deleteWorkout(workoutID, response);
    } else {
      /*TODO: Handle Error*/
      console.log(err);
    }
  });

  console.log('- Request received:', request.method.cyan, request.url.underline);

});

app.post('/remove-user-workout', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  var workoutID = request.body.workoutID;
  var username = request.body.username;
  var sql = "SELECT id FROM workoutUserBoat WHERE username = ? AND workoutID = ?";
  conn.query(sql, [username, workoutID], function(err, res) {
    if (err == null) {
      var workoutUserBoatID = res.rows[0]['id'];
      sql = "DELETE FROM workoutUserBoat WHERE id = ?";
      conn.query(sql, [workoutUserBoatID], function(err, res) {
        if (err == null) {
          sql = "DELETE FROM data WHERE workoutUserBoatID = ?";
          conn.query(sql, [workoutUserBoatID], function(err, res) {
            if (err == null) {
              sql = "SELECT * FROM workoutUserBoat WHERE workoutID = ?";
              if (err == null) {
                if (res.rows.length == 0) {
                  sql = "DELETE FROM workouts WHERE id = ?";
                  conn.query(sql, [workoutID], function(err, res) {
                    if (err != null) {
                      console.log(err);
                    } else {
                      console.log("Record succesfully Deleted");
                      response.json([]);
                    }
                  });
                } else {
                  console.log("Record succesfully Deleted");
                  response.json([]);
                }
              } else {
                console.log(err);
              }
            } else {
              console.log(err);
            }
          });
        } else {
          console.log(err);
        }
      });
    } else {
      console.log(err);
    }
  });
});

app.post('/data-remove', function(request, response) {
  // definitely need to authenticate here and make sure data belongs to user
  var workoutUserBoatID = escape(request.body.workoutUserBoatID);
  deleteData(workoutUserBoatID);
  deleteWorkoutUserBoat(workoutUserBoatID);
  console.log('- Request received:', request.method.cyan, request.url.underline);
  response.json({msg: "success"});
});

app.post('/remove-data-workoutId', function(request, response) {
  // definitely need to authenticate here and make sure data belongs to user
  var workoutID = escape(request.body.workoutID);
  var email = escape(request.body.email);
  var sql = "SELECT id FROM workoutUserBoat WHERE workoutID=$1 and username=$2";
  var json = {};
  conn.query(sql, [workoutID, email], function(err, res) {
    if (err === null) {
      var workoutUserBoatID = res.rows[0].id;
      console.log("workoutUserBoatIDs", workoutUserBoatID);
      deleteData(workoutUserBoatID);
      deleteWorkoutUserBoat(workoutUserBoatID);
    } else {
      console.log(err);
    }
  console.log('- Request received:', request.method.cyan, request.url.underline);
  response.json({msg: "success"});
  });
});

app.post('/test-python2', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  var data_res = request.body;
  data_res.data = parseCsv(data_res.data);
  console.time("python");
  client.on("error", function(error) {
    console.error("RPC client error:", error);
  });
  client.invoke("sendIntervals", JSON.stringify(data_res.data), data_res.gaps, data_res.intIdx, data_res.pieces, data_res.threshold, function(error, res, more) {
      console.log(res);
      console.timeEnd("python");
      response.send(res);
  });
  
  /*"python/testParse.py", JSON.stringify(data_res.data), data_res.gaps, data_res.intIdx, data_res.pieces, data_res.threshold]);
  console.timeEnd("python");*/
  

}); 

app.post('/test-python', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  var data_res = request.body;
  data_res.data = parseCsv(data_res.data);
  console.time("python");
  let runPy = new Promise(function(sucess, nosuccess) {
    //const pythonProcess = spawn('python',["python/getIntervals.py", JSON.stringify(data_res.data), data_res.gaps, data_res.intIdx, data_res.pieces, data_res.threshold]);
    const pythonProcess = spawn('python',["python/testParse.py", JSON.stringify(data_res.data), data_res.gaps, data_res.intIdx, data_res.pieces, data_res.threshold]);
    
  var pyData = ""
  pythonProcess.stdout.on('data', function (data){
    pyData += data;
  });
  pythonProcess.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.timeEnd("python");
    response.send(pyData);
    console.log(`child process exited with code ${code}`);
  });
});

}); 

app.post('/data-upload', function(request, response) {
  // 1. Authenticate user is allowed to do what they did using JWT
  // 2. Authenticate that data uploaded is valid
  // 3. Upload data to database
  console.log('- Request received:', request.method.cyan, request.url.underline);
  var data = JSON.parse(request.body.data);
  //console.log(data);
  //console.log(data.users[0].per_stroke_data);
  for (var i = 0; i < data.users.length; i++){
    data.users[i].per_stroke_data = parseCsv(data.users[i].per_stroke_data[0]);
  }

  var workoutID = data.workoutID;
  if (workoutID == -1) {
    // Create New Workout + New boat
    createNewWorkout(data, response);
  } else {
    // Create New Boat for existing workout
    for (var i = 0; i < data.users.length; i++) {
      var username = data.users[i].username;
      createNewWorkoutUserBoat(i, username, data, response);
    }
  }
});

/*
 * This function creates a new workout and edits the workoutId of the request's
 * JSON file. It then calls createNewBoat()
 */
function createNewWorkout(data, response) {
  var sql = "INSERT INTO workouts (date, type) VALUES (?, ?)";

  data.users[0].per_stroke_data.startTime = changeDateFormat(data.users[0].per_stroke_data.startTime);
  conn.query(sql, [data.users[0].per_stroke_data.startTime, data.workoutType], function (err, row) {
    if (err == null) {
      data.workoutID = row.lastInsertId;
      for (var i = 0; i < data.users.length; i++) {
        var username = data.users[i].username;
        createNewWorkoutUserBoat(i, username, data, response);
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

function insertIntervals(currUserInd, data){
  console.time("python");
  client.invoke("combineProduceIntervals", JSON.stringify(data_res.data), data_res.pieces, data_res.gaps, data_res.intIdx, data_res.threshold, function(error, res, more) {
      console.log(res);
      if (!res) // in the case that the python server has an error
        res = [];
      var gaps = JSON.parse(res);
      for (var i = 0; i < res.length; i++){
      var cur_gap = gaps[i];
      var sql = "INSERT INTO gaps (workoutUserBoatID, start, end, index) VALUES (?, ?, ?, ?)";
        conn.query(sql, [data.workoutUserBoatID, cur_gap[0], cur_gap[1], i], function (err, row) {
          if (err == null) {
            console.log("added new gap");
          } else {
            /*TODO: Handle Error*/
            console.log(err);
          }
        });
      }
      console.timeEnd("python");
  });

}


/*
 * This function expects the data to contain the corresponding workout id and adds
 * data to the workoutUserBoat table.
 */
function createNewWorkoutUserBoat(currUserInd, username, data, response) {
  var sql = "SELECT * FROM workouts JOIN workoutUserBoat ON workouts.id = workoutUserBoat.workoutID " +
  "WHERE workouts.id = ? AND workoutUserBoat.username = ?";
  conn.query(sql, [data.workoutID, username], function(err, res) {
    console.log(res);
    if (err == null) {
      if (res.rows.length != 0) {
        response.json({msg: "Cannot upload data for same workout!"});
      } else {
        var sql = "INSERT INTO workoutUserBoat (workoutID, username, boatID) VALUES (?, ?, ?)";
        conn.query(sql, [data.workoutID, username, data.boatID], function (err, row) {
          if (err == null) {
            console.log(String(username) + " has new workout data!");
            data.workoutUserBoatID = row.lastInsertId;
            response.json({msg: "Success"});
            //insertIntervals(currUserInd, data);
            insertData(currUserInd, data);
          } else {
            /*TODO: Handle Error*/
            console.log(err);
          }
        });
      }
    } else {
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
  var size = 30;
  var counter = data.users[currUserInd].per_stroke_data.data.length;
  console.log("counter",counter);
  var i_global = 0;
  while(!((counter - size) <=0)){
    //console.log("iteration", i_global);
  var sql = "INSERT INTO data (workoutUserBoatID, interval, distanceGPS, distanceIMP, elapsedTime, splitGPS, speedGPS, splitIMP, speedIMP, strokeRate, totalStrokes, distancePerStrokeGPS, distancePerStrokeIMP, heartRateBPM, power, catch, slip, finish, wash, forceAvg, work, forceMax, maxForceAngle, GPSLat, GPSLon)" +
  " VALUES";
  var toInsert = [];
  //console.log("i_global", i_global);
  for (var i = i_global*size; i < (i_global+1)*size; i++) {
    toInsert.push(data.workoutUserBoatID);
    var concatArray = data.users[currUserInd].per_stroke_data.data[i];
    for (var j = 0; j < 24; j++) {
      if (j != 3 & j != 4 & j != 6) {
        concatArray[j] = Number(concatArray[j]);
      }
    }
    toInsert = toInsert.concat(concatArray);
    sql +=  " (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    if (i != (i_global+1)*size - 1){
      sql +=  ", ";
    }
  
  }
  i_global+=1;
  counter -= size;
  //sql += "COMMIT; "
  /*
  console.log("sql", sql);*/
  /*
  console.log("toInsert",toInsert);
  console.log("toInsert length",toInsert.length);*/
  //console.log("toInsert",toInsert);
  conn.query(sql, toInsert, function(err, res) {
      if (err === null) {
        console.log("Records succesfully added");
      } else {
        /*TODO: Handle Error*/
        console.log(err);
      }
    });
  }
  var sql = "INSERT INTO data (workoutUserBoatID, interval, distanceGPS, distanceIMP, elapsedTime, splitGPS, speedGPS, splitIMP, speedIMP, strokeRate, totalStrokes, distancePerStrokeGPS, distancePerStrokeIMP, heartRateBPM, power, catch, slip, finish, wash, forceAvg, work, forceMax, maxForceAngle, GPSLat, GPSLon)" +
  " VALUES";
  var toInsert = [];
  for (; counter >0; counter--) {
    toInsert.push(data.workoutUserBoatID);
    var concatArray = data.users[currUserInd].per_stroke_data.data[i];
    for (var j = 0; j < 24; j++) {
      if (j != 3 & j != 4 & j != 6) {
        concatArray[j] = Number(concatArray[j]);
      }
    }
    toInsert = toInsert.concat(concatArray);
    sql +=  " (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    if (counter != 1){
      sql +=  ", ";
    }
  }
  //console.log("toInsert length",toInsert.length);
  conn.query(sql, toInsert, function(err, res) {
      if (err === null) {
        console.log("Records succesfully added");

      } else {
        /*TODO: Handle Error*/
        console.log(err);
      }
    });
}


app.get('/manage-data', authCheck, function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  var userID = request.user;
  console.log("user ID" + userID)
  conn.query("SELECT * FROM googlePassportUsers WHERE id=$1", [userID], function(error, result){
   if(error){
     console.log("error setting permission")
     console.log(error)
   }else{
     response.render('manage-data.html', {username: result.rows[0].email, firstname: result.rows[0].firstName});
   }
 });


});

/// socket events

app.post('/get-workouts', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  var sql = 'SELECT * FROM workouts ORDER BY date DESC';
  conn.query(sql, function(err, result) {
    if (err === null) {
      response.json(result.rows);
    } else {
      /*TODO: Handle Error*/
      console.log(err);
    }
  });
});

app.post('/get-workout-info', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  var sql = 'SELECT googlePassportUsers.email, googlePassportUsers.firstName, googlePassportUsers.lastName, boats.name ' +
  'FROM workoutUserBoat JOIN googlePassportUsers ON googlePassportUsers.email = ' +
  'workoutUserBoat.username JOIN boats ON boats.id = ' +
  'workoutUserBoat.boatID ' +
  'WHERE workoutUserBoat.workoutID = $1';
  console.log("workoutID",request.body.workoutID);

  conn.query(sql, [request.body.workoutID], function(err, result) {
    if (err === null) {
     console.log("result is " + result.rows);
      response.json({data: result.rows});
    } else {
      console.log(err);
    }
  });

});

app.post('/get-workout-data-gaps', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  var sql = 'SELECT googlePassportUsers.email, gaps.* ' +
  'FROM workoutUserBoat JOIN googlePassportUsers ON googlePassportUsers.email = ' +
  'workoutUserBoat.username JOIN gaps ON gaps.workoutUserBoatID = workoutUserBoat.id' +
  'WHERE workoutID = ?';
  console.log("workoutID",request.body.workoutID);

  conn.query(sql, [request.body.workoutID], function(err, result) {
    if (err === null) {
     console.log("result is " + result.rows);
      response.json({data: result.rows});
    } else {
      console.log(err);
    }
  });

});

app.post('/get-workout-data', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  var sql = 'SELECT googlePassportUsers.email, googlePassportUsers.firstName, googlePassportUsers.lastName, boats.name, data.* ' +
  'FROM workoutUserBoat JOIN googlePassportUsers ON googlePassportUsers.email = ' +
  'workoutUserBoat.username JOIN boats ON boats.id = ' +
  'workoutUserBoat.boatID JOIN data ON data.workoutUserBoatID = workoutUserBoat.id ' +
  'WHERE workoutID = ?';
  console.log("workoutID",request.body.workoutID);

  conn.query(sql, [request.body.workoutID], function(err, result) {
    if (err === null) {
     console.log("result is " + result.rows);
      response.json({data: result.rows});
    } else {
      console.log(err);
    }
  });

});

app.post('/get-user-data', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  var sql = 'SELECT email, firstName, lastName, email, year FROM googlePassportUsers WHERE NOT year=1000';

  conn.query(sql, function(err, result) {
    if (err === null) {
      response.json(result.rows);
    } else {
      console.log(err);
    }
  });
});

app.post('/get-boat-data', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  var sql = 'SELECT * FROM boats';

  conn.query(sql, function(err, result) {
    if (err === null) {
      response.json(result.rows);
    } else {
      console.log(err);
    }
  });
});

function makeIds(rows) {
  var toReturn = [];
  for (var i = 0; i < rows.length; i++) {
    toReturn.push(rows[i]['id']);
  }
  return toReturn;
}

app.post('/remove-user', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  var sql = 'DELETE FROM googlePassportUsers WHERE email = ?';

  conn.query(sql, [request.body.username], function(err, result) {
    if (err === null) {
        // Remove user from the email list may give issues?
        emailBank.filter(x => x !== request.body.username)
        sql = 'SELECT id FROM workoutUserBoat WHERE username = ?';
        conn.query(sql, [request.body.username], function(err, res) {
          if (err == null) {
            console.log(res.rows);
            var workoutUserBoatIDs = makeIds(res.rows);
            console.log(workoutUserBoatIDs)
            sql1 = 'DELETE FROM data WHERE workoutUserBoatID = ?';
            sql2 = 'DELETE FROM workoutUserBoat WHERE id = ?';
            for (var i = 0; i < workoutUserBoatIDs.length; i++) {
              conn.query(sql1, workoutUserBoatIDs[i], function(err, res) {
                if (err != null) {
                  console.log(err);
                }
              });
              conn.query(sql2, workoutUserBoatIDs[i], function(err, res) {
                if (err != null) {
                  console.log(err);
                }
              });
            }
          } else {
            console.log(err);
          }
        });
    } else {
      console.log(err);
    }
  });
});

app.post('/remove-boat', function(request, response) {
  console.log('- Request received:', request.method.cyan, request.url.underline);
  var sql = 'DELETE FROM boats WHERE id = ?';

  conn.query(sql, request.body.boatID, function(err, result) {
    if (err == null) {
      response.json([]);
    } else {
      console.log(err);
    }
  });
});

app.post('/add-boat', function(req, response) {
  var sql = 'SELECT * FROM boats WHERE name = ?';

  conn.query(sql, [req.body.boatName], function(err, res) {
    if (err != null) {
      console.log(err);
    } else {
      if (res.rows.length == 0) {
        addBoat(req, response);
      } else {
        console.log("HERE");
      }
    }
  });
});


app.get('/manage-data/:username', authCheck, function(req, response) {
  console.log('- Request received:', req.method.cyan, req.url.underline);
  var userID = req.user;
  conn.query("SELECT * FROM googlePassportUsers WHERE id=$1", [userID], function(error, result){
   if(error){
     console.log("error setting permission")
     console.log(error)
   }else{
     response.render('manage-data-user.html', {firstname: result.rows[0].firstName, username: result.rows[0].email});
   }
 });
});

app.post('/manage-data/:username', function(req, response) {
  console.log('- Request received:', req.method.cyan, req.url.underline);
  var username = req.params.username;

  var sql = 'SELECT * FROM googlePassportUsers WHERE email = ?';

  conn.query(sql, [username], function(err, res) {
    console.log(res);
    if (err != null) {
      console.log(err);
    } else {
      if (res.rows.length === 0) {
        console.log("fail");
      }
      else {
        var sql = 'SELECT DISTINCT googlePassportUsers.email, googlePassportUsers.firstName,' +
        ' googlePassportUsers.lastName, workouts.* FROM workoutUserBoat JOIN googlePassportUsers' +
        ' ON googlePassportUsers.email = workoutUserBoat.username JOIN workouts ON' +
        ' workouts.id = workoutUserBoat.workoutID WHERE googlePassportUsers.email = ?';
        conn.query(sql, [username], function(err, result) {
          response.json(result.rows);
        });
      }
    }
  });
});

function addBoat(req, response) {
  var sql = 'INSERT INTO boats (name, size) VALUES (?, ?)';

  conn.query(sql, [req.body.boatName, req.body.capacity], function(err, result) {
      if (err != null) {
          console.log(err);
      }
      else {
        sql = 'SELECT * FROM boats';
        conn.query(sql, function(err, res) {
          if (err != null) {
            console.log(err);
          }
          response.json(res.rows);
        });
      }
  });
}

app.post('/send-email', function (req, res) {
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'brownfreespeed@gmail.com',
      pass: 'Freespeed!'
    }
  });

  ////// ADDS THE USER TO THE LIST OF AUTHENTICATED EMAILS

  emailBank.push(req.body.email)

  var text = '<p>You\'ve been invited to join Freespeed by Brown University crew! </p><br> <p> Login with <span style=\"color:blue\">' + req.body.email + "</span>" +
  ' at the link <a href=\"http://localhost:8080/sign-up\">Here</a>';
  var mailOptions = {
    from: 'brownfreespeed@gmail.com',
    to: req.body.email,
    subject: 'Sign Up For Brown Freespeed!',
    html: text
  }
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
      res.json({yo: 'error'});
    } else {
      console.log('Message sent:' + info.response);
      res.json({yo: info.response});
    }
  });
});

// conn.query('DELETE FROM googlePassportUsers WHERE year=$1', [1000], function(error, result){
//   if(error){
//     console.log("error removing Alexander")
//     console.log(error)
//   }else{
//     conn.query('SELECT * FROM googlePassportUsers', function(error, result){
//     	console.log(result.rows)
//     })
//   }
// })

server.listen(8080);
console.log('listening on 8080');
