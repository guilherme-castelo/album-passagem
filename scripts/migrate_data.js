require('dotenv').config();
const connectToDatabase = require('../backend/lib/db');

// Accept CLI args: --albumTitle "Name" --artistName "Name"
const args = process.argv.slice(2);
function getArg(name, defaultValue) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultValue;
}

const albumTitle = getArg('albumTitle', 'Example Album');
const artistName = getArg('artistName', 'Artist Example');

async function migrate() {
  console.log('--- Starting Data Migration ---');
  const db = await connectToDatabase();
  const albumCollection = db.collection('album');
  const tracksCollection = db.collection('tracks');

  // 1. Ensure a default album exists
  let album = await albumCollection.findOne({});
  if (!album) {
    console.log('No album found, creating default album...');
    const result = await albumCollection.insertOne({
      title: albumTitle,
      artist: artistName,
      event: 'Launch Event',
      date: new Date().toISOString(),
      createdAt: new Date()
    });
    album = await albumCollection.findOne({ _id: result.insertedId });
  }

  const albumId = album._id.toString();
  console.log(`Album identified: ${album.title} (ID: ${albumId})`);

  // 2. Link all orphan tracks (without albumId) to the found album
  const result = await tracksCollection.updateMany(
    { albumId: { $exists: false } },
    { $set: { albumId: albumId } }
  );

  console.log(`Tracks linked: ${result.modifiedCount}`);
  console.log('--- Migration Completed Successfully ---');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
