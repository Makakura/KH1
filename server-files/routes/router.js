var express = require('express')
var router = express.Router()
var crypto = require('crypto');
// Import model
var EventModel = require('../model/event-model');
var GiftModel = require('../model/gift-model');
var UserModel = require('../model/user-model');

router.use(function(req, res, next) {

  // // check header or url parameters or post parameters for token
  // var token = req.headers['token'];
  // if (token) {
  //   checkValidToken(token, req, res, next);
  // } else {
  //   res.json({
  //     result: false,
  //     message: 'Invalid token'
  //   });
  // }
  next();
});
// >>>>>>> CLIENT ROUTER

// Get event by id for client
router.get('/getevent/:_id', (req, res) => {
	getEventByIDForClient(req, res);
});

// Check valid Code
router.post('/checkcode', (req, res) =>{
	checkCode(req, res);
});

// Check phone
router.post('/checkphone', (req, res) => {
	checkPhone(req, res);
});

// Add code info
router.put('/addcodeinfo', (req, res) => {
	addCodeInfo(req, res);
});
// >>>>>>> END OF CLIENT ROUTER


// >>>>>>> MANAGEMENT ROUTER
// Get all events
router.get('/events', (req, res) => {
	getAllEvents(req, res);
});

// Get event by id
router.get('/events/:_id', (req, res) => {
	getEventByID(req, res);
});

// Get gift by event id 
router.get('/gifts/:_id', (req, res) => {
	getGiftsByEventID(req, res);
});
// edit event
router.put('/events/:_id', (req, res) => {
	editEventByID(req, res);
});

// Add new event
router.post('/events', (req, res) => {
	addNewEvent(req, res);
});

// createCode
router.put('/createcode', function(req, res){
	createCode(req, res);
});
// >>>>>>> END OF MANAGEMENT ROUTER

// Get result
router.get('/getresult/:_id', function(req, res){
	getResultEvent(req, res);
});

// Get code
router.get('/getcodes/:_params', function(req, res){
	getCodeByGiftAndDate(req, res);
});

// Authorize
router.get('/author/:_token', function(req, res){
	authorize(req, res);
});

// CLIENT HANDLE API
var getEventByIDForClient = function (req, res) {
  if (req.params._id) {
    EventModel.findById(req.params._id,function(err,event){
      if(err|| !event){
        queryErrorHandle(res);
      } else{
        queryReturnData(res, 'success', event);
      }
    });
  } else {
    queryErrorHandle(res);
  }
}

var checkCode = (req, res) => {
  let jsonString = '';
  req.on('data', (data) => {
      jsonString += data;
  });
  req.on('end', () => {
    let jsonData = JSON.parse(jsonString)
    if (jsonData.eventID && jsonData.code) {
      let eventIDParam = jsonData.eventID;
      let codeParam = jsonData.code.toUpperCase();
      EventModel.findById(eventIDParam, (err, event) => {
        if (err || !event) {
          queryErrorHandle(res);
        } else {
          if (event.status === "Running") {
            findCodeAndCheckValid(req, res, eventIDParam, codeParam);
          } else {
            let messageParam = 'Sự kiện chưa bắt đầu, liên hệ với ban tổ chức để biết thêm chi tiết';
            queryErrorSpecialHandle(res, messageParam);
          }
        }
      });
    } else {
      queryErrorHandle(res);
    }
  });
}

var findCodeAndCheckValid = (req, res, eventIDParam, codeParam) => {
  let dataParam = { isValid: false, number: -1, giftName: 'giftName'};
  let messageParam = 'Mã không hợp lệ, xin vui lòng kiểm tra lại';
  let query = [
    { $match: { eventID: eventIDParam}},
    { $unwind: "$codeArray"}, 
    { $match : {"codeArray.code": codeParam}},
    { $project : {_id: 0, status: 1, playedCounter: 1, numberOfReward: 1, id: 1, name: 1, codeItem : "$codeArray"}}
  ];
  
  GiftModel.aggregate(query, (err, arr) => {
    if(err) {
      queryErrorHandle(res);
    } else if(arr[0]){
      let curCodeItem = arr[0].codeItem;
      if (!curCodeItem.isPlayed && !curCodeItem.name && !curCodeItem.phone) {
        if (arr[0].numberOfReward > arr[0].playedCounter) {
          dataParam.isValid = true;
          dataParam.number = arr[0].id;
          dataParam.giftName = arr[0].name;
          messageParam = 'success'
        } else {
          dataParam.isValid = false;
          messageParam = 'Quà của sự kiện đã được phát hết, hẹn quý khách đợt sau <3'
        }
      } else {
        dataParam.isValid = false;
        messageParam = 'Mã không hợp lệ';
      }
    }
    else {
      messageParam = 'Mã không hợp lệ';
      dataParam = {isValid: false}
    }
    queryReturnData(res, messageParam, dataParam);
  }); 
} 

