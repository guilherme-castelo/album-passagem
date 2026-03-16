// Estado do App
const AppState = {
    albumData: {},
    tracks: [],
    currentView: 'loading' // 'loading', 'tracklist', 'lyrics'
};

// Referências DOM
const VIEWS = {
    loading: document.getElementById('view-loading'),
    tracklist: document.getElementById('view-tracklist'),
    lyrics: document.getElementById('view-lyrics')
};

const UI = {
    tracklistContainer: document.getElementById('tracklist-container'),
    btnBack: document.getElementById('btn-back'),
    lyricsGate: document.getElementById('lyrics-gate'),
    lyricsFlight: document.getElementById('lyrics-flight'),
    lyricsTitle: document.getElementById('lyrics-title'),
    lyricsContent: document.getElementById('lyrics-content')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

function setupEventListeners() {
    UI.btnBack.addEventListener('click', () => {
        navigateTo('tracklist');
    });
}

// Lógica de Troca de Páginas (State View Controller)
function navigateTo(targetView) {
    if (AppState.currentView === targetView) return;
    
    // Ocultar a atual com animação (Soft out)
    const currentEl = VIEWS[AppState.currentView];
    
    // Preparar para esconder
    currentEl.classList.remove('active');
    
    // Mostrar a nova
    const targetEl = VIEWS[targetView];
    targetEl.classList.remove('hidden', 'slide-out-left', 'slide-out-right');
    targetEl.classList.add('active');
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Esconder totalmente a anterior depois de transição
    setTimeout(() => {
        currentEl.classList.add('hidden');
    }, 300); // tempo que casa com a utility duration-300 de tailwind ou a do css nativo

    AppState.currentView = targetView;
}

// Função de arranque (Carregamento da API local Node.js / porta 3001)
async function initApp() {
    try {
        // Como o app é monolítico, batemos na mesma raiz local.  (Alterado para a porta nova 3001 simulada na máquina real)
        const DEV_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
        const response = await fetch(`${DEV_URL}/api/musicas`);
        
        if (!response.ok) throw new Error('Falha ao conectar na torre de controle.');
        
        const data = await response.json();
        
        // Salva estado globalmente
        AppState.albumData = data.album;
        AppState.tracks = data.tracks;
        
        // Ocultar load de forma artificial pro usuário ver o estilo de carregamento rapidão (+500ms só)
        setTimeout(() => {
            renderTracklist();
            navigateTo('tracklist');
        }, 600);
        
    } catch (error) {
        console.error("Erro na API: ", error);
        VIEWS.loading.innerHTML = `
            <div class="text-red-500 mb-4">
               <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 class="font-bold text-red-600">Voo Cancelado</h3>
            <p class="text-xs text-gray-500 mt-2">Falha na rota base. Escaneie novamente.</p>
        `;
    }
}

// Renderiza Banners de Passagens (Botão das músicas)
function renderTracklist() {
    UI.tracklistContainer.innerHTML = '';
    
    AppState.tracks.forEach((track, index) => {
        const trkEl = document.createElement('li');
        trkEl.className = "track-item cursor-pointer bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden group";
        
        // Cores de status de voo fictícia
        const statusColor = track.status === 'DELAYED' ? 'text-red-500' : 
                            track.status === 'FINAL CALL' ? 'text-brand-orange animate-pulse' : 
                            'text-green-600';

        trkEl.innerHTML = `
            <!-- Decorador de cor na lateral esquerda do card -->
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue group-hover:bg-brand-orange transition-colors"></div>
            
            <div class="flex justify-between items-start mb-2">
                <span class="text-[0.65rem] text-gray-400 font-mono tracking-wider">FLIGHT / VOO</span>
                <span class="text-[0.65rem] ${statusColor} font-mono tracking-wider font-bold">${track.status}</span>
            </div>
            
            <div class="flex justify-between items-end">
                <div class="flex-1">
                    <h4 class="font-bold text-lg leading-tight text-gray-800 line-clamp-1 group-active:text-brand-blue transition-colors">
                        <span class="text-xs font-mono text-gray-400 mr-1">${String(index + 1).padStart(2, '0')}.</span> 
                        ${track.title}
                    </h4>
                </div>
                
                <div class="text-right pl-3 ml-3 border-l border-gray-100">
                    <span class="block text-[0.6rem] text-gray-400 font-mono">GATE</span>
                    <span class="block font-mono font-bold text-brand-orange">${track.gate}</span>
                </div>
            </div>
        `;
        
        // Clique para ler letra da música
        trkEl.addEventListener('click', () => {
            loadLyricsView(track);
        });
        
        UI.tracklistContainer.appendChild(trkEl);
    });
}

// Carregar Dados da música escolhida na tela Letra e deslizar pra lá
function loadLyricsView(track) {
    UI.lyricsTitle.textContent = track.title;
    UI.lyricsGate.textContent = `PORTÃO ${track.gate}`;
    UI.lyricsFlight.textContent = track.flightCode;
    UI.lyricsContent.textContent = track.lyrics;
    
    navigateTo('lyrics');
}
