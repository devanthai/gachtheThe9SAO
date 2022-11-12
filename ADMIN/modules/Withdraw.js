let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
    moneyfirst:{ type: Number, required: true },
    moneylast:{ type: Number },
    transid: { type: String, required: true },
    amount: { type: Number, required: true },
    bank: { type: Object, required: true },
    status: { type: Number, default: -1 },
    uid: { type: String, required: true },
    username: { type: String, required: true },
    time: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Withdraw', Schema);