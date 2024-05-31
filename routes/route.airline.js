const router = require('express').Router();
const { airlines, airline } = require('../controllers/airline.controllers');

// router api bandara
router.get('/airlines', airlines);
router.get('/airlines/:id', airline);

module.exports = router;
