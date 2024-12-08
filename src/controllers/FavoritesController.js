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
      res.json({
        success: true,
        data: favorites
      });
    } catch (error) {
      console.error('Get favorites error:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching favorites',
        message: error.message
      });
    }
  }

  async checkFavorite(req, res) {
    try {
      const { city, state } = req.query;

      if (!city || !state) {
        return res.status(400).json({
          success: false,
          error: 'Missing parameters',
          message: 'Both city and state are required'
        });
      }

      const isFavorite = await this.mongoService.checkFavorite(city, state);
      res.json({
        success: true,
        isFavorite
      });
    } catch (error) {
      console.error('Check favorite error:', error);
      res.status(500).json({
        success: false,
        error: 'Error checking favorite status',
        message: error.message
      });
    }
  }

  async addFavorite(req, res) {
    try {
      const { city, state } = req.body;

      if (!city || !state) {
        return res.status(400).json({
          success: false,
          error: 'Missing parameters',
          message: 'Both city and state are required'
        });
      }

      await this.mongoService.addFavorite(city, state);
      res.json({
        success: true,
        message: `${city}, ${state} added to favorites`
      });
    } catch (error) {
      if (error.message === 'City is already in favorites') {
        return res.status(409).json({
          success: false,
          error: 'Duplicate favorite',
          message: error.message
        });
      }

      console.error('Add favorite error:', error);
      res.status(500).json({
        success: false,
        error: 'Error adding favorite',
        message: error.message
      });
    }
  }

  async removeFavorite(req, res) {
    try {
      // Log the incoming request
      console.log('Remove favorite request:', req.query, req.body);

      // Try to get parameters from either query or body
      const city = req.query.city || (req.body && req.body.city);
      const state = req.query.state || (req.body && req.body.state);

      if (!city || !state) {
        return res.status(400).json({
          success: false,
          error: 'Missing parameters',
          message: 'Both city and state are required'
        });
      }

      await this.mongoService.removeFavorite(city, state);
      return res.json({
        success: true,
        message: `${city}, ${state} removed from favorites`
      });
    } catch (error) {
      console.error('Remove favorite error:', error);

      if (error.message === 'City not found in favorites') {
        return res.status(404).json({
          success: false,
          error: 'Not found',
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Error removing favorite',
        message: error.message
      });
    }
  }
}

module.exports = FavoritesController;