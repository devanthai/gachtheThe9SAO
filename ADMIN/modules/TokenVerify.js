let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },    
});
module.exports = mongoose.model('TokenVerify', Schema);