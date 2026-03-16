export const musicService = {
    // Retorna a URL base dinamicamente, mantendo retrocompatibilidade
    getBaseUrl() {
        return window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
    },

    async getAll() {
        const response = await fetch(`${this.getBaseUrl()}/api/musicas`);
        if (!response.ok) {
            throw new Error('Falha ao conectar na torre de controle.');
        }
        return response.json();
    },

    async like(trackId, action) {
        const response = await fetch(`${this.getBaseUrl()}/api/musicas/${trackId}/like`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        if (!response.ok) {
            throw new Error(`Falha ao registrar like: ${response.status}`);
        }
        return response.json();
    },

    async rate(trackId, rating, oldRating) {
        const response = await fetch(`${this.getBaseUrl()}/api/musicas/${trackId}/rate`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating, oldRating })
        });
        if (!response.ok) {
            throw new Error(`Falha ao registrar rating: ${response.status}`);
        }
        return response.json();
    }
};
