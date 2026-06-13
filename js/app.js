document.addEventListener('DOMContentLoaded', async () => {
    // Fetch data using service
    const apiData = await ApiService.fetchData();

    new Vue({
        el: '#app',
        data() {
            return {
                isLoggedIn: false,
                user: null,
                currentTab: 'dashboard', // dashboard, stok, tracking, order
                
                // Data state
                upbjjList: [],
                kategoriList: [],
                pengirimanList: [],
                paketList: [],
                stokList: [],
                trackingData: [],
                
                showBiodataModal: false,
                isLoading: true
            };
        },
        computed: {
            isAdmin() {
                return this.user && this.user.role === 'Administrator';
            },
            greetingMessage() {
                const hour = new Date().getHours();
                if (hour >= 5 && hour < 11) return "Selamat pagi";
                else if (hour >= 11 && hour < 15) return "Selamat siang";
                else if (hour >= 15 && hour < 18) return "Selamat sore";
                return "Selamat malam";
            }
        },
        created() {
            this.checkLoginStatus();
            if (apiData) {
                this.upbjjList = apiData.upbjjList;
                this.kategoriList = apiData.kategoriList;
                this.pengirimanList = apiData.pengirimanList;
                this.paketList = apiData.paket;

                // Membaca data stok dari LocalStorage jika ada dan tidak kosong, fallback ke data API
                const savedStok = localStorage.getItem('sitta_dataStok');
                if (savedStok) {
                    try {
                        const parsedStok = JSON.parse(savedStok);
                        if (Array.isArray(parsedStok) && parsedStok.length > 0) {
                            this.stokList = parsedStok;
                        } else {
                            this.stokList = apiData.stok;
                        }
                    } catch (e) {
                        console.error("Gagal parsing data stok:", e);
                        this.stokList = apiData.stok;
                    }
                } else {
                    this.stokList = apiData.stok;
                }

                // Membaca data tracking dari LocalStorage jika ada dan tidak kosong, fallback ke data API
                const savedTracking = localStorage.getItem('sitta_dataTracking');
                if (savedTracking) {
                    try {
                        const parsed = JSON.parse(savedTracking);
                        let isValidArray = Array.isArray(parsed) && parsed.length > 0;
                        
                        // Validasi ekstra: pastikan item di dalamnya memiliki key DO dan nama penerima yang valid
                        if (isValidArray) {
                            const firstItem = parsed[0];
                            if (firstItem) {
                                const key = Object.keys(firstItem)[0];
                                if (!key || !firstItem[key] || !firstItem[key].nama) {
                                    isValidArray = false; // Data corrupt, paksa fallback
                                }
                            } else {
                                isValidArray = false;
                            }
                        }

                        if (isValidArray) {
                            this.trackingData = parsed;
                        } else if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0 && !Array.isArray(parsed)) {
                            // Konversi objek jika valid
                            const converted = Object.keys(parsed).map(key => ({
                                [key]: parsed[key]
                            }));
                            if (converted.length > 0 && Object.keys(converted[0])[0] && converted[0][Object.keys(converted[0])[0]].nama) {
                                this.trackingData = converted;
                            } else {
                                localStorage.removeItem('sitta_dataTracking');
                                this.trackingData = apiData.tracking;
                            }
                        } else {
                            localStorage.removeItem('sitta_dataTracking');
                            this.trackingData = apiData.tracking;
                        }
                    } catch (e) {
                        console.error("Gagal parsing data tracking:", e);
                        localStorage.removeItem('sitta_dataTracking');
                        this.trackingData = apiData.tracking;
                    }
                } else {
                    this.trackingData = apiData.tracking;
                }
            }
            this.isLoading = false;
        },
        methods: {
            checkLoginStatus() {
                const loggedIn = localStorage.getItem('loggedInUser');
                if (loggedIn) {
                    this.user = JSON.parse(loggedIn);
                    this.isLoggedIn = true;
                    this.currentTab = 'dashboard';
                }
            },
            onLoginSuccess(userData) {
                localStorage.setItem('loggedInUser', JSON.stringify(userData));
                this.user = userData;
                this.isLoggedIn = true;
                this.currentTab = 'dashboard';
            },
            logout() {
                localStorage.removeItem('loggedInUser');
                this.user = null;
                this.isLoggedIn = false;
            },
            
            // Event Handlers
            handleAddStok(item) {
                this.stokList.push({ ...item });
                localStorage.setItem('sitta_dataStok', JSON.stringify(this.stokList));
                alert("Data stok berhasil ditambahkan!");
            },
            handleUpdateStok(updatedItem) {
                const idx = this.stokList.findIndex(s => s.kode === updatedItem.kode);
                if (idx !== -1) {
                    this.$set(this.stokList, idx, updatedItem);
                    localStorage.setItem('sitta_dataStok', JSON.stringify(this.stokList));
                    alert("Data stok berhasil diperbarui!");
                }
            },
            handleDeleteStok(kode) {
                if (confirm("Apakah Anda yakin ingin menghapus data stok ini?")) {
                    this.stokList = this.stokList.filter(s => s.kode !== kode);
                    localStorage.setItem('sitta_dataStok', JSON.stringify(this.stokList));
                    alert("Data stok berhasil dihapus!");
                }
            },
            
            handleOrderSubmitted(orderData) {
                const newObj = {};
                newObj[orderData.noDO] = {
                    nim: orderData.nim,
                    nama: orderData.nama,
                    status: orderData.status,
                    ekspedisi: orderData.ekspedisi,
                    tanggalKirim: orderData.tanggalKirim,
                    paket: orderData.paket,
                    total: orderData.total,
                    perjalanan: orderData.perjalanan
                };
                // Re-assignment array memicu reaktivitas instan di Vue 2 tanpa perlu refresh
                this.trackingData = [newObj, ...this.trackingData];
                localStorage.setItem('sitta_dataTracking', JSON.stringify(this.trackingData));
                this.currentTab = 'tracking';
            },
            handleUpdateProgress(progressData) {
                 const doItem = this.trackingData.find(item => Object.keys(item)[0] === progressData.noDO);
                 if (doItem) {
                     const data = doItem[progressData.noDO];
                     data.status = progressData.status;
                     data.perjalanan.push({
                         waktu: progressData.waktu,
                         keterangan: progressData.keterangan
                     });
                     localStorage.setItem('sitta_dataTracking', JSON.stringify(this.trackingData));
                 }
            }
        }
    });
});
