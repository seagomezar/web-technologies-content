(() => {
  const mockup=document.body.dataset.mockup==='true';
  const slides=mockup?TALK.slides.slice(0,3):TALK.slides;
  const params=new URLSearchParams(location.search);
  const city=params.get('city')||TALK.defaults.city;
  const planned=Number(params.get('minutes'))>0?Number(params.get('minutes')):TALK.plannedMinutes;
  const viewport=document.querySelector('#viewport');
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=s=>String(s||'').replace(/<br\s*\/?>/gi,' ');
  const channelName=params.get('session')||'sg-webmcp-talk';
  let state={index:0,step:0,startedAt:null,pausedAt:null,pausedMs:0};
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
    if(!total&&!slide.stepCallouts?.length)return '';
    const label=state.step===0?(I18N.lang==='es'?'Vista inicial':'Initial view'):slide.builds[state.step-1];
    const callout=slide.stepCallouts?.[state.step]||'';
    return `<div class="code-step-banner"><span class="step-pill">${I18N.lang==='es'?'Paso':'Step'} ${state.step+1}/${total+1} · ${escape(label)}</span>${callout?`<span class="step-callout">${escape(callout)}</span>`:''}</div>`;
  }
  function body(slide){
    if(slide.kind==='code'){
      const focus=slide.codeFocus[state.step]||[];
      return `<div class="code-copy"><h2>${slide.title}</h2><p class="subhead">${slide.subtitle}</p><div class="code-links"><a href="${I18N.url('../demos/'+escape(slide.codeDemo)+'.html')}" target="_blank" rel="noopener">${I18N.lang==='es'?'Ver demo':'Open demo'} ↗</a><a href="../demos/assets/webmcp.js" target="_blank" rel="noopener">${I18N.lang==='es'?'Ver código':'Source'} ↗</a></div></div><div class="code-example"><p class="code-label">${escape(slide.codeLabel)}</p><pre class="code-window" aria-label="${I18N.lang==='es'?'Ejemplo de JavaScript':'JavaScript example'}"><code lang="${I18N.lang}">${slide.code.split('\n').map((line,i)=>`<span class="code-line${focus.includes(i+1)?' is-focused':''}" data-line="${i+1}">${codeLine(line)}</span>`).join('\n')}</code></pre>${stepBanner(slide)}</div>`;
    }
    if(slide.kind==='title'){
      const highlights=slide.highlights?.length?`<div class="title-highlights">${slide.highlights.map(h=>`<div class="highlight-card"><strong>${escape(h.label)}</strong><span>${escape(h.text)}</span></div>`).join('')}</div>`:'';
      return `<h1>${slide.title}</h1><p class="subhead">${slide.subtitle}</p><p class="speaker">${slide.speaker}</p>${highlights}`;
    }
    if(slide.kind==='diagram'){
      const takeaway=slide.takeaway?`<div class="slide-takeaway">${escape(slide.takeaway)}</div>`:'';
      return `<h2>${slide.title}</h2><p class="subhead">${slide.subtitle}</p><div class="diagram-row">${slide.diagram.map((d,i)=>`${i?'<span class="arrow build '+(d.step>state.step?'pending':'')+'" aria-hidden="true">'+(d.arrow||'→')+'</span>':''}<div class="diagram-card ${d.color} ${d.step?'build':''} ${d.step>state.step?'pending':''}" ${d.step>state.step?'aria-hidden="true"':''}>${d.meta?`<span class="card-meta">${escape(d.meta)}</span>`:''}<strong>${d.title}</strong><span class="diagram-label">${d.body}</span></div>`).join('')}</div>${takeaway}`;
    }
    if(slide.kind==='demo'){
      const openLabel=I18N.lang==='es'?`Abrir ${slide.demoTitle} ↗`:`Open ${slide.demoTitle} ↗`;
      const steps=slide.walkthrough?.length?`<div class="demo-walkthrough">${slide.walkthrough.map((w,i)=>`<div class="walkthrough-card ${['blue','yellow','green'][i%3]}"><span class="card-meta">${escape(w.step)}</span><strong>${escape(w.title)}</strong><span class="walkthrough-body">${escape(w.body)}</span></div>`).join('')}</div>`:'';
      return `<div class="demo-header"><div><p class="eyebrow">Demo ${slide.number}</p><h2>${slide.title}</h2><p class="subhead">${slide.subtitle}</p></div><a class="demo-link" href="${I18N.url('../demos/'+slide.demo+'.html')}" target="_blank" rel="noopener">${escape(openLabel)}</a></div>${steps}`;
    }
    if(slide.kind==='steps')return `<h2>${slide.title}</h2><div class="diagram-row">${slide.items.map((s,i)=>`<div class="diagram-card ${['blue','yellow','green'][i%3]} build ${i>state.step?'pending':''}" ${i>state.step?'aria-hidden="true"':''}><strong>${s.title}</strong><span class="diagram-label">${s.body}</span></div>`).join('')}</div>`;
    if(slide.kind==='statement'){
      const cards=slide.cards?.length?`<div class="summary-grid">${slide.cards.map((c,i)=>`<div class="summary-card ${['blue','yellow','green'][i%3]}"><span class="card-meta">${escape(c.badge)}</span><strong>${escape(c.title)}</strong><span class="summary-body">${escape(c.body)}</span>${c.href?`<a class="card-link" href="${I18N.url(c.href)}" target="_blank" rel="noopener">${escape(c.linkText)}</a>`:''}</div>`).join('')}</div>`:'';
      return `<p class="eyebrow">${slide.eyebrow||''}</p><h1 class="compact">${slide.title}</h1><p class="subhead ${slide.builds.length?'build':''} ${state.step<1&&slide.builds.length?'pending':''}">${slide.subtitle}</p>${cards}`;
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
    viewport.innerHTML=`<article class="slide" aria-label="${state.index+1} de ${slides.length}"><div class="panel-shape" aria-hidden="true"></div><div class="lockup" aria-label="Web @DevFest ${escape(city)}"><span class="brace" aria-hidden="true">{</span><div class="lockup-copy">Web<br><strong>@DevFest</strong><div class="city">${escape(city)}</div></div><span class="brace" aria-hidden="true">}</span></div><div class="slide-content ${slide.kind==='code'?'code-slide':slide.kind==='diagram'||slide.kind==='steps'||slide.kind==='demo'||slide.kind==='statement'?'wide':''}">${body(slide)}</div><span class="slide-number">${String(state.index+1).padStart(2,'0')} / ${slides.length}${stepSuffix}</span><img class="gdg-logo" src="assets/gdg-logo.png" alt="Google Developer Groups"></article>`;
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
    announce();
  }
  function announce(){const message={type:'deck-state',state:{...state},slideCount:slides.length,plannedMinutes:planned,city,session:channelName};channel?.postMessage(message);if(presenter&&!presenter.closed)presenter.postMessage(message,location.origin==='null'?'*':location.origin);}
  function navigate(index,step=0,animate=true){
    const prevIndex=state.index;
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
  viewport.addEventListener('click',event=>{if(event.target.closest('a,button,input,select,textarea'))return;if(window.getSelection?.()?.toString())return;next();});
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
