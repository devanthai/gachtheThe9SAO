const router = require('express').Router()
const Transfer = require("../modules/Transfer")
const History = require("../modules/History")


const CardFee = require("../modules/CardFee")
const CardListBuy = require("../modules/CardListBuy")
const Setting = require("../modules/Setting")
const withDrawRouter = require("./withdraw")
const depositRouter = require("./deposit")
const settingRouter = require("./setting")
const memberRouter = require("./member")
const loginRouter = require("./login")
const request = require("request")
const md5 = require("md5")

const AdminSession = require("../middleware/CheckAdmin") //Middleware Getuser

router.use("/login", loginRouter)



//Get ADmin Middleware
router.use(AdminSession)

//Middleware về đăng nhập nếu chưa đăng nhập
router.use((req, res, next) => {
    if (req.admin != null) {
        return next();
    }
    else {
        return res.redirect('/login')

    }
})
router.get("/removeHistory", async (req, res) => {
    var transfer = await Transfer.deleteMany({})
    var his = await History.deleteMany({})
    res.send(transfer.toString() + his.toString())
})
router.get("/", async (req, res) => {
    var setting = await Setting.findOne({})
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
    var list = []
    var listSort = setting.sortFeeCard
    for (let i = 0; i < listSort.length; i++) {
        list.push({ name: listSort[i] })
    }
    var listbuycard = []
    var listSortBuycard = setting.sortBuyCard
    for (let i = 0; i < listSortBuycard.length; i++) {
        listbuycard.push({ name: listSortBuycard[i] })
    }


    var cardBuyFees = await CardListBuy.find({})
    res.render("index", { page: "home", fees: cardFee, setting, listsort: JSON.stringify(list), cardBuyFees, listsortcardbuy: JSON.stringify(listbuycard) })
})



router.get("/getFeeCard", async (req, res) => {
    const isSort = req.query.sort
    try {
        const setting = await Setting.findOne({})
        await CardFee.deleteMany({})
        var url = `${setting.apicard.url}/getfee?partner_id=${setting.apicard.partner_id}`
        if (url.includes("naptudong")) {
            url = `${setting.apicard.url.replace("/v2", "")}/price?partner_id=${setting.apicard.partner_id}`
        }

        request.get(url, async function (error, response, body) {
            if (error) {
                res.send(error)
                console.log("loi momo"); return;
            }
            else {
                array = JSON.parse(body)

                if (url.includes("naptudong")) {
                    const keys = Object.keys(array)
                    keys.forEach(async (element) => {
                        let itemz = array[element]
                        itemz.forEach(async (item) => {
                            item.telco = item.telco
                           // delete item["telco_key"]
                            item.value = Math.round(item.value)
                            await CardFee(item).save()
                        })
                    });
                }
                else {
                    if (array.length > 0) {
                        array.forEach(async (element) => {
                            await CardFee(element).save()
                        });
                    }
                }
                var cardFee = await CardFee.aggregate([
                    {
                        $group: {
                            _id: "$telco", list: { $push: "$$ROOT" }
                        }
                    }
                ])
                var arraySort = []
                for (let i = 0; i < cardFee.length; i++) {
                    let name = cardFee[i]._id
                    arraySort.push(name)
                }
                if (isSort != "false") {
                    setting.sortFeeCard = arraySort
                    await setting.save()
                }

                res.redirect("/")
            }
        })
    } catch (err) {
        console.log(err)
        res.send(err)
    }
})
router.get("/getFeeBuyCard", async (req, res) => {
    const isSort = req.query.sort
    try {
        const setting = await Setting.findOne({})
        await CardListBuy.deleteMany({})
        const options = {
            url: setting.apibuycard.url,
            json: true,
            body: {
                partner_id: setting.apibuycard.partner_id,
                command: 'productlist',
                sign: md5(setting.apibuycard.partner_key + setting.apibuycard.partner_id + "productlist")
            }
        };
        request.post(options, async (error, response, body) => {
            if (error) {
                res.send(error)
            }
            else {
                const json = body
                if (json.status == "success") {
                    const data = json.data
                    var idIndex = 0
                    data.forEach(async (element) => {
                        element.items.forEach(async (carddd) => {
                            carddd.id = ++idIndex
                        })
                        var hiTeam = { card: element, id: ++idIndex }
                        await new CardListBuy(hiTeam).save()
                    });
                    const zzzzzz = await CardListBuy.find({})
                    if (data.length != zzzzzz.length) {
                        setTimeout(() => {
                            if (isSort == "false") {
                                res.redirect("/getFeeBuyCard?sort=false")
                            }
                            else {
                                res.redirect("/getFeeBuyCard")
                            }
                        }, 1000)
                    }
                    else {
                        var arraySort = []
                        for (let i = 0; i < zzzzzz.length; i++) {
                            let name = zzzzzz[i].card[0].service_code
                            arraySort.push(name)
                        }

                        if (isSort != "false") {
                            setting.sortBuyCard = arraySort
                            await setting.save()
                        }

                        res.redirect("/")
                    }
                }
                else {
                    res.send(json)
                }
            }
        })
    } catch (err) {
        res.send(err)
    }
})


router.use("/withdraw", withDrawRouter)
router.use("/setting", settingRouter)
router.use("/deposit", depositRouter)
router.use("/member", memberRouter)



module.exports = router
