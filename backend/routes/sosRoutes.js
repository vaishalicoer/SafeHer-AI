const express = require("express");

const router = express.Router();

const {

triggerSOS,

cancelSOS,

getActiveSOS,

getHistory,

} = require("../controllers/sosController");

const { protect } = require("../middleware/authMiddleware");

router.post("/trigger", protect, triggerSOS);

router.put("/cancel", protect, cancelSOS);

router.get("/active", protect, getActiveSOS);

router.get("/history", protect, getHistory);

module.exports = router;