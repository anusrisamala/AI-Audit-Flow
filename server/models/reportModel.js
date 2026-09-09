const db = require("../config/db");

const getAllReports = async () => {

    const [rows] = await db.query(
        `SELECT
            r.id,
            r.audit_id,
            r.summary,
            r.overall_risk,
            r.generated_date,
            r.ai_summary,
            r.ai_observations,
            r.ai_recommendations,
            r.ai_priority_actions,
            r.ai_generated,
            r.ai_generated_at,

            a.id AS audit_id_ref,
            a.title,
            a.department

        FROM reports r
        JOIN audits a
            ON r.audit_id = a.id

        ORDER BY r.generated_date DESC`
    );

    return rows.map(row => ({
        id: row.id,
        audit_id: row.audit_id,
        summary: row.summary,
        overall_risk: row.overall_risk,
        generated_date: row.generated_date,
        ai_summary: row.ai_summary,
        ai_observations: row.ai_observations,
        ai_recommendations: row.ai_recommendations,
        ai_priority_actions: row.ai_priority_actions,
        ai_generated: row.ai_generated,
        ai_generated_at: row.ai_generated_at,

        audit: {
            id: row.audit_id_ref,
            title: row.title,
            department: row.department
        }
    }));
};

const getReportByAuditId = async (auditId) => {

    const [rows] = await db.query(
        `SELECT
            r.id,
            r.audit_id,
            r.summary,
            r.overall_risk,
            r.generated_date,
            r.ai_summary,
            r.ai_observations,
            r.ai_recommendations,
            r.ai_priority_actions,
            r.ai_generated,
            r.ai_generated_at,

            a.id AS audit_ref,
            a.title,
            a.department

        FROM reports r

        JOIN audits a
            ON r.audit_id = a.id

        WHERE r.audit_id = ?`,
        [auditId]
    );

    if (!rows.length) return null;

    const row = rows[0];

    return {
        id: row.id,
        audit_id: row.audit_id,
        summary: row.summary,
        overall_risk: row.overall_risk,
        generated_date: row.generated_date,
        ai_summary: row.ai_summary,
        ai_observations: row.ai_observations,
        ai_recommendations: row.ai_recommendations,
        ai_priority_actions: row.ai_priority_actions,
        ai_generated: row.ai_generated,
        ai_generated_at: row.ai_generated_at,

        audit: {
            id: row.audit_ref,
            title: row.title,
            department: row.department
        }
    };
};

const getReportById = async (id) => {

    const [rows] = await db.query(
        `SELECT
            r.id,
            r.audit_id,
            r.summary,
            r.overall_risk,
            r.generated_date,
            r.ai_summary,
            r.ai_observations,
            r.ai_recommendations,
            r.ai_priority_actions,
            r.ai_generated,
            r.ai_generated_at,

            a.id AS audit_ref,
            a.title,
            a.department,
            a.start_date,
            a.due_date,
            a.status,

            u.id AS auditor_id,
            u.name AS auditor_name

        FROM reports r

        LEFT JOIN audits a
            ON r.audit_id = a.id

        LEFT JOIN users u
            ON a.assigned_to = u.id

        WHERE r.id = ?`,
        [id]
    );

    if (!rows.length) return null;

    const row = rows[0];

    // Fetch findings for this audit
    const [findings] = await db.query(
        `SELECT
            id,
            title,
            description,
            risk_level,
            recommendation,
            created_at
         FROM findings
         WHERE audit_id = ?
         ORDER BY
            CASE risk_level
                WHEN 'CRITICAL' THEN 1
                WHEN 'HIGH' THEN 2
                WHEN 'MEDIUM' THEN 3
                WHEN 'LOW' THEN 4
                ELSE 5
            END,
            created_at`,
        [row.audit_id]
    );

    return {
        id: row.id,
        audit_id: row.audit_id,
        summary: row.summary,
        overall_risk: row.overall_risk,
        generated_date: row.generated_date,
        ai_summary: row.ai_summary,
        ai_observations: row.ai_observations,
        ai_recommendations: row.ai_recommendations,
        ai_priority_actions: row.ai_priority_actions,
        ai_generated: row.ai_generated,
        ai_generated_at: row.ai_generated_at,

        audit: {
            id: row.audit_ref,
            title: row.title,
            department: row.department,
            start_date: row.start_date,
            due_date: row.due_date,
            status: row.status,

            assigned_auditor: {
                id: row.auditor_id,
                name: row.auditor_name
            }
        },

        findings
    };
};

const createReport = async (
    audit_id,
    summary,
    overall_risk,
    generated_date
) => {

    const [result] = await db.query(
        `INSERT INTO reports
        (audit_id, summary, overall_risk, generated_date)
        VALUES (?, ?, ?, ?)`,
        [
            audit_id,
            summary,
            overall_risk,
            generated_date
        ]
    );

    return result.insertId;
};

const updateReport = async (
    id,
    audit_id,
    summary,
    overall_risk,
    generated_date
) => {

    const [result] = await db.query(
        `UPDATE reports
         SET audit_id = ?,
             summary = ?,
             overall_risk = ?,
             generated_date = ?
         WHERE id = ?`,
        [
            audit_id,
            summary,
            overall_risk,
            generated_date,
            id
        ]
    );

    return result.affectedRows > 0;
};

const deleteReport = async (id) => {

    const [result] = await db.query(
        "DELETE FROM reports WHERE id = ?",
        [id]
    );

    return result.affectedRows > 0;
};



module.exports = {
    getAllReports,
    getReportByAuditId,
    getReportById,
    createReport,
    updateReport,
    deleteReport
    
};