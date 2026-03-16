/**
 * Seed Script — cria o primeiro usuário admin no MongoDB.
 * Execute uma única vez: node seed-admin.js
 * 
 * Edite ADMIN_USERNAME e ADMIN_PASSWORD antes de rodar.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { MongoClient, ServerApiVersion } = require('mongodb');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin'; // <- Troque antes de executar!

async function seed() {
    const pass = encodeURIComponent(process.env.DB_PASS || '');
    const user = encodeURIComponent(process.env.DB_USER || '');
    const uri = `mongodb+srv://${user}:${pass}@cluster0.hh9vrmr.mongodb.net/?appName=Cluster0`;

    const client = new MongoClient(uri, {
        serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
    });

    try {
        await client.connect();
        const db = client.db('album-passagem');
        const admins = db.collection('admins');

        const existing = await admins.findOne({ username: ADMIN_USERNAME });
        if (existing) {
            console.log(`⚠️  Admin "${ADMIN_USERNAME}" já existe. Nenhuma alteração feita.`);
            return;
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
        await admins.insertOne({
            username: ADMIN_USERNAME,
            password: hashedPassword,
            createdAt: new Date()
        });

        console.log(`✅ Admin "${ADMIN_USERNAME}" criado com sucesso!`);
        console.log(`   Troque a senha padrão após o primeiro login.`);
    } catch (err) {
        console.error('❌ Erro no seed:', err);
    } finally {
        await client.close();
    }
}

seed();
