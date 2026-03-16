// Estado do App
const AppState = {
    albumData: {},
    tracks: [],
    passengerName: localStorage.getItem('passengerName') || '',
    likedTracks: JSON.parse(localStorage.getItem('likedTracks') || '[]'),
    ratedTracks: JSON.parse(localStorage.getItem('ratedTracks') || '{}'),
    visitedTracks: JSON.parse(localStorage.getItem('visitedTracks') || '[]'),
    activeTrackId: null,
    currentView: 'checkin' // 'checkin', 'loading', 'tracklist', 'lyrics'
};

// Referências DOM
const VIEWS = {
    checkin: document.getElementById('view-checkin'),
    loading: document.getElementById('view-loading'),
    tracklist: document.getElementById('view-tracklist'),
    lyrics: document.getElementById('view-lyrics')
};

const UI = {
    checkinForm: document.getElementById('checkin-form'),
    inputPassenger: document.getElementById('input-passenger'),
    btnSkipCheckin: document.getElementById('btn-skip-checkin'),
    passengerNameDisplay: document.getElementById('passenger-name'),
    tracklistContainer: document.getElementById('tracklist-container'),
    btnBack: document.getElementById('btn-back'),
    lyricsGate: document.getElementById('lyrics-gate'),
    lyricsFlight: document.getElementById('lyrics-flight'),
    lyricsTitle: document.getElementById('lyrics-title'),
    lyricsContent: document.getElementById('lyrics-content'),
    mediaContainer: document.getElementById('media-container'),
    mediaPlayers: document.getElementById('media-players'),
    btnLike: document.getElementById('btn-likeTrack'),
    likeCount: document.getElementById('like-count'),
    ratingAvg: document.getElementById('rating-avg'),
    stars: document.querySelectorAll('.star-btn'),
    btnPrevTrack: document.getElementById('btn-prev-track'),
    btnNextTrack: document.getElementById('btn-next-track')
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

    UI.checkinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawName = UI.inputPassenger.value.trim();
        if (rawName) {
            AppState.passengerName = rawName.toUpperCase();
            localStorage.setItem('passengerName', AppState.passengerName);
            UI.passengerNameDisplay.textContent = AppState.passengerName;
            
            navigateTo('loading');
            loadApiData(); // Só chama a API depois do checkin (ou se já tiver feito)
        }
    });

    UI.btnSkipCheckin.addEventListener('click', () => {
        AppState.passengerName = ''; 
        localStorage.removeItem('passengerName'); 
        UI.passengerNameDisplay.textContent = 'Desconhecido';
        
        navigateTo('loading');
        loadApiData();
    });

    UI.btnLike.addEventListener('click', handleLike);
    
    UI.stars.forEach(star => {
        star.addEventListener('click', (e) => {
            const ratingValue = parseInt(e.currentTarget.getAttribute('data-rating'));
            handleRating(ratingValue);
        });
    });
    
    UI.btnPrevTrack.addEventListener('click', () => navigateTrack(-1));
    UI.btnNextTrack.addEventListener('click', () => navigateTrack(1));
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

// Função de arranque
function initApp() {
    if (AppState.passengerName) {
        // Já tem nome salvo
        UI.passengerNameDisplay.textContent = AppState.passengerName;
        // Pula o check-in visualmente
        VIEWS.checkin.classList.replace('active', 'hidden');
        VIEWS.loading.classList.replace('hidden', 'active');
        AppState.currentView = 'loading';
        loadApiData();
    } else {
        UI.passengerNameDisplay.textContent = 'Desconhecido';
        // A view de check-in já é a default configurada no HTML
    }
}

