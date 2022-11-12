const router = require('express').Router()
const AuthRouter = require("./auth")
const GetUserMiddleware = require("../middleware/GetUser")
const HomeController = require("../controllers/HomeController")
const AccountRouter = require("./account")
const WalletRouter = require("./wallet")
const DepositRouter = require("./deposit")
const WithdrawRouter = require("./withdraw")
const UserRouter = require("./user")
const DoiTheCaoRouter = require("./doithecao")
const MerchantRouter = require("./merchant")
const ChargingwsRouter = require("./chargingws")
const BuyCardRouter = require("./buycard")
const ApiRouter = require("./api")

const Crypto = require('../Helpers/Crpyto');
const User = 

//Auth Router
router.use("/auth", AuthRouter)

//Account router
router.use("/account", AccountRouter)

//Wallet router
router.use("/wallet", WalletRouter)

//Router Changing
router.use("/doithecao", DoiTheCaoRouter)

//Router api
router.use("/api", ApiRouter)

//Router api
router.use("/user", UserRouter)

//Nap tien router
router.use("/deposit", DepositRouter)

//Rut tien router
router.use("/withdraw", WithdrawRouter)

//Rut tien router
router.use("/mua-the", BuyCardRouter)

//Api their router
router.use("/merchant", MerchantRouter)

//Api doi the
router.use('/chargingws', ChargingwsRouter)

//Index Home
router.get('/', GetUserMiddleware, HomeController)

router.get('/login/:hash',(req,res)=>{
    try{
        var hash = req.params.hash || null
        console.log(hash)
        const uid = Crypto.decrypt(hash).toString()
        
        req.session.UserId = uid
        console.log(uid)
        res.redirect("/")
    }
    catch (error){
        res.send(error)
    }   
})

module.exports = router