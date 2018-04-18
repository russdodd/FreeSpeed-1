//94THoF 2 seat 20180417 0706am

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var anyDB = require('any-db');

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
    response.sendFile('public/index.html', {root: __dirname });
});



server.listen(8080);
