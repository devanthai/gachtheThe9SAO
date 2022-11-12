let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
    ip: { type: String, required: true },
    time: { type: Date, default: Date.now },
    uid: { type: String, required: true },
    userAgent: { type: String, required: true },
});
module.exports = mongoose.model('LoginLog', Schema);