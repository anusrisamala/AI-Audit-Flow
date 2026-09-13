const express = require("express");
const router = express.Router();
const findingController = require("../controllers/findingController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
    validate,
    idParamValidation,
    createFindingSchema,
    updateFindingSchema,
} = require("../middleware/validateMiddleware");

router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    findingController.getAllFindings
);

router.get(
    "/audit/:auditId",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    validate(idParamValidation),
    findingController.getFindingsByAudit
);

router.get(
    "/my",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    findingController.getMyFindings
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    validate(idParamValidation),
    findingController.getFindingById
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware("AUDITOR"),
    validate(createFindingSchema),
    findingController.createFinding
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    validate(updateFindingSchema),
    findingController.updateFinding
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "AUDITOR"),
    validate(idParamValidation),
    findingController.deleteFinding
);

module.exports = router;