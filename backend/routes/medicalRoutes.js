const express = require("express");
const router = express.Router();
const {
  triggerMedicalAlert,
  resolveMedicalAlert,
  getMedicalHistory,
} = require("../controllers/medicalController");
const { protect } = require("../middleware/authMiddleware");

router.post("/trigger", protect, triggerMedicalAlert);
router.put("/resolve/:id", protect, resolveMedicalAlert);
router.get("/history", protect, getMedicalHistory);

module.exports = router;