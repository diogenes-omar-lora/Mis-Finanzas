export function initializeUsersModule() {
    console.log('👥 Inicializando módulo de usuarios...');
    
    // ✅ ASIGNAR EXPLÍCITAMENTE TODOS LOS MÉTODOS
    this.loadUsersTable = loadUsersTable;
    this.editUser = editUser;
    this.deleteUser = deleteUser;
    this.cancelEdit = cancelEdit;
    this.handleUserFormSubmit = handleUserFormSubmit;
    this.deleteUserData = deleteUserData;
    this.moveUserData = moveUserData;
    
    // Cargar datos iniciales
    this.loadUsersTable();
}

// ... (mantener el resto del código de Users.js igual)
export function loadUsersTable() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;

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

export function editUser(username) {
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

export function deleteUser(username) {
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

export function handleUserFormSubmit(e) {
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

export function cancelEdit() {
    this.editingUser = null;
    const editUsernameInput = document.getElementById('edit-username');
    if (editUsernameInput) {
        editUsernameInput.readOnly = true;
    }
    const userForm = document.getElementById('user-form');
    if (userForm) userForm.reset();
}

export function deleteUserData(username) {
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

export function moveUserData(oldUsername, newUsername) {
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