const Admin = require("../modules/User/Admin")
module.exports = async function (req, res, next) {
    const AdminId = req.session.UserId
    if (req.session && AdminId) {
        Admin.findOne({ _id: AdminId }).exec((err, admin) => {
            if (admin) {
                req.admin = admin
                return next();
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
                req.admin = null
                return next();
            }
        })
    }
    else {
        req.admin = null
        return next();
    }
}