const axios = require('axios');
require('dotenv').config();

class WeatherService {
  constructor() {
    if (!process.env.TOMORROW_API_KEY) {
      throw new Error('TOMORROW_API_KEY is not defined in environment variables');
    }
    this.apiKey = process.env.TOMORROW_API_KEY;
    this.baseUrl = 'https://api.tomorrow.io/v4/timelines';
  }

  async getForecastData(latitude, longitude) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          location: `${latitude},${longitude}`,
          apikey: this.apiKey,
          units: 'imperial',
          timesteps: '1d',
          fields: [
            'temperature',
            'temperatureMax',
            'temperatureMin',
            'windSpeed',
            'weatherCode'
          ]
        }
      });

      return this.transformForecastData(response.data.data); // Note the .data.data here
    } catch (error) {
      console.error('API Error Details:', error.response?.data);
      throw error;
    }
  }

  transformForecastData(data) {
    if (!data?.timelines?.[0]?.intervals) {
      throw new Error('Unexpected API response structure');
    }

    return data.timelines[0].intervals.map((interval, index) => {
      const values = interval.values;
      
      return {
        id: index + 1,
        date: new Date(interval.startTime).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        status: values.weatherCode,
        tempHigh: values.temperatureMax.toFixed(2),
        tempLow: values.temperatureMin.toFixed(2),
        windSpeed: values.windSpeed.toFixed(2)
      };
    });
  }

  
}

module.exports = WeatherService;