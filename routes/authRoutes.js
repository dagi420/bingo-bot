const express = require("express");
const {
  register,
  login,
  tokenVerify,
} = require("../controllers/authController");

const router = express.Router();

// Route for registering a new user
router.post("/register", register);

// Route for logging in a user
router.post("/login", login);
router.post("/verify", tokenVerify);

module.exports = router;
