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
      // Convert target date to start of day in UTC
      const startDate = new Date(targetDate);
      startDate.setUTCHours(0, 0, 0, 0);
      
      // Set end date to start of next day
      const endDate = new Date(targetDate);
      endDate.setUTCHours(23, 59, 59, 999);
      endDate.setDate(endDate.getDate() + 1);  // Add one day to make window bigger than timestep

      // If target date is more than 24 hours in past, adjust to current time
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (startDate < yesterday) {
        startDate.setTime(yesterday.getTime());
        endDate.setTime(now.getTime());
      }

      // Make one API call with daily timesteps since some fields are only available in daily
      const response = await axios.get(this.baseUrl, {
        params: {
          location: `${latitude},${longitude}`,
          apikey: this.apiKey,
          units: 'imperial',
          timesteps: '1d,1h',
          fields: [
            'temperature',
            'temperatureMax',
            'temperatureMin',
            'temperatureApparent',
            'windSpeed',
            'weatherCode',
            'humidity',
            'visibility',
            'cloudCover',
            'sunriseTime',
            'sunsetTime'
          ]
        }
      });

      if (!response.data?.data?.timelines?.[0]?.intervals?.[0]) {
        throw new Error('Unexpected API response structure');
      }

      const dayData = response.data.data.timelines[0].intervals[0].values;
      const date = new Date(response.data.data.timelines[0].intervals[0].startTime);

      return {
        date: date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        status: getWeatherDescriptionFromCode(dayData.weatherCode.toString()),
        maxTemperature: dayData.temperatureMax?.toFixed(2),
        minTemperature: dayData.temperatureMin?.toFixed(2),
        apparentTemperature: dayData.temperatureApparent?.toFixed(2),
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
        humidity: dayData.humidity?.toFixed(2),
        windSpeed: dayData.windSpeed?.toFixed(2),
        visibility: dayData.visibility?.toFixed(2),
        cloudCover: dayData.cloudCover || 0
      };
    } catch (error) {
      console.error('API Error Details:', error.response?.data);
      throw error;
    }
}


}

module.exports = WeatherService;