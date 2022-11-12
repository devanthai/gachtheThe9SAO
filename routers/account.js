const router = require('express').Router()
const AccountController = require("../controllers/AccountController")
const UserSession = require("../middleware/GetUser") //Middleware Getuser
router.use(UserSession)

//Middleware về đăng nhập nếu chưa đăng nhập
router.use((req, res, next) => {
    if (req.user != null && req.userInfo != null) {
        return next();
    }
    else
    {
        return res.redirect('/auth/login')

    }
})
router.get("/profile", AccountController.ProfileView)
router.get("/profile/edit", AccountController.EditProfileView)
router.post("/profile/edit", AccountController.EditProfile)
router.get("/change-password", AccountController.ChangePasswordView)
router.post("/change-password", AccountController.ChangePassword)
router.get("/security", AccountController.SecurityView)
router.post("/active/Mkc2", AccountController.ActiveMkc2)
router.get("/active/Mkc2", AccountController.ActiveMkc2View)

router.get("/profile/updatemkc2", AccountController.UpdateMkc2View)
router.post("/profile/updatemkc2", AccountController.UpdateMkc2)



module.exports = router