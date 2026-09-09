const db = require("../config/db");
const getAllAudits = async () => {
  const [rows] = await db.query(`
        SELECT
            a.id,
            a.title,
            a.department,
            a.description,
            a.start_date,
            a.due_date,
            a.status,
            a.created_by,
            a.assigned_to,
            u.id AS auditor_id,
            u.name AS assigned_auditor,
            a.created_at
        FROM audits a
        LEFT JOIN users u
            ON a.assigned_to = u.id
        ORDER BY a.created_at DESC
    `);

  return rows;
};

const getAuditsByAuditor = async (auditorId) => {
  const [rows] = await db.query(
    `SELECT *
         FROM audits
         WHERE assigned_to = ?`,
    [auditorId],
  );

  return rows;
};

const createAudit = async (data) => {
  const {
    title,
    department,
    description,
    start_date,
    due_date,
    created_by,
    assigned_to,
  } = data;

  const [result] = await db.query(
    `INSERT INTO audits
        (title, department, description, start_date, due_date, created_by, assigned_to)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      department,
      description,
      start_date,
      due_date,
      created_by,
      assigned_to,
    ],
  );
  return result;
};

const updateAudit = async (id, data) => {
  const existing = await getAuditById(id);
  if (!existing) return null;

  const title = data.title !== undefined ? data.title : existing.title;
  const department = data.department !== undefined ? data.department : existing.department;
  const description = data.description !== undefined ? data.description : existing.description;
  const start_date = data.start_date !== undefined ? data.start_date : existing.start_date;
  const due_date = data.due_date !== undefined ? data.due_date : existing.due_date;
  const status = data.status !== undefined ? data.status : existing.status;
  const assigned_to = data.assigned_to !== undefined ? data.assigned_to : existing.assigned_to;

  const [result] = await db.query(
    `UPDATE audits
         SET title = ?,
             department = ?,
             description = ?,
             start_date = ?,
             due_date = ?,
             status = ?,
             assigned_to = ?
         WHERE id = ?`,
    [
      title,
      department,
      description,
      start_date,
      due_date,
      status,
      assigned_to,
      id,
    ],
  );

  return result;
};
const deleteAudit = async (id) => {
  const [result] = await db.query("DELETE FROM audits WHERE id = ?", [id]);

  return result;
};
const getAuditById = async (id) => {
  const [rows] = await db.query(
    `
        SELECT
            a.id,
            a.title,
            a.department,
            a.description,
            a.start_date,
            a.due_date,
            a.status,
            a.created_by,
            a.assigned_to,
            u.id AS auditor_id,
            u.name AS assigned_auditor,
            a.created_at
        FROM audits a
        LEFT JOIN users u
            ON a.assigned_to = u.id
        WHERE a.id = ?
        `,
    [id],
  );

  return rows[0];
};

const assignAuditor = async (auditId, assignedTo) => {

  // Get current audit status
  const [auditRows] = await db.query(
    `SELECT status
     FROM audits
     WHERE id = ?`,
    [auditId]
  );


  if (!auditRows.length) {
    return 0;
  }


  let result;


  if (auditRows[0].status === "COMPLETED") {

    [result] = await db.query(
      `UPDATE audits
       SET assigned_to = ?,
           status = 'IN_PROGRESS'
       WHERE id = ?`,
      [assignedTo, auditId]
    );

  } else {

    [result] = await db.query(
      `UPDATE audits
       SET assigned_to = ?
       WHERE id = ?`,
      [assignedTo, auditId]
    );

  }

  return result.affectedRows;
};

const submitAudit = async (auditId) => {

    // Update audit status
    const [result] = await db.query(
        `UPDATE audits
         SET status = 'COMPLETED',
             completed_at = NOW()
         WHERE id = ?`,
        [auditId]
    );

    if (result.affectedRows === 0) {
        return null;
    }


    // Get audit details for notification
    const [audit] = await db.query(
        `SELECT 
            a.id,
            a.title,
            a.created_by,
            a.assigned_to,
            u.name AS auditor_name
         FROM audits a
         JOIN users u 
         ON a.assigned_to = u.id
         WHERE a.id = ?`,
        [auditId]
    );


    return audit[0];
};

module.exports = {
  getAllAudits,
  getAuditsByAuditor,
  createAudit,
  updateAudit,
  deleteAudit,
  getAuditById,
  assignAuditor,
  submitAudit,
};
