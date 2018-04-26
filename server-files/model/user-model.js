var mongoose = require('mongoose');
const UserModel = mongoose.Schema({
    username: {
        type: String,
        required : true,
        default: ''
    },
    pass:{
        type: String,
        required : true,
        default: ''
    }
});
module.exports = mongoose.model('User', UserModel);
