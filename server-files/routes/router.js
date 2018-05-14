var express = require('express')
var router = express.Router()
var crypto = require('crypto');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
// Import model
var EventModel = require('../model/event-model');
var RecentModel = require('../model/recent-model');
var GiftModel = require('../model/gift-model');
var UserModel = require('../model/user-model');

router.use(function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['token'];
  if (token) {
    checkValidToken(token, req, res, next);
  } else {
    queryErrorSpecialHandle(res, 'Thông tin xác thực không hợp lệ');
  }
  //next();
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

router.get('/getrecent/:_id', (req, res) => {
	getTopRecentPlayed(req, res);
});

// Get event by id
router.get('/events/:_id', (req, res) => {
	getEventByID(req, res);
});

// edit event
router.put('/events/:_id', (req, res) => {
	editEventByID(req, res);
});

// Add new event
router.post('/events', (req, res) => {
	addNewEvent(req, res);
});

// Get gift by event id 
router.get('/gifts/:_id', (req, res) => {
	getGiftsByEventID(req, res);
});

// Get code by gift id
router.get('/codes/:_id', (req, res) => {
	getCodesByGiftID(req, res);
});

// Get result by gift id
router.get('/results/:_id', (req, res) => {
	getResultsByGiftID(req, res);
});

// // Add gifts for event
// router.post('/gifts', (req, res) => {
// 	addGiftsForEvent(req, res);
// });

// createCode
router.put('/createcode', function(req, res){
	createCode(req, res);
});

// Get result
router.get('/eventresult/:_id', function(req, res){
	eventResult(req, res);
});

// search result by phone
router.get('/searchbyphone/:_phone', function(req, res){
	searchByPhone(req, res);
});

// release code of event
router.get('/releasecode/:_params', function(req, res){
	releaseCode(req, res);
});

// given result of event
router.get('/givencode/:_params', function(req, res){
	givenCode(req, res);
});

// reset code of event
router.get('/resetcodeevent/:_id', function(req, res){
	resetCodeOfEvent(req, res);
});
// >>>>>>> END OF MANAGEMENT ROUTER

// >>>>>>> EXPORT CODE TO EXCEL 
// Get result
router.get('/getresult/:_params', function(req, res){
	getAllResultEvent(req, res);
});

// Get code
router.get('/getcodes/:_params', function(req, res){
	getCodeByGiftAndDate(req, res);
});
// >>>>>>>>> END OF EXPORT CODE TO EXCEL 

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
    if (jsonData.eventID && jsonData.giftID !== undefined && jsonData.codeItem) {
      var eventIDParam = jsonData.eventID;
      var giftIDParam = jsonData.giftID;
      var codeItemParam = jsonData.codeItem;
      var codeParam = codeItemParam.code;
      var giftNameParam = jsonData.giftName;

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
          'codeArray.$.isUsed': true,
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
          let result = {
            code: codeParam,
            name: codeItemParam.name,
            phone: codeItemParam.phone,
            playedDate: codeItemParam.playedDate,
            clientPlayedDate: codeItemParam.clientPlayedDate,
            giftName: giftNameParam
          }
          addResultForRecent(res, eventIDParam, result);
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

var getTopRecentPlayed = (req, res) => {
  if (req.params._id) {
    RecentModel.findOne({eventID: req.params._id}).exec((err, recent) =>{
      if(err || !recent){
        queryErrorHandle(res);
      } else {
        let results = recent.resultArr;
        queryReturnData(res, 'success', results);
      }
    });
  } else {
    queryErrorHandle(res);
  }
}

var addResultForRecent = (res, eventID, result) => {
  RecentModel.findOne({eventID: eventID}).exec((err, recent) =>{
    if(err || !recent){
      queryReturnData(res, 'success');
    } else {
      let results = recent.resultArr;
      if (results.length >= 50) {
        results.splice(0,1);
      }
      results.push(result);
      recent.save(() => {
        queryReturnData(res, 'success');
      });
    }
  });
}

var getEventByID = (req, res) => {
  if (req.params._id) {
    EventModel.findById(req.params._id, (err, event) => {
    if(err || !event){
        queryErrorHandle(res);
      } else {
        GiftModel.find({eventID: event._id}, {codeArray: 0}, (err, giftArr) => {
          if(err || !giftArr){
            queryErrorHandle(res);
          } else {
            let dataJSON = JSON.parse(JSON.stringify(event));
            dataJSON.giftArray = giftArr;
            queryReturnData(res, 'success', dataJSON);
          }
        });
      }
    });
  } else {
    queryErrorHandle(res);
  }
}

var getCodesByGiftID = (req, res) => {
  if (req.params._id) {
    GiftModel.findById(req.params._id, {codeArray: 1, _id: 1}, (err, gift) => {
      if(err|| !gift){
        queryErrorHandle(res);
      } else{
        queryReturnData(res, 'success', gift.codeArray);
      }
    });
  } else {
    queryErrorHandle(res);
  }
}

var getResultsByGiftID = (req, res) => {
  if (req.params._id) {
    let query = [
      { $match: {_id: ObjectId(req.params._id)}},
      { $unwind: "$codeArray"}, 
      { $match : {"codeArray.isPlayed": true}},
      { $project : {_id: 1, name: 1, id: 1, codeArray: 1}}
    ];
    
    GiftModel.aggregate(query, (err, arr) => {
      if (err || !arr) {
        queryErrorHandle(res);
      } else {
        queryReturnData(res, 'success', arr);
      }
    });
  } else {
    queryErrorHandle(res);
  }
}

var getGiftsByEventID = (req, res) => {
  if (req.params._id) {
    GiftModel.find({eventID: req.params._id}, {codeArray: 0, _id: 1}, (err, giftArr) => {
      if(err|| !giftArr){
        queryErrorHandle(res);
      } else{
        queryReturnData(res, 'success', giftArr);
      }
    });
  } else {
    queryErrorHandle(res);
  }
}

var editEventByID = (req, res) => {
  let jsonString = '';
  req.on('data', (data) => {
      jsonString += data;
  });
  req.on('end', () => {
    if (jsonString) {
      let eventNew = JSON.parse(jsonString);
      let giftArrayParam = [];
      let isNeedToUpdateGift = false;
      let isNeedToSaveEvent = false;

      // Get gift array
      if (eventNew.giftArray && eventNew.giftArray.length > 0) {
        giftArrayParam = JSON.parse(JSON.stringify(eventNew.giftArray));
        delete eventNew.giftArray;
        isNeedToUpdateGift = true;
      }

      // Find and update event
      EventModel.findById(req.params._id, (err, event) => {
        if(err || !event){
          queryErrorHandle(res);
        } else {
          delete eventNew._id;
          // update value for event
          for(var p in eventNew){
            event[p] = eventNew[p];
            isNeedToSaveEvent = true;
          }
          if (isNeedToSaveEvent) {
            event.save((err) => {
              if(err) {
                queryErrorHandle(res);
              } else {
                if (isNeedToUpdateGift) {
                  updateGiftForEvent(res, event, giftArrayParam);
                } else {
                  queryReturnData(res, 'success', event);
                }
              }
            });
          } else {
            updateGiftForEvent(res, event, giftArrayParam);
          }
          
          }
        });
    } else {
      queryErrorHandle(res);
    }
  });
}

var updateGiftForEvent = (res, event, giftArrayParam) => {
  giftArrayParam.forEach((giftItem, index) => {
    GiftModel.findOne({eventID: event._id, id: giftItem.id}, (err, gift) => {
      if(err || !gift){
        queryErrorHandle(res);
      } else {
          delete giftItem.id;
          // update value for gift
          for(var p in giftItem){
            gift[p] = giftItem[p];
          }

          gift.save((err) => {
            if(err) {
              queryErrorHandle(res);
            } else {
              if (index === giftArrayParam.length - 1) {
                queryReturnData(res, 'success', event);
              }
            }
          });
        }
      });
  });
}

var addNewEvent = (req, res) => {
  let jsonString = '';
  req.on('data', (data) => {
      jsonString += data;
  });
  req.on('end', () => {
    if (jsonString) {
      let event = JSON.parse(jsonString)
      if (event && event.giftArray) {
        let giftArray = JSON.parse(JSON.stringify(event.giftArray));
        delete event.giftArray;
        let eventmodel = new EventModel(event);
        eventmodel.save((err, savedEvent) => {
          if(err || !savedEvent){
            queryErrorHandle(res);
          } else {
            addGiftsForEvent(savedEvent._id, giftArray, savedEvent, res);
          }
        });
      }
    } else {
      queryErrorHandle(res);
    }
  });
}

var addGiftsForEvent = (eventID, gifts, savedEvent, res) => {
  let lengthGifts = gifts.length;
  if (eventID && gifts && lengthGifts > 0) {
    for(let i = 0; i < lengthGifts; i++) {
      let curGift = gifts[i];
      curGift.eventID = eventID;
      delete curGift['_id'];
      let gift = new GiftModel(gifts[i]);
      if (gift.id >=0 && gift.id <= 8) {
        gift.save((err) => {
          if (i === lengthGifts - 1 ) {
            let data = {};
            data = JSON.parse(JSON.stringify(savedEvent));
            data['giftArray'] = gifts;
            addRecentForEvent(res, eventID, data);
          }
        });
      }
    }
  } else {
    queryErrorHandle(res);
  }
}

var addRecentForEvent = (res, eventIDParam, data) => {
  recentItem = {
    eventID: eventIDParam,
    resultArr: []
  }
  let recent = new RecentModel(recentItem);
  recent.save((err) => {
    queryReturnData(res, 'success', data);
  });
}

var createCode =  (req, res) => {
  var jsonString = '';
  req.on('data', (data) => {
      jsonString += data;
  });
  req.on('end', () => {
    var jsonData = JSON.parse(jsonString);
    if (jsonData.eventID 
      && jsonData.gift) {
        var giftParam = jsonData.gift;
        var dateParam = jsonData.createDate;
        var clientCreatedDateParam = jsonData.clientCreatedDate;
        var arrayCodeCreated = [];
        GiftModel.findById(giftParam._id, (err, gift) =>{
          if(err || !gift){
            queryErrorHandle(res);
          } else {
            if (giftParam.numberOfCode < 0 ) {
              giftParam.numberOfCode = 0;
            }
            if (giftParam.numberOfCode > 500) {
              giftParam.numberOfCode = 500;
            }

            generateCodeForGift(giftParam.numberOfCode, gift, dateParam, clientCreatedDateParam, arrayCodeCreated);
            gift.save((err) => {
              if(err) {
                queryErrorHandle(res);
              } else {
                queryReturnData(res, 'success', arrayCodeCreated);
              }
            });
          }
        });
    } else {
      queryErrorHandle(res);
    }
  });
}

var eventResult = (req, res) => {
  if (req.params._id) {
    let query = [
      { $match: { eventID: req.params._id}},
      { $unwind: "$codeArray"}, 
      { $match : {"codeArray.isPlayed": true}},
      { $project : {_id: 0, name: 1, id: 1, codeArray: 1}}
    ];
    
    GiftModel.aggregate(query, (err, arr) => {
      if (err || !arr) {
        queryErrorHandle(res);
      } else {
        queryReturnData(res, 'success', arr);
      }
    });
  } else {
    queryErrorHandle(res);
  }
}

var searchByPhone = (req, res) => {
  if (req.params._phone) {
    let query = [
      { $unwind: "$codeArray"}, 
      { $match : {"codeArray.phone": {$regex : ".*" + req.params._phone + ".*"}}},
      { $project : {_id: 1, name: 1, id: 1, codeArray: 1}}
    ];
    
    GiftModel.aggregate(query, (err, arr) => {
      if (err || !arr) {
        queryErrorHandle(res);
      } else {
        queryReturnData(res, 'success', arr);
      }
    });
  } else {
    queryErrorHandle(res);
  }
}

var releaseCode = (req, res) => {
  if (req.params._params) {
    let params = req.params._params.split(';');
    let giftFullID = params[0];
    let codeParam = params[1];
    if (giftFullID && codeParam) {
      GiftModel.findOneAndUpdate({
        _id: ObjectId(giftFullID),
        codeArray: {
          $elemMatch: {
            code: codeParam
          }
        }
      }, {
        $set: {
          'codeArray.$.isUsed': true
        }
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
  } else {
    queryErrorHandle(res);
  }
}

var givenCode = (req, res) => {
  if (req.params._params) {
    let params = req.params._params.split(';');
    let giftFullID = params[0];
    let codeParam = params[1];
    let paramTwo = params[2];
    if (giftFullID && codeParam && paramTwo !== undefined) {
      let isGivenParam = paramTwo === '1' ? true:false; 
      GiftModel.findOneAndUpdate({
        _id: ObjectId(giftFullID),
        codeArray: {
          $elemMatch: {
            code: codeParam
          }
        }
      }, {
        $set: {
          'codeArray.$.isGiven': isGivenParam
        }
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
  } else {
    queryErrorHandle(res);
  }
}

var resetCodeOfEvent = (req, res) => {
  if (req.params._id) {
    GiftModel.update({ eventID: req.params._id}, { codeArray: [], playedCounter: 0 }, { multi: true }, (err, arr) => {
      if (err || !arr) {
        queryErrorHandle(res);
      } else {
        console.log(arr);
        queryReturnData(res, 'success', []);
      }
    });
  } else {
    queryErrorHandle(res);
  }
}
// END OF MANAGEMENT API HANDLE

// PROCESSOR FUNCTION
var checkIsClientReq = (reqURL) => {
  if (reqURL.indexOf('/getevent') != -1 
  || reqURL.indexOf('/checkcode') != -1
  || reqURL.indexOf('/checkphone') != -1
  || reqURL.indexOf('/addcodeinfo') != -1
  || reqURL.indexOf('/getresult') != -1
  || reqURL.indexOf('/getcodes') != -1
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
      code: generateACode(8, gift.eventID),
      name: "",
      phone: "",
      fb: "",
      isUsed: false,
      isGiven: false,
      isPlayed: false,
      createdDate: dateParam,
      clientCreatedDate: clientCreatedDateParam
    };
    gift.codeArray.push(code);
    arrayCodeCreated.push(code);
  }
}

var generateACode = (length, eventID) => {
  possible  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var text = "";

  for ( var i = 0; i < length; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  if (!checkCodeIsExistInEvent(text, eventID)) {
    return text;
  } else {
    generateACode(length, gift);
  }
}

var checkCodeIsExistInEvent = (codeParam, eventID) => {
  GiftModel.findOne({
    eventID: eventID,
    codeArray: {
      $elemMatch: {
        code: codeParam
      }
    }
  }, (err, gift) => {
    if (err || !gift) {
      return false;
    } else {
      return true;
    }
  });
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

var sortByDate = (c, d) => {
  var c = new Date(c.codeArray.playedDate);
  var d = new Date(d.codeArray.playedDate);
  return d.getTime() - c.getTime();
}
// END OF PROCESSOR FUNCTION

// AUTHOR HANDLE 
var checkValidToken = (paramToken, req, res, next) => {
  // Check for client
  if (checkIsClientReq(req.url)
    && paramToken === '6ad14ba9986e3615423dfca256d04e3f') {
      next();
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
        queryErrorSpecialHandle(res, 'Thông tin xác thực không hợp lệ');
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
var getAllResultEvent = (req, res) => {
  let params = req.params._params.split(';'); 
  let resultArray = {
    code: [], // 0 code
    name: [], // 1 name
    phone: [], // 2 phone
    giftName: [], // 3 giftName
    playedDate: [] , // 4 playedDate
    isGiven: []  // 5 isGiven
  };
  let query;
  if (params.length > 0 
    && ((!params[1]) || (params[1] >= 0 && params[1] <= 8)) ) {
    let eventIDParam;
    let giftIDParam;
    if (params[0]) {
      eventIDParam = params[0];
    }
    if (params[1]) {
      giftIDParam = params[1];
    }
    if (eventIDParam && giftIDParam) {
      query = [
        { $match: { eventID: eventIDParam, id: Number(giftIDParam)}},
        { $unwind: "$codeArray"}, 
        { $match : {"codeArray.isPlayed": true}},
        { $project : {_id: 0, name: 1, codeArray: 1}}
      ];
    } else if (eventIDParam) {
      query = [
        { $match: { eventID: eventIDParam}},
        { $unwind: "$codeArray"}, 
        { $match : {"codeArray.isPlayed": true}},
        { $project : {_id: 0, name: 1, codeArray: 1}}
      ];
    }

    if (query) {
      GiftModel.aggregate(query, (err, arr) => {
        if (err || !arr) {
          queryReturnData(res, 'success', resultArray);
        } else {
          arr.sort(sortByDate);
          for(var i = 0; i < arr.length; i++) {
            let codeItem = arr[i];
            resultArray.code.push(codeItem.codeArray.code);
            resultArray.name.push(codeItem.codeArray.name);
            resultArray.phone.push(codeItem.codeArray.phone);
            resultArray.giftName.push(codeItem.name);
            resultArray.playedDate.push(codeItem.codeArray.clientPlayedDate);
            resultArray.isGiven.push(codeItem.codeArray.isGiven? 'Rồi':'Chưa');
          }
          queryReturnData(res, 'success', resultArray);
        }
      });
    } else {
      queryReturnData(res, 'success', resultArray);
    }
  } else {
    queryReturnData(res, 'success', resultArray);
  }
}

var getCodeByGiftAndDate = function (req, res) {
  let params = req.params._params.split(';'); 
  let resultArray = {
    code: [], // 0 code
    giftName: [], // 1 giftName
    clientCreatedDate: [], // 2 giftName
    isPlayed: [], // 3 giftName
  };
  let query;

  if (params.length > 0 
    && ((!params[1]) || (params[1] >= 0 && params[1] <= 8)) ) {
    let eventIDParam;
    let giftIDParam;
    let dateParam;
    if (params[0]) {
      eventIDParam = params[0];
    }
    if (params[1]) {
      giftIDParam = params[1];
    }
    if (params[2]) {
      dateParam = params[2];
    }

    if (eventIDParam && giftIDParam && dateParam) {
      query = [
        { $match: { eventID: eventIDParam, id: Number(giftIDParam)}},
        { $unwind: "$codeArray"}, 
        { $match : {"codeArray.createdDate": new Date(dateParam)}},
        { $project : {_id: 0, name: 1, codeArray: 1}}
      ];
    } else if (eventIDParam && giftIDParam) {
      query = [
        { $match: { eventID: eventIDParam, id: Number(giftIDParam)}},
        { $unwind: "$codeArray"}, 
        { $project : {_id: 0, name: 1, codeArray: 1}}
      ];
    } else if (eventIDParam) {
      query = [
        { $match: { eventID: eventIDParam}},
        { $unwind: "$codeArray"}, 
        { $project : {_id: 0, name: 1, codeArray: 1}}
      ];
    }

    if (query) {
      GiftModel.aggregate(query, (err, arr) => {
        if (err || !arr) {
          queryReturnData(res, 'success', resultArray);
        } else {
          for(var i = 0; i < arr.length; i++) {
            let codeItem = arr[i];
            resultArray.code.push(codeItem.codeArray.code);
            resultArray.giftName.push(codeItem.name);
            resultArray.clientCreatedDate.push(codeItem.codeArray.clientCreatedDate);
            resultArray.isPlayed.push(codeItem.codeArray.isPlayed ? 'Rồi':'Chưa');
          }
          queryReturnData(res, 'success', resultArray);
        }
      });
    } else {
      queryReturnData(res, 'success', resultArray);
    }
  } else {
    queryReturnData(res, 'success', resultArray);
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