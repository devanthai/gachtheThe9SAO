const User = require("../modules/User/User")
const UserInfo = require("../modules/User/UserInfo")

const Crpyto = require("../Helpers/Crpyto")
memberView = async (req, res) => {
    var members = await UserInfo.find({}).populate("uid")
    res.render("index", { page: "pages/member/main", members })
}
setAmount = async (req, res) => {

    var { username, amountSet, typeamount } = req.body
    amountSet = Number(amountSet)
    const user = await User.findOne({ Username: username })
    if (user) {
        var userInfo = await UserInfo.findOne({ uid: user._id })
        if (userInfo) {
            if (typeamount == 1) {
                userInfo.money += amountSet
            }
            else if (typeamount == 2) {
                userInfo.money -= amountSet
            }
            else {
                return res.json({ message: "Vui lòng chọn kiểu" })
            }
            userInfo.save()
            res.json({ message: "Thành công" })
        }
        else {
            res.json({ message: "Không tìm thấy thành viên này" })
        }
    }
    else {
        res.json({ message: "Không tìm thấy thành viên này" })
    }
}

Login = (req, res) => {
    var uid = req.body.uid
    console.log(uid.toString())
    var encode = Crpyto.encrypt(uid.toString())


    res.json({ error: false, message: encode })
}

LockUser = async (req, res) => {
    var uid = req.body.uid
    var user = await User.findById(uid)
    if (user) {
        user.IsLock = !user.IsLock
        user.save()
        res.send({ error: false, message: "Đã " + (user.IsLock ? "khóa" : "mở khóa" + " thành viên này") })
    }
    else {
        res.send({ error: true, message: "Loi k tim thay thanh vien" })
    }
}
DeleteAccount = async (req, res) => {
    var uid = req.body.uid
    var user = await User.findByIdAndRemove(uid)
    var userz = await UserInfo.findOneAndRemove({ uid: uid.toString() })
    res.send({ error: true, message: "Ok" })
}
module.exports = { memberView, setAmount, Login, LockUser, DeleteAccount }