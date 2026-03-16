/**
 * Auth Utility — Token management, headers, and route guard.
 */
export const auth = {
  getToken() {
    return localStorage.getItem('admin_token');
  },

  getUsername() {
    return localStorage.getItem('admin_username') || 'admin';
  },

  /** Returns headers object with JWT and Content-Type. */
  headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    };
  },

  /** Redirects to login if no token is found. Returns false if unauthenticated. */
  guard() {
    if (!this.getToken()) {
      window.location.href = '/admin/login.html';
      return false;
    }
    return true;
  },

  /** Stores login credentials after a successful login. */
  setCredentials(token, username) {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_username', username);
  },

  /** Clears auth data and redirects to login. */
  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    window.location.href = '/admin/login.html';
  }
};
