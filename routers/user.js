const router = require('express').Router()
const UserSession = require("../middleware/GetUser") //Middleware Getuser

const UserController = require("../controllers/UserController")

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
router.get("/localbank",UserController.AddBankView)
router.post("/localbank",UserController.AddBankPost)
router.post("/localbank/del/:id",UserController.DeleteBank)

module.exports = router
