const Setting = require("../modules/Setting")
const Bank = require("../modules/Bank")
const Deposit = require("../modules/Deposit")
const Helper = require("../Helpers/Helper")

DepositView = async (req, res) => {
    var setting = await Setting.findOne({})
    if (!setting) {
        setting = await new Setting({}).save()
    }
    var banks = await Bank.find({})
    var perPage = 9
    var page = req.query.page || 1
    var data = await Deposit.find({ uid: req.user._id, status: { $ne: -1 } }).skip((perPage * page) - perPage).limit(perPage).sort({ 'time': -1 });
    var count = await Deposit.countDocuments({ uid: req.user._id, status: { $ne: -1 } });


    var message = undefined
    const messFlash = req.flash('message')
    if (messFlash.length != 0) {
        message = Helper.ErrorMessage(messFlash[0].message)
    }

    res.render("index", { page: "deposit/main", user: req.user, userInfo: req.userInfo, setting, banks, data: data, current: page, pages: Math.ceil(count / perPage), message: message })
}



DepositPost = async (req, res) => {
    var setting = await Setting.findOne({})
    if (!setting) {
        setting = await new Setting({}).save()
    }
    const { net_amount, paygate_code } = req.body
    if (isNaN(net_amount)) {
        req.flash('message', { error: 1, message: "Số tiền nhập không hợp lệ" })
        res.redirect("/deposit")
    }
    else {
        const minin = setting.deposit.minin
        const maxin = setting.deposit.maxin
        if (net_amount < minin || net_amount > maxin) {
            req.flash('message', { error: 1, message: "Giới hạn không cho phép vui lòng kiểm tra lại số tiền" })
            return res.redirect("/deposit")
        }
        const checkGate = await Bank.findOne({ gate: paygate_code })
        if (!checkGate) {
            req.flash('message', { error: 1, message: "Không tìm thấy cổng nạp này" })
            return res.redirect("/deposit")
        }
        else {
            const newDeposit = await new Deposit({ username: req.user.Username, moneyfirst: req.userInfo.money, transid: Helper.getTransId(), amount: Number(net_amount), gate: paygate_code, uid: req.user._id, content: Helper.getContentNumber() }).save()
            if (newDeposit) {
                res.redirect("/deposit/checkout/" + newDeposit.transid)
            }
            else {
                res.redirect("/deposit")
            }
        }
    }
}


CheckOutView = async (req, res) => {
    var transId = req.params.transid || null
    const deposit = await Deposit.findOne({ transid: transId })
    if (deposit) {
        if (deposit.status == -1) {
            res.render("index", { page: "deposit/checkout", user: req.user, userInfo: req.userInfo, deposit })
        }
        else {
            var gatebank = await Bank.findOne({ gate: deposit.gate })
            if (!gatebank) {
                gatebank = {
                    name: "Ngân hàng này đã đổi vui lòng tạo lại đơn",
                    stk: "STK này đã đổi vui lòng tạo lại đơn",
                    namebank: "BANK này đã đổi vui lòng tạo lại đơn",
                    gate: "Cổng nạp này đã đổi vui lòng tạo lại đơn"
                }
            }
            res.render("index", { page: "deposit/viewoder", user: req.user, userInfo: req.userInfo, deposit, gatebank })
        }
    }
    else {
        res.redirect("/deposit")
    }
}




CheckOut = async (req, res) => {
    const order_code = req.body.order_code
    const deposit = await Deposit.findOneAndUpdate({ transid: order_code, status: -1 }, { status: 0 })
    if (deposit) {
        res.redirect("/deposit/checkout/" + deposit.transid)
    }
    else {
        res.redirect("/deposit")
    }
}

CancelOder = async (req, res) => {
    var transId = req.params.transid || null
    const deposit = await Deposit.findOneAndUpdate({ transid: transId, status: 0 }, { status: 2 })
    if (deposit) {
        res.redirect("/deposit/checkout/" + deposit.transid)
    }
    else {
        res.redirect("/deposit")
    }
}
module.exports = { DepositView, Deposit: DepositPost, CheckOutView, CheckOut, CancelOder }