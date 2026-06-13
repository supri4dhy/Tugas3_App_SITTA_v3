Vue.component('order-form', {
    props: ['pengirimanList', 'paketList', 'upbjjList'],
    template: '#tpl-order-form',
    data() {
        return {
            form: {
                noDO: this.generateDO(),
                tanggalKirim: '',
                nim: '',
                nama: '',
                ekspedisi: '',
                paketKode: ''
            },
            errorMsg: ''
        };
    },
    computed: {
        selectedPaket() {
            if (!this.form.paketKode || !this.paketList) return null;
            return this.paketList.find(p => p.kode === this.form.paketKode);
        },
        calculatedTotal() {
            return this.selectedPaket ? this.selectedPaket.harga : 0;
        }
    },
    watch: {
        'form.nim'(newVal) {
            // Watcher 1: Memastikan input NIM hanya berupa angka (real-time sanitization)
            if (newVal) {
                this.form.nim = newVal.replace(/\D/g, '');
            }
        },
        'form.paketKode'(newVal) {
            // Watcher 2: Menampilkan log perubahan paket di konsol saat paket diubah
            if (newVal) {
                console.log(`Paket terpilih diubah ke kode: ${newVal}`);
            }
        }
    },
    methods: {
        generateDO() {
            const year = new Date().getFullYear();
            const seq = Math.floor(Math.random() * 900) + 100;
            return `DO${year}-0${seq}`;
        },
        handleSubmit() {
            this.errorMsg = '';
            if (!this.form.tanggalKirim || !this.form.nim || !this.form.nama || !this.form.ekspedisi || !this.form.paketKode) {
                this.errorMsg = 'Semua field harus diisi!';
                return;
            }
            
            // Format date for output
            const d = new Date(this.form.tanggalKirim);
            const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
            const formattedDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

            const orderData = {
                noDO: this.form.noDO,
                nim: this.form.nim,
                nama: this.form.nama,
                ekspedisi: this.form.ekspedisi,
                tanggalKirim: formattedDate,
                paket: this.form.paketKode,
                status: 'Menunggu Pengiriman',
                total: this.calculatedTotal,
                perjalanan: [
                    {
                        waktu: new Date().toLocaleString('id-ID'),
                        keterangan: 'Pesanan DO Baru Dibuat'
                    }
                ]
            };
            this.$emit('order-submitted', orderData);
            
            // Reset Form
            this.form = {
                noDO: this.generateDO(),
                tanggalKirim: '',
                nim: '',
                nama: '',
                ekspedisi: '',
                paketKode: ''
            };
            alert('Delivery Order Berhasil Dibuat!');
        }
    },
    filters: {
        currency(value) {
            return 'Rp ' + Number(value).toLocaleString('id-ID');
        }
    }
});
