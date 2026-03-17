export class LoadingView {
  constructor(elementId) {
    this.dom = document.getElementById(elementId);
  }

  showError(errorMsg, subMsg = 'Falha na rota base. Escaneie novamente.') {
    if (!this.dom) return;
    this.dom.innerHTML = `
            <div class="text-red-500 mb-4">
               <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 class="font-bold text-red-600">${errorMsg}</h3>
            <p class="text-xs text-gray-500 mt-2">${subMsg}</p>
        `;
  }

  reset() {
    if (!this.dom) return;
    this.dom.innerHTML = `
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mb-4"></div>
            <p class="font-mono text-sm text-gray-500 uppercase tracking-widest animate-pulse">Buscando destinos...</p>
        `;
  }
}
