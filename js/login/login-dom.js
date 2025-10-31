import { validateLogin, validateRegistration, createNewUser, successfulLogin, initializeDefaultAdmin } from './login-auth.js';

let currentForm = 'login';

// Elementos del DOM
let loginForm, registerForm, switchFormLink, switchText, loginError, registerError, registerErrorText, registerSuccess;
let newPassword, confirmPassword, passwordMatch, passwordMismatch;
let googleLoginBtn, googleRegisterBtn;

export function initializeLoginDOM() {
    // Obtener elementos del DOM
    loginForm = document.getElementById("login-form");
    registerForm = document.getElementById("register-form");
    switchFormLink = document.getElementById("switch-form");
    switchText = document.getElementById("switch-text");
    loginError = document.getElementById("login-error");
    registerError = document.getElementById("register-error");
    registerErrorText = document.getElementById("register-error-text");
    registerSuccess = document.getElementById("register-success");
    
    // Elementos de validación de contraseña
    newPassword = document.getElementById("new-password");
    confirmPassword = document.getElementById("confirm-password");
    passwordMatch = document.getElementById("password-match");
    passwordMismatch = document.getElementById("password-mismatch");

    // Botones de Google
    googleLoginBtn = document.getElementById("google-login");
    googleRegisterBtn = document.getElementById("google-register");

    // Inicializar usuario admin por defecto si no existe
    initializeDefaultAdmin();

    // Asignar event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Event Listener para el enlace de cambio de formulario
    if (switchFormLink) {
        switchFormLink.addEventListener("click", function (e) {
            e.preventDefault();
            toggleForms();
        });
    }

    // Event Listeners para formularios
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            handleLogin();
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();
            handleRegister();
        });
    }

    // Validación en tiempo real de contraseñas
    if (confirmPassword && newPassword) {
        confirmPassword.addEventListener('input', validatePasswords);
        newPassword.addEventListener('input', validatePasswords);
    }

    // Botones de Google
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener("click", handleGoogleAuth);
    }

    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener("click", handleGoogleAuth);
    }
}

function handleGoogleAuth(event) {
    const button = event.currentTarget;
    const originalHTML = button.innerHTML;
    
    // Animación de carga
    button.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 1.2rem;"></i>';
    button.style.pointerEvents = 'none';
    
    // Simular proceso de autenticación
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.pointerEvents = 'auto';
        showTemporaryMessage('🔒 Autenticación con Google estará disponible próximamente', 'info');
    }, 1500);
}

