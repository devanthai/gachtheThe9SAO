const router = require('express').Router()
const UserSession = require("../middleware/GetUser") //Middleware Getuser
const CardChargingController = require("../controllers/CardChargingController")
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

router.get("/",CardChargingController.SearchMiddleware, CardChargingController.GetTransCardHis, CardChargingController.CardChargingView)
router.post("/", CardChargingController.CardCharging)
module.exports = router