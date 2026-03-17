/**
 * AdminState — Reactive state management (Observer pattern).
 * Mirrors the public site's AppState pattern.
 */
class AdminStateManager {
  constructor() {
    this._state = {
      currentSection: 'dashboard',
      albums: [],
      selectedAlbum: null,
      tracks: [],
      users: [],
      isLoading: false
    };
    this._listeners = new Map();
  }

  get(key) {
    return this._state[key];
  }

  set(key, value) {
    this._state[key] = value;
    this._notify(key);
  }

  /** Returns a deep clone to avoid mutation side-effects. */
  getClone(key) {
    return JSON.parse(JSON.stringify(this.get(key)));
  }

  /**
   * Subscribe to state changes.
   * @param {string} key
   * @param {Function} callback — (newValue, key) => void
   * @returns {Function} unsubscribe function
   */
  subscribe(key, callback) {
    if (!this._listeners.has(key)) {
      this._listeners.set(key, []);
    }
    this._listeners.get(key).push(callback);

    return () => {
      const arr = this._listeners.get(key);
      this._listeners.set(
        key,
        arr.filter((cb) => cb !== callback)
      );
    };
  }

  _notify(key) {
    if (this._listeners.has(key)) {
      const val = this.get(key);
      this._listeners.get(key).forEach((cb) => cb(val, key));
    }
  }
}

export const AdminState = new AdminStateManager();
