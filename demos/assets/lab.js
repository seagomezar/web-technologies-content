/* Shared helpers and Chrome Built-in AI adapters for the interactive demos. */
(() => {
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => [...root.querySelectorAll(q)];
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const id = document.body.dataset.demo;
  if (window.self !== window.top || new URLSearchParams(location.search).get('embed') === '1') {
    document.body.classList.add('is-embedded');
  }
  const topic = CONTENT_TOPICS.find(t => t.demos.some(d => d.id === id));
  const demo = topic?.demos.find(d => d.id === id);
  if (!demo) return;
  document.documentElement.style.setProperty('--accent', topic.color);
  document.title = demo.title + ' | ' + I18N.text('Web AI Lab');
  if ($('#title')) $('#title').textContent = demo.title;
  if ($('#hook')) $('#hook').textContent = demo.hook;
  if ($('#topic')) $('#topic').textContent = topic.title;
  if ($('#lesson')) $('#lesson').textContent = demo.lesson;
  if ($('#sources')) $('#sources').innerHTML = topic.sources.map((u,i) => `<li><a href="${esc(u)}" target="_blank" rel="noreferrer">Reference ${i+1}: ${esc(new URL(u).hostname + new URL(u).pathname)}</a></li>`).join('');
  const introNode = $('.intro');
  if (introNode && !$('#demo-guide') && id !== 'reading-route') {
    const nav = document.createElement('nav');
    nav.id = 'demo-guide';
    nav.className = 'demo-switcher';
    nav.setAttribute('aria-label', 'Module demos');
    const siblings = topic.demos.map((d, i) => `<a class="sibling-pill ${d.id === id ? 'active' : ''}" href="${I18N.url(d.id + '.html')}" ${d.id === id ? 'aria-current="page"' : ''}>${i + 1}. ${esc(d.title)}</a>`).join('');
    nav.innerHTML = `<div class="sibling-links">${siblings}</div><p class="demo-step-hint"><strong>${I18N.text('Try:')}</strong> ${esc(demo.action)}</p>`;
    introNode.append(nav);
  }
  const app = $('#app');
  const status = (message, error = false) => { const node=$('#status'); if (!node) return; node.textContent=I18N.text(message); node.classList.toggle('error',error); };
  const panel = (title, body, extra='') => `<section class="panel ${extra}"><h2>${title}</h2>${body}</section>`;
  const output = (title='Output') => panel(title,'<span class="result-label" id="mode-label">Ready</span><div id="result" class="output" aria-live="polite">Run an action to inspect the output.</div>');
  const result = (value, label) => { if($('#mode-label')) $('#mode-label').textContent=label; $('#result').textContent=typeof value==='string'?value:JSON.stringify(value,null,2); };
  const run = (selector, callback) => $(selector).addEventListener('click', async event => {
    const btn=event.currentTarget; btn.disabled=true;
    try { await callback(event); }
    catch(error) { status(`${error.name || 'Error'}: ${I18N.text(error.message)}`,true); }
    finally { btn.disabled=false; }
  });
  const nativeOptions = {
    LanguageModel:{expectedInputs:[{type:'text',languages:['en']}],expectedOutputs:[{type:'text',languages:['en']}]},
    Summarizer:{type:'key-points',format:'plain-text',length:'short',expectedInputLanguages:['en'],outputLanguage:'en'},
    Proofreader:{expectedInputLanguages:['en']}
  };
  async function available(name, options={}) {
    const api=globalThis[name];
    if(!api || typeof api.availability!=='function') return 'not exposed';
    return api.availability({...nativeOptions[name],...options});
  }
  async function create(name,options={},signal) {
    const api=globalThis[name];
    if(!api || typeof api.create!=='function') throw new Error(`${name} is not exposed in this browser.`);
    const opts={...nativeOptions[name],...options};
    const state=await api.availability(opts);
    if(state==='unavailable') throw new Error(`${name} reports unavailable for these options.`);
    status(`${name}: ${state}. Creating session…`);
    const session=await api.create({...opts,...(signal?{signal}:{}),monitor(m){m.addEventListener('downloadprogress',e=>status(`${name} download: ${Math.round(e.loaded*100)}%.`));}});
    status(`${name} session active.`);
    return session;
  }
  const sessions=new Set();
  async function withSession(name,options,callback,signal) {
    const session=await create(name,options,signal); sessions.add(session);
    try { return await callback(session); } finally { session.destroy?.(); sessions.delete(session); }
  }
  addEventListener('pagehide',()=>{for(const s of sessions) s.destroy?.(); sessions.clear();});
  const prompt=(text,options={})=>withSession('LanguageModel',{},s=>s.prompt(text,options));
  const words=s=>new Set(s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').match(/[a-z0-9]+/g)||[]);
  function overlap(a,b) {const x=words(a),y=words(b);return x.size&&y.size?[...x].filter(w=>y.has(w)).length/Math.sqrt(x.size*y.size):0;}
  function cosine(a,b){if(!a?.length||a.length!==b?.length)throw new Error('Embedding dimensions differ.');let d=0,x=0,y=0;for(let i=0;i<a.length;i++){d+=a[i]*b[i];x+=a[i]*a[i];y+=b[i]*b[i];}return x&&y?d/Math.sqrt(x*y):0;}
  const download=(name,data)=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);};
  window.Lab={$, $$, esc, id, topic, demo, app, status, panel, output, result, run, available, create, withSession, prompt, words, overlap, cosine, download};
})();
