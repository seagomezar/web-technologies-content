/* Talk content and speaker script. Separate from the event theme and navigation. */
window.TALK = {
  title:'WebMCP: herramientas de navegador seguras, verificables y con estado compartido',
  language:'es', plannedMinutes:30,
  defaults:{structure:'One hands-on talk around WebMCP, 24 visual slides, and three Stitch-designed demos',language:'Spanish',city:'Ciudad por confirmar'},
  sources:[
    {title:'Documentación oficial de WebMCP · Chrome for Developers',url:'https://developer.chrome.com/docs/ai/webmcp'},
    {title:'WebMCP y agentes en Chrome',url:'https://developer.chrome.com/docs/ai/agents'},
    {title:'Sugerencias para herramientas WebMCP más seguras',url:'https://developer.chrome.com/docs/ai/webmcp/secure-tools'},
    {title:'Seguridad de los agentes para WebMCP (Spotlighting)',url:'https://developer.chrome.com/docs/agents/security'},
    {title:'Depurar herramientas WebMCP en Chrome DevTools',url:'https://developer.chrome.com/docs/devtools/application/webmcp'},
    {title:'Extensión agente de ejemplo (GoogleChromeLabs)',url:'https://github.com/GoogleChromeLabs/webmcp-extension'},
    {title:'Demo oficial de seguridad Smart Home',url:'https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/demos/smart-home'},
    {title:'WebMCP Evals CLI (evaluaciones no determinísticas)',url:'https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/webmcp-evals'}
  ],
  slides:[
    {id:'opening',kind:'title',title:'Tu web también<br>tiene herramientas.',subtitle:'WebMCP: Expón funciones y formularios de tu app<br>a agentes de IA de forma segura y verificable.',speaker:'Sebastián Gómez · Google Developer Expert (Web Technologies)',photo:'assets/sebastian-gomez.jpg',badge:'assets/gde-web-badge.svg',minutes:1.5,notes:[
      'La página web ya sabe hacer cosas: buscar, filtrar, preparar una ruta de lectura o confirmar un pedido. La pregunta es cómo ofrecer esas mismas acciones a un agente sin raspar el DOM ni perder la interfaz que una persona entiende.',
      'Recorrido de 30 minutos basado en la especificación y videos oficiales de Chrome: qué es WebMCP (Imperativo y Declarativo), cómo blindarlo contra fatiga de permisos e Indirect Prompt Injection, cómo inspeccionarlo en DevTools y cómo evaluarlo con webmcp-evals.'
    ],builds:[]},
    {id:'mcp-vs-webmcp',kind:'flow',flowType:'lanes',title:'MCP de servidor vs. WebMCP en el navegador.',minutes:1,lanes:[
      {id:'legacy',title:'MCP tradicional · Servidor / Backend',verdict:'Sin pantalla ni sesión compartida',verdictTone:'warn',tone:'yellow',nodes:[
        {title:'1. Usuario',sub:'Pide agregar a su lista de blog posts'},
        {edge:'prompt',title:'2. Cliente LLM',sub:'Claude · IDE · CLI'},
        {edge:'JSON-RPC',title:'3. Servidor MCP',sub:'Otro servicio y otra auth'},
        {edge:'API / SQL',title:'4. Base de datos',sub:'Tu pestaña web no se entera'}
      ]}
    ],notes:[
      'Antes de ver el código, aclaremos cómo funciona el flujo de MCP tradicional en servidor o backend: cuando el usuario pide agregar un artículo desde un cliente externo, el agente llama a un servidor MCP aparte. Tu pestaña web abierta no comparte esa sesión ni refleja el cambio en pantalla.'
    ],builds:[]},
    {id:'webmcp-lane',kind:'flow',flowType:'lanes',flowOnly:true,title:'WebMCP · En la pestaña activa del navegador.',minutes:1,lanes:[
      {id:'webmcp',title:'WebMCP · En la pestaña activa del navegador',verdict:'Misma sesión, cookies y DOM en vivo',verdictTone:'ok',tone:'blue',nodes:[
        {title:'1. Usuario final',sub:'Con tu app abierta en pantalla'},
        {edge:'prompt',title:'2. Agente en Browser',sub:'Gemini · Extensión · DevTools'},
        {edge:'modelContext',title:'3. Tu Web App (JS / HTML)',sub:'Ejecuta add_to_route({ articleId })'},
        {edge:'render',title:'4. DOM en vivo',sub:'Cookies, localStorage y UI sincronizada'}
      ]}
    ],notes:[
      'Con WebMCP, ese mismo prompt ocurre dentro de la sesión activa del navegador: reutiliza las mismas cookies, localStorage y estado en memoria que el usuario ya tiene abiertos, y actualiza el DOM frente a sus ojos.'
    ],builds:[]}
  ]
};
TALK.slides[0].notes=[TALK.slides[0].notes.join('\n\n')];
