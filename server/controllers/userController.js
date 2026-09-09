const userModel = require("../models/userModel");

const getProfile = async (req, res) => {
    try {
        const user = await userModel.getUserById(
            req.user.id
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);

    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getAllAuditors = async (req, res) => {
    try {
        const auditors =
            await userModel.getAllAuditors();

        res.status(200).json(auditors);

    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        await userModel.updateUserProfile(
            req.user.id,
            name.trim(),
            email.trim().toLowerCase()
        );

        const updatedUser = await userModel.getUserById(req.user.id);

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters long"
            });
        }

        await userModel.changeUserPassword(req.user.id, currentPassword, newPassword);

        res.status(200).json({
            message: "Password changed successfully"
        });
    } catch (error) {
        res.status(400).json({
            message: error.message || "Failed to change password"
        });
    }
};

const updateNotificationPreferences = async (req, res) => {
    try {
        const { notify_audits, notify_findings, notify_reports, notify_registrations } = req.body;

        const updatedUser = await userModel.updateNotificationPreferences(req.user.id, {
            notify_audits: notify_audits !== undefined ? Boolean(notify_audits) : true,
            notify_findings: notify_findings !== undefined ? Boolean(notify_findings) : true,
            notify_reports: notify_reports !== undefined ? Boolean(notify_reports) : true,
            notify_registrations: notify_registrations !== undefined ? Boolean(notify_registrations) : true,
        });

        res.status(200).json({
            message: "Notification preferences updated successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Failed to update notification preferences"
        });
    }
};

module.exports = {
    getProfile,
    getAllAuditors,
    updateProfile,
    changePassword,
    updateNotificationPreferences
};