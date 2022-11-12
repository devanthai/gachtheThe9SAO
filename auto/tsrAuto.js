const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');
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
const puppeteer = require('puppeteer');

let browser = null
let page = null
let cookies = null
let content = null

let key2captcha = "ghy6wkqn1bffpsu2cvvl4doc0im59arx"


giaiCaptcha = async (g_recaptcha) => {
    return new Promise(async (resolve) => {
        request({
            url: "https://azcaptcha.com/in.php?key=" + key2captcha + "&method=userrecaptcha&googlekey=" + g_recaptcha + "&pageurl=https://thesieure.com/account/login",
            method: "GET"
        }, async function (error, response, body) {
            if (response.statusCode == undefined) {
                return resolve({ error: true, message: "Lỗi get captcha thất bại 1 " + body })
            }
            else if (response.statusCode != 200) {
                return resolve({ error: true, message: "Lỗi get captcha status != 200" })
            }
            else {
                const idget = body.split('|')[1]
                let solangiai = 0
                const lapgiaicaptcha = setInterval(async () => {
                    console.log("Giải captcha lần: " + (solangiai + 1))
                    request({
                        url: "https://azcaptcha.com/res.php?key=" + key2captcha + "&action=get&id=" + idget,
                        method: "GET"
                    }, async function (error, response, body) {
                        if (response.statusCode == undefined) {
                            clearInterval(lapgiaicaptcha)
                            return resolve({ error: true, message: "Lỗi get captcha thất bại 2 " + body })
                        }
                        else if (response.statusCode == 200) {
                            if (!body.includes("CAPCHA_NOT_READY") && !body.includes("OK")) {
                                clearInterval(lapgiaicaptcha)
                                return resolve({ error: true, message: "Lỗi giải captcha thất bại" })
                            }
                            else if (body.includes("OK")) {
                                clearInterval(lapgiaicaptcha)
                                const responsecaptcha = body.split("|")[1]
                                return resolve({ error: false, message: "Giair captcha thanh cong", data: responsecaptcha })
                            }
                        }
                        else {
                            console.log("Lỗi check captcha")
                        }
                    })
                    solangiai++
                    if (solangiai > 25) {
                        clearInterval(lapgiaicaptcha)
                        return resolve({ error: true, message: "Lỗi giải captcha quá thời gian" })
                    }
                }, 5000)
            }
        })
    })
}

TheSieuRe2 = () => {
    return new Promise(async (resolve) => {
        const setting = await Setting.findOne({})
        try {
            browser = await puppeteer.launch({ args: ['--no-sandbox', '--single-process', '--no-zygote'], headless: true });
            page = await browser.newPage();
            if (cookies == null) {
                await page.goto('https://thesieure.com/account/login', { waitUntil: 'networkidle0' });
                await page.waitForTimeout(2000)
                await page.type("#username", setting.autoDeposit.Tsr.username);
                await page.type("#password", setting.autoDeposit.Tsr.password);
                let content = await page.content()


                await page.evaluate(() => { document.querySelector('#g-recaptcha-response').style.display = 'block'; });
                const g_recaptcha = content.split('data-sitekey="')[1].split('"')[0]
                const giaicaptcha = await giaiCaptcha(g_recaptcha)
                if (giaicaptcha.error) {
                    return resolve("loi captcha")
                }
                await page.type("#g-recaptcha-response", giaicaptcha.data);
                await page.waitForTimeout(1000)
                await page.click("button[type='submit']")
            }
            else {
                await page.setCookie(...cookies);
            }
            await page.waitForTimeout(2000)
            await page.goto('https://thesieure.com/wallet/transfer', { waitUntil: 'networkidle0' });
            content = await page.content()
            console.log(content)
            if (content.includes("20,000,000")) {
                cookies = await page.cookies()
                const $ = cheerio.load(content, {
                    normalizeWhitespace: true,
                    xmlMode: true
                });
                cheerioTableparser($);
                const data = $("#main > div.section-gap > div > div.mt-4 > div.table-responsive").parsetable(true, true, true);
                console.log(data)
                let array = []
                for (let i = 1; i < data[0].length; i++) {
                    const magd = data[0][i];
                    let sotien = data[1][i];
                    const ten = data[2][i];
                    const time = data[3][i];
                    const status = data[4][i];
                    const noidung = data[5][i];
                    sotien = Number(sotien.replace(/,/g, '').replace("đ", ''))
                    if (sotien > 0) {
                        array.push({ magd: magd, sotien: sotien, ten: ten, time: time, status: 1, noidung: noidung })
                    }
                }
                try {
                    await page.close()
                    await browser.close();
                }
                catch { }
                return resolve(array)
            }
            else {
                try {
                    await page.close()
                    await browser.close();
                }
                catch { }
                cookies = null
                return resolve("loi 2000")
            }
        } catch (error) {
            console.log(error)
            try {
                await page.close()
                await browser.close();
            }
            catch { }
            return resolve("loi "+error)
        }
    })
}




