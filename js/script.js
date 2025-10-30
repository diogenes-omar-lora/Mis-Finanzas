// =============================================
// APLICACIÓN PRINCIPAL - VERSIÓN COMPLETA Y FUNCIONAL
// =============================================

// Verificar autenticación al cargar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        // Inicializar la aplicación solo si está autenticado
        app = new FinanceApp();
    } catch (error) {
        console.error('Error initializing application:', error);
        showFriendlyError(error);
    }
});

function showFriendlyError(error) {
    const errorElement = document.createElement('div');
    errorElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 20px;
    `;
    errorElement.innerHTML = `
        <h2 style="color: #ff6b6b; margin-bottom: 20px;">Error al cargar la aplicación</h2>
        <p style="margin-bottom: 10px;">${error.message || 'Error desconocido'}</p>
        <p style="margin-bottom: 30px; opacity: 0.8;">Por favor, recarga la página o contacta al soporte.</p>
        <button onclick="window.location.reload()" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        ">Reintentar</button>
        <button onclick="window.location.href='login.html'" style="
            background: transparent;
            color: #4CAF50;
            border: 1px solid #4CAF50;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-left: 10px;
        ">Volver al Login</button>
    `;
    
    document.body.innerHTML = '';
    document.body.appendChild(errorElement);
}

// Gestión de datos COMPATIBLE
class DataManager {
    constructor() {
        this.initializeData();
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('financeUsers') || '{}');
    }

    saveUsers(users) {
        localStorage.setItem('financeUsers', JSON.stringify(users));
    }

    getUserRegistrationDate(username) {
        const userKey = `userRegDate_${username}`;
        return localStorage.getItem(userKey) || 'N/A';
    }

    setUserRegistrationDate(username, date) {
        const userKey = `userRegDate_${username}`;
        localStorage.setItem(userKey, date);
    }

    initializeData() {
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) return;

        const userKey = `financeData_${currentUser}`;

        if (!localStorage.getItem(`${userKey}_accounts`)) {
            const initialAccounts = [
                { id: 1, name: "Efectivo", type: "Efectivo", balance: 500.00 },
                { id: 2, name: "Cuenta Corriente", type: "Cuenta Corriente", balance: 2500.00 }
            ];
            localStorage.setItem(`${userKey}_accounts`, JSON.stringify(initialAccounts));
        }

        if (!localStorage.getItem(`${userKey}_transactions`)) {
            const currentDateTime = this.getCurrentDateTime();
            const initialTransactions = [
                { id: 1, date: this.getCurrentDate(), timestamp: currentDateTime, description: "Salario", category: "Ingresos", type: "income", amount: 3000.00, accountId: 2 },
                { id: 2, date: this.getCurrentDate(), timestamp: currentDateTime, description: "Supermercado", category: "Alimentación", type: "expense", amount: 150.00, accountId: 1 },
                { id: 3, date: this.getCurrentDate(), timestamp: currentDateTime, description: "Gasolina", category: "Transporte", type: "expense", amount: 50.00, accountId: 1 },
                { id: 4, date: this.getCurrentDate(), timestamp: currentDateTime, description: "Restaurante", category: "Alimentación", type: "expense", amount: 80.00, accountId: 2 }
            ];
            localStorage.setItem(`${userKey}_transactions`, JSON.stringify(initialTransactions));
        }

        if (!localStorage.getItem(`${userKey}_nextAccountId`)) {
            localStorage.setItem(`${userKey}_nextAccountId`, '3');
        }

        if (!localStorage.getItem(`${userKey}_nextTransactionId`)) {
            localStorage.setItem(`${userKey}_nextTransactionId`, '5');
        }
    }

    getCurrentUserKey() {
        const currentUser = sessionStorage.getItem('currentUser');
        return `financeData_${currentUser}`;
    }

    getAccounts() {
        const userKey = this.getCurrentUserKey();
        return JSON.parse(localStorage.getItem(`${userKey}_accounts`) || '[]');
    }

    getTransactions() {
        const userKey = this.getCurrentUserKey();
        return JSON.parse(localStorage.getItem(`${userKey}_transactions`) || '[]');
    }

    getNextAccountId() {
        const userKey = this.getCurrentUserKey();
        const nextId = parseInt(localStorage.getItem(`${userKey}_nextAccountId`) || '1');
        localStorage.setItem(`${userKey}_nextAccountId`, (nextId + 1).toString());
        return nextId;
    }

    getNextTransactionId() {
        const userKey = this.getCurrentUserKey();
        const nextId = parseInt(localStorage.getItem(`${userKey}_nextTransactionId`) || '1');
        localStorage.setItem(`${userKey}_nextTransactionId`, (nextId + 1).toString());
        return nextId;
    }

    saveAccounts(accounts) {
        const userKey = this.getCurrentUserKey();
        localStorage.setItem(`${userKey}_accounts`, JSON.stringify(accounts));
    }

    saveTransactions(transactions) {
        const userKey = this.getCurrentUserKey();
        localStorage.setItem(`${userKey}_transactions`, JSON.stringify(transactions));
    }

    getCurrentDate() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    getCurrentDateTime() {
        return new Date().toISOString();
    }

    getTransactionsByMonth(year, month) {
        const all = this.getTransactions();
        return all.filter(t => {
            const d = this.parseDateLocal(t.date);
            return d.getFullYear() === year && d.getMonth() === month;
        });
    }

    parseDateLocal(dateString) {
        if (!dateString) return new Date(NaN);
        const datePart = dateString.split('T')[0];
        const parts = datePart.split('-');
        if (parts.length < 3) return new Date(dateString);
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        return new Date(y, m, d);
    }
}

// Clase principal de la aplicación COMPLETA
class FinanceApp {
    constructor() {
        this.dataManager = new DataManager();
        this.accounts = this.dataManager.getAccounts();
        this.transactions = this.dataManager.getTransactions();
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.isMobileMenuOpen = false;
        
        // Variables para gráficos
        this.financeChart = null;
        this.expensesChart = null;
        this.incomeExpenseChart = null;
        
        this.initializeApp();
    }

    initializeApp() {
        try {
            this.setupDOMElements();
            this.checkAdminAccess();
            this.setupEventListeners();
            this.setupForms();
            this.initMonthSelector();
            
            // Mostrar la aplicación
            this.appScreen.classList.remove('hidden');
            
            // Cargar datos iniciales
            this.updateDashboard();
            this.loadAccountsTable();
            this.loadTransactionsTable();
            this.updateAccountSelects();

            this.setupExportButton();
        } catch (error) {
            console.error('Error in initializeApp:', error);
            throw error;
        }
    }

    // =============================================
    // MÉTODOS DE CONFIGURACIÓN DEL DOM
    // =============================================

    setupDOMElements() {
        this.appScreen = document.getElementById('app-screen');
        this.logoutBtn = document.getElementById('logout-btn');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('.section');
        this.sectionTitle = document.getElementById('section-title');

        this.setupSidebarUser();
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

    setupExportButton() {
        const exportBtn = document.getElementById('export-csv-btn');
        if (exportBtn) {
            const currentSection = document.querySelector('.nav-link.active').getAttribute('data-section');
            exportBtn.style.display = currentSection === 'reports' ? 'block' : 'none';
        }
    }

    // =============================================
    // MÉTODOS DE AUTENTICACIÓN Y USUARIOS
    // =============================================

    checkAdminAccess() {
        const userRole = sessionStorage.getItem('userRole');
        const usersNavLink = document.getElementById('users-nav-link');

        if (userRole === 'admin' && usersNavLink) {
            usersNavLink.style.display = 'block';
        }
    }

    loadUsersTable() {
        const tbody = document.querySelector('#users-table tbody');
        tbody.innerHTML = '';

        const users = this.dataManager.getUsers();
        const currentUser = sessionStorage.getItem('currentUser');

        Object.entries(users).forEach(([username, userData]) => {
            const row = document.createElement('tr');
            const regDate = this.dataManager.getUserRegistrationDate(username);

            row.innerHTML = `
                <td>${username} ${username === currentUser ? '(Tú)' : ''}</td>
                <td><span class="role-${userData.role}">${userData.role === 'admin' ? 'Administrador' : 'Usuario Normal'}</span></td>
                <td>${regDate}</td>
                <td class="user-actions">
                    <button class="btn btn-warning" onclick="app.editUser('${username}')" ${username === currentUser ? 'disabled' : ''}>
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger" onclick="app.deleteUser('${username}')" ${username === currentUser ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    editUser(username) {
        const users = this.dataManager.getUsers();
        const userData = users[username];

        if (!userData) return;

        const editUsernameInput = document.getElementById('edit-username');
        editUsernameInput.readOnly = false;
        editUsernameInput.value = username;
        document.getElementById('edit-role').value = userData.role;
        document.getElementById('edit-password').value = '';
        document.getElementById('confirm-edit-password').value = '';

        this.editingUser = username;
    }

    deleteUser(username) {
        if (confirm(`¿Estás seguro de que quieres eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) {
            const users = this.dataManager.getUsers();
            const currentUser = sessionStorage.getItem('currentUser');
            
            if (username === currentUser) {
                this.showAlert('users-alert', 'No puedes eliminar tu propio usuario', 'error');
                return;
            }

            delete users[username];
            this.dataManager.saveUsers(users);
            this.deleteUserData(username);

            this.showAlert('users-alert', `Usuario "${username}" eliminado correctamente`, 'success');
            this.loadUsersTable();
        }
    }

    deleteUserData(username) {
        const keysToRemove = [
            `financeData_${username}_accounts`,
            `financeData_${username}_transactions`,
            `financeData_${username}_nextAccountId`,
            `financeData_${username}_nextTransactionId`,
            `userRegDate_${username}`
        ];

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
    }

    handleUserFormSubmit(e) {
        e.preventDefault();

        if (!this.editingUser) {
            this.showAlert('users-alert', 'No hay usuario seleccionado para editar', 'error');
            return;
        }

        const newUsername = document.getElementById('edit-username').value.trim();
        const newRole = document.getElementById('edit-role').value;
        const newPassword = document.getElementById('edit-password').value;
        const confirmPassword = document.getElementById('confirm-edit-password').value;

        const users = this.dataManager.getUsers();

        if (!users[this.editingUser]) {
            this.showAlert('users-alert', 'El usuario original no existe', 'error');
            return;
        }

        if (!newUsername) {
            this.showAlert('users-alert', 'El nombre de usuario no puede estar vacío', 'error');
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            this.showAlert('users-alert', 'Las contraseñas no coinciden', 'error');
            return;
        }

        if (newUsername !== this.editingUser && users[newUsername]) {
            this.showAlert('users-alert', `El nombre de usuario "${newUsername}" ya existe`, 'error');
            return;
        }

        const userObj = users[this.editingUser];

        if (newPassword) {
            userObj.password = newPassword;
        }

        userObj.role = newRole;

        if (newUsername !== this.editingUser) {
            users[newUsername] = Object.assign({}, userObj, { name: newUsername });
            this.moveUserData(this.editingUser, newUsername);
            delete users[this.editingUser];
        } else {
            users[this.editingUser].name = newUsername;
        }

        this.dataManager.saveUsers(users);
        this.showAlert('users-alert', `Usuario "${newUsername}" actualizado correctamente`, 'success');
        this.loadUsersTable();
        this.cancelEdit();
    }

    moveUserData(oldUsername, newUsername) {
        const keysToMove = [
            '_accounts',
            '_transactions',
            '_nextAccountId',
            '_nextTransactionId'
        ];

        keysToMove.forEach(suffix => {
            const oldKey = `financeData_${oldUsername}${suffix}`;
            const newKey = `financeData_${newUsername}${suffix}`;
            const value = localStorage.getItem(oldKey);
            if (value !== null) {
                localStorage.setItem(newKey, value);
                localStorage.removeItem(oldKey);
            }
        });

        const oldRegKey = `userRegDate_${oldUsername}`;
        const newRegKey = `userRegDate_${newUsername}`;
        const regDate = localStorage.getItem(oldRegKey);
        if (regDate !== null) {
            localStorage.setItem(newRegKey, regDate);
            localStorage.removeItem(oldRegKey);
        }
    }

    cancelEdit() {
        this.editingUser = null;
        const editUsernameInput = document.getElementById('edit-username');
        if (editUsernameInput) {
            editUsernameInput.readOnly = true;
        }
        const userForm = document.getElementById('user-form');
        if (userForm) userForm.reset();
    }

    // =============================================
    // MÉTODOS DE NAVEGACIÓN Y EVENTOS
    // =============================================

    setupEventListeners() {
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        if (this.navLinks && this.navLinks.length) {
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => this.handleNavigation(e));
            });
        }

        const exportBtn = document.getElementById('export-csv-btn');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportToCSV());

        const applyFiltersBtn = document.getElementById('apply-filters');
        if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', () => this.clearFilters());

        const themeToggleBtn = document.getElementById('theme-toggle');
        if (themeToggleBtn) themeToggleBtn.addEventListener('click', () => this.toggleTheme());

        const menuToggleBtn = document.getElementById('menu-toggle');
        if (menuToggleBtn) {
            menuToggleBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        const closeSidebarBtn = document.getElementById('close-sidebar');
        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => this.closeMobileMenu());
        }

        const menuOverlay = document.querySelector('.menu-overlay');
        if (menuOverlay) {
            menuOverlay.addEventListener('click', () => this.closeMobileMenu());
        }

        window.addEventListener('resize', () => this.handleResize());
    }

    setupForms() {
        const accountForm = document.getElementById('account-form');
        if (accountForm) accountForm.addEventListener('submit', (e) => this.handleAccountSubmit(e));

        const transactionForm = document.getElementById('transaction-form');
        if (transactionForm) transactionForm.addEventListener('submit', (e) => this.handleTransactionSubmit(e));

        const transferForm = document.getElementById('transfer-form');
        if (transferForm) transferForm.addEventListener('submit', (e) => this.handleTransferSubmit(e));

        const userForm = document.getElementById('user-form');
        if (userForm) userForm.addEventListener('submit', (e) => this.handleUserFormSubmit(e));

        const cancelEditBtn = document.getElementById('cancel-edit');
        if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => this.cancelEdit());

        this.setDefaultDates();
    }

    setDefaultDates() {
        const transactionDate = document.getElementById('transaction-date');
        if (transactionDate) transactionDate.valueAsDate = new Date();
        
        const transferDate = document.getElementById('transfer-date');
        if (transferDate) transferDate.valueAsDate = new Date();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.querySelector('.theme-icon');
    
        if (theme === 'dark') {
            themeIcon.textContent = '☀️';
            themeIcon.title = 'Cambiar a modo claro';
        } else {
            themeIcon.textContent = '🌙';
            themeIcon.title = 'Cambiar a modo oscuro';
        }
    }

    toggleMobileMenu() {
        if (window.innerWidth <= 767) {
            return;
        }

        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        this.updateMobileMenu();
    }

    closeMobileMenu() {
        if (window.innerWidth <= 767) {
            return;
        }
    
        this.isMobileMenuOpen = false;
        this.updateMobileMenu();
    }

    updateMobileMenu() {
        if (window.innerWidth <= 767) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.style.display = 'block';
                sidebar.style.position = 'fixed';
                sidebar.style.bottom = '0';
                sidebar.style.top = 'auto';
            }
            return;
        }

        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.menu-overlay');
        const menuIcon = document.querySelector('.menu-toggle-btn i');

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
        if (window.innerWidth <= 767) {
            return;
        }
        
        if (window.innerWidth >= 768 && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
    }

    handleNavigation(e) {
        e.preventDefault();

        const link = e.currentTarget || e.target.closest('.nav-link');
        if (!link) return;

        const sectionId = link.getAttribute('data-section');

        if (window.innerWidth > 767) {
            this.toggleMonthSelector(sectionId);
            this.toggleExportButton(sectionId);
        }

        if (sectionId === 'logout') {
            this.handleLogout();
            return;
        }

        this.updateActiveNavigation(link);
        this.showSection(sectionId, link);

        if (window.innerWidth > 767) {
            this.closeMobileMenu();
        }

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

    updateActiveNavigation(activeLink) {
        this.navLinks.forEach(l => l.classList.remove('active'));
        activeLink.classList.add('active');
    }

    showSection(sectionId, activeLink) {
        this.sections.forEach(section => {
            section.classList.add('hidden');
            if (section.id === `${sectionId}-section`) {
                section.classList.remove('hidden');
                const titleText = activeLink.textContent.trim();
                this.sectionTitle.textContent = titleText;
            }
        });
    }

    updateSectionContent(sectionId) {
        const sectionActions = {
            'dashboard': () => this.updateDashboard(),
            'reports': () => this.updateReports(),
            'transfers': () => this.loadTransfersTable(),
            'users': () => this.loadUsersTable()
        };

        const action = sectionActions[sectionId];
        if (action) action();
    }

    handleLogout() {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('userRole');
        window.location.href = 'login.html';
    }

    // =============================================
    // MÉTODOS DE FORMULARIOS
    // =============================================

    handleAccountSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('account-name').value;
        const type = document.getElementById('account-type').value;
        const balance = parseFloat(document.getElementById('account-balance').value);
        
        const newAccount = {
            id: this.dataManager.getNextAccountId(),
            name,
            type,
            balance
        };
        
        this.accounts.push(newAccount);
        this.dataManager.saveAccounts(this.accounts);
        
        this.showAlert('accounts-alert', 'Cuenta agregada exitosamente', 'success');
        this.updateAfterAccountChange();
        e.target.reset();
    }

    handleTransactionSubmit(e) {
        e.preventDefault();
        
        const date = document.getElementById('transaction-date').value;
        const description = document.getElementById('transaction-description').value;
        const category = document.getElementById('transaction-category').value;
        const type = document.getElementById('transaction-type').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const accountId = parseInt(document.getElementById('transaction-account').value);
        
        const newTransaction = {
            id: this.dataManager.getNextTransactionId(),
            date,
            timestamp: this.dataManager.getCurrentDateTime(),
            description,
            category,
            type,
            amount,
            accountId
        };
        
        this.transactions.push(newTransaction);
        this.dataManager.saveTransactions(this.transactions);
        this.updateAccountBalance(accountId, type, amount);
        
        this.showAlert('transactions-alert', 'Transacción agregada exitosamente', 'success');
        this.updateAfterTransactionChange();
        e.target.reset();
        document.getElementById('transaction-date').valueAsDate = new Date();
    }

    handleTransferSubmit(e) {
        e.preventDefault();
        
        const date = document.getElementById('transfer-date').value;
        const description = document.getElementById('transfer-description').value;
        const fromAccountId = parseInt(document.getElementById('transfer-from').value);
        const toAccountId = parseInt(document.getElementById('transfer-to').value);
        const amount = parseFloat(document.getElementById('transfer-amount').value);
        
        if (!this.validateTransfer(fromAccountId, toAccountId, amount)) return;
        
        this.processTransfer(date, description, fromAccountId, toAccountId, amount);
        this.showAlert('transfers-alert', 'Transferencia realizada exitosamente', 'success');
        this.updateAfterTransferChange();
        e.target.reset();
        document.getElementById('transfer-date').valueAsDate = new Date();
    }

    validateTransfer(fromAccountId, toAccountId, amount) {
        if (fromAccountId === toAccountId) {
            this.showAlert('transfers-alert', 'No puedes transferir a la misma cuenta', 'error');
            return false;
        }
        
        const fromAccount = this.accounts.find(a => a.id === fromAccountId);
        const toAccount = this.accounts.find(a => a.id === toAccountId);
        
        if (!fromAccount || !toAccount) {
            this.showAlert('transfers-alert', 'Cuentas no válidas', 'error');
            return false;
        }
        
        if (fromAccount.balance < amount) {
            this.showAlert('transfers-alert', 'Saldo insuficiente en la cuenta de origen', 'error');
            return false;
        }
        
        return true;
    }

    processTransfer(date, description, fromAccountId, toAccountId, amount) {
        const fromAccount = this.accounts.find(a => a.id === fromAccountId);
        const toAccount = this.accounts.find(a => a.id === toAccountId);
        
        fromAccount.balance -= amount;
        toAccount.balance += amount;
        
        const transferOut = {
            id: this.dataManager.getNextTransactionId(),
            date,
            timestamp: this.dataManager.getCurrentDateTime(),
            description: `Transferencia: ${description}`,
            category: 'Transferencia',
            type: 'expense',
            amount,
            accountId: fromAccountId
        };

        const transferIn = {
            id: this.dataManager.getNextTransactionId(),
            date,
            timestamp: this.dataManager.getCurrentDateTime(),
            description: `Transferencia: ${description}`,
            category: 'Transferencia',
            type: 'income',
            amount,
            accountId: toAccountId
        };
        
        this.transactions.push(transferOut, transferIn);
        this.dataManager.saveTransactions(this.transactions);
        this.dataManager.saveAccounts(this.accounts);
    }

    updateAccountBalance(accountId, type, amount) {
        const account = this.accounts.find(a => a.id === accountId);
        if (account) {
            if (type === 'income') {
                account.balance += amount;
            } else {
                account.balance -= amount;
            }
            this.dataManager.saveAccounts(this.accounts);
        }
    }

    // =============================================
    // MÉTODOS DE ACTUALIZACIÓN
    // =============================================

    updateAfterAccountChange() {
        this.loadAccountsTable();
        this.updateAccountSelects();
        this.updateDashboard();
    }

    updateAfterTransactionChange() {
        this.loadTransactionsTable();
        this.loadAccountsTable();
        this.updateDashboard();
        this.updateAccountSelects();
    }

    updateAfterTransferChange() {
        this.loadTransactionsTable();
        this.loadAccountsTable();
        this.updateDashboard();
        this.updateAccountSelects();
        this.loadTransfersTable();
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

    // =============================================
    // MÉTODOS DE TABLAS
    // =============================================

    loadAccountsTable() {
        const tbody = document.querySelector('#accounts-table tbody');
        tbody.innerHTML = '';
        
        this.accounts.forEach(account => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${account.name}</td>
                <td>${account.type}</td>
                <td>$${account.balance.toFixed(2)}</td>
                <td class="actions">
                    <button class="btn btn-danger" onclick="app.deleteAccount(${account.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    loadTransactionsTable(transactionsToShow = null) {
        const tbody = document.querySelector('#transactions-table tbody');
        tbody.innerHTML = '';
        
        const transactions = transactionsToShow || this.transactions;
        const sortedTransactions = this.sortTransactionsByDate(transactions);
        
        sortedTransactions.forEach(transaction => {
            const account = this.accounts.find(a => a.id === transaction.accountId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td>${transaction.category}</td>
                <td>${transaction.type === 'income' ? 'Ingreso' : 'Gasto'}</td>
                <td class="${transaction.type === 'income' ? 'positive' : 'negative'}">$${transaction.amount.toFixed(2)}</td>
                <td>${account ? account.name : 'N/A'}</td>
                <td class="actions">
                    <button class="btn btn-danger" onclick="app.deleteTransaction(${transaction.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        this.scrollTableToTop('.transactions-table-wrapper');
    }

    loadTransfersTable() {
        const tbody = document.querySelector('#transfers-table tbody');
        tbody.innerHTML = '';
        
        const transferTransactions = this.transactions.filter(t => t.category === 'Transferencia');
        const transfersMap = new Map();
        
        transferTransactions.forEach(transaction => {
            const key = `${transaction.date}-${transaction.description}`;
            if (!transfersMap.has(key)) {
                transfersMap.set(key, {
                    date: transaction.date,
                    description: transaction.description.replace('Transferencia: ', ''),
                    from: null,
                    to: null,
                    amount: transaction.amount
                });
            }

            const transfer = transfersMap.get(key);
            if (transaction.type === 'expense') {
                transfer.from = this.accounts.find(a => a.id === transaction.accountId)?.name || 'N/A';
            } else {
                transfer.to = this.accounts.find(a => a.id === transaction.accountId)?.name || 'N/A';
            }
        });

        const transfers = this.sortTransfersByDate(Array.from(transfersMap.values()));

        transfers.forEach(transfer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(transfer.date)}</td>
                <td>${transfer.description}</td>
                <td>${transfer.from}</td>
                <td>${transfer.to}</td>
                <td>$${transfer.amount.toFixed(2)}</td>
                <td class="actions">
                    <button class="btn btn-danger" onclick="app.deleteTransfer('${transfer.date}', '${transfer.description}')">Eliminar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        this.scrollTableToTop('.transfers-table-wrapper');
    }

    sortTransactionsByDate(transactions) {
        return [...transactions].sort((a, b) => {
            const dateA = a.timestamp ? new Date(a.timestamp) : this.dataManager.parseDateLocal(a.date);
            const dateB = b.timestamp ? new Date(b.timestamp) : this.dataManager.parseDateLocal(b.date);
            return dateB - dateA;
        });
    }

    sortTransfersByDate(transfers) {
        return transfers.sort((a, b) => {
            const transferTransactionsA = this.transactions.filter(t => 
                t.date === a.date && t.description === `Transferencia: ${a.description}`
            );
            const transferTransactionsB = this.transactions.filter(t => 
                t.date === b.date && t.description === `Transferencia: ${b.description}`
            );
            const timestampA = transferTransactionsA[0]?.timestamp ? new Date(transferTransactionsA[0].timestamp) : this.dataManager.parseDateLocal(a.date);
            const timestampB = transferTransactionsB[0]?.timestamp ? new Date(transferTransactionsB[0].timestamp) : this.dataManager.parseDateLocal(b.date);
            return timestampB - timestampA;
        });
    }

    scrollTableToTop(selector) {
        const wrapper = document.querySelector(selector);
        if (wrapper) wrapper.scrollTop = 0;
    }

    // =============================================
    // MÉTODOS DE ELIMINACIÓN
    // =============================================

    deleteAccount(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) {
            const hasTransactions = this.transactions.some(t => t.accountId === id);
            
            if (hasTransactions) {
                alert('No puedes eliminar una cuenta que tiene transacciones asociadas.');
                return;
            }
            
            this.accounts = this.accounts.filter(account => account.id !== id);
            this.dataManager.saveAccounts(this.accounts);
            this.updateAfterAccountChange();
        }
    }

    deleteTransaction(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
            const transaction = this.transactions.find(t => t.id === id);
            
            if (transaction) {
                this.revertTransactionEffect(transaction);
                this.transactions = this.transactions.filter(t => t.id !== id);
                this.dataManager.saveTransactions(this.transactions);
                this.updateAfterTransactionChange();
            }
        }
    }

    deleteTransfer(date, description) {
        if (confirm('¿Estás seguro de que quieres eliminar esta transferencia?')) {
            const transferTransactions = this.transactions.filter(t => 
                t.date === date && t.description === `Transferencia: ${description}`
            );
            
            this.revertTransferEffects(transferTransactions);
            this.transactions = this.transactions.filter(t => 
                !(t.date === date && t.description === `Transferencia: ${description}`)
            );
            
            this.dataManager.saveAccounts(this.accounts);
            this.dataManager.saveTransactions(this.transactions);
            this.updateAfterTransferChange();
        }
    }

    revertTransactionEffect(transaction) {
        const account = this.accounts.find(a => a.id === transaction.accountId);
        if (account) {
            if (transaction.type === 'income') {
                account.balance -= transaction.amount;
            } else {
                account.balance += transaction.amount;
            }
            this.dataManager.saveAccounts(this.accounts);
        }
    }

    revertTransferEffects(transferTransactions) {
        transferTransactions.forEach(transaction => {
            const account = this.accounts.find(a => a.id === transaction.accountId);
            if (account) {
                if (transaction.type === 'expense') {
                    account.balance += transaction.amount;
                } else {
                    account.balance -= transaction.amount;
                }
            }
        });
    }

    // =============================================
    // MÉTODOS DE SELECTORES
    // =============================================

    updateAccountSelects() {
        const accountSelects = document.querySelectorAll('#transaction-account, #transfer-from, #transfer-to, #filter-account');
        
        accountSelects.forEach(select => {
            select.innerHTML = '<option value="">Selecciona una cuenta</option>';
            
            this.accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = `${account.name} ($${account.balance.toFixed(2)})`;
                select.appendChild(option);
            });
        });
    }

    // =============================================
    // MÉTODOS DE DASHBOARD Y REPORTES
    // =============================================

    initMonthSelector() {
        const monthPicker = document.getElementById('dashboard-month-picker');
        const currentBtn = document.getElementById('dashboard-current-month-btn');
        const monthSelector = document.querySelector('.month-selector');

        if (!monthPicker) return;

        if (monthSelector) {
            const currentSection = document.querySelector('.nav-link.active').getAttribute('data-section');
            monthSelector.style.display = (currentSection === 'dashboard' || currentSection === 'reports') ? 'inline-flex' : 'none';
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

    updateDashboard(year, month) {
        if (typeof year !== 'number' || typeof month !== 'number') {
            if (typeof this.selectedYear === 'number' && typeof this.selectedMonth === 'number') {
                year = this.selectedYear;
                month = this.selectedMonth;
            } else {
                const t = new Date();
                year = t.getFullYear();
                month = t.getMonth();
            }
        }

        const monthlyTransactions = this.dataManager.getTransactionsByMonth(year, month);
        const totalIncome = this.calculateTotal(monthlyTransactions, 'income');
        const totalExpense = this.calculateTotal(monthlyTransactions, 'expense');

        this.updateMonthlyTotals(totalIncome, totalExpense);
        this.updateAccountsBalanceCards();
        this.updateFinanceChart(totalIncome, totalExpense);
        this.updateRecentTransactions();
    }

    calculateTotal(transactions, type) {
        return transactions
            .filter(t => t.type === type)
            .reduce((sum, t) => sum + t.amount, 0);
    }

    updateMonthlyTotals(income, expense) {
        const incomeEl = document.getElementById('total-income');
        const expenseEl = document.getElementById('total-expense');
        if (incomeEl) incomeEl.textContent = `$${income.toFixed(2)}`;
        if (expenseEl) expenseEl.textContent = `$${expense.toFixed(2)}`;
    }

    updateAccountsBalanceCards() {
        const container = document.getElementById('accounts-balance-cards');
        container.innerHTML = '';

        this.accounts.forEach(account => {
            const accountCard = document.createElement('div');
            accountCard.className = 'account-balance-card';
            accountCard.innerHTML = `
                <h4>${account.name}</h4>
                <div class="amount balance">$${account.balance.toFixed(2)}</div>
                <small>${account.type}</small>
            `;
            container.appendChild(accountCard);
        });
    }

    updateRecentTransactions() {
        const tbody = document.querySelector('#recent-transactions tbody');
        tbody.innerHTML = '';
        
        let year = this.selectedYear;
        let month = this.selectedMonth;
        if (typeof year !== 'number' || typeof month !== 'number') {
            const t = new Date();
            year = t.getFullYear();
            month = t.getMonth();
        }
        
        const monthlyTransactions = this.dataManager.getTransactionsByMonth(year, month);
        const recentTransactions = this.sortTransactionsByDate(monthlyTransactions);
        
        recentTransactions.forEach(transaction => {
            const account = this.accounts.find(a => a.id === transaction.accountId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td>${transaction.category}</td>
                <td class="${transaction.type === 'income' ? 'positive' : 'negative'}">$${transaction.amount.toFixed(2)}</td>
                <td>${account ? account.name : 'N/A'}</td>
            `;
            tbody.appendChild(row);
        });

        this.scrollTableToTop('.recent-transactions-wrapper');
    }

    updateReports() {
        const year = (typeof this.selectedYear === 'number') ? this.selectedYear : undefined;
        const month = (typeof this.selectedMonth === 'number') ? this.selectedMonth : undefined;
        
        this.updateExpensesChart(year, month);
        this.updateIncomeExpenseChart(year, month);
        this.updateReportsTransactionsTable();
    }

    updateReportsTransactionsTable() {
        const table = document.getElementById('reports-transactions-table');
        if (!table) return;

        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';

        const transactions = this.dataManager.getTransactionsByMonth(this.selectedYear, this.selectedMonth);
        const sortedTransactions = this.sortTransactionsByDate(transactions);

        sortedTransactions.forEach(t => {
            const account = this.accounts.find(a => a.id === t.accountId);
            const date = this.formatDate(t.date);
            const amount = `$${t.amount.toFixed(2)}`;
            const transactionType = t.type === 'income' ? 'Ingreso' : 'Gasto';
            const amountClass = t.type === 'income' ? 'income' : 'expense';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${date}</td>
                <td>${transactionType}</td>
                <td>${t.category}</td>
                <td>${account ? account.name : 'N/A'}</td>
                <td>${t.description}</td>
                <td class="${amountClass}">${t.type === 'income' ? amount : `-${amount}`}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // =============================================
    // MÉTODOS DE GRÁFICOS
    // =============================================

    updateFinanceChart(income, expense) {
        const ctx = document.getElementById('finance-chart').getContext('2d');
        
        if (this.financeChart) {
            this.financeChart.destroy();
        }
        
        this.financeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Gastos'],
                datasets: [{
                    label: 'Monto ($)',
                    data: [income, expense],
                    backgroundColor: [
                        'rgba(33, 199, 21, 0.7)',
                        'rgba(247, 37, 37, 0.7)'
                    ],
                    borderColor: [
                        'rgba(37, 197, 25, 1)',
                        'rgba(247, 37, 37, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateExpensesChart(year, month) {
        const ctx = document.getElementById('expenses-chart').getContext('2d');

        const expensesByCategory = {};
        const source = (typeof year === 'number' && typeof month === 'number')
            ? this.dataManager.getTransactionsByMonth(year, month)
            : this.transactions;

        source
            .filter(t => t.type === 'expense')
            .forEach(t => {
                if (!expensesByCategory[t.category]) {
                    expensesByCategory[t.category] = 0;
                }
                expensesByCategory[t.category] += t.amount;
            });
        
        const categories = Object.keys(expensesByCategory);
        const amounts = Object.values(expensesByCategory);
        
        if (this.expensesChart) {
            this.expensesChart.destroy();
        }
        
        this.expensesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(199, 199, 199, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(199, 199, 199, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    updateIncomeExpenseChart(year, month) {
        const ctx = document.getElementById('income-expense-chart').getContext('2d');

        let argsYear, argsMonth;
        if (arguments.length >= 2) {
            argsYear = arguments[0];
            argsMonth = arguments[1];
        }

        const useYear = (typeof argsYear === 'number') ? argsYear : year;
        const useMonth = (typeof argsMonth === 'number') ? argsMonth : month;

        if (this.incomeExpenseChart) {
            this.incomeExpenseChart.destroy();
        }

        if (typeof useYear === 'number' && typeof useMonth === 'number') {
            const monthly = this.dataManager.getTransactionsByMonth(useYear, useMonth);
            const income = this.calculateTotal(monthly, 'income');
            const expense = this.calculateTotal(monthly, 'expense');

            this.incomeExpenseChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Ingresos', 'Gastos'],
                    datasets: [{
                        label: `Resumen ${useMonth + 1}/${useYear}`,
                        data: [income, expense],
                        backgroundColor: ['rgba(32,214,19,0.7)', 'rgba(233,9,20,0.7)'],
                        borderColor: ['rgba(32,214,19,1)', 'rgba(233,9,20,1)'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } }
                }
            });
        } else {
            const monthlyData = {};
            this.transactions.forEach(t => {
                const date = this.dataManager.parseDateLocal(t.date);
                const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

                if (!monthlyData[monthYear]) {
                    monthlyData[monthYear] = { income: 0, expense: 0 };
                }

                if (t.type === 'income') {
                    monthlyData[monthYear].income += t.amount;
                } else {
                    monthlyData[monthYear].expense += t.amount;
                }
            });

            const months = Object.keys(monthlyData).sort();
            const incomeData = months.map(m => monthlyData[m].income);
            const expenseData = months.map(m => monthlyData[m].expense);

            const monthLabels = months.map(m => {
                const [yearStr, monthStr] = m.split('-');
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                return `${monthNames[parseInt(monthStr) - 1]} ${yearStr}`;
            });

            this.incomeExpenseChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: monthLabels,
                    datasets: [
                        {
                            label: 'Ingresos',
                            data: incomeData,
                            borderColor: 'rgba(32, 214, 19, 1)',
                            backgroundColor: 'rgba(75, 181, 67, 0.1)',
                            tension: 0.3,
                            fill: true
                        },
                        {
                            label: 'Gastos',
                            data: expenseData,
                            borderColor: 'rgba(233, 9, 20, 1)',
                            backgroundColor: 'rgba(247, 37, 133, 0.1)',
                            tension: 0.3,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    // =============================================
    // MÉTODOS DE FILTROS
    // =============================================

    applyFilters() {
        const type = document.getElementById('filter-type').value;
        const category = document.getElementById('filter-category').value;
        const account = document.getElementById('filter-account').value;
        const dateFrom = document.getElementById('filter-date-from').value;
        const dateTo = document.getElementById('filter-date-to').value;
        
        let filteredTransactions = this.transactions;
        
        if (type) {
            filteredTransactions = filteredTransactions.filter(t => t.type === type);
        }
        
        if (category) {
            filteredTransactions = filteredTransactions.filter(t => t.category === category);
        }
        
        if (account) {
            filteredTransactions = filteredTransactions.filter(t => t.accountId === parseInt(account));
        }
        
        if (dateFrom) {
            filteredTransactions = filteredTransactions.filter(t => t.date >= dateFrom);
        }
        
        if (dateTo) {
            filteredTransactions = filteredTransactions.filter(t => t.date <= dateTo);
        }
        
        this.loadTransactionsTable(filteredTransactions);
    }

    clearFilters() {
        document.getElementById('filter-type').value = '';
        document.getElementById('filter-category').value = '';
        document.getElementById('filter-account').value = '';
        document.getElementById('filter-date-from').value = '';
        document.getElementById('filter-date-to').value = '';
        
        this.loadTransactionsTable();
    }

    // =============================================
    // MÉTODOS DE EXPORTACIÓN
    // =============================================

    exportToCSV() {
        const data = [
            ['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto', 'Cuenta']
        ];

        this.transactions.forEach(transaction => {
            const account = this.accounts.find(a => a.id === transaction.accountId);
            data.push([
                transaction.date,
                transaction.description,
                transaction.category,
                transaction.type === 'income' ? 'Ingreso' : 'Gasto',
                transaction.amount,
                account ? account.name : 'N/A'
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transacciones");

        ws['!cols'] = [
            {wch: 12},
            {wch: 30},
            {wch: 15},
            {wch: 10},
            {wch: 12},
            {wch: 20}
        ];

        const fecha = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `finanzas-${fecha}.xlsx`);
    }

    // =============================================
    // MÉTODOS DE UTILIDAD
    // =============================================

    formatDate(dateString) {
        const date = this.dataManager ? this.dataManager.parseDateLocal(dateString) : new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('es-ES');
    }
}

// Variable global de la aplicación
let app;