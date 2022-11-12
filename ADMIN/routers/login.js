const router = require('express').Router()
const authController = require("../controllers/authController")

router.get("/", authController.LoginView)
router.post("/", authController.Login)
router.post("/changepass", authController.ChangePass)

module.exports = router