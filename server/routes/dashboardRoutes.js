const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
    "/admin",
    authMiddleware,
    roleMiddleware("ADMIN"),
    dashboardController.getAdminDashboard
);

router.get(
    "/auditor",
    authMiddleware,
    roleMiddleware("AUDITOR"),
    dashboardController.getAuditorDashboard
);

module.exports = router;