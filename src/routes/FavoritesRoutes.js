const express = require('express');
const router = express.Router();
const mongoService = require('../services/MongoService');
const FavoritesController = require('../controllers/FavoritesController');

const favoritesController = new FavoritesController(mongoService);

// Get all favorites list
router.get('/list', async (req, res) => {
    try {
        const favorites = await mongoService.getFavorites();
        res.json({
            success: true,
            data: favorites || []
        });
    } catch (error) {
        console.error('Error getting favorites:', error);
        // Return empty array on error to prevent app crashes
        res.json({
            success: true,
            data: []
        });
    }
});

// Keep your existing routes
router.get('/status', (req, res) => favoritesController.checkFavorite(req, res));
router.post('/add', (req, res) => favoritesController.addFavorite(req, res));
router.delete('/remove', (req, res) => favoritesController.removeFavorite(req, res));


module.exports = router;