function TheSieuRe() {
    return new Promise(async (resolve) => {
        const setting = await Setting.findOne({})

        try {
            request.get({ jar: true, url: 'https://thesieure.com/account/login' }, function (error, response, body) {
                // if (error) throw error; 
                if (error) { return resolve("loi1") }
                if (response.statusCode == 200) {
                    const $ = cheerio.load(body);
                    var token = $('[name=_token]').val()
                    const cj = request.jar();
                    for (var i = 0; i < response.headers['set-cookie'].length; i++) {
                        cj.setCookie(response.headers['set-cookie'][i], 'https://thesieure.com/');
                    }
                    const options = {
                        url: 'https://thesieure.com/account/login',
                        jar: cj,
                        json: true,
                        body: {
                            _token: token,
                            phoneOrEmail: setting.autoDeposit.Tsr.username,
                            password: setting.autoDeposit.Tsr.password
                        }
                    };
                    request.post(options, (error, res, body) => {
                        //      if (error) throw error; 
                        if (error) { return resolve("loi 185"+body) }
                        if (res.statusCode == 302) {
                            request.get({ url: 'https://thesieure.com/wallet/transfer', jar: cj }, function (error, response, body) {
                                const $ = cheerio.load(body, {
                                    normalizeWhitespace: true,
                                    xmlMode: true
                                });
                                cheerioTableparser($);
                                var data = $(".col-sm-12.table-responsive").parsetable(true, true, true);
                                try {
                                    var array = []
                                    for (var i = 1; i < data[0].length; i++) {
                                        var magd = data[0][i];
                                        var sotien = data[1][i];
                                        var ten = data[2][i];
                                        var time = data[3][i];
                                        var status = data[4][i];
                                        var noidung = data[5][i];
                                        sotien = Number(sotien.replace(/,/g, '').replace("đ", ''))
                                        if (sotien > 0) {
                                            array.push({ magd: magd, sotien: sotien, ten: ten, time: time, status: 1, noidung: noidung })
                                        }
                                    }
                                    return resolve(array)
                                } catch { return resolve("loi") }
                            });
                        }
                        else
                            return resolve("loi")
                    });
                } else return resolve("loi")
            });
        } catch { return resolve("loi") }

    });

}

autogetTsr = async () => {
    try {
        const getTransactions = await TheSieuRe2();
        console.log(getTransactions)
        if (getTransactions != "loi") {
            getTransactions.forEach(async (element) => {
                var description = element.noidung.toLowerCase()
                var creditAmount = element.sotien
                const deposits = await Deposit.find({ $text: { $search: description }, status: 0 })
                var donpick = null
                deposits.forEach(elementz => {
                    if (description.search(elementz.content.toLowerCase()) != -1) {
                        donpick = elementz
                    }
                });

                if (donpick != null && donpick.gate.toLowerCase().includes("tsr")) {
                    if (creditAmount == donpick.amount && description.split("muathe").length == 2) {
                        await Deposit.findByIdAndUpdate(donpick._id, { status: 1 })
                        var userI = await UserInfo.findOneAndUpdate({ uid: donpick.uid }, { $inc: { money: donpick.amount } })
                        const history = await History({ transid: donpick.transid, amount: creditAmount, firtBalance: userI.money, lastBalance: userI.money + creditAmount, content: "Nạp tiền từ TSR", uid: donpick.uid }).save()
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
            });
        }
    } catch (ex) { console.log(ex) }
    setTimeout(async () => {
        autogetTsr()
    }, 5000)
}
autogetTsr()