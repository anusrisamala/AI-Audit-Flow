const db = require("../config/db");

const isAuditSubmitted = async (auditId) => {
  const [rows] = await db.query("SELECT status FROM audits WHERE id = ?", [
    auditId,
  ]);

  if (rows.length === 0) {
    throw new Error("AUDIT_NOT_FOUND");
  }

  return rows[0].status === "COMPLETED";
};

const getAllFindings = async () => {
  const [rows] = await db.query(
    `SELECT
id,
audit_id,
title,
description,

risk_level,
recommendation,

ai_risk_level,
ai_confidence,
ai_reason,
ai_recommendation,
ai_analyzed_at,

created_at
FROM findings`,
  );

  return rows;
};

// const getFindingsByAudit = async (auditId) => {
//   const [rows] = await db.query(
//     `SELECT
//             id,
//             audit_id,
//             title,
//             description,
//             risk_level,
//             recommendation,
//             created_at
//          FROM findings
//          WHERE audit_id = ?`,
//     [auditId],
//   );

//   return rows;
// };
const getFindingsByAudit = async (auditId) => {
  const [rows] = await db.query(
    `SELECT
        id,
        audit_id,
        title,
        description,

        risk_level,
        recommendation,

        ai_risk_level,
        ai_confidence,
        ai_reason,
        ai_recommendation,
        ai_analyzed_at,

        created_at
     FROM findings
     WHERE audit_id = ?`,
    [auditId]
  );

  return rows;
};

const getFindingById = async (id) => {
  const [rows] = await db.query(
   ` SELECT
f.id,
f.audit_id,
f.title,
f.description,

f.risk_level,
f.recommendation,

f.ai_risk_level,
f.ai_confidence,
f.ai_reason,
f.ai_recommendation,
f.ai_analyzed_at,

f.created_at,

a.department AS audit_department

FROM findings f

JOIN audits a
ON f.audit_id = a.id

WHERE f.id=?`,
    [id],
  );

  return rows;
};

// const createFinding = async (
//   audit_id,
//   title,
//   description,
//   risk_level,
//   recommendation,
// ) => {
//   const submitted = await isAuditSubmitted(audit_id);

//   if (submitted) {
//     throw new Error("AUDIT_SUBMITTED");
//   }

//   const [result] = await db.query(
//     `INSERT INTO findings
//         (
//             audit_id,
//             title,
//             description,
//             risk_level,
//             recommendation
//         )
//         VALUES (?, ?, ?, ?, ?)`,
//     [audit_id, title, description, risk_level, recommendation],
//   );

//   // Fetch the newly inserted finding
//   const [rows] = await db.query(`SELECT * FROM findings WHERE id = ?`, [
//     result.insertId,
//   ]);

//   return rows[0];
// };

const createFinding = async (
  audit_id,
  title,
  description,
  risk_level,
  recommendation,
  ai_risk_level,
  ai_confidence,
  ai_reason,
  ai_recommendation
) => {

  const submitted = await isAuditSubmitted(audit_id);

  if (submitted) {
    throw new Error("AUDIT_SUBMITTED");
  }

  const [result] = await db.query(
    `
    INSERT INTO findings
    (
      audit_id,
      title,
      description,
      risk_level,
      recommendation,

      ai_risk_level,
      ai_confidence,
      ai_reason,
      ai_recommendation,
      ai_analyzed_at
    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `,
    [
      audit_id,
      title,
      description,
      risk_level,
      recommendation,

      ai_risk_level,
      ai_confidence,
      ai_reason,
      ai_recommendation
    ]
  );

  // Reuse existing method
  const finding = await getFindingById(result.insertId);

  return finding[0];
};

const updateFinding = async (
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
  userRole = "AUDITOR"
) => {
  const [finding] = await db.query(
    "SELECT audit_id FROM findings WHERE id = ?",
    [id],
  );

  if (finding.length === 0) {
    throw new Error("FINDING_NOT_FOUND");
  }

  const submitted = await isAuditSubmitted(finding[0].audit_id);

  if (submitted) {
    throw new Error("AUDIT_SUBMITTED");
  }

  let result;
  if (userRole === "ADMIN") {
    [result] = await db.query(
      `UPDATE findings
       SET
          title = ?,
          description = ?,
          risk_level = ?,
          recommendation = ?,

          ai_risk_level = ?,
          ai_confidence = ?,
          ai_reason = ?,
          ai_recommendation = ?

       WHERE id = ?`,
      [
        title,
        description,
        risk_level,
        recommendation,

        ai_risk_level,
        ai_confidence,
        ai_reason,
        ai_recommendation,

        id
      ]
    );
  } else {
    [result] = await db.query(
      `UPDATE findings f
       JOIN audits a
       ON f.audit_id = a.id
       SET
          f.title = ?,
          f.description = ?,
          f.risk_level = ?,
          f.recommendation = ?,

          f.ai_risk_level = ?,
          f.ai_confidence = ?,
          f.ai_reason = ?,
          f.ai_recommendation = ?

       WHERE
          f.id = ?
       AND
          a.assigned_to = ?`,
      [
        title,
        description,
        risk_level,
        recommendation,

        ai_risk_level,
        ai_confidence,
        ai_reason,
        ai_recommendation,

        id,
        userId
      ]
    );
  }

  return result;
};

const deleteFinding = async (id, userId, userRole = "AUDITOR") => {
  const [finding] = await db.query(
    "SELECT audit_id FROM findings WHERE id = ?",
    [id],
  );

  if (finding.length === 0) {
    throw new Error("FINDING_NOT_FOUND");
  }

  const submitted = await isAuditSubmitted(finding[0].audit_id);

  if (submitted) {
    throw new Error("AUDIT_SUBMITTED");
  }

  let result;
  if (userRole === "ADMIN") {
    [result] = await db.query(
      "DELETE FROM findings WHERE id = ?",
      [id]
    );
  } else {
    [result] = await db.query(
      `DELETE f
           FROM findings f
           JOIN audits a
           ON f.audit_id = a.id
           WHERE
              f.id = ?
           AND
              a.assigned_to = ?`,
      [id, userId],
    );
  }

  return result;
};

const getFindingsByUser = async (userId) => {
  const query = `
        SELECT
    f.id,
    f.audit_id,
    f.title,
    f.description,

    f.risk_level,
    f.recommendation,

    f.ai_risk_level,
    f.ai_confidence,
    f.ai_reason,
    f.ai_recommendation,
    f.ai_analyzed_at,

    f.created_at
FROM findings f
JOIN audits a
ON f.audit_id = a.id
WHERE a.assigned_to = ?
    `;

  const [rows] = await db.execute(query, [userId]);
  return rows;
};

module.exports = {
  getAllFindings,
  getFindingById,
  createFinding,
  updateFinding,
  deleteFinding,
  getFindingsByAudit,
  getFindingsByUser,
};
