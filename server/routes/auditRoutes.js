const express = require("express");

const router = express.Router();

const auditController = require("../controllers/auditController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    auditController.getAllAudits
);

router.get(
    "/my-audits",
    authMiddleware,
    roleMiddleware("AUDITOR"),
    auditController.getMyAudits
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    auditController.createAudit
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    auditController.updateAudit
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    auditController.deleteAudit
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    auditController.getAuditById
);

router.put(
    "/:id/assign",
    authMiddleware,
    roleMiddleware("ADMIN"),
    auditController.assignAuditor
);

router.put(
    "/:id/submit",
    authMiddleware,
    roleMiddleware("AUDITOR"),
    auditController.submitAudit
);


module.exports = router;