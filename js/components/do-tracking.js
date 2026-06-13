Vue.component('do-tracking', {
    props: ['trackingData', 'isAdmin', 'user', 'pengirimanList', 'activeTab'],
    template: '#tpl-tracking',
    data() {
        return {
            searchDO: '',
            searchResult: null,
            showError: false,
            updateKeterangan: ''
        };
    },
    watch: {
        activeTab(newVal) {
            if (newVal === 'tracking') {
                this.clearSearch();
            }
        }
    },
    computed: {
        myTrackingList() {
            const list = [];
            if (!this.trackingData || !Array.isArray(this.trackingData)) return list;
            this.trackingData.forEach(item => {
                if (!item) return;
                const doNum = Object.keys(item)[0];
                if (!doNum) return;
                const data = item[doNum];
                if (!data) return;
                
                // Admin dapat melihat semua DO, user non-admin hanya melihat DO milik mereka (berdasarkan nama atau NIM)
                const isUserAdmin = this.isAdmin || (this.user && this.user.role === 'Administrator');
                if (isUserAdmin || (this.user && (data.nama === this.user.nama || data.nim === this.user.nim))) {
                    list.push({ noDO: doNum, ...data });
                }
            });
            return list;
        }
    },
    methods: {
        doSearch() {
            this.showError = false;
            this.searchResult = null;
            if (!this.searchDO) return;

            const found = this.myTrackingList.find(d => d.noDO === this.searchDO || d.nim === this.searchDO);
            if (found) {
                this.searchResult = found;
                this.searchDO = found.noDO;
            } else {
                this.showError = true;
            }
        },
        viewDO(noDO) {
            this.searchDO = noDO;
            this.doSearch();
        },
        clearSearch() {
            this.searchDO = '';
            this.searchResult = null;
            if (this.searchResult) {
                this.searchResult = null;
            }
            this.showError = false;
        },
        handleKeyDown(e) {
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        },
        getDetailObject(item) {
            if (!item) return {};
            const totalVal = item.total ? 'Rp ' + Number(item.total).toLocaleString('id-ID') : 'Rp 0';
            return {
                "Nomor DO": item.noDO,
                "Paket": item.paket,
                "Tanggal Kirim": item.tanggalKirim,
                "Total Transaksi": totalVal
            };
        },
        submitUpdate() {
            if (!this.updateKeterangan) return;
            const updateItem = {
                noDO: this.searchResult.noDO,
                waktu: new Date().toLocaleString('id-ID'),
                keterangan: this.updateKeterangan
            };
            this.$emit('update-progress', updateItem);
            this.updateKeterangan = '';
            alert('Progress pengiriman berhasil diupdate!');
        }
    },
    mounted() {
        window.addEventListener('keydown', this.handleKeyDown);
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
    },
    filters: {
        currency(value) {
            return 'Rp ' + Number(value).toLocaleString('id-ID');
        }
    }
});
