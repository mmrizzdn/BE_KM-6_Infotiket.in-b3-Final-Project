const router = require('express').Router();
const { airplanes, airplane } = require('../controllers/airplane.controllers');

// router api bandara
router.get('/airplanes', airplanes);
router.get('/airplanes/:id', airplane);

module.exports = router;
