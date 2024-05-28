const express = require("express");
const router = express.Router();

const {
  profileGet,
  profilePut,
} = require("../controllers/profile.controllers");
const { image } = require("../libs/multer");
const restrict = require("../middleware/restrict");

// all router api profile

// get profile
router.get("/profile", restrict, profileGet);

// update profile
router.put("/profile", restrict, image.single("gambar_url"), profilePut);

module.exports = router;
