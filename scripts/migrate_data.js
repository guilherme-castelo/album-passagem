require('dotenv').config();
const connectToDatabase = require('../backend/lib/db');
const { ObjectId } = require('mongodb');

async function migrate() {
  console.log('--- Iniciando Migração de Dados ---');
  const db = await connectToDatabase();
  const albumCollection = db.collection('album');
  const tracksCollection = db.collection('tracks');

  // 1. Garantir que o álbum "singleton" tenha um ID e estrutura padrão
  let album = await albumCollection.findOne({});
  if (!album) {
    console.log('Álbum não encontrado, criando álbum padrão...');
    const result = await albumCollection.insertOne({
      title: 'Passagem',
      artist: 'Bruno',
      event: 'Pré-lançamento Teatro Belas Artes',
      date: '2026-03-18T20:00:00-04:00',
      createdAt: new Date()
    });
    album = await albumCollection.findOne({ _id: result.insertedId });
  }

  const albumId = album._id.toString();
  console.log(`Álbum Identificado: ${album.title} (ID: ${albumId})`);

  // 2. Vincular todas as tracks sem albumId ao álbum encontrado
  const result = await tracksCollection.updateMany(
    { albumId: { $exists: false } },
    { $set: { albumId: albumId } }
  );

  console.log(`Tracks vinculadas: ${result.modifiedCount}`);
  console.log('--- Migração Concluída com Sucesso ---');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Erro na migração:', err);
  process.exit(1);
});
