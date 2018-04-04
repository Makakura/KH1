var mongoose = require('mongoose');
var GiftModel = require('./gift-model');
var EventModel = mongoose.Schema({
    name: {
        type: String,
        required : true
    },
    nameOfCompany:{
        type: String
    },
    isDone:{
        type: String,
        required : true,
        default: 'DOING'
    },
    isActive:{
        type: Boolean,
        required : true,
        default: true
    },
    linkImageWheel: {
        type: String,
        required : true
    },
    linkPostFB: {
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
