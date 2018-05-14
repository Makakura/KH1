var mongoose = require('mongoose');
var ResultModel = mongoose.Schema({
    code: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    phone:{
        type: String,
        default: ''
    },
    playedDate: {
        type: Date
    },
    clientPlayedDate: {
        type: String,
        default: ''
    },
    giftName: {
        type: String,
        default: ''
    }
});
module.exports = ResultModel;
