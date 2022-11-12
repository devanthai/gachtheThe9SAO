const Helper = require("../Helpers/Helper")
const validator = require('validator');
const Merchant = require("../modules/Merchant")
const md5 = require("md5")
ListView = async (req, res) => {
    const merchant = await Merchant.find({ uid: req.user._id }).sort({ time: -1 })
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
    res.render("index", { page: "pages/merchant", user: req.user, userInfo: req.userInfo, message: message, merchant })
}
AddMerchant = async (req, res) => {
    const { name, wallet_num, callback_type, callback, ips } = req.body
    if (callback_type != "POST" && callback_type != "GET") {
        req.flash("message", { error: 1, message: "Kiểu không hợp lệ" })
        res.redirect("/merchant/list")
    }
    else if (Helper.isEmpty(name) || Helper.isEmpty(callback) || Helper.isEmpty(callback_type)) {
        req.flash("message", { error: 1, message: "Vui lòng nhập đầy đủ thông tin" })
        res.redirect("/merchant/list")
    }
    else if (Helper.isHTML(name) || Helper.isHTML(callback) || Helper.isHTML(ips) || Helper.isHTML(wallet_num)) {
        req.flash("message", { error: 1, message: "Không hợp lệ" })
        res.redirect("/merchant/list")
    }
    else if (!validator.isLength(name, { min: 1, max: 100 })) {
        req.flash("message", { error: 1, message: "Tên chỉ được phép từ 1 đến 100 kí tự" })
        res.redirect("/merchant/list")
    }
    else if (!validator.isLength(callback, { min: 1, max: 500 })) {
        req.flash("message", { error: 1, message: "Không cho phép" })
        res.redirect("/merchant/list")
    }
    else {
        const PartnerID = Helper.getPartnerId()
        const PartnerKey = md5(PartnerID)
        const Username = req.user.Username
        //1 là GET, 2 là POST
        const type = callback_type == "POST" ? 2 : 1
        const zzz = new Merchant({ name: name, PartnerID: PartnerID, PartnerKey: PartnerKey, Username: Username, type: type, ip: ips, urlcallback: callback, uid: req.user._id })
        await zzz.save()
        req.flash("message", { error: 0, message: "Bạn đã thêm API thành công!" })
        res.redirect("/merchant/list")
    }
}

DeleteMerchant = async (req, res) => {
    var id = req.params.id || null
    const zzz = await Merchant.findOneAndDelete({ _id: id, uid: req.user._id })
    req.flash("message", { error: 0, message: "Đã xóa" })
    res.redirect("/merchant/list")
}
module.exports = { ListView, AddMerchant, DeleteMerchant }