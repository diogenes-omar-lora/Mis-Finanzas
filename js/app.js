import { protectApp } from './core/Security.js';
import { showFriendlyError } from './utils/Helpers.js';
import FinanceApp from './core/FinanceApp.js';

// ✅ Hacer app global para que los event handlers en HTML funcionen
let app;

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        protectApp();
        app = new FinanceApp();
        window.app = app; // ✅ Esto es crucial para los onclick en HTML
    } catch (error) {
        console.error('Error initializing application:', error);
        showFriendlyError(error);
    }
});

export { app };