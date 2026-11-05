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
    {id:'mcp-vs-webmcp',kind:'flow',flowType:'lanes',title:'MCP de servidor vs.<br>WebMCP en el navegador.',subtitle:'Dónde corre la herramienta define quién tiene la sesión y quién ve el cambio.',minutes:1,lanes:[
      {title:'MCP tradicional · Servidor / Backend',verdict:'Sin pantalla ni sesión compartida',verdictTone:'warn',tone:'yellow',nodes:[
        {title:'1. Usuario',sub:'Pide tarea en app externa'},
        {edge:'prompt',title:'2. Cliente LLM',sub:'Claude · IDE · CLI'},
        {edge:'JSON-RPC',title:'3. Servidor MCP',sub:'Otro servicio y otra auth'},
        {edge:'API / SQL',title:'4. Base de datos',sub:'Tu pestaña web no se entera'}
      ]},
      {title:'WebMCP · En la pestaña activa del navegador',verdict:'Misma sesión y DOM en vivo',verdictTone:'ok',tone:'blue',step:1,nodes:[
        {title:'1. Usuario final',sub:'Con tu web abierta'},
        {edge:'prompt',title:'2. Agente en Browser',sub:'Local o externo conectado'},
        {edge:'modelContext',title:'3. Tu Web App (JS)',sub:'Reutiliza tu propio código'},
        {edge:'render',title:'4. DOM en vivo',sub:'Ve y confirma en pantalla'}
      ]}
    ],notes:[
      'Antes de ver el código, aclaremos una duda clave: ¿en qué se diferencia WebMCP del protocolo MCP tradicional que conectamos en el backend o en el IDE? En MCP tradicional, el agente habla con un servidor aparte; la pestaña web del usuario no ve qué está pasando y tú tienes que mantener otro servicio y otra autenticación.',
      'El agente necesita actuar donde ya está la persona. Con WebMCP, las herramientas se registran dentro de la pestaña activa del navegador: reutilizan la sesión autenticada del usuario y el estado de tu frontend.',
      'Así, cuando la herramienta se ejecuta, actualiza el mismo DOM que el usuario final tiene delante de sus ojos, sin duplicar backend ni construir una segunda interfaz.'
    ],builds:['Una herramienta','Una página compartida']},
    {id:'browser-broker',kind:'flow',flowType:'broker',title:'¿Desde qué LLM o agente<br>se envía el prompt?',subtitle:'WebMCP es agnóstico al modelo: el navegador actúa como puente hacia tu web.',minutes:1,sources:[
      {title:'Opción A · LLM integrado en el navegador',color:'blue',chips:['Gemini en Chrome','Gemini Nano','Gemma 4'],body:'El usuario escribe el prompt en el panel del navegador; el modelo corre local o en la nube del browser.'},
      {title:'Opción B · Agente externo conectado',color:'yellow',step:1,chips:['Claude','Antigravity','Codex','Cursor'],body:'El agente externo se conecta al browser vía extensión o puente MCP en vez de raspar con Playwright.'}
    ],hub:{badge:'BROKER DEL NAVEGADOR',title:'navigator.modelContext',points:[
      'Descubre herramientas de la pestaña activa',
      'Valida argumentos con JSON Schema',
      'Sirve tanto a LLMs locales como externos'
    ]},target:{badge:'TU APLICACIÓN WEB',title:'registerTool({ execute })',body:'Ejecuta tu función JS dentro de la sesión activa del usuario y actualiza el DOM en tiempo real.'},notes:[
      'Segunda pregunta clave: ¿desde dónde escribe ese prompt el usuario final? ¿Desde Gemini Nano en Chrome o desde Claude, Antigravity o Codex? La respuesta es que WebMCP sirve para ambos porque es agnóstico al modelo.',
      'En la Opción A, el usuario usa un asistente integrado en el navegador o un modelo local como Gemini Nano o Gemma 4. En la Opción B, usa un agente externo como Claude, Antigravity o Codex conectado al navegador mediante una extensión o puente MCP.',
      'En ambos casos, el navegador actúa como intermediario a través de navigator.modelContext: valida el contrato JSON y ejecuta tu función directamente en la pestaña abierta.'
    ],builds:['Dos orígenes de prompt','Ejecución en tu pestaña']}
  ]
};
TALK.slides[0].notes=[TALK.slides[0].notes.join('\n\n')];
