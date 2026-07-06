// js/app.js

// 1. Amankan deklarasi API_BASE agar tidak bentrok dengan file lain
if (typeof API_BASE === 'undefined') {
    window.API_BASE = 'http://localhost:3000/api';
}

let allProducts = []; // Tempat menyimpan data asli dari Database MySQL
let activeCategory = 'Semua';

// 2. Fungsi mengambil data langsung dari API Backend (MySQL)
async function loadProducts() {
    const grid = document.getElementById('product-grid');
    try {
        // Mengambil data dari server backend lokal port 3000
        const response = await fetch(`${window.API_BASE}/products`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allProducts = await response.json();
        renderProducts(allProducts); // Tampilkan semua saat pertama kali buka
    } catch (error) {
        console.error("Gagal load data dari database:", error);
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <p class="text-red-500 font-bold">Gagal memuat data produk dari database!</p>
                <p class="text-sm text-gray-500">Pastikan server backend di VS Code sudah berjalan (npm start) dan XAMPP MySQL aktif.</p>
            </div>`;
    }
}

// 3. Fungsi Utama untuk menampilkan produk ke layar
function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <p class="text-gray-400 animate-pulse">Produk tidak ditemukan...</p>
            </div>`;
        return;
    }

    grid.innerHTML = products.map(p => `
        <div class="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-800 group">
            <div class="relative overflow-hidden aspect-square">
                <img 
                    src="${p.image}" 
                    alt="${p.name}" 
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onerror="this.src='https://via.placeholder.com/600x600?text=Sepatu+Alfas+Step'"
                >
                <div class="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm text-slate-900 dark:text-white">
                    ${p.category}
                </div>
            </div>
            <div class="p-5">
                <div class="flex justify-between items-start mb-1">
                    <h3 class="font-bold text-gray-800 dark:text-white truncate flex-1">${p.name}</h3>
                    <span class="text-yellow-500 text-xs flex items-center shrink-0 ml-2">
                        ⭐ ${p.rating || '4.5'}
                    </span>
                </div>
                <p class="text-indigo-600 dark:text-indigo-400 font-bold text-lg mb-4">
                    Rp ${Number(p.price).toLocaleString('id-ID')}
                </p>
                <a href="product-detail.html?id=${p.id}" class="block text-center w-full bg-slate-900 dark:bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-indigo-700 transition shadow-md">
                    Beli Sekarang
                </a>
            </div>
        </div>
    `).join('');
}

// 4. Fungsi Filter & Pencarian
function applyFilters() {
    const searchInput = document.getElementById('search-input')?.value.toLowerCase() || '';
    const sortSelect = document.getElementById('sort-select');
    const sortValue = sortSelect ? sortSelect.value : 'terbaru';

    let filtered = allProducts.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchInput) || 
                            p.category.toLowerCase().includes(searchInput);
        const matchCategory = activeCategory === 'Semua' || p.category === activeCategory;
        return matchSearch && matchCategory;
    });

    // Logika Pengurutan (Sort)
    if (sortValue === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    }

    renderProducts(filtered);
}

// 5. Fungsi Klik Kategori
function filterCategory(cat) {
    activeCategory = cat;
    
    // Update tampilan tombol kategori agar yang aktif terlihat berbeda
    document.querySelectorAll('.cat-btn').forEach(btn => {
        // Menggunakan trim() atau match untuk kecocokan teks tombol
        if (btn.innerText.trim() === cat) {
            btn.classList.add('bg-slate-900', 'text-white');
            btn.classList.remove('bg-white', 'text-gray-600');
        } else {
            btn.classList.remove('bg-slate-900', 'text-white');
            btn.classList.add('bg-white', 'text-gray-600');
        }
    });

    applyFilters();
}

// 6. Fungsi Sort
function sortProducts() {
    applyFilters();
}

// Jalankan load data saat halaman siap
document.addEventListener('DOMContentLoaded', loadProducts);