const connectToDatabase = require('../../lib/db');

class AuthRepository {
    async getCollection() {
        const db = await connectToDatabase();
        return db.collection('admins');
    }

    async findByUsername(username) {
        const collection = await this.getCollection();
        return collection.findOne({ username });
    }

    async findAll() {
        const collection = await this.getCollection();
        return collection.find({}, { projection: { password: 0 } }).toArray();
    }
}

module.exports = new AuthRepository();
