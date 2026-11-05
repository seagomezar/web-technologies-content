/* Talk content and speaker script. Separate from the event theme and navigation. */
window.TALK = {
  title:'WebMCP: herramientas de navegador con estado compartido',
  language:'es', plannedMinutes:30,
  defaults:{structure:'One hands-on talk around WebMCP and three demos',language:'Spanish',city:'Ciudad por confirmar'},
  sources:[
    {title:'WebMCP · Chrome for Developers',url:'https://developer.chrome.com/docs/ai/webmcp'},
    {title:'WebMCP types',url:'https://github.com/webmachinelearning/webmcp-types'},
    {title:'WebMCP extension and annotation handling',url:'https://github.com/GoogleChromeLabs/webmcp-extension'},
    {title:'debugging annotation',url:'https://github.com/webmachinelearning/webmcp/pull/253'}
  ],
  slides:[
    {id:'opening',kind:'title',title:'Tu web también<br>tiene herramientas.',subtitle:'WebMCP: Expón funciones de tu aplicación web<br>a agentes de IA sin duplicar la interfaz.',speaker:'Sebastián Gómez · Google Developer Expert (Web Technologies)',photo:'assets/sebastian-gomez.jpg',badge:'assets/gde-web-badge.svg',minutes:1.5,notes:[
      'La página web ya sabe hacer cosas: buscar, filtrar, preparar una ruta de lectura. La pregunta es cómo ofrecer esas mismas acciones a un agente sin perder la interfaz que una persona entiende. Esta charla empieza con una necesidad concreta: elegir qué leer antes de una charla.',
      'Presenta el alcance: WebMCP sigue siendo una propuesta experimental. Los demos tienen un panel local para explorar las mismas funciones incluso cuando el navegador no ofrece la API. Ese panel no es un agente de IA.'
    ],builds:[]},
    {id:'intent',kind:'diagram',title:'Del scraping del DOM<br>a contratos con esquema.',subtitle:'Cómo interactúan el usuario final, el agente de IA y tu aplicación.',minutes:1.5,diagram:[
      {title:'1. Usuario final',body:'El visitante de tu web pide una tarea («Agrega lecturas sobre modelos locales»).',color:'blue'},
      {title:'2. Agente → WebMCP',body:'El agente invoca tu herramienta tipada add_to_route({ articleId }) sin raspar el DOM.',color:'yellow',step:1},
      {title:'3. Tu aplicación web',body:'Tu código valida el input, actualiza el DOM en vivo y permite deshacer con un clic.',color:'green',step:2}
    ],notes:[
      'Una persona quiere prepararse para una charla. La intención es sencilla: ayúdame a elegir qué leer. La experiencia debe seguir siendo comprensible en la pantalla.',
      'El agente necesita una acción acotada, como añadir un artículo. Una herramienta con argumentos definidos reduce lo que el agente tiene que inferir sobre la página.',
      'La lista visible cambia. La persona puede comprobar el resultado y quitar un artículo usando los controles de siempre. Esa continuidad es la idea central.'
    ],builds:['Una herramienta','Una página compartida']},
    {id:'shared-function',kind:'diagram',title:'Un solo callback<br>para la UI y el agente.',subtitle:'El botón del DOM y document.modelContext llaman a la misma función.',minutes:2,diagram:[
      {title:'Evento de UI (click)',body:'El usuario pulsa «Añadir» en la tarjeta del artículo.',color:'blue'},
      {title:'addToRoute(args)',body:'Valida ID, previene duplicados y vuelve a renderizar la vista.',color:'yellow',step:1},
      {title:'registerTool({ execute })',body:'El navegador invoca exactamente el mismo callback de aplicación.',color:'green',step:2,arrow:'←'}
    ],notes:[
      'El botón de añadir llama una función de la aplicación. No tenemos que crear una segunda aplicación para el agente.',
      'Esa función valida el identificador, evita duplicados y actualiza la lista. El estado y las reglas siguen siendo responsabilidad de la aplicación.',
      'El callback de la herramienta usa esa misma función. La conexión al navegador es una capa pequeña alrededor de lógica que ya tiene sentido para la persona.'
    ],builds:['Una función de aplicación','Un segundo punto de entrada']}
  ]
};
TALK.slides[0].notes=[TALK.slides[0].notes.join('\n\n')];
