export const MediaRenderer = {
    strategies: {
        youtube: (item) => {
            let embedUrl = item.content;
            let videoId = '';
            
            if (item.content.includes('v=')) {
                videoId = item.content.split('v=')[1].split('&')[0];
            } else if (item.content.includes('youtu.be/')) {
                videoId = item.content.split('youtu.be/')[1].split('?')[0];
            }
            
            if (videoId) {
                embedUrl = `https://www.youtube.com/embed/${videoId}?si=passagem_player`;
            }
            
            return `
                <div class="w-full relative rounded-xl overflow-hidden shadow-sm aspect-video bg-gray-900 border border-gray-200">
                    <iframe src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen class="absolute top-0 left-0 w-full h-full"></iframe>
                </div>`;
        },
        
        spotify: (item) => {
             let embedUrl = item.content;
             if (embedUrl.includes('spotify.com/track/')) {
                 const parts = embedUrl.split('track/');
                 const trackId = parts[1].split('?')[0];
                 embedUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
             } else if (!embedUrl.includes('utm_source=generator')) {
                 embedUrl += (embedUrl.includes('?') ? '&' : '?') + 'utm_source=generator';
             }
             
             return `<iframe style="border-radius:12px" src="${embedUrl}" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
        },
        
        genericIframe: (item) => {
            return `
                <div class="w-full relative rounded-xl overflow-hidden shadow-sm aspect-video bg-gray-900 border border-gray-200">
                    <iframe src="${item.content}" title="Media Player" frameborder="0" allowfullscreen class="absolute top-0 left-0 w-full h-full rounded-xl"></iframe>
                </div>`;
        },
        
        link: (item) => {
            let btnColor = "bg-gray-800 hover:bg-gray-900";
            let label = `Ouvir / Abrir Link`;
            let icon = '';
            const origin = item.origin.toLowerCase();
            
            if (origin === 'spotify') {
                btnColor = "bg-green-500 hover:bg-green-600";
                label = "Ouvir no Spotify";
                icon = `<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zM20.16 9.6C16.32 7.32 9.48 7.08 5.52 8.28c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.68-1.32 12.12-1.02 16.56 1.62.54.36.72 1.02.42 1.56-.36.6-.96.78-1.68.24z"/></svg>`;
            } else if (origin === 'youtube') {
                btnColor = "bg-red-600 hover:bg-red-700";
                label = "Assistir no YouTube";
                icon = `<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
            }
            
            return `
                <a href="${item.content}" target="_blank" class="w-full flex items-center justify-center space-x-2 ${btnColor} text-white font-bold py-3 px-4 rounded transition-colors shadow">
                    ${icon}
                    <span>${label}</span>
                </a>
            `;
        }
    },

    render(mediaItems) {
        if (!mediaItems || !Array.isArray(mediaItems) || mediaItems.length === 0) return '';
        
        let html = '<div class="flex flex-col space-y-4">';
        
        mediaItems.forEach(item => {
            if (item.type === 'iframe') {
                // Backward compatibility raw iframe support
                if (item.content.trim().startsWith('<iframe')) {
                    html += item.content;
                    return;
                }
                
                const origin = (item.origin || '').toLowerCase();
                const strategy = this.strategies[origin] || this.strategies.genericIframe;
                html += strategy(item);
                
            } else if (item.type === 'link') {
                html += this.strategies.link(item);
            }
        });
        
        html += '</div>';
        return html;
    }
};
