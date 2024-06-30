const router = require('express').Router();
const {
	createAirline,
	getAllAirlines,
	getAirlineById,
	updateAirline,
	deleteAirline
} = require('../controllers/airline.controllers');

const { restrict } = require('../middleware/restrict');
const { isAdmin } = require('../middleware/admin');
const { image } = require('../libs/multer');

// router api perusahaan penerbangan
router.post(
	'/airlines',
	restrict,
	isAdmin,
	image.single('file'),
	createAirline
);
router.get('/airlines', getAllAirlines);
router.get('/airlines/:id', getAirlineById);
router.put(
	'/airlines/:id',
	restrict,
	isAdmin,
	image.single('file'),
	updateAirline
);
router.delete('/airlines/:id', restrict, isAdmin, deleteAirline);

module.exports = router;
