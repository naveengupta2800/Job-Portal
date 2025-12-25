const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/authMiddleware");
const {
  register,
  verify,
  login,
  logout,
  getUserRole
} = require("../controllers/authController");

// REGISTER
router.post("/register", register);

// VERIFY OTP
router.post("/verify", verify);

// LOGIN
router.post("/login", login);

// LOGOUT
router.post("/logout", logout);

// GET USER ROLE

router.get("/get-role", requireAuth(), getUserRole);


module.exports = router;
