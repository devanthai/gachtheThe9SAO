const User = require("../modules/User/User")
const UserInfo = require("../modules/User/UserInfo")
const Transfers = require("../modules/Transfer")
const Helper = require("../Helpers/Helper")
const redisClient = require("../redisCache")
const Historys = require("../modules/History")

const keyTranshis = "transhis"
const keyHistory = "history"

CheckTransfer = async (req, res) => {
    var { Username, Password, Transid } = req.body
    const user = await User.findOne({ Username: Username })
    if (user) {
        const isValidPass = Helper.validPassword(Password, user.Password)
        if (!isValidPass) {
            return res.json({ error: true, message: "Authencation faill" })
        }
        else {
            try {
                var getTransfer = await Transfers.findOne({ transId: Transid, "to.uid": user._id.toString() })
                if (getTransfer) {
                    return res.send({ error: false, data: getTransfer })
                }
                else {
                    return res.json({ error: true, message: "Cannot find this transid" })
                }
            }
            catch {
                return res.json({ error: true, message: "Fail to find transfer" })
            }
        }
    }
    else {
        return res.json({ error: true, message: "Authencation faill" })
    }
}

CheckTransferComment = async (req, res) => {
    var { Content } = req.body

    try {
        var getTransfer = await Transfers.findOne({ comment: Content })
        if (getTransfer) {
            return res.send({ error: false, data: getTransfer })
        }
        else {
            return res.json({ error: true, message: "Cannot find this transid" })
        }
    }
    catch {
        return res.json({ error: true, message: "Fail to find transfer" })
    }

}
GetTransfer = async (req, res) => {
    let { Username, Password, Limit, Type } = req.body
    let user = await User.findOne({ Username: Username })

    if (user) {
        const isValidPass = Helper.validPassword(Password, user.Password)
        if (!isValidPass) {
            return res.json({ error: true, message: "Authencation faill" })
        }
        else {
            try {
                if (Type == -1) {
                    var getTransfer = await Transfers.find({ "from.uid": user._id.toString() }).limit(Limit).sort({ time: -1 })
                    return res.send({ error: false, data: getTransfer })
                }
                else if (Type == 1) {
                    var getTransfer = await Transfers.find({ "to.uid": user._id.toString() }).limit(Limit).sort({ time: -1 })
                    return res.send({ error: false, data: getTransfer })
                }
                else {
                    var getTransfer = await Transfers.find({ $or: [{ "from.uid": user._id.toString() }, { "to.uid": user._id.toString() }] }).limit(Limit).sort({ time: -1 })
                    return res.send({ error: false, data: getTransfer })
                }
            }
            catch {
                return res.json({ error: true, message: "Fail to find transfer" })
            }
        }
    }
    else {
        return res.json({ error: true, message: "Authencation faill" })
    }
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
Transfer = async (req, res) => {
    let { Username, Password, PasswordLever2, UsernameTo, AmountTransFer, Comment } = req.body
    const user = await User.findOne({ Username: Username })
    let userTo = await User.findOne({ Username: UsernameTo })


    if (!userTo) {

        let phoneFInd = ""
        let isSDT = Helper.checkPhoneValid(UsernameTo)
        if (isSDT) {
            const crack = Helper.phoneCrack(UsernameTo)
            if (crack != null) {
                phoneFInd = crack.phone
            }
        }
        let temppp = { email: UsernameTo }
        if (isSDT) {
            temppp = { phone: phoneFInd }
        }

        const userInfoo = await UserInfo.findOne(temppp)
        if (userInfoo) {
            userTo = await User.findOne({ _id: userInfoo.uid })
        }
        //  console.log(userInfoo,user)
    }


    if (!userTo) {
        return res.json({ error: true, message: "UserTo not found" })
    }
    if (user) {
        const isValidPass = Helper.validPassword(Password, user.Password)
        const isValidPass2 = Helper.validPassword(PasswordLever2, user.PasswordLevel2)
        if (!isValidPass) {
            return res.json({ error: true, message: "Authencation faill" })
        }
        else if (!isValidPass2) {
            return res.json({ error: true, message: "Authencation faill 2" })
        }
        else {

            try {
                AmountTransFer = Number(AmountTransFer)
                const transfer = await TransFer(user._id, userTo._id, AmountTransFer)
                if (transfer.error == 0) {
                    const toInfo = await UserInfo.findOne({ uid: userTo._id })
                    const fromInfo = await UserInfo.findOne({ uid: user._id })
                    var TO = { name: toInfo.name, Username: userTo.Username, uid: toInfo.uid }
                    var FROM = { name: fromInfo.name, Username: user.Username, uid: fromInfo.uid }
                    var rs = await Transfers.create({ transId: Helper.getTransId(), amount: AmountTransFer, from: FROM, to: TO, status: 1, comment: Comment })
                    try {
                        if (rs) {
                            //Them lsgd trans vao redis uid chuyen
                            const keyredis = keyTranshis + fromInfo.uid
                            const checkTransRedis = await redisClient.get(keyredis)
                            var array = JSON.parse(checkTransRedis)
                            if (array == null) {
                                array = []
                            }
                            array.unshift(rs)
                            await redisClient.set(keyredis, JSON.stringify(array))

                            //them vao redis nguoi nhan
                            const keyredischar = keyTranshis + toInfo.uid
                            const checkTransRedisChar = await redisClient.get(keyredischar)
                            var arraychar = JSON.parse(checkTransRedisChar)
                            if (arraychar == null) {
                                arraychar = []
                            }
                            arraychar.unshift(rs)
                            await redisClient.set(keyredischar, JSON.stringify(arraychar))
                        }

                        const history = await Historys({ transid: rs.transId, amount: -AmountTransFer, firtBalance: transfer.fromUser.money + AmountTransFer, lastBalance: transfer.fromUser.money, content: Comment, uid: fromInfo.uid }).save()
                        const historyChar = await Historys({ transid: rs.transId, amount: +AmountTransFer, firtBalance: transfer.toUser.money - AmountTransFer, lastBalance: transfer.toUser.money, content: Comment, uid: toInfo.uid }).save()
                        if (history) //Them vao redis cache
                        {
                            const keyRedisHistory = keyHistory + fromInfo.uid
                            const checkHistoryredis = await redisClient.get(keyRedisHistory)
                            var arrayHistory = JSON.parse(checkHistoryredis)
                            if (arrayHistory == null) {
                                arrayHistory = []
                            }
                            arrayHistory.unshift(history)
                            await redisClient.set(keyRedisHistory, JSON.stringify(arrayHistory))

                            //them vao redis nguoi nhan
                            const keyredischarz = keyHistory + toInfo.uid
                            const checkTransRedisChar = await redisClient.get(keyredischarz)
                            var arraychar = JSON.parse(checkTransRedisChar)
                            if (arraychar == null) {
                                arraychar = []
                            }
                            arraychar.unshift(historyChar)
                            await redisClient.set(keyredischarz, JSON.stringify(arraychar))
                        }
                        return res.json({ error: false, data: rs })

                    } catch (error) {
                        return res.json({ error: true, message: "Error" })
                    }
                }
            } catch (error) {
                return res.json({ error: true, message: error.message })
            }
        }
    }
    else {
        return res.json({ error: true, message: "Authencation faill" })
    }

}
module.exports = { GetTransfer, Transfer, CheckTransfer, CheckTransferComment }