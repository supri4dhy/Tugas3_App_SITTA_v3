var app = new Vue({
    el: '#app',
    data: {
        // --- MASTER DATA FROM dataBahanAjar.js ---
        upbjjList: window.upbjjList || [],
        kategoriList: window.kategoriList || [],
        pengirimanList: window.pengirimanList || [],
        paket: window.paket || [],
        stok: window.dataStok || [],
        // Membaca data tunggal dari window.dataTracking (js/dataBahanAjar.js)
        tracking: window.dataTracking || {},

        // --- STATE UNTUK TRACKING.HTML ---
        searchDO: '',
        searchResult: null,
        showError: false,

        // Data Form DO Baru
        showFormModal: false,
        formItem: {
            noDO: '',
            nim: '',
            nama: '',
            ekspedisi: '',
            paketKode: '',
            tanggalKirim: ''
        },
        formError: '',

        // --- RBAC (Role-Based Access Control) ---
        currentUser: null,
        isAdmin: false
    },
    created() {
        const userData = localStorage.getItem('loggedInUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            if (this.currentUser.role === 'Administrator') {
                this.isAdmin = true;
            }
        }
    },
    mounted() {
        const autoDO = sessionStorage.getItem('autoOpenDO');
        if (autoDO) {
            this.searchDO = autoDO;
            this.doSearch();
            sessionStorage.removeItem('autoOpenDO'); // Bersihkan setelah dipakai
        }
    },
    computed: {
        selectedPaket() {
            if (!this.formItem.paketKode) return null;
            return this.paket.find(p => p.kode === this.formItem.paketKode);
        },
        calculatedTotal() {
            if (!this.selectedPaket) return 0;
            return this.selectedPaket.harga;
        },
        // Mendapatkan daftar DO milik user yang sedang login
        myTrackingList() {
            if (this.isAdmin) {
                // Admin bisa melihat semua, tapi untuk list singkat bisa dikembalikan semua array object DO
                return Object.entries(this.tracking).map(([noDO, data]) => ({ noDO, ...data }));
            } else if (this.currentUser) {
                // User hanya melihat DO milik namanya
                return Object.entries(this.tracking)
                    .filter(([noDO, data]) => data.nama === this.currentUser.nama)
                    .map(([noDO, data]) => ({ noDO, ...data }));
            }
            return [];
        }
    },
    watch: {
        // Watcher 1: Memantau perubahan input pencarian
        searchDO(newVal) {
            if (newVal === '') {
                this.searchResult = null;
                this.showError = false;
            }
        },
        // Watcher 2: Memantau kode paket untuk mengupdate harga (sebenarnya di-handle oleh computed jg)
        'formItem.paketKode': function(newVal) {
            // Logika lain jika dibutuhkan saat paket berubah
        }
    },
    methods: {
        doSearch() {
            if (!this.searchDO) return;
            const res = this.tracking[this.searchDO.trim().toUpperCase()]; // Peka huruf besar (DO...)
            
            if (res) {
                // Validasi otorisasi: User biasa hanya boleh mencari DO miliknya
                if (!this.isAdmin && res.nama !== this.currentUser.nama) {
                    this.searchResult = null;
                    this.showError = true; // Munculkan not found untuk menyembunyikan data orang lain
                    return;
                }
                this.searchResult = res;
                this.showError = false;
            } else {
                this.searchResult = null;
                this.showError = true;
            }
        },
        viewDO(noDO) {
            this.searchDO = noDO;
            this.doSearch();
        },
        openAddForm() {
            // Generate DO Number automatically
            const year = new Date().getFullYear();
            const existingDOs = Object.keys(this.tracking).filter(key => key.startsWith('DO' + year));
            let nextSeq = existingDOs.length + 1;
            let noDO = 'DO' + year + '-' + String(nextSeq).padStart(4, '0');
            
            // Format tanggal hari ini
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');

            this.formItem = {
                noDO: noDO,
                nim: '',
                nama: '',
                ekspedisi: '',
                paketKode: '',
                tanggalKirim: `${yyyy}-${mm}-${dd}`
            };
            this.formError = '';
            this.showFormModal = true;
        },
        closeForm() {
            this.showFormModal = false;
        },
        saveForm() {
            if (!this.formItem.nim || !this.formItem.nama || !this.formItem.ekspedisi || !this.formItem.paketKode) {
                this.formError = 'Mohon lengkapi semua data!';
                return;
            }

            // Simpan ke object tracking
            // Vue 2 Reactivity untuk object property baru perlu menggunakan Vue.set
            const newData = {
                nim: this.formItem.nim,
                nama: this.formItem.nama,
                status: "Diproses",
                ekspedisi: this.formItem.ekspedisi,
                tanggalKirim: this.formItem.tanggalKirim,
                paket: this.formItem.paketKode,
                total: this.calculatedTotal,
                perjalanan: [
                    { waktu: new Date().toLocaleString('id-ID'), keterangan: "DO berhasil dibuat dan sedang disiapkan." }
                ]
            };

            this.$set(this.tracking, this.formItem.noDO, newData);
            
            // Simpan secara permanen ke LocalStorage
            localStorage.setItem('sitta_dataTracking', JSON.stringify(this.tracking));
            
            // Tutup form dan langsung lacak nomor DO baru
            this.closeForm();
            this.searchDO = this.formItem.noDO;
            this.doSearch();
        }
    }
});
