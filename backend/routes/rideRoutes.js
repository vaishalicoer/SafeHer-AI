const express = require("express");

const router = express.Router();

const {
  saveRide,
  getRides,
} = require("../controllers/rideController");

const { protect } = require("../middleware/authMiddleware");

// Save ride
router.post("/save", protect, saveRide);

// Ride history
router.get("/history", protect, getRides);

module.exports = router;