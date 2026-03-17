export class TrackList {
  constructor(containerId, onTrackClick) {
    this.container = document.getElementById(containerId);
    this.onTrackClick = onTrackClick;
  }

  render(tracks = [], visitedTracks = [], uiConfig = {}) {
    if (!this.container) return;

    this.container.innerHTML = '';
    const displayMode = uiConfig.layout?.trackDisplay || 'list';

    // Grid vs List setup
    if (displayMode === 'grid') {
      this.container.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4';
    } else {
      this.container.className = 'flex flex-col space-y-3';
    }

    const labels = uiConfig.labels || {};
    const trackCodeLabel = labels.trackCode || '#';
    const tagLabel = labels.trackTag || '';

    tracks.forEach((track, index) => {
      const trackId = track._id || track.id;
      const isVisited = visitedTracks.includes(trackId);

      const trkEl = document.createElement('li');
      trkEl.className = 'group list-none';

      const isCompact = displayMode === 'compact';

      trkEl.innerHTML = `
        <div class="track-card cursor-pointer bg-surface border border-border rounded-custom ${isCompact ? 'p-3' : 'p-5'} shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 active:scale-[0.98]">
            <!-- Progress indicator -->
            <div class="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity ${isVisited ? 'opacity-100' : ''}"></div>
            
            <div class="flex justify-between items-center">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] font-mono text-muted uppercase tracking-wider">${trackCodeLabel} ${index + 1}</span>
                    ${track.status ? `<span class="text-[10px] font-bold text-accent uppercase tracking-tighter">${track.status}</span>` : ''}
                  </div>
                  <h4 class="${isCompact ? 'text-base' : 'text-lg md:text-xl'} font-bold text-text truncate group-hover:text-accent transition-colors">
                    ${track.title}
                  </h4>
                </div>
                
                ${
                  track.gate
                    ? `
                <div class="text-right pl-4 ml-4 border-l border-border flex-shrink-0">
                    <span class="block text-[9px] text-muted font-mono uppercase">${tagLabel}</span>
                    <span class="block font-mono font-bold text-accent ${isCompact ? 'text-sm' : 'text-xl'}">${track.gate}</span>
                </div>`
                    : ''
                }
            </div>
        </div>
      `;

      trkEl.addEventListener('click', () => {
        if (this.onTrackClick) this.onTrackClick(track);
      });

      this.container.appendChild(trkEl);
    });
  }

  renderSkeleton() {
    if (!this.container) return;
    this.container.innerHTML = '';
    this.container.className = 'flex flex-col space-y-4';

    for (let i = 0; i < 3; i++) {
      this.container.innerHTML += `
        <li class="list-none animate-pulse">
            <div class="bg-surface border border-border rounded-custom p-5 shadow-sm space-y-3">
                <div class="h-2 bg-border rounded w-20"></div>
                <div class="h-4 bg-border rounded w-3/4"></div>
                <div class="flex justify-between items-end">
                    <div class="h-3 bg-border rounded w-1/4"></div>
                </div>
            </div>
        </li>
      `;
    }
  }
}
