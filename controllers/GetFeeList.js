
const CardFee = require("../modules/CardFee")
const Setting = require("../modules/Setting")

GetFee = async () => {
    const setting = await Setting.findOne({})
    var cardFee = await CardFee.aggregate([
        {
            $group: {
                _id: "$telco", list: { $push: "$$ROOT" }
            }
        }
    ])
    cardFee.forEach(item => {
        item.list.sort(function (a, b) {
            return parseFloat(a.value) - parseFloat(b.value);
        });
    })
    const listSort = setting.sortFeeCard
    let listFee = []
    listSort.forEach(item => {
        for (const element of cardFee) {
            if (item == element._id) {
                if (item == 'VIETTEL') {
                    element.title = "Viettel"
                }
                else if (item == 'VINAPHONE') {
                    element.title = "Vina"
                }
                else if (item == 'MOBIFONE') {
                    element.title = "Mobifone"
                }
                else if (item == 'VNMB' || item == "VNMOBI") {
                    element.title = "Vietnammobi"
                }
                else {
                    element.title = element._id
                }
                let maxles = element.list[0].fees
                let minless = element.list[0].fees
                for (let iz = 1; iz < element.list.length; iz++) {
                    if (element.list[iz].fees > maxles) {
                        maxles = element.list[iz].fees;
                    }
                    if (element.list[iz].fees < minless) {
                        minless = element.list[iz].fees;
                    }
                }
                element.maxfee = (100 - minless)
                element.minfee = (100 - maxles)
                listFee.push(element)
            }
        }
    })
    console.log(listFee)

    return listFee
}
module.exports = GetFee