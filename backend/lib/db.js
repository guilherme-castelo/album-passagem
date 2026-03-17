const { MongoClient, ServerApiVersion } = require('mongodb');

let cachedDb = null;

// DB_NAME allows switching between databases per branch/environment:
//   - main branch: DB_NAME=album-passagem (legacy)
//   - develop/feature branches: DB_NAME=album-platform (SaaS)
const DB_NAME = process.env.DB_NAME || 'album-platform';

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

  try {
    await client.connect();
    cachedDb = client.db(DB_NAME);
    console.log(`📦 Connected to database: ${DB_NAME}`);
    return cachedDb;
  } catch (err) {
    console.error(`Fatal error connecting to MongoDB (${DB_NAME})`, err);
    throw err;
  }
}

module.exports = connectToDatabase;