function showTemporaryMessage(message, type = 'info') {
    // Crear elemento de mensaje temporal
    const tempMessage = document.createElement('div');
    tempMessage.className = `alert alert-${type === 'info' ? 'success' : 'error'}`;
    tempMessage.innerHTML = `
        <i class="fas fa-${type === 'info' ? 'info-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Insertar antes del form-switch
    const formSwitch = document.querySelector('.form-switch');
    if (formSwitch) {
        formSwitch.parentNode.insertBefore(tempMessage, formSwitch);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            if (tempMessage.parentNode) {
                tempMessage.remove();
            }
        }, 3000);
    }
}

function validatePasswords() {
    if (!newPassword || !confirmPassword) return;
    
    const password = newPassword.value;
    const confirm = confirmPassword.value;
    
    if (password && confirm) {
        if (password === confirm) {
            if (passwordMatch) {
                passwordMatch.classList.remove('hidden');
                if (passwordMismatch) passwordMismatch.classList.add('hidden');
            }
        } else {
            if (passwordMatch) passwordMatch.classList.add('hidden');
            if (passwordMismatch) passwordMismatch.classList.remove('hidden');
        }
    } else {
        if (passwordMatch) passwordMatch.classList.add('hidden');
        if (passwordMismatch) passwordMismatch.classList.add('hidden');
    }
}

function toggleForms() {
    if (currentForm === 'login') {
        switchToRegister();
    } else {
        switchToLogin();
    }
}

function switchToRegister() {
    currentForm = 'register';
    
    // Cambiar visibilidad de formularios
    if (loginForm && registerForm) {
        loginForm.classList.remove("active");
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
        registerForm.classList.add("active");
    }
    
    // Actualizar texto del enlace
    if (switchText) {
        switchText.innerHTML = '¿Ya tienes una cuenta? <a href="#" id="switch-form" class="switch-link">Inicia sesión</a>';
        
        // Re-asignar event listener al nuevo enlace
        const newSwitchLink = document.getElementById('switch-form');
        if (newSwitchLink) {
            newSwitchLink.addEventListener('click', function(e) {
                e.preventDefault();
                switchToLogin();
            });
        }
    }
    
    // Limpiar mensajes y validaciones
    clearMessages();
    clearPasswordValidation();
    
    // Enfocar el primer campo del registro
    setTimeout(() => {
        const firstNameField = document.getElementById("new-name");
        if (firstNameField) firstNameField.focus();
    }, 100);
}

function switchToLogin() {
    currentForm = 'login';
    
    // Cambiar visibilidad de formularios
    if (registerForm && loginForm) {
        registerForm.classList.remove("active");
        registerForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
        loginForm.classList.add("active");
    }
    
    // Actualizar texto del enlace
    if (switchText) {
        switchText.innerHTML = '¿No tienes una cuenta? <a href="#" id="switch-form" class="switch-link">Regístrate</a>';
        
        // Re-asignar event listener al nuevo enlace
        const newSwitchLink = document.getElementById('switch-form');
        if (newSwitchLink) {
            newSwitchLink.addEventListener('click', function(e) {
                e.preventDefault();
                switchToRegister();
            });
        }
    }
    
    // Limpiar mensajes
    clearMessages();
    clearPasswordValidation();
    
    // Enfocar el campo de usuario en login
    setTimeout(() => {
        const usernameField = document.getElementById("username");
        if (usernameField) usernameField.focus();
    }, 100);
}

function clearMessages() {
    if (loginError) loginError.classList.add("hidden");
    if (registerError) registerError.classList.add("hidden");
    if (registerSuccess) registerSuccess.classList.add("hidden");
}

function clearPasswordValidation() {
    if (passwordMatch) passwordMatch.classList.add('hidden');
    if (passwordMismatch) passwordMismatch.classList.add('hidden');
}

function showError(element, message) {
    if (!element) return;
    
    if (element === registerError && registerErrorText) {
        registerErrorText.textContent = message;
    }
    element.classList.remove("hidden");
}

function showSuccess(message) {
    if (!registerSuccess) return;
    
    const successSpan = registerSuccess.querySelector('span');
    if (successSpan) {
        successSpan.textContent = message;
    }
    registerSuccess.classList.remove("hidden");
}

function handleLogin() {
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value;

    console.log("🔐 Intentando login para usuario:", username);

    // Validaciones básicas
    if (!username || !password) {
        showError(loginError, "Usuario y contraseña son requeridos");
        return;
    }

    try {
        const result = validateLogin(username, password);
        
        if (result.success) {
            console.log("✅ Credenciales válidas para:", username);
            
            // Mostrar feedback visual mejorado
            const submitBtn = document.querySelector('#login-form button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
            submitBtn.disabled = true;
            
            successfulLogin(username, result.role);
        } else {
            console.log("❌ Credenciales inválidas para:", username);
            showError(loginError, result.message);
        }

    } catch (error) {
        console.error('❌ Error during login:', error);
        showError(loginError, "Error del sistema. Por favor, intenta nuevamente.");
    }
}

function handleRegister() {
    const name = document.getElementById("new-name")?.value.trim();
    const lastname = document.getElementById("new-lastname")?.value.trim();
    const username = document.getElementById("new-username")?.value.trim();
    const password = document.getElementById("new-password")?.value;
    const confirmPassword = document.getElementById("confirm-password")?.value;

    console.log("📝 Procesando registro para:", username);

    // Validaciones
    const validationResult = validateRegistration(name, lastname, username, password, confirmPassword);
    if (!validationResult.success) {
        showError(registerError, validationResult.message);
        return;
    }

    try {
        // Mostrar loading en el botón
        const submitBtn = document.querySelector('#register-form button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando cuenta...';
        submitBtn.disabled = true;

        console.log("👤 Creando nuevo usuario:", username);

        // Crear nuevo usuario
        const creationResult = createNewUser(name, lastname, username, password);
        
        if (!creationResult.success) {
            showError(registerError, creationResult.message);
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            return;
        }

        // Mostrar mensaje de éxito
        showSuccess("¡Cuenta creada exitosamente! Redirigiendo al login...");
        if (registerError) registerError.classList.add("hidden");

        console.log("✅ Usuario creado exitosamente:", username);

        // Cambiar a login después de 2 segundos
        setTimeout(() => {
            // Restaurar botón
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            
            switchToLogin();
            if (registerSuccess) registerSuccess.classList.add("hidden");
            
            // Autorellenar el usuario en el login
            const usernameField = document.getElementById("username");
            if (usernameField) {
                usernameField.value = username;
                const passwordField = document.getElementById("password");
                if (passwordField) passwordField.focus();
            }
            
        }, 2000);
        
    } catch (error) {
        console.error('❌ Error during registration:', error);
        showError(registerError, "Error del sistema. Por favor, intenta nuevamente.");
    }
}