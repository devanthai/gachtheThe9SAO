const CardFee = require("../modules/CardFee")
const UserInfo = require("../modules/User/UserInfo")
const GetListFee = require("../controllers/GetFeeList")
const Card = require("../modules/Card")
const Setting = require("../modules/Setting")
const Helper = require("../Helpers/Helper")
const redisClient = require("../redisCache")
const PostCard = require("../Helpers/PostCard")
const keyredishiscard = "hiscard"
const Historys = require("../modules/History")

SearchMiddleware = async (req, res, next) => {
    const submit = req.query.submit
    if (submit == "filter") {
        var { telco, value, status, fromdate, todate } = req.query
        if (status == "correct") {
            status = 1
        }
        else if (status == "wrong") {
            status = 2
        }
        else if (status == "invalid") {
            status = 3
        }
        else if (status == "waiting") {
            status = 99
        }
        try {
            var start = new Date(fromdate).setHours(0, 0, 0, 0);
            var end = new Date(todate).setHours(23, 59, 59, 999);
            var temp = { telco: telco, declared_value: Number(value), status: status, time: { $gte: start, $lte: end }, uid: req.userInfo.uid }
            if (telco == "all") {
                delete temp["telco"]
            }
            if (value = "" || !value) {
                delete temp["declared_value"]
            }
            const findCards = await Card.find(temp).sort({ time: -1 })
            const listFee = await GetListFee()
            var hisdata = { his: findCards, current: 1, pages: 1 }

            var totalReal = 0
            var totalRecive = 0

            for (let i = 0; i < findCards.length; i++) {
                totalReal += findCards[i].value
                totalRecive += findCards[i].amount
            }

            res.render("index", { page: "pages/doithecao", user: req.user, userInfo: req.userInfo, fees: listFee, hiscard: hisdata, isSearch: true, totalReal, totalRecive });
        } catch (ex) { console.log("Loi tai SearchMiddleware: " + ex) }
    }
    else if (req.query.searchcode) {
        const codes = req.query.searchcode
        const cardSearchs = await Card.find({ $text: { $search: codes }, uid: req.userInfo.uid })
        const listFee = await GetListFee()
        var hisdata = { his: cardSearchs, current: 1, pages: 1 }
        res.render("index", { page: "pages/doithecao", user: req.user, userInfo: req.userInfo, fees: listFee, hiscard: hisdata });
    }
    else {
        next()
    }
}

