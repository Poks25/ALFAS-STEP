/**
 * Alfas Step UI Management
 * Mengatur Dark Mode dan Navbar Otomatis di Semua Halaman
 */

// Mencegah error duplikasi jika API_BASE dideklarasikan di tempat lain
if (typeof API_BASE === 'undefined') {
    window.API_BASE = 'http://localhost:3000/api';
}

// 1. LOGIKA DARK MODE (CERAH & MALAM)
function initTheme() {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('darkMode');
    
    // Cek penyimpanan lokal atau preferensi sistem pengguna
    if (savedTheme === 'true' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
}

function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    
    // Simpan status ke LocalStorage agar konsisten saat pindah halaman
    localStorage.setItem('darkMode', isDark);
    
    // Update ikon secara real-time
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;

    if (isDark) {
        // Ikon Matahari (untuk kembali ke mode cerah)
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
        `;
    } else {
        // Ikon Bulan (untuk masuk ke mode malam)
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-700"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        `;
    }
}

// 2. RENDER NAVBAR OTOMATIS KE SEMUA HALAMAN
function renderNavbar() {
    const user = (typeof Auth !== 'undefined') ? Auth.getCurrentUser() : null;
    const nav = document.getElementById('navbar');
    if (!nav) return;

    nav.innerHTML = `
    <nav class="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            
            <a href="index.html" class="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">ALFAS STEP</a>
            
            <div class="flex items-center gap-6">
                <button onclick="toggleDarkMode()" id="theme-toggle-btn" class="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:scale-110 transition-all duration-300">
                    </button>

                <div class="hidden md:flex items-center gap-6 text-sm font-bold text-slate-500 dark:text-slate-400">
                    <a href="index.html" class="hover:text-indigo-600 transition">Beranda</a>
                    <a href="cart.html" class="relative hover:text-indigo-600 transition">
                        Keranjang
                        <span id="cart-count" class="absolute -top-2 -right-3 bg-indigo-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center border border-white dark:border-slate-900">0</span>
                    </a>
                </div>

                <div class="flex items-center gap-3 border-l pl-6 border-slate-100 dark:border-slate-800">
                    ${user ? `
                        <a href="order-history.html" class="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition">Riwayat</a>
                        <button onclick="Auth.logout()" class="px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-bold hover:bg-red-100 transition">Keluar</button>
                    ` : `
                        <a href="login.html" class="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-bold shadow-lg hover:opacity-90 transition">Masuk</a>
                    `}
                </div>
            </div>
        </div>
    </nav>`;

    // Update ikon tombol tema segera setelah navbar dirender
    const isDarkNow = document.documentElement.classList.contains('dark');
    updateThemeIcon(isDarkNow);
    
    // Update angka keranjang jika fungsi tersedia
    if (typeof Cart !== 'undefined' && Cart.updateCartCount) {
        Cart.updateCartCount();
    }
}

// Inisialisasi Tema dan Navbar saat dokumen siap
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderNavbar();
}); 