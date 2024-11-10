const axios = require('axios');
require('dotenv').config();

const getWeatherDescriptionFromCode = (code) => {
  const codeMap = {
    '1000': 'Clear',
    '1100': 'Mostly Clear',
    '1101': 'Partly Cloudy',
    '1102': 'Mostly Cloudy',
    '1001': 'Cloudy',
    '2000': 'Fog',
    '2100': 'Light Fog',
    '4000': 'Drizzle',
    '4001': 'Rain',
    '4200': 'Light Rain',
    '4201': 'Heavy Rain',
    '5000': 'Snow',
    '5001': 'Flurries',
    '5100': 'Light Snow',
    '5101': 'Heavy Snow',
    '6000': 'Freezing Drizzle',
    '6001': 'Freezing Rain',
    '6200': 'Light Freezing Rain',
    '6201': 'Heavy Freezing Rain',
    '7000': 'Ice Pellets',
    '7101': 'Heavy Ice Pellets',
    '7102': 'Light Ice Pellets',
    '8000': 'Thunderstorm'
  };
  return codeMap[code] || "Unknown";
};

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
          timezone: 'America/Los_Angeles',
          fields: [
            'temperature',
            'temperatureMax',
            'temperatureMin',
            'windSpeed',
            'weatherCode'
          ]
        }
      });

      return this.transformForecastData(response.data.data);
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

  async getDayWeatherData(latitude, longitude, targetDate) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          location: `${latitude},${longitude}`,
          apikey: this.apiKey,
          units: 'imperial',
          timesteps: '1d',
          timezone: 'America/Los_Angeles',
          fields: [
            'weatherCode',
            'temperatureMax',
            'temperatureMin',
            'temperatureApparent',
            'windSpeed',
            'humidity',
            'visibility',
            'cloudCover',
            'sunriseTime',
            'sunsetTime'
          ]
        }
      });
  
      if (!response.data?.data?.timelines?.[0]?.intervals) {
        throw new Error('Unexpected API response structure');
      }
  
      // Find the interval matching our target date using UTC comparison
      const targetInterval = response.data.data.timelines[0].intervals.find(interval => {
        const intervalDate = new Date(interval.startTime);
        const requestDate = new Date(targetDate);
        return (
          intervalDate.getUTCFullYear() === requestDate.getUTCFullYear() &&
          intervalDate.getUTCMonth() === requestDate.getUTCMonth() &&
          intervalDate.getUTCDate() === requestDate.getUTCDate()
        );
      });
  
      if (!targetInterval) {
        throw new Error('No data available for the requested date');
      }
  
      const dayData = targetInterval.values;
      
      const date = new Date("2024-11-13T00:00:00.000Z");
      date.setDate(date.getDate() + 1);  // Add one day
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).replace(',', '').replace('.', '');
        
      return {
        date: formattedDate,
        status: getWeatherDescriptionFromCode(dayData.weatherCode.toString()),
        maxTemperature: dayData.temperatureMax?.toFixed(2),
        minTemperature: dayData.temperatureMin?.toFixed(2),
        apparentTemperature: dayData.temperatureApparent?.toFixed(2) || 'N/A',
        sunriseTime: dayData.sunriseTime ? new Date(dayData.sunriseTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }) : 'N/A',
        sunsetTime: dayData.sunsetTime ? new Date(dayData.sunsetTime).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }) : 'N/A',
        humidity: dayData.humidity?.toFixed(2) || 'N/A',
        windSpeed: dayData.windSpeed?.toFixed(2),
        visibility: dayData.visibility?.toFixed(2) || 'N/A',
        cloudCover: dayData.cloudCover || 'N/A'
      };
    } catch (error) {
      console.error('API Error Details:', error.response?.data);
      throw error;
    }
  }
}

module.exports = WeatherService;