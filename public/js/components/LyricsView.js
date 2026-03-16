import { MediaRenderer } from "./MediaRenderer.js";

export class LyricsView {
  constructor(elements, onBack, onNavigateTrack) {
    this.dom = {
      title: document.getElementById(elements.title),
      gate: document.getElementById(elements.gate),
      flight: document.getElementById(elements.flight),
      content: document.getElementById(elements.content),
      mediaContainer: document.getElementById(elements.mediaContainer),
      mediaPlayers: document.getElementById(elements.mediaPlayers),
      btnBack: document.getElementById(elements.btnBack),
      btnPrev: document.getElementById(elements.btnPrev),
      btnNext: document.getElementById(elements.btnNext),
    };

    this.onBack = onBack;
    this.onNavigateTrack = onNavigateTrack;

    this._bindEvents();
  }

  _bindEvents() {
    if (this.dom.btnBack) {
      this.dom.btnBack.addEventListener("click", () => {
        if (this.onBack) this.onBack();
      });
    }

    if (this.dom.btnPrev) {
      this.dom.btnPrev.addEventListener("click", () => {
        if (this.onNavigateTrack) this.onNavigateTrack(-1);
      });
    }

    if (this.dom.btnNext) {
      this.dom.btnNext.addEventListener("click", () => {
        if (this.onNavigateTrack) this.onNavigateTrack(1);
      });
    }
  }

  render(track, navigationState = { canGoBack: false, canGoNext: false }) {
    if (!track) return;

    // Header
    this.dom.title.textContent = track.title;
    this.dom.gate.textContent = `PORTÃO ${track.gate}`;
    this.dom.flight.textContent = track.flightCode;

    // Swipe/Animação de transição nas letras
    this.dom.content.style.opacity = "0";
    setTimeout(() => {
      this.dom.content.textContent = track.lyrics;
      // Melhoria UX de tipografia nas letras:
      this.dom.content.classList.add(
        "text-[clamp(1rem,4vw,1.15rem)]",
        "leading-relaxed",
        "tracking-wide",
      );
      this.dom.content.style.transition = "opacity 0.3s ease-in-out";
      this.dom.content.style.opacity = "1";
    }, 150);

    // Mídia Renderer OCP
    const mediaHtml = MediaRenderer.render(track.media);
    if (mediaHtml) {
      this.dom.mediaContainer.classList.remove("hidden");
      this.dom.mediaPlayers.innerHTML = mediaHtml;
    } else {
      this.dom.mediaContainer.classList.add("hidden");
      this.dom.mediaPlayers.innerHTML = "";
    }

    // Atualiza Nav
    if (this.dom.btnPrev)
      this.dom.btnPrev.disabled = !navigationState.canGoBack;
    if (this.dom.btnNext)
      this.dom.btnNext.disabled = !navigationState.canGoNext;

    // Scroll Top suave
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
