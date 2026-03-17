const connectToDatabase = require('../../lib/db');

class TrackRepository {
  async getCollection() {
    const db = await connectToDatabase();
    return db.collection('tracks');
  }

  // ─── Leitura ───────────────────────────────────────────────────────────────

  async findAll(query = {}) {
    const collection = await this.getCollection();
    return collection.find(query).sort({ order: 1, createdAt: 1 }).toArray();
  }

  async findById(trackId) {
    const { ObjectId } = require('mongodb');
    const collection = await this.getCollection();
    return collection.findOne({ _id: new ObjectId(trackId) });
  }

  // ─── Criação ───────────────────────────────────────────────────────────────

  async create(trackData) {
    const collection = await this.getCollection();

    const doc = {
      ...trackData,
      albumId: trackData.albumId || null,
      order: trackData.order || 999,
      createdAt: new Date()
    };
    const result = await collection.insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  // ─── Atualização ───────────────────────────────────────────────────────────

  async update(trackId, data) {
    const { ObjectId } = require('mongodb');
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(trackId) },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  }

  async updateLikes(trackId, likes) {
    const { ObjectId } = require('mongodb');
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(trackId) },
      { $set: { 'interactions.likes': likes } }
    );
  }

  async updateRatings(trackId, ratings) {
    const { ObjectId } = require('mongodb');
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(trackId) },
      { $set: { 'interactions.ratings': ratings } }
    );
  }

  // ─── Remoção ───────────────────────────────────────────────────────────────

  async delete(trackId) {
    const { ObjectId } = require('mongodb');
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(trackId) });
    return result.deletedCount > 0;
  }
}

module.exports = new TrackRepository();
