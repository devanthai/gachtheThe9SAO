let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
    name: { type: String, required: true },
    stk: { type: String, required: true },
    namebank: { type: String, required: true },
    gate: { type: String, required: true }
});
module.exports = mongoose.model('Bank', Schema);
