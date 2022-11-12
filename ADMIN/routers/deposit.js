const router = require('express').Router()
const depositController = require("../controllers/depositController")

router.get("/gatemoney",depositController.GateMoneyView)
router.post("/gatemoney",depositController.GateMoney)
router.post("/removebank",depositController.RemoveBank)
router.post("/savesettingbank",depositController.SaveChanges)
router.get("/listDeposit",depositController.listDepositView)
router.post("/setsuccessDeposit",depositController.setSuccess)
router.get("/listDepositChuaduyet",depositController.listDepositViewChuaDuyet)
router.get("/listDepositDaduyet",depositController.listDepositViewDaDuyet)

router.post("/saveDepositAuto",depositController.SaveDepositAuto)


module.exports = router