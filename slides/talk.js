/* Talk content and speaker script. Separate from the event theme and navigation. */
window.TALK = {
  title:'WebMCP: herramientas de navegador con estado compartido',
  language:'es', plannedMinutes:30,
  defaults:{structure:'Charla práctica de 30 minutos sobre WebMCP: 20 diapositivas y 3 demos',language:'Spanish',city:'Bogotá'},
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
      'Hola, mi nombre es Sebastián Gómez, soy Google Developer Expert en tecnologías web. Hace un año estuve acá con ustedes explicando las APIs de inteligencia artificial del navegador, y hoy vemos el siguiente paso de esa evolución: WebMCP.',
      'Tu página ya sabe buscar, filtrar, armar una lista de lectura o confirmar un pedido. La pregunta ahora es cómo darle esas acciones a un agente sin scrapear el DOM ni duplicar la interfaz.',
      'En 30 minutos vemos cómo funciona WebMCP en Chrome con tres demos en vivo: cómo exponer funciones y formularios de tu app, cómo mejorar tus tools con esquemas, errores útiles y hints de seguridad, y al final un regalo para aplicar esto sin escribir todo el código a mano.'
    ],builds:[]},
    {id:'mcp-vs-webmcp',kind:'flow',flowType:'lanes',title:'El gap actual: tu IA corre fuera de tu pestaña.',minutes:1.5,lanes:[
      {id:'legacy',title:'Hoy · Asistente fuera de tu pestaña',verdict:'Sin sesión ni pantalla compartida',verdictTone:'warn',tone:'yellow',nodes:[
        {title:'1. Usuario',sub:'Escribe en una app aparte'},
        {edge:'prompt',title:'2. Asistente IA',sub:'Gemini · Claude Code · IDE'},
        {edge:'por fuera',title:'3. Otra sesión',sub:'Su propio browser o scraping'},
        {edge:'aislado',title:'4. Tu pestaña abierta',sub:'No comparte sesión ni cambia'}
      ]}
    ],notes:[
      'Piensa en cómo usamos la IA hoy: abres Gemini o Claude Code y le pides que entre a un sitio, revise qué artículos hay o guarde uno en tu lista. El asistente sale por fuera —abre su propio navegador interno para scrapear la página o llama a un servicio aparte—, pero no interactúa con la pestaña que tú ya tienes abierta, no comparte tu sesión ni te muestra el cambio en vivo. Ese es el gap que WebMCP busca cerrar.'
    ],builds:[]},
    {id:'webmcp-lane',kind:'flow',flowType:'lanes',flowOnly:true,title:'WebMCP · En la pestaña activa.',minutes:1.5,lanes:[
      {id:'webmcp',title:'WebMCP · En la pestaña activa del navegador',verdict:'Misma sesión, cookies y DOM en vivo',verdictTone:'ok',tone:'blue',nodes:[
        {title:'1. Usuario',sub:'Con tu app abierta'},
        {edge:'prompt',title:'2. Agente en Chrome',sub:'Extensión WebMCP · DevTools'},
        {edge:'modelContext',title:'3. Tu Web App (JS / HTML)',sub:'Expone tools: add_to_route'},
        {edge:'render',title:'4. DOM en vivo',sub:'Mismas cookies y UI al instante'}
      ]}
    ],notes:[
      'Aquí hay un punto honesto e importante: todavía existe un gap con tus herramientas externas. Un cliente suelto fuera del navegador no puede meterse en tu pestaña abierta, y una página normal no expone acciones por sí sola.\n\nPara lograrlo hoy necesitas dos piezas: en el navegador, un agente conectado a la pestaña (hoy, al ser experimental, usamos la extensión de WebMCP o DevTools); y en tu app, exponer tus herramientas mediante el contrato estándar de WebMCP —sin acoplarte a una extensión específica—. Al juntar ambas piezas, el pedido corre dentro de tu pestaña abierta, usa las mismas cookies, localStorage y estado en memoria, y actualiza la pantalla frente a ti.'
    ],builds:[]}
  ]
};
TALK.slides[0].notes=[TALK.slides[0].notes.join('\n\n')];
