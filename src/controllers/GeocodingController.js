const GeocodingService = require('../services/GeocodingService');

class GeocodingController {
    constructor() {
        this.geocodingService = new GeocodingService();
    }

    async getCoordinates(req, res) {
        try {
            const { address } = req.query;
            
            if (!address) {
                return res.status(400).json({
                    success: false,
                    error: 'Address is required'
                });
            }
    
            const coordinates = await this.geocodingService.getCoordinates(address);
            res.json({
                success: true,
                coordinates
            });
    
        } catch (error) {
            console.error('Geocoding error:', error);
            res.status(500).json({
                success: false,
                error: 'Error getting coordinates'
            });
        }
    }
}

module.exports = GeocodingController;