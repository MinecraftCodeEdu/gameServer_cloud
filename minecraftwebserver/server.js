// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var debug = require('debug')('my-app:server');
var http = require('http');
var https = require('https');
var port     = normalizePort(process.env.PORT || '443');
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var nev = require('email-verification')(mongoose);
require('./config/email-verification')(nev);
var path = require('path');
var fs = require('fs');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

// https =========================================================================
const privateKey = fs.readFileSync('/etc/letsencrypt/live/game.coalasw.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/game.coalasw.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/game.coalasw.com/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};
// configuration ===============================================================
mongoose.connect(configDB.url, { useMongoClient: true }); // connect to our database

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log('connected successfully');
});



require('./config/passport')(passport, nev); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// required for passport
app.use(session({
    secret: 'coalaswbestcodingeducation', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.set('port', '443');

/**
 * Create HTTP server.
 */

var server = https.createServer(credentials, app);

http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen('80');
/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
