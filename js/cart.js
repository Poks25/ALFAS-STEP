// =============================================================
// js/cart.js — Manajemen Keranjang Belanja
// =============================================================

const Cart = {
  // Ambil data keranjang dari localStorage
  get: () => {
    try { return JSON.parse(localStorage.getItem('alfas_cart')) || []; }
    catch (e) { return []; }
  },

  // Simpan data keranjang ke localStorage
  save: (data) => localStorage.setItem('alfas_cart', JSON.stringify(data)),

  // Tambah produk ke keranjang (dengan auth gate)
  add: function(product, selectedSize, qty = 1) {
    // Cek login
    if (typeof Auth !== 'undefined' && !Auth.isLoggedIn()) {
      // Simpan URL produk untuk redirect setelah login
      const returnUrl = window.location.href;
      window.location.href = `login.html?redirect=${encodeURIComponent(returnUrl)}&msg=login_required`;
      return;
    }

    if (!selectedSize) {
      Cart._showToast('Pilih ukuran sepatu terlebih dahulu!', 'error');
      return;
    }

    let items = this.get();
    // Cari produk dengan ID dan ukuran yang sama
    const key = `${product.id}_${selectedSize}`;
    let index = items.findIndex(i => i._key === key);

    if (index > -1) {
      items[index].qty += qty;
    } else {
      items.push({
        ...product,
        image: product.image_url || product.image || product.gambar,
        gambar: product.gambar || product.image_url || product.image,
        image_url: product.image_url || product.image || product.gambar,
        selectedSize,
        qty,
        _key: key
      });
    }

    this.save(items);
    this.updateCartCount();
    Cart._showToast(`${product.name} (Ukuran ${selectedSize}) ditambahkan ke keranjang! 🛒`, 'success');
  },

  // Hapus produk dari keranjang
  remove: function(key) {
    let items = this.get().filter(i => i._key !== key);
    this.save(items);
    this.updateCartCount();
  },

  // Update jumlah item
  updateQty: function(key, delta) {
    let items = this.get();
    const index = items.findIndex(i => i._key === key);
    if (index !== -1) {
      items[index].qty += delta;
      if (items[index].qty < 1) items.splice(index, 1);
      this.save(items);
      this.updateCartCount();
    }
  },

  // Update angka badge keranjang di navbar
  updateCartCount: function() {
    const count = this.get().reduce((sum, item) => sum + item.qty, 0);
    const el = document.getElementById('cart-count');
    if (el) el.innerText = count;
  },

  // Hitung total harga
  getTotal: function() {
    return this.get().reduce((sum, item) => sum + (item.price * item.qty), 0);
  },

  // Kosongkan keranjang
  clear: function() {
    localStorage.removeItem('alfas_cart');
    this.updateCartCount();
  },

  // Toast notification
  _showToast: function(msg, type = 'success') {
    // Hapus toast lama jika ada
    const old = document.getElementById('cart-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = 'cart-toast';
    const bg = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    toast.className = `fixed bottom-6 right-6 ${bg} text-white px-6 py-4 rounded-2xl shadow-2xl z-[9999] font-semibold text-sm max-w-sm transform translate-y-20 opacity-0 transition-all duration-300`;
    toast.textContent = msg;
    document.body.appendChild(toast);

    // Animasi masuk
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-20', 'opacity-0');
      });
    });

    // Hilang setelah 3 detik
    setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};