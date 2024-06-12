const express = require("express");
const router = express.Router();

const { restrict } = require("../middleware/restrict");
const { addPassenger } = require("../controllers/passenger.controllers");

// router api penumpang
router.post("/addPassengers", restrict, addPassenger);

module.exports = router;
