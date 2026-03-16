const connectToDatabase = require('../../lib/db');

class TrackRepository {
    async getCollection() {
        const db = await connectToDatabase();
        return db.collection('tracks');
    }

    // ─── Leitura ───────────────────────────────────────────────────────────────

    async findAll() {
        const collection = await this.getCollection();
        return collection.find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray();
    }

    async findById(trackId) {
        const collection = await this.getCollection();
        return collection.findOne({ id: trackId }, { projection: { _id: 0 } });
    }

    // ─── Criação ───────────────────────────────────────────────────────────────

    async create(trackData) {
        const collection = await this.getCollection();
        // Gera o próximo ID sequencial
        const last = await collection.find({}).sort({ id: -1 }).limit(1).toArray();
        const nextId = last.length > 0 ? last[0].id + 1 : 1;

        const doc = { ...trackData, id: nextId };
        await collection.insertOne(doc);
        const { _id, ...result } = doc;
        return result;
    }

    // ─── Atualização ───────────────────────────────────────────────────────────

    async update(trackId, data) {
        const collection = await this.getCollection();
        const result = await collection.findOneAndUpdate(
            { id: trackId },
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: 'after', projection: { _id: 0 } }
        );
        return result;
    }

    async updateLikes(trackId, likes) {
        const collection = await this.getCollection();
        await collection.updateOne(
            { id: trackId },
            { $set: { 'interactions.likes': likes } }
        );
    }

    async updateRatings(trackId, ratings) {
        const collection = await this.getCollection();
        await collection.updateOne(
            { id: trackId },
            { $set: { 'interactions.ratings': ratings } }
        );
    }

    // ─── Remoção ───────────────────────────────────────────────────────────────

    async delete(trackId) {
        const collection = await this.getCollection();
        const result = await collection.deleteOne({ id: trackId });
        return result.deletedCount > 0;
    }
}

module.exports = new TrackRepository();
