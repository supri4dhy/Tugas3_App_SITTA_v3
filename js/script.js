/**
 * SITTA - Sistem Informasi Tugas Tata Administrasi
 * Shared Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('SITTA App Initialized');
    
    // Add common interactive elements if needed
    setupGlobalInteractions();
    setupMobileMenu();
});

function setupMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Optional: Animate hamburger bars
            menuToggle.classList.toggle('open');
        });
    }
}

function setupGlobalInteractions() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            showToast('Anda telah keluar sistem', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }

    // RBAC Nav Menu
    const loggedStr = localStorage.getItem('loggedInUser');
    if (loggedStr) {
        const user = JSON.parse(loggedStr);
        if (user.role !== 'Administrator') {
            const adminMenus = document.querySelectorAll('.admin-only');
            adminMenus.forEach(el => {
                el.style.display = 'none';
            });
        }
    }
}

function showToast(message, type = 'primary') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div style="flex: 1;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Utility to format currency or numbers if needed
 */
function formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
}
