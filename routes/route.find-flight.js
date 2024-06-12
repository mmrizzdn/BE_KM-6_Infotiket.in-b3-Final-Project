const router = require("express").Router();
const { getFlights } = require("../controllers/flights.controllers");

// router api bandara
router.get("/flights", getFlights);

module.exports = router;