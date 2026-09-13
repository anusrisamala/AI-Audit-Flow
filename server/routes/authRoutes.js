const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validate, registerSchema, loginSchema } = require("../middleware/validateMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);

module.exports = router;