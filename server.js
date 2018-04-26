//Install express server
const cors = require('cors')
const express = require('express');
const app = express();
const basicAuth = require('express-basic-auth');
app.use(cors())
var http = require("http");
setInterval(function() {
  http.get("http://quaythuong.herokuapp.com");
}, 600000);

// Import router
var router = require('./server-files/routes/router');

// Connect to mongodb
var mongoose = require('mongoose');
mongoose.connect('mongodb://makakura:0985554820@ds231589.mlab.com:31589/kh1');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected');
});

// Make web client angular router on host
app.use(express.static(__dirname + '/dist'));

app.use(basicAuth({
  users: { 'admin': 'developer' }
}))

// Use router
app.use('/api', router)

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
console.log('listening...');