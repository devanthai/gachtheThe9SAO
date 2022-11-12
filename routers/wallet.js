const router = require('express').Router()
const rateLimit = require('express-rate-limit')


const WalletController = require("../controllers/WalletController")

const UserSession = require("../middleware/GetUser") //Middleware Getuser

const limitOder = rateLimit({
    windowMs: 5000, // 1 minit
    max: 1, // Limit each IP to 5 create account requests per `window` (here, per hour)
    message: `spaming`,
    handler: (request, response, next, options) => { request.isSpam = true, next() },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

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
//Get name by username
router.post("/transfer/get-user-name", WalletController.GetUsername)

//viewTradeId
router.get("/transfer/result/:transid", WalletController.TransferResult)


//history view
router.get("/history", WalletController.GetHistoryData, WalletController.SearchHistoryMiddleware, WalletController.HistoryView)

//transget
router.get("/transfer", WalletController.GetDataTranhis, WalletController.TransferView)

//transpost
router.post("/transfer", limitOder, WalletController.Transfer)

//transConfirm
router.post("/transfer/confirm", WalletController.TransferConfirm)



//List wallet view
router.get("/list", WalletController.ListView)
module.exports = router
