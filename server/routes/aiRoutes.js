const express = require("express");

const router = express.Router();

const aiController = require("../controllers/aiController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Existing AI Risk Scoring
router.post(
"/risk-score",
authMiddleware,
aiController.riskScore
);

// AI Report Generator (Admin only)
router.post(
"/generate-report/:auditId",
authMiddleware,
roleMiddleware("ADMIN"),
aiController.generateReport
);

module.exports = router;
