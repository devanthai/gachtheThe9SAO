
const md5 = require("md5")
const Card = require("../modules/Card")
const Historys = require("../modules/History")
const UserInfo = require("../modules/User/UserInfo")
const Helper = require("../Helpers/Helper")
const redisClient = require("../redisCache")
const keyredishiscard = "hiscard"
const Setting = require("../modules/Setting")

CallBackCard = async (req, res) => {
    const code = req.body.code
    const serial = req.body.serial
    const setting = await Setting.findOne({})
    const partner_key = setting.apicard.partner_key;
    const callbacksign = md5(partner_key + code + serial)
    const callback_sign = req.body.callback_sign

    if (callback_sign == callbacksign) {
        const status = req.body.status
        const message = req.body.message
        const request_id = req.body.request_id
        const trans_id = req.body.trans_id
        const declared_value = req.body.declared_value
        const value = req.body.value
        const amount = req.body.amount
        const telco = req.body.telco
        Card.findOne({ request_id: request_id }, async (error, card) => {
            if (card) {
                card.status = status
                card.message = message
                if (status == 1) {
                    //the dung
                    card.amount = amount
                    card.value = value
                    UserInfo.findOne({ uid: card.uid },async (error, userinfo) => {
                        const firtBalancez = Number(userinfo.money)
                        userinfo.money = Number(userinfo.money) + Number(amount)
                        userinfo.save()
                        const history = await Historys({ transid: card.trans_id, amount: Number(amount), firtBalance: firtBalancez, lastBalance: userinfo.money, content: "Nạp tiền từ đơn hàng đổi thẻ: " + card.serial+" / "+card.code, uid: card.uid }).save()
                        if (history) //Them vao redis cache
                        {
                            const keyHistory = "history"
                            const keyRedisHistory = keyHistory + card.uid
                            const checkHistoryredis = await redisClient.get(keyRedisHistory)
                            var arrayHistory = JSON.parse(checkHistoryredis)
                            if (arrayHistory == null) {
                                arrayHistory = []
                            }
                            arrayHistory.unshift(history)
                            await redisClient.set(keyRedisHistory, JSON.stringify(arrayHistory))
                        }
                    })
                }
                else if (status == 2) {
                    //the đúng nhưng sai mệnh giá
                    card.amount = amount
                    card.value = value
                    UserInfo.findOne({ uid: card.uid }, (error, userinfo) => {
                        userinfo.money = Number(userinfo.money) + Number(amount)
                        userinfo.save()
                    })
                }
                else if (status == 3) {
                    card.amount = 0
                
                    //the k dung dc
                }
                else {
                    card.amount = amount
                    card.value = value
                    // loi khong xac dinh
                }
                const keyredis = keyredishiscard + card.uid
                const getHiscardRedis = await redisClient.get(keyredis)
                var array = JSON.parse(getHiscardRedis)
                if (array == null) {
                    array = []
                }
                for (let i = 0; i < array.length; i++) {
                    if (array[i]._id == card._id) {
                        array[i] = card
                        break
                    }
                }
                await redisClient.set(keyredis, JSON.stringify(array))
                card.save()
            }
        })
    }
    res.send("<h1>CARDapi</h1>")
}
module.exports = { CallBackCard }