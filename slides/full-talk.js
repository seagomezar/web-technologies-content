/* Expanded after the three opening mockups were rendered and shown. */
TALK.slides.push(
  {id:'demo-route',kind:'demo',number:'01',title:'Construye una ruta<br>que se pueda ver.',subtitle:'Añadir con una herramienta. Quitar con un botón.',demo:'reading-route',demoTitle:'Ruta de lectura',minutes:4,builds:[],notes:[
    'Abre Ruta de lectura. Explica que los metadatos del catálogo son ejemplos curados. Primero añade Modelos pequeños desde la consola local con articleId models. La ruta visible recibe el artículo. Después elimina ese mismo artículo con el botón ordinario.\n\nPrueba un identificador inexistente para mostrar el error útil. La consola llama directamente la función; no simula comprensión del lenguaje. Si has preparado un navegador con WebMCP, muestra la herramienta registrada con el inspector o con un agente compatible.\n\nPlan de contingencia: si el agente o la API no están disponibles, continúa con la consola y explica la diferencia de forma explícita. El objetivo de la demo es comprobar el contrato y el estado compartido.'
  ]},
  {
    "id": "errors",
    "kind": "code",
    "title": "Errores<br>que orientan.",
    "subtitle": "Devuelve un código y una forma de continuar.",
    "minutes": 1.5,
    "builds": [
      "Un siguiente paso claro"
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
    "codeLabel": "Extracto · reading-route"
  },
  {
    "id": "tool-design",
    "kind": "code",
    "title": "Registra<br>una acción.",
    "subtitle": "El mismo callback que usa la página.",
    "minutes": 1.5,
    "builds": [
      "Un contrato acotado",
      "Un resultado observable"
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
    "codeLabel": "Extracto · reading-route"
  },
  {id:'demo-consent',kind:'demo',number:'02',title:'Preparar no equivale<br>a confirmar.',subtitle:'La última acción sigue siendo deliberada.',demo:'consent-cart',demoTitle:'El último clic',minutes:4,builds:[],notes:[
    'Abre El último clic. Aclara que todos los tickets son ficticios: no se hace una reserva, un cobro ni una petición a un servicio externo. Prepara dos tickets y muestra que no existe una solicitud confirmada. Rechaza la propuesta.\n\nPrepara una segunda solicitud y confirma con el botón visible. El historial local cambia solo después de esa decisión. Una anotación describe el tipo de acción para el cliente que consume herramientas; la aplicación debe seguir imponiendo su propia frontera de revisión.\n\nSi tienes un cliente WebMCP preparado, muestra la herramienta que solicita la revisión. Nunca presentes la alerta del cliente como una propiedad garantizada de todos los agentes.'
  ]},
  {
    "id": "annotations",
    "kind": "code",
    "title": "La app<br>espera tu clic.",
    "subtitle": "La anotación describe. Tu aplicación decide.",
    "minutes": 1.5,
    "builds": [
      "La regla vive en la aplicación"
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
    "codeLabel": "Extracto · consent-cart"
  },
  {
    "id": "debugging",
    "kind": "code",
    "title": "Inspección<br>con intención.",
    "subtitle": "debugging identifica a quién sirve la herramienta.",
    "minutes": 1,
    "builds": [
      "Distinguir el uso de desarrollo"
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
    "codeLabel": "Extracto · tool-observatory"
  },
  {id:'demo-observatory',kind:'demo',number:'03',title:'Mira lo que<br>la herramienta expone.',subtitle:'Esquema, anotaciones y resultados a la vista.',demo:'tool-observatory',demoTitle:'Observatorio de herramientas',minutes:3,builds:[],notes:[
    'Abre Observatorio de herramientas. Ejecuta find_demo con query browser. Muestra el esquema y el resultado. Después usa un argumento vacío y muestra un error que ayuda a recuperarse. Finalmente prueba JSON mal formado para distinguir el error del editor del resultado de la herramienta.\n\nActiva Incluir herramientas de desarrollo. Selecciona inspect_state y cambia los argumentos a un objeto vacío. El filtro de esta consola ilustra la audiencia de debugging; no demuestra cómo se comporta cualquier agente. Si hay WebMCP nativo, inspecciona los registros en el navegador.'
  ]},
  {
    "id": "types",
    "kind": "code",
    "title": "Un contrato<br>explícito.",
    "subtitle": "Obligatorios. Valores válidos. Sin campos extra.",
    "minutes": 1.5,
    "builds": [
      "Validar lo que llega",
      "Probar lo que ocurre"
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
    "codeLabel": "Extracto · reading-route"
  },
  {
    "id": "fallback",
    "kind": "code",
    "title": "Los botones<br>siguen ahí.",
    "subtitle": "Registra cuando exista soporte. Conserva la interfaz.",
    "minutes": 1.5,
    "builds": [
      "Registro condicionado",
      "Una interfaz útil"
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
    "codeLabel": "Extracto · reading-route"
  },
  {id:'limits',kind:'statement',eyebrow:'El alcance de la propuesta',title:'Una página visitada.<br>Un contexto compartido.',subtitle:'Descubrir herramientas exige llegar a la página.',minutes:1,builds:['Un límite que afecta al diseño'],notes:[
    'El diseño revisado describe herramientas que viven en el contexto de una página. Eso orienta el tipo de experiencia que tiene sentido construir.',
    'La documentación señala límites de descubrimiento y de flujos sin una interfaz humana. Existen exploraciones futuras, pero no se necesitan para este caso de uso. Evita prometer descubrimiento global o tareas de fondo a partir del ejemplo de hoy.'
  ]},
  {id:'first-step',kind:'statement',eyebrow:'Tu próximo experimento',title:'Empieza por<br>una acción útil.',subtitle:'Una intención. Un contrato. Un cambio visible.',minutes:1,builds:[],notes:[
    'Elige una acción que una persona ya quiera hacer en tu sitio. Escribe qué acepta y qué cambia. Conéctala al control habitual y después a una herramienta. Prueba el recorrido completo antes de ampliar el catálogo. En mi sitio, una ruta de lectura es un buen primer candidato.'
  ]},
  {id:'takeaway',kind:'statement',eyebrow:'La idea para llevar',title:'Una acción útil.<br>Una página compartida.',subtitle:'El visitante puede ver, revisar y continuar.',minutes:1,builds:[],notes:[
    'La aportación de esta charla es una conexión práctica: las herramientas pueden reutilizar reglas que ya hacen valiosa una interfaz. Los ejemplos y la revisión de fuentes están en la galería local. Las fuentes principales se incluyen también en las notas de esta presentación.'
  ]},
  {id:'questions',kind:'statement',eyebrow:'Conversemos',title:'¿Qué acción de tu web<br>compartirías primero?',subtitle:'Preguntas · ejemplos · decisiones de diseño',minutes:2.5,builds:[],notes:[
    'Reserva dos minutos y medio para preguntas. Si no hay una pregunta inmediata, pide un ejemplo de una acción real de la audiencia y recorre objetivo, argumentos, validación y resultado visible. No prometas soporte de una versión sin revisar su documentación. Para revisar el código, vuelve a la galería y abre cualquiera de los tres demos.'
  ]}
);
