const router = require("express").Router();
const { airports, airport } = require("../controllers/airports.controllers");

// router api bandara
router.get("/airports", airports);
router.get("/airport/:id", airport);

module.exports = router;
