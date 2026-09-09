const db = require("../config/db");

const getUserByEmail = async (email) => {

    const [rows] = await db.query(
        "SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))",
        [email]
    );

    return rows[0];
};

const createUser = async (
    name,
    email,
    password,
    role
) => {

    const [result] = await db.query(
        `INSERT INTO users
        (name, email, password, role)
        VALUES (?, ?, ?, ?)`,
        [
            name,
            email,
            password,
            role
        ]
    );

    return result.insertId;
};


module.exports = {
    getUserByEmail,
    createUser
};