export function updateFinanceChart(income, expense) {
    console.log('📊 Actualizando gráfico financiero...');
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

// ... (implementar las otras funciones de charts)

export function updateExpensesChart(year, month) {
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

export function updateIncomeExpenseChart(year, month) {
    const ctx = document.getElementById('income-expense-chart').getContext('2d');

    if (this.incomeExpenseChart) {
        this.incomeExpenseChart.destroy();
    }

    if (typeof year === 'number' && typeof month === 'number') {
        const monthly = this.dataManager.getTransactionsByMonth(year, month);
        const income = this.calculateTotal(monthly, 'income');
        const expense = this.calculateTotal(monthly, 'expense');

        this.incomeExpenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Gastos'],
                datasets: [{
                    label: `Resumen ${month + 1}/${year}`,
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