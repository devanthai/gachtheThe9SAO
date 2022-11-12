const Helper = require("../Helpers/Helper")
const UserBank = require("../modules/User/UserBank")
const validator = require('validator');
const GetBankList = require('./GetBankList')
AddBankView = async (req, res) => {
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
    const userBanks = await UserBank.find({ uid: req.user._id })

    res.render("index", { page: "user/localbank", user: req.user, userInfo: req.userInfo, message, userBanks })
}
AddBankPost = async (req, res) => {
    const listAtm = GetBankList.ListNameBank
    const listAtmz = GetBankList.ListKeyNameBank
    const { code, acc_num, card_num, acc_name, branch } = req.body
    if (!listAtm.includes(code)) {
        req.flash('message', { error: 1, message: "Ngân hàng không hợp lệ." })
        return res.redirect("/user/localbank")
    }
    else if (Helper.isHTML(code) || Helper.isHTML(acc_num) || Helper.isHTML(card_num) || Helper.isHTML(acc_name) || Helper.isHTML(branch)) {
        req.flash('message', { error: 1, message: "Không hợp lệ." })
        return res.redirect("/user/localbank")
    }
    else if (!validator.isLength(acc_num, { min: 5, max: 100 })) {
        req.flash('message', { error: 1, message: "Số tài khoản không hợp lệ." })
        return res.redirect("/user/localbank")
    }
    else if (!validator.isLength(acc_name, { min: 2, max: 100 })) {
        req.flash('message', { error: 1, message: "Chủ tài khoản không hợp lệ." })
        return res.redirect("/user/localbank")
    }
    else {
        const checkcount = await UserBank.countDocuments({ uid: req.user._id })
        if(checkcount>10)
        {
            req.flash('message', { error: 1, message: "Không được thêm quá 10 ngân hàng." })
            return res.redirect("/user/localbank")
        }
        const bankinfo = listAtmz[code]
        const checkStk = await UserBank.findOne({ stk: acc_num })
        if (checkStk) {
            req.flash('message', { error: 1, message: "Tài khoản đã tồn tại." })
            return res.redirect("/user/localbank")
        }
        try {
            const newbank = await new UserBank({ bankinfo: bankinfo, bank: code, uid: req.user._id, stk: acc_num, cardnumber: card_num, name: acc_name, chinhanh: branch }).save()
            req.flash('message', { error: 0, message: "Thêm tài khoản ngân hàng thành công" })
            return res.redirect("/user/localbank")
        } catch (ex) {
            req.flash('message', { error: 1, message: "Thêm tài khoản ngân hàng không thành công" + ex })
            return res.redirect("/user/localbank")
        }
    }
}
DeleteBank = async (req, res) => {
    const iddel = req.params.id
    const dele= await UserBank.findByIdAndDelete(iddel)
    return res.redirect("/user/localbank")
}
module.exports = { AddBankView, AddBankPost, DeleteBank }

