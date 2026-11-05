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
  let flowAnim={lanesStep:3,brokerSource:0,brokerStep:2,routeAdded:true,timer:null};
  function stopFlowTimer(){if(flowAnim.timer){clearInterval(flowAnim.timer);flowAnim.timer=null;}}
  function syncFlowLoop(){
    const slide=slides[state.index];
    if(!slide||slide.kind!=='flow'||reduced()){stopFlowTimer();return;}
    if(flowAnim.timer)return;
    flowAnim.timer=setInterval(()=>{
      const s=slides[state.index];
      if(!s||s.kind!=='flow'){stopFlowTimer();return;}
      if(s.flowType==='lanes'){
        flowAnim.lanesStep=(flowAnim.lanesStep+1)%4;
      }else if(s.flowType==='broker'){
        flowAnim.brokerStep=(flowAnim.brokerStep+1)%3;
        flowAnim.routeAdded=flowAnim.brokerStep===2;
      }
      const container=viewport.querySelector('.slide-content');
      if(container)container.innerHTML=body(s);
    },1350);
  }
  let presenter=null,activeTransition=null,touchStartX=null,touchStartY=null;
  const seenCommands=new Set();
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  let channel;
  try{channel=new BroadcastChannel(channelName);}catch(e){/* window messaging remains available. */}
  function parse(){const match=location.hash.match(/^#(\d+)(?:\.(\d+))?$/);const index=Math.max(0,Math.min(slides.length-1,(Number(match?.[1])||1)-1));return {index,step:Math.max(0,Math.min(slides[index].builds.length,Number(match?.[2])||0))};}
  function scale(){document.documentElement.style.setProperty('--scale',Math.min(innerWidth/1600,innerHeight/900));}
  function codeLine(line){
    const tokens=line.split(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/.*$|\b(?:async|await|const|function|if|return|new|try|catch|true|false)\b)/g);
    return tokens.map(token=>{const kind=/^["']/.test(token)?'string':token.startsWith('//')?'comment':/^(async|await|const|function|if|return|new|try|catch|true|false)$/.test(token)?'keyword':'';return kind?`<span class="code-${kind}">${escape(token)}</span>`:escape(token);}).join('');
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
      return `<div class="code-copy"><h2>${slide.title}</h2><p class="subhead">${slide.subtitle}</p><div class="code-links"><a href="${I18N.url('../demos/'+escape(slide.codeDemo)+'.html')}" target="_blank" rel="noopener">${I18N.lang==='es'?'Abrir demo':'Open demo'} ↗</a><a href="../demos/assets/webmcp.js" target="_blank" rel="noopener">${I18N.lang==='es'?'Código fuente':'Source'} ↗</a></div></div><div class="code-example"><p class="code-label">${escape(slide.codeLabel)}</p><pre class="code-window" aria-label="${I18N.lang==='es'?'Ejemplo de JavaScript':'JavaScript example'}"><code lang="${I18N.lang}">${slide.code.split('\n').map((line,i)=>`<span class="code-line${focus.includes(i+1)?' is-focused':''}" data-line="${i+1}">${codeLine(line)}</span>`).join('\n')}</code></pre>${stepBanner(slide)}</div>`;
    }
    if(slide.kind==='title'){
      const portrait=slide.photo?`<div class="speaker-Visual"><img class="speaker-photo" src="${escape(slide.photo)}" alt="${escape(slide.speaker)}">${slide.badge?`<img class="speaker-badge" src="${escape(slide.badge)}" alt="Google Developer Expert · Web Technologies">`:''}</div>`:'';
      return `<div class="title-layout"><div class="title-copy"><h1>${slide.title}</h1><p class="subhead">${slide.subtitle}</p><p class="speaker">${slide.speaker}</p></div>${portrait}</div>`;
    }
    if(slide.kind==='diagram'){
      const geminiSvg=`<svg class="gemini-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><defs><linearGradient id="gemini-grad-diag" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1b72e8"/><stop offset="52%" stop-color="#9b72cb"/><stop offset="100%" stop-color="#d96570"/></linearGradient></defs><path fill="url(#gemini-grad-diag)" d="M12 1.8c.5 5.4 4.8 9.7 10.2 10.2-5.4.5-9.7 4.8-10.2 10.2-.5-5.4-4.8-9.7-10.2-10.2C7.2 11.5 11.5 7.2 12 1.8Z"/></svg>`;
      const sub=String(slide.subtitle||'').replace('<span class="gemini-prompt">',`<span class="gemini-prompt">${geminiSvg}`);
      const singleLine=!String(slide.title||'').includes('<br');
      return `<h2${singleLine?' class="single-line"':''}>${slide.title}</h2><p class="subhead">${sub}</p><div class="diagram-row">${slide.diagram.map((d,i)=>`${i?'<span class="arrow build '+(d.step>state.step?'pending':'')+'" aria-hidden="true">'+(d.arrow||'→')+'</span>':''}<div class="diagram-card ${d.color} ${d.step?'build':''} ${d.step>state.step?'pending':''}" ${d.step>state.step?'aria-hidden="true"':''}><strong>${d.title}</strong><span class="diagram-label">${d.body}</span></div>`).join('')}</div>`;
    }
    if(slide.kind==='flow'){
      const es=I18N.lang==='es';
      const geminiSvg=`<svg class="gemini-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><defs><linearGradient id="gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1b72e8"/><stop offset="52%" stop-color="#9b72cb"/><stop offset="100%" stop-color="#d96570"/></linearGradient></defs><path fill="url(#gemini-grad)" d="M12 1.8c.5 5.4 4.8 9.7 10.2 10.2-5.4.5-9.7 4.8-10.2 10.2-.5-5.4-4.8-9.7-10.2-10.2C7.2 11.5 11.5 7.2 12 1.8Z"/></svg>`;
      const promptText=es?'Quiero que agregues a mi lista de blog posts por leer el artículo sobre "modelos pequeños"':'I want you to add the article about "small models" to my blog posts reading list';
      if(slide.flowType==='lanes'){
        const activeIdx=flowAnim.lanesStep;
        const traceById={
          legacy:es?[
            'Prompt en cliente externo: agregar artículo sobre "modelos pequeños"',
            'Cliente fuera del browser selecciona tool remota',
            'POST /mcp (servidor aparte, otra sesión)',
            '⚠️ Tu pestaña web sigue en 0 blog posts: no se entera'
          ]:[
            'Prompt in external client: add article about "small models"',
            'External client selects remote MCP server tool',
            'POST /mcp (separate server & auth session)',
            '⚠️ Open web tab stays at 0 blog posts: unaware of change'
          ],
          webmcp:es?[
            'Prompt con tu blog abierto: agregar artículo sobre "modelos pequeños"',
            'Agente descubre tool en document.modelContext',
            'execute({ articleId: "models" }) en tu propio JS',
            '✅ DOM en vivo: Lista por leer (1) · «Modelos pequeños»'
          ]:[
            'Prompt with blog open: add article about "small models"',
            'Agent discovers tool on document.modelContext',
            'execute({ articleId: "models" }) runs in your JS',
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
      if(slide.demo==='reading-route'){
        const shortOpen=I18N.lang==='es'?'Abrir demo ↗':'Open demo ↗';
        return `<div class="demo-embed-header"><div><p class="eyebrow">Demo ${slide.number} · ${escape(slide.demo)}.html</p><h2 class="single-line">${clean(slide.title)}</h2><p class="subhead">${slide.subtitle}</p></div><a class="demo-link" href="${I18N.url('../demos/'+slide.demo+'.html')}" target="_blank" rel="noopener">${escape(shortOpen)}</a></div><div class="demo-embed-wrap"><iframe class="demo-embed-frame" src="${I18N.url('../demos/'+slide.demo+'.html')}" title="${escape(slide.demoTitle)}"></iframe></div>`;
      }
      const steps=slide.steps?.length?`<ol class="demo-steps">${slide.steps.map(s=>`<li>${escape(s)}</li>`).join('')}</ol>`:'';
      return `<div class="demo-header"><div><p class="eyebrow">Demo ${slide.number} · ${escape(slide.demo)}.html</p><h2>${slide.title}</h2><p class="subhead">${slide.subtitle}</p></div><a class="demo-link" href="${I18N.url('../demos/'+slide.demo+'.html')}" target="_blank" rel="noopener">${escape(openLabel)}</a></div>${steps}`;
    }
    if(slide.kind==='steps')return `<h2>${slide.title}</h2><div class="diagram-row">${slide.items.map((s,i)=>`<div class="diagram-card ${['blue','yellow','green'][i%3]} build ${i>state.step?'pending':''}" ${i>state.step?'aria-hidden="true"':''}><strong>${s.title}</strong><span class="diagram-label">${s.body}</span></div>`).join('')}</div>`;
    if(slide.kind==='statement'){
      const specs=slide.specs?.length?`<dl class="spec-list">${slide.specs.map(s=>`<div class="spec-row"><dt>${escape(s.term)}</dt><dd>${escape(s.detail)}</dd></div>`).join('')}</dl>`:'';
      const links=slide.links?.length?`<div class="resource-links">${slide.links.map(l=>`<a class="resource-pill" href="${I18N.url(l.href)}" target="_blank" rel="noopener">${escape(l.label)} ↗</a>`).join('')}</div>`:'';
      return `<p class="eyebrow">${slide.eyebrow||''}</p><h1 class="compact">${slide.title}</h1><p class="subhead ${slide.builds.length?'build':''} ${state.step<1&&slide.builds.length?'pending':''}">${slide.subtitle}</p>${specs}${links}`;
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
    const slide=slides[state.index];
    document.body.style.setProperty('--slide-bg',slide.background||'var(--paper)');
    const stepSuffix=slide.builds.length?` · ${I18N.lang==='es'?'paso':'step'} ${state.step}/${slide.builds.length}`:'';
    viewport.innerHTML=`<article class="slide" aria-label="${state.index+1} de ${slides.length}"><div class="panel-shape" aria-hidden="true"></div><div class="lockup" aria-label="Web @DevFest ${escape(city)}"><span class="brace" aria-hidden="true">{</span><div class="lockup-copy">Web<br><strong>@DevFest</strong><div class="city">${escape(city)}</div></div><span class="brace" aria-hidden="true">}</span></div><div class="slide-content ${slide.kind==='code'?'code-slide':slide.kind==='title'?'title-slide':slide.kind==='demo'&&slide.demo==='reading-route'?'demo-embed-slide':slide.kind==='diagram'||slide.kind==='flow'||slide.kind==='steps'||slide.kind==='demo'||slide.kind==='statement'?'wide':''}">${body(slide)}</div><span class="slide-number">${String(state.index+1).padStart(2,'0')} / ${slides.length}${stepSuffix}</span><img class="gdg-logo" src="assets/gdg-logo.png" alt="Google Developer Groups"></article>`;
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
    if(prevBtn)prevBtn.disabled=state.index===0&&state.step===0;
    if(nextBtn)nextBtn.disabled=state.index===slides.length-1&&state.step>=slide.builds.length;
    syncFlowLoop();
    announce();
  }
  function announce(){const message={type:'deck-state',state:{...state},slideCount:slides.length,plannedMinutes:planned,city,session:channelName};channel?.postMessage(message);if(presenter&&!presenter.closed)presenter.postMessage(message,location.origin==='null'?'*':location.origin);}
  function navigate(index,step=0,animate=true){
    stopFlowTimer();
    index=Math.max(0,Math.min(slides.length-1,index));
    step=Math.max(0,Math.min(slides[index].builds.length,step));
    state={...state,index,step};
    const hash=`#${index+1}.${step}`;
    if(location.hash!==hash)history.pushState(null,'',hash);
    if(activeTransition){try{activeTransition.skipTransition();}catch(e){}activeTransition=null;}
    if(animate&&!reduced()&&document.startViewTransition){
      try{
        const t=document.startViewTransition(paint);
        activeTransition=t;
        t.finished.catch(()=>{}).finally(()=>{if(activeTransition===t)activeTransition=null;});
      }catch(e){paint();}
    }else paint();
  }
  function next(){const s=slides[state.index];if(state.step<s.builds.length)navigate(state.index,state.step+1);else if(state.index<slides.length-1)navigate(state.index+1,0);}
  function previous(){if(state.step>0)navigate(state.index,state.step-1);else if(state.index>0)navigate(state.index-1,slides[state.index-1].builds.length);}
  function nextSlide(){if(state.index<slides.length-1)navigate(state.index+1,0);else navigate(state.index,slides[state.index].builds.length);}
  function previousSlide(){if(state.step>0)navigate(state.index,0);else if(state.index>0)navigate(state.index-1,0);}
  function openPresenter(){const u=new URL('presenter.html',location.href);u.searchParams.set('lang',I18N.lang);u.searchParams.set('session',channelName);u.searchParams.set('minutes',planned);u.searchParams.set('city',city);presenter=window.open(u.href,'sg-webmcp-presenter','popup,width=1360,height=900');if(!presenter)return;setTimeout(announce,300);}
  function clock(action){const now=Date.now();if(action==='reset')state={...state,startedAt:null,pausedAt:null,pausedMs:0};else if(!state.startedAt)state={...state,startedAt:now,pausedAt:null,pausedMs:0};else if(state.pausedAt)state={...state,pausedMs:state.pausedMs+(now-state.pausedAt),pausedAt:null};else state={...state,pausedAt:now};announce();}
  function receive(message){if(message?.type==='presenter-ready')announce();if(message?.type==='deck-command'){if(message.id&&seenCommands.has(message.id))return;if(message.id){seenCommands.add(message.id);if(seenCommands.size>128)seenCommands.delete(seenCommands.values().next().value);}const c=message.command;if(c==='next')next();if(c==='previous')previous();if(c==='clock')clock();if(c==='reset-clock')clock('reset');if(c==='goto'&&Number.isInteger(message.index))navigate(message.index,message.step||0);}}
  if(channel)channel.onmessage=event=>receive(event.data);
  addEventListener('message',event=>{if(event.source!==presenter)return;if(location.origin!=='null'&&event.origin!==location.origin)return;receive(event.data);});
  addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;
    if(['Enter',' '].includes(event.key)&&event.target.closest('a,button'))return;
    if(event.shiftKey&&event.key==='ArrowRight'){event.preventDefault();nextSlide();return;}
    if(event.shiftKey&&event.key==='ArrowLeft'){event.preventDefault();previousSlide();return;}
    if(['ArrowRight','ArrowDown','PageDown',' ','Enter'].includes(event.key)){event.preventDefault();next();}
    if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(event.key)){event.preventDefault();previous();}
    if(event.key==='Home'){event.preventDefault();navigate(0);}
    if(event.key==='End'){event.preventDefault();navigate(slides.length-1);}
    if(event.key.toLowerCase()==='p'&&!mockup)openPresenter();
    if(event.key.toLowerCase()==='c')document.body.classList.toggle('hide-controls');
    if(event.key.toLowerCase()==='f'){if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.();}
  });
  viewport.addEventListener('click',event=>{if(event.target.closest('a,button,input,select,textarea,iframe,.demo-embed-wrap'))return;if(window.getSelection?.()?.toString())return;next();});
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
  document.querySelector('#fullscreen')?.addEventListener('click',e=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.();if(e.detail>0)e.currentTarget.blur();});
  addEventListener('hashchange',()=>{state={...state,...parse()};paint();});addEventListener('popstate',()=>{state={...state,...parse()};paint();});addEventListener('resize',scale);
  state={...state,...parse()};scale();paint();
  window.deck={next,previous,nextSlide,previousSlide,navigate,getState:()=>({...state}),openPresenter,clock};
})();
