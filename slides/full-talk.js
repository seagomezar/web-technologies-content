/* Expanded after the three opening mockups were rendered and shown. */
TALK.slides.push(
  {id:'browser-broker',kind:'flow',flowType:'broker',title:'¿Desde qué LLM o agente se envía el prompt?',minutes:0.5,agentComment:'Gemini Nano / Chrome',sources:[
    {title:'Opción A · LLM integrado en el navegador',color:'blue',chips:['Gemini en Chrome','Gemini Nano','Gemma 4'],body:'El usuario escribe el prompt en el panel lateral del navegador; el modelo corre local en el dispositivo o en la nube del browser.'}
  ],hub:{badge:'BROKER DEL NAVEGADOR',title:'navigator.modelContext',points:[
    'Descubre herramientas de la pestaña activa',
    'Valida argumentos con JSON Schema',
    'Ejecuta en el contexto de tu página'
  ]},target:{badge:'TU APLICACIÓN WEB',title:'registerTool({ execute })',body:'Agrega el artículo sobre "modelos pequeños" a tu lista de blog posts por leer en vivo.'},notes:[
    'Primera opción para enviar el prompt: un LLM integrado directamente en el navegador, como Gemini en Chrome, Gemini Nano o Gemma 4. El usuario escribe el prompt en el panel del navegador y navigator.modelContext ejecuta tu herramienta en la pestaña activa.'
  ],builds:[]},
  {id:'browser-broker-external',kind:'flow',flowType:'broker',flowOnly:true,title:'Opción B · Agente externo conectado al navegador.',minutes:0.5,agentComment:'Claude / Antigravity',sources:[
    {title:'Opción B · Agente externo conectado',color:'yellow',chips:['Claude','Antigravity','Codex','Cursor'],body:'El agente externo se conecta al browser vía extensión o puente MCP en vez de raspar el DOM con Playwright.'}
  ],hub:{badge:'BROKER DEL NAVEGADOR',title:'navigator.modelContext',points:[
    'Descubre herramientas de la pestaña activa',
    'Valida argumentos con JSON Schema',
    'Sirve también a agentes externos conectados'
  ]},target:{badge:'TU APLICACIÓN WEB',title:'registerTool({ execute })',body:'Agrega el artículo sobre "modelos pequeños" a tu lista de blog posts por leer en vivo.'},notes:[
    'Segunda opción: un agente externo como Claude, Antigravity, Codex o Cursor conectado al navegador mediante una extensión o puente MCP. En lugar de raspar el DOM con Playwright, invoca la misma herramienta registrada en navigator.modelContext.'
  ],builds:[]},
  {id:'intent',kind:'diagram',title:'¿Por qué WebMCP en lugar de scrapear el DOM?',subtitle:'<span class="gemini-prompt"><strong>«Quiero que agregues a mi lista de blog posts por leer el artículo sobre "modelos pequeños"»</strong></span>',minutes:1.5,diagram:[
    {title:'1. Hoy: Scraping del DOM',body:'El agente busca «modelos pequeños» en tu HTML, adivina qué botón clicar (.btn-add) y se rompe si cambias la UI.',color:'yellow'},
    {title:'2. Con WebMCP: Tu contrato',body:'Tú (el dev) expones add_to_route({ articleId: "models" }) en modelContext. El agente llama tu función directa.',color:'blue',step:1},
    {title:'3. Valor: UI y control humano',body:'Tu app agrega el post a tu lista de blog posts por leer en el DOM en vivo y exige confirmación si hay riesgo.',color:'green',step:2}
  ],notes:[
    'Hoy, cuando el usuario final le pide a un agente agregar a su lista de blog posts por leer el artículo sobre "modelos pequeños", el agente suele raspar el DOM o adivinar en qué coordenada hacer clic. Si cambias una clase CSS o el diseño, el flujo se rompe.',
    'El agente necesita una acción acotada, como añadir un artículo. Con WebMCP, tú como desarrollador registras esa función en document.modelContext con un esquema JSON explícito para que el agente la invoque sin adivinar selectores.',
    'El valor para el desarrollador y para el usuario final es directo: no construyes un backend paralelo ni otra UI. Se ejecuta la misma función de tu aplicación, la lista de blog posts por leer se actualiza en vivo y el usuario conserva el control.'
  ],builds:['Una herramienta','Una página compartida']},
  {id:'shared-function',kind:'diagram',title:'Un solo callback<br>para la UI y el agente.',subtitle:'El botón del DOM y document.modelContext llaman a la misma función.',minutes:2,diagram:[
    {title:'Evento de UI (click)',body:'El usuario pulsa «Añadir» en la tarjeta del artículo.',color:'blue'},
    {title:'addToRoute(args)',body:'Valida ID, previene duplicados y vuelve a renderizar la vista.',color:'yellow',step:1},
    {title:'registerTool({ execute })',body:'El navegador invoca exactamente el mismo callback de aplicación.',color:'green',step:2,arrow:'←'}
  ],notes:[
    'El botón de añadir llama una función de la aplicación. No tenemos que crear una segunda aplicación para el agente.',
    'Esa función valida el identificador, evita duplicados y actualiza la lista. El estado y las reglas siguen siendo responsabilidad de la aplicación.',
    'El callback de la herramienta usa esa misma función. La conexión al navegador es una capa pequeña alrededor de lógica que ya tiene sentido para la persona.'
  ],builds:['Una función de aplicación','Un segundo punto de entrada']},
  {id:'demo-route',kind:'demo',number:'01',title:'Lista de lectura: add_to_route.',subtitle:'Agrega blog posts por leer desde el agente o desde la interfaz.',demo:'reading-route',demoTitle:'Lista de lectura · Blog posts por leer',steps:[],minutes:2.5,builds:[],notes:[
    'Abre el demo de Lista de lectura embebido en la diapositiva o en pestaña completa. Si la flag de WebMCP no está activa en el navegador, el demo muestra automáticamente los 3 pasos para habilitar chrome://flags. Al invocar add_to_route con el artículo sobre "modelos pequeños", la lista de blog posts por leer se actualiza en vivo con feedback visual directo.'
  ]},
  {
    "id": "errors",
    "kind": "code",
    "title": "Errores con código<br>y retryable.",
    "subtitle": "Devolver un código estable permite corregir los argumentos.",
    "minutes": 1.5,
    "builds": [
      "Un siguiente paso claro"
    ],
    "stepCallouts": [
      "Rechaza IDs desconocidos antes de mutar el estado y devuelve un código estable.",
      "Indica cómo corregir el argumento y marca retryable: true para el agente."
    ],
    "notes": [
      "Este es un extracto de la respuesta de error de Ruta de lectura. article es el resultado de buscar el identificador recibido. Si no existe, la función devuelve un objeto sin modificar la ruta. UNKNOWN_ARTICLE es un código estable de la aplicación, no una forma universal de error definida por WebMCP.",
      "La explicación indica cómo recuperarse y retryable señala que el cliente puede corregir los argumentos. Esta señal no obliga a reintentar automáticamente. La aplicación también rechaza argumentos con tipos incorrectos y evita duplicados. El enlace al código muestra la implementación completa y sus mensajes más detallados."
    ],
    "codeDemo": "reading-route",
    "code": "if (!article) {\n  return {\n    code: \"UNKNOWN_ARTICLE\",\n    error: \"Elige un articleId conocido.\",\n    retryable: true\n  };\n}",
    "codeFocus": [
      [
        1,
        2,
        3
      ],
      [
        4,
        5
      ]
    ],
    "codeLabel": "demos/assets/webmcp.js · reading-route"
  },
  {
    "id": "tool-design",
    "kind": "code",
    "title": "Registro en<br>modelContext.",
    "subtitle": "Nombre estable, inputSchema con enum y el mismo callback add.",
    "minutes": 1.5,
    "builds": [
      "Un contrato acotado",
      "Un resultado observable"
    ],
    "stepCallouts": [
      "Define name y description para que el agente identifique cuándo usar la herramienta.",
      "Acota articleId con un enum generado desde los IDs reales del catálogo.",
      "Pasa la función add de la aplicación como callback en execute."
    ],
    "notes": [
      "Este registro usa document.modelContext.registerTool y espera su promesa. El nombre add_to_route es estable; la descripción explica cuándo elegir la herramienta. Este extracto supone que ya detectamos el soporte. Más adelante veremos esa comprobación y el manejo de errores de registro.",
      "El helper schema pertenece a esta aplicación: construye un esquema de objeto, exige sus propiedades y no permite campos extra. articles es el catálogo del demo; su lista de identificadores delimita articleId. Veremos el cuerpo del helper en la diapositiva del contrato. Estas dependencias están en el código completo enlazado.",
      "execute recibe add, el mismo callback de aplicación que usa el botón. En el demo, add valida los argumentos, evita duplicados y vuelve a renderizar la ruta. La API del navegador aporta el punto de entrada; las reglas y el estado siguen en la aplicación."
    ],
    "codeDemo": "reading-route",
    "code": "await document.modelContext.registerTool({\n  name: \"add_to_route\",\n  description: \"Añade una lectura\",\n  inputSchema: schema({\n    articleId: {\n      type: \"string\",\n      enum: articles.map(a => a.id)\n    }\n  }),\n  execute: add\n});",
    "codeFocus": [
      [
        2,
        3
      ],
      [
        4,
        5,
        6,
        7,
        8,
        9
      ],
      [
        10
      ]
    ],
    "codeLabel": "demos/assets/webmcp.js · reading-route"
  },
  {id:'demo-consent',kind:'demo',number:'02',title:'Confirmación explícita<br>antes de ejecutar.',subtitle:'La herramienta prepara el borrador; el clic humano resuelve la promesa.',demo:'consent-cart',demoTitle:'Compuerta de confirmación',steps:[
    'Preparar una solicitud de 2 entradas: el panel de revisión se actualiza sin añadir registros confirmados.',
    'Pulsar «Rechazar» para comprobar que la promesa se resuelve como rejected sin efectos secundarios.',
    'Preparar de nuevo y pulsar «Confirmar»: solo el evento click del usuario confirma el estado.'
  ],minutes:2.5,builds:[],notes:[
    'Abre El último clic. Aclara que todos los tickets son ficticios: no se hace una reserva, un cobro ni una petición a un servicio externo. Prepara dos tickets y muestra que no existe una solicitud confirmada. Rechaza la propuesta.\n\nPrepara una segunda solicitud y confirma con el botón visible. El historial local cambia solo después de esa decisión. Una anotación describe el tipo de acción para el cliente que consume herramientas; la aplicación debe seguir imponiendo su propia frontera de revisión.\n\nSi tienes un cliente WebMCP preparado, muestra la herramienta que solicita la revisión. Nunca presentes la alerta del cliente como una propiedad garantizada de todos los agentes.'
  ]},
  {
    "id": "annotations",
    "kind": "code",
    "title": "Promesa en pausa<br>hasta confirmar.",
    "subtitle": "consequentialHint informa al cliente; la promesa impone la espera.",
    "minutes": 1.5,
    "builds": [
      "La regla vive en la aplicación"
    ],
    "stepCallouts": [
      "consequentialHint: true es un metadato descriptivo, no un control de permisos.",
      "new Promise mantiene la ejecución pausada hasta que el botón de UI invoca finishReview."
    ],
    "notes": [
      "El último clic registra requestReview con estas anotaciones. consequentialHint describe una consecuencia, sin conceder permiso ni imponer una confirmación idéntica en todos los clientes. Este es un extracto: el registro completo pasa el objeto de anotaciones junto con nombre, descripción, esquema y callback.",
      "El código de aplicación impone la revisión. prepare valida cantidad y solicitudes pendientes, actualiza la pantalla y puede devolver un error. En el caso válido, la promesa permanece pendiente hasta que una persona decide. En el código completo, el botón de confirmación resuelve finishReview; el de rechazo devuelve rejected. También se comprueba que exista una solicitud pendiente, se gestiona AbortSignal, se limpia el estado y se registra el resultado. No hay cobro ni reserva real."
    ],
    "codeDemo": "consent-cart",
    "code": "const annotations = {\n  consequentialHint: true\n};\n\nasync function requestReview(args) {\n  const prepared = prepare(args);\n  if (prepared.error) return prepared;\n  return new Promise(resolve => {\n    finishReview = resolve;\n  });\n}",
    "codeFocus": [
      [
        1,
        2,
        3
      ],
      [
        5,
        6,
        7,
        8,
        9,
        10,
        11
      ]
    ],
    "codeLabel": "demos/assets/webmcp.js · consent-cart"
  },
  {
    "id": "debugging",
    "kind": "code",
    "title": "Anotaciones<br>readOnly y debugging.",
    "subtitle": "Etiquetar herramientas de diagnóstico frente a herramientas de usuario.",
    "minutes": 1,
    "builds": [
      "Distinguir el uso de desarrollo"
    ],
    "stepCallouts": [
      "Expone un snapshot de solo lectura para inspeccionar el estado interno.",
      "Usa readOnlyHint: true y debugging: true para separar herramientas de diagnóstico."
    ],
    "notes": [
      "Este extracto define inspect_state con un esquema vacío y un callback de lectura. inspectState representa el callback del demo que devuelve una instantánea con hora y número de propuestas; es lógica de aplicación, no otra API del navegador. La herramienta se registra mediante el mismo patrón de registro que acabamos de ver.",
      "readOnlyHint describe que la herramienta solo lee estado y debugging indica su audiencia de desarrollo. Ninguna de estas anotaciones es un control de acceso. El observatorio tiene un filtro explícito para incluir estas herramientas; eso ilustra una decisión de esta consola y no garantiza el comportamiento de todos los agentes."
    ],
    "codeDemo": "tool-observatory",
    "code": "const debugTool = {\n  name: \"inspect_state\",\n  description: \"Inspecciona el estado\",\n  inputSchema: {\n    type: \"object\", properties: {}\n  },\n  annotations: {\n    readOnlyHint: true,\n    debugging: true\n  },\n  execute: inspectState\n};",
    "codeFocus": [
      [
        2,
        3,
        4,
        5
      ],
      [
        7,
        8,
        9
      ]
    ],
    "codeLabel": "demos/assets/webmcp.js · tool-observatory"
  },
  {id:'demo-observatory',kind:'demo',number:'03',title:'Inspección de esquemas,<br>errores y trazas.',subtitle:'Diferenciar errores de validación, fallos de sintaxis y herramientas de depuración.',demo:'tool-observatory',demoTitle:'Inspector de esquemas y errores',steps:[
    'Invocar find_demo con {"query":"browser"} y revisar el esquema, las anotaciones y la latencia.',
    'Comparar {"query":""} (error estructurado INVALID_QUERY) frente a JSON mal formado (SyntaxError).',
    'Activar «Incluir herramientas con debugging: true» para inspeccionar y ejecutar inspect_state.'
  ],minutes:3,builds:[],notes:[
    'Abre Observatorio de herramientas. Ejecuta find_demo con query browser. Muestra el esquema y el resultado. Después usa un argumento vacío y muestra un error que ayuda a recuperarse. Finalmente prueba JSON mal formado para distinguir el error del editor del resultado de la herramienta.\n\nActiva Incluir herramientas de desarrollo. Selecciona inspect_state y cambia los argumentos a un objeto vacío. El filtro de esta consola ilustra la audiencia de debugging; no demuestra cómo se comporta cualquier agente. Si hay WebMCP nativo, inspecciona los registros en el navegador.'
  ]},
  {
    "id": "types",
    "kind": "code",
    "title": "Validación de entrada<br>con JSON Schema.",
    "subtitle": "Propiedades obligatorias y additionalProperties: false.",
    "minutes": 1.5,
    "builds": [
      "Validar lo que llega",
      "Probar lo que ocurre"
    ],
    "stepCallouts": [
      "Define un esquema de tipo object a partir del mapa de propiedades.",
      "Marca todas las claves como required y bloquea campos no declarados.",
      "Complementa el esquema declarativo con validación en tiempo de ejecución."
    ],
    "notes": [
      "Este es el helper schema usado en el registro de add_to_route. Recibe un mapa de propiedades y devuelve un JSON Schema de tipo object. Es una pequeña función de la aplicación, no una función que WebMCP añada al navegador.",
      "Object.keys marca cada propiedad suministrada como obligatoria y additionalProperties: false rechaza nombres no previstos. El enum del registro delimita los identificadores de artículo. El contrato orienta al cliente, pero add sigue validando el dato real antes de modificar el estado; los tipos o un esquema no sustituyen las reglas de negocio.",
      "Comprueba el recorrido con null, tipos incorrectos, identificadores desconocidos y duplicados, además del caso correcto. En el flujo de revisión, comprueba también rechazo y confirmación. El enlace al código permite ver la validación de ejecución junto con este helper."
    ],
    "codeDemo": "reading-route",
    "code": "const schema = properties => ({\n  type: \"object\",\n  properties,\n  required: Object.keys(properties),\n  additionalProperties: false\n});",
    "codeFocus": [
      [
        1,
        2,
        3
      ],
      [
        4,
        5
      ],
      [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    ],
    "codeLabel": "demos/assets/webmcp.js · reading-route"
  },
  {
    "id": "fallback",
    "kind": "code",
    "title": "Detección de soporte<br>y mejora progresiva.",
    "subtitle": "Renderizar primero la UI; registrar solo si existe registerTool.",
    "minutes": 1.5,
    "builds": [
      "Registro condicionado",
      "Una interfaz útil"
    ],
    "stepCallouts": [
      "Renderiza los controles del DOM antes de comprobar el soporte de WebMCP.",
      "Comprueba document.modelContext?.registerTool antes de registrar la herramienta.",
      "Captura errores de registro sin degradar la interfaz del usuario."
    ],
    "notes": [
      "La primera línea renderiza los controles ordinarios antes de intentar el registro. render, tool y status son piezas de la aplicación. Este extracto se ejecuta en un contexto async, como el helper de registro del demo. Sin soporte de WebMCP la página ya permite añadir y quitar lecturas.",
      "La comprobación usa document.modelContext y registerTool. Si existe el método, esperamos su promesa antes de anunciar que la herramienta está registrada. La prueba local revisada usa enable-webmcp-testing; la documentación también describe el origin trial. La detección de soporte corresponde al navegador que se está probando.",
      "El catch muestra un fallo de registro sin retirar los botones de la página. Una interfaz útil debe conservarse tanto si falta soporte como si el registro falla. WebMCP conecta herramientas con la página; un agente puede usar inferencia local o remota, y este registro no permite deducir dónde se ejecuta el modelo."
    ],
    "codeDemo": "reading-route",
    "code": "render();\n\nif (document.modelContext?.registerTool) {\n  try {\n    await document.modelContext\n      .registerTool(tool);\n  } catch (error) {\n    status(error.message, true);\n  }\n}",
    "codeFocus": [
      [
        1
      ],
      [
        3,
        4,
        5,
        6
      ],
      [
        7,
        8,
        9,
        10
      ]
    ],
    "codeLabel": "demos/assets/webmcp.js · reading-route"
  },
  {id:'limits',kind:'statement',eyebrow:'Alcance arquitectónico',title:'Límites del contexto<br>de documento.',subtitle:'Las herramientas de WebMCP viven mientras la pestaña está abierta.',specs:[
    {term:'Ámbito de pestaña',detail:'document.modelContext expone herramientas sobre el documento activo, no como un servidor MCP en segundo plano.'},
    {term:'Superficie sincronizada',detail:'Cada llamada modifica el estado visible para que el usuario pueda auditar o revertir desde la UI.'},
    {term:'Agnóstico al modelo',detail:'Registrar una herramienta define el contrato del navegador; el agente consumidor puede ser local o remoto.'}
  ],minutes:1,builds:['Un límite que afecta al diseño'],notes:[
    'El diseño revisado describe herramientas que viven en el contexto de una página. Eso orienta el tipo de experiencia que tiene sentido construir.',
    'La documentación señala límites de descubrimiento y de flujos sin una interfaz humana. Existen exploraciones futuras, pero no se necesitan para este caso de uso. Evita prometer descubrimiento global o tareas de fondo a partir del ejemplo de hoy.'
  ]},
  {id:'first-step',kind:'statement',eyebrow:'Guía de implementación',title:'Cómo exponer tu primera<br>herramienta WebMCP.',subtitle:'Reutiliza una acción existente de tu interfaz en tres pasos.',specs:[
    {term:'1. Aislar el handler de UI',detail:'Extrae la función que ya filtra, busca o añade elementos desde tus eventos de clic o formulario.'},
    {term:'2. Definir inputSchema',detail:'Declara tipos estrictos, enum para valores conocidos, required y additionalProperties: false.'},
    {term:'3. Pausar acciones críticas',detail:'Si la herramienta confirma o modifica datos sensibles, mantén la Promise pendiente hasta el clic del usuario.'}
  ],minutes:1,builds:[],notes:[
    'Elige una acción que una persona ya quiera hacer en tu sitio. Escribe qué acepta y qué cambia. Conéctala al control habitual y después a una herramienta. Prueba el recorrido completo antes de ampliar el catálogo. En mi sitio, una ruta de lectura es un buen primer candidato.'
  ]},
  {id:'takeaway',kind:'statement',eyebrow:'Resumen técnico',title:'Un solo estado para<br>la UI y las herramientas.',subtitle:'Contratos estrictos, confirmación humana y mejora progresiva.',specs:[
    {term:'Callback compartido',detail:'El botón del DOM y execute en registerTool invocan exactamente la misma lógica de negocio.'},
    {term:'Las anotaciones no autorizan',detail:'consequentialHint, readOnlyHint y debugging son metadatos; la seguridad la impone tu aplicación.'},
    {term:'Mejora progresiva',detail:'Si document.modelContext no está disponible, la aplicación funciona al 100 % con sus controles estándar.'}
  ],minutes:1,builds:[],notes:[
    'La aportación de esta charla es una conexión práctica: las herramientas pueden reutilizar reglas que ya hacen valiosa una interfaz. Los ejemplos y la revisión de fuentes están en la galería local. Las fuentes principales se incluyen también en las notas de esta presentación.'
  ]},
  {id:'questions',kind:'statement',eyebrow:'Recursos y preguntas',title:'¿Qué función de tu app<br>expondrías primero?',subtitle:'Demos interactivos, código fuente y documentación técnica.',links:[
    {label:'Demo 01 · reading-route',href:'../demos/reading-route.html'},
    {label:'Demo 02 · consent-cart',href:'../demos/consent-cart.html'},
    {label:'Demo 03 · tool-observatory',href:'../demos/tool-observatory.html'},
    {label:'Galería completa (21 demos)',href:'../index.html'},
    {label:'Notas técnicas y referencias',href:'../research/topic-review.md'}
  ],minutes:2.5,builds:[],notes:[
    'Reserva dos minutos y medio para preguntas. Si no hay una pregunta inmediata, pide un ejemplo de una acción real de la audiencia y recorre objetivo, argumentos, validación y resultado visible. No prometas soporte de una versión sin revisar su documentación. Para revisar el código, vuelve a la galería y abre cualquiera de los tres demos.'
  ]}
);
