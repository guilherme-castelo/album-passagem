/**
 * DashboardView — Stat cards + Top tracks list (vibrant design).
 */
import { $ } from '../utils/dom.js';

export class DashboardView {
  constructor(containerId) {
    this.container = $(containerId);
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        ${this._statCard('Total de Faixas', '<div class="h-8 w-16 skeleton rounded mt-1" style="opacity:0.2"></div>', '--accent-violet', 'stat-card-violet', this._iconMusic())}
        ${this._statCard('Total de Likes', '<div class="h-8 w-16 skeleton rounded mt-1" style="opacity:0.2"></div>', '--accent-pink', 'stat-card-pink', this._iconHeart())}
        ${this._statCard('Avaliação Média', '<div class="h-8 w-16 skeleton rounded mt-1" style="opacity:0.2"></div>', '--accent-yellow', 'stat-card-yellow', this._iconStar())}
      </div>

      <div class="grid grid-cols-2 gap-5 mb-8">
         <div class="h-48 skeleton rounded-xl opacity-20"></div>
         <div class="h-48 skeleton rounded-xl opacity-20"></div>
      </div>

      <div class="glass-card py-5 px-2 md:p-5">
        <h3 class="font-semibold text-sm mb-4 flex items-center gap-2" style="color: var(--text-secondary)">
          <svg class="w-4 h-4" style="color: var(--accent-violet)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          FAIXAS MAIS CURTIDAS
        </h3>
        <div class="space-y-1">
          ${this._renderTopTracksSkeletons()}
        </div>
      </div>
    `;
  }

  render(tracks, analytics = {}, trackAnalytics = []) {
    this._tracks = tracks; // Store for modal
    this._trackAnalytics = trackAnalytics; // Store for modal
    this._analytics = analytics; // Novo payload armazenado para o Modal detalhado dos Cards
    
    const totalLikes = tracks.reduce((s, t) => s + (t.interactions?.likes || 0), 0);
    const allRatings = tracks.flatMap(t => t.interactions?.ratings || []);
    const avgRating = allRatings.length
      ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
      : '--';

    const formatDuration = (secs) => {
        if (!secs) return '0s';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    const topDevice = analytics?.devices?.sort((a,b)=>b.count-a.count)[0]?._id || '--';
    const topSource = analytics?.referrers?.[0]?._id || '--';
    const visitors = analytics?.totalVisits || 0;
    const avgTime = formatDuration(analytics?.avgDuration || 0);

    let deviceIcon = '';
    const dStr = String(topDevice).toLowerCase();
    if (dStr === 'mobile' || dStr === 'celular') {
      deviceIcon = `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`;
    } else if (dStr === 'tablet') {
      deviceIcon = `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18h.01M6 21h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`;
    } else if (dStr !== '--') {
      // Desktop
      deviceIcon = `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`;
    }

    const sourceIcon = `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>`;
    const visitorsIcon = `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`;
    const timeIcon = `<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

    this.container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        ${this._statCard('Total de Faixas', tracks.length, '--accent-violet', 'stat-card-violet', this._iconMusic())}
        ${this._statCard('Total de Likes', totalLikes, '--accent-pink', 'stat-card-pink', this._iconHeart())}
        ${this._statCard('Avaliação Média', avgRating === '--' ? '--' : `${avgRating}★`, '--accent-yellow', 'stat-card-yellow', this._iconStar())}
      </div>

      <div class="glass-card py-5 px-2 md:p-5">
        <h3 class="font-semibold text-sm mb-4 flex items-center gap-2" style="color: var(--text-secondary)">
          <svg class="w-4 h-4" style="color: var(--accent-violet)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          FAIXAS MAIS CURTIDAS (Clique para detalhes)
        </h3>
        <div class="space-y-1" id="top-tracks-list">
          ${this._renderTopTracks(tracks, trackAnalytics)}
        </div>
      </div>
      
      <!-- Overlay Modal para Faixas -->
      <div id="track-modal-overlay" class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 hidden flex items-center justify-center p-4">
        <div id="track-modal-content" class="glass-card border border-white/20 w-full max-w-md p-6 rounded-2xl shadow-2xl transform scale-95 transition-transform duration-300">
          <!-- Conteudo do Modal renderizado dinamicamente -->
        </div>
      </div>

      <h3 class="font-semibold text-sm mb-4 flex items-center gap-2 border-t border-white/10 pt-6" style="color: var(--text-secondary)">
        <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        VISÃO GERAL DO PÚBLICO
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        ${this._statCard('Visitantes Totais', visitors, '--text-primary', 'glass-card hover:bg-white/5', visitorsIcon, 'visitors')}
        ${this._statCard('Tempo Médio', avgTime, '--text-primary', 'glass-card hover:bg-white/5', timeIcon, 'time')}
        ${this._statCard('Dispositivo', String(topDevice).toUpperCase(), '--accent-blue', 'glass-card hover:bg-white/5', deviceIcon, 'devices')}
        ${this._statCard('Top Origem', String(topSource).toUpperCase(), '--accent-blue', 'glass-card hover:bg-white/5', sourceIcon, 'referrers')}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div class="glass-card p-4 flex flex-col items-center justify-center">
          <h4 class="text-xs uppercase text-gray-500 font-bold mb-4 w-full text-center tracking-widest">Aparelhos</h4>
          <div class="relative w-full max-w-[200px] aspect-square">
            <canvas id="chart-devices"></canvas>
          </div>
        </div>
        <div class="glass-card p-4 flex flex-col items-center justify-center">
          <h4 class="text-xs uppercase text-gray-500 font-bold mb-4 w-full text-center tracking-widest">Origens do Tráfego</h4>
          <div class="relative w-full h-full min-h-[200px]">
            <canvas id="chart-referrers"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Overlay Modal genérico para Insights Cards -->
      <div id="metric-modal-overlay" class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 hidden flex items-center justify-center p-4">
        <div id="metric-modal-content" class="glass-card border border-white/20 w-full max-w-md p-6 rounded-2xl shadow-2xl transform scale-95 transition-transform duration-300">
          <!-- Conteudo do Modal de Métrica -->
        </div>
      </div>
    `;

    setTimeout(() => {
        this._renderCharts(analytics);
        this._attachModalEvents();
    }, 50);
  }

  _statCard(label, value, colorVar, borderClass, iconSvg = '', metricType = null) {
    const actionClass = metricType ? 'cursor-pointer hover:border-white/30 transition-colors metric-card' : '';
    const eyeIcon = metricType ? `<svg class="w-4 h-4 opacity-30 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>` : '';
    
    return `
      <div class="glass-card stat-card ${borderClass} ${actionClass} p-5 relative overflow-hidden group" ${metricType ? `data-metric="${metricType}"` : ''}>
        <div class="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110" style="color: var(${colorVar})">${iconSvg}</div>
        <p class="label mb-2 flex items-center justify-between">
           ${label} 
           ${eyeIcon}
        </p>
        <p class="text-3xl font-bold" style="color: var(${colorVar})">${value}</p>
      </div>
    `;
  }

