const express = require("express");
const router = express.Router();

const {
  createProfile,
  getAllProfile,
  getProfile,
  updateProfile,
  deleteProfile,
} = require("../controllers/profile.controllers");
const { image } = require("../libs/multer");
const { restrict } = require("../middleware/restrict");
const { isAdmin } = require("../middleware/admin");

// all router api profile

router.post("/profil", createProfile);

// router api get all profile
router.get("/profile", restrict, isAdmin, getAllProfile);

// router api get profil
router.get("/profil", restrict, getProfile);

// router api update profile
router.put("/profil", restrict, image.single("gambar_url"), updateProfile);

router.delete("/profil/:id", restrict, restrict, isAdmin, deleteProfile);

module.exports = router;
