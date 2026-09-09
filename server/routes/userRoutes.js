const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    userController.getProfile
);

router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    userController.updateProfile
);

router.put(
    "/change-password",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    userController.changePassword
);

router.put(
    "/notification-preferences",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    userController.updateNotificationPreferences
);

router.get(
    "/auditors",
    authMiddleware,
    roleMiddleware("ADMIN"),
    userController.getAllAuditors
);

module.exports = router;