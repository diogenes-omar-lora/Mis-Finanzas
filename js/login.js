// 🔒 PROTECCIÓN BÁSICA
document.addEventListener('DOMContentLoaded', function() {
    // Bloquear clic derecho
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Bloquear F12
    document.addEventListener('keydown', function(e) {
        if (e.keyCode === 123) { // F12
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) { // Ctrl+Shift+I
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.keyCode === 85) { // Ctrl+U
            e.preventDefault();
            return false;
        }
    });
    
    // Bloquear selección
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    console.log('🔒 Protección activada en login');
});
// =============================================
// SISTEMA DE LOGIN COMPATIBLE Y SIMPLIFICADO
// =============================================

document.addEventListener("DOMContentLoaded", function () {
  // Limpiar sesión anterior por seguridad
  sessionStorage.removeItem('currentUser');
  sessionStorage.removeItem('userRole');

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const switchFormLink = document.getElementById("switch-form");
  const switchText = document.getElementById("switch-text");
  const loginError = document.getElementById("login-error");
  const registerError = document.getElementById("register-error");
  const registerSuccess = document.getElementById("register-success");

  // Verificar si ya está autenticado
  const currentUser = sessionStorage.getItem('currentUser');
  if (currentUser) {
    window.location.href = "index.html";
    return;
  }

  // Inicializar usuario admin por defecto si no existe
  initializeDefaultAdmin();

  // Alternar entre login y registro
  switchFormLink.addEventListener("click", function (e) {
    e.preventDefault();
    toggleForms();
  });

  // Manejar el envío del formulario de login
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    handleLogin();
  });

  // Manejar el envío del formulario de registro
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    handleRegister();
  });

  function toggleForms() {
    if (loginForm.classList.contains("active")) {
      // Cambiar a registro
      loginForm.classList.remove("active");
      loginForm.classList.add("hidden");
      registerForm.classList.remove("hidden");
      registerForm.classList.add("active");
      switchText.innerHTML = '¿Ya tienes una cuenta? <a href="#" id="switch-form">Inicia sesión</a>';
    } else {
      // Cambiar a login
      registerForm.classList.remove("active");
      registerForm.classList.add("hidden");
      loginForm.classList.remove("hidden");
      loginForm.classList.add("active");
      switchText.innerHTML = '¿No tienes una cuenta? <a href="#" id="switch-form">Regístrate</a>';
    }
    
    // Limpiar mensajes de error
    clearMessages();
  }

  function clearMessages() {
    loginError.classList.add("hidden");
    registerError.classList.add("hidden");
    registerSuccess.classList.add("hidden");
  }

  function showError(element, message) {
    element.textContent = message;
    element.classList.remove("hidden");
  }

  function showSuccess(message) {
    registerSuccess.textContent = message;
    registerSuccess.classList.remove("hidden");
  }

  function initializeDefaultAdmin() {
    const users = getUsers();
    if (Object.keys(users).length === 0) {
      users["admin"] = {
        password: "admin",
        role: "admin",
        name: "Administrador",
      };
      saveUsers(users);
      
      // Inicializar datos del admin
      initializeUserData('admin');
      console.info("Usuario administrador por defecto creado: admin/admin");
    }
  }

  // =============================================
  // FUNCIONES COMPATIBLES CON LA APLICACIÓN PRINCIPAL
  // =============================================

  function getUsers() {
    try {
      // Primero intentar con formato legacy (compatible)
      const legacyUsers = JSON.parse(localStorage.getItem("financeUsers") || "{}");
      if (Object.keys(legacyUsers).length > 0) {
        return legacyUsers;
      }
      
      // Si no hay usuarios, retornar objeto vacío
      return {};
    } catch (error) {
      console.error("Error loading users:", error);
      return {};
    }
  }

  function saveUsers(users) {
    try {
      // Guardar en formato legacy (compatible con ambos sistemas)
      localStorage.setItem("financeUsers", JSON.stringify(users));
    } catch (error) {
      console.error("Error saving users:", error);
    }
  }

  function initializeUserData(username) {
    try {
      const userKey = `financeData_${username}`;
      
      // Inicializar datos en formato COMPATIBLE (sin encriptación)
      if (!localStorage.getItem(`${userKey}_accounts`)) {
        localStorage.setItem(`${userKey}_accounts`, JSON.stringify([]));
      }
      
      if (!localStorage.getItem(`${userKey}_transactions`)) {
        localStorage.setItem(`${userKey}_transactions`, JSON.stringify([]));
      }
      
      if (!localStorage.getItem(`${userKey}_nextAccountId`)) {
        localStorage.setItem(`${userKey}_nextAccountId`, '1');
      }
      
      if (!localStorage.getItem(`${userKey}_nextTransactionId`)) {
        localStorage.setItem(`${userKey}_nextTransactionId`, '1');
      }

      // Guardar fecha de registro
      const currentDate = new Date().toLocaleDateString('es-ES');
      localStorage.setItem(`userRegDate_${username}`, currentDate);

    } catch (error) {
      console.error("Error initializing user data:", error);
    }
  }

  // =============================================
  // MANEJO DE LOGIN COMPATIBLE
  // =============================================

  function handleLogin() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    // Validaciones básicas
    if (!username || !password) {
      showError(loginError, "Usuario y contraseña son requeridos");
      return;
    }

    try {
      const users = getUsers();

      // Verificar credenciales
      if (users[username] && users[username].password === password) {
        successfulLogin(username, users[username].role);
        return;
      }

      // Credenciales inválidas
      showError(loginError, "Usuario o contraseña incorrectos");

    } catch (error) {
      console.error('Error during login:', error);
      showError(loginError, "Error del sistema. Por favor, intenta nuevamente.");
    }
  }

  function successfulLogin(username, role) {
    try {
      // Guardar sesión de forma segura
      sessionStorage.setItem("currentUser", username);
      sessionStorage.setItem("userRole", role);
      
      // Mostrar feedback visual
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
      submitBtn.disabled = true;

      // Redirigir después de breve delay
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);

    } catch (error) {
      console.error('Error in successful login:', error);
      showError(loginError, "Error al iniciar sesión");
    }
  }

  // =============================================
  // MANEJO DE REGISTRO COMPATIBLE
  // =============================================

  function handleRegister() {
    const username = document.getElementById("new-username").value.trim();
    const password = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Validaciones
    if (!validateRegistration(username, password, confirmPassword)) {
      return;
    }

    try {
      const users = getUsers();

      // Verificar si el usuario ya existe
      if (users[username]) {
        showError(registerError, "El usuario ya existe. Elige otro nombre.");
        return;
      }

      // Crear nuevo usuario
      createNewUser(username, password, users);
      
    } catch (error) {
      console.error('Error during registration:', error);
      showError(registerError, "Error del sistema. Por favor, intenta nuevamente.");
    }
  }

  function validateRegistration(username, password, confirmPassword) {
    // Validar usuario
    if (username.length < 3 || username.length > 20) {
      showError(registerError, "El usuario debe tener entre 3 y 20 caracteres.");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      showError(registerError, "Solo se permiten letras, números y guiones bajos.");
      return false;
    }

    // Validar contraseña
    if (password.length < 4) {
      showError(registerError, "La contraseña debe tener al menos 4 caracteres.");
      return false;
    }

    // Verificar que las contraseñas coincidan
    if (password !== confirmPassword) {
      showError(registerError, "Las contraseñas no coinciden.");
      return false;
    }

    return true;
  }

  function createNewUser(username, password, users) {
    // Guardar el nuevo usuario
    users[username] = { 
      password: password, 
      role: "user", 
      name: username 
    };
    
    saveUsers(users);
    
    // Inicializar datos del usuario
    initializeUserData(username);

    // Mostrar mensaje de éxito
    showSuccess("¡Usuario registrado exitosamente! Redirigiendo al login...");
    registerError.classList.add("hidden");

    // Limpiar formulario
    registerForm.reset();

    // Cambiar a login después de 2 segundos
    setTimeout(() => {
      toggleForms();
      registerSuccess.classList.add("hidden");
      
      // Autorellenar el usuario en el login
      document.getElementById("username").value = username;
      document.getElementById("password").focus();
      
    }, 2000);
  }
});

// Prevenir acceso no autorizado vía consola
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  console.log('%c🔒 Sistema de Login Seguro', 'color: green; font-size: 14px; font-weight: bold;');
}