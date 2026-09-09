
const db = require("../config/db");
const { analyzeFinding, generateAuditReport } = require("../utils/aiService");
const notificationsModel = require("../models/notificationsModel");
const userModel = require("../models/userModel");

// Existing AI Risk Scoring
exports.riskScore = async (req, res) => {
try {
const { title, description, department } = req.body;


if (!title || !description || !department) {
  return res.status(400).json({
    message: "Title, description and department are required",
  });
}

const data = await analyzeFinding(title, description, department);

return res.json({
  risk: data.risk,
  confidence: data.confidence,
  reason: data.reason,
  recommendation: data.recommendation,
});


} catch (error) {
console.error("AI Risk Error:", error);


return res.status(500).json({
  message: "AI analysis failed",
  error: error.message,
});


}
};

// NEW: AI Report Generator
exports.generateReport = async (req, res) => {
try {
const auditId = req.params.auditId;


// 1. Get audit details
const [auditRows] = await db.query(
  `SELECT
     id,
     title,
     department,
     status,
     start_date,
     due_date,
     assigned_to,
     created_by
   FROM audits
   WHERE id = ?`,
  [auditId]
);

if (auditRows.length === 0) {
  return res.status(404).json({
    message: "Audit not found",
  });
}

const audit = auditRows[0];

if (audit.status !== "COMPLETED") {
  return res.status(400).json({
    message: "AI report can only be generated for completed audits.",
  });
}

// 2. Get findings
const [findingRows] = await db.query(
  `SELECT
     title,
     description,
     risk_level,
     recommendation
   FROM findings
   WHERE audit_id = ?`,
  [auditId]
);

// 3. Prepare data for AI
const auditData = {
  ...audit,
  findings: findingRows,
};

// 4. Generate AI report
const aiReport = await generateAuditReport(auditData);

// 5. Save AI report into reports table (Upsert)
const [existingReportRows] = await db.query(
  `SELECT id FROM reports WHERE audit_id = ?`,
  [auditId]
);

if (existingReportRows.length > 0) {
  await db.query(
    `UPDATE reports
     SET
       ai_summary = ?,
       ai_observations = ?,
       ai_recommendations = ?,
       ai_priority_actions = ?,
       ai_generated = TRUE,
       ai_generated_at = NOW()
     WHERE audit_id = ?`,
    [
      aiReport.executiveSummary || null,
      JSON.stringify(aiReport.keyRisks || []),
      JSON.stringify(aiReport.recommendations || []),
      aiReport.conclusion || null,
      auditId,
    ]
  );
} else {
  const critical = findingRows.filter(f => (f.risk_level || "").toUpperCase() === "CRITICAL").length;
  const high = findingRows.filter(f => (f.risk_level || "").toUpperCase() === "HIGH").length;
  const medium = findingRows.filter(f => (f.risk_level || "").toUpperCase() === "MEDIUM").length;
  const low = findingRows.filter(f => (f.risk_level || "").toUpperCase() === "LOW").length;

  let overallRisk = "LOW";
  if (critical > 0) overallRisk = "CRITICAL";
  else if (high > 0) overallRisk = "HIGH";
  else if (medium > 0) overallRisk = "MEDIUM";

  const summary = `The audit identified ${findingRows.length} findings, including ${critical} Critical, ${high} High, ${medium} Medium, and ${low} Low risk findings. Immediate remediation is recommended for Critical and High risk issues.`;

  await db.query(
    `INSERT INTO reports
     (audit_id, summary, overall_risk, generated_date, ai_summary, ai_observations, ai_recommendations, ai_priority_actions, ai_generated, ai_generated_at)
     VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, TRUE, NOW())`,
    [
      auditId,
      summary,
      overallRisk,
      aiReport.executiveSummary || null,
      JSON.stringify(aiReport.keyRisks || []),
      JSON.stringify(aiReport.recommendations || []),
      aiReport.conclusion || null,
    ]
  );
}

const recipients = new Set();
if (audit.assigned_to) recipients.add(Number(audit.assigned_to));
if (audit.created_by) recipients.add(Number(audit.created_by));

try {
  const admins = await userModel.getAdmins();
  for (const admin of admins) {
    if (admin.id) recipients.add(Number(admin.id));
  }
} catch (adminErr) {
  console.error("Fetch admins error:", adminErr);
}

for (const userId of recipients) {
  try {
    await notificationsModel.createNotification({
      user_id: userId,
      title: "AI Report Generated",
      message: `AI Executive Summary and analysis have been generated for audit "${audit.title}".`,
      type: "AI_REPORT_GENERATED",
      reference_id: auditId,
    });
  } catch (notifErr) {
    console.error("AI report notification error:", notifErr);
  }
}

// 6. Return response
return res.json({
  message: "AI report generated successfully",
  data: aiReport,
});


} catch (error) {
console.error("AI Report Error:", error);


return res.status(500).json({
  message: "AI report generation failed",
  error: error.message,
});


}
};
