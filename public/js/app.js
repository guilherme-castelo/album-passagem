import { AppState } from './state/AppState.js';
import { musicService } from './api/musicService.js';
import { router } from './utils/router.js';

import { AppController } from './controllers/AppController.js';

import { CheckinView } from './components/CheckinView.js';
import { LoadingView } from './components/LoadingView.js';
import { TrackList } from './components/TrackList.js';
import { LyricsView } from './components/LyricsView.js';
import { RatingWidget } from './components/RatingWidget.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // Instancia das Views sem a responsabilidade lógica
    const checkinView = new CheckinView('checkin-form', 'input-passenger', 'btn-skip-checkin', 'passenger-name');
    const loadingView = new LoadingView('view-loading');
    const tracklist = new TrackList('tracklist-container');
    const lyricsView = new LyricsView({
        title: 'lyrics-title',
        gate: 'lyrics-gate',
        flight: 'lyrics-flight',
        content: 'lyrics-content',
        mediaContainer: 'media-container',
        mediaPlayers: 'media-players',
        btnBack: 'btn-back',
        btnPrev: 'btn-prev-track',
        btnNext: 'btn-next-track'
    });
    
    const ratingWidget = new RatingWidget({
        btnLike: 'btn-likeTrack',
        likeCount: 'like-count',
        ratingAvg: 'rating-avg',
        starsSelector: '.star-btn'
    });

    // Conexão via Controller
    const controller = new AppController({
        state: AppState,
        api: musicService,
        router: router,
        views: { checkin: checkinView, loading: loadingView, tracklist, lyrics: lyricsView, rating: ratingWidget }
    });

    // Wire Events
    checkinView.onSubmit = (name) => controller.handleCheckin(name);
    checkinView.onSkip = () => controller.handleSkipCheckin();
    tracklist.onTrackClick = (track) => controller.handleTrackSelect(track);
    lyricsView.onBack = () => AppState.set('currentView', 'tracklist');
    lyricsView.onNavigateTrack = (offset) => controller.handleNavigateTrack(offset);
    ratingWidget.onLike = () => controller.handleLike();
    ratingWidget.onRate = (stars) => controller.handleRate(stars);

    // Boot App
    controller.init();
    
});
