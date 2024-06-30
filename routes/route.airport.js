const router = require("express").Router();
const {
  createAirport,
  getAllAirports,
  getAirportById,
  updateAirportById,
  deleteAirportByid,
} = require("../controllers/airports.controllers");
const { restrict } = require("../middleware/restrict");
const { isAdmin } = require("../middleware/admin");

// router api bandara
router.post("/bandara", restrict, isAdmin, createAirport);
router.get("/bandara", getAllAirports);
router.get("/bandara/:id", getAirportById);
router.put("/bandara/:id", restrict, isAdmin, updateAirportById);
router.delete("/bandara/:id", restrict, isAdmin, deleteAirportByid);

module.exports = router;
