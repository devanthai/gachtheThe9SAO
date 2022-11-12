const GetListFee = require("../controllers/GetFeeList")
const Setting = require("../modules/Setting")

module.exports = async (req, res) => {


    const listFee = await GetListFee()
    var setting = await Setting.findOne({})
    if (!setting) {
        setting = await new Setting({}).save()
    }
    console.log('Hello');
    res.render("index", { page: "home", user: req.user, userInfo: req.userInfo, fees: listFee ,setting});
}