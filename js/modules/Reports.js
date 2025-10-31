import { updateFinanceChart, updateExpensesChart, updateIncomeExpenseChart } from '../ui/ChartsManager.js';
import { formatDate } from '../utils/Formatters.js';
import { calculateTotal } from '../utils/Helpers.js';

export function initializeReportsModule() {
    console.log('📈 Inicializando módulo de reportes...');
    
    // ✅ ASIGNAR EXPLÍCITAMENTE TODOS LOS MÉTODOS
    this.updateDashboard = updateDashboard;
    this.updateReports = updateReports;
    this.applyFilters = applyFilters;
    this.clearFilters = clearFilters;
    this.exportToCSV = exportToCSV;
    this.calculateTotal = calculateTotal;
    
    // Cargar datos iniciales
    this.updateDashboard();
    this.updateReports();
}

// ... (mantener el resto del código de Reports.js igual)

export function initMonthSelector() {
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

export function updateDashboard(year, month) {
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
    const totalIncome = calculateTotal(monthlyTransactions, 'income');
    const totalExpense = calculateTotal(monthlyTransactions, 'expense');

    updateMonthlyTotals.call(this, totalIncome, totalExpense);
    updateAccountsBalanceCards.call(this);
    updateFinanceChart.call(this, totalIncome, totalExpense);
    updateRecentTransactions.call(this);
}

export function updateMonthlyTotals(income, expense) {
    const incomeEl = document.getElementById('total-income');
    const expenseEl = document.getElementById('total-expense');
    if (incomeEl) incomeEl.textContent = `$${income.toFixed(2)}`;
    if (expenseEl) expenseEl.textContent = `$${expense.toFixed(2)}`;
}

export function updateAccountsBalanceCards() {
    const container = document.getElementById('accounts-balance-cards');
    if (!container) return;

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

export function updateRecentTransactions() {
    const tbody = document.querySelector('#recent-transactions tbody');
    if (!tbody) return;
    
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
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td class="${transaction.type === 'income' ? 'positive' : 'negative'}">$${transaction.amount.toFixed(2)}</td>
            <td>${account ? account.name : 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });

    this.scrollTableToTop('.recent-transactions-wrapper');
}

export function updateReports() {
    const year = (typeof this.selectedYear === 'number') ? this.selectedYear : undefined;
    const month = (typeof this.selectedMonth === 'number') ? this.selectedMonth : undefined;
    
    updateExpensesChart.call(this, year, month);
    updateIncomeExpenseChart.call(this, year, month);
    updateReportsTransactionsTable.call(this);
}

export function updateReportsTransactionsTable() {
    const table = document.getElementById('reports-transactions-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    const transactions = this.dataManager.getTransactionsByMonth(this.selectedYear, this.selectedMonth);
    const sortedTransactions = this.sortTransactionsByDate(transactions);

    sortedTransactions.forEach(t => {
        const account = this.accounts.find(a => a.id === t.accountId);
        const date = formatDate(t.date);
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

export function applyFilters() {
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

export function clearFilters() {
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-account').value = '';
    document.getElementById('filter-date-from').value = '';
    document.getElementById('filter-date-to').value = '';
    
    this.loadTransactionsTable();
}

export function exportToCSV() {
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