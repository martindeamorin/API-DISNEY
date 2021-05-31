const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/login", authMiddleware.loginValidation, authController.login)
router.post("/register", authMiddleware.registerValidation, authController.register)

module.exports = router;