const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar middlewares
app.use(cors());
app.use(express.json()); // Permite ler JSON do POST body

// Servir frontend a partir do diretório /public
app.use(express.static(path.join(__dirname, 'public')));

// Rota de API das músicas (Mock DB)
app.get('/api/musicas', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'musicas.json');
        
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            res.json(JSON.parse(data));
        } else {
            res.status(404).json({ error: "Banco de dados de letras não encontrado." });
        }
    } catch (error) {
        console.error("Erro na leitura do JSON:", error);
        res.status(500).json({ error: "Erro ao processar as informações do voo." });
    }
});

// Helper para ler/escrever dados em JSON
const DATA_FILE = path.join(__dirname, 'data', 'musicas.json');

const writeDataFile = async (data) => {
    try {
        await fs.promises.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error("Erro ao escrever", e);
        return false;
    }
}

// Rota de LIKES
app.post('/api/musicas/:id/like', async (req, res) => {
    const trackId = parseInt(req.params.id, 10);
    const { action } = req.body;
    
    try {
        const rawData = await fs.promises.readFile(DATA_FILE, 'utf-8');
        const data = JSON.parse(rawData);
        
        const track = data.tracks.find(t => t.id === trackId);
        if(!track) return res.status(404).json({ error: "Voo não encontrado" });
        
        // Inicializa obj se não existir por legado
        if(!track.interactions) track.interactions = { likes: 0, ratings: [] };
        
        if (action === 'unlike') {
            track.interactions.likes = Math.max(0, track.interactions.likes - 1);
        } else {
            track.interactions.likes += 1;
        }
        
        await writeDataFile(data);
        res.json({ success: true, likes: track.interactions.likes });
        
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "Falha na comunicação." });
    }
});

// Rota de RATINGS (Avaliação)
app.post('/api/musicas/:id/rate', async (req, res) => {
    const trackId = parseInt(req.params.id, 10);
    const { rating, oldRating } = req.body;
    
    if(!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Forneça uma avaliação válida de 1 a 5." });
    }
    
    try {
        const rawData = await fs.promises.readFile(DATA_FILE, 'utf-8');
        const data = JSON.parse(rawData);
        
        const track = data.tracks.find(t => t.id === trackId);
        if(!track) return res.status(404).json({ error: "Voo não encontrado" });
        
        if(!track.interactions) track.interactions = { likes: 0, ratings: [] };
        
        // Se houver votação anterior do mesmo cliente, removemos a anterior do array da média
        if (oldRating) {
            const idx = track.interactions.ratings.indexOf(oldRating);
            if (idx !== -1) {
                track.interactions.ratings.splice(idx, 1);
            }
        }
        
        track.interactions.ratings.push(rating); // Guarda Array com novo voto
        
        await writeDataFile(data);
        
        // Retorna infos pro front refazer a média
        res.json({ success: true, ratings: track.interactions.ratings });
        
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "Falha na comunicação." });
    }
});

app.listen(PORT, () => {
    console.log(`✈️ Aeroporto ativo no portão http://localhost:${PORT}`);
});
