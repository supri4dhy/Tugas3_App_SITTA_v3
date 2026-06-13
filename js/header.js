class SittaHeader extends HTMLElement {
    connectedCallback() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'dashboard.html';
        
        this.innerHTML = `
        <nav>
            <div class="nav-brand">
                <a href="dashboard.html" class="brand-link">
                    <img src="assets/logo_ut.png" alt="Logo UT" class="ut-logo-small">
                    <span class="brand-text">SITTA UT</span>
                </a>
            </div>
            <div class="menu-toggle" id="mobile-menu">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
            <ul class="nav-links">
                <li class="${page === 'rekap.html' ? 'active' : ''}"><a href="rekap.html">Informasi Bahan Ajar</a></li>
                <li class="${page === 'tracking.html' ? 'active' : ''}"><a href="tracking.html">Tracking Pengiriman</a></li>
                <li class="${['stok.html', 'monitoring.html'].includes(page) ? 'active-primary admin-only' : 'admin-only'}">
                    <a href="#" class="dropdown-toggle">Laporan</a>
                    <div class="dropdown-menu">
                        <a href="stok.html" class="${page === 'stok.html' ? 'active' : ''}">Stok Bahan Ajar</a>
                        <a href="monitoring.html" class="${page === 'monitoring.html' ? 'active' : ''}">Monitoring Progress DO Bahan Ajar</a>
                    </div>
                </li>
                <li class="${page === 'histori.html' ? 'active admin-only' : 'admin-only'}"><a href="histori.html">Histori Transaksi Bahan Ajar</a></li>
                <li style="margin-left: auto;"><a href="#" id="logoutBtn">Keluar</a></li>
            </ul>
        </nav>
        `;
    }
}

customElements.define('sitta-header', SittaHeader);
