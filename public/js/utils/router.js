export const router = {
  // Referências DOM
  VIEWS: {
    checkin: document.getElementById('view-checkin'),
    loading: document.getElementById('view-loading'),
    tracklist: document.getElementById('view-tracklist'),
    lyrics: document.getElementById('view-lyrics')
  },

  navigate(currentState, targetView) {
    if (currentState === targetView) return;

    const currentEl = this.VIEWS[currentState];
    const targetEl = this.VIEWS[targetView];

    if (!currentEl || !targetEl) {
      console.warn('View not found:', { currentState, targetView });
      return;
    }

    // Remove active state from current
    currentEl.classList.remove('active');

    // Show target View
    targetEl.classList.remove('hidden', 'slide-out-left', 'slide-out-right');
    targetEl.classList.add('active');

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Hide previous view after animation finishes
    setTimeout(() => {
      currentEl.classList.add('hidden');
    }, 300); // 300ms tailwind utility match
  }
};
