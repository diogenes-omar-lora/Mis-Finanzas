import { formatDate } from '../utils/Formatters.js';

export function initializeTransactionsModule() {
    console.log('💸 Inicializando módulo de transacciones...');
    
    // ✅ ASIGNAR EXPLÍCITAMENTE TODOS LOS MÉTODOS
    this.loadTransactionsTable = loadTransactionsTable;
    this.deleteTransaction = deleteTransaction;
    this.updateAfterTransactionChange = updateAfterTransactionChange;
    this.sortTransactionsByDate = sortTransactionsByDate;
    this.updateAccountBalance = updateAccountBalance;
    this.revertTransactionEffect = revertTransactionEffect;
    this.scrollTableToTop = scrollTableToTop;
    
    // Cargar datos iniciales
    this.loadTransactionsTable();
}

export function handleTransactionSubmit(e) {
    e.preventDefault();
    console.log('💸 Procesando formulario de transacción...');
    
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

export function deleteTransaction(id) {
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

export function loadTransactionsTable(transactionsToShow = null) {
    console.log('💸 Cargando tabla de transacciones...');
    const tbody = document.querySelector('#transactions-table tbody');
    if (!tbody) {
        console.error('❌ No se encontró tbody para transactions-table');
        return;
    }
    
    tbody.innerHTML = '';
    
    const transactions = transactionsToShow || this.transactions;
    const sortedTransactions = this.sortTransactionsByDate(transactions);
    
    sortedTransactions.forEach(transaction => {
        const account = this.accounts.find(a => a.id === transaction.accountId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
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
    console.log(`✅ Tabla de transacciones cargada con ${sortedTransactions.length} transacciones`);
}

export function sortTransactionsByDate(transactions) {
    return [...transactions].sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : this.dataManager.parseDateLocal(a.date);
        const dateB = b.timestamp ? new Date(b.timestamp) : this.dataManager.parseDateLocal(b.date);
        return dateB - dateA;
    });
}

export function updateAccountBalance(accountId, type, amount) {
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

export function revertTransactionEffect(transaction) {
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

export function updateAfterTransactionChange() {
    console.log('🔄 Actualizando después de cambio en transacciones...');
    this.loadTransactionsTable();
    this.loadAccountsTable();
    this.updateDashboard();
    this.updateAccountSelects();
}

export function scrollTableToTop(selector) {
    const wrapper = document.querySelector(selector);
    if (wrapper) wrapper.scrollTop = 0;
}