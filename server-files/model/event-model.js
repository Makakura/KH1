var mongoose = require('mongoose');
const EventModel = mongoose.Schema({
    name: {
        type: String,
        required : true
    },
    nameOfCompany:{
        type: String
    },
    status: {
        type: String, // Prepare, Running, Pause, Done 
        required : true,
        default: 'Preparing'
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    linkImageWheel: {
        type: String,
        required : true
    },
    linkPostFB: {
        type: String,
        required : true
    },
    linkToPrivacy: {
        type: String,
    },
    dateCreate: {
        type: Date,
    }
});
module.exports = mongoose.model('Event', EventModel);
