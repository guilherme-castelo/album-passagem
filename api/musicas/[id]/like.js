const connectToDatabase = require('../../_db');

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
    if (req.method === 'OPTIONS') return res.status(200).end()

    if (req.method === 'POST') {
        const trackId = parseInt(req.query.id, 10);
        const { action } = req.body;
        
        try {
            const db = await connectToDatabase();
            const collection = db.collection('tracks');
            
            const track = await collection.findOne({ id: trackId });
            if(!track) return res.status(404).json({ error: "Voo não encontrado" });
            
            let currentLikes = track.interactions?.likes || 0;
            
            if (action === 'unlike') {
                currentLikes = Math.max(0, currentLikes - 1);
            } else {
                currentLikes += 1;
            }
            
            await collection.updateOne(
                { id: trackId },
                { $set: { "interactions.likes": currentLikes } }
            );
            
            return res.status(200).json({ success: true, likes: currentLikes });
            
        } catch(err) {
            console.error(err);
            return res.status(500).json({ error: "Falha na comunicação." });
        }
    }
    
    return res.status(405).json({error: "Method Not Allowed"});
};
