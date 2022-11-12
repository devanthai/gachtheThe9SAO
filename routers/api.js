const router = require('express').Router()
const ApiController = require("../controllers/ApiController")
const ApiT9s = require("../controllers/ApiT9s")
const ApiSms = require("../controllers/ApiSms")


router.post("/callbackcard", ApiController.CallBackCard)
router.get("/callbackcard", (req, res) => {
    res.status(502).send("linkcard")
})

router.post("/sms",ApiSms.PostSms)
router.get("/sms",ApiSms.GetSms)

router.post("/t9s/getTransfer",ApiT9s.GetTransfer)
router.post("/t9s/Transfer",ApiT9s.Transfer)
router.post("/t9s/checkTransfer",ApiT9s.CheckTransfer)
router.post("/t9s/checkTransferComment",ApiT9s.CheckTransferComment)

module.exports = router
