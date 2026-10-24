/* Talk content and speaker script. Separate from the event theme and navigation. */
window.TALK = {
  title:'Tu web también tiene herramientas',
  language:'es', plannedMinutes:30,
  defaults:{structure:'One hands-on talk around WebMCP and three demos',language:'Spanish',city:'Ciudad por confirmar'},
  sources:[
    {title:'WebMCP · Chrome for Developers',url:'https://developer.chrome.com/docs/ai/webmcp'},
    {title:'WebMCP types',url:'https://github.com/webmachinelearning/webmcp-types'},
    {title:'WebMCP extension and annotation handling',url:'https://github.com/GoogleChromeLabs/webmcp-extension'},
    {title:'debugging annotation',url:'https://github.com/webmachinelearning/webmcp/pull/253'}
  ],
  slides:[
    {id:'opening',kind:'title',title:'Tu web también<br>tiene herramientas.',subtitle:'WebMCP: personas y agentes<br>en la misma interfaz.',speaker:'Sebastián Gómez · Google Developer Expert (Web Technologies)',highlights:[
      {label:'01 · Estado compartido',text:'El botón humano y la herramienta del agente llaman a la misma función.'},
      {label:'02 · Revisión deliberada',text:'Preparar una acción nunca equivale a confirmarla sin la persona.'},
      {label:'03 · Contratos observables',text:'JSON Schema, errores recuperables y degradación elegante.'}
    ],minutes:1.5,notes:[
      'La página web ya sabe hacer cosas: buscar, filtrar, preparar una ruta de lectura. La pregunta es cómo ofrecer esas mismas acciones a un agente sin perder la interfaz que una persona entiende. Esta charla empieza con una necesidad concreta: elegir qué leer antes de una charla.',
      'Presenta el alcance: WebMCP sigue siendo una propuesta experimental. Los demos tienen un panel local para explorar las mismas funciones incluso cuando el navegador no ofrece la API. Ese panel no es un agente de IA.'
    ],builds:[]},
    {id:'intent',kind:'diagram',title:'Una intención.<br>Una acción visible.',subtitle:'«Ayúdame a elegir qué leer antes de la charla».',takeaway:'Sin adivinar selectores del DOM: el agente invoca una acción con contrato y la persona ve el cambio en pantalla.',minutes:1.5,diagram:[
      {meta:'1 · Intención humana',title:'Una persona',body:'Expresa el objetivo y mantiene el control visual de la página.',color:'blue'},
      {meta:'2 · Contrato WebMCP',title:'Una herramienta',body:'Recibe argumentos con tipos definidos (add_to_route) sin raspar el DOM.',color:'yellow',step:1},
      {meta:'3 · Interfaz sincronizada',title:'La misma página',body:'Actualiza la ruta visible y permite corregir o quitar con un clic.',color:'green',step:2}
    ],notes:[
      'Una persona quiere prepararse para una charla. La intención es sencilla: ayúdame a elegir qué leer. La experiencia debe seguir siendo comprensible en la pantalla.',
      'El agente necesita una acción acotada, como añadir un artículo. Una herramienta con argumentos definidos reduce lo que el agente tiene que inferir sobre la página.',
      'La lista visible cambia. La persona puede comprobar el resultado y quitar un artículo usando los controles de siempre. Esa continuidad es la idea central.'
    ],builds:['Una herramienta','Una página compartida']},
    {id:'shared-function',kind:'diagram',title:'La misma función<br>mueve la interfaz.',subtitle:'El botón y la herramienta comparten estado y reglas.',takeaway:'No construyas una segunda aplicación para el agente: reutiliza tu lógica de validación y renderizado.',minutes:2,diagram:[
      {meta:'Entrada humana (UI)',title:'Botón',body:'Clic directo del visitante en la tarjeta del artículo.',color:'blue'},
      {meta:'Núcleo de la aplicación',title:'addToRoute()',body:'Valida ID → evita duplicados → actualiza estado y DOM.',color:'yellow',step:1},
      {meta:'Entrada de agente (WebMCP)',title:'Herramienta',body:'document.modelContext invoca el mismo callback estructurado.',color:'green',step:2,arrow:'←'}
    ],notes:[
      'El botón de añadir llama una función de la aplicación. No tenemos que crear una segunda aplicación para el agente.',
      'Esa función valida el identificador, evita duplicados y actualiza la lista. El estado y las reglas siguen siendo responsabilidad de la aplicación.',
      'El callback de la herramienta usa esa misma función. La conexión al navegador es una capa pequeña alrededor de lógica que ya tiene sentido para la persona.'
    ],builds:['Una función de aplicación','Un segundo punto de entrada']}
  ]
};
TALK.slides[0].notes=[TALK.slides[0].notes.join('\n\n')];
