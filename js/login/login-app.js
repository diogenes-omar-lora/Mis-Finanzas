import { protectLogin } from './login-security.js';
import { initializeLoginDOM } from './login-dom.js';

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si ya está autenticado
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = "index.html";
        return;
    }

    // Aplicar protección
    protectLogin();
    
    // Inicializar interfaz de login
    initializeLoginDOM();
});

// Prevenir acceso no autorizado vía consola
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.log('%c🔒 Sistema de Login Seguro', 'color: green; font-size: 14px; font-weight: bold;');
}