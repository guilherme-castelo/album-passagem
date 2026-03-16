export class CheckinView {
    constructor(formId, inputId, skipBtnId, passengerDisplayId) {
        this.form = document.getElementById(formId);
        this.input = document.getElementById(inputId);
        this.skipBtn = document.getElementById(skipBtnId);
        this.display = document.getElementById(passengerDisplayId);
        
        this.onSubmit = null;
        this.onSkip = null;
        
        this._bindEvents();
    }

    _bindEvents() {
        if (!this.form || !this.skipBtn) return;
        
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const rawName = this.input.value.trim();
            if (rawName && this.onSubmit) {
                this.onSubmit(rawName.toUpperCase());
            }
        });

        this.skipBtn.addEventListener('click', () => {
            if (this.onSkip) this.onSkip();
        });
    }

    render(passengerName) {
        if (this.display) {
            this.display.textContent = passengerName || 'Desconhecido';
        }
    }
}