// Carregamento da API local
async function loadApiData() {
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
    
    // Adicionamos classes na lista caso o flex space-y causem problemas na timeline
    UI.tracklistContainer.className = "flex flex-col space-y-4";
    
    AppState.tracks.forEach((track, index) => {
        const trkEl = document.createElement('li');
        trkEl.className = "timeline-item group"; // Aplicando classe para traço vertical
        
        const isVisited = AppState.visitedTracks.includes(track.id);
        const dotClass = isVisited ? 'timeline-dot visited' : 'timeline-dot';
        const stampHtml = isVisited ? '<div class="stamp-visited">BOARDED</div>' : '';
        
        // Cores de status de voo fictícia
        const statusColor = track.status === 'DELAYED' ? 'text-red-500' : 
                            track.status === 'FINAL CALL' ? 'text-brand-orange animate-pulse' : 
                            'text-green-600';

        trkEl.innerHTML = `
            <div class="${dotClass}"></div>
            <div class="track-item cursor-pointer bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
                <!-- Decorador de cor na lateral esquerda do card substituído pela timeline externa, deixamos top edge -->
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
        
        // Clique para ler o destino escolhido
        trkEl.addEventListener('click', () => {
            loadLyricsView(track);
        });
        
        UI.tracklistContainer.appendChild(trkEl);
    });
}

// Carregar Dados da música escolhida na tela Letra e deslizar pra lá
function loadLyricsView(track) {
    AppState.activeTrackId = track.id;
    
    // Registrar Visita (Carimbo de passaporte)
    if (!AppState.visitedTracks.includes(track.id)) {
        AppState.visitedTracks.push(track.id);
        localStorage.setItem('visitedTracks', JSON.stringify(AppState.visitedTracks));
        // Opcional: Re-renderizar tracklist no background para atualizar visualizações sem load
        renderTracklist();
    }
    
    UI.lyricsTitle.textContent = track.title;
    UI.lyricsGate.textContent = `PORTÃO ${track.gate}`;
    UI.lyricsFlight.textContent = track.flightCode;
    UI.lyricsContent.textContent = track.lyrics;
    
    // Tratamento de Mídia
    UI.mediaPlayers.innerHTML = '';
    
    if (track.media && Array.isArray(track.media) && track.media.length > 0) {
        UI.mediaContainer.classList.remove('hidden');
        
        let mediaHtml = '<div class="flex flex-col space-y-4">';
        
        track.media.forEach(item => {
            if (item.type === 'iframe') {
                let finalContent = item.content;
                let origin = (item.origin || '').toLowerCase();
                
                // Verifica se é apenas um link passado (sem a tag <iframe> crua)
                if (!item.content.trim().startsWith('<iframe')) {
                    let embedUrl = item.content;
                    
                    if (origin === 'youtube') {
                        // Extração inteligente de ID do YouTube
                        let videoId = '';
                        if (item.content.includes('v=')) {
                            videoId = item.content.split('v=')[1].split('&')[0];
                        } else if (item.content.includes('youtu.be/')) {
                            videoId = item.content.split('youtu.be/')[1].split('?')[0];
                        }
                        
                        if (videoId) {
                            embedUrl = `https://www.youtube.com/embed/${videoId}?si=passagem_player`;
                        }
                        
                        // Monta o iframe do YouTube ocupando toda a área 16:9 responsiva
                        finalContent = `<div class="w-full relative rounded-xl overflow-hidden shadow-sm aspect-video bg-gray-900 border border-gray-200">
                                            <iframe src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen class="absolute top-0 left-0 w-full h-full"></iframe>
                                        </div>`;
                                        
                    } else if (origin === 'spotify') {
                        // Extração / Tratamento inteligente de URL do Spotify
                        if (embedUrl.includes('spotify.com/track/')) {
                             const parts = embedUrl.split('track/');
                             const trackId = parts[1].split('?')[0];
                             embedUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
                        } else if (!embedUrl.includes('utm_source=generator')) {
                             embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'utm_source=generator';
                        }
                        
                        // Monta o iframe do Spotify conforme padrão oficial (tamanho reduzido, sem 16:9)
                        finalContent = `<iframe style="border-radius:12px" src="${embedUrl}" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
                        
                    } else {
                        // Iframe Genérico com 16:9
                         finalContent = `<div class="w-full relative rounded-xl overflow-hidden shadow-sm aspect-video bg-gray-900 border border-gray-200">
                                            <iframe src="${embedUrl}" title="Media Player" frameborder="0" allowfullscreen class="absolute top-0 left-0 w-full h-full rounded-xl"></iframe>
                                        </div>`;
                    }
                }

                // Injeta no container global da música
                mediaHtml += finalContent;
            } else if (item.type === 'link') {
                
                let btnColor = "bg-gray-800 hover:bg-gray-900";
                let label = `Ouvir / Abrir Link`;
                let icon = '';
                
                if (item.origin.toLowerCase() === 'spotify') {
                    btnColor = "bg-green-500 hover:bg-green-600";
                    label = "Ouvir no Spotify";
                    icon = `<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zM20.16 9.6C16.32 7.32 9.48 7.08 5.52 8.28c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.68-1.32 12.12-1.02 16.56 1.62.54.36.72 1.02.42 1.56-.36.6-.96.78-1.68.24z"/></svg>`;
                } else if (item.origin.toLowerCase() === 'youtube') {
                    btnColor = "bg-red-600 hover:bg-red-700";
                    label = "Assistir no YouTube";
                    icon = `<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
                }
                
                mediaHtml += `
                    <a href="${item.content}" target="_blank" class="w-full flex items-center justify-center space-x-2 ${btnColor} text-white font-bold py-3 px-4 rounded transition-colors shadow">
                        ${icon}
                        <span>${label}</span>
                    </a>
                `;
            }
        });
        
        mediaHtml += '</div>';
        UI.mediaPlayers.innerHTML = mediaHtml;
        
    } else {
        UI.mediaContainer.classList.add('hidden');
    }
    
    // Configura Botões de Navegação Anterior/Próximo
    setupNavigationControls(track);
    
    // Configura Controles de Interação
    setupInteractionControls(track);
    
    navigateTo('lyrics');
}

// === INTERAÇÕES SOCIAIS ===

function navigateTrack(directionOffset) {
    const currentIndex = AppState.tracks.findIndex(t => t.id === AppState.activeTrackId);
    if (currentIndex > -1) {
        const targetIndex = currentIndex + directionOffset;
        if (targetIndex >= 0 && targetIndex < AppState.tracks.length) {
            // Recarrega a view de letras limpa e rola pro topo
            loadLyricsView(AppState.tracks[targetIndex]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

function setupNavigationControls(track) {
    const currentIndex = AppState.tracks.findIndex(t => t.id === track.id);
    
    // Prev Button
    if (currentIndex <= 0) {
        UI.btnPrevTrack.disabled = true;
    } else {
        UI.btnPrevTrack.disabled = false;
    }
    
    // Next Button
    if (currentIndex >= AppState.tracks.length - 1) {
        UI.btnNextTrack.disabled = true;
    } else {
        UI.btnNextTrack.disabled = false;
    }
}

function setupInteractionControls(track) {
    // Likes
    const interactions = track.interactions || { likes: 0, ratings: [] };
    UI.likeCount.textContent = interactions.likes;
    
    if (AppState.likedTracks.includes(track.id)) {
        UI.btnLike.classList.add('liked');
    } else {
        UI.btnLike.classList.remove('liked');
    }
    
    // Ratings
    updateStarUI(AppState.ratedTracks[track.id] || 0); // Pinta as estrelas com o voto local se houver
    
    let media = "--";
    if (interactions.ratings && interactions.ratings.length > 0) {
        const sum = interactions.ratings.reduce((a, b) => a + b, 0);
        media = (sum / interactions.ratings.length).toFixed(1);
    }
    UI.ratingAvg.textContent = `Média: ${media}`;
}

function updateStarUI(votedRating) {
    UI.stars.forEach(star => {
        const starVal = parseInt(star.getAttribute('data-rating'));
        if(starVal <= votedRating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
        
        // Permite re-clicar nas estrelas para editar a nota
        star.style.pointerEvents = 'auto';
    });
}

async function handleLike() {
    const trackId = AppState.activeTrackId;
    if (!trackId) return;
    
    const isLiked = AppState.likedTracks.includes(trackId);
    const action = isLiked ? 'unlike' : 'like';
    
    // Optimistic UI update
    if (isLiked) {
        UI.btnLike.classList.remove('liked');
        UI.likeCount.textContent = Math.max(0, parseInt(UI.likeCount.textContent) - 1);
        AppState.likedTracks = AppState.likedTracks.filter(id => id !== trackId);
    } else {
        UI.btnLike.classList.add('liked');
        UI.likeCount.textContent = parseInt(UI.likeCount.textContent) + 1;
        AppState.likedTracks.push(trackId);
    }
    
    localStorage.setItem('likedTracks', JSON.stringify(AppState.likedTracks));
    
    // Envia API
    try {
        await fetch(`/api/musicas/${trackId}/like`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
    } catch(err) {
        console.error("Falha ao curtir online", err);
    }
}

async function handleRating(ratingValue) {
    const trackId = AppState.activeTrackId;
    if (!trackId) return;
    
    const oldRating = AppState.ratedTracks[trackId];
    
    // Evita chamada se a pessoa clicou na mesma estrela
    if (oldRating === ratingValue) return;
    
    // Optimistic UI update
    updateStarUI(ratingValue);
    
    AppState.ratedTracks[trackId] = ratingValue;
    localStorage.setItem('ratedTracks', JSON.stringify(AppState.ratedTracks));
    
    try {
        const res = await fetch(`/api/musicas/${trackId}/rate`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating: ratingValue, oldRating: oldRating })
        });
        
        const data = await res.json();
        // Opcional: Recalcular a média total retornada pela API
        if(data.ratings) {
            const sum = data.ratings.reduce((a, b) => a + b, 0);
            UI.ratingAvg.textContent = `Média: ${(sum / data.ratings.length).toFixed(1)}`;
        }
    } catch(err) {
        console.error("Falha ao salvar rating", err);
    }
}
