// js/cart.js
const Cart = {
    get: () => JSON.parse(localStorage.getItem('cart')) || [],
    
    save: (data) => localStorage.setItem('cart', JSON.stringify(data)),

    add: function(product, qty = 1) {
        let items = this.get();
        let index = items.findIndex(i => i.id === product.id);
        if (index > -1) { items[index].qty += qty; } 
        else { items.push({ ...product, qty }); }
        this.save(items);
        this.updateCartCount();
        alert(`${product.name} ditambahkan ke keranjang!`);
    },

    updateCartCount: function() {
        const count = this.get().reduce((sum, item) => sum + item.qty, 0);
        const el = document.getElementById('cart-count');
        if (el) el.innerText = count;
    },

    checkout: function(shippingData) {
        const user = Auth.getCurrentUser();
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const newOrder = {
            id: 'TRX-' + Date.now(),
            date: new Date().toLocaleDateString(),
            user: user.name,
            items: this.get(),
            total: this.get().reduce((sum, i) => sum + (i.price * i.qty), 0),
            shipping: shippingData
        };
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.removeItem('cart'); // Kosongkan keranjang setelah beli
        return newOrder.id;
    }
};