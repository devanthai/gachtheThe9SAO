const router = require('express').Router()
const ChargingwsController = require("../controllers/ChargingwsController")
router.get("/v2", (req, res) => {
    res.send("f")
})
router.post("/v2", ChargingwsController.v2)

module.exports = router