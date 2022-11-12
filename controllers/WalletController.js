const User = require("../modules/User/User")
const UserInfo = require("../modules/User/UserInfo")
const Transfers = require("../modules/Transfer")
const Historys = require("../modules/History")

const Helper = require("../Helpers/Helper")
const validator = require('validator');
var jwt = require('jsonwebtoken');
const redisClient = require("../redisCache")
const SECRET = "tyu5t67uyr5TTT65^^^"
const keyTranshis = "transhis"
const keyHistory = "history"



GetDataTranhis = async (req, res, next) => {
    var perPage = 10
    var page = req.query.page || 1
    const uid = req.userInfo.uid
    const keyredis = keyTranshis + uid
    const checkTransRedis = await redisClient.get(keyredis)
    if (!checkTransRedis) {
        const gethisDb = await Transfers.find({ $or: [{ "from.uid": uid }, { "to.uid": uid }] }).sort({ time: -1 })
        await redisClient.set(keyredis, JSON.stringify(gethisDb))
    }

    var transhis = await redisClient.get(keyredis)
    transhis = JSON.parse(transhis)
    if (transhis == null) {
        transhis = []
    }
    const countHis = transhis.length
    var start = (perPage * page) - perPage
    var end = start + perPage
    var data = transhis
    if (end != 0) {
        data = transhis.slice(start, end);
    }
    var hisdata = { his: data, current: page, pages: Math.ceil(countHis / perPage), uid: req.userInfo.uid }
    req.transhis = hisdata
    next()
}
TransferResult = (req, res) => {
    var transId = req.params.transid || null
    Transfers.findOne({ transId: transId, uid: req.user._id }, (error, data) => {
        if (data) {
            User.findById(data.to.uid, (error, user) => {
                if (user) {
                    data.user = user
                    var message = undefined
                    const messFlash = req.flash('message')
                    if (messFlash.length != 0) {
                        message = Helper.SuccessMessage(messFlash[0])
                    }
                    res.render("index", { page: "wallet/transferResult", user: req.user, userInfo: req.userInfo, data: data, message: message })
                }
                else {
                    res.send("Không tìm thấy mã giao dịch này1!")
                }
            })
        }
        else {
            res.send("Không tìm thấy mã giao dịch này!")
        }
    })
}
TransferView = async (req, res) => {
    var message = undefined
    const messFlash = req.flash('message')
    if (messFlash.length != 0) {
        message = Helper.ErrorMessage(messFlash[0].message)
    }
    res.render("index", { page: "wallet/transfer", user: req.user, userInfo: req.userInfo, hisdata: req.transhis, message })
}
Transfer = (req, res) => {
    var { payee_info, amount, description } = req.body
    payee_info = payee_info.toLowerCase()

    amount = Number(amount)
    if (req.isSpam) {
        req.flash('message', { error: 1, message: "Yêu cầu quá thường xuyên vui lòng thử lại sau." })
        return res.redirect("/wallet/transfer")
    }
    else if (isNaN(amount)) {
        req.flash('message', { error: 1, message: "Số tiền nhập không hợp lệ." })
        return res.redirect("/wallet/transfer")
    }
    else if (amount < 10000 || amount > 20000000) {
        req.flash('message', { error: 1, message: "Số tiền chuyển chỉ cho phép từ 10.000đ đến 20.000.000đ." })
        return res.redirect("/wallet/transfer")
    }
    else if (Helper.isHTML(description)) {
        req.flash('message', { error: 1, message: "Nội dung không hợp lệ." })
        return res.redirect("/wallet/transfer")
    }
    else if (!validator.isLength(description, { min: 1, max: 100 })) {
        req.flash('message', { error: 1, message: "Vui lòng nhập nội dung." })
        return res.redirect("/wallet/transfer")
    }
    else if (req.user.Username == payee_info) {
        req.flash('message', { error: 1, message: "Không thể chuyển cho chính mình." })
        return res.redirect("/wallet/transfer")
    }
    else {
        User.findOne({ Username: payee_info }, (error, user) => {
            if (user) {
                if (user._id.toString() == req.session.UserId.toString()) {
                    req.flash('message', { error: 1, message: "Không thể chuyển cho chính mình." })
                    return res.redirect("/wallet/transfer")
                }
                else {
                    UserInfo.findOne({ uid: req.session.UserId }, (error, userInfo) => {
                        if (userInfo) {
                            if (userInfo.money < amount) {
                                req.flash('message', { error: 1, message: "Không có đủ tiền để chuyển." })
                                return res.redirect("/wallet/transfer")
                            }
                            else {
                                UserInfo.findOne({ uid: user._id }, (error, charInfo) => {
                                    if (charInfo) {
                                        const infoView = { Username: payee_info, name: charInfo.name, sotien: amount, comment: description, thanhtien: amount }
                                        var older_token = jwt.sign({ comment: description, to: user._id, money: amount, iat: Math.floor(Date.now() / 1000) - 30 }, SECRET);
                                        res.render("index", { page: "wallet/transferverify", user: req.user, userInfo: req.userInfo, token: older_token, infoView: infoView })
                                    }
                                })
                            }
                        }
                    })
                }
            }
            else {
                var phoneFInd = ""
                var isSDT = Helper.checkPhoneValid(payee_info)
                if (isSDT) {
                    const crack = Helper.phoneCrack(payee_info)
                    if (crack != null) {
                        phoneFInd = crack.phone
                    }
                }
                var temppp = { email: payee_info }
                if (isSDT) {
                    temppp = { phone: phoneFInd }
                }
    
                UserInfo.findOne(temppp, (error, userInfo) => {
                    if (userInfo) {
                        User.findOne({ _id: userInfo.uid }, (error, user) => {
                            if (user) {
                                if (user._id.toString() == req.session.UserId.toString()) {
                                    req.flash('message', { error: 1, message: "Không thể chuyển cho chính mình." })
                                    return res.redirect("/wallet/transfer")
                                }
                                else {
                                    UserInfo.findOne({ uid: req.session.UserId }, (error, userInfo) => {
                                        if (userInfo) {
                                            if (userInfo.money < amount) {
                                                req.flash('message', { error: 1, message: "Không có đủ tiền để chuyển." })
                                                return res.redirect("/wallet/transfer")
                                            }
                                            else {
                                                UserInfo.findOne({ uid: user._id }, (error, charInfo) => {
                                                    if (charInfo) {
                                                        const infoView = { Username: user.Username, name: charInfo.name, sotien: amount, comment: description, thanhtien: amount }
                                                        var older_token = jwt.sign({ comment: description, to: user._id, money: amount, iat: Math.floor(Date.now() / 1000) - 30 }, SECRET);
                                                        res.render("index", { page: "wallet/transferverify", user: req.user, userInfo: req.userInfo, token: older_token, infoView: infoView })
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                            }
                            else {
                                req.flash('message', { error: 1, message: "Không tìm thấy thành viên này." })
                                return res.redirect("/wallet/transfer")
                            }
                        })
                    }
                    else {
                        req.flash('message', { error: 1, message: "Không tìm thấy thành viên này." })
                        return res.redirect("/wallet/transfer")
                    }
                })
            }
        })
    }
}
GetUsername = (req, res) => {
    const username = req.body.payee_info.toLowerCase()
    User.findOne({ Username: username }, (error, user) => {
        if (user) {
            UserInfo.findOne({ uid: user._id }, (error, userInfo) => {
                if (userInfo) {
                    return res.send(userInfo.name)
                }
                else {
                    return res.send("")
                }
            })
        }
        else {
            var phoneFInd = ""
            var isSDT = Helper.checkPhoneValid(username)
            if (isSDT) {
                const crack = Helper.phoneCrack(username)
                if (crack != null) {
                    phoneFInd = crack.phone
                }
            }
            var temppp = { email: username }
            if (isSDT) {
                temppp = { phone: phoneFInd }
            }

            UserInfo.findOne(temppp, (error, userI) => {
                if (userI) {
                    return res.send(userI.name)
                }
                else {
                    return res.send("")
                }
            })
        }
    })
}

TransFer = async (fromId, toId, amount) => {
    const session = await UserInfo.startSession();
    session.startTransaction();
    try {
        const fromUser = await UserInfo.findOneAndUpdate({ uid: fromId }, { $inc: { money: -amount } }, { new: true }).session(session)
        if (fromUser.money < 0) {
            throw new Error('Không đủ tiền để thực hiện: ' + (fromUser.money + amount));
        }
        else if (!fromUser) {
            throw new Error("Không tìm thấy from user");
        }
        const toUser = await UserInfo.findOneAndUpdate({ uid: toId }, { $inc: { money: amount } }, { new: true }).session(session)
        if (!toUser) {
            throw new Error("Không tìm thấy to user");
        }
        await session.commitTransaction();
        session.endSession();
        return { error: 0, fromUser, toUser };
    } catch (error) {
        await session.abortTransaction()
        session.endSession();
        console.log(error)
        throw error;
    }
}


TransferConfirm = async (req, res) => {
    const { data_encode, action, secret } = req.body
    if (req.userInfo.isActivePassLevel2 && !Helper.validPassword(secret, req.user.PasswordLevel2)) {
        req.flash('message', { error: 1, message: "Sai mật khẩu cấp 2." })
        return res.redirect("/wallet/transfer")
    }
    else {
        jwt.verify(data_encode, SECRET, async function (err, decoded) {
            if (err) {
                req.flash('message', { error: 1, message: "Giao dịch lỗi vui lòng thực hiện lại." })
                return res.redirect("/wallet/transfer")
            }
            else {
                const { to, money, comment } = decoded
                try {
                    const fromId = req.session.UserId
                    const transfer = await TransFer(fromId, to, money)
                    if (transfer.error == 0) {
                        const userTo = await User.findById(to)
                        const userFrom = await User.findById(fromId)
                        var TO = { name: transfer.toUser.name, Username: userTo.Username, uid: transfer.toUser.uid }
                        var FROM = { name: transfer.fromUser.name, Username: userFrom.Username, uid: transfer.fromUser.uid }
                        var rs = await Transfers.create({ transId: Helper.getTransId(), amount: money, from: FROM, to: TO, status: 1, comment: comment })
                        try {
                            if (rs) {
                                //Them lsgd trans vao redis uid chuyen
                                const keyredis = keyTranshis + req.userInfo.uid
                                const checkTransRedis = await redisClient.get(keyredis)
                                var array = JSON.parse(checkTransRedis)
                                if (array == null) {
                                    array = []
                                }
                                array.unshift(rs)
                                await redisClient.set(keyredis, JSON.stringify(array))

                                //them vao redis nguoi nhan
                                const keyredischar = keyTranshis + transfer.toUser.uid
                                const checkTransRedisChar = await redisClient.get(keyredischar)
                                var arraychar = JSON.parse(checkTransRedisChar)
                                if (arraychar == null) {
                                    arraychar = []
                                }
                                arraychar.unshift(rs)
                                await redisClient.set(keyredischar, JSON.stringify(arraychar))
                            }

                            const history = await Historys({ transid: rs.transId, amount: -money, firtBalance: transfer.fromUser.money + money, lastBalance: transfer.fromUser.money, content: comment, uid: fromId }).save()
                            const historyChar = await Historys({ transid: rs.transId, amount: +money, firtBalance: transfer.toUser.money - money, lastBalance: transfer.toUser.money, content: comment, uid: to }).save()
                            if (history) //Them vao redis cache
                            {
                                const keyRedisHistory = keyHistory + fromId
                                const checkHistoryredis = await redisClient.get(keyRedisHistory)
                                var arrayHistory = JSON.parse(checkHistoryredis)
                                if (arrayHistory == null) {
                                    arrayHistory = []
                                }
                                arrayHistory.unshift(history)
                                await redisClient.set(keyRedisHistory, JSON.stringify(arrayHistory))

                                //them vao redis nguoi nhan
                                const keyredischarz = keyHistory + transfer.toUser.uid
                                const checkTransRedisChar = await redisClient.get(keyredischarz)
                                var arraychar = JSON.parse(checkTransRedisChar)
                                if (arraychar == null) {
                                    arraychar = []
                                }
                                arraychar.unshift(historyChar)
                                await redisClient.set(keyredischarz, JSON.stringify(arraychar))
                            }
                        } catch (error) {
                            console.log(error)
                        }
                        req.flash('message', 'Chuyển quỹ thành công!')
                        res.redirect("/wallet/transfer/result/" + rs.transId)
                    }
                }
                catch (error) {
                    //console.log(error)
                    req.flash('message', { error: 1, message: error.message })
                    return res.redirect("/wallet/transfer")
                }
            }
        });
    }
}
SearchHistoryMiddleware = async (req, res, next) => {
    const submit = req.query.submit
    if (submit == "filter") {
        var { search, fromdate, todate } = req.query
        try {
            var start = new Date(fromdate).setHours(0, 0, 0, 0);
            var end = new Date(todate).setHours(23, 59, 59, 999);
            var temp = { $text: { $search: search }, time: { $gte: start, $lte: end }, uid: req.user._id }
            if (search != "") {
                delete temp["time"]
            }
            else {
                delete temp["$text"]
            }
            const findCards = await Historys.find(temp).sort({ time: -1 })
            var hisdata = { his: findCards, current: 1, pages: 1 }
            res.render("index", { page: "wallet/history", user: req.user, userInfo: req.userInfo, hisdata: hisdata, isSearch: true });
        } catch (ex) { console.log("Loi tai SearchMiddleware: " + ex) }
    }
    else {
        next()
    }
}
GetHistoryData = async (req, res, next) => {
    var perPage = 10
    var page = req.query.page || 1
    const uid = req.userInfo.uid
    const keyredis = keyHistory + uid
    const checkTransRedis = await redisClient.get(keyredis)
    if (!checkTransRedis) {
        const gethisDb = await Historys.find({ uid: uid }).sort({ time: -1 })
        await redisClient.set(keyredis, JSON.stringify(gethisDb))
    }
    var transhis = await redisClient.get(keyredis)
    transhis = JSON.parse(transhis)
    if (transhis == null) {
        transhis = []
    }
    const countHis = transhis.length
    var start = (perPage * page) - perPage
    var end = start + perPage
    var data = transhis
    if (end != 0) {
        data = transhis.slice(start, end);
    }
    var hisdata = { his: data, current: page, pages: Math.ceil(countHis / perPage) }
    req.history = hisdata
    next()
}
HistoryView = (req, res) => {
    res.render("index", { page: "wallet/history", user: req.user, userInfo: req.userInfo, hisdata: req.history })
}

ListView = (req, res) => {
    res.render("index", { page: "wallet/list", user: req.user, userInfo: req.userInfo })
}

module.exports = { Transfer, TransferView, GetUsername, TransferConfirm, TransferResult, GetDataTranhis, HistoryView, GetHistoryData, SearchHistoryMiddleware, ListView }