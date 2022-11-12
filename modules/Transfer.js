let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
    transId: { type: String, required: true, unique: true },   // Mã giao dịch
    amount: { type: Number, required: true },               // Số tiền giao dịch
    from: { type: Object, required: true },                 // người gửi
    to: { type: Object, required: true },                   // người nhận
    status: { type: String, required: true },               // Trạng thái 
    comment: { type: String, required: true },              // Nội dung 
    time: { type: Date, default: Date.now },                // Time 
});
Schema.index({ time: -1 })
module.exports = mongoose.model('Transfer', Schema);