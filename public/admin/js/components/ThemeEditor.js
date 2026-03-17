/**
 * ThemeEditor — A visual editor for album uiConfig.
 * Handles color pickers, font selection, and layout toggles.
 */
import { $ } from '../utils/dom.js';
import { toast } from '../components/ToastComponent.js';

export class ThemeEditor {
  constructor(container) {
    this.container = container;
    this.config = null;

    /** @type {Function|null} (newConfig) => void */
    this.onSave = null;
    /** @type {Function|null} (newConfig) => void */
    this.onChange = null;
  }

  render(config) {
    this.config = JSON.parse(JSON.stringify(config)); // Deep clone
    this.container.innerHTML = `
      <div class="theme-editor space-y-8">
        <!-- Sections Layout -->
        <section class="glass-card p-4 border-l-4 border-accent-purple">
          <h4 class="font-bold text-white mb-4 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
            Layout e Visibilidade
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" data-path="layout.showInteractions" ${this._getValueByPath('layout.showInteractions') ? 'checked' : ''} class="checkbox-custom" />
              <span class="text-sm">Mostrar Likes/Ratings</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" data-path="layout.showLyrics" ${this._getValueByPath('layout.showLyrics') ? 'checked' : ''} class="checkbox-custom" />
              <span class="text-sm">Mostrar Letras</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" data-path="layout.showMedia" ${this._getValueByPath('layout.showMedia') ? 'checked' : ''} class="checkbox-custom" />
              <span class="text-sm">Mostrar Mídia (YouTube/Spotify)</span>
            </label>
            <div>
              <label class="label text-[10px] mb-1">Modo de Exibição das Faixas</label>
              <select data-path="layout.trackDisplay" class="glass-input text-xs p-2 capitalize">
                <option value="list" ${this._getValueByPath('layout.trackDisplay') === 'list' ? 'selected' : ''}>Lista (Padrão)</option>
                <option value="grid" ${this._getValueByPath('layout.trackDisplay') === 'grid' ? 'selected' : ''}>Grade (Cards)</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Colors -->
        <section class="glass-card p-4 border-l-4 border-accent-pink">
          <h4 class="font-bold text-white mb-4 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
            Paleta de Cores
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
            ${this._renderColorInput('Primária', 'colors.primary')}
            ${this._renderColorInput('Destaque', 'colors.accent')}
            ${this._renderColorInput('Fundo', 'colors.background')}
            ${this._renderColorInput('Texto', 'colors.text')}
            ${this._renderColorInput('Muted', 'colors.muted')}
          </div>
        </section>

        <!-- Labels -->
        <section class="glass-card p-4 border-l-4 border-accent-blue">
          <h4 class="font-bold text-white mb-4 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
            Textos e Rótulos
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="label text-[10px] mb-1">Rótulo da Faixa (ex: Voo)</label>
              <input type="text" data-path="labels.trackCode" value="${this._getValueByPath('labels.trackCode')}" class="glass-input text-xs" />
            </div>
            <div>
              <label class="label text-[10px] mb-1">Rótulo da Tag (ex: Portão)</label>
              <input type="text" data-path="labels.trackTag" value="${this._getValueByPath('labels.trackTag')}" class="glass-input text-xs" />
            </div>
            <div>
              <label class="label text-[10px] mb-1">Botão Principal (CTA)</label>
              <input type="text" data-path="labels.cta" value="${this._getValueByPath('labels.cta')}" class="glass-input text-xs" />
            </div>
          </div>
        </section>

        <!-- Google Fonts -->
        <section class="glass-card p-4 border-l-4 border-accent-green">
          <h4 class="font-bold text-white mb-4 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v8m1.048 6L10 15H4l-.048 2M10 15l.952 4M4 15l-.952 4M12 9l9 9-3 3-9-9"/></svg>
            Tipografia (Google Fonts)
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="label text-[10px] mb-1">Fonte Títulos</label>
              <input type="text" data-path="typography.heading" value="${this._getValueByPath('typography.heading')}" class="glass-input text-xs" placeholder="Ex: Outfit, Inter..." />
            </div>
            <div>
              <label class="label text-[10px] mb-1">Fonte Texto</label>
              <input type="text" data-path="typography.body" value="${this._getValueByPath('typography.body')}" class="glass-input text-xs" placeholder="Ex: Inter, Roboto..." />
            </div>
          </div>
          <p class="text-[10px] text-muted mt-2 italic">* Use nomes exatos do Google Fonts. Caso a fonte não exista, o sistema usará a fonte padrão.</p>
        </section>

        <!-- AI Prompt Generator -->
        <section class="glass-card p-4 border-l-4 border-amber-500">
          <h4 class="font-bold text-white mb-2 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Gerador de Prompt (IA)
          </h4>
          <p class="text-xs text-muted mb-4">Copie o prompt abaixo e cole no ChatGPT/Claude para solicitar um design personalizado que se encaixa perfeitamente na plataforma.</p>
          <div class="flex flex-col gap-3">
            <textarea id="ai-prompt-area" class="glass-input font-mono text-[10px] h-32" readonly></textarea>
            <button id="btn-copy-prompt" class="btn-ghost w-full text-[10px] flex items-center justify-center gap-2">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
              Copiar Prompt para IA
            </button>
          </div>
        </section>

        <!-- Import/Export -->
        <section class="glass-card p-4 border-l-4 border-slate-500">
          <h4 class="font-bold text-white mb-4 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/></svg>
            Ações de Desenvolvedor (JSON)
          </h4>
          <div class="flex flex-col gap-3">
            <textarea id="json-config-area" class="glass-input font-mono text-[10px] h-24" placeholder="Cole um JSON aqui para importar..."></textarea>
            <div class="flex gap-2">
              <button id="btn-import-json" class="btn-ghost flex-1 text-[10px]">Importar JSON</button>
              <button id="btn-export-json" class="btn-ghost flex-1 text-[10px]">Copiar JSON Atual</button>
            </div>
          </div>
        </section>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-4">
          <button id="btn-reset-theme" class="btn-ghost text-xs">Resetar para Padrões</button>
          <button id="btn-save-theme" class="btn-primary" style="padding: 0.75rem 2rem;">Salvar Alterações de Tema</button>
        </div>
      </div>
    `;

    this._attachEvents();
    this._generateAiPrompt();
  }

