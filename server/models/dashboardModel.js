const db = require("../config/db");

const getAdminDashboard = async () => {
  // ============================================
  // KPI Cards
  // ============================================

  const [totalAuditsResult] = await db.query(`
    SELECT COUNT(*) AS totalAudits
    FROM audits
  `);

  const [activeAuditsResult] = await db.query(`
    SELECT COUNT(*) AS activeAudits
    FROM audits
    WHERE status IN ('PENDING', 'IN_PROGRESS')
  `);

  const [completedAuditsResult] = await db.query(`
    SELECT COUNT(*) AS completedAudits
    FROM audits
    WHERE status = 'COMPLETED'
  `);

  const [highRiskFindingsResult] = await db.query(`
    SELECT COUNT(*) AS highRiskFindings
    FROM findings
    WHERE risk_level IN ('HIGH', 'CRITICAL')
  `);

  // ============================================
  // Audit Status Distribution
  // ============================================

  const [statusRows] = await db.query(`
    SELECT
      status,
      COUNT(*) AS total
    FROM audits
    GROUP BY status
  `);

  const auditStatus = {
    pending: 0,
    inProgress: 0,
    completed: 0,
  };

  statusRows.forEach((row) => {
    if (row.status === "PENDING") {
      auditStatus.pending = row.total;
    } else if (row.status === "IN_PROGRESS") {
      auditStatus.inProgress = row.total;
    } else if (row.status === "COMPLETED") {
      auditStatus.completed = row.total;
    }
  });

  // ============================================
  // Findings by Risk
  // ============================================

  const [riskRows] = await db.query(`
    SELECT
      risk_level,
      COUNT(*) AS total
    FROM findings
    GROUP BY risk_level
  `);

  const findingsByRisk = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  riskRows.forEach((row) => {
    if (row.risk_level === "CRITICAL") {
      findingsByRisk.critical = row.total;
    } else if (row.risk_level === "HIGH") {
      findingsByRisk.high = row.total;
    } else if (row.risk_level === "MEDIUM") {
      findingsByRisk.medium = row.total;
    } else if (row.risk_level === "LOW") {
      findingsByRisk.low = row.total;
    }
  });

  // ============================================
  // Monthly Completed Audits
  // ============================================

  const [monthlyRows] = await db.query(`
    SELECT
      DATE_FORMAT(completed_at, '%Y-%m') AS month,
      COUNT(*) AS count
    FROM audits
    WHERE status = 'COMPLETED'
      AND completed_at IS NOT NULL
    GROUP BY DATE_FORMAT(completed_at, '%Y-%m')
    ORDER BY DATE_FORMAT(completed_at, '%Y-%m')
  `);

  // ============================================
  // Audits by Department
  // ============================================

  const [departmentRows] = await db.query(`
    SELECT
      department,
      COUNT(*) AS count
    FROM audits
    GROUP BY department
    ORDER BY count DESC
  `);

  // ============================================
  // Auditor Workload
  // ============================================

  const [workloadRows] = await db.query(`
    SELECT
      u.name AS auditor,
      COUNT(a.id) AS assignedAudits
    FROM users u
    LEFT JOIN audits a
      ON u.id = a.assigned_to
    WHERE u.role = 'AUDITOR'
    GROUP BY u.id, u.name
    ORDER BY assignedAudits DESC
  `);

  // ============================================
  // Recent Audits
  // ============================================

  const [recentRows] = await db.query(`
    SELECT
      a.id,
      a.title,
      a.department,
      a.status,
      a.due_date,
      u.name AS assignedAuditor
    FROM audits a
    LEFT JOIN users u
      ON a.assigned_to = u.id
    ORDER BY a.created_at DESC
    LIMIT 5
  `);

  // ============================================
  // Final Response
  // ============================================

  return {
    kpis: {
      totalAudits: totalAuditsResult[0].totalAudits,
      activeAudits: activeAuditsResult[0].activeAudits,
      completedAudits: completedAuditsResult[0].completedAudits,
      highRiskFindings: highRiskFindingsResult[0].highRiskFindings,
    },

    auditStatus,

    findingsByRisk,

    monthlyCompletedAudits: monthlyRows,

    auditsByDepartment: departmentRows,

    auditorWorkload: workloadRows,

    recentAudits: recentRows,
  };
};

