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
    console.log(setting.autoDeposit.MBbank.isRunning)
    if (setting.autoDeposit.MBbank.isRunning == true) {
        console.log("auto mb bank")
        var DATA = {
            username: setting.autoDeposit.MBbank.username,
            password: setting.autoDeposit.MBbank.password,
            accountNumber: setting.autoDeposit.MBbank.accountNumber,
        }
        var Urlapi = setting.autoDeposit.MBbank.urlApi
        request.post({
            url: Urlapi,
            json: DATA
        }, function (error, response, body) {
            try {
                var json = (body)
                if (json.success == true) {
                    json.data.forEach(async (element) => {
                        var description = element.description.toLowerCase()
                        var creditAmount = element.creditAmount
                        creditAmount = Number(creditAmount)
                        if (creditAmount != 0 && description.split("muathe").length == 2) {
                            const deposits = await Deposit.find({ $text: { $search: description }, status: 0 })
                            var donpick = null
                            deposits.forEach(elementz => {
                                if (description.search(elementz.content.toLowerCase()) != -1) {
                                    donpick = elementz
                                }
                            });
                            if (donpick != null && donpick.gate.toLowerCase().includes("mb")) {
                                if (creditAmount == donpick.amount) {
                                    await Deposit.findByIdAndUpdate(donpick._id, { status: 1 })
                                    var userI = await UserInfo.findOneAndUpdate({ uid: donpick.uid }, { $inc: { money: donpick.amount } })
                                    const history = await History({ transid: donpick.transid, amount: creditAmount, firtBalance: userI.money, lastBalance: userI.money + creditAmount, content: "Nạp tiền từ MB BANK", uid: donpick.uid }).save()
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
                    });
                }
            } catch (error) {
                console.log(error, body)
            }
        });
    }
}, 10000);