// js/auth.js
const Auth = {
    register: function(name, email, password) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(u => u.email === email)) return { success: false, msg: "Email sudah terdaftar!" };
        if (password.length < 6) return { success: false, msg: "Password minimal 6 karakter!" };

        const newUser = { id: Date.now(), name, email, password };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return { success: true };
    },

    login: function(email, password) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    },

    logout: function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    },

    getCurrentUser: () => JSON.parse(localStorage.getItem('currentUser'))
};