const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { validate, idParamValidation } = require("../middleware/validateMiddleware");

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
    validate(idParamValidation),
    reportController.getReportByAuditId
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    validate(idParamValidation),
    reportController.getReportById
);

router.post(
    "/generate/:auditId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(idParamValidation),
    reportController.generateReport
);

router.post(
    "/:id/notify-download",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    validate(idParamValidation),
    reportController.notifyReportDownload
);

module.exports = router;