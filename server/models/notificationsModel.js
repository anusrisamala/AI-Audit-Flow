const db = require("../config/db");

exports.createNotification = async (data) => {
    const {
        user_id,
        title,
        message,
        type,
        reference_id
    } = data;

    try {
        if (user_id) {
            try {
                const [users] = await db.query(
                    `SELECT 
                        COALESCE(notify_audits, 1) AS notify_audits,
                        COALESCE(notify_findings, 1) AS notify_findings,
                        COALESCE(notify_reports, 1) AS notify_reports,
                        COALESCE(notify_registrations, 1) AS notify_registrations
                     FROM users WHERE id = ?`,
                    [user_id]
                );
                if (users && users.length > 0) {
                    const prefs = users[0];
                    const upperType = (type || "").toUpperCase();

                    if ((upperType.includes("AUDIT") || upperType.includes("ASSIGN")) && !Boolean(prefs.notify_audits)) {
                        return null;
                    }
                    if (upperType.includes("FINDING") && !Boolean(prefs.notify_findings)) {
                        return null;
                    }
                    if (upperType.includes("REPORT") && !Boolean(prefs.notify_reports)) {
                        return null;
                    }
                    if ((upperType.includes("REGISTER") || upperType.includes("AUDITOR_REGISTERED")) && !Boolean(prefs.notify_registrations)) {
                        return null;
                    }
                }
            } catch (prefErr) {
                // Ignore schema read error and proceed with notification
            }
        }

        const [result] = await db.query(
            `
            INSERT INTO notifications
            (user_id, title, message, type, reference_id)
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                user_id,
                title,
                message,
                type,
                reference_id
            ]
        );

        return {
            id: result.insertId,
            user_id,
            title,
            message,
            type,
            reference_id
        };

    } catch (error) {
        console.error(
            "Create notification error:",
            error
        );
        throw error;
    }
};

exports.getNotifications = async (userId) => {

    const [notifications] = await db.query(
        `
        SELECT *
        FROM notifications
        WHERE user_id = ?
        AND is_read = false
        ORDER BY created_at DESC
        LIMIT 20
        `,
        [userId]
    );

    return notifications;
};

// Mark a single notification as read
exports.markRead = async (id, userId) => {

    await db.query(
        `
        UPDATE notifications
        SET is_read = true
        WHERE id = ?
        AND user_id = ?
        `,
        [
            id,
            userId
        ]
    );

};
// Mark all notifications as read
exports.markAllRead = async (userId) => {

    await db.query(
        `
        UPDATE notifications
        SET is_read = true
        WHERE user_id = ?
        `,
        [userId]
    );

};


// Get unread notification count
exports.getUnreadCount = async (userId) => {

    const [result] = await db.query(
        `
        SELECT COUNT(*) AS count
        FROM notifications
        WHERE user_id = ?
        AND is_read = false
        `,
        [userId]
    );

    return result[0].count;

};

// Check for audits due strictly within the upcoming 2 days (not overdue) and create AUDIT_DUE_SOON notifications
exports.checkDueSoonAudits = async (userId = null) => {
    try {
        let query = `
            SELECT id, title, due_date, status, assigned_to
            FROM audits
            WHERE status != 'COMPLETED'
              AND due_date IS NOT NULL
              AND due_date >= CURDATE()
              AND due_date <= DATE_ADD(CURDATE(), INTERVAL 2 DAY)
        `;
        const params = [];

        if (userId) {
            query += ` AND assigned_to = ?`;
            params.push(userId);
        } else {
            query += ` AND assigned_to IS NOT NULL`;
        }

        const [dueAudits] = await db.query(query, params);

        for (const audit of dueAudits) {
            if (!audit.assigned_to) continue;

            const [recentNotifs] = await db.query(
                `SELECT id FROM notifications
                 WHERE user_id = ?
                   AND reference_id = ?
                   AND (type = 'AUDIT_DUE_SOON' OR type = 'AUDIT_DUE')
                   AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`,
                [audit.assigned_to, audit.id]
            );

            if (recentNotifs.length === 0) {
                const formattedDate = new Date(audit.due_date).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                });
                await exports.createNotification({
                    user_id: audit.assigned_to,
                    title: "Audit Due Soon",
                    message: `Audit "${audit.title}" is due on ${formattedDate}.`,
                    type: "AUDIT_DUE_SOON",
                    reference_id: audit.id
                });
            }
        }
    } catch (err) {
        console.error("Error checking due soon audits:", err);
    }
};

// Automatic periodic check on server (every 10 minutes)
setInterval(() => {
    exports.checkDueSoonAudits();
}, 10 * 60 * 1000);

// Run initial check on server startup
setTimeout(() => {
    exports.checkDueSoonAudits();
}, 5000);