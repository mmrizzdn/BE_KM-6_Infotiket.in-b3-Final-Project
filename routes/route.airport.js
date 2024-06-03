const router = require("express").Router();
const { airports, airport } = require("../controllers/airports.controllers");

// router api bandara
router.get("/bandara", airports);
router.get("/bandara/:id", airport);

module.exports = router;
