var app = new Vue({
    el: '#app',
    data: {
        // Data Master
        pengirimanList: window.pengirimanList || [],
        paket: window.paket || [],
        tracking: window.dataTracking || {},
        dataPengguna: window.dataPengguna || [],

        // State Modal Detail
        showDetailModal: false,
        selectedDO: null,
        selectedTrack: null,

        // State Modal Form Tambah
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

        // RBAC
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
        } else {
            window.location.href = 'index.html';
        }
    },
    computed: {
        monitoringList() {
            return Object.keys(this.tracking).map(doNum => {
                const track = this.tracking[doNum];
                const user = this.dataPengguna.find(u => u.nama === track.nama);
                const tujuan = user ? user.lokasi : "Lokasi Tidak Diketahui";
                return {
                    noDO: doNum,
                    ...track,
                    tujuan: tujuan
                };
            });
        },
        selectedPaket() {
            if (!this.formItem.paketKode) return null;
            return this.paket.find(p => p.kode === this.formItem.paketKode);
        },
        calculatedTotal() {
            if (!this.selectedPaket) return 0;
            return this.selectedPaket.harga;
        }
    },
    methods: {
        showDetail(item) {
            this.selectedDO = item.noDO;
            this.selectedTrack = item;
            this.showDetailModal = true;
        },
        closeDetail() {
            this.showDetailModal = false;
            this.selectedDO = null;
            this.selectedTrack = null;
        },
        openAddForm() {
            const year = new Date().getFullYear();
            const existingDOs = Object.keys(this.tracking).filter(key => key.startsWith('DO' + year));
            let nextSeq = existingDOs.length + 1;
            const nextSeqStr = nextSeq.toString().padStart(4, '0');
            
            this.formItem = {
                noDO: `DO${year}-${nextSeqStr}`,
                nim: '',
                nama: '',
                ekspedisi: '',
                paketKode: '',
                tanggalKirim: new Date().toISOString().split('T')[0]
            };
            this.formError = '';
            this.showFormModal = true;
        },
        closeForm() {
            this.showFormModal = false;
        },
        saveForm() {
            if(!this.formItem.nim || !this.formItem.nama || !this.formItem.ekspedisi || !this.formItem.paketKode) {
                this.formError = "Semua field wajib diisi!";
                return;
            }
            const newData = {
                nim: this.formItem.nim,
                nama: this.formItem.nama,
                status: "Diproses",
                ekspedisi: this.formItem.ekspedisi,
                tanggalKirim: this.formItem.tanggalKirim,
                paket: this.formItem.paketKode,
                total: this.calculatedTotal,
                perjalanan: [
                    { waktu: new Date().toISOString().replace('T', ' ').substring(0, 19), keterangan: "DO Baru dibuat dan diproses" }
                ]
            };
            
            // Simpan ke data master tracking (di Vue, reaktivitas harus dipastikan menggunakan $set)
            this.$set(this.tracking, this.formItem.noDO, newData);
            
            this.showFormModal = false;
            alert("DO Baru berhasil dibuat: " + this.formItem.noDO);
        },
        getStatusBadge(status) {
            if (status === 'Diterima' || status === 'Selesai' || status === 'Dikirim') {
                return 'badge-success';
            }
            return 'badge-warning';
        }
    }
});
