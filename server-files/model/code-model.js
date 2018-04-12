var mongoose = require('mongoose');
var CodeModel = mongoose.Schema({
    code: {
        type: String
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
    },
    playedDate: {
        type: Date,
    }
});
module.exports = CodeModel;