  _generateAiPrompt() {
    const prompt = `Atue como um Especialista em UI/UX Design para Música. 
O site do artista é uma plataforma SaaS onde personalizamos a aparência via um JSON de configuração (uiConfig). 
Gere para mim um JSON "uiConfig" com um tema [DESCREVA O ESTILO AQUI, ex: Cyberpunk, Minimalista, Dark Techno].

ESTRUTURA OBRIGATÓRIA:
{
  "theme": "custom",
  "colors": {
    "primary": "Cor principal da marca",
    "accent": "Cor de destaque/interação",
    "background": "Cor de fundo da página",
    "text": "Cor do texto principal",
    "muted": "Cor de textos secundários"
  },
  "typography": {
    "heading": "Nome de uma Google Font para títulos",
    "body": "Nome de uma Google Font para textos",
    "mono": "Nome de uma Google Font mono (ex: Roboto Mono)"
  },
  "layout": {
    "sections": ["hero", "tracklist", "lyrics"],
    "trackDisplay": "list ou grid",
    "showInteractions": true ou false,
    "showLyrics": true ou false,
    "showMedia": true ou false
  },
  "labels": {
    "trackCode": "Como chamar o ID da faixa (ex: Track #, PSG)",
    "trackTag": "Como chamar a categoria (ex: Tag, Voo)",
    "cta": "Texto do botão de ação"
  },
  "branding": {
    "title": "Título customizado para a página",
    "subtitle": "Subtítulo de impacto",
    "footer": "Texto do rodapé"
  }
}

REGRAS: 
- Cores em formato HEX (#RRGGBB).
- Fontes devem ser do catálogo oficial do Google Fonts.
- Retorne APENAS o JSON puro, sem comentários.`;

    const area = $('ai-prompt-area');
    if (area) area.value = prompt;
  }

  _renderColorInput(label, path) {
    const value = this._getValueByPath(path);
    return `
      <div class="flex flex-col items-center gap-1">
        <label class="text-[10px] text-muted">${label}</label>
        <div class="relative group">
          <input type="color" data-path="${path}" value="${value}" class="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-2 border-white/10 hover:border-accent-pink transition-colors" />
          <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white/20 border border-white/10 group-hover:bg-accent-pink transition-colors"></div>
        </div>
        <span class="text-[9px] font-mono opacity-50 uppercase">${value}</span>
      </div>
    `;
  }

  _getValueByPath(path) {
    return path
      .split('.')
      .reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : ''), this.config);
  }

  _setValueByPath(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = this.config;
    for (const key of keys) {
      if (!target[key]) target[key] = {};
      target = target[key];
    }
    target[lastKey] = value;
  }

  _attachEvents() {
    // General changes
    this.container.querySelectorAll('input, select').forEach((el) => {
      const eventType = el.type === 'color' || el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(eventType, () => {
        const path = el.dataset.path;
        let value = el.type === 'checkbox' ? el.checked : el.value;
        this._setValueByPath(path, value);

        // Update hex text display for color inputs
        if (el.type === 'color') {
          const hexDisplay = el.parentElement.parentElement.querySelector('span');
          if (hexDisplay) hexDisplay.textContent = value;
        }

        if (this.onChange) this.onChange(this.config);
      });
    });

    // Reset button
    $('btn-reset-theme').addEventListener('click', () => {
      // In a real scenario, we'd fetch the DEFAULT_UI_CONFIG from a shared lib or API
      // For now, we'll just emit a reset intent
      if (confirm('Deseja resetar todas as cores e fontes para o padrão da plataforma?')) {
        // We'll let the controller handle actual reset data
        if (this.onSave) this.onSave('RESET');
      }
    });

    // Save button
    $('btn-save-theme').addEventListener('click', () => {
      if (this.onSave) this.onSave(this.config);
    });

    // Import JSON
    $('btn-import-json').addEventListener('click', () => {
      const area = $('json-config-area');
      try {
        const imported = JSON.parse(area.value);
        if (confirm('Deseja sobrescrever as cores e fontes atuais com este JSON?')) {
          this.render(imported);
          toast.success('JSON importado! Não esqueça de salvar.');
        }
      } catch (e) {
        alert('JSON inválido. Verifique o formato e tente novamente.');
      }
    });

    // Export JSON
    $('btn-export-json').addEventListener('click', () => {
      const json = JSON.stringify(this.config, null, 2);
      navigator.clipboard.writeText(json);
      $('json-config-area').value = json;
      alert('Configuração copiada para o clipboard!');
    });

    // Copy AI Prompt
    $('btn-copy-prompt').addEventListener('click', () => {
      const area = $('ai-prompt-area');
      area.select();
      navigator.clipboard.writeText(area.value);
      toast.success('Prompt copiado! Cole no ChatGPT e descreva seu estilo.');
    });
  }
}
