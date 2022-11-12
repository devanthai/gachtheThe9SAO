const User = require("../modules/User/User")
const LoginLog = require("../modules/LoginLog")
const UserInfo = require("../modules/User/UserInfo")
const Helper = require("../Helpers/Helper")
const validator = require('validator');
ProfileView = async (req, res) => {
    const loginlogs = await LoginLog.find({ uid: req.user._id }).sort({ time: -1 }).limit(5)
    var message = undefined
    const messFlash = req.flash('message')
    if (messFlash.length != 0) {
        if (messFlash[0].error == 1) {
            message = Helper.ErrorMessage(messFlash[0].message)
        }
        else {
            message = Helper.SuccessMessage(messFlash[0].message)
        }
    }
    res.render("index", { page: "account/profile", user: req.user, userInfo: req.userInfo, loginlogs, message })
}
EditProfileView = (req, res) => {
    res.render("index", { page: "account/editprofile", user: req.user, userInfo: req.userInfo })
}
EditProfile = async (req, res) => {
    var { username, name, email, phone, gender, language } = req.body
    const page = "account/editprofile"
    var isSDT = Helper.checkPhoneValid(phone)
    var isEmail = Helper.validateEmail(email)
    if (Helper.isEmpty(email) || Helper.isEmpty(phone) || Helper.isEmpty(name)) {
        req.flash('message', { error: 1, message: "Vui nhập đầy đủ thông tin!" })
        res.redirect("/account/profile")
        // res.render("index", { page, user: req.user, userInfo: req.userInfo, message: Helper.ErrorMessage("Vui nhập đầy đủ thông tin!") })
    }
    else if (Helper.isHTML(name)) {
        req.flash('message', { error: 1, message: "Họ và tên không hợp lệ!" })
        res.redirect("/account/profile")
        // res.render("index", { page, user: req.user, userInfo: req.userInfo, message: Helper.ErrorMessage("Họ và tên không hợp lệ!") })
    }
    else if (!isSDT && req.userInfo.phone == '') {
        req.flash('message', { error: 1, message: "Số điện thoại không hợp lệ!" })
        res.redirect("/account/profile")
        //  res.render("index", { page, user: req.user, userInfo: req.userInfo, message: Helper.ErrorMessage("Số điện thoại không hợp lệ!") })
    }
    else if (!isEmail && req.userInfo.email == '') {
        req.flash('message', { error: 1, message: "Email không hợp lệ!" })
        res.redirect("/account/profile")
        //res.render("index", { page, user: req.user, userInfo: req.userInfo, message: Helper.ErrorMessage("Email không hợp lệ!") })
    }
    else if (!validator.isLength(name, { min: 1, max: 100 })) {
        req.flash('message', { error: 1, message: "Tên yêu cầu từ 1 đến 100 ký tự!" })
        res.redirect("/account/profile")
        //res.render("index", { page, user: req.user, userInfo: req.userInfo, message: Helper.ErrorMessage("Tên yêu cầu từ 1 đến 100 ký tự!") })
    }
    else {
        var user = await UserInfo.findOne({ uid: req.user._id }, 'name email phone')
        if (user) {
            user.name = name
            req.userInfo.name = name
            if (req.userInfo.phone == '') {
                var phoneFind=""
                const crack2 = Helper.phoneCrack(phone)
                if (crack2 != null) {
                    phoneFind = crack2.phone
                }
                const checkPhoneUser = await User.findOne({ Username: phoneFind })
                if (!checkPhoneUser) {
                    const checkPhoneUserInfo = await UserInfo.findOne({ phone: phoneFind })
                    if (!checkPhoneUserInfo) {
                        const crack = Helper.phoneCrack(phone)
                        if (crack != null) {
                            user.phone = crack.phone
                            user.phoneRegion = crack.region
                            req.userInfo.phone = phone
                        }
                    }
                    else {
                        req.flash('message', { error: 1, message: "Số điện thoại này đã tồn tại trong hệ thống!" })
                        return res.redirect("/account/profile")
                    }
                }
                else {
                    req.flash('message', { error: 1, message: "Số điện thoại này đã tồn tại trong hệ thống!" })
                    return res.redirect("/account/profile")
                }
            }
            if (req.userInfo.email == '') {
                const checkEmailUserInfo = await UserInfo.findOne({ email: email })
                if (!checkEmailUserInfo) {
                    if (user.email == '') {
                        user.email = email
                        req.userInfo.email = email
                    }
                }
                else {
                    req.flash('message', { error: 1, message: "Email này đã tồn tại trong hệ thống!" })
                    return res.redirect("/account/profile")
                }
            }
            user.save()
            req.flash('message', { error: 0, message: "Cập nhập thông tin thành công!" })
            res.redirect("/account/profile")
        }
    }
}
ChangePasswordView = (req, res) => {
    res.render("index", { page: "account/change-password", user: req.user, userInfo: req.userInfo })
}
ChangePassword = (req, res) => {
    const page = "account/change-password"
    const oldpwd = req.body['old-pwd']
    const newpwd = req.body['new-pwd']
    const newpwdconfirmation = req.body['new-pwd-confirmation']
    var checkPass = Helper.checkPasswordValidation(newpwd)
    if (checkPass != null) {
        res.render("index", { page, user: req.user, userInfo: req.userInfo, message: Helper.ErrorMessage(checkPass) })
    }
    else if (newpwd == oldpwd) {
        res.render("index", { page, user: req.user, userInfo: req.userInfo, message: Helper.ErrorMessage("Mật khẩu mới không được trùng với mật khẩu hiện tại!") })
    }
    else if (newpwd != newpwdconfirmation) {
        res.render("index", { page, user: req.user, userInfo: req.userInfo, message: Helper.ErrorMessage("Mật khẩu xác nhận không trùng với mật khẩu mới!") })
    }
    else {
        User.findById(req.user._id, (err, user) => {
            if (user) {
                if (!Helper.validPassword(oldpwd, user.Password)) {
                    res.render("index", { page, user: req.user, userInfo: req.userInfo, message: Helper.ErrorMessage("Mật khẩu hiện tại không chính xác!") })
                }
                else {
                    const newPass = Helper.generateHash(newpwd)
                    user.Password = newPass
                    user.save()
                    res.render("index", { page, user: req.user, userInfo: req.userInfo, message: Helper.SuccessMessage("Đổi mật khẩu thành công!") })
                }
            }
            else {
                res.render("index", { page, user: req.user, userInfo: req.userInfo, message: Helper.ErrorMessage("Có lỗi đã xảy ra vui lòng thực hiện lại!") })
            }
        })
    }
}
SecurityView = (req, res) => {
    var message = undefined
    const messFlash = req.flash('message')
    if (messFlash.length != 0) {
        if (messFlash[0].error == 1) {
            message = Helper.ErrorMessage(messFlash[0].message)
        }
        else {
            message = Helper.SuccessMessage(messFlash[0].message)
        }
    }
    res.render("index", { page: "account/security", user: req.user, userInfo: req.userInfo, message })
}



