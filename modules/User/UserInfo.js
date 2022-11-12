let mongoose = require('mongoose');
let Schema = new mongoose.Schema({
    name: { type: String, required: true },
    uid: { type: String, required: true, unique: true, ref: 'Users' }, // UID
    joindate: { type: Date, default: new Date() }, // Ngày tham gia
    email: { type: String, default: '' }, // EMail
    cmnd: { type: String, default: '' }, // CMT
    phone: { type: String, default: '' }, // SDT
    phoneRegion: { type: String, default: '84' }, // SDT
    money: { type: Number, default: 0 },     // Tiền 
    group: { type: Number, default: 0 },     // Nhóm thành viên 
    moneyBlock: { type: Number, default: 0 },     // Tiền tạm dữ
    isActivePhone: { type: Boolean, default: false },     // b xác thực sdt
    isActiveEmail: { type: Boolean, default: false },     // b xác thực email
    isActivePassLevel2: { type: Boolean, default: false }     // b bật tắt mk c2
});
module.exports = mongoose.model('UserInfo', Schema);