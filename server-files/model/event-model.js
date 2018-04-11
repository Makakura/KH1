var mongoose = require('mongoose');
var GiftModel = require('./gift-model');
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
        default: 1
    },
    isDeleted:{
        type: Boolean,
        required : true,
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
        required : true
    },
    dateCreate: {
        type: Date,
        required : true
    },
    giftArray: {
        type: [GiftModel],
        required : true
    }
});
module.exports = mongoose.model('Event', EventModel);
