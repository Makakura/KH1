var express = require('express')
var router = express.Router()

// Import model
var EventModel = require('../model/event-model');
var GiftModel = require('../model/gift-model');
var CodeModel = require('../model/code-model');

// middleware that is specific to this router
router.use(function (req, res, next) {
  next()
})

// Get all events
router.get('/events', function (req, res) {
	getAllEvents(req, res);
});

// Add new event
router.post('/events', function(req, res){
	addNewEvent(req, res);
});

// Get event by id
router.get('/events/:_id', function(req, res){
	getEventByID(req, res);
});

// Get event by id
router.put('/events/:_id', function(req, res){
	editEventByID(req, res);
});

// Check valid Code
router.post('/checkcode', function(req, res){
	checkCode(req, res);
});

// Check valid Code
router.put('/addcodeinfo', function(req, res){
	addCodeInfo(req, res);
});

// Get IP
router.get('/ip', function(req, res){
	var ip;
  if (req.headers['x-forwarded-for']) {
    ip = req.headers['x-forwarded-for'].split(',').pop();
  } else if (req.headers['x-forwarded-for']) {
    ip = req.connection.remoteAddress;
  } else if (req.headers['x-forwarded-for']) {
    ip = req.connection.socket.remoteAddress
  }
  res.json({
    result: true,
    message: 'success',
    data: {
      IPAdress: ip
    }
  });
});




// Function Area
var getAllEvents = function (req, res) {
  // var ip;
  // if (req.headers['x-forwarded-for']) {
  //   ip = req.headers['x-forwarded-for'].split(',').pop();
  // } else if (req.headers['x-forwarded-for']) {
  //   ip = req.connection.remoteAddress;
  // } else if (req.headers['x-forwarded-for']) {
  //   ip = req.connection.socket.remoteAddress
  // }
         
  // console.log(req);
  EventModel.find({isActive: true},function(err, events){
		if(err){
			res.status(500).send(err);
		} else if(events){
			res.json({
        result: true,
        message: 'success',
        data: events
      });
		}
		else{
			res.json({
        result: false,
        message: 'Lấy danh sách sự kiện thất bại, vui lòng thử lại sau',
        data: {}
      });
		}
	});
}

var getEventByID = function (req, res) {
  EventModel.findById(req.params._id,function(err,event){
		if(err){
			res.status(500).send(err);
		} else if(event){
      res.json({
        result: true,
        message: 'success',
        data: event
      });
		}
		else{
			res.json({
        result: false,
        message: 'Lấy sự kiện thất bại, vui lòng thử lại sau',
        data: {}
      });
		}
	});
}

var addNewEvent = function (req, res) {
  var jsonString = '';
  req.on('data', function (data) {
      jsonString += data;
  });
  req.on('end', function () {
    var event = JSON.parse(jsonString)
    var eventmodel = new EventModel(event);
    eventmodel.save(function(err){
      if(err){
        res.json({
          result: false,
          message: 'Thêm sự kiện thất bại, vui lòng thử lại sau',
          data: {}
        });
      } else {
        res.json({
          result: true,
          message: 'success',
          data: event
        });
      }
    });
  });
}

var editEventByID = function (req, res) {
  var jsonString = '';
  req.on('data', function (data) {
      jsonString += data;
  });
  req.on('end', function () {
    var eventNew = JSON.parse(jsonString)
    EventModel.findById(req.params._id,function(err, event){
      if(err){
        res.status(500).send(err);
      } else if(event){
        if(eventNew._id){
          delete eventNew._id;
        }
        for(var p in eventNew){
          event[p] = eventNew[p];
        }
        event.save(function(err){
          if(err){
              res.status(500).send(err);
          }
          else{
            res.json({
              result: true,
              message: 'success',
              data: event
            });
          }
        });
      }
      else{
        res.json({
          result: false,
          message: 'Sửa sự kiện thất bại, vui lòng thử lại sau',
          data: {}
        });
      }
    });
  });
}

var checkCode = function (req, res) {
  var jsonString = '';
  req.on('data', function (data) {
      jsonString += data;
  });
  req.on('end', function () {
    var jsonData = JSON.parse(jsonString)
    var eventID = jsonData.eventID;
    var codeParam = jsonData.code;
    var isValidParam = false;
    EventModel.findById(eventID, function(err,event){
      if(err){
        res.status(500).send(err);
      } else if(event){
        for(var i = 0; i < event.giftArray.length; i++) {
          var gift = event.giftArray[i];
          for(var j = 0; j < gift.codeArray.length; j++) {
            var codeItem = gift.codeArray[j];
            if (codeItem.code === codeParam && !codeItem.isPlayed) {
              isValidParam = true;
              break;
            }
          }
        }
        res.json({
          result: true,
          message: 'success',
          data: { isValid: isValidParam }
        });
      }
      else{
        res.json({
          result: false,
          message: 'Kiểm tra mã, vui lòng thử lại sau',
          data: {}
        });
      }
    });
  });
}

var addCodeInfo = function (req, res) {
  var jsonString = '';
  req.on('data', function (data) {
      jsonString += data;
  });
  req.on('end', function () {
    var jsonData = JSON.parse(jsonString);
    var eventID = jsonData.eventID;
    var codeItemParam = jsonData.codeItem;
    var codeParam = codeItemParam.code;
    var isCatched = false;
    EventModel.findById(eventID, function(err, event){
      if(err){
        res.status(500).send(err);
      } else if(event) {
        for(var i = 0; i < event.giftArray.length; i++) {
          var gift = event.giftArray[i];
          for(var j = 0; j < gift.codeArray.length; j++) {
            var codeItem = gift.codeArray[j];
            if (codeItem.code === codeParam) {
              if (!codeItem.isPlayed) {
                codeItem.name = codeItemParam.name;
                codeItem.phone = codeItemParam.phone;
                codeItem.fb = codeItemParam.fb;
                codeItem.isPlayed = true;
                isCatched = true;
                event.save(function(err){
                  if(err) {
                    res.json(
                      {
                        result: false, 
                        message: 'Lưu kết quả thất bại, xin vui lòng thử lại',  errMsg: err
                      });
                  }
                  else {
                    res.json( 
                      {
                        result: true,
                        message:'success'
                      });
                  }
                });
                break;
              } else {
                isCatched = true;
                res.json(
                  {
                    result: false, 
                    message: 'Mã quay thưởng đã được sử dụng, vui lòng kiểm tra lại hoặc liên hệ với ban tổ chức'
                  });
                break;
              }
            }
          }
        }

        if (!isCatched) {
          res.json(
            {
              result: false, 
              message: 'Mã quay thưởng không hợp lệ, xin vui kiểm tra lại hoặc lòng liên hệ với ban tổ chức'
            });
        }
      }
      else{
        res.json(
          {
            result: false, 
            message: 'Không tìm thấy sự kiện, xin vui lòng liên hệ với ban tổ chức'
          });
      }
    });
  });
}
module.exports = router;