var checkPhone = (req, res) => {
  var jsonString = '';
  req.on('data', (data) => {
      jsonString += data;
  });
  req.on('end', () => {
    var jsonData = JSON.parse(jsonString)
    if (jsonData.eventID && jsonData.phone){
      var eventIDParam = jsonData.eventID;
      var phoneParam = jsonData.phone;
      let query = [
        { $match: { eventID: eventIDParam}},
        { $unwind: "$codeArray"}, 
        { $match : {"codeArray.phone": phoneParam}},
        { $project : {_id: 0, codeItem : "$codeArray"}}
      ];
      
      GiftModel.aggregate(query, (err, arr) => {
        if(err) {
          queryErrorHandle(res);
        } else if(arr[0]){
          messageParam = 'success';
          dataParam = {isValid: false}
          queryReturnData(res, messageParam, dataParam);
        }
        else {
          EventModel.findById(eventIDParam, (err, event) => {
            if (err || !event) {
              messageParam = 'success';
              dataParam = {isValid: false}
            } else {
              messageParam = 'success';
              dataParam = {isValid: true}
            }
            queryReturnData(res, messageParam, dataParam);
          });
        }
      }); 
    } else {
      queryErrorHandle(res);
    }
  });
}


var addCodeInfo = (req, res) => {
  var jsonString = '';
  req.on('data', (data) => {
      jsonString += data;
  });
  req.on('end', () => {
    var jsonData = JSON.parse(jsonString);
    if (jsonData.eventID && jsonData.giftID && jsonData.codeItem) {
      var eventIDParam = jsonData.eventID;
      var giftIDParam = jsonData.giftID;
      var codeItemParam = jsonData.codeItem;
      var codeParam = codeItemParam.code;

      GiftModel.findOneAndUpdate({
        eventID: eventIDParam,
        id: giftIDParam,
        codeArray: {
          $elemMatch: {
            code: codeParam
          }
        }
      }, {
        $set: {
          'codeArray.$.isPlayed': true,
          'codeArray.$.name': codeItemParam.name,
          'codeArray.$.phone': codeItemParam.phone,
          'codeArray.$.playedDate': codeItemParam.playedDate,
          'codeArray.$.clientPlayedDate': codeItemParam.clientPlayedDate,
        },
        $inc: { playedCounter: 1 } 
      },
      (err, item) => {
        if (err || !item) {
          queryErrorHandle(res);
        } else {
          queryReturnData(res,'success');
        }
      });
    } else {
      queryErrorHandle(res);
    }
  });
}
// END OF CLIENT HANDLE API

// MANAGEMENT API HANDLE
var getAllEvents = (req, res) => {
  EventModel.find({isDeleted: false}, (err, events) =>{
    if(err || !events){
      queryErrorHandle(res);
    } else {
      queryReturnData(res, 'success', events);
    }
  });
}

var getEventByID = (req, res) => {
  if (req.params._id) {
    EventModel.findById(req.params._id, (err,event) => {
      if(err|| !event){
        queryErrorHandle(res);
      } else{
        queryReturnData(res, 'success', event);
      }
    });
  } else {
    queryErrorHandle(res);
  }
}

var getGiftsByEventID = (req, res) => {
  if (req.params._id) {
    GiftModel.find({eventID: req.params._id}, {codeArray: 0, _id: 0}, (err,event) => {
      if(err|| !event){
        queryErrorHandle(res);
      } else{
        queryReturnData(res, 'success', event);
      }
    });
  } else {
    queryErrorHandle(res);
  }
}

var editEventByID = (req, res) => {
  var jsonString = '';
  req.on('data', (data) => {
      jsonString += data;
  });
  req.on('end', () => {
    if (jsonString) {
      var eventNew = JSON.parse(jsonString)
      EventModel.findById(req.params._id, (err, event) => {
        if(err || !event){
          queryErrorHandle(res);
        } else {
          if(eventNew._id){
            delete eventNew._id;
          }
          for(var p in eventNew){
            event[p] = eventNew[p];
          }
          event.save((err) => {
            if(err) {
              queryErrorHandle(res);
            }
            else {
              queryReturnData(res, 'success', event);
            }
          });
        }
      });
    } else {
      queryErrorHandle(res);
    }
    
  });
}

var addNewEvent = (req, res) => {
  var jsonString = '';
  req.on('data', (data) => {
      jsonString += data;
  });
  req.on('end', () => {
    if (jsonString) {
      var event = JSON.parse(jsonString)
      var eventmodel = new EventModel(event);
      eventmodel.save((err, savedEvent) => {
        if(err){
          queryErrorHandle(res);
        } else {
          queryReturnData(res, 'success', savedEvent);
        }
      });
    } 
  });
}

