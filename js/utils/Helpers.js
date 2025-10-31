export function showFriendlyError(error) {
    const errorElement = document.createElement('div');
    errorElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 20px;
    `;
    errorElement.innerHTML = `
        <h2 style="color: #ff6b6b; margin-bottom: 20px;">Error al cargar la aplicación</h2>
        <p style="margin-bottom: 10px;">${error.message || 'Error desconocido'}</p>
        <p style="margin-bottom: 30px; opacity: 0.8;">Por favor, recarga la página o contacta al soporte.</p>
        <button onclick="window.location.reload()" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        ">Reintentar</button>
        <button onclick="window.location.href='login.html'" style="
            background: transparent;
            color: #4CAF50;
            border: 1px solid #4CAF50;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-left: 10px;
        ">Volver al Login</button>
    `;
    
    document.body.innerHTML = '';
    document.body.appendChild(errorElement);
}

export function calculateTotal(transactions, type) {
    return transactions
        .filter(t => t.type === type)
        .reduce((sum, t) => sum + t.amount, 0);
}