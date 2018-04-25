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

// Get event by id for client
router.get('/getevent/:_id', function(req, res){
	getEventByIDForClient(req, res);
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

// Get result
router.get('/getresult/:_id', function(req, res){
	getResultEvent(req, res);
});

// Get code
router.get('/getcodes/:_params', function(req, res){
	getCodeByGiftAndDate(req, res);
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

// Get IP
router.put('/createcode', function(req, res){
	createCode(req, res);
});

// Get code
router.get('/getcode', function(req, res){
	res.json({
    code: [
      '0BNVBLQL',
      '0BNVBLQL',
      '0BNVBLQL',
      '0BNVBLQL',
      '0BNVBLQL',
      '0BNVBLQX'
    ]
  });
});

// Get code
router.get('/getphone', function(req, res){
	res.json({
    code: [
      '123456789',
      '123456789',
      '123456789',
      '123456789',
      '123456789',
      '123456780'
    ]
  });
});

// Get code
router.get('/name', function(req, res){
	res.json({
    code: [
      'Nguyen Van A',
      'Nguyen Van A',
      'Nguyen Van A',
      'Nguyen Van A',
      'Nguyen Van A',
      'Nguyen Van B'
    ]
  });
});

// Get code
router.post('/checkphone', function(req, res){
	checkPhone(req, res);
});


// Function Area
var getAllEvents = function (req, res) {
  EventModel.find({isDeleted: false},function(err, events){
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

var getEventByIDForClient = function (req, res) {
  EventModel.findById(req.params._id,function(err,event){
		if(err){
			res.status(500).send(err);
		} else if(event){
      event.giftArray.forEach(gift => {
        gift.codeArray = [];
      });
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
    eventmodel.save(function(err, savedEvent){
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
          data: savedEvent
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
    editEvent(req, res, eventNew);
  });
}

var editEvent = function(req, res, eventNew){
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
      saveThisEvent(res, event, true);
    }
    else{
      res.json({
        result: false,
        message: 'Sửa sự kiện thất bại, vui lòng thử lại sau',
        data: {}
      });
    }
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
    var number = -1;
    var giftName = '';
    var messageParam = 'Mã không hợp lệ, xin vui lòng kiểm tra lại'
    EventModel.findById(eventID, function(err,event){
      if(err){
        res.status(500).send(err);
      } else if(event){
        if (event.status === 'Running') {
          for(var i = 0; i < event.giftArray.length; i++) {
            var gift = event.giftArray[i];
            for(var j = 0; j < gift.codeArray.length; j++) {
              var codeItem = gift.codeArray[j];
              if (codeItem.code === codeParam && !codeItem.isPlayed && !codeItem.name && !codeItem.phone) {
                if (gift.numberOfReward > gift.playedCounter) {
                  isValidParam = true;
                  number = gift.id;
                  giftName = gift.name;
                  messageParam = 'success'
                  break;
                } else {
                  isValidParam = false;
                  messageParam = 'Quà của sự kiện đã được phát hết, hẹn quý khách đợt sau <3'
                }
              }
            }
          }
          res.json({
            result: true,
            message: messageParam,
            data: { isValid: isValidParam, number: number, giftName: giftName}
          });
        } else {
          res.json({
            result: false,
            message: 'Sự kiện chưa bắt đầu, liên hệ với ban tổ chức để biết thêm chi tiết'
          });
        }
        
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
              if (!codeItem.isPlayed) { // Code chưa được sử dụng
                codeItem.name = codeItemParam.name;
                codeItem.phone = codeItemParam.phone;
                codeItem.isPlayed = true;
                codeItem.playedDate = codeItemParam.playedDate;
                codeItem.clientPlayedDate = codeItemParam.clientPlayedDate;
                isCatched = true;
                gift.playedCounter++;
                saveThisEvent(res, event, false);
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

var createCode = function (req, res) {
  var jsonString = '';
  req.on('data', function (data) {
      jsonString += data;
  });
  req.on('end', function () {
    var jsonData = JSON.parse(jsonString);
    var eventID = jsonData.eventID;
    var giftArrayParam = jsonData.giftArray;
    var dateParam = jsonData.createDate;// 
    var clientCreatedDateParam = jsonData.clientCreatedDate;
    var arrayCodeCreated = [];
    EventModel.findById(eventID, function(err, event){
      if(err){
        res.status(500).send(err);
      } else if(event) {
        for(var i = 0; i < event.giftArray.length; i++) {
          var gift = event.giftArray[i];
          for(var j = 0; j < giftArrayParam.length; j++) {
            var giftParam = giftArrayParam[j];
            if (gift.id === giftParam.id) {
              generateCodeForEvent(giftParam.numberOfCode, giftParam.id, event, dateParam, clientCreatedDateParam, arrayCodeCreated);
            }
          }
        }
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
                message:'success',
                data: arrayCodeCreated
              });
          }
        });
      } else {
        res.json(
          {
            result: false, 
            message: 'Không tìm thấy sự kiện, xin vui lòng liên hệ với ban tổ chức'
          });
      }
    });
  });
}

var checkPhone = function (req, res) {
  var jsonString = '';
  req.on('data', function (data) {
      jsonString += data;
  });
  req.on('end', function () {
    var jsonData = JSON.parse(jsonString)
    var eventID = jsonData.eventID;
    var phoneParam = jsonData.phone;
    EventModel.findById(eventID, function(err,event){
      if(err){
        res.status(500).send(err);
      } else if(event){
        if (checkPhoneIsValidInEvent(phoneParam, event)) {
          res.json({
            result: true,
            message: 'success',
            data: { isValid: true}
          });
        } else {
          res.json({
            result: true,
            message: 'success',
            data: { isValid: false}
          });
        }
      }
      else{
        res.json({
          result: false,
          message: 'Đã xảy ra lỗi, vui lòng liên hệ với chúng tôi',
          data: {}
        });
      }
    });
  });
}

var getResultEvent = function (req, res) {
  EventModel.findById(req.params._id, function(err,event){
  if(err){
    res.status(500).send(err);
  } else if(event){
    let array = [];
    for(var i = 0; i < event.giftArray.length; i++) {
      var gift = event.giftArray[i];
      for(var j = 0; j < gift.codeArray.length; j++) {
        let code = gift.codeArray[j];
        if (code.isPlayed) {
          code.giftName = gift.name;
          array.push(code);
        }
      }
    }
    resultArray = {
      code: [], // 0 code
      name: [], // 1 name
      phone: [], // 2 phone
      giftName: [], // 3 giftName
      playedDate: []  // 4 playedDate
    };
     
    for(var i = 0; i < array.length; i++) {
      let codeItem = array[i];
      resultArray.code.push(codeItem.code);
      resultArray.name.push(codeItem.name);
      resultArray.phone.push(codeItem.phone);
      resultArray.giftName.push(codeItem.giftName);
      resultArray.playedDate.push(codeItem.clientPlayedDate);
    }

    res.json(resultArray);
  }
  else{
    res.json({
      result: false,
      message: 'Không tìm thấy sự kiện',
      data: {}
    });
  }
  });
}

var getCodeByGiftAndDate = function (req, res) {
  let params = req.params._params.split(';'); 
  if (params.length > 0) {
    let eventID;
    let giftID;
    let date;
    if (params[0]) {
      eventID = params[0];
    }
    if (params[1]) {
      giftID = params[1];
    }
    if (params[2]) {
      date = params[2];
    }

    EventModel.findById(eventID, function(err,event){
    if(err){
      res.status(500).send(err);
    } else if(event){
      let array = [];
      for(var i = 0; i < event.giftArray.length; i++) {
        var gift = event.giftArray[i];
        if ((giftID && gift.id === Number(giftID))
            || !giftID) {
            for(var j = 0; j < gift.codeArray.length; j++) {
              let code = gift.codeArray[j];
              if ((JSON.stringify(code.createdDate) === JSON.stringify(date))
                  || !date) {
                code.giftName = gift.name;
                array.push(code);
              }
            }
        }
      }

      resultArray = {
        code: [], // 0 code
        giftName: [], // 1 giftName
        clientCreatedDate: [], // 2 giftName
        isPlayed: [], // 3 giftName
      };
      
      for(var i = 0; i < array.length; i++) {
        let codeItem = array[i];
        resultArray.code.push(codeItem.code);
        resultArray.giftName.push(codeItem.giftName);
        resultArray.clientCreatedDate.push(codeItem.clientCreatedDate);
        resultArray.isPlayed.push(codeItem.isPlayed?'Rồi':'Chưa');
      }
      res.json(resultArray);
    }
    else{
      res.json({
        result: false,
        message: 'Không tìm thấy sự kiện',
        data: {}
      });
    }
    });
  } else {
    res.status(500);
  }
  
}

var generateCodeForEvent = function (numberOfCode, giftID, event, dateParam, clientCreatedDateParam, arrayCodeCreated) {
  for(var i = 0; i < event.giftArray.length; i++) {
    var gift = event.giftArray[i];
    if (gift.id === giftID) {
      for(var z = 0; z < numberOfCode; z++) {
        var code = {
          code: generateACode(8, event),
          name: "",
          phone: "",
          fb: "",
          isPlayed: false,
          createdDate: dateParam,
          clientCreatedDate: clientCreatedDateParam
        };
        arrayCodeCreated.push(code);
        gift.codeArray.push(code);
      }
    }
  }
}

var generateACode = function(length, event) {
  possible  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var text = "";

  for ( var i = 0; i < length; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  if (!checkCodeIsExistInEvent(text, event)) {
    return text;
  } else {
    generateACode(length, event);
  }
}

var saveThisEvent = function(res, event, isReturnData) {
  event.save(function(err){
    if(err) {
      res.json(
        {
          result: false, 
          message: 'Lưu kết quả thất bại, xin vui lòng thử lại',  errMsg: err
        });
    }
    else {
      if (isReturnData) {
        res.json( 
          {
            result: true,
            message:'success',
            data: event
          });
      } else {
        res.json( 
          {
            result: true,
            message:'success'
          });
      }
      
    }
  });
}

var checkCodeIsExistInEvent = function(code, event) {
  for(var i = 0; i < event.giftArray.length; i++) {
    var gift = event.giftArray[i];
    for(var j = 0; j < gift.codeArray.length; j++) {
      var codeItem = gift.codeArray[j];
      if (codeItem.code === code) {
        return true;
      }
    }
  }
  return false;
}

var checkPhoneIsValidInEvent = function(phone, event) {
  for(var i = 0; i < event.giftArray.length; i++) {
    var gift = event.giftArray[i];
    for(var j = 0; j < gift.codeArray.length; j++) {
      var codeItem = gift.codeArray[j];
      if (codeItem.phone === phone) {
        return false;
      }
    }
  }
  return true;
}

module.exports = router;