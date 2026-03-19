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

  render(tracks) {
    const totalLikes = tracks.reduce((s, t) => s + (t.interactions?.likes || 0), 0);
    const allRatings = tracks.flatMap(t => t.interactions?.ratings || []);
    const avgRating = allRatings.length
      ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1)
      : '--';

    this.container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        ${this._statCard('Total de Faixas', tracks.length, '--accent-violet', 'stat-card-violet', this._iconMusic())}
        ${this._statCard('Total de Likes', totalLikes, '--accent-pink', 'stat-card-pink', this._iconHeart())}
        ${this._statCard('Avaliação Média', avgRating === '--' ? '--' : `${avgRating}★`, '--accent-yellow', 'stat-card-yellow', this._iconStar())}
      </div>

      <div class="glass-card py-5 px-2 md:p-5">
        <h3 class="font-semibold text-sm mb-4 flex items-center gap-2" style="color: var(--text-secondary)">
          <svg class="w-4 h-4" style="color: var(--accent-violet)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          FAIXAS MAIS CURTIDAS
        </h3>
        <div class="space-y-1">
          ${this._renderTopTracks(tracks)}
        </div>
      </div>
    `;
  }

  _statCard(label, value, colorVar, borderClass, iconSvg) {
    return `
      <div class="glass-card stat-card ${borderClass} p-5 relative overflow-hidden">
        <div class="absolute top-3 right-3 opacity-10" style="color: var(${colorVar})">${iconSvg}</div>
        <p class="label mb-2">${label}</p>
        <p class="text-3xl font-bold" style="color: var(${colorVar})">${value}</p>
      </div>
    `;
  }

  _returnRates(track){
    const totalRating = track.interactions?.ratings.reduce((a, b) => a + b, 0);
    const avgRating = (totalRating / track.interactions?.ratings.length).toFixed(1) || 0;
    return {avgRating, totalRating};
  }

  _renderTopTracks(tracks) {
    const sorted = [...tracks]
      .sort((a, b) => (b.interactions?.likes || 0) - (a.interactions?.likes || 0))
      .slice(0, 10);
    
    if (!sorted.length) return '<p style="color: var(--text-muted)" class="text-sm py-4 text-center">Nenhuma faixa encontrada.</p>';

    return sorted.map((t, i) => `
      <div class="grid grid-cols-7 w-full py-2.5 px-0 md:px-3 rounded-lg hover:bg-white/5 transition-colors group">
        <div class="col-span-4 flex justify-start">
          <span class="font-mono text-xs w-5" style="color: var(--text-muted)">${i + 1}</span>
          <span class="font-medium text-sm truncate max-w-[200px]" style="color: var(--text-primary)">${t.title}</span>
        </div>
        <span class="flex justify-center font-mono text-xs flex items-center gap-1" style="color: var(--accent-pink)">
          ${this._iconHeart('w-3 h-3', 'var(--accent-pink)')}
          ${t.interactions?.likes || 0}
        </span>
        <span class="col-span-2 flex justify-end font-mono text-xs flex items-center gap-1 truncate " style="color: var(--accent-yellow)">
          ${this._iconStar('w-3 h-3', 'var(--accent-yellow)')}
      </div>
    `).join('');
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
}
