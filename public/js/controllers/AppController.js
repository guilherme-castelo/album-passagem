import { analytics } from '../utils/analyticsTracker.js';

export class AppController {
    constructor(dependencies) {
        this.state = dependencies.state;
        this.api = dependencies.api;
        this.router = dependencies.router;

        this.views = {
            checkin: dependencies.views.checkin,
            loading: dependencies.views.loading,
            tracklist: dependencies.views.tracklist,
            lyrics: dependencies.views.lyrics,
            rating: dependencies.views.rating
        };

        // Escuta ativamente as mudanças de View no State
        this.state.subscribe('currentView', (newView) => {
            // O router lida visualmente com "de onde vs para onde"
            const viewsEl = this.router.VIEWS;
            const currentActiveId = Object.keys(viewsEl).find(key => viewsEl[key].classList.contains('active')) || 'checkin';
            this.router.navigate(currentActiveId, newView);
        });
    }

    async init() {
        // Verifica se a chave existe na localStorage para confirmar se o usuário já passou do check-in
        const hasCompletedCheckin = window.localStorage.getItem('passengerName') !== null;

        if (hasCompletedCheckin) {
            const name = this.state.get('passengerName') || 'Desconhecido';
            this.views.checkin.render(name);
            this.state.set('currentView', 'loading');
            await this.loadData();
        } else {
            this.views.checkin.render('Desconhecido');
            // Como view-checkin já ta visivel no HTML, não disparamos animação atoua
        }
    }

    async handleCheckin(nameStr) {
        this.state.set('passengerName', nameStr);
        this.state.persist('passengerName');
        this.views.checkin.render(nameStr);

        this.state.set('currentView', 'loading');
        await this.loadData();
    }

    async handleSkipCheckin() {
        this.state.set('passengerName', '');
        this.state.persist('passengerName');
        this.views.checkin.render('Desconhecido');

        this.state.set('currentView', 'loading');
        await this.loadData();
    }

    handleEditPassenger() {
        const currentName = this.state.get('passengerName');
        this.views.checkin.prefill(currentName);
        this.state.set('currentView', 'checkin');
    }

    async loadData() {
        this.views.loading.reset();

        try {
            const data = await this.api.getAll();

            this.state.set('albumData', data.album);
            this.state.set('tracks', data.tracks);

            // Artificial delay pra mostrar a animação "buscando voos"
            setTimeout(() => {
                this.views.tracklist.render(data.tracks, this.state.get('visitedTracks'));
                this.state.set('currentView', 'tracklist');
            }, 600);

        } catch (error) {
            console.error("Erro no load:", error);
            this.views.loading.showError('Voo Cancelado');
        }
    }

    handleTrackSelect(track) {
        const trackId = track._id || track.id;
        this.state.set('activeTrackId', trackId);

        const visited = this.state.get('visitedTracks');
        if (!visited.includes(trackId)) {
            visited.push(trackId);
            this.state.set('visitedTracks', visited);
            this.state.persist('visitedTracks');
            this.views.tracklist.render(this.state.get('tracks'), visited);
        }

        const tracks = this.state.get('tracks');
        const index = tracks.findIndex(t => (t._id || t.id) === trackId);
        const len = tracks.length;

        this.views.lyrics.render(track, {
            canGoBack: index > 0,
            canGoNext: index < len - 1
        });

        const isLiked = this.state.get('likedTracks').includes(trackId);
        const userRating = this.state.get('ratedTracks')[trackId] || 0;

        this.views.rating.render(track.interactions || {}, isLiked, userRating);
        this.state.set('currentView', 'lyrics');

        // Trigger analytics telemetry mapping
        analytics.startViewingTrack(trackId);
    }

    handleNavigateTrack(offset) {
        const id = this.state.get('activeTrackId');
        const tracks = this.state.get('tracks');
        const currentIndex = tracks.findIndex(t => (t._id || t.id) === id);

        if (currentIndex > -1) {
            const targetIndex = currentIndex + offset;
            if (targetIndex >= 0 && targetIndex < tracks.length) {
                this.handleTrackSelect(tracks[targetIndex]);
            }
        }
    }

    async handleLike() {
        const trackId = this.state.get('activeTrackId');
        if (!trackId) return;

        const likedT = this.state.get('likedTracks');
        const isLiked = likedT.includes(trackId);
        const action = isLiked ? 'unlike' : 'like';

        if (isLiked) {
            const updated = likedT.filter(id => id !== trackId);
            this.state.set('likedTracks', updated);
        } else {
            likedT.push(trackId);
            this.state.set('likedTracks', likedT);
        }
        this.state.persist('likedTracks');

        const tracksCopy = this.state.getClone('tracks');
        const trackToUpdate = tracksCopy.find(t => (t._id || t.id) === trackId);

        if (trackToUpdate.interactions) {
            trackToUpdate.interactions.likes = Math.max(0, trackToUpdate.interactions.likes + (isLiked ? -1 : 1));
        } else {
            trackToUpdate.interactions = { likes: 1, ratings: [] };
        }
        this.state.set('tracks', tracksCopy); // atualiza cache local 

        this.views.rating.render(trackToUpdate.interactions, !isLiked, this.state.get('ratedTracks')[trackId] || 0);
        this.views.rating.showToast(!isLiked ? "Curtido com sucesso! 🧡" : "Curtida removida");

        try {
            await this.api.like(trackId, action);
        } catch (err) {
            console.error(err);
        }
    }

    async handleRate(stars) {
        const trackId = this.state.get('activeTrackId');
        if (!trackId) return;

        const ratedT = this.state.get('ratedTracks');
        const oldRating = ratedT[trackId];

        if (oldRating === stars) return; // Mesmo voto

        ratedT[trackId] = stars;
        this.state.set('ratedTracks', ratedT);
        this.state.persist('ratedTracks');

        this.views.rating.showToast(`${stars} Estrelas registradas! ⭐`);

        // Optimistic widget sync
        this.views.rating.render(
            this.state.getClone('tracks').find(t => (t._id || t.id) === trackId).interactions || {},
            this.state.get('likedTracks').includes(trackId),
            stars
        );

        try {
            const res = await this.api.rate(trackId, stars, oldRating);
            // Sync media real recebida com OT
            if (res.success && res.ratings) {
                const tracks = this.state.getClone('tracks');
                const currentT = tracks.find(t => (t._id || t.id) === trackId);
                currentT.interactions.ratings = res.ratings;
                this.state.set('tracks', tracks);

                this.views.rating.render(currentT.interactions, this.state.get('likedTracks').includes(trackId), stars);
            }
        } catch (err) {
            console.error(err);
        }
    }
}
