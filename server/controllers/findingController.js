const findingModel = require("../models/findingModel");
const auditModel = require("../models/auditModel");
const userModel = require("../models/userModel");
const notificationsModel = require("../models/notificationsModel");
const { analyzeFinding } = require("../utils/aiService");

const getAllFindings = async (req, res) => {
  try {
    const findings = await findingModel.getAllFindings();

    res.status(200).json(findings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getFindingsByAudit = async (req, res) => {
  try {
    const auditId = req.params.auditId;

    const audit = await auditModel.getAuditById(auditId);
    if (!audit) {
      return res.status(404).json({
        success: false,
        message: "Audit not found",
      });
    }

    if ((req.user.role || "").toUpperCase() === "AUDITOR" && Number(audit.assigned_to) !== Number(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not assigned to this audit.",
      });
    }

    const findings = await findingModel.getFindingsByAudit(auditId);

    res.status(200).json({
      success: true,
      count: findings.length,
      data: findings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching findings",
    });
  }
};

const getMyFindings = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let findings;

    if (role === "ADMIN") {
      // admin sees everything
      findings = await findingModel.getAllFindings();
    } else {
      // auditor sees only assigned audits' findings
      findings = await findingModel.getFindingsByUser(userId);
    }

    res.status(200).json({
      success: true,
      count: findings.length,
      data: findings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching my findings",
    });
  }
};

const getFindingById = async (req, res) => {
  try {
    const { id } = req.params;

    const finding = await findingModel.getFindingById(id);

    if (finding.length === 0) {
      return res.status(404).json({
        message: "Finding not found",
      });
    }

    if ((req.user.role || "").toUpperCase() === "AUDITOR") {
      const audit = await auditModel.getAuditById(finding[0].audit_id);
      if (!audit || Number(audit.assigned_to) !== Number(req.user.id)) {
        return res.status(403).json({
          message: "Access denied. You are not assigned to this audit.",
        });
      }
    }

    res.status(200).json(finding[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createFinding = async (req, res) => {
  try {
    const {
      audit_id,
      title,
      description,
      risk_level,
      recommendation,

      ai_risk_level,
      ai_confidence,
      ai_reason,
      ai_recommendation
    } = req.body;

    const audit = await auditModel.getAuditById(audit_id);
    if (!audit) {
      return res.status(404).json({
        message: "Audit not found",
      });
    }

    if ((req.user.role || "").toUpperCase() === "AUDITOR" && Number(audit.assigned_to) !== Number(req.user.id)) {
      return res.status(403).json({
        message: "Access denied. You can only add findings to your assigned audits.",
      });
    }

    const finding = await findingModel.createFinding(
      audit_id,
      title,
      description,
      risk_level,
      recommendation,

      ai_risk_level,
      ai_confidence,
      ai_reason,
      ai_recommendation
    );

    // Notify Audit Admin if finding is Critical or High Risk
    const normRisk = (risk_level || "").toUpperCase();
    if (normRisk === "CRITICAL" || normRisk === "HIGH") {
      try {
        const adminsToNotify = new Set();
        if (audit.created_by) {
          adminsToNotify.add(Number(audit.created_by));
        }
        const admins = await userModel.getAdmins();
        for (const admin of admins) {
          adminsToNotify.add(Number(admin.id));
        }

        for (const adminId of adminsToNotify) {
          await notificationsModel.createNotification({
            user_id: adminId,
            title: `${risk_level} Risk Finding Alert`,
            message: `${risk_level} risk finding "${title}" was logged in audit "${audit.title}".`,
            type: "HIGH_RISK_FINDING",
            reference_id: audit_id,
          });
        }
      } catch (notifErr) {
        console.error("High risk finding notification error:", notifErr);
      }
    }

    res.status(201).json({
      message: "Finding created successfully",
      finding,
    });


  } catch (error) {

    if (error.message === "AUDIT_SUBMITTED") {
      return res.status(403).json({
        message:
          "Audit has already been submitted. You cannot create findings.",
      });
    }


    if (error.message === "AUDIT_NOT_FOUND") {
      return res.status(404).json({
        message: "Audit not found",
      });
    }


    res.status(500).json({
      message: error.message,
    });
  }
};
const updateFinding = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user.id;
    const userRole = req.user.role;

    const {
      title,
      description,
      risk_level,
      recommendation,
      ai_risk_level,
      ai_confidence,
      ai_reason,
      ai_recommendation
    } = req.body;

    const result = await findingModel.updateFinding(
      id,
      title,
      description,
      risk_level,
      recommendation,
      ai_risk_level,
      ai_confidence,
      ai_reason,
      ai_recommendation,
      userId,
      userRole
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({
        message: "You are not allowed to update this finding",
      });
    }

    res.status(200).json({
      message: "Finding updated successfully",
    });
  } catch (error) {
    if (error.message === "AUDIT_SUBMITTED") {
      return res.status(403).json({
        message: "Audit has already been submitted. You cannot edit findings.",
      });
    }

    if (error.message === "FINDING_NOT_FOUND") {
      return res.status(404).json({
        message: "Finding not found",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteFinding = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const result = await findingModel.deleteFinding(id, userId, userRole);

    if (result.affectedRows === 0) {
      return res.status(403).json({
        message: "You are not allowed to delete this finding",
      });
    }

    res.status(200).json({
      message: "Finding deleted successfully",
    });
  } catch (error) {
    if (error.message === "AUDIT_SUBMITTED") {
      return res.status(403).json({
        message:
          "Audit has already been submitted. You cannot delete findings.",
      });
    }

    if (error.message === "FINDING_NOT_FOUND") {
      return res.status(404).json({
        message: "Finding not found",
      });
    }
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAllFindings,
  getMyFindings,
  getFindingById,
  createFinding,
  updateFinding,
  deleteFinding,
  getFindingsByAudit,
};
