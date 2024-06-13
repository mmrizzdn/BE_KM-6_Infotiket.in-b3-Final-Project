const express = require("express");
const router = express.Router();

const {
  profileGet,
  profilePut,
} = require("../controllers/profile.controllers");
const { image } = require("../libs/multer");
const { restrict } = require("../middleware/restrict");

// all router api profile

// router api get profil
router.get("/profil", restrict, profileGet);

// router api update profile
router.put("/profil", restrict, image.single("gambar_url"), profilePut);

module.exports = router;
