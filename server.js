require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// ─── Handlers da API (Vercel Serverless) ───────────────────────────────────────
const authHandler = require('./api/auth/[[...path]]');
const albumHandler = require('./api/album/[[...path]]');
const trackHandler = require('./api/tracks/[[...path]]');
const userHandler = require('./api/users/[[...path]]');
const musicasHandler = require('./api/musicas/[[...path]]');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares Globais ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Vercel Adapter (Emulação Local de Catch-All Routes) ────────────────────
function vercelCatchAll(handler, prefix) {
    return async (req, res) => {
        const urlStr = req.originalUrl.split('?')[0]; 
        const subPath = urlStr.startsWith(prefix) ? urlStr.substring(prefix.length) : '';
        
        const pathArray = subPath && subPath !== '/' ? subPath.split('/').filter(Boolean) : [];
        
        // Atribui diretamente ao req um namespace customizado para evitar limitações do Express
        req.vercelPath = pathArray;
        
        // Tenta também injetar no query para compatibilidade máxima com Next.js
        if (!req.query) req.query = {};
        try { req.query.path = pathArray; } catch (e) {}

        console.log(`[VercelAdapter] ${req.method} ${req.originalUrl} -> path:`, req.vercelPath);
        return handler(req, res);
    };
}

// ─── Roteamento para as 5 Funções Serverless ─────────────────────────────────
app.use('/api/auth', vercelCatchAll(authHandler, '/api/auth'));
app.use('/api/album', vercelCatchAll(albumHandler, '/api/album'));
app.use('/api/tracks', vercelCatchAll(trackHandler, '/api/tracks'));
app.use('/api/users', vercelCatchAll(userHandler, '/api/users'));
app.use('/api/musicas', vercelCatchAll(musicasHandler, '/api/musicas'));

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

