// =============================================================
// js/ui.js — Dark Mode + Navbar untuk Semua Halaman
// =============================================================

// Deklarasi aman: hanya set jika belum dideklarasikan oleh file lain (misal app.js)
if (typeof API_BASE === 'undefined') {
  window.API_BASE = 'http://localhost:3000';
}

// ============================================================
// 1. DARK MODE (pakai class Tailwind + localStorage)
// ============================================================
function initTheme() {
  const html = document.documentElement;
  const saved = localStorage.getItem('darkMode');
  if (saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}

function toggleDarkMode() {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark);
  updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  if (isDark) {
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  } else {
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-700"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
  }
}

// ============================================================
// 2. NAVBAR DINAMIS (tampil info user & cart count)
// ============================================================
function renderNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const user = (typeof Auth !== 'undefined') ? Auth.getCurrentUser() : null;
  const isDark = document.documentElement.classList.contains('dark');

  nav.innerHTML = `
  <nav class="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
      
      <a href="index.html" class="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">ALFAS STEP</a>
      
      <div class="flex items-center gap-4 md:gap-6">
        <!-- Dark Mode Toggle -->
        <button onclick="toggleDarkMode()" id="theme-toggle-btn"
          class="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:scale-110 transition-all duration-300"
          aria-label="Toggle dark mode">
        </button>

        <!-- Nav Links (Desktop) -->
        <div class="hidden md:flex items-center gap-6 text-sm font-bold text-slate-500 dark:text-slate-400">
          <a href="index.html" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Beranda</a>
          <a href="cart.html" class="relative hover:text-indigo-600 dark:hover:text-indigo-400 transition" id="cart-link">
            Keranjang
            <span id="cart-count" class="absolute -top-2 -right-4 bg-indigo-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-black">0</span>
          </a>
        </div>

        <!-- Auth Section -->
        <div class="flex items-center gap-3 border-l pl-4 md:pl-6 border-slate-100 dark:border-slate-800">
          ${user ? `
            <span class="hidden md:block text-xs font-bold text-slate-500 dark:text-slate-400">Halo, ${user.name.split(' ')[0]}!</span>
            <a href="order-history.html" class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition hidden md:inline">Riwayat</a>
            <button onclick="Auth.logout()" class="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/50 transition">Keluar</button>
          ` : `
            <a href="login.html" class="px-5 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-full text-xs font-bold shadow-lg hover:opacity-90 transition">Masuk</a>
          `}
        </div>
      </div>
    </div>
  </nav>`;

  // Update icon setelah navbar dirender
  updateThemeIcon(isDark);

  // Update cart count
  if (typeof Cart !== 'undefined' && Cart.updateCartCount) {
    Cart.updateCartCount();
  }
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderNavbar();
});