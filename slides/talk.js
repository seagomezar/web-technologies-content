/* Talk content and speaker script. Separate from the event theme and navigation. */
window.TALK = {
  title:'WebMCP: herramientas de navegador con estado compartido',
  language:'es', plannedMinutes:30,
  defaults:{structure:'Charla práctica de 30 minutos sobre WebMCP: 24 diapositivas y 3 demos',language:'Spanish',city:'Ciudad por confirmar'},
  sources:[
    {title:'Documentación oficial de WebMCP · Chrome for Developers',url:'https://developer.chrome.com/docs/ai/webmcp'},
    {title:'WebMCP y agentes en Chrome',url:'https://developer.chrome.com/docs/ai/agents'},
    {title:'Herramientas WebMCP más seguras',url:'https://developer.chrome.com/docs/ai/webmcp/secure-tools'},
    {title:'Seguridad de agentes para WebMCP (Spotlighting)',url:'https://developer.chrome.com/docs/agents/security'},
    {title:'Depurar WebMCP en Chrome DevTools',url:'https://developer.chrome.com/docs/devtools/application/webmcp'},
    {title:'Extensión agente de ejemplo (GoogleChromeLabs)',url:'https://github.com/GoogleChromeLabs/webmcp-extension'},
    {title:'Demo oficial Smart Home (seguridad)',url:'https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/demos/smart-home'},
    {title:'WebMCP Evals CLI',url:'https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/webmcp-evals'}
  ],
  slides:[
    {id:'opening',kind:'title',title:'Tu web también<br>tiene herramientas.',subtitle:'WebMCP expone funciones y formularios de tu app<br>a agentes de IA en el navegador.',speaker:'Sebastián Gómez · Google Developer Expert (Web Technologies)',photo:'assets/sebastian-gomez.jpg',badge:'assets/gde-web-badge.svg',minutes:1.5,notes:[
      'Tu página ya sabe buscar, filtrar, armar una lista de lectura o confirmar un pedido. La pregunta es cómo darle esas acciones a un agente sin raspar el DOM ni duplicar la interfaz.',
      'En 30 minutos vemos cómo funciona WebMCP en Chrome: API imperativa y declarativa, defensa contra fatiga de permisos e Indirect Prompt Injection, depuración en DevTools y pruebas con webmcp-evals.'
    ],builds:[]},
    {id:'mcp-vs-webmcp',kind:'flow',flowType:'lanes',title:'MCP en servidor vs. WebMCP en el navegador.',minutes:1,lanes:[
      {id:'legacy',title:'MCP tradicional · Servidor / Backend',verdict:'Sin pantalla ni sesión compartida',verdictTone:'warn',tone:'yellow',nodes:[
        {title:'1. Usuario',sub:'Pide guardar un artículo'},
        {edge:'prompt',title:'2. Cliente LLM',sub:'Claude · IDE · CLI'},
        {edge:'JSON-RPC',title:'3. Servidor MCP',sub:'Otro servicio y otra auth'},
        {edge:'API / SQL',title:'4. Base de datos',sub:'Tu pestaña web no se entera'}
      ]}
    ],notes:[
      'En MCP tradicional, el usuario escribe en un cliente externo y el agente llama a un servidor MCP aparte. Tu pestaña web abierta no comparte esa sesión ni muestra el cambio en pantalla.'
    ],builds:[]},
    {id:'webmcp-lane',kind:'flow',flowType:'lanes',flowOnly:true,title:'WebMCP · En la pestaña activa.',minutes:1,lanes:[
      {id:'webmcp',title:'WebMCP · En la pestaña activa del navegador',verdict:'Misma sesión, cookies y DOM en vivo',verdictTone:'ok',tone:'blue',nodes:[
        {title:'1. Usuario',sub:'Con tu app abierta'},
        {edge:'prompt',title:'2. Agente',sub:'Gemini · Extensión · DevTools'},
        {edge:'modelContext',title:'3. Tu Web App (JS / HTML)',sub:'add_to_route({ articleId })'},
        {edge:'render',title:'4. DOM en vivo',sub:'Mismas cookies y UI al instante'}
      ]}
    ],notes:[
      'Con WebMCP, ese mismo pedido corre dentro de la pestaña abierta. Usa las mismas cookies, localStorage y estado en memoria, y actualiza la pantalla frente al usuario.'
    ],builds:[]}
  ]
};
TALK.slides[0].notes=[TALK.slides[0].notes.join('\n\n')];
