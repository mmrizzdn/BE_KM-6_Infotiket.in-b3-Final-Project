const express = require("express");
const router = express.Router();

const {
  profileGet,
  profilePut,
} = require("../controllers/profile.controllers");
const { image } = require("../libs/multer");
const { restrict } = require("../middleware/restrict");

// all router api profile

// get profile
router.get("/profil", restrict, profileGet);

// update profile
router.put("/profil", restrict, image.single("gambar_url"), profilePut);

module.exports = router;
