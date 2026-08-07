const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Incident routes are working.",
  });
});

module.exports = router;