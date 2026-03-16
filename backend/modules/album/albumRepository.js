const connectToDatabase = require('../../lib/db');

class AlbumRepository {
    async getCollection() {
        const db = await connectToDatabase();
        return db.collection('album');
    }

    async findOne() {
        const collection = await this.getCollection();
        // Album é um documento singleton — só existe um registro
        return collection.findOne({}, { projection: { _id: 0 } });
    }

    async updateOne(data) {
        const collection = await this.getCollection();
        return collection.findOneAndUpdate(
            {},
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: 'after', upsert: true, projection: { _id: 0 } }
        );
    }
}

module.exports = new AlbumRepository();
