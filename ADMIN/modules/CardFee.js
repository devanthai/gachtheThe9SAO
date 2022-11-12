let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
    telco:{ type: String, required: true },
    value:{ type: Number, required: true },
    fees:{ type: Number, required: true },
    penalty:{ type: Number, required: true }
});
module.exports = mongoose.model('CardFee', Schema);