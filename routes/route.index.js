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

const restrict = require("../middleware/restrict");
let passport = require("../libs/passport");

// all router api auth

// register
router.post("/daftar-sekarang", register);

// login
router.post("/masuk", login);

// firstPage
router.get("/", firstPage);

// verifikasi email
router.get("/verifikasi", verifyEmail);

// forgot password
router.post("/lupa-kata-sandi", forgotPassword);

// reset password
router.post("/mengatur-ulang-kata-sandi", resetPassword);

// google Oauth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/v1/auth/google",
    session: false,
  }),
  googleOauth2
);

// logout
router.get("/keluar", logout);
module.exports = router;
