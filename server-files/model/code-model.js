var mongoose = require('mongoose');
var CodeModel = mongoose.Schema({
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
        type: Date,
        default: new Date()
    },
    playedDate: {
        type: Date,
        default: new Date()
    }
});
module.exports = CodeModel;
