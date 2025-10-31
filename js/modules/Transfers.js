import { formatDate } from '../utils/Formatters.js';

export function initializeTransfersModule() {
    console.log('🔄 Inicializando módulo de transferencias...');
    
    // ✅ ASIGNAR EXPLÍCITAMENTE TODOS LOS MÉTODOS
    this.loadTransfersTable = loadTransfersTable;
    this.deleteTransfer = deleteTransfer;
    this.updateAfterTransferChange = updateAfterTransferChange;
    this.validateTransfer = validateTransfer;
    this.processTransfer = processTransfer;
    this.sortTransfersByDate = sortTransfersByDate;
    this.revertTransferEffects = revertTransferEffects;
    
    // Cargar datos iniciales
    this.loadTransfersTable();
}

export function handleTransferSubmit(e) {
    e.preventDefault();
    console.log('🔄 Procesando formulario de transferencia...');
    
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

// ... (mantener el resto del código de Transfers.js igual)

export function validateTransfer(fromAccountId, toAccountId, amount) {
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

export function processTransfer(date, description, fromAccountId, toAccountId, amount) {
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

export function loadTransfersTable() {
    const tbody = document.querySelector('#transfers-table tbody');
    if (!tbody) return;
    
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

    // ✅ USAR this.sortTransfersByDate QUE AHORA ESTÁ ASIGNADO
    const transfers = this.sortTransfersByDate(Array.from(transfersMap.values()));

    transfers.forEach(transfer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(transfer.date)}</td>
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

export function deleteTransfer(date, description) {
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

export function sortTransfersByDate(transfers) {
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

export function revertTransferEffects(transferTransactions) {
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

export function updateAfterTransferChange() {
    this.loadTransactionsTable();
    this.loadAccountsTable();
    this.updateDashboard();
    this.updateAccountSelects();
    this.loadTransfersTable();
}