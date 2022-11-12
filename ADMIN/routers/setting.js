const SettingController = require("../controllers/settingController")
const router = require('express').Router()

router.get("/",SettingController.SettingView)

router.post("/saveSettingcard",SettingController.SaveSettingApiCard)
router.post("/saveBuyCard",SettingController.SaveApiBuyCard)
router.post("/saveSettingThongbao",SettingController.SaveSettingThongBao)
router.post("/saveListsort",SettingController.SavelistFeeSort)
router.post("/saveListBuyCard",SettingController.SavelistBuyCardSort)
router.post("/saveMain",SettingController.SaveMain)
router.post("/editBuyCard",SettingController.EditBuyCard)
router.post("/deleteBuyCard",SettingController.DeleteBuyCard)

module.exports = router