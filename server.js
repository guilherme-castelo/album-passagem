const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar o CORS
app.use(cors());

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

app.listen(PORT, () => {
    console.log(`✈️ Aeroporto ativo no portão http://localhost:${PORT}`);
});
