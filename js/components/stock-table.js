Vue.component('ba-stock-table', {
    props: ['stok', 'upbjjList', 'kategoriList', 'isAdmin'],
    template: '#tpl-stock',
    data() {
        return {
            searchQuery: '',
            filterUpbjj: '',
            filterKategori: '',
            sortBy: '',
            filterReorder: false,
            
            showFormModal: false,
            isEditing: false,
            formError: '',
            formItem: this.getEmptyForm()
        };
    },
    computed: {
        filteredAndSortedStok() {
            let result = this.stok;

            if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                result = result.filter(item => 
                    item.judul.toLowerCase().includes(q) || 
                    item.kode.toLowerCase().includes(q)
                );
            }

            if (this.filterUpbjj) {
                result = result.filter(item => item.upbjj === this.filterUpbjj);
            }

            if (this.filterKategori) {
                result = result.filter(item => item.kategori === this.filterKategori);
            }

            if (this.filterReorder) {
                result = result.filter(item => item.qty < item.safety || item.qty === 0);
            }

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
        filterUpbjj() {
            this.filterKategori = '';
        }
    },
    methods: {
        resetFilter() {
            this.searchQuery = '';
            this.filterUpbjj = '';
            this.filterKategori = '';
            this.sortBy = '';
            this.filterReorder = false;
        },
        getEmptyForm() {
            return { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: 0, qty: 0, safety: 0, catatanHTML: '', cover: '' };
        },
        openAddForm() {
            this.isEditing = false;
            this.formItem = this.getEmptyForm();
            this.formError = '';
            this.showFormModal = true;
        },
        openEditForm(item) {
            this.isEditing = true;
            this.formItem = { ...item };
            this.formError = '';
            this.showFormModal = true;
        },
        closeForm() {
            this.showFormModal = false;
        },
        deleteStok(kode) {
            if (confirm("Apakah Anda yakin ingin menghapus data bahan ajar ini?")) {
                this.$emit('delete-stok', kode);
            }
        },
        saveForm() {
            this.formError = '';
            if (!this.formItem.kode || !this.formItem.judul || !this.formItem.kategori || !this.formItem.upbjj) {
                this.formError = 'Mohon lengkapi field yang wajib diisi (Kode, Judul, UT-Daerah, Kategori).';
                return;
            }
            if (this.isEditing) {
                this.$emit('update-stok', this.formItem);
            } else {
                this.$emit('add-stok', this.formItem);
            }
            this.closeForm();
        },
        handleKeydownEnter() {
             if(this.showFormModal) {
                 this.saveForm();
             }
        }
    },
    mounted() {
        const handler = (e) => {
            if (e.key === 'Enter' && this.showFormModal) {
                this.handleKeydownEnter();
            }
        };
        window.addEventListener('keydown', handler);
        this.$once('hook:beforeDestroy', () => {
            window.removeEventListener('keydown', handler);
        });
    },
    filters: {
        currency(value) {
            return 'Rp ' + Number(value).toLocaleString('id-ID');
        }
    }
});
