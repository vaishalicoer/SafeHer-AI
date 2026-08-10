const { body, validationResult } = require("express-validator");

// Common function jo errors check karega
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }
  next();
};

// Register ke liye rules
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("Please enter a valid email"),
  body("phone")
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  handleValidation,
];

// Login ke liye rules
const loginValidation = [
  body("email").trim().isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidation,
];

module.exports = { registerValidation, loginValidation };