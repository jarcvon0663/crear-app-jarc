#!/usr/bin/env node

// Importaciones necesarias
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
// Inquirer se requiere directamente, NPM se encargará de instalarlo
const inquirer = require("inquirer");

// --- Variables Globales ---
// appDir ya no es global para evitar problemas si se ejecutan comandos de actualización/apertura
// sin haber creado un proyecto previamente en la misma ejecución.
// La ruta del proyecto se determinará en el momento de ejecutar el comando.

// --- Funciones Auxiliares ---

/**
 * Ejecuta un comando de forma síncrona en el shell, mostrando la salida.
 * Incluye manejo básico de errores.
 * @param {string} command - El comando a ejecutar.
 * @param {string} cwd - El directorio de trabajo actual para el comando (opcional).
 */
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`\n$: ${command}`); // Muestra el comando
    execSync(command, { stdio: "inherit", cwd }); // Ejecuta y muestra salida
  } catch (error) {
    console.error(`\n❌ Error ejecutando el comando: ${command}`);
    console.error(error.message);
    // No relanzamos el error aquí para los comandos de actualización/apertura,
    // ya que podrían ejecutarse en directorios no válidos y queremos mostrar un mensaje útil.
    // Sin embargo, para el flujo de creación principal, sí se relanza.
    if (command.includes("npx cap init") || command.includes("npm init")) {
       throw error; // Relanza solo si es un comando crítico de inicialización/creación
    }
    // Para otros comandos (sync, open), simplemente mostramos el error y no detenemos el script abruptamente.
    // Esto permite que el usuario vea el error y sepa que necesita estar en el directorio correcto.
    console.error("\n💡 Asegúrate de estar en el directorio raíz de tu proyecto JARC.");
  }
}

/**
 * Crea la estructura de directorios y maneja el proyecto web (www).
 * @param {string} appName - Nombre de la aplicación.
 * @param {string} projectRoot - Directorio raíz donde se ejecuta el script.
 */
function setupProjectDirectory(appName, projectRoot) {
  const appDir = path.join(projectRoot, appName);
  console.log(`\nCreando directorio del proyecto en: ${appDir}`);

  if (fs.existsSync(appDir)) {
    console.warn(`⚠️ El directorio '${appName}' ya existe. Se continuará dentro de él.`);
  } else {
    fs.mkdirSync(appDir, { recursive: true });
  }

  // Cambia al directorio de la app para los siguientes comandos
  process.chdir(appDir);
  console.log(`Cambiado al directorio: ${process.cwd()}`);

  // --- Manejo de la carpeta www ---
  const wwwDest = path.join(appDir, "www");
  // Busca 'www' en el directorio donde se ejecutó el script originalmente
  const wwwSourcePotential = path.join(projectRoot, "www");

  if (fs.existsSync(wwwSourcePotential) && fs.lstatSync(wwwSourcePotential).isDirectory()) {
    console.log("\n📦 Copiando proyecto web existente desde 'www'...");
      // Usa fs.cpSync si está disponible (Node.js >= 16.7)
      if (fs.cpSync) {
        fs.cpSync(wwwSourcePotential, wwwDest, { recursive: true });
    } else {
        // Fallback para versiones anteriores de Node.js
        console.warn("⚠️ fs.cpSync no disponible (necesita Node.js >= 16.7). Creando www básico.");
        createBasicWww(wwwDest, appName);
    }
  } else {
    console.log("\n🌐 No se encontró 'www' en el directorio de origen. Creando 'www' básico...");
    createBasicWww(wwwDest, appName);
  }
}

/**
 * Crea una carpeta www con un index.html, css y js básicos.
 * @param {string} wwwPath - Ruta donde crear la carpeta www.
 * @param {string} appName - Nombre de la aplicación para el título.
 */
