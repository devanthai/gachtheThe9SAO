const md5 = require("md5")
const UserInfo = require("../modules/User/UserInfo")
const Helper = require("../Helpers/Helper")
const User = require("../modules/User/User")



GetSms = async (req, res) => {
    var { id, phone, shortcode, gateway, sms, checksum } = req.query


    console.log(req.query)
    console.log(md5("xxxxxxxxxx" + id + phone + shortcode + sms))


    var noidung = Buffer.from(sms, "hex").toString('utf8')

    const crackPhone = Helper.phoneCrack(phone)
    if (crackPhone != null) {
        phone = crackPhone.phone
    }

    if (noidung.toLowerCase() == "t9s mk") {
        var findUserInfoViaPhone = await UserInfo.findOne({ phone: phone })
        if (findUserInfoViaPhone) {
            var findUser = await User.findOne({ _id: findUserInfoViaPhone.uid })
            if (findUser) {
                const passRan = Helper.getRandomPass()
                findUser.Password = Helper.generateHash(passRan)
                findUser.save()
                res.send("THE9SAO - Mat khau moi cua ban la: " + passRan)

            }
            else {
                res.send("THE9SAO - Khong tim thay thanh vien nay")
            }
        }
        else {
            res.send("THE9SAO - Khong tim thay thanh vien nay")
        }
    }
    else if (noidung.toLowerCase() == "t9s mkc2") {
        var findUserInfoViaPhone = await UserInfo.findOne({ phone: phone })
        if (findUserInfoViaPhone) {
            var findUser = await User.findOne({ _id: findUserInfoViaPhone.uid })
            if (findUser) {
                const passRan = Helper.getRandomPass()
                findUser.PasswordLevel2 = Helper.generateHash(passRan)
                findUser.save()
                res.send("THE9SAO - Mat khau cap 2 moi cua ban la: " + passRan)
            }
            else {
                res.send("THE9SAO - Khong tim thay thanh vien nay")
            }
        }
        else {
            res.send("THE9SAO - Khong tim thay thanh vien nay")
        }
    }
    else
    {
        res.send("THE9SAO - Noi dung khong hop le")
    }
}
PostSms = (req, res) => {

}
module.exports = { GetSms, PostSms }