let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
    uid: { type: String, required: true },
    transId: { type: String, required: true },
    status: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    time: { type: Date, default: Date.now },
    data: { type: Object, required: true },
});
module.exports = mongoose.model('CardBuy', Schema);