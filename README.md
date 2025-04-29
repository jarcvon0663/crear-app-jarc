Crear App JARC
Un CLI simple y automatizado para generar proyectos base de aplicaciones móviles utilizando Capacitor, a partir de un proyecto web HTML/CSS/JS existente o uno básico.

🚀 ¿Qué hace?
crear-app-jarc es una herramienta de línea de comandos diseñada para simplificar el proceso inicial de convertir un proyecto web (ubicado en una carpeta www) en una aplicación móvil nativa utilizando Capacitor. Te guía a través de la configuración básica, instala las dependencias necesarias, añade las plataformas nativas (Android/iOS) y sincroniza los plugins seleccionados.

✨ Características
Configuración interactiva (nombre de la app, ID del paquete, plataformas).

Copia automática de tu carpeta www existente o creación de una básica.

Instalación de Capacitor CLI y Core.

Adición de plataformas Android y/o iOS.

Instalación opcional de plugins comunes de Capacitor.

Sincronización inicial del proyecto.

Intento de apertura automática del proyecto en Android Studio o Xcode.

📋 Prerrequisitos
Antes de usar esta herramienta, asegúrate de tener instalado y configurado:

Node.js: Versión 16.0.0 o superior. Puedes descargarlo desde nodejs.org. Incluye npm (Node Package Manager). Asegúrate de que Node.js y npm estén accesibles desde tu terminal (configura las variables de entorno si es necesario).

npm: Viene con Node.js.

Capacitor Prerequisites: Dependiendo de las plataformas que quieras usar, necesitarás configurar tu entorno para el desarrollo nativo. Esto generalmente incluye:

Android:

Android Studio y las herramientas de línea de comandos de Android SDK.

Gradle: Android Studio generalmente instala y gestiona Gradle, pero asegúrate de que esté correctamente configurado y en el PATH si encuentras problemas.

Configura las variables de entorno necesarias para el SDK de Android (ANDROID_SDK_ROOT).

iOS (Solo en macOS):

Xcode y las herramientas de línea de comandos de Xcode.

Consulta la documentación oficial de Capacitor para obtener instrucciones detalladas sobre la configuración del entorno nativo: Capacitor Environment Setup

📦 Instalación
Puedes instalar la herramienta globalmente en tu sistema para usarla desde cualquier directorio:

npm install -g crear-app-jarc


💡 Uso
Abre tu terminal en el directorio donde quieres crear tu nuevo proyecto Capacitor.

Si ya tienes un proyecto web en una carpeta llamada www en este directorio, la herramienta lo copiará. Si no, creará una carpeta www básica con un index.html de ejemplo.

Ejecuta el comando:

crear-app-jarc

Sigue las instrucciones interactivas en la terminal para configurar el nombre de tu aplicación, el ID del paquete y seleccionar las plataformas y plugins.

La herramienta realizará los pasos necesarios (inicializar npm, instalar Capacitor, añadir plataformas, instalar plugins, sincronizar).

Al finalizar, te indicará los próximos pasos, incluyendo cómo navegar al directorio del proyecto y abrirlo en el IDE nativo.

🛠️ Después de la creación
Navega al directorio de tu proyecto: cd tu-nombre-de-app

Realiza los cambios en tu proyecto web dentro de la carpeta www.

Después de hacer cambios en www, sincroniza con las plataformas nativas ejecutando: npx cap sync

Abre el proyecto en Android Studio (npx cap open android) o Xcode (npx cap open ios) para construir, probar y ejecutar en emuladores o dispositivos.

👤 Creador
Esta herramienta fue creada por:

Jeison Arturo Rios Castaño
[LinkedIn](https://www.linkedin.com/in/jeisonrios/)
[Sitio Web](https://www.arturo-rios.com/)

📜 Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
