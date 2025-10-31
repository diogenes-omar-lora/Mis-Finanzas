import { DataManager } from './DataManager.js';
import { setupForms, setDefaultDates } from '../ui/DOMController.js'; // ✅ SOLO estas importaciones
import { applyTheme } from '../ui/ThemeManager.js';
import { initializeAccountsModule } from '../modules/Accounts.js';
import { initializeTransactionsModule } from '../modules/Transactions.js';
import { initializeTransfersModule } from '../modules/Transfers.js';
import { initializeUsersModule } from '../modules/Users.js';
import { initializeReportsModule } from '../modules/Reports.js';

export default class FinanceApp {
    constructor() {
        console.log('🔄 Constructor de FinanceApp llamado');
        
        this.dataManager = new DataManager();
        this.accounts = this.dataManager.getAccounts();
        this.transactions = this.dataManager.getTransactions();
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.isMobileMenuOpen = false;
        
        this.financeChart = null;
        this.expensesChart = null;
        this.incomeExpenseChart = null;
        
        // ✅ ASIGNAR MÉTODOS DIRECTAMENTE
        this.setDefaultDates = setDefaultDates;
        this.applyTheme = applyTheme;
        
        this.initializeApp();
    }

    initializeApp() {
        try {
            console.log('🔄 Inicializando aplicación...');
            
            // ✅ 1. CONFIGURAR DOM PRIMERO
            this.setupDOMElements();
            
            // ✅ 2. CONFIGURAR EVENT LISTENERS DIRECTAMENTE
            this.setupEventListeners();
            
            // ✅ 3. CONFIGURAR FORMULARIOS
            setupForms.call(this);
            
            // ✅ 4. INICIALIZAR MÓDULOS
            initializeAccountsModule.call(this);
            initializeTransactionsModule.call(this);
            initializeTransfersModule.call(this);
            initializeUsersModule.call(this);
            initializeReportsModule.call(this);
            
            // ✅ 5. CONFIGURACIÓN ADICIONAL
            this.initMonthSelector();
            this.applyTheme(this.currentTheme);
            
            // ✅ 6. MOSTRAR APLICACIÓN
            this.appScreen.classList.remove('hidden');
            
            console.log('✅ Aplicación inicializada correctamente');

        } catch (error) {
            console.error('Error in initializeApp:', error);
            throw error;
        }
    }

    setupDOMElements() {
        console.log('🔧 Configurando elementos DOM...');
        
        this.appScreen = document.getElementById('app-screen');
        this.logoutBtn = document.getElementById('logout-btn');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('.section');
        this.sectionTitle = document.getElementById('section-title');
        
        console.log(`📊 Enlaces de navegación encontrados: ${this.navLinks.length}`);
        
        this.setupSidebarUser();
        this.checkAdminAccess();
    }

