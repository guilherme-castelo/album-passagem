import { ModalComponent } from './ModalComponent.js';
import { $ } from '../utils/dom.js';

export class ShareLinkModal {
    constructor() {
        this.modal = new ModalComponent({
            title: 'Gerador de Links de Divulgação',
            size: 'md'
        });
        
        this.commonSources = [
            { label: 'Instagram (Bio)', source: 'instagram', medium: 'perfil', campaign: 'bio' },
            { label: 'Instagram (Stories)', source: 'instagram', medium: 'stories', campaign: 'stories' },
            { label: 'WhatsApp (Status)', source: 'whatsapp', medium: 'stories', campaign: 'status' },
            { label: 'WhatsApp (Direto)', source: 'whatsapp', medium: 'direct', campaign: 'chat' },
            { label: 'Facebook (Ads)', source: 'facebook', medium: 'cpc', campaign: 'ads' },
            { label: 'Linktree', source: 'linktree', medium: 'referral', campaign: 'bio' }
        ];

        this._initialize();
    }

    _initialize() {
        this.modal.setBody(`
            <div class="space-y-6">
                <div class="glass-card p-4 bg-white/5 border border-white/10 rounded-lg">
                    <label class="label mb-2 block text-xs uppercase tracking-widest text-gray-500">Presets de Divulgação</label>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" id="share-presets">
                        ${this.commonSources.map((s, i) => `
                            <button class="preset-btn p-2 text-[10px] rounded border border-white/10 hover:bg-brand-orange hover:text-white transition-all text-center leading-tight uppercase font-medium" data-index="${i}">
                                ${s.label}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label class="label">Origem (Source)</label>
                            <input type="text" id="utm-source" class="glass-input text-xs" placeholder="ex: instagram" />
                        </div>
                        <div>
                            <label class="label">Meio (Medium)</label>
                            <input type="text" id="utm-medium" class="glass-input text-xs" placeholder="ex: stories" />
                        </div>
                        <div>
                            <label class="label">Campanha (Campaign)</label>
                            <input type="text" id="utm-campaign" class="glass-input text-xs" placeholder="ex: lancamento" />
                        </div>
                    </div>
                </div>

                <div class="p-4 bg-black/40 rounded-lg border border-white/5 space-y-2">
                    <label class="label text-xs uppercase text-brand-orange font-bold">Link Gerado</label>
                    <div class="flex items-center gap-2">
                        <input type="text" id="generated-link" class="glass-input flex-1 font-mono text-[10px] bg-transparent border-0 p-0 focus:ring-0" readonly />
                        <button id="btn-copy-link" class="btn-primary py-2 px-3 text-xs flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                            Copiar
                        </button>
                    </div>
                </div>
            </div>
        `);

        this._attachEvents();
    }

    _attachEvents() {
        const body = this.modal.getBodyElement();
        
        body.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.dataset.index;
                const preset = this.commonSources[idx];
                
                $('utm-source').value = preset.source;
                $('utm-medium').value = preset.medium;
                $('utm-campaign').value = preset.campaign;
                
                this._updateLink();
            });
        });

        const inputs = ['utm-source', 'utm-medium', 'utm-campaign'];
        inputs.forEach(id => {
            $(id).addEventListener('input', () => this._updateLink());
        });

        $('btn-copy-link').addEventListener('click', () => {
            const link = $('generated-link').value;
            if (!link) return;

            navigator.clipboard.writeText(link).then(() => {
                const btn = $('btn-copy-link');
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '✨ Copiado!';
                btn.classList.add('bg-green-600');
                
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.classList.remove('bg-green-600');
                }, 2000);
            });
        });
    }

    _updateLink() {
        const source = $('utm-source').value.trim();
        const medium = $('utm-medium').value.trim();
        const campaign = $('utm-campaign').value.trim();

        const baseUrl = window.location.origin;
        const params = new URLSearchParams();

        if (source) {
            params.set('utm_source', source);
            // Compatibilidade retroativa solicitada pelo usuário
            params.set('origem', source);
        }
        if (medium) params.set('utm_medium', medium);
        if (campaign) params.set('utm_campaign', campaign);

        const queryString = params.toString();
        $('generated-link').value = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    }

    open() {
        this.modal.open();
        this._updateLink();
    }
}
