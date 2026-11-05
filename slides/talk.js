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
    {id:'mcp-vs-webmcp',kind:'flow',flowType:'lanes',title:'MCP de servidor vs. WebMCP en el navegador.',minutes:1,lanes:[
      {id:'legacy',title:'MCP tradicional · Servidor / Backend',verdict:'Sin pantalla ni sesión compartida',verdictTone:'warn',tone:'yellow',nodes:[
        {title:'1. Usuario',sub:'Pide agregar a su lista de blog posts'},
        {edge:'prompt',title:'2. Cliente LLM',sub:'Claude · IDE · CLI'},
        {edge:'JSON-RPC',title:'3. Servidor MCP',sub:'Otro servicio y otra auth'},
        {edge:'API / SQL',title:'4. Base de datos',sub:'Tu pestaña web no se entera'}
      ]}
    ],notes:[
      'Antes de ver el código, aclaremos cómo funciona el flujo de MCP tradicional en servidor o backend: cuando el usuario pide agregar a su lista de blog posts por leer el artículo sobre "modelos pequeños" desde un cliente externo, el agente llama a un servidor MCP aparte. Tu pestaña web abierta no comparte esa sesión ni refleja el cambio en pantalla.'
    ],builds:[]},
    {id:'webmcp-lane',kind:'flow',flowType:'lanes',flowOnly:true,title:'WebMCP · En la pestaña activa del navegador.',minutes:1,lanes:[
      {id:'webmcp',title:'WebMCP · En la pestaña activa del navegador',verdict:'Misma sesión y DOM en vivo',verdictTone:'ok',tone:'blue',nodes:[
        {title:'1. Usuario final',sub:'Con tu blog abierto en pantalla'},
        {edge:'prompt',title:'2. Agente en Browser',sub:'Gemini · Claude · Extensión'},
        {edge:'modelContext',title:'3. Tu Web App (JS)',sub:'Ejecuta add_to_route({ articleId })'},
        {edge:'render',title:'4. DOM en vivo',sub:'Lista de blog posts actualizada'}
      ]}
    ],notes:[
      'Con WebMCP, ese mismo prompt ("Quiero que agregues a mi lista de blog posts por leer el artículo sobre modelos pequeños") ocurre sobre la pestaña activa del navegador: el agente invoca la herramienta registrada en document.modelContext, reutiliza la sesión del usuario y actualiza el DOM en vivo frente a sus ojos.'
    ],builds:[]}
  ]
};
TALK.slides[0].notes=[TALK.slides[0].notes.join('\n\n')];
