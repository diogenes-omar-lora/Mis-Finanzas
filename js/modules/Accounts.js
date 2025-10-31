import { formatDate } from '../utils/Formatters.js';

export function initializeAccountsModule() {
    console.log('💳 Inicializando módulo de cuentas...');
    
    // ✅ ASIGNAR EXPLÍCITAMENTE TODOS LOS MÉTODOS
    this.loadAccountsTable = loadAccountsTable;
    this.updateAccountSelects = updateAccountSelects;
    this.deleteAccount = deleteAccount;
    this.updateAfterAccountChange = updateAfterAccountChange;
    
    // Cargar datos iniciales
    this.loadAccountsTable();
    this.updateAccountSelects();
}

export function handleAccountSubmit(e) {
    e.preventDefault();
    console.log('💳 Procesando formulario de cuenta...');
    
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

export function deleteAccount(id) {
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

export function loadAccountsTable() {
    console.log('💳 Cargando tabla de cuentas...');
    const tbody = document.querySelector('#accounts-table tbody');
    if (!tbody) {
        console.error('❌ No se encontró tbody para accounts-table');
        return;
    }
    
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
    
    console.log(`✅ Tabla de cuentas cargada con ${this.accounts.length} cuentas`);
}

export function updateAccountSelects() {
    console.log('🔧 Actualizando selects de cuentas...');
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

export function updateAfterAccountChange() {
    console.log('🔄 Actualizando después de cambio en cuentas...');
    this.loadAccountsTable();
    this.updateAccountSelects();
    this.updateDashboard();
}