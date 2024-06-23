const express = require("express");
const router = express.Router();

const { restrict } = require("../middleware/restrict");
const { createBookingWithPassengers, getBookingsByUserId, getPendingBookingsByUserId } = require("../controllers/bookings&passengers.controllers");

router.post("/booking", restrict, createBookingWithPassengers);

router.get("/get-booking", restrict, getBookingsByUserId);

router.get("/get-pending-booking", restrict, getPendingBookingsByUserId);

module.exports = router;