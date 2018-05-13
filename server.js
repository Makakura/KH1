//Install express server
const cors = require('cors')
const express = require('express');
const app = express();
app.use(cors())
var http = require("http");
setInterval(function() {
  http.get("http://quaythuong.herokuapp.com");
}, 600000);

// Import router
var router = require('./server-files/routes/router');

// Connect to mongodb
var mongoose = require('mongoose');
// mongoose.connect('mongodb://makakura:0985554820@ds231589.mlab.com:31589/kh1');
// mongoose.connect('mongodb://makakura:0985554820@ds113200.mlab.com:13200/kh2');
mongoose.connect('mongodb://admin:123123123@ds117590.mlab.com:17590/quaythuong');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected');
});

process.on('uncaughtException', function(err) { 
  console.log( " UNCAUGHT EXCEPTION " );
  console.log( "[Inside 'uncaughtException' event] " + err.stack || err.message );
});

// Make web client angular router on host
app.use(express.static(__dirname + '/dist'));

// Use router
app.use('/api', router)

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
console.log('listening...');