const auditModel = require("../models/auditModel");
const userModel = require("../models/userModel");
const notificationsModel = require("../models/notificationsModel");
const findingModel = require("../models/findingModel");

const getAllAudits = async (req, res) => {

    try {

        const audits = await auditModel.getAllAudits();

        res.status(200).json(audits);

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getMyAudits = async (req, res) => {
    try {

        const audits = await auditModel.getAuditsByAuditor(
            req.user.id
        );

        res.status(200).json(audits);

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const createAudit = async (req, res) => {
    try {

        const {
            title,
            department,
            description,
            start_date,
            due_date,
            assigned_to
        } = req.body;


        if (!title || !department) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing"
            });
        }


        if (start_date && due_date && new Date(due_date) < new Date(start_date)) {
            return res.status(400).json({
                success: false,
                message: "Due date cannot be earlier than start date"
            });
        }

        if (assigned_to) {
            const assignedUser = await userModel.getUserById(assigned_to);
            if (!assignedUser || assignedUser.role !== "AUDITOR") {
                return res.status(400).json({
                    success: false,
                    message: "Selected user is not a valid auditor"
                });
            }
        }

        // 1. Create audit
        const result = await auditModel.createAudit({
            title,
            department,
            description,
            start_date,
            due_date,
            created_by: req.user.id,
            assigned_to
        });


        // 2. Create notification for assigned auditor
        if (assigned_to) {
            try {
                await notificationsModel.createNotification({
                    user_id: assigned_to,
                    title: "New Audit Assigned",
                    message: `You have been assigned audit "${title}".`,
                    type: "AUDIT_ASSIGNED",
                    reference_id: result.insertId
                });
            } catch (notifErr) {
                console.error("Create audit notification error:", notifErr);
            }
        }


        res.status(201).json({
            success: true,
            message: "Audit created successfully",
            auditId: result.insertId
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

const updateAudit = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            title,
            department,
            description,
            start_date,
            due_date,
            status,
            assigned_to
        } = req.body;

        if (assigned_to) {
            const assignedUser = await userModel.getUserById(assigned_to);
            if (!assignedUser || assignedUser.role !== "AUDITOR") {
                return res.status(400).json({
                    message: "Selected assigned user is not a valid auditor"
                });
            }
        }

        if (start_date && due_date && new Date(due_date) < new Date(start_date)) {
            return res.status(400).json({
                message: "Due date cannot be earlier than start date"
            });
        }

        const result = await auditModel.updateAudit(id, {
            title,
            department,
            description,
            start_date,
            due_date,
            status,
            assigned_to
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Audit not found"
            });
        }

        res.status(200).json({
            message: "Audit updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const deleteAudit = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await auditModel.deleteAudit(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Audit not found"
            });
        }

        res.status(200).json({
            message: "Audit deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
const getAuditById = async (req, res) => {

    try {

        const audit = await auditModel.getAuditById(
            req.params.id
        );

        if (!audit) {
            return res.status(404).json({
                message: "Audit not found"
            });
        }

        if ((req.user.role || "").toUpperCase() === "AUDITOR" && Number(audit.assigned_to) !== Number(req.user.id)) {
            return res.status(403).json({
                message: "Access denied. You are not assigned to this audit."
            });
        }

        res.status(200).json(audit);

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const assignAuditor = async (req, res) => {

    try {

        const { assigned_to } = req.body;


        // Check whether user exists
        const user = await userModel.getUserById(assigned_to);


        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        // Check auditor role
        if (user.role !== "AUDITOR") {
            return res.status(400).json({
                message: "Selected user is not an auditor"
            });
        }


        // Update audit assignment
        const updated = await auditModel.assignAuditor(
            req.params.id,
            assigned_to
        );


        if (updated === 0) {
            return res.status(404).json({
                message: "Audit not found"
            });
        }


        // Create notification
        try {
            const auditInfo = await auditModel.getAuditById(req.params.id);
            await notificationsModel.createNotification({
                user_id: assigned_to,
                title: "New Audit Assigned",
                message: `You have been assigned audit "${auditInfo ? auditInfo.title : "Audit"}".`,
                type: "AUDIT_ASSIGNED",
                reference_id: req.params.id
            });
        } catch (notifErr) {
            console.error("Assign auditor notification error:", notifErr);
        }

        res.status(200).json({
            message: "Auditor assigned successfully"
        });

    } catch (error) {

        console.error("Assign Auditor Error:", error);

        res.status(500).json({
            message: error.message
        });

    }
};

const submitAudit = async (req, res) => {

    try {

        const existingAudit = await auditModel.getAuditById(req.params.id);

        if (!existingAudit) {
            return res.status(404).json({
                message: "Audit not found"
            });
        }

        if (existingAudit.status === "COMPLETED") {
            return res.status(400).json({
                message: "Audit has already been submitted and completed."
            });
        }

        if ((req.user.role || "").toUpperCase() === "AUDITOR" && Number(existingAudit.assigned_to) !== Number(req.user.id)) {
            return res.status(403).json({
                message: "Access denied. You can only submit audits assigned to you."
            });
        }

        const findings = await findingModel.getFindingsByAudit(req.params.id);
        if (!findings || findings.length === 0) {
            return res.status(400).json({
                message: "Cannot submit an audit with zero findings. Please add at least one finding."
            });
        }

        const audit = await auditModel.submitAudit(
            req.params.id
        );

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
                    title: "Audit Completed",
                    message: `${audit.auditor_name || "An auditor"} submitted the audit "${audit.title}"`,
                    type: "AUDIT_COMPLETED",
                    reference_id: audit.id
                });
            }
        } catch (notifErr) {
            console.error("Submit audit notification error:", notifErr);
        }


        res.status(200).json({
            message: "Audit submitted successfully"
        });

    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }
};



module.exports = {
    getAllAudits,
    getMyAudits,
    createAudit,
    updateAudit,
    deleteAudit,
    getAuditById,
    assignAuditor,
    submitAudit,
};

