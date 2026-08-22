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
const rideRoutes = require("./routes/rideRoutes");

// ================= APP =================

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

  // Vercel Frontend
  "https://safe-her-fo2se7nsq-vaishali-sharmas-projects-bceb4ef5.vercel.app",
  "https://safe-her-ai-theta.vercel.app",

  // Android APK (Capacitor WebView)
  "capacitor://localhost",
  "http://localhost",
  "https://localhost",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // Example: Postman / Thunder Client / mobile apps
      if (!origin) {
        return callback(null, true);
      }

      // Allow approved frontend origins
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

// ================= BODY PARSER =================

// JSON body
app.use(express.json({ limit: "10mb" }));

// URL encoded body
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ================= LOGGER =================

app.use(morgan("dev"));

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

// Journey / Walk With Me
app.use(
  "/api/journey",
  journeyRoutes
);

// Medical Emergency Support
app.use(
  "/api/medical",
  medicalRoutes
);

// Ride Photo Storage
app.use(
  "/api/ride",
  rideRoutes
);

// ================= HEALTH CHECK =================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 SafeHer AI Backend Running Successfully",
  });
});

// ================= 404 =================

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy blocked this request",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});