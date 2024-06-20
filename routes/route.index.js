const express = require("express");
const router = express.Router();

const {
  register,
  login,
  firstPage,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleOauth2,
  logout,
} = require("../controllers/auth.controllers");

let passport = require("../libs/passport");
const { restrict } = require("../middleware/restrict");

// all router api auth

// router api daftar sekarang
router.post("/daftar-sekarang", register);

// router api masuk
router.post("/masuk", login);

// router api halaman utama
router.get("/halaman-utama", restrict, firstPage);

// router api verifikasi email
router.get("/verifikasi", verifyEmail);

// router api forgot password
router.post("/lupa-kata-sandi", forgotPassword);

// router api reset password
router.get("/mengatur-ulang-kata-sandi", resetPassword);
router.post("/mengatur-ulang-kata-sandi", resetPassword);

// router api google Oauth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/v1/auth/google",
    session: true,
  }),
  googleOauth2
);

// router api keluar
router.get("/keluar", logout);
module.exports = router;
