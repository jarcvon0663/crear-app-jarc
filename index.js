#!/usr/bin/env node

// Importaciones necesarias
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
// Inquirer se requiere directamente, NPM se encargará de instalarlo
const inquirer = require("inquirer");

// --- Variables Globales ---
let appDir = ""; // Directorio de la aplicación a crear

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
    throw error; // Relanza para detener el proceso principal si es necesario
  }
}

/**
 * Crea la estructura de directorios y maneja el proyecto web (www).
 * @param {string} appName - Nombre de la aplicación.
 * @param {string} projectRoot - Directorio raíz donde se ejecuta el script.
 */
function setupProjectDirectory(appName, projectRoot) {
  appDir = path.join(projectRoot, appName);
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
 * Crea una carpeta www con un index.html básico.
 * @param {string} wwwPath - Ruta donde crear la carpeta www.
 * @param {string} appName - Nombre de la aplicación para el título.
 */
function createBasicWww(wwwPath, appName) {
   if (!fs.existsSync(wwwPath)) {
     fs.mkdirSync(wwwPath);
   }
   const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 90vh; text-align: center; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>🚀 ¡Hola desde ${appName}! 🚀</h1>
</body>
</html>`;
   fs.writeFileSync(path.join(wwwPath, "index.html"), htmlContent);
   console.log("📄 Creado archivo www/index.html básico.");
}

// --- Función Principal ---
async function main() {
  console.log("-------------------------------------");
  console.log("🚀 Bienvenido a Crear App JARC 🚀"); // Nombre actualizado
  console.log("    Creado por: Jeison Arturo Rios Castaño");
  console.log("-------------------------------------");

  const projectRoot = process.cwd(); // Guarda el directorio original

  // 1. Recopilar información del usuario
  const respuestas = await inquirer.prompt([
    {
      name: "appName",
      message: "¿Cómo quieres llamar a tu aplicación (nombre del directorio)?",
      default: "mi-app-jarc", // Default actualizado
      validate: (input) => !!input || "El nombre no puede estar vacío.",
    },
    {
        name: "appId",
        message: "¿Cuál será el ID de paquete de tu app (ej: com.miempresa.miapp)?",
        default: (answers) => `com.example.${answers.appName.toLowerCase().replace(/[^a-z0-9]/g, '')}`, // Default más seguro
        validate: (input) => /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)+$/.test(input) || "Formato de ID inválido (ej: com.dominio.app)",
    },
    {
      type: "checkbox",
      name: "platforms",
      message: "¿Qué plataformas nativas quieres agregar?",
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
    console.log("\n🔄 Sincronizando proyecto Capacitor (copiando web assets, actualizando plugins)...");
    runCommand("npx cap sync");

    // 9. Abrir IDE (Opcional y condicional)
    let openedIDE = false;
    if (respuestas.platforms.includes("android")) {
        try {
            console.log("\nIntentando abrir proyecto en Android Studio...");
            runCommand("npx cap open android");
            openedIDE = true;
        } catch(e) {
            console.warn("🟡 No se pudo abrir Android Studio automáticamente. Asegúrate de que esté instalado y configurado en tu PATH, o ábrelo manualmente.");
        }
    }
    // Solo intentar abrir Xcode en macOS si se seleccionó iOS
    if (respuestas.platforms.includes("ios") && process.platform === 'darwin') {
         try {
            console.log("\nIntentando abrir proyecto en Xcode...");
            runCommand("npx cap open ios");
            openedIDE = true;
         } catch(e) {
             console.warn("🟡 No se pudo abrir Xcode automáticamente. Asegúrate de que esté instalado, o ábrelo manualmente.");
         }
    }

    // 10. Mensaje final
    console.log("\n-----------------------------------------");
    console.log("✅ ¡Éxito! Tu proyecto Capacitor ha sido creado.");
    console.log("   Herramienta creada por Jeison Arturo Rios Castaño");
    console.log("   Contacto: https://www.linkedin.com/in/jeisonrios/");
    console.log(`\n➡️ Directorio del proyecto: ${appDir}`); // Muestra la ruta completa
    console.log("\nSiguientes pasos sugeridos:");
    // Sugiere el comando cd con el nombre base del directorio creado
    console.log(`   1. Entra al directorio: cd ${path.basename(appDir)}`);
    if (!openedIDE && respuestas.platforms.includes("android")) {
        console.log(`   2. Abre Android Studio: npx cap open android`);
    }
    if (!openedIDE && respuestas.platforms.includes("ios") && process.platform === 'darwin') {
        console.log(`   2. Abre Xcode: npx cap open ios`);
    }
    console.log(`   3. ¡Empieza a desarrollar tu app en la carpeta 'www'!`);
    console.log("   4. Después de hacer cambios en 'www', ejecuta: npx cap sync");
    console.log("   5. Ejecuta en el emulador/dispositivo desde Android Studio o Xcode.");
    console.log("-----------------------------------------");

  } catch (error) {
    console.error("\n🚨🚨🚨 Ocurrió un error durante la creación del proyecto. 🚨🚨🚨");
    // El error específico ya se mostró en runCommand
    console.error("Revisa los mensajes anteriores para más detalles.");
    process.exit(1); // Salir con código de error
  }
}

// Ejecutar la función principal
main();
