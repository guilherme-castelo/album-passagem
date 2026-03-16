require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importação das funções Serverless da Vercel
const routeMusicas = require('./api/musicas');
const routeLike = require('./api/musicas/[id]/like');
const routeRate = require('./api/musicas/[id]/rate');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar middlewares globais do ambiente local
app.use(cors());
app.use(express.json());

// ==========================================
// MODO HÍBRIDO (LOCAL-TO-SERVERLESS)
// Simulando o comportamento da Vercel no Node
// ==========================================

app.all('/api/musicas', routeMusicas);

app.all('/api/musicas/:id/like', (req, res) => {
    // Vercel (na nuvem) injeta pastas dinâmicas [id] direto na query. 
    // Copiamos esse comportamento aqui pro Express rodar as mesmas funções perfeitamente:
    if(!req.query.id) req.query.id = req.params.id;
    return routeLike(req, res);
});

app.all('/api/musicas/:id/rate', (req, res) => {
    if(!req.query.id) req.query.id = req.params.id;
    return routeRate(req, res);
});

// Servir frontend estático a partir do diretório /public
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`✈️ Aeroporto ativo no portão http://localhost:${PORT}`);
    console.log(`☁️ Modo Local-to-Serverless ativado de forma invisível!`);
});
