const router = require("express").Router();
const { getFlights } = require("../controllers/flights.controllers");

// router api penerbangan
router.get("/flights", getFlights);

module.exports = router;
