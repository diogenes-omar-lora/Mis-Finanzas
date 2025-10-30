const fs = require('fs');
const path = require('path');

class CodeProtector {
    constructor() {
        this.jsDir = 'js'; // Carpeta donde están tus JS
        this.outputDir = 'protected'; // Carpeta de salida
    }

    // Verificar si existe un archivo
    fileExists(filePath) {
        try {
            return fs.existsSync(filePath);
        } catch (error) {
            return false;
        }
    }

    // Crear directorio si no existe
    ensureDirectory(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    // Minificar código
    minifyCode(code) {
        return code
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/.*$/gm, '')
            .replace(/\s+/g, ' ')
            .replace(/\s*([=+\-*\/<>!&|^~,;{}()[\]])\s*/g, '$1')
            .trim();
    }

    // Ofuscación manual
    manualObfuscation(inputFile, outputFile) {
        console.log(`🔄 Ofuscando: ${path.basename(inputFile)}...`);
        
        let code = fs.readFileSync(inputFile, 'utf8');
        
        // Reemplazo de nombres de variables y funciones
        const replacements = {
            'FinanceApp': 'Fa',
            'DataManager': 'Dm', 
            'initializeApp': 'ia',
            'handleLogin': 'hl',
            'currentUser': 'cu',
            'localStorage': 'ls',
            'sessionStorage': 'ss',
            'getElementById': 'geb',
            'document': 'doc',
            'window': 'win',
            'console': 'con',
            'alert': 'alt',
            'addEventListener': 'ael',
            'getUsers': 'gu',
            'saveUsers': 'su',
            'getAccounts': 'ga',
            'getTransactions': 'gt',
            'showAlert': 'sa',
            'updateDashboard': 'ud',
            'loadAccountsTable': 'lat',
            'loadTransactionsTable': 'ltt'
        };

        Object.keys(replacements).forEach(key => {
            const regex = new RegExp(key, 'g');
            code = code.replace(regex, replacements[key]);
        });

        // Minificar
        code = this.minifyCode(code);

        // Agregar protección anti-debug
        code = this.addDebugProtection(code);

        fs.writeFileSync(outputFile, code);
        console.log(`✅ Ofuscado: ${path.basename(outputFile)}`);
    }

    // Protección anti-debugging
    addDebugProtection(code) {
        const debugProtection = `
// 🔒 PROTECCIÓN ANTI-DEBUG
(function(){
    var _0x1a2b = function() { return false; };
    setInterval(function() {
        if (_0x1a2b()) {
            while(true) { console.log('🔒'); }
        }
    }, 4000);
    
    // Detectar herramientas de desarrollo
    if (window.console && window.console.firebug) {
        window.location.href = 'about:blank';
    }
    
    // Prevenir acceso F12
    document.onkeydown = function(e) {
        if (e.keyCode == 123) return false;
        if (e.ctrlKey && e.shiftKey && e.keyCode == 73) return false;
        if (e.ctrlKey && e.keyCode == 85) return false;
    };
    
    // Prevenir clic derecho
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
})();
`;
        return debugProtection + '\n' + code;
    }

