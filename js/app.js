// =============================================================
// js/app.js — Fetch Produk dari Backend API
// =============================================================

// Deklarasi aman: hanya set jika belum dideklarasikan oleh file lain (misal ui.js)
if (typeof API_BASE === 'undefined') {
  window.API_BASE = 'https://danialfautsweb02-production.up.railway.app';
}

let allProducts    = [];
let activeCategory = 'Semua';

// ============================================================
// 1. Load Produk dari Backend API
// ============================================================
async function loadProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  grid.innerHTML = `<div class="col-span-full text-center py-20">
    <div class="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p class="text-slate-400 text-sm">Memuat koleksi terbaik...</p>
  </div>`;

  try {
    const res = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) throw new Error('API error');
    allProducts = await res.json();
    // Normalisasi field: backend pakai 'image_url', frontend pakai 'image'
    allProducts = allProducts.map(p => ({ ...p, image: p.image_url || p.image }));
    renderProducts(allProducts);
  } catch (error) {
    console.error('Gagal memuat data produk dari backend:', error);
    grid.innerHTML = `<div class="col-span-full text-center py-20">
      <p class="text-red-500 font-bold text-lg">Gagal memuat produk dari database!</p>
      <p class="text-slate-400 text-sm mt-2">Gagal terhubung ke server. Coba refresh halaman beberapa saat lagi.</p>
    </div>`;
  }
}

// ============================================================
// 2. Render Produk ke Grid
// ============================================================
function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-20">
      <p class="text-slate-400 text-2xl mb-2">🔍</p>
      <p class="text-slate-400 font-bold">Produk tidak ditemukan...</p>
    </div>`;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 group flex flex-col">
      <div class="relative overflow-hidden aspect-square">
        <img
          src="${p.image || p.image_url}"
          alt="${p.name}"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onerror="this.src='https://via.placeholder.com/600x600?text=Alfas+Step'"
        >
        <div class="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm text-slate-900 dark:text-white uppercase tracking-wide">
          ${p.category}
        </div>
        <div class="absolute top-3 left-3 bg-indigo-600/90 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wide">
          ${p.stock > 0 ? 'Tersedia' : 'Habis'}
        </div>
      </div>
      <div class="p-5 flex flex-col flex-1">
        <div class="flex justify-between items-start mb-1 flex-1">
          <h3 class="font-bold text-gray-800 dark:text-white leading-snug flex-1 pr-2 text-sm">${p.name}</h3>
          <span class="text-yellow-500 text-xs flex items-center shrink-0">⭐ ${p.rating || '4.5'}</span>
        </div>
        <p class="text-indigo-600 dark:text-indigo-400 font-black text-xl mb-4">
          Rp ${Number(p.price).toLocaleString('id-ID')}
        </p>
        <a href="product-detail.html?id=${p.id}" 
           class="block text-center w-full bg-slate-900 dark:bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-all duration-200 shadow-md text-sm">
          Lihat Detail
        </a>
      </div>
    </div>
  `).join('');
}

// ============================================================
// 3. Filter & Pencarian
// ============================================================
function applyFilters() {
  const searchEl = document.getElementById('search-input');
  const sortEl   = document.getElementById('sort-select');
  if (!searchEl || !sortEl) return;

  const searchInput = searchEl.value.toLowerCase();
  const sortValue   = sortEl.value;

  let filtered = allProducts.filter(p => {
    const matchSearch   = p.name.toLowerCase().includes(searchInput) ||
                          (p.description || '').toLowerCase().includes(searchInput) ||
                          p.category.toLowerCase().includes(searchInput);
    const matchCategory = activeCategory === 'Semua' || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  if (sortValue === 'price-asc')       filtered.sort((a, b) => a.price - b.price);
  else if (sortValue === 'price-desc') filtered.sort((a, b) => b.price - a.price);

  renderProducts(filtered);
}

// ============================================================
// 4. Klik Tombol Kategori
// ============================================================
function filterCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(btn => {
    const isActive = btn.innerText.trim() === cat;
    btn.classList.toggle('bg-slate-900',  isActive);
    btn.classList.toggle('text-white',    isActive);
    btn.classList.toggle('border-transparent', isActive);
    btn.classList.toggle('bg-white',      !isActive);
    btn.classList.toggle('text-gray-600', !isActive);
    btn.classList.toggle('dark:bg-gray-800', !isActive);
    btn.classList.toggle('dark:text-gray-300', !isActive);
  });
  applyFilters();
}

function sortProducts() { applyFilters(); }

// Jalankan saat halaman siap
document.addEventListener('DOMContentLoaded', loadProducts);