const dashboardModel = require("../models/dashboardModel");

const getAdminDashboard = async (req, res) => {
    try {

        const dashboardData = await dashboardModel.getAdminDashboard();

        return res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {

        console.error("Admin Dashboard Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


const getAuditorDashboard = async (req, res) => {

    try {

        const auditorId = req.user.id;

        const dashboardData = await dashboardModel.getAuditorDashboard(auditorId);

        return res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {

        console.error("Auditor Dashboard Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


module.exports = {
    getAdminDashboard,
    getAuditorDashboard
};