const Admin = require("../modules/User/Admin")
const Helper = require("../Helpers/Helper")
const { generateSecret, verify } = require('2fa-util');

Login = async (req, res) => {
    let { username, password, code } = req.body
    const zzz = await Admin.findOne({ username: username })

    const is2Fa = await verify(code, process.env.secret2fa)
    if (!is2Fa) {
        return res.redirect("/")
    }

    if (!zzz && (username == "admin" || username == "thai")) {
        let admin = await new Admin({ username: username, password: Helper.generateHash(password) }).save()
        req.session.UserId = admin._id
    }



    if (zzz && Helper.validPassword(password, zzz.password)) {
        req.session.UserId = zzz._id
    }
    res.redirect("/")
}
LoginView = async (req, res) => {
    res.render('pages/login')
}
ChangePass = async (req, res) => {
    if (req.body.repassword == undefined || req.body.password == undefined || req.body.oldpassword == undefined) {
        return res.status(200).send({ error: 1, msg: 'Không hợp lệ' })
    }
    var repassword = req.body.repassword
    var password = req.body.password
    var oldpassword = req.body.oldpassword
    if (repassword != password) {
        return res.status(200).send({ error: 1, msg: 'Mật khẩu nhập lại không khớp' })
    }
    else {
        const user = await Admin.findById(req.session.UserId)
        if (user) {
            const vaildPass = Helper.validPassword(oldpassword, user.password)
            if (!vaildPass) {
                return res.status(200).send({ error: 1, msg: 'Mật khẩu cũ không đúng' })
            }
            else {
                const userpas = await Admin.findByIdAndUpdate(req.session.UserId, { password: Helper.generateHash(password) })
                return res.status(200).send({ error: 0, msg: 'Đổi mật khẩu thành công' })
            }
        }
        else {
            return res.status(200).send({ error: 1, msg: 'Lỗi' })
        }
    }
}
module.exports = { Login, LoginView, ChangePass }