  _returnRates(track){
    const arr = track.interactions?.ratings;
    if (!arr || !arr.length) return { avgRating: 0, totalRating: 0 };
    const totalRating = arr.reduce((a, b) => a + b, 0);
    const avgRating = (totalRating / arr.length).toFixed(1);
    return {avgRating, totalRating: arr.length};
  }

  _renderTopTracks(tracks, trackAnalytics) {
    const sorted = [...tracks]
      .sort((a, b) => (b.interactions?.likes || 0) - (a.interactions?.likes || 0))
      .slice(0, 10);
    
    if (!sorted.length) return '<p style="color: var(--text-muted)" class="text-sm py-4 text-center">Nenhuma faixa encontrada.</p>';

    const formatDuration = (secs) => {
        if (!secs) return '0s';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    return sorted.map((t, i) => {
      const stats = trackAnalytics?.find(mx => String(mx._id) === String(t._id || t.id));
      const avg = stats && stats.uniqueListeners ? Math.floor(stats.totalTimeSpent / stats.uniqueListeners) : 0;
      const timeStr = formatDuration(avg);

      return `
      <div class="grid grid-cols-7 lg:grid-cols-9 w-full py-2.5 px-0 md:px-3 rounded-lg hover:bg-brand-blue/30 cursor-pointer border border-transparent hover:border-brand-blue/50 transition-all group dashboard-track-row" data-id="${t._id || t.id}">
        <div class="col-span-4 flex justify-start items-center">
          <span class="font-mono text-xs w-5" style="color: var(--text-muted)">${i + 1}</span>
          <span class="font-medium text-sm truncate max-w-[150px] md:max-w-[200px]" style="color: var(--text-primary)">${t.title}</span>
        </div>
        <span class="hidden lg:flex col-span-2 justify-center font-mono text-xs items-center gap-1" style="color: var(--accent-blue)">
          ⏱️ ${timeStr}
        </span>
        <span class="flex justify-center font-mono text-xs items-center gap-1" style="color: var(--accent-pink)">
          ${this._iconHeart('w-3 h-3', 'var(--accent-pink)')}
          ${t.interactions?.likes || 0}
        </span>
        <span class="col-span-2 flex justify-end font-mono text-xs items-center gap-1 truncate" style="color: var(--accent-yellow)">
          ${this._iconStar('w-3 h-3', 'var(--accent-yellow)')}
          ${this._returnRates(t).avgRating} (${this._returnRates(t).totalRating})
        </span>
      </div>
      `;
    }).join('');
  }

  _renderTopTracksSkeletons() {
    return Array(10).fill(`
      <div class="grid grid-cols-7 w-full py-3 px-0 md:px-3 rounded-lg hover:bg-white/5 transition-colors group">
        <div class="col-span-4 flex justify-start items-center gap-2">
          <div class="skeleton h-3 w-4 rounded opacity-20"></div>
          <div class="skeleton h-4 w-32 rounded opacity-20"></div>
        </div>
        <div class="col-span-1 flex justify-center items-center">
          <div class="skeleton h-3 w-8 rounded opacity-20"></div>
        </div>
        <div class="col-span-2 flex justify-end items-center">
          <div class="skeleton h-3 w-12 rounded opacity-20"></div>
        </div>
      </div>
    `).join('');
  }

  _iconMusic() {
    return '<svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>';
  }
  _iconHeart(size = 'w-10 h-10', color = 'currentColor') {
    return `<svg class="${size}" fill="none" stroke="${color}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`;
  }
  _iconStar(size = 'w-10 h-10', color = 'currentColor') {
    return `<svg class="${size}" fill="none" stroke="${color}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`;
  }

  // --- NEW SPRINT 4 LOGIC ---

  _renderCharts(analytics) {
      if (!window.Chart) return;
      Chart.defaults.color = '#9ca3af';
      Chart.defaults.font.family = 'Inter';

      const devCanvas = document.getElementById('chart-devices');
      const refCanvas = document.getElementById('chart-referrers');
      if (!devCanvas || !refCanvas) return;

      const devices = analytics?.devices || [];
      const referrers = analytics?.referrers || [];

      new Chart(devCanvas, {
          type: 'doughnut',
          data: {
              labels: devices.map(d => String(d._id).toUpperCase()),
              datasets: [{
                  data: devices.map(d => d.count),
                  backgroundColor: ['#F9B572', '#0F2C59', '#3b82f6'],
                  borderWidth: 0,
                  hoverOffset: 4
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } },
              cutout: '70%'
          }
      });

      new Chart(refCanvas, {
          type: 'bar',
          data: {
              labels: referrers.map(r => r._id === 'direct' ? 'Direto' : r._id),
              datasets: [{
                  label: 'Sessões',
                  data: referrers.map(r => r.count),
                  backgroundColor: '#3b82f6',
                  borderRadius: 4
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                  y: { display: false, grid: { display: false } },
                  x: { grid: { display: false } }
              }
          }
      });
  }

  _attachModalEvents() {
      // Eventos para as Faixas (Modal Existente)
      const rows = document.querySelectorAll('.dashboard-track-row');
      rows.forEach(r => {
          r.addEventListener('click', () => {
              const id = r.dataset.id;
              this._openTrackModal(id);
          });
      });

      const trackOverlay = document.getElementById('track-modal-overlay');
      if (trackOverlay) {
          trackOverlay.addEventListener('click', (e) => {
              if (e.target === trackOverlay) {
                  trackOverlay.classList.add('hidden');
                  document.getElementById('track-modal-content').classList.remove('scale-100');
                  document.getElementById('track-modal-content').classList.add('scale-95');
              }
          });
      }

      // Eventos para as Cartões de Audience (Novo Modal)
      const metricCards = document.querySelectorAll('.metric-card');
      metricCards.forEach(c => {
          c.addEventListener('click', () => {
              this._openMetricModal(c.dataset.metric);
          });
      });

      const metricOverlay = document.getElementById('metric-modal-overlay');
      if (metricOverlay) {
          metricOverlay.addEventListener('click', (e) => {
              if (e.target === metricOverlay) {
                  metricOverlay.classList.add('hidden');
                  document.getElementById('metric-modal-content').classList.remove('scale-100');
                  document.getElementById('metric-modal-content').classList.add('scale-95');
              }
          });
      }
  }

  _openMetricModal(type) {
      const overlay = document.getElementById('metric-modal-overlay');
      const content = document.getElementById('metric-modal-content');
      
      let title = '';
      let bodyHtml = '';
      
      const { devices=[], referrers=[], totalVisits=0, avgDuration=0 } = this._analytics || {};
      const formatDuration = (secs) => {
          if (!secs) return '0s';
          const m = Math.floor(secs / 60);
          const s = Math.floor(secs % 60);
          return m > 0 ? `${m}m ${s}s` : `${s}s`;
      };

      if (type === 'devices') {
          title = 'Resumo de Aparelhos';
          const top3 = devices.sort((a,b) => b.count - a.count).slice(0, 3);
          bodyHtml = `
            <div class="space-y-3 mt-4">
              <div class="h-40 mb-6 relative w-full flex justify-center"><canvas id="modal-metric-chart"></canvas></div>
              ${top3.length ? top3.map(d => `
                <div class="flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors">
                  <span class="text-xs font-bold text-white uppercase tracking-wider">${d._id}</span>
                  <span class="font-mono text-blue-400 text-sm font-bold">${d.count} acessos</span>
                </div>
              `).join('') : '<p class="text-gray-500 text-sm text-center py-4">Sem dados</p>'}
            </div>
          `;
      } else if (type === 'referrers') {
          title = 'Resumo de Tráfego';
          const top3 = referrers.sort((a,b) => b.count - a.count).slice(0, 3);
          bodyHtml = `
            <div class="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2">
              <div class="h-40 mb-6 relative w-full flex justify-center"><canvas id="modal-metric-chart"></canvas></div>
              ${top3.length ? top3.map(r => `
                <div class="flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors">
                  <span class="text-xs font-bold text-white break-all pr-4 uppercase tracking-widest">${r._id === 'direct' ? 'Tráfego Direto' : r._id}</span>
                  <span class="font-mono text-blue-400 font-bold whitespace-nowrap">${r.count} <span class="text-xs text-gray-400 font-sans">clicks</span></span>
                </div>
              `).join('') : '<p class="text-gray-500 text-sm text-center py-4">Sem dados</p>'}
            </div>
          `;
      } else if (type === 'time') {
          title = 'Média de Retenção Visual';
          bodyHtml = `
             <div class="flex flex-col items-center justify-center p-6 bg-black/20 rounded-xl border border-white/5 mt-4">
                <span class="text-xs text-gray-500 font-mono uppercase tracking-widest mb-2">Tempo Geral Estimado</span>
                <span class="text-4xl font-bold text-blue-400 font-mono drop-shadow-lg">⏱️ ${formatDuration(avgDuration)}</span>
             </div>

             <h4 class="text-xs text-gray-400 uppercase tracking-widest mt-6 mb-3 border-b border-white/10 pb-2">Retenção Individual por Música</h4>
             <div class="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                ${this._tracks.map(t => {
                   const mx = this._trackAnalytics?.find(x => String(x._id) === String(t._id || t.id));
                   const avg = mx && mx.uniqueListeners ? Math.floor(mx.totalTimeSpent / mx.uniqueListeners) : 0;
                   if (avg === 0) return '';
                   return `
                     <div class="flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors">
                       <span class="text-xs font-bold text-white uppercase truncate pr-2">${t.title}</span>
                       <span class="font-mono text-blue-400 text-sm font-bold whitespace-nowrap">⏱️ ${formatDuration(avg)}</span>
                     </div>
                   `;
                }).filter(Boolean).join('') || '<p class="text-gray-500 text-xs text-center py-4">As pessoas ainda não ficaram tempo suficiente nas faixas para ranquear uma média.</p>'}
             </div>
          `;
      } else if (type === 'visitors') {
          title = 'Visitantes Únicos';
          let { recentPassengers = [] } = this._analytics || {};
          recentPassengers = recentPassengers.filter(p => p.passengerName && p.passengerName !== 'Anônimo');
          
          let currentPage = 1;
          const itemsPerPage = 5;
          const totalPages = Math.ceil(recentPassengers.length / itemsPerPage) || 1;

          const renderPassengersPage = (page) => {
             const start = (page - 1) * itemsPerPage;
             const paginated = recentPassengers.slice(start, start + itemsPerPage);
             
             let html = `<div class="space-y-2 max-h-[30vh] overflow-y-auto pr-1">`;
             if (paginated.length) {
                 html += paginated.map(p => {
                    const safeName = p.passengerName;
                    return `
                    <div class="flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors">
                      <div class="flex items-center gap-3 truncate">
                          <div class="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                              ${safeName.substring(0,2)}
                          </div>
                          <span class="text-xs font-bold text-white uppercase truncate">${safeName}</span>
                      </div>
                      <span class="font-mono text-gray-400 text-[10px] whitespace-nowrap border border-white/10 px-2 py-1 rounded-md">Retenção: <b class="text-white">${formatDuration(p.duration)}</b></span>
                    </div>
                 `}).join('');
             } else {
                 html += '<p class="text-gray-500 text-xs text-center py-4 border border-dashed border-white/10 rounded-xl">Nenhum check-in identificado recebido ainda.</p>';
             }
             html += `</div>`;
             
             html += `
               <div class="flex justify-between items-center mt-4 border-t border-white/10 pt-3 px-1">
                  <button id="btn-prev-page" class="text-[10px] font-bold uppercase text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 p-1 flex items-center gap-1 transition-colors" ${page <= 1 ? 'disabled' : ''}>
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg> Anterior
                  </button>
                  <span class="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">Pág ${page}/${totalPages}</span>
                  <button id="btn-next-page" class="text-[10px] font-bold uppercase text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 p-1 flex items-center gap-1 transition-colors" ${page >= totalPages ? 'disabled' : ''}>
                     Próxima <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                  </button>
               </div>
             `;
             
             return html;
          };

          bodyHtml = `
             <div class="flex flex-col items-center justify-center p-6 bg-black/20 rounded-xl border border-white/5 mt-4">
                <span class="text-xs text-gray-500 font-mono uppercase tracking-widest mb-2">Tráfego Acumulado</span>
                <span class="text-4xl font-bold text-white font-mono drop-shadow-lg">👥 ${totalVisits}</span>
             </div>

             <h4 class="text-xs text-blue-400 uppercase tracking-widest mt-6 mb-3 border-b border-white/10 pb-2 flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Passageiros Identificados (Feed)</h4>
             <div id="passengers-container" class="mb-6">
                 ${renderPassengersPage(currentPage)}
             </div>

             <h4 class="text-xs text-gray-400 uppercase tracking-widest mt-6 mb-3 border-b border-white/10 pb-2">Visitantes por Música</h4>
             <div class="space-y-2 max-h-[25vh] overflow-y-auto pr-1">
                ${this._tracks.map(t => {
                   const mx = this._trackAnalytics?.find(x => String(x._id) === String(t._id || t.id));
                   const u = mx ? mx.uniqueListeners : 0;
                   if (u === 0) return '';
                   return `
                     <div class="flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors">
                       <span class="text-xs font-bold text-white uppercase truncate pr-2">${t.title}</span>
                       <span class="font-mono text-blue-400 text-sm font-bold whitespace-nowrap">👥 ${u}</span>
                     </div>
                   `;
                }).filter(Boolean).join('') || '<p class="text-gray-500 text-xs text-center py-4 border border-white/5 rounded-xl">Nenhum play isolado registrado nas mídias do álbum ainda.</p>'}
             </div>
          `;

          // Override local functions scope for global pagination hook
          window._renderVisitorsPage = (modifier) => {
              if (modifier === -1 && currentPage > 1) currentPage--;
              if (modifier === 1 && currentPage < totalPages) currentPage++;
              document.getElementById('passengers-container').innerHTML = renderPassengersPage(currentPage);
          };
      }

      content.innerHTML = `
        <div class="flex justify-between items-center mb-2 border-b border-white/10 pb-4">
            <h2 class="text-xl font-bold text-white tracking-tight uppercase">${title}</h2>
            <button class="text-gray-400 hover:text-white transition-colors p-1 bg-white/5 rounded-full" onclick="document.getElementById('metric-modal-overlay').classList.add('hidden');">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>
        ${bodyHtml}
      `;

      overlay.classList.remove('hidden');
      setTimeout(() => {
          content.classList.remove('scale-95');
          content.classList.add('scale-100');
          
          if (type === 'visitors' && window._renderVisitorsPage) {
              const connectBtns = () => {
                  const bp = document.getElementById('btn-prev-page');
                  const bn = document.getElementById('btn-next-page');
                  if (bp) bp.onclick = () => { window._renderVisitorsPage(-1); connectBtns(); };
                  if (bn) bn.onclick = () => { window._renderVisitorsPage(1); connectBtns(); };
              };
              connectBtns();
          }

          const ctx = document.getElementById('modal-metric-chart');
          if (ctx && window.Chart) {
              if (type === 'devices') {
                  const dTop = devices.sort((a,b) => b.count - a.count).slice(0, 3);
                  new Chart(ctx, {
                      type: 'doughnut',
                      data: {
                          labels: dTop.map(d => String(d._id).toUpperCase()),
                          datasets: [{
                              data: dTop.map(d => d.count),
                              backgroundColor: ['#F9B572', '#0F2C59', '#3b82f6'],
                              borderWidth: 0, hoverOffset: 4
                          }]
                      },
                      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: {color: '#9ca3af', font: {family: 'Inter', size: 10}} } }, cutout: '70%' }
                  });
              } else if (type === 'referrers') {
                  const rTop = referrers.sort((a,b) => b.count - a.count).slice(0, 3);
                  new Chart(ctx, {
                      type: 'bar',
                      data: {
                          labels: rTop.map(r => String(r._id === 'direct' ? 'DIRETO' : r._id).substring(0, 10)),
                          datasets: [{
                              data: rTop.map(r => r.count),
                              backgroundColor: '#3b82f6', borderRadius: 4, barThickness: 20
                          }]
                      },
                      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display:false } }, scales: { y: { display: false, grid: {display: false} }, x: { ticks: {color: '#9ca3af', font: {size: 9}}, grid: {display: false} } } }
                  });
              }
          }
      }, 50);
  }

  _openTrackModal(trackId) {
      const t = this._tracks.find(x => String(x._id || x.id) === trackId);
      if (!t) return;

      const mx = this._trackAnalytics?.find(x => String(x._id) === trackId);
      const avg = mx && mx.uniqueListeners ? Math.floor(mx.totalTimeSpent / mx.uniqueListeners) : 0;
      
      const formatDuration = (secs) => {
          if (!secs) return '0s';
          const m = Math.floor(secs / 60);
          const s = Math.floor(secs % 60);
          return m > 0 ? `${m}m ${s}s` : `${s}s`;
      };

      const overlay = document.getElementById('track-modal-overlay');
      const content = document.getElementById('track-modal-content');

      content.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-white uppercase tracking-tight">${t.title}</h2>
            <button class="text-gray-400 hover:text-white" onclick="document.getElementById('track-modal-overlay').classList.add('hidden');">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-black/20 rounded-xl p-4 border border-white/5 flex flex-col items-center">
                <span class="text-xs text-gray-500 font-mono uppercase tracking-widest mb-1">Retenção Média</span>
                <span class="text-2xl font-bold text-blue-400 font-mono">⏱️ ${formatDuration(avg)}</span>
            </div>
            <div class="bg-black/20 rounded-xl p-4 border border-white/5 flex flex-col items-center">
                <span class="text-xs text-gray-500 font-mono uppercase tracking-widest mb-1">Visitantes Totais</span>
                <span class="text-2xl font-bold text-white font-mono">👥 ${mx ? mx.uniqueListeners : 0}</span>
            </div>
        </div>
        
        <h3 class="text-xs text-gray-400 uppercase tracking-widest mb-2 border-b border-white/10 pb-2">Engajamento Comprovado</h3>
        <div class="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors">
            <span class="flex items-center gap-2 text-sm text-gray-300">
                ${this._iconHeart('w-4 h-4', 'var(--accent-pink)')} Curtidas
            </span>
            <span class="font-bold text-white font-mono">${t.interactions?.likes || 0}</span>
        </div>
        <div class="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors">
            <span class="flex items-center gap-2 text-sm text-gray-300">
                ${this._iconStar('w-4 h-4', 'var(--accent-yellow)')} Avaliação Média
            </span>
            <span class="font-bold text-white font-mono gap-1 flex items-center">
                ${this._returnRates(t).avgRating} 
                <span class="text-[0.6rem] text-gray-500">(${this._returnRates(t).totalRating} votos)</span>
            </span>
        </div>
      `;

      overlay.classList.remove('hidden');
      setTimeout(() => {
          content.classList.remove('scale-95');
          content.classList.add('scale-100');
      }, 10);
  }
}
