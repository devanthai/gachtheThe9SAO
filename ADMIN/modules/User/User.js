let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
    Username: { type: String, required: true, unique: true },//Tài khoản
    Password: { type: String, required: true, hide: true },//Mật khẩu
    PasswordLevel2: { type: String, default:"", hide: true },//Mật khẩu
    IsLock: { type: Boolean, default: false }, //khóa acc
    RegDate: { type: Date, default: Date.now } //ngày tạo
}, { timestamps: true });
module.exports = mongoose.model('Users', Schema);