(() => {
  const mockup=document.body.dataset.mockup==='true';
  if(window.self!==window.top)document.body.classList.add('embedded-preview');
  const slides=mockup?TALK.slides.slice(0,3):TALK.slides;
  const params=new URLSearchParams(location.search);
  const city=params.get('city')||TALK.defaults.city;
  const planned=Number(params.get('minutes'))>0?Number(params.get('minutes')):TALK.plannedMinutes;
  const viewport=document.querySelector('#viewport');
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=s=>String(s||'').replace(/<br\s*\/?>/gi,' ');
  const channelName=params.get('session')||'sg-webmcp-talk';
  let state={index:0,step:0,startedAt:null,pausedAt:null,pausedMs:0};

  const CLOCK_TRANSITIONS=Object.freeze({
    idle:Object.freeze({TOGGLE:'running',START:'running',PAUSE:'idle',RESET:'idle'}),
    running:Object.freeze({TOGGLE:'paused',START:'running',PAUSE:'paused',RESET:'idle'}),
    paused:Object.freeze({TOGGLE:'running',START:'running',PAUSE:'paused',RESET:'idle'})
  });
  function normalizeClockEvent(action){
    if(!action||action==='toggle'||action==='clock'||action==='TOGGLE')return 'TOGGLE';
    if(action==='start'||action==='start-clock'||action==='START')return 'START';
    if(action==='pause'||action==='pause-clock'||action==='PAUSE')return 'PAUSE';
    if(action==='reset'||action==='reset-clock'||action==='RESET')return 'RESET';
    return null;
  }
  function deriveClock(s,plannedMinutes,now=Date.now()){
    const clockState=!s.startedAt?'idle':s.pausedAt?'paused':'running';
    const elapsed=s.startedAt?Math.max(0,((s.pausedAt||now)-s.startedAt-(s.pausedMs||0))/1000):0;
    return {clockState,elapsed,overrun:plannedMinutes>0&&elapsed>=plannedMinutes*60};
  }
  function transitionClock(s,action,now=Date.now()){
    const event=normalizeClockEvent(action);
    const current=!s.startedAt?'idle':s.pausedAt?'paused':'running';
    const next=event?CLOCK_TRANSITIONS[current][event]:current;
    if(next===current)return s;
    if(next==='idle')return {...s,startedAt:null,pausedAt:null,pausedMs:0};
    if(current==='idle'&&next==='running')return {...s,startedAt:now,pausedAt:null,pausedMs:0};
    if(current==='running'&&next==='paused')return {...s,pausedAt:now};
    if(current==='paused'&&next==='running')return {...s,pausedMs:(s.pausedMs||0)+Math.max(0,now-s.pausedAt),pausedAt:null};
    return s;
  }
  function syncClockBodyState(){
    const snap=deriveClock(state,planned);
    document.body.dataset.clockState=snap.clockState;
    document.body.dataset.clockOverrun=String(snap.overrun);
    return snap;
  }

  const ANIMATION_TRANSITIONS=Object.freeze({
    inactive:Object.freeze({SYNC_SLIDE:['inactive','playing','paused_user','paused_hidden','reduced_motion'],TAB_HIDDEN:'inactive',TAB_VISIBLE:'inactive',MOTION_CHANGE:'inactive'}),
    playing:Object.freeze({SYNC_SLIDE:['inactive','playing'],USER_TOGGLE:'paused_user',USER_PAUSE:'paused_user',USER_PLAY:'playing',TAB_HIDDEN:'paused_hidden',TAB_VISIBLE:'playing',MOTION_CHANGE:['playing','reduced_motion']}),
    paused_user:Object.freeze({SYNC_SLIDE:['inactive','paused_user'],USER_TOGGLE:['playing','paused_hidden'],USER_PAUSE:'paused_user',USER_PLAY:['playing','paused_hidden'],TAB_HIDDEN:'paused_user',TAB_VISIBLE:'paused_user',MOTION_CHANGE:'paused_user'}),
    paused_hidden:Object.freeze({SYNC_SLIDE:['inactive','paused_hidden'],USER_TOGGLE:'paused_user',USER_PAUSE:'paused_user',USER_PLAY:'paused_hidden',TAB_HIDDEN:'paused_hidden',TAB_VISIBLE:['playing','reduced_motion'],MOTION_CHANGE:['paused_hidden','reduced_motion']}),
    reduced_motion:Object.freeze({SYNC_SLIDE:['inactive','reduced_motion'],USER_TOGGLE:['playing','paused_hidden'],USER_PAUSE:'paused_user',USER_PLAY:['playing','paused_hidden'],TAB_HIDDEN:'reduced_motion',TAB_VISIBLE:'reduced_motion',MOTION_CHANGE:['playing','paused_hidden','reduced_motion']})
  });
  const TRANSITION_TRANSITIONS=Object.freeze({
    idle:Object.freeze({START:'transitioning',SKIP:'idle',FINISH:'idle',FAIL:'idle'}),
    transitioning:Object.freeze({START:'transitioning',SKIP:'idle',FINISH:'idle',FAIL:'idle'})
  });
  let flowAnim={lanesStep:3,brokerSource:0,brokerStep:2,routeAdded:true,userIntent:'auto',state:'inactive',timer:null};
  let transitionMachine={state:'idle',direction:'none',handle:null};
  const reducedMotionMedia=matchMedia('(prefers-reduced-motion: reduce)');
  const reduced=()=>reducedMotionMedia.matches;
  const isAmbientSlide=slide=>Boolean(slide&&slide.kind==='flow');
  function stopFlowTimer(){if(flowAnim.timer){clearInterval(flowAnim.timer);flowAnim.timer=null;}}
  function syncFlowBodyState(){
    document.body.dataset.animationState=flowAnim.state;
    document.body.classList.toggle('flow-paused',flowAnim.state!=='playing');
  }
  function startFlowTimer(){
    if(flowAnim.timer)return;
    flowAnim.timer=setInterval(()=>{
      const s=slides[state.index];
      if(!isAmbientSlide(s)||document.hidden||flowAnim.state!=='playing'){sendAnimation(document.hidden?'TAB_HIDDEN':'SYNC_SLIDE');return;}
      if(s.flowType==='lanes'){
        flowAnim.lanesStep=(flowAnim.lanesStep+1)%4;
      }else if(s.flowType==='broker'){
        flowAnim.brokerStep=(flowAnim.brokerStep+1)%3;
        flowAnim.routeAdded=flowAnim.brokerStep===2;
      }
      const container=viewport.querySelector('.slide-content');
      if(container){
        container.innerHTML=body(s);
      }
    },1350);
  }
  function sendAnimation(event){
    if(event==='USER_TOGGLE')flowAnim.userIntent=flowAnim.state==='playing'?'pause':'play';
    else if(event==='USER_PAUSE')flowAnim.userIntent='pause';
    else if(event==='USER_PLAY')flowAnim.userIntent='play';
    else if(event==='MOTION_CHANGE'&&flowAnim.userIntent==='play'&&reduced())flowAnim.userIntent='auto';
    const ambient=isAmbientSlide(slides[state.index]);
    const next=!ambient?'inactive':flowAnim.userIntent==='pause'?'paused_user':(reduced()&&flowAnim.userIntent!=='play')?'reduced_motion':document.hidden?'paused_hidden':'playing';
    flowAnim.state=next;
    syncFlowBodyState();
    if(next==='playing')startFlowTimer();
    else stopFlowTimer();
    return next;
  }
  function sendTransition(event,direction='none',handle=null){
    if((event==='SKIP'||event==='START')&&transitionMachine.handle){
      try{transitionMachine.handle.skipTransition();}catch(e){}
    }
    const next=TRANSITION_TRANSITIONS[transitionMachine.state][event]||transitionMachine.state;
    transitionMachine={state:next,direction:next==='transitioning'?direction:'none',handle:next==='transitioning'?handle:null};
    document.body.dataset.transitionState=transitionMachine.state;
  }
  document.addEventListener('visibilitychange',()=>sendAnimation(document.hidden?'TAB_HIDDEN':'TAB_VISIBLE'));
  reducedMotionMedia.addEventListener?.('change',()=>{
    sendAnimation('MOTION_CHANGE');
    const s=slides[state.index],container=viewport.querySelector('.slide-content');
    if(s?.kind==='flow'&&container){
      container.innerHTML=body(s);
    }
  });
  let presenter=null,touchStartX=null,touchStartY=null;
  const seenCommands=new Set();
  let channel;
  try{channel=new BroadcastChannel(channelName);}catch(e){/* window messaging remains available. */}
  function parse(){const match=location.hash.match(/^#(\d+)(?:\.(\d+))?$/);const index=Math.max(0,Math.min(slides.length-1,(Number(match?.[1])||1)-1));return {index,step:Math.max(0,Math.min(slides[index].builds.length,Number(match?.[2])||0))};}
  function scale(){document.documentElement.style.setProperty('--scale',Math.min(innerWidth/1600,innerHeight/900));}
  function codeLine(line){
    const tokens=line.split(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/.*$|<!--.*?-->|\b(?:async|await|const|function|if|return|new|try|catch|true|false|form|input|button|toolname|tooldescription|toolautosubmit|toolparamdescription)\b)/g);
    return tokens.map(token=>{const kind=/^["']/.test(token)?'string':(token.startsWith('//')||token.startsWith('<!--'))?'comment':/^(async|await|const|function|if|return|new|try|catch|true|false|form|input|button|toolname|tooldescription|toolautosubmit|toolparamdescription)$/.test(token)?'keyword':'';return kind?`<span class="code-${kind}">${escape(token)}</span>`:escape(token);}).join('');
  }
  function stepBanner(slide){
    const total=slide.builds.length;
    const callout=slide.stepCallouts?.[state.step]||'';
    if(!callout&&!total)return '';
    const prefix=`${state.step+1}/${total+1}`;
    return `<div class="code-step-banner"><span class="step-index">${prefix}</span><span class="step-callout">${escape(callout||slide.builds[state.step-1]||'')}</span></div>`;
  }
  function body(slide){
    if(slide.kind==='code'){
      const focus=slide.codeFocus[state.step]||[];
      const hasLegend=Boolean(slide.codeLegend?.length);
      const dense=hasLegend?' has-legend':slide.code.split('\n').length>11?' is-compact':'';
      const legendHtml=hasLegend?`<div class="code-legend${slide.codeLegend.length===3?' cols-3':''}">${slide.codeLegend.map(item=>{const req=item.step??0,pending=req>state.step,current=req===state.step;return `<div class="code-legend-card ${item.color||'blue'}${current?' is-current':''}${req?' build':''}${pending?' pending':''}" ${pending?'aria-hidden="true" inert':''}><span class="code-legend-tag">${escape(item.tag)}</span><span class="code-legend-desc">${escape(item.desc)}</span></div>`;}).join('')}</div>`:stepBanner(slide);
      const demoLink=slide.codeDemo?`<a href="${I18N.url('../demos/'+escape(slide.codeDemo)+'.html')}" target="_blank" rel="noopener">${I18N.lang==='es'?'Abrir demo':'Open demo'} ↗</a>`:'';
      const refLink=slide.codeRef?`<a href="${escape(slide.codeRef.href)}" target="_blank" rel="noopener">${escape(slide.codeRef.label)} ↗</a>`:'';
      const linksHtml=(demoLink||refLink)?`<div class="code-links">${demoLink}${refLink}</div>`:'';
      const qrHtml=slide.codeDemo?`<figure class="qr-card qr-card-code"><img src="assets/qr/demo-${escape(slide.codeDemo)}.svg" alt="QR · ${escape(slide.codeDemo)}" width="104" height="104"><figcaption><strong>${I18N.lang==='es'?'Escanea el demo':'Scan the demo'}</strong><span>${escape(slide.codeDemo)}.html</span></figcaption></figure>`:'';
      return `<div class="code-copy${qrHtml?' has-qr':''}"><h2>${slide.title}</h2><p class="subhead">${slide.subtitle}</p>${linksHtml}${qrHtml}</div><div class="code-example"><p class="code-label" id="code-label">${escape(slide.codeLabel)}</p><pre class="code-window${dense}" role="region" aria-labelledby="code-label"><code lang="${I18N.lang}">${slide.code.split('\n').map((line,i)=>`<span class="code-line${focus.includes(i+1)?' is-focused':''}" data-line="${i+1}">${codeLine(line)}</span>`).join('\n')}</code></pre>${legendHtml}</div>`;
    }
    const visualExtras=slide=>{
      let html='';
      if(slide.snippet){
        const sn=slide.snippet,req=sn.step??0,pending=req>state.step,focus=sn.focus||[];
        html+=`<div class="visual-code-box ${req?'build':''} ${pending?'pending':''}" ${pending?'aria-hidden="true" inert':''}>${sn.label?`<span class="visual-code-label">${escape(sn.label)}</span>`:''}<pre class="visual-code"><code>${sn.code.split('\n').map((l,i)=>`<span class="vc-line${focus.includes(i+1)?' is-focused':''}">${codeLine(l)}</span>`).join('')}</code></pre></div>`;
      }
      if(slide.actionLink){
        const al=slide.actionLink,req=al.step??0,pending=req>state.step;
        html+=`<a class="visual-cta ${al.tone||'blue'} ${req?'build':''} ${pending?'pending':''}" href="${I18N.url(al.href)}" target="_blank" rel="noopener" ${pending?'aria-hidden="true" tabindex="-1"':''}>${escape(al.label)} ↗</a>`;
        if(al.qr){
          html+=`<figure class="qr-card qr-card-compact ${req?'build':''} ${pending?'pending':''}" ${pending?'aria-hidden="true" inert':''}><img src="${escape(al.qr)}" alt="QR · ${escape(al.qrCaption||al.label)}" width="80" height="80"><figcaption><strong>${escape(al.qrCaption||(I18N.lang==='es'?'Escanea el demo':'Scan the demo'))}</strong>${al.qrSub?`<span>${escape(al.qrSub)}</span>`:''}</figcaption></figure>`;
        }
      }
      return html;
    };
    if(slide.kind==='meme'){
      const m=slide.meme||{};
      const cards=(slide.points||[]).map((p,i)=>{
        const stepReq=p.step??0;
        const pending=stepReq>state.step;
        return `<div class="visual-point ${p.color||'blue'} ${stepReq?'build':''} ${pending?'pending':''}" ${pending?'aria-hidden="true" inert':''}><strong>${escape(p.title)}</strong><span>${escape(p.body)}</span></div>`;
      }).join('');
      const denseClass=(slide.snippet||slide.actionLink)?' is-dense':'';
      const qrClass=slide.actionLink?.qr?' has-qr':'';
      const splitBar=m.leftLabel&&m.rightLabel?`<div class="meme-split-bar"><span class="meme-pill left">${escape(m.leftLabel)}</span><span class="meme-pill right">${escape(m.rightLabel)}</span></div>`:'';
      const topBar=m.top?`<div class="meme-caption meme-top">${escape(m.top)}</div>`:'';
      const bottomBar=m.bottom?`<div class="meme-caption meme-bottom">${escape(m.bottom)}</div>`:'';
      return `<div class="visual-copy${denseClass}${qrClass}"><p class="eyebrow">${escape(slide.eyebrow||'')}</p><h2>${slide.title}</h2>${slide.subtitle?`<p class="subhead">${slide.subtitle}</p>`:''}${cards?`<div class="visual-points">${cards}</div>`:''}${visualExtras(slide)}</div><div class="visual-stage"><figure class="meme-frame">${topBar}${splitBar}<div class="meme-img-wrap"><img src="${escape(m.src)}" alt="${escape(m.alt||clean(slide.title))}" loading="eager"></div>${bottomBar}</figure></div>`;
    }
    if(slide.kind==='media'){
      const items=slide.media||[];
      const cards=(slide.points||[]).map(p=>{
        const stepReq=p.step??0;
        const pending=stepReq>state.step;
        return `<div class="visual-point ${p.color||'blue'} ${stepReq?'build':''} ${pending?'pending':''}" ${pending?'aria-hidden="true" inert':''}><strong>${escape(p.title)}</strong><span>${escape(p.body)}</span></div>`;
      }).join('');
      const denseClass=(slide.snippet||slide.actionLink)?' is-dense':'';
      const layoutClass=items.length===1?'media-grid-1':items.length===2?'media-grid-2':'media-grid-3';
      const figs=items.map(it=>`<figure class="media-card ${it.tone||''}"><div class="media-bar"><span class="media-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="media-badge">${escape(it.badge||'')}</span></div><div class="media-img-wrap"><img src="${escape(it.src)}" alt="${escape(it.alt||it.caption||'')}" loading="eager"></div>${it.caption?`<figcaption>${escape(it.caption)}</figcaption>`:''}</figure>`).join('');
      return `<div class="visual-copy${denseClass}"><p class="eyebrow">${escape(slide.eyebrow||'')}</p><h2>${slide.title}</h2>${slide.subtitle?`<p class="subhead">${slide.subtitle}</p>`:''}${cards?`<div class="visual-points">${cards}</div>`:''}${visualExtras(slide)}</div><div class="visual-stage"><div class="media-grid ${layoutClass}">${figs}</div></div>`;
    }
    if(slide.kind==='title'){
      const portrait=slide.photo?`<div class="speaker-Visual"><img class="speaker-photo" src="${escape(slide.photo)}" alt="${escape(slide.speaker)}" width="310" height="380" fetchpriority="high">${slide.badge?`<img class="speaker-badge" src="${escape(slide.badge)}" alt="Google Developer Expert · Web Technologies" width="360" height="96">`:''}</div>`:'';
      return `<div class="title-layout"><div class="title-copy"><h1>${slide.title}</h1><p class="subhead">${slide.subtitle}</p><p class="speaker">${slide.speaker}</p></div>${portrait}</div>`;
    }
    if(slide.kind==='diagram'){
      const geminiSvg=`<svg class="gemini-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><defs><linearGradient id="gemini-grad-diag" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1b72e8"/><stop offset="52%" stop-color="#9b72cb"/><stop offset="100%" stop-color="#d96570"/></linearGradient></defs><path fill="url(#gemini-grad-diag)" d="M12 1.8c.5 5.4 4.8 9.7 10.2 10.2-5.4.5-9.7 4.8-10.2 10.2-.5-5.4-4.8-9.7-10.2-10.2C7.2 11.5 11.5 7.2 12 1.8Z"/></svg>`;
      const sub=String(slide.subtitle||'').replace('<span class="gemini-prompt">',`<span class="gemini-prompt">${geminiSvg}`);
      const singleLine=!String(slide.title||'').includes('<br');
      return `<h2${singleLine?' class="single-line"':''}>${slide.title}</h2><p class="subhead">${sub}</p><div class="diagram-row">${slide.diagram.map((d,i)=>`${i?'<span class="arrow build '+(d.step>state.step?'pending':'')+'" aria-hidden="true">'+(d.arrow||'→')+'</span>':''}<div class="diagram-card ${d.color}${d.code?' has-code':''}${d.items?' has-items':''} ${d.step?'build':''} ${d.step>state.step?'pending':''}" ${d.step>state.step?'aria-hidden="true" inert':''}><strong>${d.title}</strong>${d.body?`<span class="diagram-label">${d.body}</span>`:''}${d.items?`<ul class="diagram-items">${d.items.map(it=>`<li><span class="diagram-item-label">${escape(it.label)}</span><code>${escape(it.value)}</code></li>`).join('')}</ul>`:''}${d.code?`<pre class="diagram-code"><code>${d.code.split('\n').map(codeLine).join('\n')}</code></pre>`:''}</div>`).join('')}</div>`;
    }
    if(slide.kind==='flow'){
      const es=I18N.lang==='es';
      const geminiSvg=`<svg class="gemini-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><defs><linearGradient id="gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1b72e8"/><stop offset="52%" stop-color="#9b72cb"/><stop offset="100%" stop-color="#d96570"/></linearGradient></defs><path fill="url(#gemini-grad)" d="M12 1.8c.5 5.4 4.8 9.7 10.2 10.2-5.4.5-9.7 4.8-10.2 10.2-.5-5.4-4.8-9.7-10.2-10.2C7.2 11.5 11.5 7.2 12 1.8Z"/></svg>`;
      const promptText=es?'Quiero que agregues a mi lista de blog posts por leer el artículo sobre "modelos pequeños"':'I want you to add the article about "small models" to my blog posts reading list';
      if(slide.flowType==='lanes'){
        const activeIdx=flowAnim.lanesStep;
        const traceById={
          legacy:es?[
            'Prompt fuera del browser: artículo "modelos pequeños"',
            'Gemini o Claude Code corre aparte de tu pestaña',
            'Abre su propio browser o scrapea la web por fuera',
            '⚠️ Tu pestaña abierta sigue en 0: no se entera'
          ]:[
            'Prompt outside the browser: "small models" article',
            'Gemini or Claude Code runs outside your active tab',
            'Spins up its own browser or scrapes the page',
            '⚠️ Your open tab stays at 0: unaware of the action'
          ],
          webmcp:es?[
            'Prompt desde el panel del navegador con tu app abierta',
            'El agente descubre tools en document.modelContext',
            'Ejecuta add_to_route({ articleId }) en tu propio código',
            '✅ DOM en vivo: Lista por leer (1) · «Modelos pequeños»'
          ]:[
            'Prompt inside Chrome with your web app already open',
            'Agent discovers page tools via document.modelContext',
            'Runs add_to_route({ articleId }) in your own JS',
            '✅ Live DOM: Reading list (1) · “Small models”'
          ]
        };
        const heading=slide.flowOnly?'':`<h2 class="single-line">${slide.title}</h2>`;
        return `${heading}<div class="flow-toolbar"><span class="prompt-chip">${geminiSvg}<span>Prompt: <strong>«${escape(promptText)}»</strong></span></span></div><div class="flow-lanes ${slide.flowOnly?'flow-lanes-single':''}">${slide.lanes.map(lane=>{const isWeb=lane.id==='webmcp';const traces=traceById[lane.id]||traceById.legacy;return `<div class="flow-lane ${lane.tone} ${lane.step?'build':''} ${lane.step>state.step?'pending':''}" ${lane.step>state.step?'aria-hidden="true"':''}><div class="flow-lane-head"><strong>${lane.title}</strong><span class="flow-trace-pill ${isWeb&&activeIdx===3?'trace-ok':!isWeb&&activeIdx===3?'trace-warn':''}">${traces[activeIdx]}</span><span class="flow-Verdict ${lane.verdictTone}">${lane.verdict}</span></div><div class="flow-nodes">${lane.nodes.map((n,idx)=>`${idx?`<span class="flow-edge ${idx<=activeIdx?'is-lit':''} ${idx===activeIdx?'is-pulsing':''}"><em>${n.edge||''}</em><span class="edge-track"><span class="edge-dot"></span>→</span></span>`:''}<div class="flow-node ${idx===activeIdx?'is-active-node':idx<activeIdx?'is-visited-node':''}"><span class="flow-node-title">${n.title}</span><span class="flow-node-sub">${n.sub}</span></div>`).join('')}</div></div>`;}).join('')}</div>`;
      }
      if(slide.flowType==='broker'){
        const bStep=flowAnim.brokerStep;
        const activeAgentName=slide.agentComment||'Gemini Nano / Chrome';
        const heading=slide.flowOnly?'':`<h2 class="single-line">${slide.title}</h2>`;
        return `${heading}<div class="flow-toolbar"><span class="prompt-chip">${geminiSvg}<span>Prompt: <strong>«${escape(promptText)}»</strong></span></span></div><div class="flow-broker"><div class="broker-sources">${slide.sources.map(src=>`<div class="broker-card ${src.color} is-selected-source ${bStep===0?'is-active-node':''}"><div class="broker-card-head"><strong>${src.title}</strong></div><div class="chip-row">${src.chips.map(c=>`<span class="chip">${c}</span>`).join('')}</div><span class="diagram-label">${src.body}</span></div>`).join('')}</div><span class="flow-join ${bStep>=1?'is-lit':''} ${bStep===1?'is-pulsing':''}" aria-hidden="true"><em>prompt</em>→</span><div class="broker-hub ${bStep===1?'is-active-node':''}"><span class="hub-badge">${slide.hub.badge}</span><strong>${slide.hub.title}</strong><pre class="hub-code"><code>// ${activeAgentName}
callTool("add_to_route", {
  articleId: "models"
}) // ✓ JSON Schema OK</code></pre><ul class="hub-list">${slide.hub.points.map(p=>`<li>${p}</li>`).join('')}</ul></div><span class="flow-join ${bStep>=2?'is-lit':''} ${bStep===2?'is-pulsing':''}" aria-hidden="true"><em>execute</em>→</span><div class="broker-target green ${bStep===2?'is-active-node':''}"><span class="hub-badge">${slide.target.badge}</span><strong>${slide.target.title}</strong><div class="mini-dom-preview"><div class="mini-dom-bar"><span>🌐 reading-route.html</span><strong>${es?'Por leer':'To read'}: ${flowAnim.routeAdded?1:0}</strong></div><div class="mini-dom-body">${flowAnim.routeAdded?`<div class="mini-dom-item"><span>✓ ${es?'Artículo: «Modelos pequeños»':'Article: “Small models”'}</span><span class="mini-dom-btn">${es?'Añadido':'Added'}</span></div>`:`<div class="mini-dom-empty"><span>${es?'Esperando ejecución de tool…':'Waiting for tool execution…'}</span><span class="mini-dom-btn">0</span></div>`}</div></div><span class="diagram-label">${slide.target.body}</span></div></div>`;
      }
    }
    if(slide.kind==='demo'){
      const openLabel=I18N.lang==='es'?`Abrir ${slide.demoTitle} ↗`:`Open ${slide.demoTitle} ↗`;
      const qrSrc=`assets/qr/demo-${escape(slide.demo)}.svg`;
      const scanLabel=I18N.lang==='es'?'Escanea el demo':'Scan demo';
      if(slide.demo==='reading-route'){
        const shortOpen=I18N.lang==='es'?'Abrir demo ↗':'Open demo ↗';
        return `<div class="demo-embed-header"><div><p class="eyebrow">Demo ${slide.number} · ${escape(slide.demo)}.html</p><h2 class="single-line">${clean(slide.title)}</h2><p class="subhead">${slide.subtitle}</p></div><div class="demo-embed-actions"><a class="demo-link" href="${I18N.url('../demos/'+slide.demo+'.html')}" target="_blank" rel="noopener">${escape(shortOpen)}</a><figure class="qr-card qr-card-embed"><img src="${qrSrc}" alt="QR · ${escape(slide.demo)}" width="86" height="86"><figcaption>${escape(scanLabel)}</figcaption></figure></div></div><div class="demo-embed-wrap"><iframe class="demo-embed-frame" src="${I18N.url('../demos/'+slide.demo+'.html')}" allow="tools" title="${escape(slide.demoTitle)}"></iframe></div>`;
      }
      const steps=slide.steps?.length?`<ol class="demo-steps">${slide.steps.map(s=>`<li>${escape(s)}</li>`).join('')}</ol>`:'';
      return `<div class="demo-header"><div><p class="eyebrow">Demo ${slide.number} · ${escape(slide.demo)}.html</p><h2>${slide.title}</h2><p class="subhead">${slide.subtitle}</p></div><div class="demo-embed-actions"><a class="demo-link" href="${I18N.url('../demos/'+slide.demo+'.html')}" target="_blank" rel="noopener">${escape(openLabel)}</a><figure class="qr-card qr-card-embed"><img src="${qrSrc}" alt="QR · ${escape(slide.demo)}" width="96" height="96"><figcaption>${escape(scanLabel)}</figcaption></figure></div></div>${steps}`;
    }
    if(slide.kind==='steps')return `<h2>${slide.title}</h2><div class="diagram-row">${slide.items.map((s,i)=>`<div class="diagram-card ${['blue','yellow','green'][i%3]} build ${i>state.step?'pending':''}" ${i>state.step?'aria-hidden="true" inert':''}><strong>${s.title}</strong><span class="diagram-label">${s.body}</span></div>`).join('')}</div>`;
    if(slide.kind==='statement'){
      const specs=slide.specs?.length?`<dl class="spec-list">${slide.specs.map(s=>`<div class="spec-row"><dt>${escape(s.term)}</dt><dd>${escape(s.detail)}</dd></div>`).join('')}</dl>`:'';
      const demoCards=slide.demoCards?.length?`<div class="demo-qr-grid">${slide.demoCards.map(d=>`<div class="demo-qr-card ${d.tone||'blue'}"><a class="demo-qr-link" href="${I18N.url(d.href)}" target="_blank" rel="noopener"><strong>${escape(d.title)} ↗</strong><span>${escape(d.sub)}</span></a><figure class="qr-box"><img src="${escape(d.qr)}" alt="QR · ${escape(d.title)}" width="112" height="112"></figure></div>`).join('')}</div>`:'';
      const links=slide.links?.length?`<div class="resource-links">${slide.links.map(l=>`<a class="resource-pill" href="${I18N.url(l.href)}" target="_blank" rel="noopener">${escape(l.label)} ↗</a>`).join('')}</div>`:'';
      return `<p class="eyebrow">${slide.eyebrow||''}</p><h1 class="compact">${slide.title}</h1><p class="subhead ${slide.builds.length?'build':''} ${state.step<1&&slide.builds.length?'pending':''}"${state.step<1&&slide.builds.length?' aria-hidden="true" inert':''}>${slide.subtitle}</p>${demoCards}${specs}${links}`;
    }
    if(slide.kind==='qr-spotlight'){
      const q=slide.qrSpotlight||{};
      const displayUrl=q.displayUrl||String(q.href||'').replace(/^https?:\/\//,'');
      return `<div class="visual-copy"><p class="closing-pill">${escape(slide.eyebrow||'')}</p><h2>${slide.title}</h2>${slide.subtitle?`<p class="subhead">${slide.subtitle}</p>`:''}<a class="visual-cta ${q.tone||'yellow'} visual-cta-lg" href="${escape(q.href||'#')}" target="_blank" rel="noopener">${escape(q.ctaLabel||'Abrir enlace')} ↗</a><a class="visual-url-pill" href="${escape(q.href||'#')}" target="_blank" rel="noopener">${escape(displayUrl)}</a></div><div class="visual-stage"><a class="qr-spotlight-card" href="${escape(q.href||'#')}" target="_blank" rel="noopener"><div class="qr-spotlight-head">${escape(q.cardTitle||'Escanea con tu cámara')}</div><div class="qr-spotlight-img"><img src="${escape(q.src||'')}" alt="QR · ${escape(clean(slide.title))}" width="430" height="430" loading="eager"></div><div class="qr-spotlight-foot">${escape(displayUrl)}</div></a></div>`;
    }
    if(slide.kind==='quiz'){
      const revealed=state.step>=1;
      const opts=(slide.options||[]).map(o=>{
        const cls=revealed?(o.correct?'is-correct':'is-dimmed'):'';
        const badge=revealed&&o.correct?`<span class="quiz-ok-pill">${I18N.lang==='es'?'✓ Correcta':'✓ Correct'}</span>`:'';
        const desc=revealed&&o.label?`<span class="quiz-opt-desc">${escape(o.label)}</span>`:'';
        return `<div class="quiz-option ${cls}"><div class="quiz-opt-head"><span class="quiz-letter">${escape(o.letter)}</span><code>${escape(o.code)}</code>${badge}</div>${desc}</div>`;
      }).join('');
      const explain=slide.explanation?`<div class="quiz-answer-bar build ${revealed?'':'pending'}" ${revealed?'':'aria-hidden="true" inert'}><strong>${I18N.lang==='es'?'RESPUESTA':'ANSWER'}</strong><span>${escape(slide.explanation)}</span></div>`:'';
      return `<p class="closing-pill quiz-pill">${escape(slide.eyebrow||'')}</p><h2 class="quiz-question">${slide.title}</h2>${slide.subtitle?`<p class="subhead">${slide.subtitle}</p>`:''}<div class="quiz-grid">${opts}</div>${explain}`;
    }
    if(slide.kind==='closing'){
      const socials=(slide.socials||[]).map(s=>`<a class="social-qr-card ${s.tone||'blue'}" href="${escape(s.href)}" target="_blank" rel="noopener"><span class="social-qr-head">${escape(s.label)} ↗</span><div class="social-qr-img"><img src="${escape(s.qr)}" alt="QR · ${escape(s.label)}" width="136" height="136"></div><span class="social-qr-handle">${escape(s.handle)}</span></a>`).join('');
      const portrait=slide.photo?`<div class="closing-speaker"><img class="closing-photo" src="${escape(slide.photo)}" alt="${escape(slide.speakerName||'')}" width="230" height="285">${slide.badge?`<img class="closing-badge" src="${escape(slide.badge)}" alt="Google Developer Expert · Web Technologies" width="290">`:''}<div class="closing-meta"><strong>${escape(slide.speakerName||'')}</strong><span>${escape(slide.speakerRole||'')}</span>${slide.speakerTitle?`<span class="closing-title">${escape(slide.speakerTitle)}</span>`:''}${slide.speakerSite?`<a class="closing-site" href="${escape(slide.speakerSiteUrl||'https://'+slide.speakerSite)}" target="_blank" rel="noopener">${escape(slide.speakerSite)}</a>`:''}</div></div>`:'';
      return `<div class="closing-wrap"><div class="closing-copy"><p class="closing-pill">${escape(slide.eyebrow||'')}</p><h1>${slide.title}</h1><p class="subhead">${slide.subtitle||''}</p><div class="social-qr-grid">${socials}</div></div>${portrait}</div>`;
    }
    return `<h2>${slide.title}</h2><p class="subhead">${slide.subtitle||''}</p>`;
  }
  function ensureControls(){
    const bar=document.querySelector('.controlbar');
    if(!bar||bar.querySelector('#slide-select'))return;
    const select=document.createElement('select');
    select.id='slide-select';
    select.setAttribute('aria-label',I18N.lang==='es'?'Ir a la diapositiva':'Jump to slide');
    select.innerHTML=slides.map((s,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} · ${escape(clean(s.title))}</option>`).join('');
    select.addEventListener('change',e=>{navigate(Number(e.target.value),0);e.target.blur();});
    const stepBadge=document.createElement('span');
    stepBadge.id='step-status';
    stepBadge.className='step-status';
    const nextBtn=bar.querySelector('#next');
    bar.insertBefore(select,nextBtn);
    bar.insertBefore(stepBadge,nextBtn);
  }
  function paint(){
    ensureControls();
    syncClockBodyState();
    sendAnimation('SYNC_SLIDE');
    const slide=slides[state.index];
    document.body.style.setProperty('--slide-bg',slide.background||'var(--paper)');
    const stepSuffix=slide.builds.length?` · ${I18N.lang==='es'?'paso':'step'} ${state.step}/${slide.builds.length}`:'';
    viewport.innerHTML=`<article class="slide" tabindex="-1" aria-label="${state.index+1} de ${slides.length}"><div class="panel-shape" aria-hidden="true"></div><div class="lockup" aria-label="Web @DevFest ${escape(city)}"><span class="brace" aria-hidden="true">{</span><div class="lockup-copy">Web<br><strong>@DevFest</strong><div class="city">${escape(city)}</div></div><span class="brace" aria-hidden="true">}</span></div><div class="slide-content ${slide.kind==='code'?'code-slide':slide.kind==='meme'||slide.kind==='media'||slide.kind==='qr-spotlight'?'visual-slide':slide.kind==='title'?'title-slide':slide.kind==='closing'?'closing-slide':slide.kind==='demo'&&slide.demo==='reading-route'?'demo-embed-slide':slide.kind==='statement'&&slide.demoCards?.length?'wide statement-qr-slide':slide.kind==='quiz'?'wide quiz-slide':slide.kind==='diagram'||slide.kind==='flow'||slide.kind==='steps'||slide.kind==='demo'||slide.kind==='statement'?'wide':''}">${body(slide)}</div><span class="slide-number">${String(state.index+1).padStart(2,'0')} / ${slides.length}${stepSuffix}</span><img class="gdg-logo" src="assets/gdg-logo.png" alt="Google Developer Groups" width="636" height="192"></article>`;
    document.title=`${state.index+1}. ${clean(slide.title)} | ${TALK.title}`;
    const progress=document.querySelector('#progress');
    if(progress){
      const stepFraction=slide.builds.length?state.step/(slide.builds.length+1):0;
      progress.style.width=`${((state.index+stepFraction+1)/slides.length)*100}%`;
    }
    const select=document.querySelector('#slide-select');
    if(select)select.value=String(state.index);
    const stepBadge=document.querySelector('#step-status');
    if(stepBadge)stepBadge.textContent=slide.builds.length?`${I18N.lang==='es'?'Paso':'Step'} ${state.step}/${slide.builds.length}`:`${state.index+1}/${slides.length}`;
    const prevBtn=document.querySelector('#previous'),nextBtn=document.querySelector('#next');
    const prevFocused=prevBtn===document.activeElement,nextFocused=nextBtn===document.activeElement;
    if(prevBtn)prevBtn.disabled=state.index===0&&state.step===0;
    if(nextBtn)nextBtn.disabled=state.index===slides.length-1&&state.step>=slide.builds.length;
    if(prevFocused&&prevBtn?.disabled&&nextBtn&&!nextBtn.disabled)nextBtn.focus();
    if(nextFocused&&nextBtn?.disabled&&prevBtn&&!prevBtn.disabled)prevBtn.focus();
    announce();
  }
  function announce(){const message={type:'deck-state',state:{...state},slideCount:slides.length,plannedMinutes:planned,city,session:channelName};channel?.postMessage(message);if(presenter&&!presenter.closed)presenter.postMessage(message,location.origin==='null'?'*':location.origin);}
  function navigate(index,step=0,animate=true){
    stopFlowTimer();
    const prevIndex=state.index;
    const restoreSlideFocus=Boolean(viewport&&viewport.contains(document.activeElement)&&document.activeElement!==viewport);
    index=Math.max(0,Math.min(slides.length-1,index));
    step=Math.max(0,Math.min(slides[index].builds.length,step));
    state={...state,index,step};
    const hash=`#${index+1}.${step}`;
    if(location.hash!==hash)history.pushState(null,'',hash);
    sendTransition('SKIP');
    const routeFocus=()=>{if(restoreSlideFocus)viewport.querySelector('.slide')?.focus({preventScroll:true});};
    if(animate&&!reduced()&&document.startViewTransition){
      const transitionType=index>prevIndex?'forward':index<prevIndex?'backward':'step';
      try{
        const t=typeof ViewTransition!=='undefined'&&'types' in ViewTransition.prototype
          ?document.startViewTransition({update:paint,types:[transitionType]})
          :document.startViewTransition(paint);
        sendTransition('START',transitionType,t);
        t.finished.catch(()=>{}).finally(()=>{if(transitionMachine.handle===t)sendTransition('FINISH');routeFocus();});
      }catch(e){sendTransition('FAIL');paint();routeFocus();}
    }else{sendTransition('FINISH');paint();routeFocus();}
  }
  const fsElement=()=>document.fullscreenElement||document.webkitFullscreenElement||null;
  function syncFullscreenState(){
    const fsBtn=document.querySelector('#fullscreen');
    if(fsBtn)fsBtn.setAttribute('aria-pressed',String(Boolean(fsElement())));
  }
  function toggleFullscreen(){
    try{
      if(fsElement()){
        const exit=document.exitFullscreen?.bind(document)||document.webkitExitFullscreen?.bind(document);
        exit?.()?.catch?.(()=>{});
      }else{
        const el=document.documentElement;
        const req=el.requestFullscreen?.bind(el)||el.webkitRequestFullscreen?.bind(el);
        req?.()?.catch?.(()=>{});
      }
    }catch(e){}
  }
  document.addEventListener('fullscreenchange',syncFullscreenState);
  document.addEventListener('webkitfullscreenchange',syncFullscreenState);
  function next(){const s=slides[state.index];if(state.step<s.builds.length)navigate(state.index,state.step+1);else if(state.index<slides.length-1)navigate(state.index+1,0);}
  function previous(){if(state.step>0)navigate(state.index,state.step-1);else if(state.index>0)navigate(state.index-1,slides[state.index-1].builds.length);}
  function nextSlide(){if(state.index<slides.length-1)navigate(state.index+1,0);else navigate(state.index,slides[state.index].builds.length);}
  function previousSlide(){if(state.step>0)navigate(state.index,0);else if(state.index>0)navigate(state.index-1,0);}
  function openPresenter(){const u=new URL('presenter.html',location.href);u.searchParams.set('lang',I18N.lang);u.searchParams.set('session',channelName);u.searchParams.set('minutes',planned);u.searchParams.set('city',city);presenter=window.open(u.href,'sg-webmcp-presenter','popup,width=1360,height=900');if(!presenter)return;setTimeout(announce,300);}
  function clock(action){state=transitionClock(state,action,Date.now());syncClockBodyState();announce();}
  function toggleAnimation(){
    if(!isAmbientSlide(slides[state.index]))return flowAnim.state;
    const next=sendAnimation('USER_TOGGLE');
    const s=slides[state.index],container=viewport.querySelector('.slide-content');
    if(s&&container)container.innerHTML=body(s);
    return next;
  }
  function getAllowedCommands(clockState){
    const slide=slides[state.index];
    const cmds=['navigate','goto','clock'];
    if(state.index>0||state.step>0)cmds.push('previous','previousSlide');
    if(state.index<slides.length-1||state.step<slide.builds.length)cmds.push('next','nextSlide');
    if(clockState==='idle')cmds.push('start-clock');
    else if(clockState==='running')cmds.push('pause-clock','reset-clock');
    else cmds.push('start-clock','reset-clock');
    if(!mockup)cmds.push('openPresenter');
    if(isAmbientSlide(slide))cmds.push('toggleAnimation');
    return cmds;
  }
  function getState(){
    const {clockState,overrun}=deriveClock(state,planned);
    return {...state,clockState,overrun,animationState:flowAnim.state,transitionState:transitionMachine.state,allowedCommands:getAllowedCommands(clockState)};
  }
  function getTransitions(){
    return {clock:CLOCK_TRANSITIONS,animation:ANIMATION_TRANSITIONS,transition:TRANSITION_TRANSITIONS};
  }
  function receive(message){if(message?.type==='presenter-ready')announce();if(message?.type==='deck-command'){if(message.id&&seenCommands.has(message.id))return;if(message.id){seenCommands.add(message.id);if(seenCommands.size>128)seenCommands.delete(seenCommands.values().next().value);}const c=message.command;if(c==='next')next();if(c==='previous')previous();if(c==='clock'||c==='toggle-clock')clock('toggle');if(c==='start-clock')clock('start');if(c==='pause-clock')clock('pause');if(c==='reset-clock')clock('reset');if(c==='goto'&&Number.isInteger(message.index))navigate(message.index,message.step||0);}}
  if(channel)channel.addEventListener('message',event=>receive(event.data));
  addEventListener('message',event=>{if(event.source!==presenter)return;if(location.origin!=='null'&&event.origin!==location.origin)return;receive(event.data);});
  addEventListener('keydown',event=>{
    if(event.isComposing||event.altKey||event.ctrlKey||event.metaKey||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;
    if(['Enter',' '].includes(event.key)&&event.target.closest('a,button,summary'))return;
    if(event.shiftKey&&event.key==='ArrowRight'){event.preventDefault();nextSlide();return;}
    if(event.shiftKey&&event.key==='ArrowLeft'){event.preventDefault();previousSlide();return;}
    if(['ArrowRight','ArrowDown','PageDown',' ','Enter'].includes(event.key)){event.preventDefault();next();}
    if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(event.key)){event.preventDefault();previous();}
    if(event.key==='Home'){event.preventDefault();navigate(0);}
    if(event.key==='End'){event.preventDefault();navigate(slides.length-1);}
    if(event.key.toLowerCase()==='p'&&!mockup)openPresenter();
    if(event.key.toLowerCase()==='c')document.body.classList.toggle('hide-controls');
    if(event.key.toLowerCase()==='f')toggleFullscreen();
  });
  viewport.addEventListener('click',event=>{
    if(event.target.closest('a,button,input,select,textarea,iframe,.demo-embed-wrap'))return;
    if(window.getSelection?.()?.toString())return;
    next();
  });
  viewport.addEventListener('touchstart',event=>{if(event.touches.length===1){touchStartX=event.touches[0].clientX;touchStartY=event.touches[0].clientY;}},{passive:true});
  viewport.addEventListener('touchend',event=>{
    if(touchStartX===null||event.changedTouches.length!==1)return;
    const dx=event.changedTouches[0].clientX-touchStartX,dy=event.changedTouches[0].clientY-touchStartY;
    touchStartX=null;touchStartY=null;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4){if(dx<0)next();else previous();}
  },{passive:true});
  document.querySelector('#previous')?.addEventListener('click',e=>{previous();if(e.detail>0)e.currentTarget.blur();});
  document.querySelector('#next')?.addEventListener('click',e=>{next();if(e.detail>0)e.currentTarget.blur();});
  document.querySelector('#presenter')?.addEventListener('click',openPresenter);
  document.querySelector('#fullscreen')?.addEventListener('click',e=>{toggleFullscreen();if(e.detail>0)e.currentTarget.blur();});
  addEventListener('hashchange',()=>{sendTransition('SKIP');state={...state,...parse()};paint();});
  addEventListener('popstate',()=>{sendTransition('SKIP');state={...state,...parse()};paint();});
  addEventListener('resize',scale);
  state={...state,...parse()};scale();sendTransition('FINISH');paint();
  window.deck={next,previous,nextSlide,previousSlide,navigate,getState,getTransitions,openPresenter,clock,toggleAnimation};
})();
