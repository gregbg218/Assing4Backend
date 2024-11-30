// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const WeatherRoutes = require('./src/routes/WeatherRoutes');
const mongoService = require('./src/services/MongoService');

// Load environment variables
dotenv.config();

// Create express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/weather', WeatherRoutes);
app.use('/api/favorites', require('./src/routes/FavoritesRoutes'));
app.use('/api/autocomplete', require('./src/routes/AutocompleteRoutes'));

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('/api/geocoding', require('./src/routes/GeocodingRoutes'));

// Start server after MongoDB connection is established
async function startServer() {
  try {
      await mongoService.connect();
      await mongoService.initializeCities(); // Add this line
      app.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
      });
  } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
  }
}

// Start the server
startServer();