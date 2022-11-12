const Helper = require("../Helpers/Helper")
const GetBalanceNetPay = require("../NetPayApi/GetBalance")
const DeCodeNetPay = require("../NetPayApi/DeCode")
const BuyCardNetPay = require("../NetPayApi/BuyCard")
const Setting = require("../modules/Setting")
const UserInfo = require("../modules/User/UserInfo")
const CardBuy = require("../modules/CardBuy")
const Historys = require("../modules/History")
const GetListCardBuy = require("./GetListCardBuy")
const CardListBuy = require("../modules/CardListBuy")
const redisClient = require("../redisCache")
const key_Cart = "Shoping_Cart_Card"
const md5 = require("md5")

const BotTelegram = require("../telegram/bot")
const dotenv = require('dotenv');
dotenv.config()

HistoryView = async (req, res) => {
    var page = req.query.page || 1
    var perPage = 25
    var cardHistorys = await CardBuy.find({ uid: req.user._id }).skip((perPage * page) - perPage).limit(perPage).sort({ 'time': -1 });
    var count = await CardBuy.countDocuments({ uid: req.user._id });
    res.render("index", { page: "buycard/history", user: req.user, userInfo: req.userInfo, cardHistorys, current: page, pages: Math.ceil(count / perPage) });
}
GetForm = (cards) => {
    var cardsHtml = ""
    var totalCart = 0
    cards.forEach(element => {
        element.card.price = (element.card.price - (element.card.price * (element.card.discount / 100))) * element.qty
        totalCart += element.card.price
        cardsHtml +=
            `
            <div class="row">
                <div class="col-name">
                    <h5 class="product-name"><strong>${element.card.name}</strong></h5>
                    <small>Chiết khấu: ${element.card.discount}%</small>
                </div>
                <div class="col-qty">
                    <input name="qty-${element.id}" class="input-number form-control shopping-cart-qty" type="text" min="1"
                        max="99" style="height: 33px" value="${element.qty}" data-row="${element.row}"
                        data-id="${element.id}">
                    <span class="btn-number fa fa-minus-square" aria-hidden="true" data-type="minus"
                        data-field="qty-${element.id}"></span>
                    <span class="btn-number fa fa-plus-square" aria-hidden="true" data-type="plus"
                        data-field="qty-${element.id}"></span>
                </div>
                <div class="col-price text-right">
                    <h5>
                        <strong>${Helper.numberWithCommas(element.card.price)} đ</strong>
                    </h5>
                </div>
                <div class="col-action">
                    <button class="cell-delete-item btn btn-sm btn-danger" type="button" data-sku="${element.id}"
                        data-row="${element.row}"><i class="fa fa-trash"
                            title="order.remove"></i></button>
                </div>
                </div>
            <hr>
        `
    });
    var buttonThanhTOanhtml = ""
    if (cards.length != 0) {
        buttonThanhTOanhtml =
            `
        <div class="panel-footer">
        <div class="row text-center">
            <div class="col-sm-12">
                <a href="/mua-the/checkout" class="col-sm-12 button btn btn-third" type="submit">Thanh toán</a>
            </div>
        </div>
    </div>
        
        `
        cardsHtml +=
            `
        <div class="row">
                        <div class="col-xs-8">
                            <h4 class="text-right">Tổng</h4>
                        </div>
                        <div class="col-xs-4">
                            <h4 class="text-right">
                                <strong>${Helper.numberWithCommas(totalCart)} đ</strong>
                            </h4>
                        </div>
                    </div>
                    <hr>
                   
                    <a class="col-sm-12 button btn btn-warning delete-cart" ><i class="fa fa-trash" title="order.remove"></i> <strong>Dọn giỏ hàng</strong></a>
                
                    <div class="row payment-method">
                        <div class="col-xs-12">
                            <style>
                                #mtopup-form ul {
                                    padding: 0;
                                }

                                #mtopup-form li {
                                    padding: 5px;
                                    list-style: none;
                                    display: inline-block;
                                }

                                #mtopup-form img {
                                    width: 100%;
                                }

                                #mtopup-form li.active {
                                    border: 3px solid #42b873;
                                    padding: 0px;
                                }

                                #mtopup-form input[type=radio] {
                                    display: none;
                                }
                            </style>
                            <div class="clearfix" style="margin-bottom: 15px"></div>
                            <div class="text-left">
                                <div class="title"><strong>Phương thức thanh toán:</strong></div>
                                <div class="row">
                                    <div class="col-md-12">
                                        <select name="paygate_code" class="form-control" style="padding: 0px">
                                            <option value="Wallet_VND">Ví TSR</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <br>
                        </div>
                        <div class="col-xs-12">
                            <div class="noti-message">Bằng việc chọn 'Thanh toán', bạn đồng ý với <a href="#"
                                    target="_blank">chính sách cung cấp, hủy và hoàn trả dịch vụ</a></div>
                        </div>
                    </div>
        `
    }
    else {
        cardsHtml =
            `
        <div class="row">
            <div class="text-danger text-center">Giỏ hàng đang trống</div>
        </div>
        `
    }
    var html =
        `
       
            <div class="panel panel-info">
                <div class="panel-heading" style="padding-bottom: 5px; padding-top: 5px">
                    <div class="">
                        <h5><i class="fa fa-shopping-cart" aria-hidden="true"></i> Giỏ hàng</h5>
                    </div>
                </div>
                <div class="panel-body">
                    ${cardsHtml}
                </div>
                ${buttonThanhTOanhtml}
            </div>
       
    `
    return html
}
BuyCard = async (req, res) => {
    const { type, id, row, qty } = req.body
    const keyShoping = key_Cart + req.userInfo.uid
    const dataCart = await redisClient.get(keyShoping)
    var array = JSON.parse(dataCart)
    if (array == null) {
        array = []
    }
    if (type == "add") {
        var cardBuy = await CardListBuy.findOne({ "card.items.id": Number(id) })
        if (cardBuy) {
            var card = null
            const itemCards = cardBuy.card[0].items
            itemCards.forEach((element) => {
                if (element.id == Number(id)) {
                    card = element
                }
            })
            const row = md5(card.id)
            array.push({ id: Number(id), qty: 1, row: row, card: card, full: cardBuy })
            await redisClient.set(keyShoping, JSON.stringify(array))
            const getHtml = GetForm(array)
            res.send(JSON.stringify({ row: row, shopping_cart: getHtml }))
        }
    }
    else if (type == "remove") {
        for (let i = 0; i < array.length; i++) {
            if (array[i].row == row) {
                array.splice(i, 1);
                break
            }
        }
        await redisClient.set(keyShoping, JSON.stringify(array))
        const getHtml = GetForm(array)
        res.send(JSON.stringify({ shopping_cart: getHtml }))
    }
    else if (type == "update") {
        if (qty > 0 && qty < 100) {
            for (let i = 0; i < array.length; i++) {
                if (array[i].row == row) {
                    array[i].qty = qty
                    break
                }
            }
            await redisClient.set(keyShoping, JSON.stringify(array))
            const getHtml = GetForm(array)
            res.send(JSON.stringify({ shopping_cart: getHtml }))
        }
        else {
            res.send(JSON.stringify({ shopping_cart: "<h2>Anh Lam gi vay</h2>" }))
        }
    }
    else if (type == "delete") {
        array = []
        await redisClient.set(keyShoping, JSON.stringify(array))
        const getHtml = GetForm(array)
        res.send(JSON.stringify({ shopping_cart: getHtml }))
    }
}
BuyCardView = async (req, res) => {
    const keyShoping = key_Cart + req.userInfo.uid
    const dataCart = await redisClient.get(keyShoping)
    var array = JSON.parse(dataCart)
    if (array == null) {
        array = []
    }
    const getHtml = GetForm(array)
    var message = undefined
    const messFlash = req.flash('message')
    if (messFlash.length != 0) {
        message = ""
        const mess = messFlash[0]
        if (mess.error == 1) {
            message += Helper.ErrorMessage(mess.message)
        }
        else {
            message += Helper.SuccessMessage(mess.message)
        }
    }
    const listCard = await GetListCardBuy(array)


    var cardHistorys = await CardBuy.find({ uid: req.user._id }).sort({ time: -1 }).limit(10)

    res.render("index", { page: "buycard/main", user: req.user, userInfo: req.userInfo, message: message, listCard, getHtml, cardHistorys });
}
CheckOutView = async (req, res) => {

    var message = undefined
    const messFlash = req.flash('message')

    if (messFlash.length != 0) {
        message = ""
        const mess = messFlash[0]
        if (mess.error == 1) {
            message += Helper.ErrorMessage(mess.message)
        }
        else {
            message += Helper.SuccessMessage(mess.message)
        }
    }


    const keyShoping = key_Cart + req.userInfo.uid
    const dataCart = await redisClient.get(keyShoping)
    var array = JSON.parse(dataCart)
    if (array == null) {
        array = []
    }
    if (array.length <= 0) {
        req.flash('message', { error: 1, message: "Chưa có đơn hàng nào trong giỏ" })
        return res.redirect("/mua-the")
    }
    else {
        var totalCart = 0
        array.forEach(element => {
            element.card.price = (element.card.price - (element.card.price * (element.card.discount / 100)))
            element.total = element.card.price * element.qty
            totalCart += element.total
        })
        const oders = { listOder: array, totalCart: totalCart }
        res.render("index", { page: "buycard/checkout", user: req.user, userInfo: req.userInfo, oders: oders, message });
    }
}
OderView = async (req, res) => {
    var message = undefined
    const messFlash = req.flash('message')
    if (messFlash.length != 0) {
        message = ""
        const mess = messFlash[0]
        if (mess.error == 1) {
            message += Helper.ErrorMessage(mess.message)
        }
        else {
            message += Helper.SuccessMessage(mess.message)
        }
    }
    var transId = req.params.transId || null
    var cardBuy = await CardBuy.findOne({ transId: transId, uid: req.user._id })
    if (cardBuy) {
        var totalAmount = 0
        var data = cardBuy.data
        data.forEach((element) => {
            totalAmount += element.total
        })


        var dataClipboard = ""
        for (var i = 0; i < cardBuy.data.length; i++) {
            if (cardBuy.data[i].dataok != null) {
                for (var iz = 0; iz < cardBuy.data[i].dataok.cards.length; iz++) {

                    dataClipboard +=
                        `Loai the: ${cardBuy.data[i].dataok.cards[iz].name}
Seri: ${cardBuy.data[i].dataok.cards[iz].serial}
Ma nap: ${cardBuy.data[i].dataok.cards[iz].code}

`
                }
            }
        }
        const list = { cardBuy, totalAmount, dataClipboard }

        res.render("index", { page: "buycard/viewoder", user: req.user, userInfo: req.userInfo, list: list, message });
    }
    else {
        req.flash('message', { error: 1, message: "Không tìm thấy sản phẩm này" })
        res.redirect("/mua-the")
    }
}
ConfirmBuyCard = async (req, res) => {
    const { secret, action } = req.body
    const setting = await Setting.findOne({})
    if (action == "doPayment") {
        if (req.userInfo.isActivePassLevel2 && !Helper.validPassword(secret, req.user.PasswordLevel2)) {
            req.flash('message', { error: 1, message: "Sai mật khẩu cấp 2." })
            return res.redirect("/mua-the/checkout")
        }
        else {
            const keyShoping = key_Cart + req.userInfo.uid
            const dataCart = await redisClient.get(keyShoping)
            var array = JSON.parse(dataCart)
            if (array == null) {
                array = []
            }
            if (array.length <= 0) {

                req.flash('message', { error: 1, message: "Chưa có đơn hàng nào trong giỏ" })
                return res.redirect("/mua-the")
            }
            else {
                var totalCart = 0
                array.forEach(element => {
                    element.card.price = (element.card.price - (element.card.price * (element.card.discount / 100)))
                    element.total = element.card.price * element.qty
                    totalCart += element.total
                })
                var getBalanceApi = await GetBalanceNetPay(setting.apibuycard.partner_id, setting.apibuycard.partner_key, setting.apibuycard.url)
                try {
                    getBalanceApi = JSON.parse(getBalanceApi)
                }
                catch (error) {
                    req.flash('message', { error: 1, message: "Lỗi: [" + error.message + "] vui lòng thực hiện lại" })
                    return res.redirect("/mua-the/checkout")
                }

                if (getBalanceApi.status == "success" && getBalanceApi != null) {
                    const balance = getBalanceApi.data.balance
                    if (totalCart > balance) {
                        //Hết tiền api netpay

                        try {
                            BotTelegram.sendMessage(process.env.GROUP_TELEGRAM_ID, "Hết tiền trên NetPay để mua thẻ rồi nạp lẹ đi "+totalCart+"/"+balance)
                        } catch { }

                        req.flash('message', { error: 1, message: "Hệ thống tạm lỗi vui lòng liên hệ ADMIN hoặc đợi vài phút." })
                        return res.redirect("/mua-the/checkout")
                    }
                    else {
                        const session = await UserInfo.startSession();
                        session.startTransaction();
                        try {
                            const fromUser = await UserInfo.findOneAndUpdate({ uid: req.user._id }, { $inc: { money: -totalCart } }, { new: true }).session(session)
                            if (fromUser.money < 0) {
                                throw new Error('Không đủ tiền để thực hiện: ' + (fromUser.money + totalCart));
                            }
                            else if (!fromUser) {
                                throw new Error("Không tìm thấy user Transaction");
                            }
                            await session.commitTransaction();
                            session.endSession();
                            try {
                                new Promise(async (resolve, reject) => {
                                    for (let i = 0; i < array.length + 1; i++) {
                                        if (i == array.length) {
                                            resolve()
                                        }
                                        else {
                                            const request_id = Math.floor(Math.random() * 100000000);
                                            const service_code = array[i].full.card[0].service_code
                                            const value = array[i].card.value
                                            const qty = array[i].qty
                                            try {
                                                await BuyCardNetPay(setting.apibuycard.partner_id, setting.apibuycard.partner_key, setting.apibuycard.url, request_id, service_code, value, qty).then((cardBuyNetPay) => {
                                                    if (cardBuyNetPay != null) {
                                                        try {
                                                            cardBuyNetPay = JSON.parse(cardBuyNetPay)
                                                            if (cardBuyNetPay.status == "completed") {
                                                                var data = cardBuyNetPay.data
                                                                array[i].dataok = data

                                                                array[i].dataok.cards.forEach((element) => {
                                                                    element.code = DeCodeNetPay(element.code)

                                                                })
                                                                console.log(array[i].dataok.cards)

                                                            }
                                                            else {
                                                                console.error("Loi tai cardBuyNetPay.status != completed: " + cardBuyNetPay)
                                                                console.log(cardBuyNetPay)
                                                                array[i].dataok = null
                                                            }
                                                        }
                                                        catch (error) {
                                                            console.error(error, "Loi tai error parseJSON " + cardBuyNetPay)
                                                            array[i].dataok = null
                                                        }
                                                    }
                                                    else {
                                                        console.error("Loi tai cardBuyNetPay == null")
                                                        array[i].dataok = null
                                                    }
                                                })
                                            }
                                            catch (error) {
                                                console.error("Loi khong xac dinh " + error)
                                                array[i].dataok = null
                                            }
                                        }
                                    }
                                }).then(async (ok) => {
                                    const transId = Helper.getTransIdBuyCard()
                                    await CardBuy({ data: array, status: 1, uid: req.user._id, transId: transId, totalAmount: totalCart }).save()
                                    return transId
                                }).then(async (transId) => {
                                    const keyShoping = key_Cart + req.userInfo.uid
                                    await redisClient.set(keyShoping, JSON.stringify([]))
                                    res.redirect("/mua-the/oder/" + transId)
                                    return transId
                                }).then(async (transId) => {
                                    const history = await Historys({ transid: transId, amount: -totalCart, firtBalance: req.userInfo.money, lastBalance: fromUser.money, content: "Mua mã thẻ", uid: req.userInfo.uid }).save()
                                    if (history) //Them vao redis cache
                                    {
                                        const keyHistory = "history"
                                        const keyRedisHistory = keyHistory + req.userInfo.uid
                                        const checkHistoryredis = await redisClient.get(keyRedisHistory)
                                        var arrayHistory = JSON.parse(checkHistoryredis)
                                        if (arrayHistory == null) {
                                            arrayHistory = []
                                        }
                                        arrayHistory.unshift(history)
                                        await redisClient.set(keyRedisHistory, JSON.stringify(arrayHistory))
                                    }
                                }).catch(err => {
                                    console.error(err);
                                });
                            }
                            catch {

                            }
                        } catch (error) {
                            await session.abortTransaction()
                            session.endSession();
                            req.flash('message', { error: 1, message: error.message })
                            return res.redirect("/mua-the/checkout")
                        }
                    }
                }
                else {
                    req.flash('message', { error: 1, message: "Hệ thống lỗi: " + getBalanceApi + " vui lòng thử lại" })
                    return res.redirect("/mua-the/checkout")
                }
            }
        }
    }
    else {
        //res.status(502).send('Error 502');
    }
}
PrintView = async (req, res) => {
    var transId = req.params.transId || null
    var cardBuy = await CardBuy.findOne({ transId: transId, uid: req.user._id })
    if (cardBuy) {
        const list = { cardBuy }
        res.render("buycard/print", {  user: req.user, userInfo: req.userInfo, list: list });
    }
    else {
        req.flash('message', { error: 1, message: "Không tìm thấy sản phẩm này" })
        res.redirect("/mua-the")
    }
}
module.exports = { BuyCardView, BuyCard, CheckOutView, ConfirmBuyCard, OderView, HistoryView, PrintView }