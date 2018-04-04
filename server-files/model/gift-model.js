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
        type: Number,
        required : true
    },
    codeArray: {
        type: [CodeModel]
    }
});

module.exports = GiftModel;