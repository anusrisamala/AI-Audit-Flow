const reportModel = require("../models/reportModel");
const auditModel = require("../models/auditModel");
const findingModel = require("../models/findingModel");
const notificationsModel = require("../models/notificationsModel");
const userModel = require("../models/userModel");

const getAllReports = async (req, res) => {
    try {
        const reports = await reportModel.getAllReports();

        res.status(200).json(reports);
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getReportByAuditId = async (req, res) => {
    try {
        const auditId = req.params.auditId;

        const audit = await auditModel.getAuditById(auditId);
        if (!audit) {
            return res.status(404).json({
                success: false,
                message: "Audit not found"
            });
        }

        if ((req.user.role || "").toUpperCase() === "AUDITOR" && Number(audit.assigned_to) !== Number(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not assigned to this audit report."
            });
        }

        const report = await reportModel.getReportByAuditId(auditId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found for this audit"
            });
        }

        res.status(200).json(report);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error fetching report"
        });
    }
};

const getReportById = async (req, res) => {

    try {

        const { id } = req.params;

        const report = await reportModel.getReportById(id);

        if (!report) {
            return res.status(404).json({
                message: "Report not found"
            });
        }

        if ((req.user.role || "").toUpperCase() === "AUDITOR") {
            const audit = await auditModel.getAuditById(report.audit_id);
            if (!audit || Number(audit.assigned_to) !== Number(req.user.id)) {
                return res.status(403).json({
                    message: "Access denied. You are not assigned to this audit report."
                });
            }
        }

        res.status(200).json(report);

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const createReport = async (req, res) => {

    try {

        const {
            audit_id,
            summary,
            overall_risk,
            generated_date
        } = req.body;

        const reportId = await reportModel.createReport(
            audit_id,
            summary,
            overall_risk,
            generated_date
        );

        res.status(201).json({
            message: "Report created successfully",
            id: reportId
        });

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const updateReport = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            audit_id,
            summary,
            overall_risk,
            generated_date
        } = req.body;

        const updated = await reportModel.updateReport(
            id,
            audit_id,
            summary,
            overall_risk,
            generated_date
        );

        if (!updated) {
            return res.status(404).json({
                message: "Report not found"
            });
        }

        res.status(200).json({
            message: "Report updated successfully"
        });

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const deleteReport = async (req, res) => {

    try {

        const { id } = req.params;

        const deleted = await reportModel.deleteReport(id);

        if (!deleted) {
            return res.status(404).json({
                message: "Report not found"
            });
        }

        res.status(200).json({
            message: "Report deleted successfully"
        });

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const generateReport = async (req, res) => {
    try {

        const auditId = Number(req.params.auditId);

        // Check audit exists
        const audit = await auditModel.getAuditById(auditId);

        if (!audit) {
            return res.status(404).json({
                message: "Audit not found"
            });
        }

        // Allow report generation only for completed audits
        if (audit.status !== "COMPLETED") {
            return res.status(400).json({
                message: "Report can only be generated after the audit is completed."
            });
        }

        // Get audit findings
        const findings = await findingModel.getFindingsByAudit(auditId);

        if (findings.length === 0) {
            return res.status(400).json({
                message: "Cannot generate report because no findings exist."
            });
        }

        // Generate summary
        const critical = findings.filter(f => (f.risk_level || "").toUpperCase() === "CRITICAL").length;
        const high = findings.filter(f => (f.risk_level || "").toUpperCase() === "HIGH").length;
        const medium = findings.filter(f => (f.risk_level || "").toUpperCase() === "MEDIUM").length;
        const low = findings.filter(f => (f.risk_level || "").toUpperCase() === "LOW").length;

        const summary =
`The audit identified ${findings.length} findings, including ${critical} Critical, ${high} High, ${medium} Medium, and ${low} Low risk findings. Immediate remediation is recommended for Critical and High risk issues.`;

        // Calculate overall risk
        let overallRisk = "LOW";

        if (findings.some(f => (f.risk_level || "").toUpperCase() === "CRITICAL")) {
            overallRisk = "CRITICAL";
        }
        else if (findings.some(f => (f.risk_level || "").toUpperCase() === "HIGH")) {
            overallRisk = "HIGH";
        }
        else if (findings.some(f => (f.risk_level || "").toUpperCase() === "MEDIUM")) {
            overallRisk = "MEDIUM";
        }

        const generatedDate = new Date();

        // Check whether report already exists
        const existingReport =
            await reportModel.getReportByAuditId(auditId);

        let reportId;

        if (existingReport) {

            await reportModel.updateReport(
                existingReport.id,
                auditId,
                summary,
                overallRisk,
                generatedDate
            );

            reportId = existingReport.id;

        } else {

            reportId = await reportModel.createReport(
                auditId,
                summary,
                overallRisk,
                generatedDate
            );
        }

        return res.status(200).json({
            message: existingReport
                ? "Report updated successfully."
                : "Report generated successfully.",
            reportId
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to generate report."
        });
    }
};

const notifyReportDownload = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await reportModel.getReportById(id);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        const auditTitle = report.audit?.title || "Audit";
        const admins = await userModel.getAdmins();
        const adminsToNotify = new Set();
        if (report.audit?.created_by) adminsToNotify.add(Number(report.audit.created_by));
        for (const admin of admins) {
            adminsToNotify.add(Number(admin.id));
        }

        for (const adminId of adminsToNotify) {
            await notificationsModel.createNotification({
                user_id: adminId,
                title: "Report Generated",
                message: `PDF report for audit "${auditTitle}" has been generated and saved.`,
                type: "REPORT_GENERATED",
                reference_id: report.audit_id || report.id
            });
        }

        res.status(200).json({ message: "Report download notification sent" });
    } catch (error) {
        console.error("Notify report download error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllReports,
    getReportByAuditId,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    notifyReportDownload
};