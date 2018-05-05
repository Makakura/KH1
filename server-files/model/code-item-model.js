var mongoose = require('mongoose');
var CodeItemModel = mongoose.Schema({
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
    fb: {
        type: String,
        default: ''
    },
    isPlayed: {
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date
    },
    playedDate: {
        type: Date
    },
    clientPlayedDate: {
        type: String,
        default: ''
    },
    clientCreatedDate: {
        type: String,
        default: ''
    },
    giftName: {
        type: String,
        default: ''
    }
});
module.exports = CodeItemModel;
