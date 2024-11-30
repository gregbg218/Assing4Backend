const express = require('express');
const router = express.Router();
const GeocodingController = require('../controllers/GeocodingController');

const geocodingController = new GeocodingController();

router.get('/coordinates', (req, res) => 
    geocodingController.getCoordinates(req, res)
);

module.exports = router;