    // Crear HTML protegido
    createProtectedHTML() {
        const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Finance App - Protected</title>
    <link rel="stylesheet" href="../styles.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
</head>
<body>
    <!-- Contenido de tu aplicación existente -->
    <div id="login-screen">
        <!-- Tus formularios de login/registro -->
    </div>
    
    <div id="app-screen" class="hidden">
        <!-- Tu sidebar, header y contenido -->
    </div>

    <!-- Scripts ofuscados -->
    <script src="login-protected.js"></script>
    <script src="script-protected.js"></script>
    
    <!-- Protección adicional -->
    <script>
        (function(){
            // Detectar consola abierta
            var start = new Date();
            debugger;
            if (new Date() - start > 100) {
                document.body.innerHTML = '<div style="padding: 50px; text-align: center; color: red;"><h1>🔒 Acceso no autorizado</h1></div>';
            }
            
            // Prevenir selección
            document.addEventListener('selectstart', function(e) {
                e.preventDefault();
            });
        })();
    </script>
</body>
</html>`;

        const htmlPath = path.join(this.outputDir, 'index.html');
        fs.writeFileSync(htmlPath, htmlContent);
        console.log('✅ HTML protegido creado: protected/index.html');
    }

    // Copiar archivos necesarios
    copyEssentialFiles() {
        const filesToCopy = ['styles.css'];
        
        filesToCopy.forEach(file => {
            if (this.fileExists(file)) {
                fs.copyFileSync(file, path.join(this.outputDir, file));
                console.log(`✅ Copiado: ${file}`);
            }
        });
    }

    // Ejecutar protección
    run() {
        console.log('🚀 INICIANDO PROTECCIÓN DE CÓDIGO...\n');
        
        // Crear directorio de salida
        this.ensureDirectory(this.outputDir);
        
        // Verificar archivos de entrada
        const loginPath = path.join(this.jsDir, 'login.js');
        const scriptPath = path.join(this.jsDir, 'script.js');
        
        if (!this.fileExists(loginPath)) {
            console.log('❌ Error: No se encuentra js/login.js');
            console.log('📁 Asegúrate de que tus archivos estén en la carpeta js/');
            return;
        }
        
        if (!this.fileExists(scriptPath)) {
            console.log('❌ Error: No se encuentra js/script.js');
            return;
        }

        console.log('📁 Estructura detectada:');
        console.log('   - js/login.js ✓');
        console.log('   - js/script.js ✓');
        console.log('');

        try {
            // Intentar usar javascript-obfuscator si está disponible
            console.log('🛡️  Buscando herramientas de ofuscación...');
            const { execSync } = require('child_process');
            
            try {
                execSync('javascript-obfuscator --version', { stdio: 'pipe' });
                
                // Usar javascript-obfuscator
                console.log('🎯 Usando javascript-obfuscator...');
                const loginOutput = path.join(this.outputDir, 'login-protected.js');
                const scriptOutput = path.join(this.outputDir, 'script-protected.js');
                
                execSync(`javascript-obfuscator "${loginPath}" --output "${loginOutput}" --compact true --control-flow-flattening true`, { stdio: 'inherit' });
                execSync(`javascript-obfuscator "${scriptPath}" --output "${scriptOutput}" --compact true --control-flow-flattening true`, { stdio: 'inherit' });
                
            } catch (toolError) {
                console.log('🔧 Herramienta no disponible, usando ofuscación manual...');
                this.manualObfuscation(loginPath, path.join(this.outputDir, 'login-protected.js'));
                this.manualObfuscation(scriptPath, path.join(this.outputDir, 'script-protected.js'));
            }
            
        } catch (error) {
            console.log('🔧 Usando ofuscación manual...');
            this.manualObfuscation(loginPath, path.join(this.outputDir, 'login-protected.js'));
            this.manualObfuscation(scriptPath, path.join(this.outputDir, 'script-protected.js'));
        }
        
        // Crear HTML y copiar archivos
        this.createProtectedHTML();
        this.copyEssentialFiles();
        
        console.log('\n🎉 PROTECCIÓN COMPLETADA!');
        console.log('📁 Archivos generados en la carpeta "protected/":');
        console.log('   - login-protected.js');
        console.log('   - script-protected.js');
        console.log('   - index.html');
        console.log('   - styles.css (copia)');
        console.log('\n⚠️  INSTRUCCIONES:');
        console.log('   • Abre protected/index.html en tu navegador');
        console.log('   • Para producción, usa los archivos de la carpeta "protected/"');
        console.log('   • Mantén tus archivos originales para desarrollo');
    }
}

// Ejecutar protección
new CodeProtector().run();