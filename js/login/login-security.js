export function protectLogin() {
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
    
    console.log('🔒 Protección activada en login');
}