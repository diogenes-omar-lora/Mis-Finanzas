// Limpiar sesión anterior por seguridad
sessionStorage.removeItem('currentUser');
sessionStorage.removeItem('userRole');

export function getUsers() {
    try {
        const usersData = localStorage.getItem("financeUsers");
        if (!usersData) {
            return {};
        }
        return JSON.parse(usersData);
    } catch (error) {
        console.error("❌ Error loading users:", error);
        return {};
    }
}

export function saveUsers(users) {
    try {
        localStorage.setItem("financeUsers", JSON.stringify(users));
        return true;
    } catch (error) {
        console.error("❌ Error saving users:", error);
        return false;
    }
}

export function initializeDefaultAdmin() {
    const users = getUsers();
    if (Object.keys(users).length === 0) {
        users["admin"] = {
            password: "admin",
            role: "admin",
            name: "Administrador",
            lastname: "Sistema"
        };
        saveUsers(users);
        initializeUserData('admin');
        console.info("✅ Usuario administrador por defecto creado: admin/admin");
    }
}

export function initializeUserData(username) {
    try {
        const userKey = `financeData_${username}`;
        
        // Solo inicializar si no existen datos
        if (!localStorage.getItem(`${userKey}_accounts`)) {
            const initialAccounts = [
                { id: 1, name: "Efectivo", type: "Efectivo", balance: 500.00 },
                { id: 2, name: "Cuenta Corriente", type: "Cuenta Corriente", balance: 2500.00 }
            ];
            localStorage.setItem(`${userKey}_accounts`, JSON.stringify(initialAccounts));
        }
        
        if (!localStorage.getItem(`${userKey}_transactions`)) {
            const currentDate = new Date().toISOString().split('T')[0];
            const currentDateTime = new Date().toISOString();
            const initialTransactions = [
                { 
                    id: 1, 
                    date: currentDate, 
                    timestamp: currentDateTime, 
                    description: "Salario", 
                    category: "Ingresos", 
                    type: "income", 
                    amount: 3000.00, 
                    accountId: 2 
                },
                { 
                    id: 2, 
                    date: currentDate, 
                    timestamp: currentDateTime, 
                    description: "Supermercado", 
                    category: "Alimentación", 
                    type: "expense", 
                    amount: 150.00, 
                    accountId: 1 
                }
            ];
            localStorage.setItem(`${userKey}_transactions`, JSON.stringify(initialTransactions));
        }
        
        if (!localStorage.getItem(`${userKey}_nextAccountId`)) {
            localStorage.setItem(`${userKey}_nextAccountId`, '3');
        }
        
        if (!localStorage.getItem(`${userKey}_nextTransactionId`)) {
            localStorage.setItem(`${userKey}_nextTransactionId`, '3');
        }

        // Guardar fecha de registro
        const currentDate = new Date().toLocaleDateString('es-ES');
        localStorage.setItem(`userRegDate_${username}`, currentDate);

        console.log(`✅ Datos inicializados para usuario: ${username}`);

    } catch (error) {
        console.error("❌ Error initializing user data:", error);
    }
}

export function validateLogin(username, password) {
    const users = getUsers();
    
    if (users[username] && users[username].password === password) {
        return { success: true, role: users[username].role };
    } else {
        return { success: false, message: "Usuario o contraseña incorrectos" };
    }
}

export function validateRegistration(name, lastname, username, password, confirmPassword) {
    // Validar campos requeridos
    if (!name || !lastname || !username || !password || !confirmPassword) {
        return { success: false, message: "Todos los campos son obligatorios." };
    }

    // Validar nombre y apellido
    if (name.length < 2 || lastname.length < 2) {
        return { success: false, message: "Nombre y apellido deben tener al menos 2 caracteres." };
    }

    // Validar usuario
    if (username.length < 3 || username.length > 20) {
        return { success: false, message: "El usuario debe tener entre 3 y 20 caracteres." };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { success: false, message: "Solo se permiten letras, números y guiones bajos." };
    }

    // Validar contraseña
    if (password.length < 4) {
        return { success: false, message: "La contraseña debe tener al menos 4 caracteres." };
    }

    // Verificar que las contraseñas coincidan
    if (password !== confirmPassword) {
        return { success: false, message: "Las contraseñas no coinciden." };
    }

    // Verificar si el usuario ya existe
    const usersData = getUsers();
    if (usersData[username]) {
        return { success: false, message: "El nombre de usuario ya existe. Elige otro." };
    }

    return { success: true };
}

export function createNewUser(name, lastname, username, password) {
    const users = getUsers();
    
    users[username] = { 
        password: password, 
        role: "user", 
        name: name,
        lastname: lastname
    };
    
    const saved = saveUsers(users);
    
    if (!saved) {
        return { success: false, message: "Error al guardar el usuario." };
    }
    
    // Inicializar datos del usuario
    initializeUserData(username);
    
    return { success: true };
}

export function successfulLogin(username, role) {
    try {
        // Guardar sesión
        sessionStorage.setItem("currentUser", username);
        sessionStorage.setItem("userRole", role);
        
        // Verificar que se guardó correctamente
        const savedUser = sessionStorage.getItem("currentUser");
        console.log("✅ Sesión guardada:", savedUser);

        // Redirigir después de breve delay para mejor UX
        setTimeout(() => {
            console.log("🔄 Redirigiendo a index.html");
            window.location.href = "index.html";
        }, 1000);

    } catch (error) {
        console.error('❌ Error in successful login:', error);
        throw new Error("Error al iniciar sesión");
    }
}