let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
    bank: { type: String, required: true },
    bankinfo: { type: String, required: true },
    uid: { type: String, required: true }, // UID
    timeAdd: { type: Date, default: Date.now }, // Ngày thêm
    stk: { type: String, required: true },
    cardnumber: { type: String },
    name: { type: String, required: true },
    chinhanh: { type: String },
    status: { type: String, default: 1 },
});
module.exports = mongoose.model('UserBank', Schema);