const router = require('express').Router()
const DepositController = require("../controllers/DepositController")

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


//Nap tien view
router.get("/", DepositController.DepositView) 


//Nap tien Post
router.post("/", DepositController.Deposit) 

//Nap tien Checkout
router.get("/checkout/:transid", DepositController.CheckOutView) 

//Nap tien cancle
router.get("/cancel/:transid", DepositController.CancelOder) 



//Checkout post
router.post("/checkout", DepositController.CheckOut) 


module.exports = router
