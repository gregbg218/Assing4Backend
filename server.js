// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const WeatherRoutes = require('./src/routes/WeatherRoutes');
const mongoService = require('./src/services/MongoService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/weather', WeatherRoutes);
app.use('/api/favorites', require('./src/routes/FavoritesRoutes'));

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server after MongoDB connection is established
async function startServer() {
  try {
    await mongoService.connect();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();