
const UserBank = require("../modules/User/UserBank")
const UserInfo = require("../modules/User/UserInfo")
const Withdraw = require("../modules/Withdraw")
const Helper = require("../Helpers/Helper")
const Setting = require("../modules/Setting")
const Historys = require("../modules/History")
const redisClient = require("../redisCache")
const BotTelegram = require("../telegram/bot")
const dotenv = require('dotenv');
dotenv.config()


WithDrawView = async (req, res) => {
    var setting = await Setting.findOne({})
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
    var perPage = 9
    var page = req.query.page || 1
    var data = await Withdraw.find({ uid: req.user._id }).skip((perPage * page) - perPage).limit(perPage).sort({ 'time': -1 });
    var count = await Withdraw.countDocuments({ uid: req.user._id });
    res.render("index", { page: "withdraw/main", user: req.user, userInfo: req.userInfo, message, userBanks, setting, data: data, current: page, pages: Math.ceil(count / perPage) })
}

WidthDrawSetAmount = async (uid, amount) => {
    const session = await UserInfo.startSession();
    session.startTransaction();
    try {
        const userinfo = await UserInfo.findOneAndUpdate({ uid: uid }, { $inc: { money: amount } }, { new: true }).session(session)
        if (!userinfo) {
            throw new Error("Không tìm thấy from user");
        }
        else if (userinfo.money < 0) {
            throw new Error('Không đủ tiền để thực hiện: ' + (userinfo.money + amount));
        }
        await session.commitTransaction();
        session.endSession();
        return { error: 0, userinfo };
    } catch (error) {
        await session.abortTransaction()
        session.endSession();
        console.log(error)
        throw error;
    }
}


WithDrawPost = async (req, res) => {

    let { amount, bankinfo_id, secret } = req.body

    if (req.userInfo.isActivePassLevel2 && !Helper.validPassword(secret, req.user.PasswordLevel2)) {
        req.flash('message', { error: 1, message: "Sai mật khẩu cấp 2." })
        return res.redirect("/withdraw")
    }
    else {
        const setting = await Setting.findOne({})
        if (isNaN(amount)) {
            req.flash('message', { error: 1, message: "Số tiền nhập không hợp lệ." })
            return res.redirect("/withdraw")
        }
        else if (amount < setting.withdraw.min || amount > setting.withdraw.max) {
            req.flash('message', { error: 1, message: "Số tiền cho phép từ " + setting.withdraw.min + " đến " + setting.withdraw.max })
            return res.redirect("/withdraw")
        }
        else {
           

            let feeee = 0
             //fee for TheSieure.com
             if (bankinfo_id == "TheSieuRe.com") {
                feeee = 11000;
            }

            const findBank = await UserBank.findOne({ uid: req.user._id, bank: bankinfo_id })
            if (findBank) {
                const userInfo = await UserInfo.findOne({ uid: req.session.UserId })
                if (userInfo) {
                    if (userInfo.money < (Number(amount)+feeee)) {
                        req.flash('message', { error: 1, message: "Không có đủ tiền để rút." })
                        return res.redirect("/withdraw")
                    }
                    else {
                        try {


                            const amountfee = Number(amount)+feeee
                            const setAmount = await WidthDrawSetAmount(userInfo.uid, -amountfee)
                            if (setAmount.error == 0) {

                                req.userInfo.money = setAmount.userinfo.money
                                const newWithDraw = await Withdraw({ transid: Helper.getTranidWithdraw(), amount: amount, bank: findBank, uid: req.user._id, username: req.user.Username, moneyfirst: req.userInfo.money }).save()
                                const history = await Historys({ transid: newWithDraw.transid, amount: -amountfee, firtBalance: userInfo.money, lastBalance: setAmount.userinfo.money, content: "Rút tiền về " + findBank.bankinfo, uid: req.userInfo.uid }).save()

                                try {
                                    BotTelegram.sendMessage(process.env.GROUP_TELEGRAM_ID, "Rút tiền: " + newWithDraw.transid + "\nSố tiền: " + Helper.numberWithCommas(amount) + "\nRút về: " + findBank.bankinfo)

                                } catch { }


                                if (history) //Them vao redis cache
                                {
                                    const keyHistory = "history"
                                    const keyRedisHistory = keyHistory + req.userInfo.uid
                                    const checkHistoryredis = await redisClient.get(keyRedisHistory)
                                    var arrayHistory = JSON.parse(checkHistoryredis)
                                    if (arrayHistory == null) {
                                        arrayHistory = []
                                    }
                                    arrayHistory.unshift(history)
                                    await redisClient.set(keyRedisHistory, JSON.stringify(arrayHistory))
                                }
                                req.flash('message', { error: 0, message: "Tạo đơn rút thành công vui lòng chờ duyệt" })
                                return res.redirect("/withdraw")
                            }
                        } catch (error) {
                            req.flash('message', { error: 1, message: error.message })
                            return res.redirect("/withdraw")
                        }
                    }
                }
                else {
                    return res.redirect("/withdraw")
                }
            }
            else {
                req.flash('message', { error: 1, message: "Không tìm thấy ngân hàng của bạn" })
                return res.redirect("/withdraw")
            }
        }
    }
}
module.exports = { WithDrawView, WithDrawPost }