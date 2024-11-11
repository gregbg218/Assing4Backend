// src/routes/FavoritesRoutes.js
const express = require('express');
const router = express.Router();
const FavoritesController = require('../controllers/FavoritesController');
const mongoService = require('../services/MongoService'); // Import the instance directly

const favoritesController = new FavoritesController(mongoService);

router.get('/', (req, res) => favoritesController.getFavorites(req, res));
router.get('/check', (req, res) => favoritesController.checkFavorite(req, res));
router.post('/', (req, res) => favoritesController.addFavorite(req, res));
router.delete('/', (req, res) => favoritesController.removeFavorite(req, res));

module.exports = router;