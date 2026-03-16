require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// ─── Módulos da API ────────────────────────────────────────────────────────────
const authRoutes = require('./api/modules/auth/authRoutes');
const albumRoutes = require('./api/modules/album/albumRoutes');
const trackRoutes = require('./api/modules/tracks/trackRoutes');
const userRoutes = require('./api/modules/users/userRoutes');

// ─── Rotas Legadas para compatibilidade Vercel Serverless ────────────────────
const routeMusicas = require('./api/musicas/index');
const routeLike = require('./api/musicas/[id]/like');
const routeRate = require('./api/musicas/[id]/rate');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares Globais ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Vercel Adapter (compatibilidade local para rotas [id]) ─────────────────
// Na Vercel, parâmetros [id] chegam em req.query. Usamos req.vercelParams.
function vercelAdapter(handler) {
    return async (req, res) => {
        req.vercelParams = req.params || {};
        return handler(req, res);
    };
}

// ─── Rotas dos Módulos (Clean Architecture) ──────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/album', albumRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/users', userRoutes);

// ─── Rotas Legadas do Site Público (compatibilidade) ─────────────────────────
app.all('/api/musicas', vercelAdapter(routeMusicas));
app.all('/api/musicas/:id/like', vercelAdapter(routeLike));
app.all('/api/musicas/:id/rate', vercelAdapter(routeRate));

// ─── Servir Frontend Estático ────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Catch-all: Retorna o index.html para SPAs ───────────────────────────────
app.get(/.*/, (req, res) => {
    // Serve admin/index.html para rotas /admin/*
    if (req.path.startsWith('/admin')) {
        return res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✈️ Aeroporto ativo no portão http://localhost:${PORT}`);
    console.log(`☁️ Modo Local-to-Serverless com Vercel Adapter ativado!`);
    console.log(`🔐 Painel Admin: http://localhost:${PORT}/admin/login.html`);
});

