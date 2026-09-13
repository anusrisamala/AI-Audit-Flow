const db = require("../config/db");
const bcrypt = require("bcryptjs");

let preferencesSchemaPromise;

const ensurePreferencesSchema = async () => {
    if (!preferencesSchemaPromise) {
        preferencesSchemaPromise = (async () => {
            try {
                const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'notify_audits'");
                if (!columns || columns.length === 0) {
                    await db.query(`
                        ALTER TABLE users 
                        ADD COLUMN notify_audits TINYINT(1) DEFAULT 1,
                        ADD COLUMN notify_findings TINYINT(1) DEFAULT 1,
                        ADD COLUMN notify_reports TINYINT(1) DEFAULT 1,
                        ADD COLUMN notify_registrations TINYINT(1) DEFAULT 1
                    `);
                }
            } catch (err) {
                console.error("Error ensuring preferences schema:", err.message);
            }
        })();
    }

    return preferencesSchemaPromise;
};

ensurePreferencesSchema();

const getUserById = async (id) => {
    await ensurePreferencesSchema();
    const [rows] = await db.query(
        `SELECT
            id,
            name,
            email,
            role,
            created_at,
            COALESCE(notify_audits, 1) AS notify_audits,
            COALESCE(notify_findings, 1) AS notify_findings,
            COALESCE(notify_reports, 1) AS notify_reports,
            COALESCE(notify_registrations, 1) AS notify_registrations
         FROM users
         WHERE id = ?`,
        [id]
    );

    if (!rows[0]) return null;

    return {
        ...rows[0],
        notify_audits: Boolean(rows[0].notify_audits),
        notify_findings: Boolean(rows[0].notify_findings),
        notify_reports: Boolean(rows[0].notify_reports),
        notify_registrations: Boolean(rows[0].notify_registrations),
    };
};

const getAllAuditors = async () => {
    const [rows] = await db.query(
        `SELECT
            id,
            name,
            email
         FROM users
         WHERE role = 'AUDITOR'`
    );

    return rows;
};

const updateUserProfile = async (id, name, email) => {
    const [result] = await db.query(
        `UPDATE users
         SET name = ?,
             email = ?
         WHERE id = ?`,
        [name, email, id]
    );

    return result;
};

const changeUserPassword = async (id, currentPassword, newPassword) => {
    const [rows] = await db.query(`SELECT id, password FROM users WHERE id = ?`, [id]);
    const user = rows[0];
    if (!user) {
        throw new Error("User not found");
    }

    let isValid = false;
    try {
        isValid = await bcrypt.compare(currentPassword, user.password);
    } catch (err) {
        isValid = false;
    }

    if (!isValid) {
        throw new Error("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, id]);
    return true;
};

const updateNotificationPreferences = async (id, preferences) => {
    await ensurePreferencesSchema();
    const { notify_audits, notify_findings, notify_reports, notify_registrations } = preferences;

    await db.query(
        `UPDATE users
         SET notify_audits = ?,
             notify_findings = ?,
             notify_reports = ?,
             notify_registrations = ?
         WHERE id = ?`,
        [
            notify_audits ? 1 : 0,
            notify_findings ? 1 : 0,
            notify_reports ? 1 : 0,
            notify_registrations ? 1 : 0,
            id
        ]
    );

    return getUserById(id);
};

const getAdmins = async () => {
    const [rows] = await db.query(
        `SELECT id, name, email FROM users WHERE UPPER(TRIM(role)) = 'ADMIN' OR UPPER(TRIM(role)) LIKE '%ADMIN%'`
    );
    return rows;
};

module.exports = {
    getUserById,
    getAllAuditors,
    getAdmins,
    updateUserProfile,
    changeUserPassword,
    updateNotificationPreferences,
    ensurePreferencesSchema
};
