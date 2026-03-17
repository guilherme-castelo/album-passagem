const connectToDatabase = require('../../lib/db');

class UserRepository {
  async getCollection() {
    const db = await connectToDatabase();
    return db.collection('admins');
  }

  async findAll() {
    const collection = await this.getCollection();
    const users = await collection.find({}, { projection: { password: 0 } }).toArray();
    return users.map((u) => ({ ...u, id: u._id.toString() }));
  }

  async findById(id) {
    const { ObjectId } = require('mongodb');
    const collection = await this.getCollection();
    return collection.findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });
  }

  async create(data) {
    const collection = await this.getCollection();
    const result = await collection.insertOne({ ...data, createdAt: new Date() });
    return { id: result.insertedId.toString(), username: data.username };
  }

  async update(id, data) {
    const { ObjectId } = require('mongodb');
    const collection = await this.getCollection();
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: data });
    return { id, success: true };
  }

  async delete(id) {
    const { ObjectId } = require('mongodb');
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async findByUsername(username) {
    const collection = await this.getCollection();
    return collection.findOne({ username });
  }
}

module.exports = new UserRepository();
