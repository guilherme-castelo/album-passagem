const connectToDatabase = require('../../lib/db');

class AlbumRepository {
    async getCollection() {
        const db = await connectToDatabase();
        return db.collection('album');
    }

    async findAll() {
        const collection = await this.getCollection();
        const albums = await collection.find({}).toArray();
        return albums.map(a => ({ ...a, id: a._id.toString() }));
    }

    async findById(id) {
        const { ObjectId } = require('mongodb');
        const collection = await this.getCollection();
        const album = await collection.findOne({ _id: new ObjectId(id) });
        return album ? { ...album, id: album._id.toString() } : null;
    }

    async create(data) {
        const collection = await this.getCollection();
        const result = await collection.insertOne({ ...data, createdAt: new Date() });
        return { id: result.insertedId.toString(), ...data };
    }

    async update(id, data) {
        const { ObjectId } = require('mongodb');
        const collection = await this.getCollection();
        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        return result ? { ...result, id: result._id.toString() } : null;
    }

    async delete(id) {
        const { ObjectId } = require('mongodb');
        const collection = await this.getCollection();
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
}

module.exports = new AlbumRepository();
