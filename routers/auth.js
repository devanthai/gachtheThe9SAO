const router = require('express').Router()
const Controller = require("../controllers/AuthController") //Controller Authencation
const UserSession = require("../middleware/GetUser") //Middleware Getuser

//Get User Middleware
router.use(UserSession)

//Logout
router.get("/logout", Controller.LogOut)


//Middleware về trang chủ nếu đã đăng nhập
router.use((req, res, next) => {
    if (req.user != null && req.userInfo != null) {
        return res.redirect('/')
    }
    else
    {
        return next();
    }
})

//Các controllers
router.get("/forget", Controller.ForgetPassView)
router.post("/login", Controller.Login)
router.post("/register", Controller.Register)
router.get("/login", Controller.LoginView)
router.get("/register", Controller.RegisterView)
module.exports = router