    setupEventListeners() {
        console.log('🎯 Configurando event listeners directamente...');
        
        // ✅ NAVEGACIÓN - CONFIGURAR DIRECTAMENTE
        if (this.navLinks && this.navLinks.length) {
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => this.handleNavigation(e));
            });
        }

        // ✅ BOTÓN DE TEMA
        const themeToggleBtn = document.getElementById('theme-toggle');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // ✅ BOTÓN DE MENÚ MÓVIL
        const menuToggleBtn = document.getElementById('menu-toggle');
        if (menuToggleBtn) {
            menuToggleBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        // ✅ BOTÓN CERRAR SIDEBAR
        const closeSidebarBtn = document.getElementById('close-sidebar');
        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => this.closeMobileMenu());
        }

        // ✅ OVERLAY
        const menuOverlay = document.querySelector('.menu-overlay');
        if (menuOverlay) {
            menuOverlay.addEventListener('click', () => this.closeMobileMenu());
        }

        // ✅ LOGOUT
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // ✅ FILTROS Y EXPORTACIÓN
        const applyFiltersBtn = document.getElementById('apply-filters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }

        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        }

        const exportBtn = document.getElementById('export-csv-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToCSV());
        }

        // ✅ RESIZE
        window.addEventListener('resize', () => this.handleResize());

        console.log('✅ Event listeners configurados directamente');
    }

    // ✅ MÉTODO DE NAVEGACIÓN DIRECTAMENTE EN LA CLASE
    handleNavigation(e) {
        e.preventDefault();
        console.log('🔄 Manejando navegación...');

        const link = e.currentTarget || e.target.closest('.nav-link');
        if (!link) {
            console.error('❌ No se pudo encontrar el enlace clickeado');
            return;
        }

        const sectionId = link.getAttribute('data-section');
        console.log(`🔗 Navegando a: ${sectionId}`);

        if (sectionId === 'logout') {
            this.handleLogout();
            return;
        }

        // Actualizar navegación activa
        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Mostrar sección
        this.sections.forEach(section => {
            section.classList.add('hidden');
            if (section.id === `${sectionId}-section`) {
                section.classList.remove('hidden');
                const titleText = link.textContent.trim();
                if (this.sectionTitle) {
                    this.sectionTitle.textContent = titleText;
                }
                console.log(`✅ Sección ${sectionId} mostrada`);
            }
        });

        // Actualizar controles de UI
        if (window.innerWidth > 767) {
            this.toggleMonthSelector(sectionId);
            this.toggleExportButton(sectionId);
            this.closeMobileMenu();
        }

        // Actualizar contenido de la sección
        this.updateSectionContent(sectionId);
    }

    toggleMonthSelector(sectionId) {
        const monthSelector = document.querySelector('.month-selector');
        if (monthSelector) {
            monthSelector.style.display = (sectionId === 'dashboard' || sectionId === 'reports') ? 'inline-flex' : 'none';
        }
    }

    toggleExportButton(sectionId) {
        const exportBtn = document.getElementById('export-csv-btn');
        if (exportBtn) {
            exportBtn.style.display = sectionId === 'reports' ? 'block' : 'none';
        }
    }

    updateSectionContent(sectionId) {
        console.log(`🔄 Actualizando contenido de: ${sectionId}`);
        
        const sectionActions = {
            'dashboard': () => this.updateDashboard(),
            'reports': () => this.updateReports(),
            'transfers': () => this.loadTransfersTable(),
            'users': () => this.loadUsersTable()
        };

        const action = sectionActions[sectionId];
        if (action) action();
    }

    // ✅ MÉTODO TOGGLE THEME DIRECTAMENTE EN LA CLASE
    toggleTheme() {
        console.log('🎨 Cambiando tema...');
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    // ✅ MÉTODOS MOBILE DIRECTAMENTE EN LA CLASE
    toggleMobileMenu() {
        console.log('📱 Alternando menú móvil...');
        if (window.innerWidth <= 767) return;
        
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        this.updateMobileMenu();
    }

    closeMobileMenu() {
        console.log('❌ Cerrando menú móvil...');
        if (window.innerWidth <= 767) return;
        
        this.isMobileMenuOpen = false;
        this.updateMobileMenu();
    }

    updateMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.menu-overlay');
        const menuIcon = document.querySelector('.menu-toggle-btn i');

        if (window.innerWidth <= 767) {
            if (sidebar) {
                sidebar.style.display = 'block';
                sidebar.style.position = 'fixed';
                sidebar.style.bottom = '0';
                sidebar.style.top = 'auto';
            }
            return;
        }

        if (sidebar) {
            sidebar.classList.toggle('mobile-open', this.isMobileMenuOpen);
        }

        if (overlay) {
            overlay.style.display = this.isMobileMenuOpen ? 'block' : 'none';
        }

        if (menuIcon) {
            menuIcon.className = this.isMobileMenuOpen ? 'fas fa-times' : 'fas fa-bars';
        }

        document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
    }

    handleResize() {
        if (window.innerWidth <= 767) return;
        if (window.innerWidth >= 768 && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
    }

    setupSidebarUser() {
        try {
            const sidebarUsernameEl = document.getElementById('sidebar-username');
            const sidebarUserContainer = document.getElementById('sidebar-user');
            const currentUser = sessionStorage.getItem('currentUser');
            
            if (sidebarUsernameEl && sidebarUserContainer && currentUser) {
                const users = this.dataManager.getUsers();
                let displayName = currentUser;
                if (users && users[currentUser] && users[currentUser].name) {
                    displayName = users[currentUser].name;
                }
                sidebarUsernameEl.textContent = displayName;
                sidebarUserContainer.classList.remove('hidden');
            }
        } catch (err) {
            console.warn('No se pudo mostrar el nombre en la barra lateral:', err);
        }
    }

    checkAdminAccess() {
        const userRole = sessionStorage.getItem('userRole');
        const usersNavLink = document.getElementById('users-nav-link');
        if (userRole === 'admin' && usersNavLink) {
            usersNavLink.style.display = 'block';
            console.log('✅ Usuario admin - mostrando enlace de usuarios');
        }
    }

    showAlert(elementId, message, type) {
        const alert = document.getElementById(elementId);
        alert.textContent = message;
        alert.className = `alert alert-${type}`;
        alert.classList.remove('hidden');
        
        setTimeout(() => {
            alert.classList.add('hidden');
        }, 3000);
    }

    handleLogout() {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('userRole');
        window.location.href = 'login.html';
    }

    initMonthSelector() {
        const monthPicker = document.getElementById('dashboard-month-picker');
        const currentBtn = document.getElementById('dashboard-current-month-btn');
        const monthSelector = document.querySelector('.month-selector');

        if (!monthPicker) return;

        if (monthSelector) {
            const currentSection = document.querySelector('.nav-link.active');
            const sectionId = currentSection ? currentSection.getAttribute('data-section') : 'dashboard';
            monthSelector.style.display = (sectionId === 'dashboard' || sectionId === 'reports') ? 'inline-flex' : 'none';
        }

        const today = new Date();
        const pad = (v) => v.toString().padStart(2, '0');
        monthPicker.value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
        this.selectedYear = today.getFullYear();
        this.selectedMonth = today.getMonth();

        monthPicker.addEventListener('change', () => {
            const val = monthPicker.value;
            if (!val) return;
            const parts = val.split('-');
            if (parts.length < 2) return;
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            this.selectedYear = y;
            this.selectedMonth = m;
            this.updateDashboard();
            this.updateReports();
        });

        if (currentBtn) currentBtn.addEventListener('click', () => {
            const t = new Date();
            const pad = (v) => v.toString().padStart(2, '0');
            monthPicker.value = `${t.getFullYear()}-${pad(t.getMonth() + 1)}`;
            this.selectedYear = t.getFullYear();
            this.selectedMonth = t.getMonth();
            this.updateDashboard();
            this.updateReports();
        });
    }

    // Métodos placeholder que serán sobreescritos por los módulos
    updateDashboard() { console.log('📊 updateDashboard placeholder'); }
    updateReports() { console.log('📈 updateReports placeholder'); }
    loadAccountsTable() { console.log('💳 loadAccountsTable placeholder'); }
    updateAccountSelects() { console.log('🔧 updateAccountSelects placeholder'); }
    loadTransactionsTable() { console.log('💸 loadTransactionsTable placeholder'); }
    loadTransfersTable() { console.log('🔄 loadTransfersTable placeholder'); }
    loadUsersTable() { console.log('👥 loadUsersTable placeholder'); }
    applyFilters() { console.log('🔍 applyFilters placeholder'); }
    clearFilters() { console.log('🧹 clearFilters placeholder'); }
    exportToCSV() { console.log('📤 exportToCSV placeholder'); }
    cancelEdit() { console.log('❌ cancelEdit placeholder'); }
    editUser() { console.log('✏️ editUser placeholder'); }
    deleteUser() { console.log('🗑️ deleteUser placeholder'); }
}