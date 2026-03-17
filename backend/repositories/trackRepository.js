const connectToDatabase = require('../lib/db');

class TrackRepository {
  async getCollection() {
    const db = await connectToDatabase();
    return db.collection('tracks');
  }

  async findAll() {
    const collection = await this.getCollection();
    return collection
      .find({}, { projection: { _id: 0 } })
      .sort({ id: 1 })
      .toArray();
  }

  async findById(trackId) {
    const collection = await this.getCollection();
    return collection.findOne({ id: trackId });
  }

  async updateLikes(trackId, likes) {
    const collection = await this.getCollection();
    await collection.updateOne({ id: trackId }, { $set: { 'interactions.likes': likes } });
  }

  async updateRatings(trackId, ratings) {
    const collection = await this.getCollection();
    await collection.updateOne({ id: trackId }, { $set: { 'interactions.ratings': ratings } });
  }
}

module.exports = new TrackRepository();
