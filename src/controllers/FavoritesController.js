// src/controllers/FavoritesController.js
class FavoritesController {
    constructor(mongoService) {
      if (!mongoService) {
        throw new Error('MongoService is required');
      }
      this.mongoService = mongoService;
    }
  
    async getFavorites(req, res) {
      try {
        const favorites = await this.mongoService.getFavorites();
        res.json({ success: true, data: favorites });
      } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ success: false, error: 'Error fetching favorites' });
      }
    }
  
    async checkFavorite(req, res) {
      try {
        const { city, state } = req.query;
        if (!city || !state) {
          return res.status(400).json({ error: 'City and state are required' });
        }
        const isFavorite = await this.mongoService.checkFavorite(city, state);
        res.json({ success: true, isFavorite });
      } catch (error) {
        console.error('Check favorite error:', error);
        res.status(500).json({ success: false, error: 'Error checking favorite status' });
      }
    }
  
    async addFavorite(req, res) {
      try {
        const { city, state } = req.body;
        console.log('Adding favorite:', { city, state });
        if (!city || !state) {
          return res.status(400).json({ error: 'City and state are required' });
        }
        await this.mongoService.addFavorite(city, state);
        res.json({ success: true });
      } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ success: false, error: 'Error adding favorite' });
      }
    }
  
    async removeFavorite(req, res) {
      try {
        const { city, state } = req.query;
        if (!city || !state) {
          return res.status(400).json({ error: 'City and state are required' });
        }
        await this.mongoService.removeFavorite(city, state);
        res.json({ success: true });
      } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ success: false, error: 'Error removing favorite' });
      }
    }
  }
  
  module.exports = FavoritesController;