ActiveMkc2View = async (req, res) => {
    const user = await User.findById(req.user._id)
    if (Helper.isEmpty(user.PasswordLevel2)) {
        req.flash('message', { error: 1, message: 'Vui lòng cập nhật mật khẩu cấp 2!' })
        res.redirect("/account/profile/updatemkc2")
    }
    else {
        var message = undefined
        const messFlash = req.flash('message')
        if (messFlash.length != 0) {
            if (messFlash[0].error == 1) {
                message = Helper.ErrorMessage(messFlash[0].message)
            }
            else {
                message = Helper.SuccessMessage(messFlash[0].message)
            }
        }
        res.render("index", { page: "account/activemkc2", user: req.user, userInfo: req.userInfo, message })
    }
}
ActiveMkc2 = async (req, res) => {
    const passc2 = req.body.secret
    const user = await User.findById(req.user._id)
    if (Helper.isEmpty(user.PasswordLevel2)) {
        req.flash('message', { error: 1, message: 'Vui lòng cập nhật mật khẩu cấp 2!' })
        res.redirect("/account/profile/updatemkc2")
    }
    else {
        if (!Helper.validPassword(passc2, user.PasswordLevel2)) {
            req.flash('message', { error: 1, message: 'Mật khẩu cấp 2 không chính xác!' })
            res.redirect("/account/active/Mkc2")
        }
        else {
            const userInfo = await UserInfo.findOne({ uid: req.user._id })
            if (userInfo) {
                userInfo.isActivePassLevel2 = !userInfo.isActivePassLevel2
                userInfo.save()
                req.userInfo.isActivePassLevel2 = userInfo.isActivePassLevel2
                req.flash('message', { error: 0, message: 'Đã ' + (userInfo.isActivePassLevel2 ? "bật" : "tắt") + ' mật khẩu cấp 2!' })
                res.redirect("/account/security")
            }
        }
    }
}
UpdateMkc2View = async (req, res) => {
    const user = await User.findById(req.user._id)
    if (Helper.isEmpty(user.PasswordLevel2)) {
        var message = undefined
        const messFlash = req.flash('message')
        if (messFlash.length != 0) {
            if (messFlash[0].error == 1) {
                message = Helper.ErrorMessage(messFlash[0].message)
            }
            else {
                message = Helper.SuccessMessage(messFlash[0].message)
            }
        }
        res.render("index", { page: "account/updatepasslv2", user: req.user, userInfo: req.userInfo, message })
    } else {
        res.redirect("/account/profile")
    }
}
UpdateMkc2 = async (req, res) => {
    const user = await User.findById(req.user._id)
    if (Helper.isEmpty(user.PasswordLevel2)) {
        const pass = req.body.passwordc2
        var checkPass = Helper.checkPasswordValidation(pass)
        if (checkPass != null) {
            req.flash('message', { error: 1, message: checkPass })
            res.redirect("/account/active/Mkc2")
        }
        else {
            const user = await User.findByIdAndUpdate(req.user._id, { PasswordLevel2: Helper.generateHash(pass) })
            if (user) {
                req.flash('message', { error: 0, message: "Cập nhật mật khẩu cấp 2 thành công!" })
                res.redirect("/account/security")
            }
        }
    } else {
        res.redirect("/account/profile")
    }
}
module.exports = { ProfileView, EditProfileView, EditProfile, ChangePasswordView, ChangePassword, SecurityView, ActiveMkc2, ActiveMkc2View, UpdateMkc2View, UpdateMkc2 }