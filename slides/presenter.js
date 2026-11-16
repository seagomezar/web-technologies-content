(() => {
  const $=q=>document.querySelector(q),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const params=new URLSearchParams(location.search),session=params.get('session')||'sg-webmcp-talk';
  let channel,state={index:0,step:0,startedAt:null,pausedAt:null,pausedMs:0},planned=Number(params.get('minutes'))||TALK.plannedMinutes;
  const CLOCK_TRANSITIONS=Object.freeze({
    idle:Object.freeze({TOGGLE:'running',START:'running',PAUSE:'idle',RESET:'idle'}),
    running:Object.freeze({TOGGLE:'paused',START:'running',PAUSE:'paused',RESET:'idle'}),
    paused:Object.freeze({TOGGLE:'running',START:'running',PAUSE:'paused',RESET:'idle'})
  });
  const CLOCK_LABELS=Object.freeze({idle:'Iniciar reloj',paused:'Continuar reloj',running:'Pausar reloj'});
  const CONNECTION_TRANSITIONS=Object.freeze({
    connecting:Object.freeze({DECK_STATE:'connected',TIMEOUT:'standalone'}),
    standalone:Object.freeze({DECK_STATE:'connected',TIMEOUT:'standalone'}),
    connected:Object.freeze({DECK_STATE:'connected',TIMEOUT:'connected'})
  });
  const CONNECTION_COPY=Object.freeze({
    connecting:'Conectando con la presentación…',
    connected:'Conectado · teclado/clicker en la presentación o controles aquí',
    standalone:'Sin conexión: abre esta vista con P desde la presentación. Usa localhost para sincronizar ventanas independientes.'
  });
  let connectionState='connecting',connectTimer=null;
  function deriveClock(s,plannedMinutes,now=Date.now()){
    const clockState=!s.startedAt?'idle':s.pausedAt?'paused':'running';
    const elapsed=s.startedAt?Math.max(0,((s.pausedAt||now)-s.startedAt-(s.pausedMs||0))/1000):0;
    return {clockState,elapsed,remaining:plannedMinutes*60-elapsed,overrun:plannedMinutes>0&&elapsed>=plannedMinutes*60};
  }
  function syncConnection(event){
    const prev=connectionState;
    if(event){
      if(event==='DECK_STATE'&&connectTimer){clearTimeout(connectTimer);connectTimer=null;}
      connectionState=CONNECTION_TRANSITIONS[connectionState][event]||connectionState;
    }
    const el=$('#connection');
    if(el){
      el.dataset.connectionState=connectionState;
      if(!event||prev!==connectionState)el.textContent=CONNECTION_COPY[connectionState];
    }
    document.body.dataset.connectionState=connectionState;
    return connectionState;
  }
  try{channel=new BroadcastChannel(session);}catch(e){/* opener messaging works for file URLs as well. */}
  function send(message){const data={...message,id:crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`};channel?.postMessage(data);if(opener&&!opener.closed)opener.postMessage(data,location.origin==='null'?'*':location.origin);}
  const command=(cmd,extra={})=>send({type:'deck-command',command:cmd,...extra});
  const clean=s=>String(s||'').replace(/<br\s*\/?>/gi,' ');
  function preview(frame,index,step){const hash=`#${index+1}.${step}`;if(frame.dataset.index===String(index)){try{frame.contentWindow.location.hash=hash;return;}catch(e){/* reload preview if opaque-origin access is unavailable */}}const u=new URL('index.html',location.href);u.searchParams.set('lang',I18N.lang);u.searchParams.set('session',`${session}-preview-${frame.id}`);u.searchParams.set('city',params.get('city')||TALK.defaults.city);u.hash=hash;frame.src=u.href;frame.dataset.index=index;}
  const total=TALK.slides.reduce((s,x)=>s+x.minutes,0),format=seconds=>{const sign=seconds<0?'−':'';const value=Math.abs(Math.round(seconds));return sign+String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');};
  function render(){const slide=TALK.slides[state.index],next=TALK.slides[state.index+1];$('#position').textContent=`Diapositiva ${state.index+1}/${TALK.slides.length} · paso ${state.step}/${slide.builds.length}`;preview($('#current-preview'),state.index,state.step);if(next){$('#next-preview').parentElement.hidden=false;preview($('#next-preview'),state.index+1,0);$('#next-title').textContent=clean(next.title);$('#next-note').textContent=next.notes[0];}else{$('#next-preview').parentElement.hidden=true;$('#next-title').textContent='Fin de la presentación';$('#next-note').textContent='La galería contiene los demos y la revisión de fuentes.';}$('#script').innerHTML=slide.notes.map((note,i)=>`<li class="${i===state.step?'active':''}" ${i===state.step?'aria-current="step"':''}><strong>${i===0?'Entrada':esc(slide.builds[i-1]||'Guion')}</strong>${esc(note)}</li>`).join('');const before=TALK.slides.slice(0,state.index).reduce((s,x)=>s+x.minutes,0)*planned/total;const duration=slide.minutes*planned/total;$('#plan').textContent=`Plan: entrar en ${format(before*60)} · dedicar ${format(duration*60)} · terminar en ${format((before+duration)*60)}.`;$('#schedule').innerHTML=TALK.slides.map((s,i)=>`<li class="${i===state.index?'active':''}"><button type="button" data-goto="${i}"${i===state.index?' aria-current="true"':''}>${String(i+1).padStart(2,'0')} · ${esc(clean(s.title))} (${format(s.minutes*planned/total*60)})</button></li>`).join('');tick();}
  function tick(){const now=Date.now();$('#wall-clock').textContent=new Date(now).toLocaleTimeString(I18N.lang==='es'?'es-CO':'en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'});const {clockState,elapsed,remaining,overrun}=deriveClock(state,planned,now);$('#elapsed').textContent=format(elapsed);$('#remaining').textContent=`Plan ${format(remaining)}`;const clockEl=$('.clock');if(clockEl){clockEl.dataset.clockState=clockState;clockEl.dataset.clockOverrun=String(overrun);clockEl.classList.toggle('overrun',overrun);}document.body.dataset.clockState=clockState;$('#clock').textContent=CLOCK_LABELS[clockState];}
  function receive(data){if(data?.type!=='deck-state')return;state=data.state;planned=data.plannedMinutes;syncConnection('DECK_STATE');render();}
  function getAllowedCommands(clockState){
    const slide=TALK.slides[state.index];
    const cmds=['goto','clock'];
    if(state.index>0||state.step>0)cmds.push('previous');
    if(state.index<TALK.slides.length-1||state.step<slide.builds.length)cmds.push('next');
    if(clockState==='idle')cmds.push('start-clock');
    else if(clockState==='running')cmds.push('pause-clock','reset-clock');
    else cmds.push('start-clock','reset-clock');
    return cmds;
  }
  function getState(){
    const {clockState,elapsed,remaining,overrun}=deriveClock(state,planned);
    return {...state,slideCount:TALK.slides.length,plannedMinutes:planned,session,connectionState,clockState,elapsedSeconds:Math.round(elapsed),remainingSeconds:Math.round(remaining),overrun,allowedCommands:getAllowedCommands(clockState)};
  }
  function getTransitions(){
    return {clock:CLOCK_TRANSITIONS,connection:CONNECTION_TRANSITIONS};
  }
  if(channel)channel.addEventListener('message',e=>receive(e.data));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});
  addEventListener('message',e=>{if(e.source!==opener)return;if(location.origin!=='null'&&e.origin!==location.origin)return;receive(e.data);});
  $('#previous').addEventListener('click',()=>command('previous'));
  $('#next').addEventListener('click',()=>command('next'));
  $('#clock').addEventListener('click',()=>command('clock'));
  $('#reset').addEventListener('click',()=>command('reset-clock'));
  $('#schedule').addEventListener('click',e=>{const btn=e.target.closest('[data-goto]');if(btn)command('goto',{index:Number(btn.dataset.goto)});});
  addEventListener('keydown',e=>{if(e.isComposing||e.altKey||e.ctrlKey||e.metaKey||e.target.closest?.('input,textarea,select,button,summary,a,[contenteditable]'))return;if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();command('next');}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();command('previous');}});
  $('#sources').innerHTML=TALK.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a></li>`).join('');
  syncConnection();
  render();
  send({type:'presenter-ready'});
  setInterval(()=>{if(!document.hidden)tick();},500);
  connectTimer=setTimeout(()=>syncConnection('TIMEOUT'),3000);
  window.presenter={getState,getTransitions,sendCommand:command};
})();
