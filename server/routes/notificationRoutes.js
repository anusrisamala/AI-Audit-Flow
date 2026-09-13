const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationsController");
const authMiddleware = require("../middleware/authMiddleware");
const { validate, idParamValidation } = require("../middleware/validateMiddleware");

// Get logged-in user's notifications
router.get(
    "/",
    authMiddleware,
    notificationController.getNotifications
);

// Get unread notification count (bell badge)
router.get(
    "/unread-count",
    authMiddleware,
    notificationController.getUnreadCount
);

// Mark single notification as read
router.put(
    "/read/:id",
    authMiddleware,
    validate(idParamValidation),
    notificationController.markRead
);

// Mark all notifications as read
router.put(
    "/read-all",
    authMiddleware,
    notificationController.markAllRead
);

module.exports = router;