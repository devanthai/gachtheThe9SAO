const router = require('express').Router()

const WithdrawController = require("../controllers/WithdrawController")

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

router.get("/",WithdrawController.WithDrawView)
router.post("/",WithdrawController.WithDrawPost)

module.exports = router
