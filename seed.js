require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');
const path = require('path');

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

async function run() {
  try {
    await client.connect();
    console.log('✈️ Conectado ao MongoDB para o Embarque (Seed)!');
    
    const db = client.db("album-passagem");
    const collection = db.collection('tracks');

    const filePath = path.join(__dirname, 'data', 'musicas.json');
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(fileData);
    
    // Limpa a collection atual pra evitar duplicação em caso de re-seed
    await collection.deleteMany({});
    console.log('Pista limpa...');
    
    // Salva arquivo no MongoDB
    await collection.insertMany(parsed.tracks);
    
    console.log(`✅ ${parsed.tracks.length} Destinos/Músicas inseridos com sucesso no MongoDB!`);
    console.log(`Vá verificar no MongoDB Atlas!`);

  } catch (error) {
    console.error('❌ Erro na importação:', error);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