var createCode =  (req, res) => {
  var jsonString = '';
  req.on('data', (data) => {
      jsonString += data;
  });
  req.on('end', () => {
    var jsonData = JSON.parse(jsonString);
    if (!jsonData.eventID 
      || jsonData.giftArray) {

        var eventIDParam = jsonData.eventID;
        var giftParam = jsonData.gift;
        var dateParam = jsonData.createDate;
        var clientCreatedDateParam = jsonData.clientCreatedDate;
        var arrayCodeCreated = [];

        GiftModel.find({eventID: eventIDParam, id: giftParam.id}, (err, gift) =>{
          if(err || !gift){
            queryErrorHandle(res);
          } else {
            for(var i = 0; i < event.giftArray.length; i++) {
              var gift = event.giftArray[i];
              for(var j = 0; j < giftArrayParam.length; j++) {
                var giftParam = giftArrayParam[j];
                if (gift.id === giftParam.id) {
                  generateCodeForGift(giftParam.numberOfCode, gift, dateParam, clientCreatedDateParam, arrayCodeCreated);
                }
              }
            }

            gift.save((err) => {
              if(err) {
                queryErrorHandle(res);
              } else {
                queryReturnData(res, 'success', arrayCodeCreated);
              }
            });
          }
        });
    }
  });
}
// END OF MANAGEMENT API HANDLE

// PROCESSOR FUNCTION
var checkIsClientReq = (reqURL) => {
  if (reqURL.indexOf('/getevent') != -1 
  || reqURL.indexOf('/checkcode') != -1
  || reqURL.indexOf('/checkphone') != -1
  || reqURL.indexOf('/addcodeinfo') != -1
  || reqURL.indexOf('/author') != -1) {
    return true;
  } else {
    return false;
  }
}

var MD5 = (str) => {
  return  crypto.createHash('md5').update(str).digest('hex');
}

var generateCodeForGift =  (numberOfCode, gift, dateParam, clientCreatedDateParam, arrayCodeCreated) => {
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

var generateACode = (length, event) => {
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

var checkCodeIsExistInEvent = (code, event) => {
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

var queryErrorHandle = (res) => {
  res.json({
    result: false,
    message: 'Đã có lỗi xảy ra xin vui lòng kiểm tra lại',
  });
}

var queryErrorSpecialHandle = (res, messageParam) => {
  res.json({
    result: false,
    message: messageParam
  });
}

var queryReturnData = (res, messageParam, dataParam) => {
  res.json({
    result: true,
    message: messageParam,
    data: dataParam
  });
}

// END OF PROCESSOR FUNCTION

// AUTHOR HANDLE 
var checkValidToken = (paramToken, req, res, next) => {
  // Check for client
  if(checkIsClientReq(req.url)) {
      if (paramToken === '6ad14ba9986e3615423dfca256d04e3f') {
        next();
      } else {
        res.json({
          result: false,
          message: 'Invalid token'
        });
      }
  } else {
    // Check for manager
    let isValid = false;
    UserModel.find({}, (err, users) => {
      for(let i = 0; i < users.length; i++ ) {
        let user = users[i];
        let token = MD5(user.username + user.pass);
        if (token === paramToken) {
          isValid = true;
          break;
        }
      }
      if (isValid) {
        next();
      } else {
        queryErrorHandle(res);
      }
    });
  }
}

var authorize = (req, res) => {
  let paramToken = req.params._token;
  UserModel.find({}, (err, users) => {
    if (err || !users) {
      queryErrorHandle(res);
    } else {
      let isValid = false;
      for(let i = 0; i < users.length; i++ ) {
        let user = users[i];
        let token = MD5(user.username + user.pass);
        if (token === paramToken) {
          isValid = true;
          break;
        }
      }
      if (isValid) {
        queryReturnData(res, 'success', {token: paramToken});
      } else {
        queryErrorHandle(res);
      }
    }
    
  });
}
// END OF AUTHOR HANDLE 

// REPORT HANDLE 
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
// END OF REPORT HANDLE 
module.exports = router;


// // Get IP
// router.get('/ip', function(req, res){
// 	var ip;
//   if (req.headers['x-forwarded-for']) {
//     ip = req.headers['x-forwarded-for'].split(',').pop();
//   } else if (req.headers['x-forwarded-for']) {
//     ip = req.connection.remoteAddress;
//   } else if (req.headers['x-forwarded-for']) {
//     ip = req.connection.socket.remoteAddress
//   }
//   res.json({
//     result: true,
//     message: 'success',
//     data: {
//       IPAdress: ip
//     }
//   });
// });