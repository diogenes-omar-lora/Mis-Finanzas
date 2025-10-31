export class DataManager {
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