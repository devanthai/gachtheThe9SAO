const CardListBuy = require("../modules/CardListBuy")
const Setting = require("../modules/Setting")
const md5 = require("md5")

GetListCardBuy = async (CART) => {
    const setting = await Setting.findOne({})
    const cardlist = await CardListBuy.find({})
    const listSort = setting.sortBuyCard
    var listFee = []
    var listIDon = CART.map((item) => item.id);
    listSort.forEach(item => {
        for (let i = 0; i < cardlist.length; i++) {
            const card = cardlist[i]
            if (item == card.card[0].service_code) {
                var zzz = card.card[0].items
                zzz.forEach(element => {
                    if (listIDon.includes(element.id)) {
                        element.active = true
                    }
                    element.row = md5(element.id)
                });
                listFee.push(card)
            }
        }
    })
    return listFee
}
module.exports = GetListCardBuy