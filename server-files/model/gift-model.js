var mongoose = require('mongoose');
var CodeItemModel = require('./code-item-model');
var GiftModel = mongoose.Schema({
    eventID: {
        type: String,
        required : true
    },
    id: {
        type: Number,
        required : true
    },
    name: {
        type: String,
        required : true
    },
    numberOfReward:{
        type: Number,
        default: 0
    },
    playedCounter:{
        type: Number,
        default: 0
    },
    codeArray: {
        type: [CodeItemModel]
    }
});

module.exports  = mongoose.model('Gift', GiftModel);