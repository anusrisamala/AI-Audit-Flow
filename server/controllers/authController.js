const authModel = require("../models/authModel");
const userModel = require("../models/userModel");
const notificationsModel = require("../models/notificationsModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Always assign AUDITOR role for public registration
    const role = 'AUDITOR';

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    const existingUser = await authModel.getUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await authModel.createUser(
      name.trim(),
      email.trim().toLowerCase(),
      hashedPassword,
      role
    );

    // Notify all admins of the new auditor registration
    try {
      const admins = await userModel.getAdmins();
      if (Array.isArray(admins)) {
        for (const admin of admins) {
          if (admin.id) {
            await notificationsModel.createNotification({
              user_id: admin.id,
              title: "New Auditor Registered",
              message: `New auditor "${name.trim()}" (${email.trim().toLowerCase()}) has registered.`,
              type: "AUDITOR_REGISTERED",
              reference_id: userId
            });
          }
        }
      }
    } catch (notifErr) {
      console.error("Notification trigger error on register:", notifErr);
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: userId,
        role
      },
      process.env.JWT_SECRET || "default_secret",
      {
        expiresIn: '1d'
      }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        name,
        email,
        role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


const db = require("../config/db");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await authModel.getUserByEmail(normalizedEmail);

        if (!user) {
            return res.status(400).json({
                message: "User not found. Please register first or check your email address."
            });
        }

        let isPasswordValid = false;
        try {
            isPasswordValid = await bcrypt.compare(password, user.password);
        } catch (err) {
            isPasswordValid = false;
        }

        // Support legacy or manually seeded plain-text passwords
        if (!isPasswordValid && user.password === password) {
            isPasswordValid = true;
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);
            } catch (hashErr) {
                // Ignore hash update error if query fails
            }
        }

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET || "default_secret",
            {
                expiresIn: "1d"
            }
        );

        if ((user.role || "").toUpperCase() === "AUDITOR") {
            try {
                await notificationsModel.checkDueSoonAudits(user.id);
            } catch (dueErr) {
                console.error("Check due soon audits on login error:", dueErr);
            }
        }

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    register,
    login
};