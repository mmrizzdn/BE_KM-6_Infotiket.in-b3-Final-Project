const router = require('express').Router();
const {
	createAirplane,
	getAllAirplanes,
	getAirplaneById,
	updateAirplane,
	deleteAirplane
} = require('../controllers/airplane.controllers');

const { restrict } = require('../middleware/restrict');
const { isAdmin } = require('../middleware/admin');

// router api pesawat terbang
router.post('/airplanes', restrict, isAdmin, createAirplane);
router.get('/airplanes', getAllAirplanes);
router.get('/airplanes/:id', getAirplaneById);
router.put('/airplanes/:id', restrict, isAdmin, updateAirplane);
router.delete('/airplanes/:id', restrict, isAdmin, deleteAirplane);

module.exports = router;
