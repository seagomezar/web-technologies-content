(() => {
  const {$,$$,esc,id,app,status,panel,output,result,run,available,create,withSession}=Lab;
  function sameOrigin(event,trustedHref){
    try{
      if('Origin' in globalThis){
        let sender;
        try{sender=Origin.from(event);}catch{sender=Origin.from(event.origin);}
        return sender.isSameOrigin(Origin.from(trustedHref));
      }
      const candidateUrl=new URL(event.origin),trustedUrl=new URL(trustedHref);
      return candidateUrl.origin!=='null'&&candidateUrl.origin===trustedUrl.origin;
    }catch{return false;}
  }
  if(id==='model-concierge') {
    const apis=['LanguageModel','Summarizer','LanguageDetector','Translator','Proofreader','SemanticEmbedder'];
    app.innerHTML=panel('API Availability Check','<p>Query static <code>availability()</code> on each Chrome Built-in AI interface.</p><button type="button" id="inspect">Check Browser APIs</button><div id="board"></div>')+output('Session Lifecycle');
    async function inspect(){const rows=await Promise.all(apis.map(async name=>{try{return {name,state:await available(name,name==='Translator'?{sourceLanguage:'es',targetLanguage:'en'}:{})};}catch(e){return{name,state:e.name+': '+e.message};}}));$('#board').innerHTML=rows.map(r=>`<div class="item row"><div><strong>${r.name}</strong><div class="small">${esc(r.state)}</div></div><button type="button" data-prepare="${r.name}" ${['unavailable','not exposed'].includes(r.state)?'disabled':''}>Create Session</button></div>`).join('');$$('[data-prepare]').forEach(btn=>btn.onclick=async()=>{btn.disabled=true;try{const name=btn.dataset.prepare;await withSession(name,name==='Translator'?{sourceLanguage:'es',targetLanguage:'en'}:{},async()=>result(`${name} session created and released via destroy().`,'Session lifecycle'));}catch(e){status(e.message,true);}finally{btn.disabled=false;}});status('Availability check complete.');}
    run('#inspect',inspect);
  }
  if(id==='stream-garden') {
    let controller=null;
    app.innerHTML=panel('Streaming & AbortController','<label for="input">Prompt</label><textarea id="input">Explain why streaming responses should support AbortController cancellation, in three short paragraphs.</textarea><div class="actions"><button type="button" id="live">Stream with LanguageModel</button><button type="button" id="rehearse" class="secondary">Simulate stream</button><button type="button" id="cancel" class="secondary" disabled>Cancel (AbortController)</button></div>')+output('Stream Output');
    $('#cancel').onclick=()=>controller?.abort();
    async function stream(rehearsal){controller=new AbortController();const signal=controller.signal;$('#live').disabled=true;$('#rehearse').disabled=true;$('#cancel').disabled=false;result('',rehearsal?'Simulated stream (local timer)':'LanguageModel.promptStreaming()');try{if(rehearsal){const text='Streaming output lets the UI render tokens incrementally as they arrive.\n\nPassing an AbortSignal allows the user to cancel generation immediately and free the underlying session.';for(const part of text.match(/\S+\s*/g)){if(signal.aborted)throw new DOMException('Stream aborted.','AbortError');$('#result').textContent+=part;await new Promise(resolve=>setTimeout(resolve,65));}}else{await withSession('LanguageModel',{},async s=>{for await(const chunk of s.promptStreaming($('#input').value,{signal}))$('#result').textContent+=chunk;},signal);}status(rehearsal?'Simulated stream complete.':'Native stream complete; session released.');}catch(e){status(e.name==='AbortError'?'Aborted via AbortController; partial output preserved.':e.message,e.name!=='AbortError');}finally{controller=null;$('#live').disabled=false;$('#rehearse').disabled=false;$('#cancel').disabled=true;}}
    run('#live',()=>stream(false));run('#rehearse',()=>stream(true));addEventListener('pagehide',()=>controller?.abort());
  }
  if(id==='iframe-passport') {
    app.innerHTML=panel('Iframe Permissions-Policy','<p>Test <code>allow="language-model"</code> delegation on an embedded iframe.</p><label><input id="delegate" type="checkbox">Add <code>allow="language-model"</code> to iframe</label><button type="button" id="load">Load iframe probe</button><pre id="markup" tabindex="0"></pre>')+panel('Iframe Probe Report','<iframe id="probe" title="Permissions-Policy probe"></iframe><pre id="probe-result" aria-live="polite" tabindex="0">No probe loaded.</pre>');
    run('#load',()=>{if(location.protocol==='file:')throw new Error('Serve over HTTP (npm run serve) to test iframe policy.');const frame=$('#probe');const target=new URL('iframe-probe.html',location.href);const local=['localhost','127.0.0.1'].includes(location.hostname);if(local)target.port=location.port==='8081'?'8080':'8081';target.search='?lang='+I18N.lang;target.hash='';const allow=$('#delegate').checked?'language-model':local?'':"language-model 'none'";if(allow)frame.setAttribute('allow',allow);else frame.removeAttribute('allow');frame.src=target.href;$('#markup').textContent=`<iframe src="${target.href}"${allow?` allow="${allow}"`:''}></iframe>`;status('Iframe probe loaded.');});
    addEventListener('message',event=>{const frame=$('#probe');if(event.source!==frame.contentWindow||event.data?.kind!=='ai-policy-probe')return;if(!sameOrigin(event,frame.src))return;$('#probe-result').textContent=JSON.stringify(event.data,null,2);});
  }
})();