const getAuditorDashboard = async (auditorId) => {
  // ============================
  // KPI Cards
  // ============================

  const [assignedResult] = await db.query(
    `SELECT COUNT(*) AS assignedAudits
         FROM audits
         WHERE assigned_to = ?`,
    [auditorId],
  );

  const [completedResult] = await db.query(
    `SELECT COUNT(*) AS completedAudits
         FROM audits
         WHERE assigned_to = ?
         AND status = 'COMPLETED'`,
    [auditorId],
  );

  const [pendingResult] = await db.query(
    `SELECT COUNT(*) AS pendingAudits
         FROM audits
         WHERE assigned_to = ?
         AND status IN ('PENDING','IN_PROGRESS')`,
    [auditorId],
  );

  const [overdueResult] = await db.query(
    `SELECT COUNT(*) AS overdue
         FROM audits
         WHERE assigned_to = ?
         AND due_date < CURDATE()
         AND status <> 'COMPLETED'`,
    [auditorId],
  );

  // ============================
  // Findings by Risk
  // ============================

  const [riskRows] = await db.query(
    `SELECT
    risk_level,
    COUNT(*) AS total
    FROM findings f
    JOIN audits a ON a.id = f.audit_id
    WHERE a.assigned_to = ?
    GROUP BY risk_level;`,
    [auditorId],
  );

  const findingsByRisk = {
    high: 0,
    medium: 0,
    low: 0,
    critical: 0,
  };


  riskRows.forEach((row) => {
    if (row.risk_level === "HIGH") findingsByRisk.high = row.total;

    if (row.risk_level === "MEDIUM") findingsByRisk.medium = row.total;

    if (row.risk_level === "LOW") findingsByRisk.low = row.total;

    if (row.risk_level == "CRITICAL") findingsByRisk.critical = row.total;
  });

  // ============================
  // Monthly Completed Audits
  // ============================

  // const [monthlyRows] = await db.query(
  //     `SELECT
  //         DATE_FORMAT(completed_at,'%b') AS month,
  //         COUNT(*) AS count
  //      FROM audits
  //      WHERE assigned_to = ?
  //      AND status='COMPLETED'
  //      GROUP BY MONTH(completed_at)
  //      ORDER BY MONTH(completed_at)`,
  //     [auditorId]
  // );

  const [monthlyRows] = await db.query(
    `SELECT
        DATE_FORMAT(completed_at, '%Y-%m') AS month,
        COUNT(*) AS count
     FROM audits
     WHERE assigned_to = ?
       AND status = 'COMPLETED'
     GROUP BY DATE_FORMAT(completed_at, '%Y-%m')
     ORDER BY DATE_FORMAT(completed_at, '%Y-%m')`,
    [auditorId],
  );

  // ============================
  // Recent Assigned Audits
  // ============================

  const [recentRows] = await db.query(
    `SELECT
            id,
            title AS audit_name,
            department,
            status,
            due_date
         FROM audits
         WHERE assigned_to = ?
         ORDER BY created_at DESC
         LIMIT 3`,
    [auditorId],
  );

//   const [findingsPerAuditRows] = await db.query(
//   `SELECT
//       a.title AS audit_name,
//       COUNT(f.id) AS finding_count
//    FROM audits a
//    LEFT JOIN findings f
//       ON a.id = f.audit_id
//    WHERE a.assigned_to = ?
//    GROUP BY a.id, a.title
//    ORDER BY finding_count DESC`,
//   [auditorId],
// );

  // ============================
  // Final Response
  // ============================

  return {
    kpis: {
      assignedAudits: assignedResult[0].assignedAudits,

      completedAudits: completedResult[0].completedAudits,

      pendingAudits: pendingResult[0].pendingAudits,

      overdue: overdueResult[0].overdue,
    },

    auditStatus: {

    pending: pendingResult[0].pendingAudits,

    completed: completedResult[0].completedAudits,

    // assigned: assignedResult[0].assignedAudits

},

    findingsByRisk,

    monthlyCompletedAudits: monthlyRows,



    recentAudits: recentRows,
  };
};

module.exports = {
  getAdminDashboard,
  getAuditorDashboard,
};
