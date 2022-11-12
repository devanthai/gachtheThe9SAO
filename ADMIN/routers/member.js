const router = require('express').Router()
const memberController = require("../controllers/memberController")

router.get("/", memberController.memberView)
router.post("/setAmount", memberController.setAmount)
router.post("/LockUser", memberController.LockUser)
router.post("/DeleteAccount", memberController.DeleteAccount)
router.post("/login", memberController.Login)

module.exports = router