/**
 * AnalyticsTracker - Engine for generating session data and time tracking per track.
 * Sends data silently using the Beacon API or Fetch.
 */
export class AnalyticsTracker {
    constructor() {
        this.sessionId = this._getOrInitSession();
        this.deviceType = this._detectDevice();
        this.utmData = this._getUTMData();
        this.referrer = this._getReferrer();
        
        this.sessionStart = Date.now();
        
        // tracking state per track
        this.currentTrackId = null;
        this.currentTrackStartTime = null;
        this.trackDurations = {}; // { trackId: accumulatedSeconds }

        this._bindEvents();
    }

    _getOrInitSession() {
        let sid = sessionStorage.getItem('analytics_session_id');
        if (!sid) {
            sid = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
            sessionStorage.setItem('analytics_session_id', sid);
        }
        return sid;
    }

    _detectDevice() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile';
        return 'desktop';
    }

    _getUTMData() {
        const params = new URLSearchParams(window.location.search);
        return {
            source: params.get('utm_source') || params.get('origem') || null,
            medium: params.get('utm_medium') || null,
            campaign: params.get('utm_campaign') || null
        };
    }

    _getReferrer() {
        // 1. Prioriza dados UTM capturados
        if (this.utmData && this.utmData.source) {
            return String(this.utmData.source).toLowerCase();
        }

        // 2. Tenta capturar o metadado real do navegador (Geralmente bloqueado por redes sociais)
        let ref = document.referrer;
        if (!ref) return 'Direct'; // Tráfego Limpo/Link copiado e colado direto
        
        try {
            const url = new URL(ref);
            // Ignore se a origem detectada for o proprio site para nao bugar como referrer externo
            if (url.hostname === window.location.hostname) return 'Direct';
            
            return url.hostname.replace('www.', ''); // "instagram.com", "linktr.ee"
        } catch {
            return ref;
        }
    }

    /** Called when the user starts viewing a new track */
    startViewingTrack(trackId) {
        if (this.currentTrackId === trackId) return;

        // Save previous track time
        this._commitCurrentTrackTime();

        // Start new track timer
        this.currentTrackId = trackId;
        this.currentTrackStartTime = Date.now();
    }

    _commitCurrentTrackTime() {
        if (this.currentTrackId && this.currentTrackStartTime) {
            const timeSpentSecs = Math.floor((Date.now() - this.currentTrackStartTime) / 1000);
            if (timeSpentSecs > 0) {
                this.trackDurations[this.currentTrackId] = (this.trackDurations[this.currentTrackId] || 0) + timeSpentSecs;
            }
        }
        this.currentTrackStartTime = null;
    }

    _buildPayload() {
        // Force commit of anything actively being viewed right now
        if (this.currentTrackId && this.currentTrackStartTime) {
            const timeSpentSecs = Math.floor((Date.now() - this.currentTrackStartTime) / 1000);
            if (timeSpentSecs > 0) {
                this.trackDurations[this.currentTrackId] = (this.trackDurations[this.currentTrackId] || 0) + timeSpentSecs;
                // Reset start time so it doesn't double-count on next ping
                this.currentTrackStartTime = Date.now();
            }
        }

        const totalDurationParams = Math.floor((Date.now() - this.sessionStart) / 1000);

        const trackViews = Object.keys(this.trackDurations).map(id => ({
            trackId: id,
            duration: this.trackDurations[id]
        }));

        const passengerName = localStorage.getItem('passengerName') || 'Anônimo';

        return {
            sessionId: this.sessionId,
            data: {
                deviceType: this.deviceType,
                referrer: this.referrer,
                utm_source: this.utmData.source,
                utm_medium: this.utmData.medium,
                utm_campaign: this.utmData.campaign,
                duration: totalDurationParams,
                trackViews: trackViews,
                passengerName: passengerName
            }
        };
    }

    _sendPing(useBeacon = false) {
        const payload = this._buildPayload();
        const url = '/api/analytics/session';

        if (useBeacon && navigator.sendBeacon) {
            // Need to send stringified JSON via Blob for application/json content-type
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            navigator.sendBeacon(url, blob);
        } else {
            // Standard fetch as fallback or periodic
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
                // keepalive: true // useful if page is unloading
            }).catch(e => console.error('Analytics error:', e));
        }
    }

    _bindEvents() {
        // Ping silently every 15 seconds to ensure we gather metrics even if they never "close" the tab properly
        setInterval(() => {
            this._sendPing(false);
        }, 15000);

        // Ping when visibility changes (e.g. minimizing the browser or switching tabs)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this._sendPing(true); // use beacon
            } else {
                // Return to view, re-anchor current track timer so it doesn't count background time heavily (optional, but good practice)
                if (this.currentTrackId) {
                    this.currentTrackStartTime = Date.now();
                }
            }
        });
    }
}

export const analytics = new AnalyticsTracker();
