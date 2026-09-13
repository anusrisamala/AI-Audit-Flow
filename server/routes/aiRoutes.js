const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { validate, idParamValidation, aiRiskScoreSchema } = require("../middleware/validateMiddleware");
const { aiLimiter } = require("../middleware/rateLimitMiddleware");

// AI Risk Scoring
router.post(
    "/risk-score",
    authMiddleware,
    aiLimiter,
    validate(aiRiskScoreSchema),
    aiController.riskScore
);

// AI Report Generator (Admin only)
router.post(
    "/generate-report/:auditId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    aiLimiter,
    validate(idParamValidation),
    aiController.generateReport
);

module.exports = router;
