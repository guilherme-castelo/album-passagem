const { MongoClient, ServerApiVersion } = require('mongodb');

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;

    const pass = encodeURIComponent(process.env.DB_PASS || '');
    const user = encodeURIComponent(process.env.DB_USER || '');
    const uri = `mongodb+srv://${user}:${pass}@cluster0.hh9vrmr.mongodb.net/?appName=Cluster0`;

    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    await client.connect();
    cachedDb = client.db("album-passagem");
    return cachedDb;
}

module.exports = connectToDatabase;
