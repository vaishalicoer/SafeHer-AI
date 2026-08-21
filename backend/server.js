require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const sosRoutes = require("./routes/sosRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const journeyRoutes = require("./routes/journeyRoutes");
const medicalRoutes = require("./routes/medicalRoutes");

const app = express();

// ================= DATABASE =================

connectDB();

// ================= RATE LIMITER =================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,

  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes.",
  },
});

// ================= MIDDLEWARE =================

app.use(helmet());

// ================= CORS =================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://safe-her-fo2se7nsq-vaishali-sharmas-projects-bceb4ef5.vercel.app",
  "https://safe-her-ai-theta.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // Example: Postman / Thunder Client
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost and Vercel frontend
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);

app.use(morgan("dev"));

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ================= ROUTES =================

// Authentication
app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

// Profile
app.use(
  "/api/profile",
  profileRoutes
);

// Emergency Contacts
app.use(
  "/api/emergency",
  emergencyRoutes
);

// SOS
app.use(
  "/api/sos",
  sosRoutes
);

// Dashboard
app.use(
  "/api/dashboard",
  dashboardRoutes
);

// Incident Reporting
app.use(
  "/api/incidents",
  incidentRoutes
);

// Journey (Walk With Me)
app.use(
  "/api/journey",
  journeyRoutes
);

// Medical Emergency Support
app.use(
  "/api/medical",
  medicalRoutes
);

// ================= HEALTH CHECK =================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 SafeHer AI Backend Running Successfully",
  });
});

// ================= 404 ROUTE =================

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});