import { handleAccountSubmit } from '../modules/Accounts.js';
import { handleTransactionSubmit } from '../modules/Transactions.js';
import { handleTransferSubmit } from '../modules/Transfers.js';
import { handleUserFormSubmit } from '../modules/Users.js';
import { applyFilters, clearFilters, exportToCSV } from '../modules/Reports.js';

export function setupForms() {
    console.log('📝 Configurando formularios...');
    
    const accountForm = document.getElementById('account-form');
    if (accountForm) {
        accountForm.addEventListener('submit', (e) => handleAccountSubmit.call(this, e));
        console.log('✅ Formulario de cuentas configurado');
    }

    const transactionForm = document.getElementById('transaction-form');
    if (transactionForm) {
        transactionForm.addEventListener('submit', (e) => handleTransactionSubmit.call(this, e));
        console.log('✅ Formulario de transacciones configurado');
    }

    const transferForm = document.getElementById('transfer-form');
    if (transferForm) {
        transferForm.addEventListener('submit', (e) => handleTransferSubmit.call(this, e));
        console.log('✅ Formulario de transferencias configurado');
    }

    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', (e) => handleUserFormSubmit.call(this, e));
        console.log('✅ Formulario de usuarios configurado');
    }

    const cancelEditBtn = document.getElementById('cancel-edit');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => this.cancelEdit());
        console.log('✅ Botón cancelar edición configurado');
    }

    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        console.log('✅ Botón aplicar filtros configurado');
    }

    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => this.clearFilters());
        console.log('✅ Botón limpiar filtros configurado');
    }

    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => this.exportToCSV());
        console.log('✅ Botón exportar configurado');
    }

    this.setDefaultDates();
    console.log('✅ Todos los formularios configurados');
}

export function setDefaultDates() {
    console.log('📅 Configurando fechas por defecto...');
    
    const transactionDate = document.getElementById('transaction-date');
    if (transactionDate) transactionDate.valueAsDate = new Date();
    
    const transferDate = document.getElementById('transfer-date');
    if (transferDate) transferDate.valueAsDate = new Date();
    
    console.log('✅ Fechas configuradas');
}