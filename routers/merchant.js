const router = require('express').Router()
const MerchantController = require("../controllers/MerchantController")
const UserSession = require("../middleware/GetUser") //Middleware Getuser


router.use(UserSession)

//Middleware về đăng nhập nếu chưa đăng nhập
router.use((req, res, next) => {
    if (req.user != null && req.userInfo != null) {
        return next();
    }
    else {
        return res.redirect('/auth/login')

    }
})
router.get("/list", MerchantController.ListView)
router.post("/add", MerchantController.AddMerchant)
router.post("/del/:id", MerchantController.DeleteMerchant)

module.exports = router