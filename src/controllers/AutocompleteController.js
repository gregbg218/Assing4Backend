const axios = require('axios');

class AutocompleteController {
    async getAutocompleteSuggestions(req, res) {
        try {
            const { input } = req.query;
            
            if (!input) {
                return res.json({ predictions: [] });
            }
    
            const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
                params: {
                    input: input,
                    types: '(cities)',
                    components: 'country:us',
                    key: process.env.GOOGLE_MAPS_API_KEY
                }
            });
    
            res.json(response.data);
        } catch (error) {
            console.error('Autocomplete error:', error);
            res.status(500).json({
                error: 'Error fetching suggestions'
            });
        }
    }
}

module.exports = AutocompleteController;