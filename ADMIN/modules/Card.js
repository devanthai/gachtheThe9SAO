let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
    telco: { type: String, required: true },
    value: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    code: { type: String, required: true },
    serial: { type: String, required: true },
    fees: { type: Number, required: true },
    penalty: { type: Number, default: null },
    uid: { type: String, required: true },
    trans_id: { type: String, required: true },
    status: { type: Number, required: true },
    request_id: { type: String, required: true },
    declared_value: { type: Number, required: true },
    message: { type: String, required: true },
    isApi: { type: Boolean, default: false },
    time: { type: Date, default: Date.now }
});
Schema.index({ code: "text", serial: "text", request_id: "text" })
module.exports = mongoose.model('Card', Schema);