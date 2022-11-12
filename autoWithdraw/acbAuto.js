
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Withdraw = require("../modules/Withdraw")
const Setting = require("../modules/Setting")
const path = require('path')
const BotTelegram = require("../telegram/bot")
const request = require("request")
dotenv.config({ path: path.resolve(__dirname, '../.env') })
mongoose.connect(process.env.DB_CONNECT, () => console.log('Connected to db'));


Withdraw.updateMany({ status: 999 }, { status: -1 }, (data) => {
    console.log(data)
})

start = async () => {
    setTimeout(async () => {
        start()
    }, 20000);
    const setting = await Setting.findOne()
    if (setting.autoWithdraw.Acb.isRunning) {
        let rutTiens = await Withdraw.findOne({ status: -1, "bank.bank": { $ne: "TheSieuRe.com" } })
        if (rutTiens) {

            rutTiens.status = 999
            rutTiens.save()
            let typebank = rutTiens.bank.bank
            let bankcode = null


            if (typebank == "TheSieuRe.com") {
                return
            }
            else if (typebank == "MoMo") {
                
                request.get(setting.autoWithdraw.Momo.urlApi + "&amount=" + rutTiens.amount + "&phoneTarget=" + rutTiens.bank.stk + "&comment=The9sao", async function (error, response, body) {
                    if (!error) {
                        if (body == "thanhcong") {
                            rutTiens.status = 1
                            rutTiens.save()
                            BotTelegram.sendMessage(process.env.GROUP_TELEGRAM_ID, "Auto momo success " + rutTiens.bank.stk + " " + rutTiens.amount);
                        }
                        else {
                            rutTiens.status = -1
                            rutTiens.save()
                            BotTelegram.sendMessage(process.env.GROUP_TELEGRAM_ID, "Chuyen tien MOMO loi " + rutTiens.bank.stk + " " + rutTiens.amount);
                        }
                    }
                })
                return
            }
            else if (typebank == "BIDV") {
                bankcode = 970418
            }
            else if (typebank == "MB" || typebank == "MB Bank") {
                bankcode = 970422
            }
            else if (typebank == "AGR") {
                bankcode = 970405
            }
            else if (typebank == "ACB") {
                bankcode = 970416
            }
            else if (typebank == "SACOMBANK") {
                bankcode = 970403
            }
            else if (typebank == "VIETCOMBANK") {
                bankcode = 970436
            }
            else if (typebank == "TECHCOMBANK") {
                bankcode = 970407
            }
            else if (typebank == "DONGA") {
                bankcode = 970406
            }
            else if (typebank == "VIETINBANK" || typebank == "Vietinbank") {
                bankcode = 970415
            }
            else if (typebank == "VPBANK") {
                bankcode = 970432
            }
            else if (typebank == "TPBANK") {
                bankcode = 970423
            }
            else if (typebank == "EXB") {
                bankcode = 970431
            }
            else if (typebank == "SEA") {
                bankcode = 970440
            }
            else if (typebank == "HDB") {
                bankcode = 970437
            }
            else if (typebank == "VIB") {
                bankcode = 970441
            }
            else if (typebank == "OCE") {
                bankcode = 970414
            }
            else if (typebank == "SHB") {
                bankcode = 970443
            }
            else if (typebank == "NAMABANK") {
                bankcode = 970428
            }
            console.log(bankcode)
            console.log(typebank)



            const ck = await ckAcb(
                setting.autoWithdraw.Acb.linkapi,
                setting.autoWithdraw.Acb.username,
                setting.autoWithdraw.Acb.password,
                setting.autoWithdraw.Acb.accountNumber,
                rutTiens.bank.stk,
                bankcode,
                rutTiens.amount,
                "the9sao.com",
                'OTPS'
            )
            if (!ck.error) {
                rutTiens.status = 1
                rutTiens.save()
                let namebankz = ck.data.receiverName
                let bankname = ck.data.bankName
                BotTelegram.sendMessage(process.env.GROUP_TELEGRAM_ID, "Chuyển tiền Bank thành công\nUsername: " + rutTiens.username + "\nTk: " + rutTiens.bank.stk + " Số tiền: " + rutTiens.amount + "\nName: " + namebankz + "\nBank:" + bankname);
            }
            else {
                BotTelegram.sendMessage(process.env.GROUP_TELEGRAM_ID, "Chuyển tiền Bank thất bại \nTk: " + rutTiens.bank.stk + "\n" + ck.message);
                rutTiens.status = -1
                rutTiens.save()
            }
        }
    }
}
start()


const urlGetCode = "https://acb.doitien.me/getOTP9sao"
let ckAcb = (urlapi, username, password, accountNumber, tranfer_to, napasBankCode, amount, message, otp_type = 'OTPS') => {

    return new Promise(async (resolve) => {
        const options = {
            url: urlapi + "api/acb/" + (napasBankCode == 970416 ? "tranfer_local" : "tranfer_247"),
            json: true,
            body: {
                accountNumber: accountNumber,
                username: username,
                password: password,
                tranfer_to: tranfer_to,
                napasBankCode: napasBankCode + "",
                amount: amount,
                message: message,
                otp_type: otp_type
            }
        };
        request.post(options, (error, res, body) => {
            if (error) {
                return resolve({ error: true, message: "Lỗi tại api/acb/tranfer_247 " + error.message })
            }
            else if (res.statusCode != 200) {
                return resolve({ error: true, message: "Lỗi tại api/acb/tranfer_247 status != 200" })
            }
            else {
                let jsonRes = body
                if (jsonRes.success == true) {
                    let uuid = jsonRes.data.uuid
                    request.get(urlGetCode, async function (error, response, body) {
                        if (error) {
                            return resolve({ error: true, message: "Lỗi tại get code " + error.message })
                        }
                        else if (response.statusCode != 200) {
                            return resolve({ error: true, message: "Lỗi tại get code status != 200" })
                        }
                        else {
                            let code = body
                            const options = {
                                url: urlapi + "api/acb/confirm_tranfer",
                                json: true,
                                body: {
                                    accountNumber: accountNumber,
                                    username: username,
                                    password: password,
                                    uuid: uuid,
                                    code: code,
                                    otp_type: otp_type
                                }
                            };
                            request.post(options, (error, res, body) => {
                                if (error) {
                                    return resolve({ error: true, message: "Lỗi tại confirm_tranfer " + error.message })
                                }
                                else if (res.statusCode != 200) {
                                    return resolve({ error: true, message: "Lỗi tại get confirm_tranfer status != 200" })
                                }
                                else {
                                    let resJsson = body
                                    if (resJsson.success == true) {
                                        return resolve({ error: false, message: "Ck thành công", data: resJsson })
                                    }
                                    else {
                                        return resolve({ error: true, message: "Lỗi tại not success confirm_tranfer " + JSON.stringify(resJsson) })
                                    }
                                }
                            })
                        }
                    })
                }
                else {
                    return resolve({ error: true, message: "Lỗi tại not success " + JSON.stringify(jsonRes) })
                }
            }
        })
    })
}

