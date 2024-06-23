const express = require("express");
const router = express.Router();

const { restrict } = require("../middleware/restrict");
const { createBookingWithPassengers } = require("../controllers/bookings&passengers.controllers");

router.post("/booking", restrict, createBookingWithPassengers);

module.exports = router;