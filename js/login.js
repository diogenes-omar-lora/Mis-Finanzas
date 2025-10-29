document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const switchFormLink = document.getElementById("switch-form");
  const switchText = document.getElementById("switch-text");
  const loginError = document.getElementById("login-error");
  const registerError = document.getElementById("register-error");
  const registerSuccess = document.getElementById("register-success");

  // Alternar entre login y registro
  switchFormLink.addEventListener("click", function (e) {
    e.preventDefault();
    if (loginForm.classList.contains("active")) {
      // Cambiar a registro
      loginForm.classList.remove("active");
      loginForm.classList.add("hidden");
      registerForm.classList.remove("hidden");
      registerForm.classList.add("active");
      switchText.innerHTML =
        '¿Ya tienes una cuenta? <a href="#" id="switch-form">Inicia sesión</a>';
    } else {
      // Cambiar a login
      registerForm.classList.remove("active");
      registerForm.classList.add("hidden");
      loginForm.classList.remove("hidden");
      loginForm.classList.add("active");
      switchText.innerHTML =
        '¿No tienes una cuenta? <a href="#" id="switch-form">Regístrate</a>';
    }
    // Limpiar mensajes de error
    loginError.classList.add("hidden");
    registerError.classList.add("hidden");
    registerSuccess.classList.add("hidden");
  });

  // Manejar el envío del formulario de login
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Obtener usuarios del localStorage (si existen)
    const users = JSON.parse(localStorage.getItem("financeUsers")) || {};

    // Debug: mostrar usuarios disponibles (no sensibles en producción)
    console.debug("Usuarios disponibles en localStorage:", Object.keys(users));

    // Verificar credenciales
    if (users[username] && users[username].password === password) {
      sessionStorage.setItem("currentUser", username);
      sessionStorage.setItem("userRole", users[username].role); // Guardar el rol
      window.location.href = "index.html";
      return;
    }

    // Si no existen usuarios registrados, crear un usuario por defecto (admin/admin)
    if (Object.keys(users).length === 0) {
      users["admin"] = {
        password: "admin",
        role: "admin",
        name: "Administrador",
      };
      localStorage.setItem("financeUsers", JSON.stringify(users));
      console.info("Se creó usuario por defecto: admin / admin");
    }

    // Intento de login con usuario por defecto si se ingresó admin/admin
    if (username === "admin" && password === "admin") {
      sessionStorage.setItem("currentUser", "admin");
      // Asegurar que el rol quede guardado para que la UI muestre las opciones de admin
      sessionStorage.setItem("userRole", "admin");
      console.info(
        "Login con usuario por defecto -> redirigiendo a index.html"
      );
      window.location.href = "index.html";
      return;
    }

    // Si llegamos aquí, credenciales inválidas
    loginError.classList.remove("hidden");
  });

  // Manejar el envío del formulario de registro
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      registerError.textContent = "Las contraseñas no coinciden.";
      registerError.classList.remove("hidden");
      return;
    }

    // Obtener usuarios del localStorage
    const users = JSON.parse(localStorage.getItem("financeUsers")) || {};

    // Verificar si el usuario ya existe
    if (users[username]) {
      registerError.textContent = "El usuario ya existe.";
      registerError.classList.remove("hidden");
      return;
    }

    // Guardar el nuevo usuario (rol por defecto: user)
    users[username] = { password: password, role: "user", name: username };
    localStorage.setItem("financeUsers", JSON.stringify(users));

  // Inicializar datos financieros para el nuevo usuario: sin cuentas, sin transacciones, IDs desde 1
  const userKey = `financeData_${username}`;
  localStorage.setItem(`${userKey}_accounts`, JSON.stringify([]));
  localStorage.setItem(`${userKey}_transactions`, JSON.stringify([]));
  localStorage.setItem(`${userKey}_nextAccountId`, '1');
  localStorage.setItem(`${userKey}_nextTransactionId`, '1');

    // Guardar fecha de registro
    const currentDate = new Date().toLocaleDateString('es-ES');
    localStorage.setItem(`userRegDate_${username}`, currentDate);

    // Mostrar mensaje de éxito
    registerSuccess.classList.remove("hidden");
    registerError.classList.add("hidden");

    // Limpiar el formulario
    registerForm.reset();

    // Opcional: cambiar a login después de 2 segundos
    setTimeout(() => {
      registerForm.classList.remove("active");
      registerForm.classList.add("hidden");
      loginForm.classList.remove("hidden");
      loginForm.classList.add("active");
      switchText.innerHTML =
        '¿No tienes una cuenta? <a href="#" id="switch-form">Regístrate</a>';
      registerSuccess.classList.add("hidden");
    }, 2000);
  });
});
