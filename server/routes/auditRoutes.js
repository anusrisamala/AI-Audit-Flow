const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
    validate,
    idParamValidation,
    createAuditSchema,
    updateAuditSchema,
    assignAuditorSchema,
} = require("../middleware/validateMiddleware");

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
    validate(createAuditSchema),
    auditController.createAudit
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(updateAuditSchema),
    auditController.updateAudit
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(idParamValidation),
    auditController.deleteAudit
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    validate(idParamValidation),
    auditController.getAuditById
);

router.put(
    "/:id/assign",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(assignAuditorSchema),
    auditController.assignAuditor
);

router.put(
    "/:id/submit",
    authMiddleware,
    roleMiddleware("AUDITOR"),
    validate(idParamValidation),
    auditController.submitAudit
);

module.exports = router;