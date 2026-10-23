# Estudio de contenido de IA web

[English](README.md) · Español

Siete propuestas de contenido para sebastian-gomez.com, cada una con tres demos HTML originales, y una charla de WebMCP en inglés y español con 16 diapositivas y un plan de 30 minutos.
La revisión abarca las 20 comunicaciones del CSV y las 62 URL distintas normalizadas del archivo.

## Abrir el trabajo

```sh
npm run serve
```

Abre [la galería](http://localhost:8080/?lang=es), [la charla](http://localhost:8080/slides/index.html?lang=es) o [los tres bocetos iniciales](http://localhost:8080/slides/mockups.html?lang=es).
El servidor Python solo escucha en la interfaz local.
El puerto 8081 proporciona un segundo origen para la prueba de políticas del iframe.

La presentación también se abre directamente desde `slides/index.html?lang=es` sin conexión a internet.
Todos los scripts, fuentes y logotipos son locales.
El demo de iframe necesita el servidor de dos orígenes; la IA nativa necesita un contexto seguro, navegador, dispositivo y modelo compatibles.

## Idiomas

Usa el selector **English / Español** de cualquier página o añade `?lang=en` / `?lang=es`.
El idioma predeterminado es inglés cuando no se especifica uno.
Los enlaces conservan el idioma entre galería, demos, diapositivas, presentador y prueba de iframe.
Al cambiar de idioma se conserva la diapositiva y el paso actuales en la dirección.
La revisión editorial, el inventario de enlaces, los juicios del CSV y esta guía tienen versiones completas en ambos idiomas.
Los identificadores técnicos, las fuentes externas originales, las licencias y la evidencia estructurada conservan su formato original.
Los ejemplos nativos que declaran entradas o salidas en inglés se mantienen identificados como tales; cambiar la interfaz no modifica el contrato probado del modelo.
Los demos de traducción y detección conservan intencionadamente sus muestras multilingües.

## Qué leer

- [Recomendaciones editoriales y revisión de cada tema](research/topic-review.es.md)
- [Cada enlace y su estado como evidencia](research/link-inventory.es.md)
- [Auditoría estructurada y evidencia de exportación](research/source-audit.json)
- [Juicios de cada fila del CSV](research/row-review.es.json)
- [CSV de revisión en español](output/spreadsheet/reviewed-topics.es.csv)
- [Resultados de verificación del navegador](review/verification.json)
- [Verificación de ambos idiomas](review/language-verification.json)
- [Verificación del código de las diapositivas](review/slide-code-verification.json)
- [Vista de todas las diapositivas](review/deck-contact-sheet-es.jpg)

La recomendación principal es **Tu web también tiene herramientas**, un artículo y una charla sobre reutilizar las acciones habituales de una página para agentes.
Los siguientes capítulos cubren ciclo de vida, recuperación semántica, medición de rendimiento, recetas de prompts, experiencia multilingüe y decisiones con una vía explícita de revisión.
La última propuesta es un experimento conceptual con Prompt API documentada; no llama ni inventa una Decisions API.

## Configuración de IA nativa

Ninguna página crea modelos automáticamente ni usa un modelo remoto de respaldo.
Las acciones nativas están identificadas.
El navegador puede descargar un modelo cuando el visitante solicita el procesamiento nativo.
Las referencias por coincidencia de palabras, las reglas y los ensayos de transmisión se distinguen de la inferencia nativa.
Consulta la documentación enlazada en cada demo antes de cambiar flags o prometer soporte.
La investigación refleja la revisión del 23 de octubre de 2026; los contratos experimentales pueden cambiar.

| Función | Configuración revisada y limitaciones |
| --- | --- |
| Prompt y Summarizer | Detección en ejecución y `availability()`; requieren navegador, equipo, almacenamiento y modelo compatibles. |
| WebMCP | Flag local `chrome://flags/#enable-webmcp-testing` u origin trial documentado; los demos usan `document.modelContext`. |
| SemanticEmbedder | Prueba de Canary de escritorio posterior a 153.0.7979.0 con `chrome://flags/#semantic-embedder-api`; las indicaciones de tarea van en `embed()`. |
| Preferencia de Summarizer | Prueba experta con `chrome://flags/#summarizer-api-performance-preference`; speed tiene una configuración restringida de salida en inglés. |
| Proofreader | Prueba con `chrome://flags/#proofreader-api`; la versión experta revisada solo admite inglés. |
| Gemma 4 | Prueba de Canary con `chrome://flags/#gemma4-for-built-in-ai`; es distinta de integrar LiteRT/WebGPU desde el sitio. |
| MTP | Guía revisada: 156.0.8064.0+ y `chrome://flags/#on-device-model-speculative-decoding` o `#built-in-ai-mtp`; Prompt requiere `samplingMode: "most-predictable"`. |
| Translator y LanguageDetector | Comprobar la API y el par de idiomas; el soporte y las descargas dependen del dispositivo. |

Lupa de latencia registra preparación real, espera al primer fragmento, duración total, caracteres y caracteres por segundo.
No equipara fragmentos con tokens ni afirma detectar si MTP está activo.
Registra manualmente dispositivo, navegador, flags, entrada y muestreo; compara ejecuciones repetidas equivalentes reiniciando el navegador entre configuraciones.
No se inventan porcentajes de mejora.

## Controles y personalización de la charla

Seis diapositivas incluyen extractos de JavaScript sobre registro, esquemas, errores recuperables, revisión explícita, anotaciones de depuración y detección de soporte.
Las líneas resaltadas avanzan con el clicker y se sincronizan con el guion del presentador.
Cada ejemplo enlaza al demo funcional y al código completo.
Los extractos omiten la configuración que los rodea; las notas identifican los helpers y los demos completos incluyen validación y cancelación.

- **Derecha / Abajo / Espacio / Intro / PageDown:** siguiente paso y después siguiente diapositiva.
- **Izquierda / Arriba / PageUp / Retroceso:** paso o diapositiva anterior.
- **Home / End:** primera o última diapositiva.
- **P:** abrir la ventana del presentador.
- **F:** pantalla completa.
- **C:** mostrar u ocultar controles.
- **Clic en el fondo:** avanzar sin interceptar enlaces ni controles.

La dirección guarda la diapositiva y el paso, por ejemplo `#3.2`.
Al recargar se restauran ambos.
El presentador muestra diapositiva actual, siguiente, guion con paso resaltado, hora, tiempo transcurrido, tiempo restante y controles de pausa y reinicio.
Mantén abierta la presentación mientras usas el presentador.
El modo de archivo local usa mensajes con la ventana que lo abrió además de un canal; el servidor es preferible para ventanas independientes.

Las preguntas de estructura, idioma y duración se hicieron por separado antes de ampliar la charla.
La propuesta de trabajo es una charla práctica de 30 minutos con tres demos, sin afirmar que estructura o duración fueron confirmadas por el usuario.
Ambos idiomas están disponibles con guiones completos.
La ciudad sigue pendiente y se identifica como `Ciudad por confirmar` o `City to be confirmed`.
Configura ciudad e idioma en la dirección:

```text
slides/index.html?lang=es&city=Bogot%C3%A1&minutes=30
```

Bogotá es un ejemplo de configuración, no una afirmación sobre la sede.
Cambiar `minutes` escala el plan del reloj; para acortar o ampliar el contenido hay que editar la charla.
Usa un valor distinto de `session` al ejecutar varias charlas simultáneamente.

- `slides/theme.css`: colores, tipografía, marca, paneles y logotipo del evento.
- `slides/deck.css`: escala, composición, transiciones y controles.
- `slides/talk.js` y `slides/full-talk.js`: contenido y guion original en español, con tiempos.
- `locales/talk.en.json`: contenido y guion completos en inglés.
- `slides/talk-i18n.js`: selección del contenido según el idioma.
- `slides/deck.js`: teclado, dirección y comunicación con el presentador.
- `slides/presenter.*`: interfaz del presentador y reloj del plan.

Se recreó la apariencia tras inspeccionar el PDF de la plantilla DevFest 2026 proporcionada.
Los titulares Google Sans Bold y subtítulos Roboto Mono Light se almacenan localmente.
El logotipo se extrajo de la plantilla y los colores siguen sus especificaciones.
La procedencia está en [las fuentes de diseño](slides/assets/SOURCES.es.md).

## Verificación y regeneración

```sh
npm install
npm test
node scripts/verify-slide-code.mjs
node scripts/verify-languages.mjs
```

Las pruebas usan Playwright con Google Chrome instalado y Chrome Canary para verificar WebMCP nativo.
Pueden iniciar su servidor local si hace falta.
Canary habilita funciones experimentales únicamente en un perfil temporal de prueba.
Se comprueban los 21 demos en escritorio y móvil, interacciones, política entre orígenes, liberación de sesiones, navegación, sincronización del presentador, reloj, fuentes sin conexión y movimiento reducido.
Las pruebas de adaptadores usan dobles de contrato explícitos.
No demuestran calidad de modelos, rendimiento real del dispositivo, descargas correctas, calidad semántica ni comportamiento de un agente externo.
El JSON distingue la disponibilidad real y el descubrimiento nativo de WebMCP.
También se comprueban ambos idiomas, las notas, el cambio sin conexión, los enlaces y la composición.

Los scripts preservan intacto el CSV original.
`scripts/research.py`, `scripts/export-guides.py` y `scripts/repair-evidence.py` recopilan la evidencia y exportan las guías.
Edita los catálogos de `locales/` y ejecuta `python3 scripts/build-locales.py`.
Ejecuta `python3 scripts/build-pages.py` y `python3 scripts/build-research.py` para regenerar demos y documentos.
Ejecuta `uv run --with pandas python scripts/export-review-csv.py` para validar y exportar ambos CSV de revisión.
Ejecuta `python3 scripts/package-deliverables.py` para reconstruir el ZIP portátil bilingüe.

No se ha desplegado el sitio ni enviado correos, formularios o inscripciones a pruebas.
