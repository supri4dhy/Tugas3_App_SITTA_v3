var app = new Vue({
    el: '#app',
    data: {
        // --- MASTER DATA FROM dataBahanAjar.js ---
        upbjjList: window.upbjjList || [],
        kategoriList: window.kategoriList || [],
        pengirimanList: window.pengirimanList || [],
        paket: window.paket || [],
        stok: window.dataStok || [],
        tracking: window.dataTracking || {},

        // --- STATE UNTUK STOK.HTML ---
        searchQuery: '',
        filterUpbjj: '',
        filterKategori: '',
        filterReorder: false,
        sortBy: '', // 'judul', 'qty', 'harga'
        
        // --- FORM DATA ---
        isEditing: false,
        formItem: {
            kode: '',
            judul: '',
            kategori: '',
            upbjj: '',
            lokasiRak: '',
            harga: 0,
            qty: 0,
            safety: 0,
            catatanHTML: '',
            cover: '' // Added cover field
        },
        showFormModal: false,
        formError: '',

        // --- RBAC (Role-Based Access Control) ---
        currentUser: null,
        isAdmin: false,

        // --- STATE UNTUK REKAP.HTML ---
        selectedBook: null
    },
    created() {
        const userData = localStorage.getItem('loggedInUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            // Cek role dari dataPengguna (misalnya Administrator)
            if (this.currentUser.role === 'Administrator') {
                this.isAdmin = true;
            }
        }
    },
    computed: {
        filteredAndSortedStok() {
            let result = this.stok;

            // Search
            if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                result = result.filter(item => 
                    item.judul.toLowerCase().includes(q) || 
                    item.kode.toLowerCase().includes(q)
                );
            }

            // Filter UT-Daerah
            if (this.filterUpbjj) {
                result = result.filter(item => item.upbjj === this.filterUpbjj);
            }

            // Filter Kategori (Dependent on UPBJJ)
            if (this.filterUpbjj && this.filterKategori) {
                result = result.filter(item => item.kategori === this.filterKategori);
            }

            // Filter Reorder (qty < safety)
            if (this.filterReorder) {
                result = result.filter(item => item.qty < item.safety);
            }

            // Sorting
            if (this.sortBy) {
                result = result.slice().sort((a, b) => {
                    if (this.sortBy === 'judul') {
                        return a.judul.localeCompare(b.judul);
                    } else if (this.sortBy === 'qty') {
                        return a.qty - b.qty;
                    } else if (this.sortBy === 'harga') {
                        return a.harga - b.harga;
                    }
                    return 0;
                });
            }

            return result;
        }
    },
    watch: {
        // Watcher 1: Jika filter UT-Daerah berubah atau direset, reset juga filter Kategori
        filterUpbjj(newVal) {
            if (!newVal) {
                this.filterKategori = '';
            }
        },
        // Watcher 2: Log ketika form error diset (bisa digunakan untuk analitik atau auto-hide error)
        formError(newVal) {
            if (newVal) {
                setTimeout(() => {
                    this.formError = '';
                }, 3000); // hilangkan error setelah 3 detik
            }
        }
    },
    methods: {
        resetFilter() {
            this.searchQuery = '';
            this.filterUpbjj = '';
            this.filterKategori = '';
            this.filterReorder = false;
            this.sortBy = '';
        },
        getStatus(item) {
            if (item.qty === 0) return 'Kosong';
            if (item.qty < item.safety) return 'Menipis';
            return 'Aman';
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.formItem.cover = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        },
        openAddForm() {
            this.isEditing = false;
            this.formItem = {
                kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: 0, qty: 0, safety: 0, catatanHTML: '', cover: ''
            };
            this.showFormModal = true;
        },
        openEditForm(item) {
            this.isEditing = true;
            this.formItem = Object.assign({}, item);
            this.showFormModal = true;
        },
        closeForm() {
            this.showFormModal = false;
        },
        showDetail(item) {
            this.selectedBook = item;
        },
        closeDetailModal() {
            this.selectedBook = null;
        },
        saveForm() {
            // Validasi Sederhana
            if (!this.formItem.kode || !this.formItem.judul || !this.formItem.kategori || !this.formItem.upbjj) {
                this.formError = "Kode, Judul, Kategori, dan UT-Daerah wajib diisi!";
                return;
            }

            if (this.isEditing) {
                const index = this.stok.findIndex(i => i.kode === this.formItem.kode);
                if (index !== -1) {
                    this.stok.splice(index, 1, this.formItem);
                }
            } else {
                const exists = this.stok.find(i => i.kode === this.formItem.kode);
                if (exists) {
                    this.formError = "Kode bahan ajar sudah ada!";
                    return;
                }
                this.stok.push(this.formItem);
            }
            
            // Simpan secara permanen ke LocalStorage
            localStorage.setItem('sitta_dataStok', JSON.stringify(this.stok));
            
            this.closeForm();
        }
    }
});
