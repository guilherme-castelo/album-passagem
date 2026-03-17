/**
 * Setup Script — Initializes the album-platform database with:
 *   - Multi-tenant collections structure
 *   - Required indexes for performance
 *   - Default admin user
 *   - Example album with uiConfig
 *
 * Usage:
 *   node scripts/setup-platform.js
 *   node scripts/setup-platform.js --skip-example   (skip example data)
 *   DB_NAME=album-passagem node scripts/setup-platform.js  (target legacy db)
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { MongoClient, ServerApiVersion } = require('mongodb');

const DB_NAME = process.env.DB_NAME || 'album-platform';
const SKIP_EXAMPLE = process.argv.includes('--skip-example');

// ── Default uiConfig template ──────────────────────────────────────
const DEFAULT_UI_CONFIG = {
  theme: 'default',
  colors: {
    primary: '#0F2C59',
    accent: '#F9B572',
    background: '#0a0f1a',
    text: '#ffffff',
    muted: '#94a3b8'
  },
  typography: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'Roboto Mono'
  },
  layout: {
    sections: ['hero', 'tracklist', 'lyrics'],
    trackDisplay: 'list',
    showInteractions: true,
    showLyrics: true,
    showMedia: true
  },
  labels: {
    trackCode: 'Track',
    trackTag: 'Tag',
    statuses: ['Published', 'Draft', 'Featured', 'Hidden'],
    cta: 'Listen Now'
  },
  branding: {
    title: '',
    subtitle: '',
    logo: '',
    footer: ''
  }
};

async function setup() {
  const pass = encodeURIComponent(process.env.DB_PASS || '');
  const user = encodeURIComponent(process.env.DB_USER || '');
  const uri = `mongodb+srv://${user}:${pass}@cluster0.hh9vrmr.mongodb.net/?appName=Cluster0`;

  const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
  });

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    console.log(`\n🏗️  Setting up database: ${DB_NAME}\n`);

    // ── 1. Create collections ────────────────────────────────
    const existingCollections = (await db.listCollections().toArray()).map(c => c.name);

    const requiredCollections = [
      'tenants',      // Multi-tenant: organizations/labels
      'artists',      // Artist profiles
      'albums',       // Albums (plural, SaaS naming)
      'tracks',       // Track data
      'admins',       // Admin users (per-tenant)
      'fans',         // Public users (future)
      'credentials',  // Integration credentials (future)
      'webhooks'      // Webhook logs (future)
    ];

    for (const col of requiredCollections) {
      if (!existingCollections.includes(col)) {
        await db.createCollection(col);
        console.log(`  ✅ Collection created: ${col}`);
      } else {
        console.log(`  ⏭️  Collection exists: ${col}`);
      }
    }

    // ── 2. Create indexes ────────────────────────────────────
    console.log('\n📇 Creating indexes...\n');

    // Tenants
    await db.collection('tenants').createIndex({ slug: 1 }, { unique: true });
    console.log('  ✅ tenants.slug (unique)');

    // Artists
    await db.collection('artists').createIndex({ tenantId: 1, slug: 1 }, { unique: true });
    await db.collection('artists').createIndex({ tenantId: 1 });
    console.log('  ✅ artists.tenantId+slug (unique), artists.tenantId');

    // Albums
    await db.collection('albums').createIndex({ artistId: 1 });
    await db.collection('albums').createIndex({ tenantId: 1 });
    console.log('  ✅ albums.artistId, albums.tenantId');

    // Tracks
    await db.collection('tracks').createIndex({ albumId: 1, order: 1 });
    await db.collection('tracks').createIndex({ tenantId: 1 });
    console.log('  ✅ tracks.albumId+order, tracks.tenantId');

    // Admins
    await db.collection('admins').createIndex({ username: 1 }, { unique: true });
    await db.collection('admins').createIndex({ tenantId: 1 });
    console.log('  ✅ admins.username (unique), admins.tenantId');

    // Fans (future)
    await db.collection('fans').createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('  ✅ fans.email (unique sparse)');

    // Credentials (future)
    await db.collection('credentials').createIndex({ artistId: 1, provider: 1 }, { unique: true });
    console.log('  ✅ credentials.artistId+provider (unique)');

    // ── 3. Seed default admin ────────────────────────────────
    console.log('\n👤 Seeding admin user...\n');

    const admins = db.collection('admins');
    const existingAdmin = await admins.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin', 12);
      await admins.insertOne({
        username: 'admin',
        password: hashedPassword,
        role: 'superadmin',
        tenantId: null,  // superadmin = all tenants
        createdAt: new Date()
      });
      console.log('  ✅ Admin "admin" created (password: admin)');
    } else {
      console.log('  ⏭️  Admin "admin" already exists');
    }

    // ── 4. Seed example data ─────────────────────────────────
    if (!SKIP_EXAMPLE) {
      console.log('\n🎵 Seeding example data...\n');

      // Create default tenant
      const tenants = db.collection('tenants');
      let tenant = await tenants.findOne({ slug: 'default' });
      if (!tenant) {
        const tenantResult = await tenants.insertOne({
          name: 'Default Platform',
          slug: 'default',
          plan: 'free',
          settings: {},
          createdAt: new Date()
        });
        tenant = { _id: tenantResult.insertedId };
        console.log('  ✅ Tenant "default" created');
      } else {
        console.log('  ⏭️  Tenant "default" already exists');
      }

      const tenantId = tenant._id.toString();

      // Create example artist
      const artists = db.collection('artists');
      let artist = await artists.findOne({ slug: 'artist-example', tenantId });
      if (!artist) {
        const artistResult = await artists.insertOne({
          tenantId,
          name: 'Artist Example',
          slug: 'artist-example',
          bio: 'This is an example artist profile for the platform.',
          avatar: '',
          links: { website: '', instagram: '', spotify: '' },
          createdAt: new Date()
        });
        artist = { _id: artistResult.insertedId };
        console.log('  ✅ Artist "Artist Example" created');
      } else {
        console.log('  ⏭️  Artist "Artist Example" already exists');
      }

      // Create example album with uiConfig
      const albums = db.collection('albums');
      const existingAlbum = await albums.findOne({ tenantId, artistId: artist._id.toString() });
      if (!existingAlbum) {
        const albumResult = await albums.insertOne({
          tenantId,
          artistId: artist._id.toString(),
          title: 'Example Album',
          artist: 'Artist Example',
          event: 'Launch Event',
          date: new Date().toISOString(),
          uiConfig: DEFAULT_UI_CONFIG,
          isDefault: true,
          createdAt: new Date()
        });

        const albumId = albumResult.insertedId.toString();
        console.log('  ✅ Album "Example Album" created with uiConfig');

        // Create 3 example tracks
        const tracksCollection = db.collection('tracks');
        const exampleTracks = [
          { title: 'First Track', trackCode: 'TRK01', trackTag: 'Opening', status: 'Published', order: 1 },
          { title: 'Second Track', trackCode: 'TRK02', trackTag: 'Main', status: 'Published', order: 2 },
          { title: 'Third Track', trackCode: 'TRK03', trackTag: 'Closing', status: 'Draft', order: 3 }
        ];

        for (const track of exampleTracks) {
          await tracksCollection.insertOne({
            tenantId,
            albumId,
            ...track,
            lyrics: `Lyrics for "${track.title}" go here...`,
            media: [],
            interactions: { likes: 0, ratings: [] },
            createdAt: new Date()
          });
        }
        console.log('  ✅ 3 example tracks created');
      } else {
        console.log('  ⏭️  Example album already exists');
      }
    }

    // ── Done ─────────────────────────────────────────────────
    console.log(`\n🎉 Database "${DB_NAME}" is ready!\n`);
    console.log('Collections:');
    const finalCollections = await db.listCollections().toArray();
    finalCollections.forEach(c => console.log(`  📁 ${c.name}`));

  } catch (err) {
    console.error('❌ Setup error:', err);
  } finally {
    await client.close();
  }
}

setup();
