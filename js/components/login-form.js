Vue.component('login-form', {
    template: '#tpl-login',
    data() {
        return {
            email: '',
            password: '',
            errorMsg: ''
        };
    },
    methods: {
        handleLogin() {
            // Gunakan dataPengguna dari script lokal js/data.js
            if (typeof dataPengguna !== 'undefined') {
                const user = dataPengguna.find(u => u.email === this.email && u.password === this.password);
                if (user) {
                    this.$emit('login-success', user);
                } else {
                    this.errorMsg = 'Email atau password yang Anda masukkan salah.';
                }
            } else {
                this.errorMsg = 'Sistem tidak dapat mengakses data pengguna.';
            }
        }
    }
});
