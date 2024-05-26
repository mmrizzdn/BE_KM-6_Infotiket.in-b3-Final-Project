const express = require("express");
const router = express.Router();

const {
  register,
  login,
  firstPage,
} = require("../controllers/auth.controllers");

const restrict = require("../middleware/restrict");

// router api auth
router.post("/register", register);
router.post("/login", login);
router.get("/", restrict, firstPage);

module.exports = router;
