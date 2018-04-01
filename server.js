//Install express server
const express = require('express');
const app = express();

// Serve only the static files form the dist directory

var eventList = [{"name":"NUTRI FOOD EVENT 12","linkPostFB": "https://goo.gl/ZiLXM8","nameOfCompany":"NUTRI FOOD","giftArray":[{"name":"01 Máy giặt","numberOfReward":100},{"name":"01 Tủ lạnh","numberOfReward":100},{"name":"01 Tivi","numberOfReward":100},{"name":"01 Máy sấy tóc","numberOfReward":100}],"dateCreate":"2018-04-01T16:34:02.284Z","isDone":false,"linkImageWheel":"https://i.imgur.com/PO7VtI8.png"},{"name":"NUTRI FOOD EVENT","nameOfCompany":"NUTRI FOOD","giftArray":[{"name":"01 Máy giặt","numberOfReward":100},{"name":"01 Tủ lạnh","numberOfReward":100},{"name":"01 Tivi","numberOfReward":100},{"name":"01 Máy sấy tóc","numberOfReward":100}],"dateCreate":"2018-04-01T16:34:02.284Z","isDone":false,"linkImageWheel":""},{"name":"NUTRI FOOD EVENT","nameOfCompany":"NUTRI FOOD","giftArray":[{"name":"01 Máy giặt","numberOfReward":100},{"name":"01 Tủ lạnh","numberOfReward":100},{"name":"01 Tivi","numberOfReward":100},{"name":"01 Máy sấy tóc","numberOfReward":100}],"dateCreate":"2018-04-01T16:34:02.284Z","isDone":false,"linkImageWheel":""}];
app.use(express.static(__dirname + '/dist'));
app.get('/api/wheel', (req, res) => {
	res.send('Hello pe hoa');
});

app.get('/api/events/:_id', function(req, res){
	// User.getUserById(req.params._id, function(err, user){
	// 	if(err){
	// 		res.status(500).send('err');
	// 	}
	res.json(eventList[req.params._id]);
	// });
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
console.log('listening...');