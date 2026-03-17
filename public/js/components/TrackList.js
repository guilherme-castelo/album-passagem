export class TrackList {
  constructor(containerId, onTrackClick) {
    this.container = document.getElementById(containerId);
    this.onTrackClick = onTrackClick;
  }

  render(tracks = [], visitedTracks = []) {
    if (!this.container) return;

    this.container.innerHTML = '';
    this.container.className = 'flex flex-col space-y-4';

    tracks.forEach((track, index) => {
      const trkEl = document.createElement('li');
      trkEl.className = 'timeline-item group';

      const trackId = track._id || track.id;
      const isVisited = visitedTracks.includes(trackId);
      const dotClass = isVisited ? 'timeline-dot visited' : 'timeline-dot';
      const stampHtml = isVisited ? '<div class="stamp-visited">BOARDED</div>' : '';

      const statusColor =
        track.status === 'DELAYED'
          ? 'text-red-500'
          : track.status === 'FINAL CALL'
            ? 'text-brand-orange animate-pulse'
            : 'text-green-600';

      trkEl.innerHTML = `
                <div class="${dotClass}"></div>
                <div class="track-item cursor-pointer bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div class="absolute top-0 left-0 right-0 h-1 bg-brand-blue group-hover:bg-brand-orange transition-colors"></div>
                    
                    ${stampHtml}
                    
                    <div class="flex justify-between items-start mb-2 mt-1">
                        <span class="text-[0.65rem] text-gray-400 font-mono tracking-wider">CONEXÃO / VOO</span>
                        <span class="text-[0.65rem] ${statusColor} font-mono tracking-wider font-bold">${track.status}</span>
                    </div>
                    
                    <div class="flex justify-between items-end">
                        <div class="flex-1">
                            <h4 class="font-bold text-lg leading-tight text-gray-800 group-active:text-brand-blue transition-colors pr-2">
                                <span class="block text-xs font-mono text-gray-400 opacity-80 mb-1 tracking-wider">STOP ${index + 1}</span>
                                <span class="block line-clamp-2">${track.title}</span>
                            </h4>
                        </div>
                        
                        <div class="text-right pl-3 ml-3 border-l border-gray-100 flex-shrink-0">
                            <span class="block text-[0.6rem] text-gray-400 font-mono">PORTÃO</span>
                            <span class="block font-mono font-bold text-brand-orange text-xl">${track.gate}</span>
                        </div>
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
               <li class="timeline-item group">
                   <div class="timeline-dot bg-gray-300 animate-pulse border-none"></div>
                   <div class="track-item bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden animate-pulse">
                       <div class="h-1 w-full bg-gray-200 absolute top-0 left-0"></div>
                       <div class="flex justify-between mt-2 mb-4">
                           <div class="h-2 bg-gray-200 rounded w-20"></div>
                           <div class="h-2 bg-gray-200 rounded w-16"></div>
                       </div>
                       <div class="flex justify-between items-end">
                           <div class="flex-1">
                               <div class="h-2 bg-gray-200 rounded w-12 mb-2"></div>
                               <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                           </div>
                           <div class="ml-4 flex flex-col items-end">
                               <div class="h-2 bg-gray-200 rounded w-10 mb-1"></div>
                               <div class="h-6 bg-gray-200 rounded w-12"></div>
                           </div>
                       </div>
                   </div>
               </li>
             `;
    }
  }
}
