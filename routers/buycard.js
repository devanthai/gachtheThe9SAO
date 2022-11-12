const router = require('express').Router()
const BuyCardController = require("../controllers/BuyCardController")

const UserSession = require("../middleware/GetUser") //Middleware Getuser

//Get User Middleware
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

router.get("/",BuyCardController.BuyCardView)
router.post("/",BuyCardController.BuyCard)
router.get("/checkout",BuyCardController.CheckOutView)
router.get("/history",BuyCardController.HistoryView)
router.get("/oder/:transId",BuyCardController.OderView)
router.get("/print/:transId",BuyCardController.PrintView)
router.post("/confirm",BuyCardController.ConfirmBuyCard)
module.exports = router