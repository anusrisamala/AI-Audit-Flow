const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

app.use(cors());
app.use(express.json());

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
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
