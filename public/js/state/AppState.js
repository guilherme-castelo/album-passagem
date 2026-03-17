import { storage } from '../utils/storage.js';

class ApplicationState {
  constructor() {
    this.state = {
      albumData: {},
      tracks: [],
      passengerName: storage.get('passengerName', '') || '',
      likedTracks: storage.get('likedTracks', []),
      ratedTracks: storage.get('ratedTracks', {}),
      visitedTracks: storage.get('visitedTracks', []),
      activeTrackId: null,
      currentView: 'checkin'
    };
    this.listeners = new Map();
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    if (this.state[key] !== value) {
      this.state[key] = value;
      this.notify(key);
    }
  }

  // Retorna dados mutáveis como cópia para evitar efeitos colaterais
  getClone(key) {
    return JSON.parse(JSON.stringify(this.get(key)));
  }

  // Persiste itens específicos no localStorage
  persist(key) {
    if (['passengerName', 'likedTracks', 'ratedTracks', 'visitedTracks'].includes(key)) {
      let val = this.state[key];
      if (key === 'passengerName') {
        storage.set(key, typeof val === 'string' ? val : JSON.stringify(val));
      } else {
        storage.set(key, val);
      }
    }
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);

    // Retorna função para unsubscribe
    return () => {
      const arr = this.listeners.get(key);
      this.listeners.set(
        key,
        arr.filter((cb) => cb !== callback)
      );
    };
  }

  notify(key) {
    if (this.listeners.has(key)) {
      const val = this.get(key);
      this.listeners.get(key).forEach((callback) => callback(val, key));
    }
  }
}

export const AppState = new ApplicationState();
