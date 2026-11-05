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
    {id:'intent',kind:'diagram',title:'¿Por qué WebMCP en lugar<br>de scrapear el DOM?',subtitle:'Prompt del usuario final: <strong>«Agrega a mi ruta el artículo sobre modelos pequeños»</strong>',minutes:1.5,diagram:[
      {title:'1. Hoy: Scraping del DOM',body:'El agente busca ese texto en tu HTML, adivina qué botón clicar (.btn-add) y se rompe si cambias la UI.',color:'yellow'},
      {title:'2. Con WebMCP: Tu contrato',body:'Tú (el dev) expones add_to_route({ articleId: "models" }) en modelContext. El agente llama tu función directa.',color:'blue',step:1},
      {title:'3. Valor: UI y control humano',body:'Tu app ejecuta su propia lógica sin duplicar código, actualiza el DOM en vivo y exige confirmación si hay riesgo.',color:'green',step:2}
    ],notes:[
      'Hoy, cuando el usuario final le pide una tarea a un agente en el navegador, el agente suele raspar el DOM o adivinar en qué coordenada hacer clic. Si cambias una clase CSS, el orden de los elementos o el idioma, el flujo se rompe.',
      'El agente necesita una acción acotada, como añadir un artículo. Con WebMCP, tú como desarrollador registras esa función en document.modelContext con un esquema JSON explícito para que el agente la invoque sin adivinar selectores.',
      'El valor para el desarrollador y para el usuario final es directo: no construyes un backend paralelo ni otra UI. Se ejecuta la misma función de tu aplicación, el DOM se actualiza en vivo frente al usuario y él conserva el control.'
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
