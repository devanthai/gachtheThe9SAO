let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
    name: { type: String, required: true },
    PartnerID: { type: String, required: true },
    PartnerKey: { type: String, required: true },
    Username: { type: String, required: true },
    uid: { type: String, required: true },
    type: { type: Number, required: true },
    status: { type: Number, default: -1 },
    ip: { type: String },

    urlcallback: { type: String , required: true},
    time: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Merchant', Schema);