GetTransCardHis = async (req, res, next) => {
    var perPage = 10
    var page = req.query.page || 1
    const uid = req.userInfo.uid
    const keyredis = keyredishiscard + uid
    const checkTransRedis = await redisClient.get(keyredis)
    if (!checkTransRedis) {
        const gethisDb = await Card.find({ uid: uid }).sort({ time: -1 })
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
    req.hiscard = hisdata
    next()
}

CardCharging = async (req, res) => {
    const { telco, code, serial, amount } = req.body
    const isBang = ((telco.length * 4) - (telco.length + code.length + serial.length + amount.length)) == 0
    const uid = req.userInfo.uid
    const keyredis = keyredishiscard + uid
    const setting = await Setting.findOne({})
    if (telco && code && serial && amount && isBang) {
        var mess = []
        var cardOk = []
        for (let i = 0; i < telco.length; i++) {
            let telcoi = telco[i]
            let codei = code[i]
            let seriali = serial[i]
            let amounti = amount[i]
            console.log({ value: amounti, telco: telcoi })
            const fee = await CardFee.findOne({ value: amounti, telco: telcoi })
            if (!fee) {
                mess.push({ error: 1, mess: "Se-ri " + seriali + " Lỗi không tìm thấy phí tẩy thẻ" })
            }
            else if (telcoi == '') {
                mess.push({ error: 1, mess: "Se-ri " + seriali + " Thiếu dữ liệu loại thẻ (code: " + codei + ")" })
            }
            else if (codei == '') {
                mess.push({ error: 1, mess: "Se-ri " + seriali + " Thiếu dữ liệu mã thẻ (code: " + codei + ")" })
            }
            else if (seriali == '') {
                mess.push({ error: 1, mess: "Code " + codei + " Thiếu dữ liệu Seri" })
            }
            else if (amounti == '') {
                mess.push({ error: 1, mess: "Se-ri " + codei + " Thiếu dữ liệu mệnh giá (code: " + codei + ")" })
            }
            else {
                cardOk.push({ telco: telcoi, code: codei, serial: seriali, amount: amounti })
                const requestId = Math.floor(Math.random() * 100000000000);
                const postcard = await PostCard(telcoi, amounti, codei, seriali, setting.apicard.partner_id, setting.apicard.partner_key, setting.apicard.url, requestId)
                if (postcard != null) {
                    const jsonz = JSON.parse(postcard)
                    const status = jsonz.status
                    const message = jsonz.message
                    const request_id = jsonz.request_id
                    const telco = jsonz.telco
                    const serial = jsonz.serial
                    const code = jsonz.code
                    const declared_value = jsonz.declared_value
                    const amount = jsonz.amount
                    const value = jsonz.value
                    if (status == 1) //Thẻ thành công update luôn
                    {
                        const zz = await new Card({
                            amount: amount,
                            value: value,
                            telco: telco,
                            code: code,
                            serial: serial,
                            fees: fee.fees,
                            uid: req.user._id,
                            penalty: fee.penalty,
                            trans_id: Helper.getCardId(),
                            status: status,
                            request_id: request_id,
                            declared_value: declared_value,
                            message: message
                        }).save()
                        const checkTransRedis = await redisClient.get(keyredis)
                        var array = JSON.parse(checkTransRedis)
                        if (array == null) {
                            array = []
                        }
                        array.unshift(zz)
                        await redisClient.set(keyredis, JSON.stringify(array))
                        UserInfo.findOne({ uid: zz.uid }, async (error, userinfo) => {
                            const firtBalancez = Number(userinfo.money)
                            userinfo.money = Number(userinfo.money) + Number(amount)
                            userinfo.save()
                            const history = await Historys({ transid: zz.trans_id, amount: Number(amount), firtBalance: firtBalancez, lastBalance: userinfo.money, content: "Nạp tiền từ đơn hàng đổi thẻ: " + zz.serial + " / " + zz.code, uid: zz.uid }).save()
                            if (history) //Them vao redis cache
                            {
                                const keyHistory = "history"
                                const keyRedisHistory = keyHistory + zz.uid
                                const checkHistoryredis = await redisClient.get(keyRedisHistory)
                                var arrayHistory = JSON.parse(checkHistoryredis)
                                if (arrayHistory == null) {
                                    arrayHistory = []
                                }
                                arrayHistory.unshift(history)
                                await redisClient.set(keyRedisHistory, JSON.stringify(arrayHistory))
                            }
                        })
                        mess.push({ error: 0, mess: "Se-ri " + seriali + " " + "Thẻ đúng" })
                    }
                    else if (status == 2) // Thẻ thành công nhưng sai mệnh giá
                    {
                        const zz = await new Card({
                            amount: amount,
                            value: value,
                            telco: telco,
                            code: code,
                            serial: serial,
                            fees: fee.fees,
                            uid: req.user._id,
                            penalty: fee.penalty,
                            trans_id: Helper.getCardId(),
                            status: status,
                            request_id: request_id,
                            declared_value: declared_value,
                            message: message
                        }).save()
                        const checkTransRedis = await redisClient.get(keyredis)
                        var array = JSON.parse(checkTransRedis)
                        if (array == null) {
                            array = []
                        }
                        array.unshift(zz)
                        await redisClient.set(keyredis, JSON.stringify(array))
                        UserInfo.findOne({ uid: zz.uid }, async (error, userinfo) => {
                            const firtBalancez = Number(userinfo.money)
                            userinfo.money = Number(userinfo.money) + Number(amount)
                            userinfo.save()
                            const history = await Historys({ transid: zz.trans_id, amount: Number(amount), firtBalance: firtBalancez, lastBalance: userinfo.money, content: "Nạp tiền từ đơn hàng đổi thẻ: " + zz.serial + " / " + zz.code, uid: zz.uid }).save()
                            if (history) //Them vao redis cache
                            {
                                const keyHistory = "history"
                                const keyRedisHistory = keyHistory + zz.uid
                                const checkHistoryredis = await redisClient.get(keyRedisHistory)
                                var arrayHistory = JSON.parse(checkHistoryredis)
                                if (arrayHistory == null) {
                                    arrayHistory = []
                                }
                                arrayHistory.unshift(history)
                                await redisClient.set(keyRedisHistory, JSON.stringify(arrayHistory))
                            }
                        })
                        mess.push({ error: 1, mess: "Se-ri " + seriali + " " + message })
                    }
                    else if (status == 3) // Thẻ lỗi có lưu vào db
                    {
                        //value
                        const zz = await new Card({
                            amount: 0,
                            value: 0,
                            telco: telco,
                            code: code,
                            serial: serial,
                            fees: fee.fees,
                            uid: req.user._id,
                            penalty: fee.penalty,
                            trans_id: Helper.getCardId(),
                            status: status,
                            request_id: request_id,
                            declared_value: declared_value,
                            message: message
                        }).save()
                        const checkTransRedis = await redisClient.get(keyredis)
                        var array = JSON.parse(checkTransRedis)
                        if (array == null) {
                            array = []
                        }
                        array.unshift(zz)
                        await redisClient.set(keyredis, JSON.stringify(array))
                        mess.push({ error: 1, mess: "Se-ri " + seriali + " " + message })
                    }
                    else if (status == 4) // Bảo trì
                    {
                        mess.push({ error: 1, mess: "Se-ri " + seriali + " " + message })
                    }
                    else if (status == 99) // Thẻ chờ xử lý
                    {
                        //value
                        const zz = await new Card({
                            amount: amount,
                            telco: telco,
                            code: code,
                            serial: serial,
                            fees: fee.fees,
                            uid: req.user._id,
                            penalty: fee.penalty,
                            trans_id: Helper.getCardId(),
                            status: status,
                            request_id: request_id,
                            declared_value: declared_value,
                            message: message
                        }).save()
                        const checkTransRedis = await redisClient.get(keyredis)
                        var array = JSON.parse(checkTransRedis)
                        if (array == null) {
                            array = []
                        }
                        array.unshift(zz)
                        await redisClient.set(keyredis, JSON.stringify(array))
                        mess.push({ error: 0, mess: "Se-ri " + seriali + " " + message })
                    }
                    else if (status == 100) // Gửi thẻ thất bại
                    {
                        mess.push({ error: 1, mess: "Se-ri " + seriali + " " + message })
                    }
                    else //status gi deo biet
                    {
                        mess.push({ error: 1, mess: "Se-ri " + seriali + " " + message })
                    }
                }
            }
        }
        if (mess.length != 0) {
            req.flash("message", { message: mess })
            res.redirect('/doithecao')
        }
    }
    else {
        res.flash("message", { message: [{ error: 1, mess: "Vui lòng nhập thẻ" }] })
        res.redirect('/doithecao')
    }
}




CardChargingView = async (req, res) => {
    const listFee = await GetListFee()
    var message = undefined
    const messFlash = req.flash('message')
    if (messFlash.length != 0) {
        message = ""
        const mess = messFlash[0].message
        for (let i = 0; i < mess.length; i++) {
            if (mess[i].error == 1) {
                message += Helper.ErrorMessage(mess[i].mess)
            }
            else {
                message += Helper.SuccessMessage(mess[i].mess)
            }
        }
    }
    res.render("index", { page: "pages/doithecao", user: req.user, userInfo: req.userInfo, fees: listFee, message: message, hiscard: req.hiscard });
}

module.exports = { CardCharging, CardChargingView, GetTransCardHis, SearchMiddleware }