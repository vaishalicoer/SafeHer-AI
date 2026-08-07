require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const sosRoutes = require("./routes/sosRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const incidentRoutes = require("./routes/incidentRoutes");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/incidents", incidentRoutes);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 SafeHer AI Backend Running Successfully",
  });
});

// 404 Route
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});