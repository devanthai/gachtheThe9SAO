const Helper = require("../Helpers/Helper")
const validator = require('validator');
const User = require("../modules/User/User")
const LoginLog = require("../modules/LoginLog")
const UserInfo = require("../modules/User/UserInfo")
LoginView = (req, res) => {
    res.render("index", { page: "auth/login", user: req.user, userInfo: req.userInfo })
}
RegisterView = (req, res) => {
    res.render("index", { page: "auth/register", user: req.user, userInfo: req.userInfo })
}
ForgetPassView = (req, res) => {
    res.render("index", { page: "auth/forgetPass", user: req.user, userInfo: req.userInfo })
}
Login = (req, res) => {
    let phoneOrEmail = req.body.phoneOrEmail
    let password = req.body.password
    password = password.toLowerCase()
    phoneOrEmail = phoneOrEmail.toLowerCase()
    var isSDT = Helper.checkPhoneValid(phoneOrEmail)

    if (Helper.isEmpty(phoneOrEmail) || Helper.isEmpty(password)) {
        res.render("index", { page: "auth/login", message: Helper.ErrorMessage("Vui nhập đầy đủ thông tin đăng nhập!") })
    }
    else if (!validator.isLength(phoneOrEmail, { min: 6, max: 50 })) {
        res.render("index", { page: "auth/login", message: Helper.ErrorMessage("Tài khoản chỉ chấp nhận từ 6 kí tự đến 50 kí tự!") })
    }
    else if (!validator.isLength(password, { min: 6, max: 50 })) {
        res.render("index", { page: "auth/login", message: Helper.ErrorMessage("Mật khẩu chỉ chấp nhận từ 6 kí tự đến 50 kí tự!!") })
    }
    else {
        User.findOne({ Username: phoneOrEmail }).exec((err, user) => {
            if (user) {
                const isValidPass = Helper.validPassword(password, user.Password)
                if (!isValidPass || user.IsLock) // sai pass hoac bi khoa
                {
                    res.render("index", { page: "auth/login", message: Helper.ErrorMessage("Thông tin tài khoản không đúng hoặc bị khóa!") })
                }
                else //login ok 
                {
                    req.session.UserId = user._id
                    res.redirect("/")
                    var userAgent = req.get('User-Agent');
                    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
                    const regexExp = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/gi;
                    const isIpv6 = regexExp.test(ip)
                    var ipv4 = ""
                    if (isIpv6) {
                        ipv4 = Helper.getIpv4FromIpv6(ip)
                    }
                    else {
                        ipv4 = ip
                    }
                    LoginLog.create({ ip: ipv4, userAgent: userAgent, uid: user._id })
                }
            }
            else {
                var temp2 = { email: phoneOrEmail }

                if (isSDT) {
                    const Phonecrack = Helper.phoneCrack(phoneOrEmail)
                    if (Phonecrack != null) {
                        phoneOrEmail = Phonecrack.phone
                    }
                    temp2 = { phone: phoneOrEmail }

                }
                UserInfo.findOne(temp2).exec((err, checkEP) => {

                    if (checkEP) {

                        User.findOne({ _id: checkEP.uid }).exec((err, user) => {
                            if (user) {
                                const isValidPass = Helper.validPassword(password, user.Password)
                                if (!isValidPass || user.IsLock) // sai pass hoac bi khoa
                                {
                                    res.render("index", { page: "auth/login", message: Helper.ErrorMessage("Thông tin tài khoản không đúng hoặc bị khóa!") })
                                }
                                else //login ok 
                                {
                                    req.session.UserId = user._id
                                    res.redirect("/")
                                }
                            }
                            else {
                                res.render("index", { page: "auth/login", message: Helper.ErrorMessage("Có lỗi đã xảy ra vui lòng thử lại sau!") })
                            }
                        })
                    }
                    else {
                        res.render("index", { page: "auth/login", message: Helper.ErrorMessage("Thông tin tài khoản không đúng hoặc bị khóa!") })
                    }
                })
            }
        })
    }
}
Register = (req, res) => {
    var { username, name, phoneOrEmail, password } = req.body
    var isSDT = Helper.checkPhoneValid(phoneOrEmail)
    var isEmail = Helper.validateEmail(phoneOrEmail)
    var checkPass = Helper.checkPasswordValidation(password)
    username = username.toLowerCase()
    password = password.toLowerCase()

    var phoneFind = ""
    const phonecrack = Helper.phoneCrack(phoneOrEmail)
    if (isSDT) {
        if (phonecrack != null) {
            phoneFind = phonecrack.phone
        }
    }
    if (Helper.isEmpty(phoneOrEmail) || Helper.isEmpty(password) || Helper.isEmpty(username) || Helper.isEmpty(name)) {
        res.render("index", { page: "auth/register", message: Helper.ErrorMessage("Vui nhập đầy đủ thông tin!") })
    }
    else if (Helper.isHTML(name)) {
        res.render("index", { page: "auth/register", message: Helper.ErrorMessage("Họ và tên không hợp lệ!") })
    }
    else if (!Helper.checkUsernameValid(username)) {
        res.render("index", { page: "auth/register", message: Helper.ErrorMessage("Tài khoản không hợp lệ!") })
    }
    else if (!validator.isLength(phoneOrEmail, { min: 6, max: 50 })) {
        res.render("index", { page: "auth/register", message: Helper.ErrorMessage("Email hoặc số điện thoại chỉ chấp nhận từ 6 kí tự đến 50 kí tự!") })
    }
    else if (!validator.isLength(username, { min: 6, max: 50 })) {
        res.render("index", { page: "auth/register", message: Helper.ErrorMessage("Tài khoản chỉ chấp nhận từ 6 kí tự đến 50 kí tự!") })
    }
    else if (!validator.isLength(name, { min: 1, max: 100 })) {
        res.render("index", { page: "auth/register", message: Helper.ErrorMessage("Tên chỉ chấp nhận từ 1 kí tự đến 100 kí tự!") })
    }
    else if (checkPass != null) {
        res.render("index", { page: "auth/register", message: Helper.ErrorMessage(checkPass) })
    }
    else if (!isSDT && !isEmail) {
        res.render("index", { page: "auth/register", message: Helper.ErrorMessage("Email hoặc số điện thoại không hợp lệ!") })
    }
    else {
        var temp = { Username: username }
        if (isSDT) {
            temp = { $or: [{ Username: username }, { Username: phoneFind }] }
        }
        User.findOne(temp).exec((err, check) => {
            if (check) {
                res.render("index", { page: "auth/register", message: Helper.ErrorMessage("Tài khoản này đã tồn tại!") })
            }
            else {
                var temp2 = { email: phoneOrEmail }
                if (isSDT) {
                    temp2 = { phone: phoneFind }
                }

                var isUsernameSdt = Helper.checkPhoneValid(username)
                if (isUsernameSdt) {
                    var phoneFind2 = username
                    const phonecrackz = Helper.phoneCrack(username)
                    if (isSDT) {
                        if (phonecrackz != null) {
                            phoneFind2 = phonecrackz.phone
                        }
                    }
                    temp2 = { $or: [{ phone: phoneFind }, { phone: phoneFind2 }] }
                }

                UserInfo.findOne(temp2).exec((err, checkEP) => {
                    if (checkEP) {
                        res.render("index", { page: "auth/register", message: Helper.ErrorMessage((isEmail ? "Email" : "Số điện thoại") + " này đã tồn tại trên hệ thống!") })
                    }
                    else {
                        User.create({ Username: username, Password: Helper.generateHash(password) }, (error, user) => {
                            if (user) {
                                var temp = null
                                if (isSDT) {
                                    temp = { uid: user._id, name: name, phone: phoneFind, phoneRegion: phonecrack.region }
                                }
                                else if (isEmail) {
                                    temp = { uid: user._id, name: name, email: phoneOrEmail }
                                }
                                UserInfo.create(temp, (error, userInfo) => {
                                    if (userInfo) {
                                        req.session.UserId = user._id
                                        res.redirect("/")
                                    }
                                })
                            }
                            else {
                                res.render("index", { page: "auth/register", message: Helper.ErrorMessage("Tài khoản này đã tồn tại!") })
                            }
                        })
                    }
                })
            }
        })
    }
}
LogOut = (req, res) => {
    cookie = req.cookies;
    for (var prop in cookie) {
        if (!cookie.hasOwnProperty(prop)) {
            continue;
        }
        res.cookie(prop, '', { expires: new Date(0) });
    }
    req.session = null
    req.user = null
    req.userInfo = null
    res.redirect('/')
}
module.exports = {
    LoginView, RegisterView, Login, Register, ForgetPassView, LogOut
}