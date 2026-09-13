const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
    validate,
    updateProfileSchema,
    changePasswordSchema,
    notificationPreferencesSchema,
} = require("../middleware/validateMiddleware");

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
    validate(updateProfileSchema),
    userController.updateProfile
);

router.put(
    "/change-password",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    validate(changePasswordSchema),
    userController.changePassword
);

router.put(
    "/notification-preferences",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    validate(notificationPreferencesSchema),
    userController.updateNotificationPreferences
);

router.get(
    "/auditors",
    authMiddleware,
    roleMiddleware("ADMIN"),
    userController.getAllAuditors
);

module.exports = router;