const { MongoClient } = require('mongodb');

class MongoService {
  constructor() {
    this.uri = "mongodb+srv://greg:hOhX86M3CvMiHyVt@cluster0.ewy8j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    this.client = null;
    this.db = null;
  }

  async connect() {
    if (!this.client) {
      try {
        this.client = await MongoClient.connect(this.uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        this.db = this.client.db('weather_app'); // specify your database name
        console.log('MongoDB connected successfully');
      } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
      }
    }
    return this.db;
  }

  async getDB() {
    if (!this.db) {
      await this.connect();
    }
    return this.db;
  }

  async getFavorites() {
    const db = await this.getDB();
    return await db.collection('favorites').find().toArray();
  }

  async addFavorite(city, state) {
    const db = await this.getDB();
    return await db.collection('favorites').insertOne({ city, state });
  }

  async removeFavorite(city, state) {
    const db = await this.getDB();
    return await db.collection('favorites').deleteOne({ city, state });
  }

  async checkFavorite(city, state) {
    const db = await this.getDB();
    const favorite = await db.collection('favorites').findOne({ city, state });
    return !!favorite;
  }
}

const mongoService = new MongoService();
module.exports = mongoService;  // Exporting the instance, not the class