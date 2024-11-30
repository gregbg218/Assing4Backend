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
      const options = {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'content-type': 'application/json'
        },
        data: {
          location: `${latitude},${longitude}`,
          fields: [
            'temperature',
            'temperatureMax',
            'temperatureMin',
            'windSpeed',
            'weatherCode'
          ],
          units: 'imperial',
          timesteps: ['1d'],
        }
      };

      const response = await axios.post(`${this.baseUrl}?apikey=${this.apiKey}`, options.data, {
        headers: options.headers
      });

      return this.transformForecastData(response.data.data);
    } catch (error) {
      console.error('API Error Details:', error.response?.data);
      throw error;
    }
  }

  async getDayWeatherData(latitude, longitude, targetDate) {
    try {
      const options = {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'content-type': 'application/json'
        },
        data: {
          location: `${latitude},${longitude}`,
          fields: [
            'weatherCode',
           
            'temperatureMax',
            'temperatureMin',
            'pressureSeaLevel',
            'windSpeed',
            'humidity',
            'visibility',
            'temperature',
            'sunriseTime',
            'sunsetTime'
          ],
          units: 'imperial',
          timesteps: ['1d'],
        }
      };

      const response = await axios.post(`${this.baseUrl}?apikey=${this.apiKey}`, options.data, {
        headers: options.headers
      });

      if (!response.data?.data?.timelines?.[0]?.intervals) {
        throw new Error('Unexpected API response structure');
      }

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
      const date = new Date(targetDate);
      date.setDate(date.getDate() + 1);
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
        pressureSeaLevel: dayData.pressureSeaLevel?.toFixed(2) ,
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
        temperature: dayData.temperature.toFixed(2)
      };
    } catch (error) {
      console.error('API Error Details:', error.response?.data);
      throw error;
    }
  }

  async getMeteogramData(latitude, longitude) {
    try {
      const options = {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'content-type': 'application/json'
        },
        data: {
          location: `${latitude},${longitude}`,
          fields: [
            'temperature',
            'humidity',
            'pressureSeaLevel',
            'windSpeed',
            'windDirection',
            'cloudCover',
            'precipitationProbability',
            'weatherCode'
          ],
          units: 'imperial',
          timesteps: ['1h'],
          startTime: 'now',
          endTime: 'nowPlus5d'
        }
      };

      const response = await axios.post(`${this.baseUrl}?apikey=${this.apiKey}`, options.data, {
        headers: options.headers
      });

      if (!response.data?.data?.timelines?.[0]?.intervals) {
        throw new Error('Unexpected API response structure');
      }

      return this.transformMeteogramData(response.data.data.timelines[0].intervals);
    } catch (error) {
      console.error('API Error Details:', error.response?.data);
      throw error;
    }
  }

  transformMeteogramData(intervals) {
    const times = [];
    const temperatures = [];
    const humidity = [];
    const pressure = [];
    const winds = [];

    intervals.forEach((interval, index) => {
      const time = new Date(interval.startTime).getTime();
      const values = interval.values;

      times.push(time);
      temperatures.push({
        x: time,
        y: values.temperature
      });

      humidity.push({
        x: time,
        y: values.humidity
      });

      pressure.push({
        x: time,
        y: values.pressureSeaLevel
      });

      // Add wind data every 2 hours
      if (index % 2 === 0) {
        winds.push({
          x: time,
          value: values.windSpeed,
          direction: values.windDirection
        });
      }
    });

    return {
      times,
      temperatures,
      humidity,
      pressure,
      winds
    };
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