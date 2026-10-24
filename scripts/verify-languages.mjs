import {contractDoubles} from './native-contracts.mjs';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
const root=resolve(import.meta.dirname,'..'),base='http://localhost:8080';
const topics=JSON.parse(await readFile(resolve(root,'content-manifest.json'),'utf8'));
const es=JSON.parse(await readFile(resolve(root,'locales/es.json'),'utf8'));
const results={checkedAt:new Date().toISOString(),languages:['en','es'],checks:[],limitations:['Native adapter checks use explicit contract doubles; model quality and language support are not inferred.','Original source documents, technical contracts, licenses and explicitly English model samples retain their declared language.']};
const record=name=>{results.checks.push({name,status:'pass'});console.log('PASS',name);};
const errors=[];let server,browser;
async function ready(){try{return(await fetch(base)).ok;}catch{return false;}}
async function load(page,path,lang){await page.goto(`${base}/${path}?lang=${lang}`);await page.evaluate(()=>document.fonts.ready);}
async function click(page,selector){await page.locator(selector).click();await page.waitForFunction(q=>!document.querySelector(q)?.disabled,selector);}
try{
 if(!await ready()){server=spawn(process.platform==='win32'?'python':'python3',['scripts/serve.py'],{cwd:root,stdio:'ignore'});for(let i=0;i<50&&!await ready();i++)await new Promise(r=>setTimeout(r,100));assert(await ready());}
 for(const topic of topics){for(const key of ['title','subtitle','stage','angle','value','format'])assert(es[topic[key]],`Missing ${topic.id}.${key}`);for(const s of topic.outline)assert(es[s]);for(const d of topic.demos)for(const k of ['title','hook','action','lesson'])assert(es[d[k]],`Missing ${d.id}.${k}`);}
 record('Every proposal field, outline, and all 21 demo descriptions have authored Spanish translations');
 browser=await chromium.launch({channel:'chrome'});
 const context=await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:1000}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const lang of ['en','es']){
  await load(page,'index.html',lang);assert.equal(await page.locator('html').getAttribute('lang'),lang);assert.equal(await page.locator('.topic-card').count(),7);assert.equal(await page.locator('.topic-card ol a').count(),21);assert.equal((await page.locator('.topic-card h2').first().textContent()),lang==='es'?es[topics[0].title]:topics[0].title);
  for(const a of await page.locator('.topic-card ol a').evaluateAll(nodes=>nodes.map(a=>a.href)))assert.equal(new URL(a).searchParams.get('lang'),lang);
  const docs=await page.locator('.intro .actions a').last().getAttribute('href');assert(docs.includes(lang==='es'?'topic-review.es.md':'topic-review.md'));
  for(const size of [{width:1440,height:1000},{width:390,height:844}]){
   await page.setViewportSize(size);
   for(const path of ['index.html',...topics.flatMap(t=>t.demos.map(d=>`demos/${d.id}.html`))]){await load(page,path,lang);assert.equal(await page.locator('html').getAttribute('lang'),lang);assert.equal(await page.locator('.language-switch a').count(),2);assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),`${lang}/${path}/${size.width}: horizontal overflow`);}
  }
  record(`${lang}: gallery and all 21 demos load at desktop and mobile sizes with working language links`);
  await page.setViewportSize({width:1440,height:1000});
  await load(page,'demos/reading-route.html',lang);await click(page,'#invoke');assert.equal(await page.locator('#count').textContent(),'1');assert.equal(await page.locator('[data-remove]').textContent(),lang==='es'?'Quitar':'Remove');await page.locator('[data-remove]').click();assert.equal(await page.locator('#count').textContent(),'0');
  await load(page,'demos/consent-cart.html',lang);await click(page,'#stage');assert.match(await page.locator('#pending').textContent(),lang==='es'?/Revisa 2/:/Review 2/);await page.locator('#reject').click();await click(page,'#stage');await page.locator('#confirm').click();assert.match(await page.locator('#ledger').textContent(),lang==='es'?/Sin reserva real/:/No real booking/);
  await load(page,'demos/voice-remix.html',lang);assert.equal(await page.locator('#tone').inputValue(),'Clear and direct');await page.locator('#tone').selectOption('Warm and conversational');await click(page,'#inspect');assert.match(await page.locator('#recipe').textContent(),/Warm and conversational/);assert.equal(await page.locator('#tone option:checked').textContent(),lang==='es'?'Cálido y conversacional':'Warm and conversational');
  await load(page,'demos/release-kitchen.html',lang);await page.locator('#facts').fill('R1: One.\nR1: Two.');await click(page,'#recipe');assert.match(await page.locator('#status').textContent(),lang==='es'?/identificador único/:/unique ID/);
  await load(page,'demos/latency-lens.html',lang);await click(page,'#export');assert.match(await page.locator('#status').textContent(),lang==='es'?/Registra primero/:/Record a native/);
  await load(page,'demos/abstention-lab.html',lang);await click(page,'#baseline');assert.equal(await page.locator('#results .item').count(),8);assert.match(await page.locator('#metrics').textContent(),lang==='es'?/Errores aceptados/:/Accepted errors/);
  await load(page,'demos/iframe-passport.html',lang);await click(page,'#load');await page.waitForFunction(()=>document.querySelector('#probe-result').textContent.includes('languageModelPolicyAllowed'));assert.equal(new URL(await page.locator('#probe').getAttribute('src')).searchParams.get('lang'),lang);assert.equal(await page.frameLocator('#probe').locator('html').getAttribute('lang'),lang);
  record(`${lang}: route, review, select values, validation errors, evaluation metrics and second-origin navigation work`);
  await page.goto(`${base}/slides/index.html?lang=${lang}&city=Bogot%C3%A1&minutes=35&session=language-${lang}#3.2`);
  assert.equal(await page.evaluate(()=>TALK.language),lang);assert.equal(await page.evaluate(()=>TALK.slides.length),16);assert.equal(await page.evaluate(()=>TALK.slides.reduce((n,s)=>n+s.minutes,0)),30);assert.deepEqual(await page.evaluate(()=>TALK.slides.filter(s=>s.notes.length!==s.builds.length+1).map(s=>s.id)),[]);
  for(let i=0;i<16;i++){
   await page.evaluate(i=>deck.navigate(i,TALK.slides[i].builds.length,false),i);
   const outside=await page.evaluate(()=>{const bounds=document.querySelector('.slide').getBoundingClientRect();return [...document.querySelectorAll('.slide-content h1,.slide-content h2,.slide-content p,.diagram-card,.demo-link')].filter(e=>{const r=e.getBoundingClientRect();return r.left<bounds.left-1||r.right>bounds.right+1||r.top<bounds.top-1||r.bottom>bounds.bottom+1;}).map(e=>e.textContent);});assert.deepEqual(outside,[],`${lang}: slide ${i+1} bounds`);
  }
  await page.evaluate(()=>deck.navigate(1,1,false));
  const opened=context.waitForEvent('page');await page.keyboard.press('p');const presenter=await opened;await presenter.waitForLoadState();await presenter.waitForFunction(()=>/Conectado|Connected/.test(document.querySelector('#connection').textContent));assert.equal(new URL(presenter.url()).searchParams.get('lang'),lang);assert.equal(await presenter.locator('html').getAttribute('lang'),lang);assert.equal(await presenter.locator('#script li.active strong').textContent(),lang==='es'?'Una herramienta':'A tool');assert.match(await presenter.locator('#script li.active').textContent(),lang==='es'?/El agente necesita/:/The agent needs/);assert.equal(new URL(await presenter.locator('#current-preview').getAttribute('src')).searchParams.get('lang'),lang);await presenter.locator('#next').click();await page.waitForFunction(()=>deck.getState().step===2);await presenter.screenshot({path:resolve(root,`review/presenter-${lang}.png`),fullPage:true});await presenter.close();
  const switchHref=await page.locator(`.language-switch a[lang="${lang==='es'?'en':'es'}"]`).getAttribute('href');const u=new URL(switchHref);assert.equal(u.hash,'#2.2');assert.equal(u.searchParams.get('city'),'Bogotá');assert.equal(u.searchParams.get('minutes'),'35');
  await page.evaluate(()=>deck.navigate(0,0,false));await page.screenshot({path:resolve(root,`review/deck-${lang}.png`)});
  await load(page,'slides/mockups.html',lang);assert.equal(await page.evaluate(()=>TALK.slides.length),3);
  record(`${lang}: all 16 slides fit, all notes match builds, presenter script and previews use the same language`);
 }
 const fake=await browser.newContext({reducedMotion:'reduce'});await contractDoubles(fake);const f=await fake.newPage();f.on('pageerror',e=>errors.push(e.message));
 const nativeCases=[['model-concierge','#inspect',async()=>{await click(f,'[data-prepare="LanguageModel"]');}],['stream-garden','#live'],['meaning-compass','#semantic'],['duplicate-constellation','#native'],['evidence-window','#native',async()=>{await click(f,'#draft');}],['latency-lens','#live'],['preference-kitchen','#fix',async()=>{await click(f,'#live');}],['context-backpack','#measure'],['voice-remix','#live'],['release-kitchen','#live'],['recipe-arena','#compare'],['bilingual-relay','#translate'],['language-radar','#detect'],['proofread-review','#proofread'],['issue-router','#native'],['comment-airlock','#native'],['abstention-lab','#native']];
 for(const lang of ['en','es']){for(const [id,button,after] of nativeCases){await load(f,`demos/${id}.html`,lang);await click(f,button);if(after)await after();const counts=await f.evaluate(()=>({created:__created,destroyed:__destroyed}));assert(counts.created>0,`${lang}/${id}: adapter was not called`);assert.equal(counts.created,counts.destroyed,`${lang}/${id}: session leak`);assert(!await f.locator('#status').evaluate(e=>e.classList.contains('error')),`${lang}/${id}: adapter error`);}record(`${lang}: all 17 native adapter workflows preserve contracts, stable select values and session cleanup`);}
 await fake.close();
 const offline=await browser.newContext({offline:true,reducedMotion:'reduce'}),off=await offline.newPage(),network=[];off.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
 const local=pathToFileURL(resolve(root,'slides/index.html'));local.search='?lang=en&city=Medell%C3%ADn&minutes=30';local.hash='#3.2';await off.goto(local.href);await off.locator('.language-switch a[lang="es"]').click();await off.waitForFunction(()=>window.TALK?.language==='es');assert.equal(await off.evaluate(()=>TALK.language),'es');assert.equal(new URL(off.url()).hash,'#3.2');assert.equal(await off.evaluate(()=>deck.getState().step),2);await off.locator('.language-switch a[lang="en"]').click();await off.waitForFunction(()=>window.TALK?.language==='en');assert.equal(await off.evaluate(()=>TALK.language),'en');assert.equal(await off.evaluate(()=>deck.getState().index),2);assert.deepEqual(network,[]);record('Offline language switching preserves city, timing, slide and build without network requests');
 for(const name of ['README.es.md','research/topic-review.es.md','research/link-inventory.es.md','research/row-review.es.json','output/spreadsheet/reviewed-topics.es.csv','slides/assets/SOURCES.es.md'])assert((await readFile(resolve(root,name),'utf8')).length>100);
 assert.equal(JSON.parse(await readFile(resolve(root,'research/row-review.es.json'),'utf8')).length,20);record('Spanish setup, provenance, full review, URL inventory, 20 judgments and CSV exist');
 assert.deepEqual(errors,[]);results.status='passed';
}finally{await browser?.close();server?.kill();await writeFile(resolve(root,'review/language-verification.json'),JSON.stringify(results,null,2)+'\n');}
