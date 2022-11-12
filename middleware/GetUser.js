const User = require("../modules/User/User")
const UserInfo = require("../modules/User/UserInfo")
const Helper = require("../Helpers/Helper")
module.exports = async function (req, res, next) {
    const UserId = req.session.UserId
    if (req.session && UserId) {
        User.findOne({ _id: UserId }).exec((err, user) => {
            if(user && user.IsLock)
            {
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
                return res.render("index", { page: "auth/login", message: Helper.ErrorMessage("Tài khoản bị khóa!") })
            }   
            else if (user ) {
                UserInfo.findOne({ uid: user._id }).exec((err, userInfo) => {
                    if (userInfo) {
                        req.userInfo = userInfo
                        req.user = user
                        return next();
                    }
                    else {
                        req.user = null
                        req.userInfo = null
                        return next();
                    }
                })
            }
            else {
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
                return next();
            }
        })
    }
    else {
        req.user = null
        return next();
    }
}