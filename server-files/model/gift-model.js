var mongoose = require('mongoose');
var CodeModel = require('./code-model');
var GiftModel = mongoose.Schema({
    id: {
        type: Number,
        required : true
    },
    name: {
        type: String,
        required : true
    },
    numberOfReward:{
        type: Number  
    },
    playedCounter:{
        type: Number,
        default: 0
    },
    isLimited:{
        type: Boolean,
        default: false  
    },
    codeArray: {
        type: [CodeModel]
    }
});

module.exports = GiftModel;