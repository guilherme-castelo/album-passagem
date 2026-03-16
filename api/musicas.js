const connectToDatabase = require('./_db');

module.exports = async (req, res) => {
    // Configuração básica do CORS global Serverless
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
    if (req.method === 'OPTIONS') return res.status(200).end()

    if (req.method === 'GET') {
        try {
            const db = await connectToDatabase();
            const collection = db.collection('tracks');
            
            const albumData = {
                title: "Passagem",
                artist: "Bruno",
                event: "Pré-lançamento Teatro Belas Artes",
                date: "2026-03-18T20:00:00-04:00"
            };
            
            const tracks = await collection.find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray();
            
            return res.status(200).json({
                album: albumData,
                tracks: tracks
            });
            
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro na leitura do Voo." });
        }
    }
    
    return res.status(405).json({error: "Method Not Allowed"});
};
