const Setting = require("../modules/Setting")
const CardListBuy = require("../modules/CardListBuy")
SaveSettingApiCard = async (req, res) => {
    try {
        const setting = await Setting.findOneAndUpdate({}, { apicard: req.body })
        res.send({ message: "Lưu api thành công " })
    } catch (err) {
        res.send({ message: "Lưu api thất bại lỗi " + err })
    }
}

SaveApiBuyCard = async (req, res) => {
    try {

        const setting = await Setting.findOneAndUpdate({}, { apibuycard: req.body })
        res.send({ message: "Lưu api thành công " })
    } catch (err) {
        res.send({ message: "Lưu api thất bại lỗi " + err })
    }
}


SaveSettingThongBao = async (req, res) => {
    try {
        const setting = await Setting.findOneAndUpdate({}, { thongbao: req.body.thongbao })
        res.send({ message: "Lưu api thành công " })
    } catch (err) {
        res.send({ message: "Lưu api thất bại lỗi " + err })
    }
}
SettingView = async (req, res) => {
    const setting = await Setting.findOne({})
    res.render("index", { page: "pages/settingview", setting })
}
SaveMain = async (req, res) => {
    const title = req.body.title
    try {
        var setting = await Setting.findOneAndUpdate({}, { title: title })
        res.send({ message: "Lưu main thành công" })
    } catch (err) {
        res.send({ message: "Lưu main thất bại lỗi " + err })
    }
}
SavelistFeeSort = async (req, res) => {
    try {
        var listFee = []
        var zzz = JSON.parse(req.body.listFeeSort)
        zzz.forEach(item => {
            listFee.push(item.name)
        });
        const setting = await Setting.findOneAndUpdate({}, { sortFeeCard: listFee })
        res.send({ message: "Lưu sapxep thành công " })
    } catch (err) {
        res.send({ message: "Lưu sapxep thất bại lỗi " + err })
    }
}
SavelistBuyCardSort = async (req, res) => {
    try {
        var listFee = []
        var zzz = JSON.parse(req.body.listFeeSort)
        zzz.forEach(item => {
            listFee.push(item.name)
        });
        const setting = await Setting.findOneAndUpdate({}, { sortBuyCard: listFee })
        res.send({ message: "Lưu sapxep thành công " })
    } catch (err) {
        res.send({ message: "Lưu sapxep thất bại lỗi " + err })
    }
}


EditBuyCard = async (req, res) => {
    const { id, loai, fee } = req.body
    var cardBuy = await CardListBuy.findOne({ "card.items.id": Number(id) })
    if (cardBuy) {
        cardBuy.card[0].items.forEach(item => {
            if (item.id == Number(id)) {
                item.discount = fee
            }
        })
        if (loai != undefined) {
            cardBuy.type = loai
        }
        await cardBuy.save()
        await CardListBuy.findOneAndUpdate({ id: cardBuy.id }, { "card": cardBuy.card[0] })
        res.send({ message: "Lưu card thành công " })
    }
    else {
        res.send({ message: "Lưu card that bai " })
    }
}

DeleteBuyCard = async (req, res) => {
    const { id } = req.body
    var cardBuy = await CardListBuy.findOne({ "card.items.id": Number(id) })
    if (cardBuy) {

        for (let i = 0; i < cardBuy.card[0].items.length; i++) {
            if (cardBuy.card[0].items[i].id == Number(id)) {
                cardBuy.card[0].items.splice(i, 1);
            }
        }
        await CardListBuy.findOneAndUpdate({ id: cardBuy.id }, { "card": cardBuy.card[0] })
        res.send({error:0, message: "Xoa card thành công " })
    }
    else {
        res.send({error:1, message: "Xoa card that bai " })
    }
}
module.exports = { SaveSettingApiCard, SettingView, SaveSettingThongBao, SavelistFeeSort, SaveMain, SaveApiBuyCard, SavelistBuyCardSort, EditBuyCard, DeleteBuyCard }