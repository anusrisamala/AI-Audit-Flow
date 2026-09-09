const db = require("../config/db");

const notificationsModel = require("../models/notificationsModel");

// get logged user notifications
// Get logged-in user's notifications
exports.getNotifications = async (req, res) => {

    try {

        const userId = req.user.id;

        if (req.user && (req.user.role || "").toUpperCase() === "AUDITOR") {
            await notificationsModel.checkDueSoonAudits(userId);
        }

        const notifications = await notificationsModel.getNotifications(userId);

        res.json(notifications);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch notifications"
        });

    }

};





// Mark a single notification as read
exports.markRead = async (req, res) => {

    try {

        const { id } = req.params;
        const userId = req.user.id;

        await notificationsModel.markRead(id, userId);

        res.json({
            message: "Notification updated"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update notification"
        });

    }

};



// mark all read

// Mark all notifications as read
exports.markAllRead = async (req, res) => {

    try {

        const userId = req.user.id;

        await notificationsModel.markAllRead(userId);

        res.json({
            message: "All notifications read"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to mark all notifications"
        });

    }

};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {

    try {

        const userId = req.user.id;

        const count = await notificationsModel.getUnreadCount(userId);

        res.json({
            count
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to get unread count"
        });

    }

};

