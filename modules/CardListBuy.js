let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
    card: { type: Array, required: true },
    type: { type: String, default: "mobile" },
    id:{ type: Number, required: true },
});
module.exports = mongoose.model('CardListBuy', Schema);