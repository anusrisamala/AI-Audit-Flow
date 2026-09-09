const express = require("express");

const router = express.Router();

const reportController = require("../controllers/reportController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    reportController.getAllReports
);

router.get(
    "/audit/:auditId",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    reportController.getReportByAuditId
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    reportController.getReportById
);

router.post(
    "/generate/:auditId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    reportController.generateReport
);

router.post(
    "/:id/notify-download",
    authMiddleware,
    roleMiddleware("ADMIN"),
    reportController.notifyReportDownload
);

module.exports = router;