(() => {
  const mockup=document.body.dataset.mockup==='true';
  const slides=mockup?TALK.slides.slice(0,3):TALK.slides;
  const params=new URLSearchParams(location.search);
  const city=params.get('city')||TALK.defaults.city;
  const planned=Number(params.get('minutes'))>0?Number(params.get('minutes')):TALK.plannedMinutes;
  const viewport=document.querySelector('#viewport');
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const channelName=params.get('session')||'sg-webmcp-talk';
  let state={index:0,step:0,startedAt:null,pausedAt:null,pausedMs:0};
  let presenter=null,activeTransition=null;
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
  function body(slide){
    if(slide.kind==='code'){
      const focus=slide.codeFocus[state.step]||[];
      return `<div class="code-copy"><h2>${slide.title}</h2><p class="subhead">${slide.subtitle}</p><div class="code-links"><a href="../demos/${escape(slide.codeDemo)}.html" target="_blank" rel="noopener">${I18N.lang==='es'?'Ver demo':'Open demo'} ↗</a><a href="../demos/assets/webmcp.js" target="_blank" rel="noopener">${I18N.lang==='es'?'Ver código':'Source'} ↗</a></div></div><div class="code-example"><p class="code-label">${escape(slide.codeLabel)}</p><pre class="code-window" aria-label="${I18N.lang==='es'?'Ejemplo de JavaScript':'JavaScript example'}"><code lang="${I18N.lang}">${slide.code.split('\n').map((line,i)=>`<span class="code-line${focus.includes(i+1)?' is-focused':''}" data-line="${i+1}">${codeLine(line)}</span>`).join('\n')}</code></pre></div>`;
    }
    if(slide.kind==='title')return `<h1>${slide.title}</h1><p class="subhead">${slide.subtitle}</p><p class="speaker">${slide.speaker}</p>`;
    if(slide.kind==='diagram')return `<h2>${slide.title}</h2><p class="subhead">${slide.subtitle}</p><div class="diagram-row">${slide.diagram.map((d,i)=>`${i?'<span class="arrow build '+(d.step>state.step?'pending':'')+'" aria-hidden="true">'+(d.arrow||'→')+'</span>':''}<div class="diagram-card ${d.color} ${d.step?'build':''} ${d.step>state.step?'pending':''}" ${d.step>state.step?'aria-hidden="true"':''}><strong>${d.title}</strong><span class="diagram-label">${d.body}</span></div>`).join('')}</div>`;
    if(slide.kind==='demo')return `<p class="eyebrow">Demo ${slide.number}</p><h2>${slide.title}</h2><p class="subhead">${slide.subtitle}</p><a class="demo-link" href="../demos/${slide.demo}.html" target="_blank" rel="noopener">Abrir ${slide.demoTitle} ↗</a>`;
    if(slide.kind==='steps')return `<h2>${slide.title}</h2><div class="diagram-row">${slide.items.map((s,i)=>`<div class="diagram-card ${['blue','yellow','green'][i%3]} build ${i>state.step?'pending':''}" ${i>state.step?'aria-hidden="true"':''}><strong>${s.title}</strong><span class="diagram-label">${s.body}</span></div>`).join('')}</div>`;
    if(slide.kind==='statement')return `<p class="eyebrow">${slide.eyebrow||''}</p><h1 class="compact">${slide.title}</h1><p class="subhead ${slide.builds.length?'build':''} ${state.step<1&&slide.builds.length?'pending':''}">${slide.subtitle}</p>`;
    return `<h2>${slide.title}</h2><p class="subhead">${slide.subtitle||''}</p>`;
  }
  function paint(){const slide=slides[state.index];document.body.style.setProperty('--slide-bg',slide.background||'var(--paper)');viewport.innerHTML=`<article class="slide" aria-label="${state.index+1} de ${slides.length}"><div class="panel-shape" aria-hidden="true"></div><div class="lockup" aria-label="Web @DevFest ${escape(city)}"><span class="brace" aria-hidden="true">{</span><div class="lockup-copy">Web<br><strong>@DevFest</strong><div class="city">${escape(city)}</div></div><span class="brace" aria-hidden="true">}</span></div><div class="slide-content ${slide.kind==='code'?'code-slide':slide.kind==='diagram'||slide.kind==='steps'?'wide':''}">${body(slide)}</div><span class="slide-number">${String(state.index+1).padStart(2,'0')} / ${slides.length}</span><img class="gdg-logo" src="assets/gdg-logo.png" alt="Google Developer Groups"></article>`;document.title=`${state.index+1}. ${slide.title.replace(/<br>/g,' ')} | ${TALK.title}`;const progress=document.querySelector('#progress');if(progress)progress.style.width=`${(state.index+1)/slides.length*100}%`;announce();}
  function announce(){const message={type:'deck-state',state:{...state},slideCount:slides.length,plannedMinutes:planned,city,session:channelName};channel?.postMessage(message);if(presenter&&!presenter.closed)presenter.postMessage(message,location.origin==='null'?'*':location.origin);}
  function navigate(index,step=0,animate=true){index=Math.max(0,Math.min(slides.length-1,index));step=Math.max(0,Math.min(slides[index].builds.length,step));state={...state,index,step};const hash=`#${index+1}.${step}`;if(location.hash!==hash)history.pushState(null,'',hash);activeTransition?.skipTransition();if(animate&&!reduced()&&document.startViewTransition){activeTransition=document.startViewTransition(paint);activeTransition.finished.finally(()=>activeTransition=null);}else paint();}
  function next(){const s=slides[state.index];state.step<s.builds.length?navigate(state.index,state.step+1):navigate(state.index+1,0);}
  function previous(){state.step>0?navigate(state.index,state.step-1):state.index>0?navigate(state.index-1,slides[state.index-1].builds.length):null;}
  function openPresenter(){const u=new URL('presenter.html',location.href);u.searchParams.set('lang',I18N.lang);u.searchParams.set('session',channelName);u.searchParams.set('minutes',planned);u.searchParams.set('city',city);presenter=window.open(u.href,'sg-webmcp-presenter','popup,width=1360,height=900');if(!presenter)return;setTimeout(announce,300);}
  function clock(action){const now=Date.now();if(action==='reset')state={...state,startedAt:null,pausedAt:null,pausedMs:0};else if(!state.startedAt)state={...state,startedAt:now,pausedAt:null,pausedMs:0};else if(state.pausedAt)state={...state,pausedMs:state.pausedMs+(now-state.pausedAt),pausedAt:null};else state={...state,pausedAt:now};announce();}
  function receive(message){if(message?.type==='presenter-ready')announce();if(message?.type==='deck-command'){if(message.id&&seenCommands.has(message.id))return;if(message.id){seenCommands.add(message.id);if(seenCommands.size>128)seenCommands.delete(seenCommands.values().next().value);}const c=message.command;if(c==='next')next();if(c==='previous')previous();if(c==='clock')clock();if(c==='reset-clock')clock('reset');if(c==='goto'&&Number.isInteger(message.index))navigate(message.index,message.step||0);}}
  if(channel)channel.onmessage=event=>receive(event.data);
  addEventListener('message',event=>{if(event.source!==presenter)return;if(location.origin!=='null'&&event.origin!==location.origin)return;receive(event.data);});
  addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;if(['Enter',' '].includes(event.key)&&event.target.closest('a,button'))return;if(['ArrowRight','ArrowDown','PageDown',' ','Enter'].includes(event.key)){event.preventDefault();next();}if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(event.key)){event.preventDefault();previous();}if(event.key==='Home'){event.preventDefault();navigate(0);}if(event.key==='End'){event.preventDefault();navigate(slides.length-1);}if(event.key.toLowerCase()==='p'&&!mockup)openPresenter();if(event.key.toLowerCase()==='c')document.body.classList.toggle('show-controls');if(event.key.toLowerCase()==='f'){if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.();}});
  viewport.addEventListener('click',event=>{if(event.target.closest('a,button,input,select,textarea'))return;next();});
  document.querySelector('#previous')?.addEventListener('click',previous);document.querySelector('#next')?.addEventListener('click',next);document.querySelector('#presenter')?.addEventListener('click',openPresenter);document.querySelector('#fullscreen')?.addEventListener('click',()=>document.documentElement.requestFullscreen?.());
  addEventListener('hashchange',()=>{state={...state,...parse()};paint();});addEventListener('popstate',()=>{state={...state,...parse()};paint();});addEventListener('resize',scale);
  state={...state,...parse()};scale();paint();
  window.deck={next,previous,navigate,getState:()=>({...state}),openPresenter,clock};
})();
