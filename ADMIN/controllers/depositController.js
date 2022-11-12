const Bank = require("../modules/Bank")
const Setting = require("../modules/Setting")
const Deposit = require("../modules/Deposit")
const Historys = require("../modules/History")
const UserInfo = require("../modules/User/UserInfo")
const redisCache = require('../redisCache')


GateMoneyView = async (req, res) => {
    const banks = await Bank.find({})
    const setting = await Setting.findOne({})
    res.render("index", { page: "pages/deposit/gatemoney", banks, setting })
}
GateMoney = async (req, res) => {
    const { name, stk, bankname, gate } = req.body
    try {
        const bank = await new Bank({ name: name, stk: stk, namebank: bankname, gate: gate }).save()
        res.json({ error: 0, message: "Thêm bank thành công" })
    }
    catch {
        res.json({ error: 1, message: "Thêm bank thất bại" })
    }
}
RemoveBank = async (req, res) => {
    const _id = req.body._id
    try {
        await Bank.findOneAndRemove({ _id: _id })
        res.json({ error: 0, message: "Xóa bank thành công" })
    }
    catch {
        res.json({ error: 1, message: "Xóa bank thất bại" })
    }
}
SaveChanges = async (req, res) => {
    const { hanmucngay, minin, maxin } = req.body
    try {
        await Setting.findOneAndUpdate({}, { "deposit.totalday": Number(hanmucngay), "deposit.minin": Number(minin), "deposit.maxin": Number(maxin) })
        res.json({ error: 0, message: "CHỉnh sửa thành công" })
    } catch {
        res.json({ error: 1, message: "CHỉnh sửa thất bai" })
    }
}
SaveDepositAuto = async (req, res) => {
    const { autoDeposit } = req.body
    try {
        await Setting.findOneAndUpdate({}, { autoDeposit: autoDeposit })
        res.json({ error: 0, message: "CHỉnh sửa thành công" })
    } catch {
        res.json({ error: 1, message: "CHỉnh sửa thất bai" })
    }
}
listDepositView = async (req, res) => {
    const listDeposit = await Deposit.find({}).sort({ time: -1 })
    res.render("index", { page: "pages/deposit/tatca", listDeposit })
}

listDepositViewChuaDuyet = async (req, res) => {
    const listDeposit = await Deposit.find({ status: 0 }).sort({ time: -1 })
    res.render("index", { page: "pages/deposit/chuaduyet", listDeposit })
}
listDepositViewDaDuyet = async (req, res) => {
    const listDeposit = await Deposit.find({ status: 1 }).sort({ time: -1 })
    res.render("index", { page: "pages/deposit/daduyet", listDeposit })
}
setSuccess = async (req, res) => {
    const id = req.body.id
    const deposit = await Deposit.findOne({ _id: id, status: 0 })
    if (deposit) {
        const userUpdate = await UserInfo.findOne({ uid: deposit.uid })
        if (userUpdate) {
            const firtBalancez = userUpdate.money
            userUpdate.money += deposit.amount
            userUpdate.save()
            deposit.status = 1
            deposit.save()

            const history = await Historys({ transid: deposit.transid, amount: Number(deposit.amount), firtBalance: firtBalancez, lastBalance: userUpdate.money, content: "Nạp tiền", uid: userUpdate.uid }).save()
            if (history) {
                const keyHistory = "history"
                const keyRedisHistory = keyHistory + deposit.uid
                const checkHistoryredis = await redisCache.get(keyRedisHistory)
                var arrayHistory = JSON.parse(checkHistoryredis)
                if (arrayHistory == null) {
                    arrayHistory = []
                }
                arrayHistory.unshift(history)
                await redisCache.set(keyRedisHistory, JSON.stringify(arrayHistory))
            }

            res.json({ error: 0, message: "Thanh cong" })
        }
        else {
            res.json({ error: 1, message: "That bai 1" })
        }
    }
    else {
        res.json({ error: 1, message: "That bai 2" })
    }
}


module.exports = { GateMoney, GateMoneyView, RemoveBank, SaveChanges, listDepositView, setSuccess, listDepositViewChuaDuyet, listDepositViewDaDuyet ,SaveDepositAuto}