const express = require("express");
const router = express.Router();
const {
  startJourney,
  updateLocation,
  endJourney,
  getActiveJourney,
} = require("../controllers/journeyController");
const { protect } = require("../middleware/authMiddleware");

router.post("/start", protect, startJourney);
router.put("/update-location", protect, updateLocation);
router.put("/end", protect, endJourney);
router.get("/active", protect, getActiveJourney);

module.exports = router;