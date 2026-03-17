/**
 * Seed Script — Creates the first admin user.
 * Run once: node seed-admin.js
 * 
 * Edit ADMIN_USERNAME and ADMIN_PASSWORD before running.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { MongoClient, ServerApiVersion } = require('mongodb');

const DB_NAME = process.env.DB_NAME || 'album-platform';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin'; // <- Change before running in production!

async function seed() {
    const pass = encodeURIComponent(process.env.DB_PASS || '');
    const user = encodeURIComponent(process.env.DB_USER || '');
    const uri = `mongodb+srv://${user}:${pass}@cluster0.hh9vrmr.mongodb.net/?appName=Cluster0`;

    const client = new MongoClient(uri, {
        serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
    });

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const admins = db.collection('admins');

        const existing = await admins.findOne({ username: ADMIN_USERNAME });
        if (existing) {
            console.log(`⚠️  Admin "${ADMIN_USERNAME}" already exists in ${DB_NAME}. No changes made.`);
            return;
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
        await admins.insertOne({
            username: ADMIN_USERNAME,
            password: hashedPassword,
            role: 'superadmin',
            createdAt: new Date()
        });

        console.log(`✅ Admin "${ADMIN_USERNAME}" created in database "${DB_NAME}"!`);
        console.log(`   Change the default password after first login.`);
    } catch (err) {
        console.error('❌ Seed error:', err);
    } finally {
        await client.close();
    }
}

seed();
