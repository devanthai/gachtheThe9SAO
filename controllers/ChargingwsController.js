const Merchant = require("../modules/Merchant")
const Card = require("../modules/Card")
const Setting = require("../modules/Setting")
const Helper = require("../Helpers/Helper")
const PostCard = require("../Helpers/PostCard")
const md5 = require('md5');

v2 = async (req, res) => {
    const setting = await Setting.findOne({})
    if (command == "charging") {
        var { telco, code, serial, amount, request_id, partner_id, sign, command } = req.body
        if (Helper.isEmpty(telco) || Helper.isEmpty(code) || Helper.isEmpty(serial) || Helper.isEmpty(amount) || Helper.isEmpty(request_id) || Helper.isEmpty(partner_id) || Helper.isEmpty(sign)) {
            return res.json({ "status": 102, "message": "INPUT_DATA_INCORRECT" })
        }
        else {
            const findMerchant = await Merchant.findOne({ PartnerID: partner_id, status: 1 })
            if (findMerchant) {
                partner_id = setting.apicard.partner_id
                const sign = md5(findMerchant.PartnerKey + code + "charging" + partner_id + request_id + serial + telco)
                if (sign != sign) {
                    return res.json({ "status": 102, "message": "INVALID_SIGNATURE" })
                }
                else {
                    const findCard = await Card.findOne({ request_id: request_id })
                    if(findCard)
                    {
                        return res.json({ "status": 102, "message": "REQUEST_ID_EXISTED" })
                    }
                    else
                    {
                        const postcard = await PostCard(telco, amount, code, serial, setting.apicard.partner_id, setting.apicard.partner_key, setting.apicard.url, request_id)
                        
                    }
                }
            }
            else {
                return res.json({ "status": 102, "message": "MERCHANT_NOT_EXISTED_OR_OFF" })
            }
        }
    }
    else if (command == "check") {

    }
    else {

    }
}
module.exports = { v2 }