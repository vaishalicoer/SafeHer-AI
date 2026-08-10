const express = require("express");

const router = express.Router();

const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/validators");

router.post("/register", registerValidation, register);

router.post("/login", loginValidation, login);

router.get("/me", protect, getCurrentUser);

module.exports = router;