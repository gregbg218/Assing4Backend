const axios = require('axios');

class GeocodingService {
    async getCoordinates(address) {
        try {
            const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: address,
                    key: process.env.GOOGLE_MAPS_API_KEY
                }
            });

            if (response.data.status === 'OK' && response.data.results.length > 0) {
                const location = response.data.results[0].geometry.location;
                return {
                    latitude: location.lat,
                    longitude: location.lng,
                    formatted_address: response.data.results[0].formatted_address
                };
            } else {
                throw new Error('No results found');
            }
        } catch (error) {
            console.error('Geocoding service error:', error);
            throw error;
        }
    }
}

module.exports = GeocodingService;