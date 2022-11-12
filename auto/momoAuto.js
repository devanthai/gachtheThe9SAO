const mongoose = require('mongoose');
const dotenv = require('dotenv');
const request = require("request")
const Deposit = require("../modules/Deposit")
const Setting = require("../modules/Setting")
const History = require("../modules/History")
const UserInfo = require("../modules/User/UserInfo")
const path = require('path')
const redisClient = require("../redisCache")
dotenv.config({ path: path.resolve(__dirname, '../.env') })
mongoose.connect(process.env.DB_CONNECT, () => console.log('Connected to db'));
setInterval(async () => {
    const setting = await Setting.findOne({})
    request.get(setting.autoDeposit.Momo.urlApi + '?sdt=' + setting.autoDeposit.Momo.phoneNumber, function (error, response, body) {
        try {
            var json = JSON.parse(body)
            if (json) {
                json.forEach(async (element) => {
                    if (element.io == 1) {
                        const description = element.noidung.toLowerCase()
                        var creditAmount = element.sotien
                        creditAmount = Number(creditAmount)
                        if (creditAmount != 0 && description.split("muathe").length == 2) {
                            const deposits = await Deposit.find({ $text: { $search: description }, status: 0 })
                            var donpick = null
                            deposits.forEach(elementz => {
                                if (description.search(elementz.content.toLowerCase()) != -1) {
                                    donpick = elementz
                                }
                            });
                            if (donpick != null && donpick.gate.toLowerCase().includes("momo")) {

                                if (creditAmount == donpick.amount) {
                                    await Deposit.findByIdAndUpdate(donpick._id, { status: 1 })
                                    var userI = await UserInfo.findOneAndUpdate({ uid: donpick.uid }, { $inc: { money: donpick.amount } })
                                    const history = await History({ transid: donpick.transid, amount: creditAmount, firtBalance: userI.money, lastBalance: userI.money + creditAmount, content: "Nạp tiền từ Momo", uid: donpick.uid }).save()
                                    if (history) {
                                        const keyHistory = "history"
                                        const keyRedisHistory = keyHistory + donpick.uid
                                        const checkHistoryredis = await redisClient.get(keyRedisHistory)
                                        var arrayHistory = JSON.parse(checkHistoryredis)
                                        if (arrayHistory == null) {
                                            arrayHistory = []
                                        }
                                        arrayHistory.unshift(history)
                                        await redisClient.set(keyRedisHistory, JSON.stringify(arrayHistory))
                                    }
                                }
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.log(error, body)
        }
    });
}, 10000);