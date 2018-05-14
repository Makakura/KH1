var mongoose = require('mongoose');
var ResultModel = require('./result-model');
const RecentModel = mongoose.Schema({
    eventID: {
        type: String,
        default: ''
    },
    resultArr: {
        type: [ResultModel]
    }
});
module.exports = mongoose.model('Recent', RecentModel);
