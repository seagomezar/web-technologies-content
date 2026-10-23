# Investigación de contenido y recomendaciones editoriales

[English](topic-review.md) · Español

Revisión del 23 de octubre de 2026 basada en el CSV proporcionado, la documentación accesible de Google, los repositorios y el sitio web.

## Alcance y calidad de la evidencia

El CSV contiene seis filas de metadatos, la cabecera en la línea 7 y 20 comunicaciones en las líneas 8 a 27.
Las fechas y los asuntos describen el historial, sin demostrar el soporte actual de cada API.
Se intentó acceder a las 62 URL distintas normalizadas del archivo, 17 fuentes complementarias y cuatro exportaciones de Google Docs.
Se clasificaron las acciones de correo y el perfil interno de Google sin enviar mensajes ni intentar acceder a sistemas internos.
Los cuatro documentos de Google se leyeron mediante exportación de texto después de recibir únicamente la estructura del editor en HTML.
Los 20 enlaces individuales de Google Groups devolvieron estructuras de grupo sin los mensajes; el CSV sigue siendo la evidencia de sus cuerpos.
Chromium Dash y la incidencia de idiomas también devolvieron estructuras de aplicación, por lo que sus contenidos técnicos y las afirmaciones exactas de versión permanecen sin verificar.
Los formularios y las páginas de eventos se revisaron como contexto sin enviar nada.
Los resultados por enlace están en [el inventario](link-inventory.es.md) y [la auditoría original](source-audit.json).
Las citas, los títulos de fuentes externas, las licencias y el CSV original conservan su idioma original.

## Aportación al sitio existente

Se leyeron la página principal, la segunda página del archivo y los artículos completos sobre modelos pequeños y BrowserDJ.
Cubren inferencia en el navegador, RAG léxico en memoria, WebGPU/LiteRT, interfaces procedurales, patrones de agentes y liderazgo de ingeniería.
Esta revisión de páginas recientes no pretende demostrar que todo el archivo carezca de cobertura sobre los temas propuestos.

