const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not configured.");
    process.exit(1);
}

const db = require("./config/db");

const auditRoutes = require("./routes/auditRoutes");
const findingRoutes = require("./routes/findingRoutes");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(helmet());

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map(url => url.trim())
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("CORS policy violation: Access from unauthorized origin blocked."));
        }
    })
);

app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.send("Audit Management Backend Running");
});

// Routes
app.use("/auth", authRoutes);
app.use("/audits", auditRoutes);
app.use("/findings", findingRoutes);
app.use("/reports", reportRoutes);
app.use("/users", userRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/notifications", notificationRoutes);
app.use('/ai', aiRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  if (err && err.message && err.message.includes("CORS")) {
    return res.status(403).json({ message: err.message });
  }

  const statusCode = err.status || err.statusCode || 500;
  const safeMessage = statusCode < 500 && err.message ? err.message : "Internal server error";

  res.status(statusCode).json({ message: safeMessage });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
