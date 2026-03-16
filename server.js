require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const routeMusicas = require('./api/musicas/index');
const routeLike = require('./api/musicas/[id]/like');
const routeRate = require('./api/musicas/[id]/rate');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globais do Express Local
app.use(cors());
app.use(express.json()); // NECESSÁRIO ANTES DAS ROTAS!

// Wrapper que simula o ambiente Vercel Serverless localmente.
// Na Vercel, parâmetros dinâmicos [id] chegam via req.query.
// No Express 5, req.query é somente leitura. Usamos req.vercelParams
// como canal intermediário para passar os parâmetros da rota ao handler.
function vercelAdapter(handler) {
    return async (req, res) => {
        req.vercelParams = req.params || {};
        return handler(req, res);
    };
}

// Rotas Híbridas
app.all('/api/musicas', vercelAdapter(routeMusicas));
app.all('/api/musicas/:id/like', vercelAdapter(routeLike));
app.all('/api/musicas/:id/rate', vercelAdapter(routeRate));


// Servir frontend
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`✈️ Aeroporto ativo no portão http://localhost:${PORT}`);
    console.log(`☁️ Modo Local-to-Serverless com Vercel Adapter ativado!`);
});
