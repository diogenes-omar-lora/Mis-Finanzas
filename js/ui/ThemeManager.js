export function applyTheme(theme) {
    console.log('🎨 Aplicando tema:', theme);
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.querySelector('.theme-icon');

    if (theme === 'dark') {
        themeIcon.textContent = '☀️';
        themeIcon.title = 'Cambiar a modo claro';
    } else {
        themeIcon.textContent = '🌙';
        themeIcon.title = 'Cambiar a modo oscuro';
    }
}