function createBasicWww(wwwPath, appName) {
    if (!fs.existsSync(wwwPath)) {
      fs.mkdirSync(wwwPath);
    }

    // Crear carpetas css y js
    const cssPath = path.join(wwwPath, "css");
    const jsPath = path.join(wwwPath, "js");
    if (!fs.existsSync(cssPath)) {
        fs.mkdirSync(cssPath);
        console.log("📂 Creada carpeta www/css.");
    }
    if (!fs.existsSync(jsPath)) {
        fs.mkdirSync(jsPath);
        console.log("📂 Creada carpeta www/js.");
    }

    // Contenido del archivo CSS
    const cssContent = `
body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
    color: #333;
    line-height: 1.6;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    text-align: center;
}

.container {
    max-width: 800px;
    margin: 20px;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
}

h1 {
    color: #007bff; /* Azul */
    margin-bottom: 10px;
}

h2 {
    color: #555;
    margin-top: 0;
    font-size: 1.2em;
}

p {
    margin-bottom: 15px;
}

a {
    color: #007bff;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

.logo {
    width: 100px; /* Ajusta según necesites */
    margin-bottom: 20px;
}

/* Estilos responsivos básicos */
@media (max-width: 600px) {
    .container {
        margin: 10px;
        padding: 15px;
    }

    h1 {
        font-size: 1.8em;
    }

    h2 {
        font-size: 1em;
    }
}
`;
    fs.writeFileSync(path.join(cssPath, "style.css"), cssContent);
    console.log("📄 Creado archivo www/css/style.css básico.");

    // Contenido del archivo JS
    const jsContent = `
console.log('¡JARC iniciado!');

// Puedes añadir aquí tu lógica JavaScript
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado y parseado.');
    // Ejemplo: Cambiar el texto de un elemento
    // const welcomeElement = document.getElementById('welcome-message');
    // if (welcomeElement) {
    //     welcomeElement.textContent = '¡Bienvenido a tu App JARCapp!';
    // }
});
`;
    fs.writeFileSync(path.join(jsPath, "main.js"), jsContent);
    console.log("📄 Creado archivo www/js/main.js básico.");

    // Contenido del archivo HTML
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <link rel="stylesheet" href="./css/style.css">
</head>
<body>
  <div class="container">
    <h1>¡Bienvenido a tu App ${appName}!</h1>
    <h2>Generada con JARC CLI</h2>

    <p>
      Este es el punto de partida para tu aplicación móvil híbrida, construida con JARC, Capacitor y tu tecnología web favorita (HTML, CSS, JavaScript, o frameworks como Angular, React, Vue, etc.).
    </p>

    <p>
      Edita los archivos en la carpeta <code>www</code> para empezar a construir tu interfaz y lógica.
    </p>

    <p>
      Recuerda sincronizar tus cambios web con los proyectos nativos:
      <br><code>jarc update android</code>
      <br><code>jarc update ios</code>
    </p>

    <p>
      Y abre los proyectos nativos en sus respectivos IDEs:
      <br><code>jarc open android</code>
      <br><code>jarc open ios</code>
    </p>

    <p>
      ¡Feliz desarrollo!
    </p>

    <p>
      Framework creado por: Jeison Arturo Rios Castaño
      <br>Contacto: <a href="https://www.linkedin.com/in/jeisonrios/" target="_blank">LinkedIn</a>
    </p>
  </div>

  <script src="./js/main.js"></script>
</body>
</html>`;
    fs.writeFileSync(path.join(wwwPath, "index.html"), htmlContent);
    console.log("📄 Creado archivo www/index.html mejorado.");
}

/**
 * Ejecuta el comando de sincronización de Capacitor para una plataforma específica.
 * @param {string} platform - La plataforma a sincronizar ('android' o 'ios').
 */
function syncProject(platform) {
    console.log(`\n🔄 Sincronizando proyecto Capacitor para ${platform}...`);
    runCommand(`npx cap sync ${platform}`);
}

/**
 * Ejecuta el comando para abrir el proyecto en el IDE nativo.
 * @param {string} platform - La plataforma a abrir ('android' o 'ios').
 */
function openProject(platform) {
    console.log(`\nAbrindo proyecto en el IDE nativo para ${platform}...`);
     // Advertencia para usuarios no-macOS si intentan abrir iOS
    if (platform === 'ios' && process.platform !== 'darwin') {
        console.warn("\n⚠️ Advertencia: Para abrir y trabajar con el proyecto iOS necesitas macOS y Xcode.");
    }
    // Utilizamos try/catch aquí también para manejar posibles errores al abrir el IDE
    try {
        runCommand(`npx cap open ${platform}`);
        return true; // Indica que el comando de apertura se ejecutó
    } catch (e) {
        // El error ya se muestra en runCommand, solo retornamos false
        return false; // Indica que hubo un error al intentar abrir
    }
}


// --- Función Principal ---
async function main() {
  console.log("-------------------------------------");
  console.log("🚀 Bienvenido a JARC 🚀");
  console.log("     Creado por: Jeison Arturo Rios Castaño");
  console.log("-------------------------------------");

  const projectRoot = process.cwd(); // Guarda el directorio original

  // 1. Recopilar información del usuario
  const respuestas = await inquirer.prompt([
    {
      name: "appName",
      message: "¿Cómo quieres llamar a tu aplicación móvil (nombre del directorio)?",
      default: "mi-app-jarc", // Default
      validate: (input) => !!input || "El nombre no puede estar vacío.",
    },
    {
        name: "appId",
        message: "¿Cuál será el ID de paquete de tu app (ej: com.miempresa.miapp)?",
        default: (answers) => `com.example.${answers.appName.toLowerCase().replace(/[^a-z0-9]/g, '')}`, // Default
        validate: (input) => /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)+$/.test(input) || "Formato de ID inválido (ej: com.dominio.app)",
    },
    {
      type: "checkbox",
      name: "platforms",
      message: "¿Qué plataformas nativas quieres agregar? recuerda que si seleccionas iOS, debes estar utilizando un equipo Mac con Xcode instalado",
      choices: ["android", "ios"],
      default: ["android"] // Preseleccionar Android es común
    },
    {
      type: "checkbox",
      name: "plugins",
      message: "¿Quieres agregar algunos plugins comunes de Capacitor?",
      choices: [
        { name: "Camera (Cámara)", value: "@capacitor/camera" },
        { name: "Filesystem (Sistema de archivos)", value: "@capacitor/filesystem" },
        { name: "Geolocation (Geolocalización)", value: "@capacitor/geolocation" },
        { name: "Splash Screen (Pantalla de inicio)", value: "@capacitor/splash-screen" },
        { name: "Status Bar (Barra de estado)", value: "@capacitor/status-bar" },
        // Puedes añadir más si quieres
      ],
    },
  ]);

  try {
    // 2. Crear estructura de directorios y manejar 'www'
    setupProjectDirectory(respuestas.appName, projectRoot);

    // 3. Inicializar NPM dentro del nuevo directorio
    console.log("\nInitializing NPM...");
    runCommand("npm init -y");

    // 4. Instalar dependencias de Capacitor
    console.log("\nInstalando Capacitor CLI y Core...");
    runCommand("npm install @capacitor/cli @capacitor/core");

    // 5. Inicializar Capacitor
    console.log("\nInicializando Capacitor en el proyecto...");
    // Usar las respuestas del usuario para nombre y ID
    runCommand(`npx cap init "${respuestas.appName}" "${respuestas.appId}" --web-dir="www"`);

    // 6. Agregar plataformas nativas
    if (respuestas.platforms.includes("android")) {
      console.log("\n🤖 Agregando plataforma Android...");
      runCommand("npm install @capacitor/android");
      runCommand("npx cap add android");
    }
    if (respuestas.platforms.includes("ios")) {
        // Advertencia para usuarios no-macOS
        if (process.platform !== 'darwin') {
            console.warn("\n⚠️ Advertencia: Para construir y ejecutar apps iOS necesitas macOS y Xcode.");
        }
      console.log("\n🍏 Agregando plataforma iOS...");
      runCommand("npm install @capacitor/ios");
      runCommand("npx cap add ios");
    }

    // 7. Instalar plugins seleccionados
    if (respuestas.plugins && respuestas.plugins.length > 0) {
      console.log("\n🔌 Instalando plugins seleccionados...");
      const pluginInstallCommand = `npm install ${respuestas.plugins.join(" ")}`;
      runCommand(pluginInstallCommand);
    }

    // 8. Sincronizar el proyecto Capacitor
    console.log("\n🔄 Sincronizando proyecto JARC (copiando web assets, actualizando plugins)...");
    runCommand("npx cap sync"); // Sincroniza todas las plataformas agregadas

    // 9. Abrir IDE (Opcional y condicional) - Intentamos abrir automáticamente
    let openedIDE = false;
    if (respuestas.platforms.includes("android")) {
        console.log("\nIntentando abrir proyecto en Android Studio...");
        openedIDE = openProject("android"); // openProject retorna true/false
        if (!openedIDE) {
             console.warn("🟡 No se pudo abrir Android Studio automáticamente. Asegúrate de que esté instalado y configurado en tu PATH, o ábrelo manualmente con 'jarc open android'.");
        }
    }
    // Solo intentar abrir Xcode en macOS si se seleccionó iOS
    if (respuestas.platforms.includes("ios") && process.platform === 'darwin') {
         console.log("\nIntentando abrir proyecto en Xcode...");
         const openedIOS = openProject("ios");
         if (openedIOS) {
             openedIDE = true; // Si se abrió iOS, consideramos que se abrió un IDE
         } else {
             console.warn("🟡 No se pudo abrir Xcode automáticamente. Asegúrate de que esté instalado, o ábrelo manualmente con 'jarc open ios'.");
         }
    }


    // 10. Mensaje final
    console.log("\n-----------------------------------------");
    console.log("✅ ¡Tu proyecto JARC ha sido creado exitosamente!.");
    console.log("     Framework creado por Jeison Arturo Rios Castaño");
    console.log("     Contacto: https://www.linkedin.com/in/jeisonrios/");
     // appDir ya no es accesible aquí, usamos el nombre de la app
    console.log(`\n➡️ Directorio del proyecto: ./${respuestas.appName}`);
    console.log("\nSiguientes pasos sugeridos:");
    // Sugiere el comando cd con el nombre base del directorio creado
    console.log(`   1. Entra al directorio: cd ${respuestas.appName}`);

    // Ajusta los mensajes de apertura de IDEs basándose en si se intentó abrir automáticamente
    if (!openedIDE) {
        if (respuestas.platforms.includes("android")) {
             console.log(`   2. Para abrir en Android Studio manualmente: jarc open`);
        }
        if (respuestas.platforms.includes("ios") && process.platform === 'darwin') {
             console.log(`   ${respuestas.platforms.includes("android") ? '3' : '2'}. Para abrir en Xcode (en macOS) manualmente: jarc open ios`);
        }
    } else {
         console.log(`   2. Se intentó abrir el proyecto en el IDE nativo. Si no se abrió, usa 'jarc open [android|ios]'.`);
    }


    console.log(`   ${openedIDE ? '3' : (respuestas.platforms.length > 0 ? (respuestas.platforms.includes("android") && respuestas.platforms.includes("ios") ? '4' : '3') : '2')}. Para sincronizar cambios web: jarc update [android|ios]`);
    console.log(`   ${openedIDE ? '4' : (respuestas.platforms.length > 0 ? (respuestas.platforms.includes("android") && respuestas.platforms.includes("ios") ? '5' : '4') : '3')}. ¡Empieza a desarrollar tu app en la carpeta 'www'!`);
    console.log(`   ${openedIDE ? '5' : (respuestas.platforms.length > 0 ? (respuestas.platforms.includes("android") && respuestas.platforms.includes("ios") ? '6' : '5') : '4')}. Ejecuta en el emulador/dispositivo desde Android Studio o Xcode.`);
    console.log("-----------------------------------------");

  } catch (error) {
    console.error("\n🚨🚨🚨 Ocurrió un error durante la creación del proyecto. 🚨🚨🚨");
    // El error específico ya se mostró en runCommand
    console.error("Revisa los mensajes anteriores para más detalles.");
    process.exit(1); // Salir con código de error
  }
}

// --- Lógica para manejar argumentos de línea de comandos ---

const args = process.argv.slice(2); // Obtiene los argumentos después del nombre del script

// Verifica si hay argumentos y si el primer argumento es un comando conocido
if (args.length > 0) {
    const command = args[0].toLowerCase();
    const platform = args[1] ? args[1].toLowerCase() : null; // Segundo argumento para la plataforma

    // Asegúrate de estar en el directorio raíz del proyecto antes de ejecutar comandos de Capacitor
    // Esto asume que el script se ejecuta desde dentro del directorio del proyecto.
    // Si el usuario lo ejecuta desde fuera, necesitará navegar primero.
    // Podríamos añadir lógica para detectar si es un proyecto Capacitor, pero por ahora asumimos que sí.
    const projectRoot = process.cwd(); // Directorio actual

    switch (command) {
        case 'update':
            if (platform === 'ios') {
                syncProject('ios');
            } else {
                // Por defecto, sincroniza Android si no se especifica o si se especifica 'android'
                syncProject('android');
            }
            break;
        case 'open':
             if (platform === 'ios') {
                openProject('ios');
            } else {
                // Por defecto, abre Android Studio si no se especifica o si se especifica 'android'
                openProject('android');
            }
            break;
        default:
            // Si el comando no es reconocido, ejecuta el flujo de creación principal
            console.log(`\nComando no reconocido: '${command}'. Iniciando flujo de creación de proyecto.`);
            main(); // Ejecuta la función principal de creación
            break;
    }
} else {
    // Si no hay argumentos, ejecuta el flujo de creación principal
    main();
}

