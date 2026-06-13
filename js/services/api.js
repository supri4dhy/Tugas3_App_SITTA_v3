const ApiService = {
    // Fetch data from local JSON
    async fetchData() {
        try {
            const response = await fetch('data/dataBahanAjar.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch data:', error);
            // Fallback to local script variable if fetch fails (e.g. CORS issue on local file://)
            if (typeof dataBahanAjar !== 'undefined' && typeof dataTracking !== 'undefined') {
                console.warn('Menggunakan fallback data dari file script karena fetch gagal.');
                return {
                    upbjjList: typeof upbjjList !== 'undefined' ? upbjjList : [],
                    kategoriList: typeof kategoriList !== 'undefined' ? kategoriList : [],
                    pengirimanList: typeof pengirimanList !== 'undefined' ? pengirimanList : [],
                    paket: typeof paket !== 'undefined' ? paket : [],
                    stok: dataBahanAjar,
                    tracking: dataTracking
                };
            }
            return null;
        }
    }
};
