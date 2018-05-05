var mongoose = require('mongoose');
var CodeItemModel = require('./code-item-model');
var CodeModel = mongoose.Schema({
    eventID: {
        type: String,
        required : true
    },
    giftID: {
        type: Number,
        required : true
    },
    playedCounter: {
        type: Number,
        default : 0
    },
    giftName: {
        type: String,
        default : ''
    },
    numberOfReward: {
        type: Number,
        default : 0
    },
    codeArray: {
        type: [CodeItemModel]
    }
});

module.exports  = mongoose.model('Code', CodeModel);