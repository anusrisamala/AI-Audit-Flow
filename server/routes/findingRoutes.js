const express = require("express");

const router = express.Router();

const findingController = require("../controllers/findingController");

// router.get("/", findingController.getAllFindings);

// router.get("/:id", findingController.getFindingById);

// router.post("/", findingController.createFinding);

// router.put("/:id", findingController.updateFinding);

// router.delete("/:id", findingController.deleteFinding);
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

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
    findingController.getFindingById
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware("AUDITOR"),
    findingController.createFinding
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("AUDITOR"),
    findingController.updateFinding
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("AUDITOR"),
    findingController.deleteFinding
);

module.exports = router;