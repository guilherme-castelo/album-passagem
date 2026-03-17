import { MediaRenderer } from './MediaRenderer.js';

export class LyricsView {
  constructor(elements, onBack, onNavigateTrack) {
    this.dom = {
      title: document.getElementById(elements.title),
      content: document.getElementById(elements.content),
      mediaContainer: document.getElementById(elements.mediaContainer),
      mediaPlayers: document.getElementById(elements.mediaPlayers),
      btnBack: document.getElementById(elements.btnBack),
      btnPrev: document.getElementById(elements.btnPrev),
      btnNext: document.getElementById(elements.btnNext)
    };

    this.onBack = onBack;
    this.onNavigateTrack = onNavigateTrack;

    this._bindEvents();
  }

  _bindEvents() {
    if (this.dom.btnBack) {
      this.dom.btnBack.addEventListener('click', () => {
        if (this.onBack) this.onBack();
      });
    }

    if (this.dom.btnPrev) {
      this.dom.btnPrev.addEventListener('click', () => {
        if (this.onNavigateTrack) this.onNavigateTrack(-1);
      });
    }

    if (this.dom.btnNext) {
      this.dom.btnNext.addEventListener('click', () => {
        if (this.onNavigateTrack) this.onNavigateTrack(1);
      });
    }
  }

  render(track, navigationState = { canGoBack: false, canGoNext: false }, uiConfig = {}) {
    if (!track) return;

    // Header - Minimalist approach
    if (this.dom.title) this.dom.title.textContent = track.title;

    // Smooth transition for lyrics
    if (this.dom.content) {
      this.dom.content.style.opacity = '0';
      setTimeout(() => {
        this.dom.content.textContent = track.lyrics || '';
        this.dom.content.style.transition = 'opacity 0.3s ease-in-out';
        this.dom.content.style.opacity = '1';
      }, 150);
    }

    // Media Renderer
    const mediaHtml = MediaRenderer.render(track.media);
    if (mediaHtml && this.dom.mediaContainer) {
      this.dom.mediaContainer.classList.remove('hidden');
      if (this.dom.mediaPlayers) this.dom.mediaPlayers.innerHTML = mediaHtml;
    } else if (this.dom.mediaContainer) {
      this.dom.mediaContainer.classList.add('hidden');
      if (this.dom.mediaPlayers) this.dom.mediaPlayers.innerHTML = '';
    }

    // Update Nav
    if (this.dom.btnPrev) this.dom.btnPrev.disabled = !navigationState.canGoBack;
    if (this.dom.btnNext) this.dom.btnNext.disabled = !navigationState.canGoNext;

    // Scroll Top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
