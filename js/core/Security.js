export function protectApp() {
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        alert('⛔ Acción no permitida');
        return false;
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.keyCode === 123) {
            e.preventDefault();
            alert('⛔ Herramientas de desarrollo desactivadas');
            return false;
        }
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
    });
    
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        return false;
    });
    
    console.log('🔒 Protección activada en app');
}