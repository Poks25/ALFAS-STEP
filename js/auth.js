// =============================================================
// js/auth.js — Autentikasi Pembeli via Backend API
// =============================================================

// Deklarasi aman: hanya set jika belum dideklarasikan oleh file lain (misal ui.js atau app.js)
if (typeof API_BASE === 'undefined') {
  window.API_BASE = 'http://localhost:3000';
}

const Auth = {
  // Ambil user yang sedang login dari sessionStorage
  getCurrentUser: function() {
    try {
      return JSON.parse(sessionStorage.getItem('alfas_user')) || null;
    } catch (e) { return null; }
  },

  // Ambil token JWT
  getToken: function() {
    return sessionStorage.getItem('alfas_token') || null;
  },

  // Cek apakah user sudah login
  isLoggedIn: function() {
    const user  = this.getCurrentUser();
    const token = this.getToken();
    return !!(user && token);
  },

  // Register via API backend
  register: async function(name, email, password) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, msg: data.error || 'Gagal mendaftar' };

      // Simpan token & user ke sessionStorage
      sessionStorage.setItem('alfas_token', data.token);
      sessionStorage.setItem('alfas_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      // Fallback ke localStorage jika backend tidak tersedia
      return Auth._localRegister(name, email, password);
    }
  },

  // Login via API backend
  login: async function(email, password) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return false;

      // Simpan token & user ke sessionStorage
      sessionStorage.setItem('alfas_token', data.token);
      sessionStorage.setItem('alfas_user', JSON.stringify(data.user));
      return true;
    } catch (err) {
      // Fallback ke localStorage jika backend tidak tersedia
      return Auth._localLogin(email, password);
    }
  },

  // Logout
  logout: function() {
    sessionStorage.removeItem('alfas_token');
    sessionStorage.removeItem('alfas_user');
    localStorage.removeItem('currentUser'); // bersihkan format lama
    window.location.href = 'index.html';
  },

  // Paksa login: redirect ke login.html jika belum login
  requireLogin: function(redirectBack) {
    if (!this.isLoggedIn()) {
      const returnUrl = redirectBack || window.location.href;
      window.location.href = `login.html?redirect=${encodeURIComponent(returnUrl)}`;
      return false;
    }
    return true;
  },

  // ============================================================
  // FALLBACK LOKAL (saat backend tidak bisa diakses)
  // ============================================================
  _localRegister: function(name, email, password) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) return { success: false, msg: 'Email sudah terdaftar!' };
    if (password.length < 6) return { success: false, msg: 'Password minimal 6 karakter!' };
    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    sessionStorage.setItem('alfas_user', JSON.stringify({ id: newUser.id, name, email }));
    sessionStorage.setItem('alfas_token', 'local_' + Date.now());
    return { success: true };
  },

  _localLogin: function(email, password) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      sessionStorage.setItem('alfas_user', JSON.stringify({ id: user.id, name: user.name, email: user.email }));
      sessionStorage.setItem('alfas_token', 'local_' + Date.now());
      return true;
    }
    return false;
  }
};