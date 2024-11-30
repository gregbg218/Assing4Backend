// src/services/MongoService.js
const { MongoClient } = require('mongodb');

class MongoService {
  constructor() {
    this.uri = "mongodb+srv://greg:hOhX86M3CvMiHyVt@cluster0.ewy8j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = await MongoClient.connect(this.uri);
      this.db = this.client.db('hw3');
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async searchCities(searchText) {
    const db = await this.ensureConnection();
    try {
        console.log(`Searching for cities with text: ${searchText}`);
        
        const result = await db.collection('cities').find({
            city: { $regex: `^${searchText}`, $options: 'i' }
        })
        .limit(5)
        .toArray();
        
        console.log(`Found ${result.length} cities:`, result);
        return result;
    } catch (error) {
        console.error('Search cities error:', error);
        throw error;
    }
}

// Also add this method to initialize cities collection if needed
async initializeCities() {
  const db = await this.ensureConnection();
  const cities = await db.collection('cities').countDocuments();
  
  if (cities === 0) {
      const defaultCities = [
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
      
      try {
          await db.collection('cities').insertMany(defaultCities);
          console.log('Cities collection initialized with default data');
      } catch (error) {
          console.error('Error initializing cities:', error);
          throw error;
      }
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
    return await db.collection('favorites').find().toArray();
  }

  async addFavorite(city, state) {
    const db = await this.ensureConnection();
    return await db.collection('favorites').insertOne({ city, state });
  }

  async removeFavorite(city, state) {
    const db = await this.ensureConnection();
    return await db.collection('favorites').deleteOne({ city, state });
  }

  async checkFavorite(city, state) {
    const db = await this.ensureConnection();
    const favorite = await db.collection('favorites').findOne({ city, state });
    return !!favorite;
  }
}




// Create and export a singleton instance
const mongoService = new MongoService();
module.exports = mongoService;