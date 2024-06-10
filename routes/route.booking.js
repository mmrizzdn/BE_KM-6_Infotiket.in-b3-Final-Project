const express = require("express");
const router = express.Router();

const {
  createBooking,
  getBooking,
} = require("../controllers/booking.controllers");

const { restrict } = require("../middleware/restrict");

// membuat data reservasi
router.post("/reservasi", restrict, createBooking);

// mengambil/menampilkan data reservasi
router.get("/reservasi", restrict, getBooking);

module.exports = router;
