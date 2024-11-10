const WeatherService = require('../services/WeatherService');

class WeatherController {
  constructor() {
    this.weatherService = new WeatherService();
  }

  async getDailyForecast(req, res) {
    try {
      const { latitude, longitude } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ 
          error: 'Latitude and longitude are required'
        });
      }

      const forecast = await this.weatherService.getForecastData(
        latitude, 
        longitude
      );
      
      res.json({
        success: true,
        data: forecast
      });
    } catch (error) {
      console.error('Forecast error:', error);
      
      if (error.response?.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'API Key is invalid or not properly configured'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error fetching weather forecast',
        message: error.message
      });
    }
  }

  async getDayWeather(req, res) {
    try {
      const { latitude, longitude, date } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ 
          error: 'Latitude and longitude are required'
        });
      }

      if (!date) {
        return res.status(400).json({ 
          error: 'Date is required'
        });
      }

      // Validate date format
      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({ 
          error: 'Invalid date format. Please use YYYY-MM-DD'
        });
      }

      const dayWeather = await this.weatherService.getDayWeatherData(
        latitude, 
        longitude,
        targetDate
      );
      
      res.json({
        success: true,
        data: dayWeather
      });
    } catch (error) {
      console.error('Day weather error:', error);
      
      if (error.response?.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'API Key is invalid or not properly configured'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error fetching day weather data',
        message: error.message
      });
    }
  }

  async getMeteogramData(req, res) {
    try {
      const { latitude, longitude } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ 
          error: 'Latitude and longitude are required'
        });
      }

      const meteogramData = await this.weatherService.getMeteogramData(
        latitude, 
        longitude
      );
      
      res.json({
        success: true,
        data: meteogramData
      });
    } catch (error) {
      console.error('Meteogram error:', error);
      
      if (error.response?.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'API Key is invalid or not properly configured'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error fetching meteogram data',
        message: error.message
      });
    }
  }
}

module.exports = {
  WeatherController,
  weatherController: new WeatherController()
};