- [Modelos pequeños y buen diseño](https://www.sebastian-gomez.com/en/post/modelos-pequenos-buen-diseno-ia-navegador-litert-lm): continuar con recuperación semántica observable y revisión de fuentes.
- [Arquitectura de BrowserDJ](https://www.sebastian-gomez.com/en/post/el-borde-es-inevitable-browserdj-ai-gemma-antigravity): continuar con latencia medida y diferencias entre modelos administrados por el navegador y por el sitio.
- [Artículos recientes](https://www.sebastian-gomez.com/en) y [segunda página del archivo](https://www.sebastian-gomez.com/en/posts/page/2): conectar herramientas prácticas y recetas evaluadas con la preferencia existente por la arquitectura frente a la terminología.

Conviene sustituir las afirmaciones absolutas sobre eliminar alucinaciones, garantizar privacidad o responder instantáneamente por condiciones y evidencia medida.
El uso de fuentes reduce algunos fallos, pero comprobar identificadores de citas no demuestra respaldo factual.
Los demos de evidencia y medición hacen visibles esos límites.

## Contenido recomendado, en orden de publicación

El orden refleja un juicio editorial sobre novedad, utilidad para el sitio y solidez de la evidencia accesible.
No es una previsión medida de SEO ni una afirmación sobre volumen de búsquedas.
Las propuestas 1 a 6 son de implementación; la 7 es conceptual, pendiente de un contrato verificable de Decisions API.


### 1.
Tu web también tiene herramientas

**Enfoque:** Convierte un sitio personal en un colaborador útil: un agente puede encontrar una charla, preparar una ruta de lectura y proponer una acción mientras el visitante ve cada cambio.

**Valor para el sitio:** Añade la interacción con agentes a tu trabajo sobre IA en el navegador.
La ruta de lectura podría convertirse en una función real de tu sitio.

**Formato:** Artículo de arquitectura + charla práctica de 30 minutos + lista reutilizable para diseñar herramientas

**Estado:** Plataforma experimental; publicar como laboratorio práctico

Estructura sugerida:

1.
Empieza por el objetivo del visitante: encontrar tres lecturas antes de una charla.
2.
Conecta una herramienta estructurada a la misma función que usa un botón.
3.
Valida los argumentos, devuelve errores útiles y mantén visible el estado.
4.
Explica consequentialHint y debugging sin tratar las anotaciones como autorización.

Tres demos HTML:

- [Ruta de lectura](../demos/reading-route.html?lang=es): Construye una ruta de lectura personal con una herramienta de página con tipos definidos.
  Prueba: Añade un artículo desde la consola de herramientas y elimínalo con la interfaz habitual.
  Enseña: Un agente y una persona comparten el estado de la aplicación.
- [El último clic](../demos/consent-cart.html?lang=es): Un carrito de entradas donde una herramienta prepara la acción y una persona la completa.
  Prueba: Prepara una solicitud de entradas, recházala y después prepara y confirma otra.
  Enseña: Una anotación de consecuencias describe el comportamiento; el código de la aplicación sigue imponiendo la revisión.
- [Observatorio de herramientas](../demos/tool-observatory.html?lang=es): Inspecciona esquemas, anotaciones y registros de errores en una pequeña caja negra.
  Prueba: Filtra las herramientas de depuración, ejecuta JSON válido y prueba argumentos mal formados.
  Enseña: Las herramientas necesitan errores útiles, una audiencia clara y un comportamiento observable.

Trazabilidad del CSV: líneas 14, 23, 27.

Fuentes primarias: [fuente 1](https://developer.chrome.com/docs/ai/webmcp), [fuente 2](https://github.com/GoogleChromeLabs/webmcp-extension), [fuente 3](https://github.com/webmachinelearning/webmcp-types), [fuente 4](https://github.com/webmachinelearning/webmcp/pull/253), [fuente 5](https://github.com/webmachinelearning/webmcp/issues/176).

### 2.
La IA empieza antes del primer token

**Enfoque:** La función abarca todo el recorrido: detectar capacidades, decidir la descarga, mostrar el progreso, cancelar y ofrecer una interfaz útil cuando falta el modelo.

**Valor para el sitio:** Convierte la tesis de tu artículo sobre modelos pequeños en una guía para producción que se puede copiar y probar.

**Formato:** Guía de implementación + galería de estados de error + utilidad reutilizable para el ciclo de vida

**Estado:** APIs actuales con restricciones de dispositivo y navegador

Estructura sugerida:

1.
Detecta las APIs sin iniciar una descarga.
2.
Solicita crear el modelo a partir de una acción del usuario.
3.
Transmite respuestas, cancela y libera las sesiones.
4.
Prueba la política entre orígenes y publica instrucciones de configuración precisas.

Tres demos HTML:

- [Recepción de modelos](../demos/model-concierge.html?lang=es): Un tablero de salidas para las capacidades de IA local.
  Prueba: Inspecciona el navegador real y prepara un modelo de forma explícita.
  Enseña: La disponibilidad es una máquina de estados, no un booleano.
- [Jardín de respuestas](../demos/stream-garden.html?lang=es): Haz crecer una respuesta fragmento a fragmento y detenla con Cancelar.
  Prueba: Ejecuta el ensayo identificado, cancélalo a mitad y prueba la transmisión nativa.
  Enseña: La cancelación y la liberación de sesiones forman parte de la experiencia del usuario.
- [Pasaporte del iframe](../demos/iframe-passport.html?lang=es): Dos orígenes locales muestran si una función de IA integrada tiene permiso.
  Prueba: Carga el marco del segundo origen con y sin delegación de language-model.
  Enseña: Que una API funcione en la página principal no garantiza que funcione dentro de un marco.

Trazabilidad del CSV: líneas 16, 18, 19, 21, 24, 25, 26.

Fuentes primarias: [fuente 1](https://developer.chrome.com/docs/ai/built-in-ai-dos-donts), [fuente 2](https://developer.chrome.com/docs/ai/prompt-api), [fuente 3](https://developer.chrome.com/docs/ai/session-management), [fuente 4](https://github.com/webmachinelearning/proofreader-api/pull/14).

### 3.
Buscar por significado, responder con evidencia

**Enfoque:** Amplía tu artículo de RAG en memoria con recuperación observable: compara palabras y significado, inspecciona los vecinos y muestra qué evidencia puede usar una respuesta.

**Valor para el sitio:** Una continuación concreta de tu artículo de RAG en el navegador.
La búsqueda podría incorporarse al archivo de tu sitio.

**Formato:** Artículo técnico en profundidad + cuaderno con búsqueda + ejemplos de evaluación de recuperación

**Estado:** Prueba para desarrolladores de SemanticEmbedder; configuración de Canary de escritorio

Estructura sugerida:

1.
Construye un índice en memoria con embeddings de tipo retrieval-document.
2.
Genera embeddings de consultas con retrieval-query y compara con similitud coseno.
3.
Mantén la coherencia del espacio de embeddings y reconstruye el índice cuando cambie el modelo.
4.
Muestra los fragmentos de las fuentes y abstente de responder cuando la evidencia sea débil.

Tres demos HTML:

- [Brújula del significado](../demos/meaning-compass.html?lang=es): Busca en un pequeño archivo de artículos mediante una pregunta.
  Prueba: Compara la referencia identificada de coincidencia de palabras con embeddings nativos reales.
  Enseña: Usa las indicaciones de tarea de recuperación y muestra la clasificación.
- [Constelación de duplicados](../demos/duplicate-constellation.html?lang=es): Mueve un umbral de similitud y observa cómo se conectan las notas relacionadas.
  Prueba: Añade una nota, compara palabras coincidentes y calcula similitudes semánticas nativas.
  Enseña: La similitud es continua y los umbrales necesitan evidencia.
- [Ventana de evidencia](../demos/evidence-window.html?lang=es): Revisa los fragmentos que recibirá la respuesta antes de consultar al modelo.
  Prueba: Recupera fuentes, elige el umbral de evidencia y solicita un borrador con citas.
  Enseña: La calidad de la recuperación y la de la respuesta necesitan evaluaciones separadas.

Trazabilidad del CSV: líneas 12.

Fuentes primarias: [fuente 1](https://docs.google.com/document/d/1ZB6MW8UDczm4V6ej5MorZWqFCYWwLhUs5HKxEdjP35c/edit), [fuente 2](https://github.com/explainers-by-googlers/embedding-api).

### 4.
Más rápido, ¿en qué parte?

**Enfoque:** Separa la preparación del modelo, el primer fragmento, la generación total y la calidad.
Reproduce el experimento antes de repetir el porcentaje de un anuncio.

**Valor para el sitio:** Añade mediciones reproducibles a las afirmaciones sobre BrowserDJ y los modelos locales, con un laboratorio de referencia para el sitio.

**Formato:** Artículo de medición + resultados descargables + protocolo experimental

**Estado:** Gemma 4, MTP y las preferencias de rendimiento están en pruebas para desarrolladores

Estructura sugerida:

1.
Registra el dispositivo, el navegador, los flags, el modo de muestreo y la entrada.
2.
Separa la preparación, la espera hasta el primer fragmento y la generación total.
3.
Compara configuraciones equivalentes reiniciando el navegador entre ellas.
4.
Revisa la calidad y las medianas; no equipares la preferencia speed con MTP.

Tres demos HTML:

- [Lupa de latencia](../demos/latency-lens.html?lang=es): Una caja negra para la preparación del modelo, el primer fragmento y la respuesta completa.
  Prueba: Ejecuta pruebas nativas reales, exporta JSON y compara configuraciones identificadas del navegador.
  Enseña: Un único tiempo total no explica una experiencia más rápida.
- [Cocina de preferencias](../demos/preference-kitchen.html?lang=es): Un mezclador de opciones que explica las diferencias entre las recetas speed y capability.
  Prueba: Prueba una receta speed incompatible, corrígela y ejecuta Summarizer nativo.
  Enseña: El modelo experto speed tiene opciones restringidas y no usa MTP.
- [Mochila de contexto](../demos/context-backpack.html?lang=es): Organiza las notas dentro del presupuesto real de contexto de la sesión.
  Prueba: Selecciona notas y mide su uso real del contexto cuando la API esté disponible.
  Enseña: Consulta la capacidad de contexto en ejecución en lugar de fijar límites históricos.

Trazabilidad del CSV: líneas 10, 11, 13, 17, 20, 22, 25.

Fuentes primarias: [fuente 1](https://docs.google.com/document/d/1g7bv9LHSqFWqeQUM2C6EQ5PiZ8UWTz8UibxnlD4ipDE/edit), [fuente 2](https://docs.google.com/document/d/1rpaV4la7WtpLr4Ueb0NttJVETlVL_5a9TNHsrBMBkWk/edit), [fuente 3](https://docs.google.com/document/d/1RnSlXRAy8ffdbehvCcH7msBwmTvsxHJJQiwcw374tMw/edit), [fuente 4](https://developer.chrome.com/docs/ai/prompt-api).

### 5.
De APIs rígidas a recetas que puedes evaluar

**Enfoque:** Construye una pequeña capa de recetas con entradas explícitas, contratos de salida y evaluación.
El autor conserva el control de los hechos y el estilo.

**Valor para el sitio:** Amplía tu artículo sobre patrones y jerga con un ejemplo práctico de cuándo se justifica una pequeña abstracción.

**Formato:** Guía de migración + fichas de recetas + criterios de revisión de calidad

**Estado:** Diseño de migración; la retirada sigue siendo una propuesta del archivo

Estructura sugerida:

1.
Describe la consulta del archivo como una propuesta, sin afirmar que la retirada se haya completado.
2.
Compara APIs de tareas, constructores de prompts y recetas de la aplicación.
3.
Separa los hechos de las preferencias de estilo.
4.
Evalúa los borradores mediante comprobaciones observables y revisión humana.

Tres demos HTML:

- [Mezcla de voz](../demos/voice-remix.html?lang=es): Convierte una elección de estilo en una receta de escritura que se pueda inspeccionar.
  Prueba: Ajusta el tono y la audiencia, inspecciona el prompt y genera un borrador nativo.
  Enseña: El estilo definido por la aplicación es más claro cuando la receta está visible.
- [Cocina de novedades](../demos/release-kitchen.html?lang=es): Convierte tres cambios verificados en una nota de versión breve con comprobaciones.
  Prueba: Edita los hechos, elige un formato, genera el borrador e inspecciona los identificadores que faltan.
  Enseña: Un borrador fluido también debe contrastarse con los hechos de entrada.
- [Duelo de recetas](../demos/recipe-arena.html?lang=es): Compara un resumen de tarea y un prompt propio sobre la misma fuente.
  Prueba: Ejecuta ambas opciones nativas y evalúa sus resultados.
  Enseña: Evalúa las abstracciones con la misma tarea y evidencia.

Trazabilidad del CSV: líneas 8, 9, 15.

Fuentes primarias: [fuente 1](https://developer.chrome.com/docs/ai/task-api-polyfill), [fuente 2](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/writer-rewriter-polyfills), [fuente 3](https://github.com/GoogleChromeLabs/web-ai-demos/blob/main/built-in-ai-task-apis-polyfills/summarizer-prompt-builder.js), [fuente 4](https://developer.chrome.com/docs/ai/prompt-api).

### 6.
Tu usuario no debería cambiar de idioma

**Enfoque:** Una experiencia de soporte bilingüe que mantiene visible el mensaje original y deja al autor controlar la traducción y las correcciones.

**Valor para el sitio:** Conecta a tu audiencia hispanohablante con tu trabajo en productos de comunicación mediante un flujo útil.

**Formato:** Artículo de ingeniería de producto + miniaplicaciones de soporte bilingüe

**Estado:** Detector y Translator documentados; Proofreader en prueba para desarrolladores

Estructura sugerida:

1.
Conserva el texto original y haz de la traducción una acción explícita.
2.
Detecta el idioma y muestra la incertidumbre en textos breves o mixtos.
3.
Comprueba la disponibilidad del par de idiomas antes de prometer una traducción.
4.
Mantén la corrección en inglés para la versión experta revisada y revisa los cambios.

Tres demos HTML:

- [Relevo bilingüe](../demos/bilingual-relay.html?lang=es): Una conversación de soporte en dos idiomas con el original siempre visible.
  Prueba: Traduce un mensaje del español al inglés o invierte el par de idiomas.
  Enseña: La traducción debe preservar el contexto y el control del autor.
- [Radar de idiomas](../demos/language-radar.html?lang=es): Un panel de estimaciones para mensajes que mezclan idiomas.
  Prueba: Compara mensajes largos, cortos y mixtos con el detector nativo.
  Enseña: La confianza necesita interpretación; no es una garantía.
- [El bolígrafo rojo](../demos/proofread-review.html?lang=es): Revisa las sugerencias del corrector local antes de aplicarlas.
  Prueba: Corrige un texto en inglés, inspecciona la propuesta y acéptala o recházala.
  Enseña: Las correcciones son decisión del autor.

Trazabilidad del CSV: líneas 10, 18, 26.

Fuentes primarias: [fuente 1](https://developer.chrome.com/docs/ai/language-detection), [fuente 2](https://developer.chrome.com/docs/ai/translator-api), [fuente 3](https://developer.chrome.com/docs/ai/proofreader-api), [fuente 4](https://docs.google.com/document/d/1RnSlXRAy8ffdbehvCcH7msBwmTvsxHJJQiwcw374tMw/edit).

### 7.
Un if semántico necesita una salida de emergencia

**Enfoque:** Usa la intención de prototipar del archivo como pregunta: ¿cómo debe actuar una aplicación cuando el modelo no puede tomar una decisión categórica fiable?

**Valor para el sitio:** Añade a tu serie de patrones un ensayo basado en evidencia con comportamiento medible, sin anunciar una API cuyo contrato invocable no está verificado.

**Formato:** Artículo exploratorio + panel de revisión de decisiones + pequeño conjunto de evaluación

**Estado:** Exploración con Prompt API; no se afirma implementar Decisions API

Estructura sugerida:

1.
Distingue una intención de prototipar de una API publicada.
2.
Usa la salida estructurada de Prompt API para el experimento actual.
3.
Separa el juicio del modelo de las reglas de negocio deterministas.
4.
Evalúa las decisiones incorrectas y las abstenciones; no llames confianza calibrada a una puntuación del modelo.

Tres demos HTML:

- [Central de incidencias](../demos/issue-router.html?lang=es): Clasifica una incidencia de soporte con una vía explícita de revisión.
  Prueba: Compara una referencia transparente por palabras clave con una decisión estructurada del modelo nativo.
  Enseña: Abstenerse es una salida válida.
- [Esclusa de comentarios](../demos/comment-airlock.html?lang=es): Revisa una decisión de moderación sin publicar ni eliminar nada.
  Prueba: Cambia el comentario y las reglas de escalado e inspecciona la clasificación propuesta.
  Enseña: La recomendación del modelo y la acción de la aplicación son pasos separados.
- [Laboratorio de abstención](../demos/abstention-lab.html?lang=es): Compara cobertura y error con un conjunto etiquetado de mensajes ambiguos.
  Prueba: Ajusta el umbral de diferencia entre palabras, inspecciona los errores y evalúa las decisiones nativas.
  Enseña: Mide la cobertura selectiva y los errores aceptados sin inventar confianza.

Trazabilidad del CSV: líneas 15.

Fuentes primarias: [fuente 1](https://developer.chrome.com/docs/ai/prompt-api), [fuente 2](https://developer.chrome.com/docs/ai/task-api-polyfill).

## Revisión de cada comunicación

| Línea CSV | Fecha | Tema | Conclusión | Propuesta |
| --- | --- | --- | --- | --- |
| 8 | 2026-09-22 | Consulta sobre Writer/Rewriter | Propuesta corroborada; enlace del archivo incorrecto | recipes |
| 9 | 2026-09-23 | APIs de tareas como recetas de prompts | Explicación de diseño corroborada | recipes |
| 10 | 2026-06-01 | Modelos expertos de Summarizer y Proofreader | Contenido de la guía leído; restricciones de la prueba | performance, languages |
| 11 | 2026-06-04 | Limitaciones de la preferencia speed | Contenido de la guía leído; restricción importante | performance |
| 12 | 2026-07-15 | Embeddings de texto en el dispositivo | Guía y explicación leídas; prueba para desarrolladores | retrieval |
| 13 | 2026-10-20 | Predicción de múltiples tokens de Gemma 4 | Contenido de la guía leído; el porcentaje del correo no es una medición | performance |
| 14 | 2026-10-15 | Herramientas de desarrollo de WebMCP | Documentación y repositorios enlazados revisados | webmcp |
| 15 | 2026-10-05 | Decisions / Semantic If y recordatorio de retirada | Solo intención de prototipar; sin contrato invocable verificado | decisions, recipes |
| 16 | 2025-04-01 | Nuevos puntos de entrada estáticos | Migración histórica; contratos actuales confirmados | lifecycle |
| 17 | 2026-08-25 | Prueba para desarrolladores de Gemma 4 | Contenido de la guía leído; sin afirmar publicación general | performance |
| 18 | 2025-09-17 | Comentarios sobre origin trials, Proofreader, Chromebook Plus y cumbre | Conjunto histórico de anuncios; actualizar cada estado | languages, lifecycle |
| 19 | 2026-07-28 | Buenas prácticas de IA integrada | Guía pública de experiencia de usuario revisada | lifecycle |
| 20 | 2024-12-04 | Ventana histórica de contexto de 6144 tokens | Dato histórico; no es una constante actual | performance |
| 21 | 2025-07-10 | IA en iframes de otro origen | Patrón actual de delegación confirmado | lifecycle |
| 22 | 2024-11-28 | Retirada de la restricción histórica de 1024 tokens por prompt | Cambio histórico; el contexto de sesión sigue limitado | performance |
| 23 | 2026-09-22 | Anotación debugging de WebMCP | Cambio de especificación integrado verificado; versión exacta sin confirmar | webmcp |
| 24 | 2025-05-22 | Tipos de TypeScript actualizados | Anuncio histórico; paquete mantenido verificado | lifecycle |
| 25 | 2025-01-30 | Depuración de modelos locales | Destino de diagnóstico actual corroborado | lifecycle, performance |
| 26 | 2024-11-29 | Alternativa histórica para idiomas no probados | Solución histórica; reemplazar en contenido nuevo | languages, lifecycle |
| 27 | 2026-09-04 | Anotación consequentialHint de WebMCP | Contrato actual de tipos y discusión revisados | webmcp |

### Línea CSV 8: Consulta sobre Writer/Rewriter

**Conclusión:** Propuesta corroborada; enlace del archivo incorrecto.
El documento enlazado es la guía de modelos expertos, no la consulta.
El repositorio oficial de polyfills describe por separado la retirada propuesta.
No se puede anunciar una retirada completada ni inferir una decisión definitiva a partir de la fecha límite de consulta.

Evidencia: [fuente 1](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/writer-rewriter-polyfills), [fuente 2](https://developer.chrome.com/docs/ai/task-api-polyfill).

### Línea CSV 9: APIs de tareas como recetas de prompts

**Conclusión:** Explicación de diseño corroborada.
El artículo oficial sobre polyfills y su constructor de prompts permiten comparar prompts propios y abstracciones de tareas.
Un polyfill no demuestra por sí solo una calidad equivalente ni disponibilidad universal en los navegadores.

Evidencia: [fuente 1](https://developer.chrome.com/docs/ai/task-api-polyfill), [fuente 2](https://github.com/GoogleChromeLabs/web-ai-demos/blob/main/built-in-ai-task-apis-polyfills/summarizer-prompt-builder.js).

### Línea CSV 10: Modelos expertos de Summarizer y Proofreader

**Conclusión:** Contenido de la guía leído; restricciones de la prueba.
La guía EPP documenta la versión especializada.
Proofreader no tiene una opción preference y su versión experta solo admite inglés.
Esta prueba debe distinguirse de la API Summarizer habitual.

Evidencia: [fuente 1](https://docs.google.com/document/d/1RnSlXRAy8ffdbehvCcH7msBwmTvsxHJJQiwcw374tMw/edit), [fuente 2](https://developer.chrome.com/docs/ai/proofreader-api).

### Línea CSV 11: Limitaciones de la preferencia speed

**Conclusión:** Contenido de la guía leído; restricción importante.
La guía limita la salida de speed al inglés, los tipos key-points/tldr y las longitudes short/medium; markdown se comporta como texto plano.
Las combinaciones incompatibles pueden informar unavailable o fallar al crear la sesión.

Evidencia: [fuente 1](https://docs.google.com/document/d/1RnSlXRAy8ffdbehvCcH7msBwmTvsxHJJQiwcw374tMw/edit).

### Línea CSV 12: Embeddings de texto en el dispositivo

**Conclusión:** Guía y explicación leídas; prueba para desarrolladores.
La guía usa SemanticEmbedder y coloca taskType en embed(), no en create().
La revisión del 31 de julio añade progreso de descarga después de 153.0.7979.0.
El índice debe recalcularse en el mismo espacio; que coincidan las dimensiones no demuestra compatibilidad.

Evidencia: [fuente 1](https://docs.google.com/document/d/1ZB6MW8UDczm4V6ej5MorZWqFCYWwLhUs5HKxEdjP35c/edit), [fuente 2](https://github.com/explainers-by-googlers/embedding-api).

### Línea CSV 13: Predicción de múltiples tokens de Gemma 4

**Conclusión:** Contenido de la guía leído; el porcentaje del correo no es una medición.
La guía del 21 de octubre requiere Canary 156.0.8064.0+ y el flag de MTP.
Prompt necesita samplingMode most-predictable; Summarizer speed usa otro modelo.
Mide por separado la generación con el modelo preparado y la preparación inicial.
El +20–30% del CSV no es un resultado medido aquí.

Evidencia: [fuente 1](https://docs.google.com/document/d/1g7bv9LHSqFWqeQUM2C6EQ5PiZ8UWTz8UibxnlD4ipDE/edit).

### Línea CSV 14: Herramientas de desarrollo de WebMCP

**Conclusión:** Documentación y repositorios enlazados revisados.
La extensión, los tipos y el repositorio de skills respaldan un artículo sobre diseño, exposición e inspección de herramientas.
Ese repositorio es una fuente de investigación, no una instrucción para instalar o ejecutar código.
El modo de servidor local de la extensión puede enviar datos a un modelo alojado; WebMCP no es un modelo en el dispositivo.

Evidencia: [fuente 1](https://developer.chrome.com/docs/ai/webmcp), [fuente 2](https://github.com/GoogleChromeLabs/webmcp-extension), [fuente 3](https://github.com/webmachinelearning/webmcp-types), [fuente 4](https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/webmcp-skills).

### Línea CSV 15: Decisions / Semantic If y recordatorio de retirada

**Conclusión:** Solo intención de prototipar; sin contrato invocable verificado.
El CSV anuncia una exploración y su enlace técnico apunta a polyfills de Writer/Rewriter.
Ninguna fuente revisada proporciona un contrato invocable de Decisions API.
La propuesta se presenta como experimento conceptual con Prompt API, salida estructurada y una vía de abstención.

Evidencia: [fuente 1](https://developer.chrome.com/docs/ai/prompt-api), [fuente 2](https://github.com/GoogleChromeLabs/web-ai-demos/tree/main/writer-rewriter-polyfills).

### Línea CSV 16: Nuevos puntos de entrada estáticos

**Conclusión:** Migración histórica; contratos actuales confirmados.
La guía actual de Prompt usa self.LanguageModel con availability() y create() estáticos.
La migración debe explicarse mediante una utilidad mantenida de detección de capacidades, evitando ejemplos obsoletos de window.ai.

Evidencia: [fuente 1](https://developer.chrome.com/docs/ai/prompt-api).

### Línea CSV 17: Prueba para desarrolladores de Gemma 4

**Conclusión:** Contenido de la guía leído; sin afirmar publicación general.
La guía de agosto especifica Canary 153.0.8009.0+ y un flag.
Hasta 70% es una observación comunicada, no una mejora garantizada.
La guía describe las llamadas a funciones como trabajo futuro.
La inferencia integrada administrada por el navegador es una integración distinta de un modelo LiteRT/WebGPU administrado por el sitio.

Evidencia: [fuente 1](https://docs.google.com/document/d/1rpaV4la7WtpLr4Ueb0NttJVETlVL_5a9TNHsrBMBkWk/edit).

### Línea CSV 18: Comentarios sobre origin trials, Proofreader, Chromebook Plus y cumbre

**Conclusión:** Conjunto histórico de anuncios; actualizar cada estado.
La explicación de origin trials describe la inscripción, no una disponibilidad permanente.
La documentación actual de Proofreader sigue indicando una prueba para desarrolladores.
La cumbre de 2025 no debe anunciarse como próxima ni debe generalizarse el soporte de Chromebook Plus a todos los Chromebook.

Evidencia: [fuente 1](https://developer.chrome.com/docs/web-platform/origin-trials), [fuente 2](https://developer.chrome.com/docs/ai/proofreader-api), [fuente 3](https://developer.chrome.com/docs/ai/prompt-api), [fuente 4](https://rsvp.withgoogle.com/events/web-ai-summit-2025).

### Línea CSV 19: Buenas prácticas de IA integrada

**Conclusión:** Guía pública de experiencia de usuario revisada.
La guía respalda un artículo sobre preparación deliberada, progreso, control del usuario y estados de fallo comprensibles.
Conviene detectar las capacidades en ejecución y conservar una interfaz habitual útil sin sugerir soporte universal de modelos.

Evidencia: [fuente 1](https://developer.chrome.com/docs/ai/built-in-ai-dos-donts).

### Línea CSV 20: Ventana histórica de contexto de 6144 tokens

**Conclusión:** Dato histórico; no es una constante actual.
El correo de 2024 registra un límite de aquella época.
La documentación actual de Prompt expone contextWindow, contextUsage y measureContextUsage.
Debe consultarse la sesión activa en lugar de fijar 6144.

Evidencia: [fuente 1](https://developer.chrome.com/docs/ai/prompt-api).

### Línea CSV 21: IA en iframes de otro origen

**Conclusión:** Patrón actual de delegación confirmado.
La documentación especifica permisos por API, como language-model y proofreader.
MDN explica allow y el PR de Proofreader aporta el historial de diseño.
La prueba local de dos puertos comprueba el límite sin solicitar descargas de modelos.

Evidencia: [fuente 1](https://developer.chrome.com/docs/ai/prompt-api), [fuente 2](https://developer.chrome.com/docs/ai/proofreader-api), [fuente 3](https://github.com/webmachinelearning/proofreader-api/pull/14), [fuente 4](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#allow).

### Línea CSV 22: Retirada de la restricción histórica de 1024 tokens por prompt

**Conclusión:** Cambio histórico; el contexto de sesión sigue limitado.
Retirar aquella restricción no significa admitir entradas ilimitadas.
El prompt completo debe medirse contra la ventana de contexto de la sesión mediante la API actual.

Evidencia: [fuente 1](https://developer.chrome.com/docs/ai/prompt-api).

### Línea CSV 23: Anotación debugging de WebMCP

**Conclusión:** Cambio de especificación integrado verificado; versión exacta sin confirmar.
El PR #253 está integrado y los tipos actuales incluyen debugging.
El enlace de Chromium Dash solo devolvió una estructura de aplicación; no permitió verificar la primera versión de Chrome afirmada.
El observatorio filtra las herramientas destinadas a desarrollo sin tratar debugging como sistema de permisos.

Evidencia: [fuente 1](https://github.com/webmachinelearning/webmcp/pull/253), [fuente 2](https://github.com/webmachinelearning/webmcp-types).

### Línea CSV 24: Tipos de TypeScript actualizados

**Conclusión:** Anuncio histórico; paquete mantenido verificado.
La documentación actual de Chrome recomienda @types/dom-chromium-ai.
WebMCP tiene un paquete de tipos separado.
Los tipos deben corresponder al contrato probado del navegador; instalarlos no añade soporte en ejecución.

Evidencia: [fuente 1](https://developer.chrome.com/docs/ai/prompt-api), [fuente 2](https://github.com/webmachinelearning/webmcp-types).

### Línea CSV 25: Depuración de modelos locales

**Conclusión:** Destino de diagnóstico actual corroborado.
La documentación actual de Prompt enlaza chrome://on-device-internals para consultar información del modelo.
Debe usarse junto con los errores de consola y la configuración registrada.
Es una página interna de diagnóstico, no una API web invocable.

Evidencia: [fuente 1](https://developer.chrome.com/docs/ai/prompt-api).

### Línea CSV 26: Alternativa histórica para idiomas no probados

**Conclusión:** Solución histórica; reemplazar en contenido nuevo.
La incidencia solo devolvió una estructura JavaScript, por lo que su resolución no se verificó.
La guía actual de Prompt documenta los idiomas esperados y NotSupportedError.
Los demos declaran los idiomas admitidos y preservan los errores; no reproducen el antiguo flag que evitaba el clasificador de seguridad.

Evidencia: [fuente 1](https://developer.chrome.com/docs/ai/prompt-api), [fuente 2](https://issues.chromium.org/issues/392661409).

### Línea CSV 27: Anotación consequentialHint de WebMCP

**Conclusión:** Contrato actual de tipos y discusión revisados.
Los tipos definen consequentialHint para acciones con consecuencias en el mundo real; la incidencia #176 explica su motivación.
Es información para el agente consumidor, no autorización de la aplicación.
La revisión debe imponerse en el código y probar tanto rechazo como confirmación.
Chromium Dash no expuso el contenido del commit.

Evidencia: [fuente 1](https://github.com/webmachinelearning/webmcp-types), [fuente 2](https://github.com/webmachinelearning/webmcp/issues/176), [fuente 3](https://github.com/GoogleChromeLabs/webmcp-extension).

## Presentación y supuestos de trabajo

Se leyó el documento adjunto antes de construir la presentación HTML.
Las preguntas sobre estructura, idioma y duración se hicieron por separado antes de ampliarla.
La propuesta de trabajo es una charla práctica de WebMCP de 30 minutos con tres demos.
Ahora se ofrecen versiones completas en inglés y español, incluidos los guiones del presentador.
El selector y `?lang=en` o `?lang=es` eligen el idioma; no se presenta la duración ni la estructura como confirmación del usuario.
Los tres bocetos iniciales se renderizaron antes de ampliar la presentación.
La ciudad del evento sigue pendiente; puede configurarse con el parámetro `city`.

Se exportó e inspeccionó visualmente la plantilla del evento, sus colores, su tipografía y sus composiciones de portada y contenido.
El tema usa el fondo #f0f0f0, paneles blancos con borde negro y muescas, la marca de pista, el logotipo GDG extraído y las fuentes locales Google Sans Bold y Roboto Mono Light.
Los colores primarios, intermedios y pastel siguen la plantilla.
El PDF, las respuestas CSS de fuentes y las referencias renderizadas se conservan localmente como evidencia.

No se publicó el sitio, enviaron mensajes ni formularios, registraron origin trials ni modificaron cuentas.

