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