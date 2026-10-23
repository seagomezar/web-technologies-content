import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';

const root=resolve(import.meta.dirname,'..'),base='http://localhost:8080';
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const report={checkedAt:new Date().toISOString(),checks:[],languages:['en','es'],limitations:['The slides contain focused excerpts; surrounding application helpers, rejection and cancellation handling are in the linked demo source.','Native WebMCP checks use a temporary Canary profile and deterministic application callbacks; no model or external agent is invoked.']};
const record=name=>{report.checks.push({name,status:'pass'});console.log('PASS',name);};
let server,browser,canary;const errors=[];
async function ready(){try{return(await fetch(base)).ok;}catch{return false;}}
try{
  if(!await ready()){server=spawn('python3',['scripts/serve.py'],{cwd:root,stdio:'ignore'});for(let i=0;i<50&&!await ready();i++)await new Promise(r=>setTimeout(r,100));assert(await ready());}
  browser=await chromium.launch({channel:'chrome'});
  const context=await browser.newContext({viewport:{width:1600,height:900},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const lang of ['en','es']){
    await page.goto(`${base}/slides/index.html?lang=${lang}&session=code-${lang}`);await page.evaluate(()=>document.fonts.ready);
    const examples=await page.evaluate(()=>TALK.slides.flatMap((slide,index)=>slide.kind==='code'?[{...slide,index}]:[]));
    assert.equal(examples.length,6);assert.equal(await page.evaluate(()=>TALK.slides.length),16);assert.equal(await page.evaluate(()=>TALK.slides.reduce((n,s)=>n+s.minutes,0)),30);
    for(const size of [{width:1600,height:900},{width:1280,height:720},{width:900,height:1100}]){
      await page.setViewportSize(size);
      for(const slide of examples){
        assert.equal(slide.codeFocus.length,slide.notes.length);assert.equal(slide.notes.length,slide.builds.length+1);
        for(let step=0;step<=slide.builds.length;step++){
          await page.evaluate(({index,step})=>deck.navigate(index,step,false),{index:slide.index,step});
          assert.equal(await page.locator('.code-window code').textContent(),slide.code,'Escaping or tokenization changed the example');
          assert.deepEqual(await page.locator('.code-line.is-focused').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.line))),slide.codeFocus[step]);
          const problems=await page.evaluate(()=>{
            const pane=document.querySelector('.code-window'),bounds=pane.getBoundingClientRect(),frame=document.querySelector('.slide').getBoundingClientRect();const bad=[];
            const inside=(r,b)=>r.left>=b.left-1&&r.top>=b.top-1&&r.right<=b.right+1&&r.bottom<=b.bottom+1;
            for(const node of document.querySelectorAll('.code-line')){const range=document.createRange();range.selectNodeContents(node);for(const r of range.getClientRects())if(!inside(r,bounds))bad.push('Code extends beyond its window: '+node.textContent);}
            for(const node of document.querySelectorAll('.code-window,.code-label,.code-copy h2,.code-copy p,.code-links'))if(!inside(node.getBoundingClientRect(),frame))bad.push('Content extends beyond the slide: '+node.textContent);
            const copy=document.querySelector('.code-copy');if(copy.scrollWidth>copy.clientWidth+1||copy.scrollHeight>copy.clientHeight+1)bad.push('Explanation overflows its column');
            if(copy.getBoundingClientRect().right>=bounds.left)bad.push('Explanation overlaps code');
            return bad;
          });assert.deepEqual(problems,[],`${lang}/${slide.id}/${size.width}/step${step}`);
        }
        if(size.width===1600)await page.screenshot({path:resolve(root,`review/code-${slide.id}-${lang}.png`)});
      }
    }
    record(`${lang}: six code examples retain exact copyable text and fit the panel at every build on three screen sizes`);

    const byId=Object.fromEntries(examples.map(s=>[s.id,s]));
    const schema=await new AsyncFunction(byId.types.code+'\nreturn schema;')();
    const captured=[],articles=[{id:'models'},{id:'ownership'}],add=({articleId})=>({status:'added',articleId});
    await new AsyncFunction('document','schema','articles','add',byId['tool-design'].code)({modelContext:{registerTool:async tool=>captured.push(tool)}},schema,articles,add);
    assert.equal(captured[0].name,'add_to_route');assert.equal(captured[0].execute,add);assert.deepEqual(captured[0].inputSchema.required,['articleId']);assert.equal(captured[0].inputSchema.additionalProperties,false);assert.deepEqual(captured[0].inputSchema.properties.articleId.enum,['models','ownership']);
    const onUnknown=new AsyncFunction('article',byId.errors.code);const error=await onUnknown(null);assert.equal(error.code,'UNKNOWN_ARTICLE');assert.equal(error.retryable,true);assert(error.error);assert.equal(await onUnknown({id:'models'}),undefined);
    const inspectState=()=>({topicCount:7}),debugTool=await new AsyncFunction('inspectState',byId.debugging.code+'\nreturn debugTool;')(inspectState);assert.equal(debugTool.annotations.debugging,true);assert.equal(debugTool.annotations.readOnlyHint,true);assert.deepEqual(debugTool.execute(),{topicCount:7});
    const review=await new AsyncFunction('prepare','let finishReview;\n'+byId.annotations.code+'\nreturn {annotations,requestReview,finish:value=>finishReview(value)};')(args=>args.quantity>4?{error:'INVALID_QUANTITY'}:{status:'awaiting-user-review'});
    assert.equal(review.annotations.consequentialHint,true);assert.equal((await review.requestReview({quantity:5})).error,'INVALID_QUANTITY');
    for(const decision of ['rejected','confirmed']){let settled=false;const pending=review.requestReview({quantity:2}).then(value=>{settled=true;return value;});await new Promise(r=>setTimeout(r,0));assert.equal(settled,false,'Review completed without a decision');review.finish({status:decision});assert.equal((await pending).status,decision);}
    const fallback=new AsyncFunction('document','render','tool','status',byId.fallback.code);let events=[];
    await fallback({},()=>events.push('render'),{},()=>events.push('error'));assert.deepEqual(events,['render']);events=[];
    await fallback({modelContext:{registerTool:async()=>events.push('register')}},()=>events.push('render'),{},()=>events.push('error'));assert.deepEqual(events,['render','register']);events=[];
    await fallback({modelContext:{registerTool:async()=>{throw new Error('Registration failed');}}},()=>events.push('render'),{},(message,isError)=>events.push([message,isError]));assert.deepEqual(events,['render',['Registration failed',true]]);
    record(`${lang}: displayed code executes with its stated helpers, returns useful errors, waits for review, and preserves controls on unsupported or failed registration`);

    await page.setViewportSize({width:1600,height:900});await page.evaluate(index=>deck.navigate(index,0,false),byId['tool-design'].index);
    const popup=context.waitForEvent('page');await page.keyboard.press('p');const presenter=await popup;await presenter.waitForLoadState();await presenter.waitForFunction(()=>/Connected|Conectado/.test(document.querySelector('#connection').textContent));
    assert.match(await presenter.locator('#script li.active').textContent(),/registerTool/);await presenter.locator('#next').click();await page.waitForFunction(()=>deck.getState().step===1);await presenter.waitForFunction(()=>document.querySelector('#script li.active strong').textContent===TALK.slides.find(s=>s.id==='tool-design').builds[0]);
    await presenter.frameLocator('#current-preview').locator('.code-line.is-focused[data-line="4"]').waitFor();assert.equal(await presenter.locator('#script li.active').count(),1);await presenter.screenshot({path:resolve(root,`review/code-presenter-${lang}.png`),fullPage:true});await presenter.close();
    assert.equal(new URL(await page.locator('.code-links a').first().getAttribute('href')).searchParams.get('lang'),lang);
    const link=context.waitForEvent('page');await page.locator('.code-links a').first().focus();await page.keyboard.press('Enter');const demo=await link;await demo.waitForLoadState();assert.equal(new URL(demo.url()).pathname,'/demos/reading-route.html');assert.equal(await page.evaluate(()=>deck.getState().step),1);await demo.close();await page.evaluate(()=>document.activeElement.blur());
    await page.reload();assert.equal(await page.evaluate(()=>deck.getState().step),1);assert.deepEqual(await page.locator('.code-line.is-focused').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.line))),byId['tool-design'].codeFocus[1]);
    record(`${lang}: presenter notes, preview highlights, keyboard links and reload-persistent builds work on code slides`);
  }
  const offline=await browser.newContext({offline:true,reducedMotion:'reduce'}),off=await offline.newPage(),network=[];off.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  for(const lang of ['en','es']){const u=pathToFileURL(resolve(root,'slides/index.html'));u.search='?lang='+lang;u.hash='#6.1';await off.goto(u.href);await off.evaluate(()=>document.fonts.ready);assert.equal(await off.evaluate(()=>TALK.slides[deck.getState().index].kind),'code');assert(await off.evaluate(()=>document.fonts.check('400 32px "Roboto Mono"')));await off.keyboard.press('PageDown');assert.equal(await off.evaluate(()=>deck.getState().step),2);assert(await off.locator('.code-line.is-focused[data-line="10"]').count());}
  assert.deepEqual(network,[]);record('English and Spanish code slides, regular-weight local fonts and clicker highlights work offline');

  canary=await chromium.launch({executablePath:'/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',args:['--enable-experimental-web-platform-features']});
  const native=await canary.newPage();
  for(const lang of ['en','es']){
    await native.goto(`${base}/slides/index.html?lang=${lang}`);
    const outcome=await native.evaluate(async()=>{
      const Fn=Object.getPrototypeOf(async function(){}).constructor,byId=Object.fromEntries(TALK.slides.filter(s=>s.kind==='code').map(s=>[s.id,s]));
      const schema=await new Fn(byId.types.code+'\nreturn schema;')();
      await new Fn('document','schema','articles','add',byId['tool-design'].code)(document,schema,[{id:'models'}],({articleId})=>({status:'added',articleId}));
      const debug=await new Fn('inspectState',byId.debugging.code+'\nreturn debugTool;')(()=>({topicCount:7}));await document.modelContext.registerTool(debug);
      const tools=await document.modelContext.getTools(),route=tools.find(t=>t.name==='add_to_route'),inspection=tools.find(t=>t.name==='inspect_state');
      return {names:tools.map(t=>t.name),route:JSON.parse(await document.modelContext.executeTool(route,{articleId:'models'})),debugging:inspection.annotations.debugging,readOnly:inspection.annotations.readOnlyHint};
    });assert.equal(outcome.route.status,'added');assert.equal(outcome.route.articleId,'models');assert.equal(outcome.debugging,true);assert.equal(outcome.readOnly,true);
  }
  report.nativeBrowser=canary.version();record('Displayed registration and schema code register and execute through native WebMCP in real Canary, in both languages');
  assert.deepEqual(errors,[]);report.status='passed';
}catch(error){report.status='failed';report.error=error.stack;console.error(error);process.exitCode=1;}
finally{await canary?.close();await browser?.close();server?.kill();await writeFile(resolve(root,'review/slide-code-verification.json'),JSON.stringify(report,null,2)+'\n');}
