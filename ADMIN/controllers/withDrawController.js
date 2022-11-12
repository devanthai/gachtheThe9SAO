
const Setting = require("../modules/Setting")
const WithDraw = require("../modules/Withdraw")

configView = async (req, res) => {
    const setting = await Setting.findOne({})
    res.render("index", { page: "pages/withdraw/setting", setting })
}
saveSetting = async (req, res) => {
    const { hanmucngay, min, max } = req.body
    try {
        await Setting.findOneAndUpdate({}, { "withdraw.totalday": Number(hanmucngay), "withdraw.min": Number(min), "withdraw.max": Number(max) })
        res.json({ error: 0, message: "CHỉnh sửa thành công" })
    } catch {
        res.json({ error: 1, message: "CHỉnh sửa thất bai" })
    }
}
SaveWithdrawAuto = async (req, res) => {
    const { autoWithdraw } = req.body
    try {
        await Setting.findOneAndUpdate({}, { autoWithdraw: autoWithdraw })
        res.json({ error: 0, message: "CHỉnh sửa thành công" })
    } catch {
        res.json({ error: 1, message: "CHỉnh sửa thất bai" })
    }
}
ChuaDuyetView = async (req, res) => {
    const listWithdraws = await WithDraw.find({ status: -1 }).sort({ time: -1 })
    res.render("index", { page: "pages/withdraw/listWithdraw", listWithdraws })
}
autoTransferConfigView = async (req, res) => {
    const setting = await Setting.findOne({})
    res.render("index", { page: "pages/withdraw/configAuto", setting })
}
DaHuyView = async (req, res) => {
    const listWithdraws = await WithDraw.find({ status: 2 }).sort({ time: -1 })
    res.render("index", { page: "pages/withdraw/listWithdraw", listWithdraws })
}
DaDuyetView = async (req, res) => {
    const listWithdraws = await WithDraw.find({ status: 1 }).sort({ time: -1 })
    res.render("index", { page: "pages/withdraw/listWithdraw", listWithdraws })
}
withDraw = async (req, res) => {
    const listWithdraws = await WithDraw.find({}).sort({ time: -1 })
    res.render("index", { page: "pages/withdraw/listWithdraw", listWithdraws })
}

setSuccess = async (req, res) => {
    const id = req.body.id
    try {
        const wi = await WithDraw.findOneAndUpdate({ _id: id, status: -1 }, { status: 1 })
        res.json({ error: 0, message: "Thanh cong" })
    } catch (error) {
        res.json({ error: 1, message: "loi " + error })
    }
}

setFail = async (req, res) => {
    const id = req.body.id
    try {
        const wi = await WithDraw.findOneAndUpdate({ _id: id, status: -1 }, { status: 2 })
        res.json({ error: 0, message: "Ok " })
    } catch (error) {
        res.json({ error: 1, message: "loi " + error })
    }
}
module.exports = { configView, saveSetting, withDraw, setSuccess, setFail, ChuaDuyetView, DaDuyetView,DaHuyView ,autoTransferConfigView,SaveWithdrawAuto}