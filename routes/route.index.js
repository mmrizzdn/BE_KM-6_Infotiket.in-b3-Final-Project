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
router.post("/daftar-sekarang", register);

//login
router.post("/masuk", login);

// firstPage
router.get("/", firstPage);

// verifikasi email
router.get("/verifikasi", verifyEmail);

// forgot password
router.post("/lupa-kata-sandi", forgotPassword);

// reset password
router.post("/mengatur-ulang-kata-sandi", resetPassword);

module.exports = router;
