const express = require("express");
const router = express.Router();

const {
  getAllNotification,
  getIdNotification,
} = require("../controllers/notification.controllers");
const { restrict } = require("../middleware/restrict");

router.get("/notifikasi", restrict, getAllNotification);
router.get("/notifikasi/:id", restrict, getIdNotification);
module.exports = router;
