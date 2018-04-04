var mongoose = require('mongoose');
var CodeModel = mongoose.Schema({
    code: {
        type: String,
        required : true
    },
    name: {
        type: String
    },
    phone:{
        type: String
    },
    fb: {
        type: String
    },
    isPlayed: {
        type: Boolean,
        required : true,
        default: false
    }
});
module.exports = CodeModel;
