let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
    transid: { type: String, required: true },
    amount: { type: Number, required: true },
    firtBalance: { type: Number, required: true },
    lastBalance: { type: Number, required: true },
    uid: { type: String, required: true },
    tiente: { type: String, default: "VND" },
    content: { type: String, required: true },
    time: { type: Date, default: Date.now }
});
Schema.index({ transid: "text", content: "text" })
module.exports = mongoose.model('History', Schema);