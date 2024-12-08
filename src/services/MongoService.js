const { MongoClient } = require('mongodb');

class MongoService {
  constructor() {
    this.uri = "mongodb+srv://greg:hOhX86M3CvMiHyVt@cluster0.ewy8j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    this.client = null;
    this.db = null;
    this.defaultCities = [
      { city: "Los Angeles", state: "California" },
      { city: "Las Vegas", state: "Nevada" },
      { city: "Seattle", state: "Washington" },
      { city: "New York", state: "New York" },
      { city: "Chicago", state: "Illinois" },
      { city: "San Francisco", state: "California" },
      { city: "San Diego", state: "California" },
      { city: "San Jose", state: "California" },
      { city: "Miami", state: "Florida" },
      { city: "Boston", state: "Massachusetts" }
    ];
  }

  async connect() {
    try {
      this.client = await MongoClient.connect(this.uri);
      this.db = this.client.db('hw3');
      
      // Create indexes for better performance and data integrity
      await this.createIndexes();
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async createIndexes() {
    const db = await this.ensureConnection();
    try {
      // Create compound unique index for favorites
      await db.collection('favorites').createIndex(
        { city: 1, state: 1 }, 
        { unique: true }
      );

      // Create text index for cities search
      await db.collection('cities').createIndex(
        { city: 1, state: 1 }
      );
    } catch (error) {
      console.error('Error creating indexes:', error);
      throw error;
    }
  }

  async initializeCities() {
    const db = await this.ensureConnection();
    try {
      const cities = await db.collection('cities').countDocuments();
      
      if (cities === 0) {
        await db.collection('cities').insertMany(this.defaultCities);
        console.log('Cities collection initialized with default data');
      } else {
        console.log('Cities collection already initialized');
      }
    } catch (error) {
      console.error('Error initializing cities:', error);
      throw error;
    }
  }

  async ensureConnection() {
    if (!this.db) {
      await this.connect();
    }
    return this.db;
  }

  async getFavorites() {
    const db = await this.ensureConnection();
    try {
        const favorites = await db.collection('favorites')
            .find()
            .sort({ dateAdded: -1 })
            .toArray();
        
        return favorites || [];
    } catch (error) {
        console.error('Get favorites error:', error);
        return []; // Return empty array on error
    }
}

  async addFavorite(city, state) {
    const db = await this.ensureConnection();
    try {
      // First check if it already exists
      const existing = await this.checkFavorite(city, state);
      if (existing) {
        throw new Error('City is already in favorites');
      }

      // Add with timestamp
      return await db.collection('favorites').insertOne({
        city: city.trim(),
        state: state.trim(),
        dateAdded: new Date()
      });
    } catch (error) {
      console.error('Add favorite error:', error);
      throw error;
    }
  }

  async removeFavorite(city, state) {
    const db = await this.ensureConnection();
    try {
        const result = await db.collection('favorites').deleteOne({
            city: city.trim(),
            state: state.trim()
        });

        if (result.deletedCount === 0) {
            throw new Error('City not found in favorites');
        }

        return result;
    } catch (error) {
        console.error('Remove favorite error:', error);
        throw error;
    }
}

  async checkFavorite(city, state) {
    const db = await this.ensureConnection();
    try {
      const favorite = await db.collection('favorites').findOne({
        city: city.trim(),
        state: state.trim()
      });
      return !!favorite;
    } catch (error) {
      console.error('Check favorite error:', error);
      throw error;
    }
  }

  async searchCities(searchText) {
    const db = await this.ensureConnection();
    try {
      if (!searchText || searchText.length < 3) {
        return [];
      }

      return await db.collection('cities')
        .find({
          city: { 
            $regex: `^${searchText}`, 
            $options: 'i' 
          }
        })
        .limit(5)
        .toArray();
    } catch (error) {
      console.error('Search cities error:', error);
      throw error;
    }
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }
}

// Create and export a singleton instance
const mongoService = new MongoService();
module.exports = mongoService;