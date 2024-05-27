const express = require("express");
const router = express.Router();

const {
  register,
  login,
  firstPage,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controllers");

const restrict = require("../middleware/restrict");

// all router api auth

// register
router.post("/register", register);

//login
router.post("/login", login);

// firstPage
router.get("/", restrict, firstPage);

// verifikasi email
router.get("/verifikasi", verifyEmail);

// forgot password
router.post("/forgot-password", forgotPassword);

// reset password
router.post("/reset-password", resetPassword);

module.exports = router;
