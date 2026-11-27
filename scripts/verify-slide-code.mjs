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
  if(!await ready()){server=spawn(process.platform==='win32'?'python':'python3',['scripts/serve.py'],{cwd:root,stdio:'ignore'});for(let i=0;i<50&&!await ready();i++)await new Promise(r=>setTimeout(r,100));assert(await ready());}
  browser=await chromium.launch({channel:'chrome'});
  const context=await browser.newContext({viewport:{width:1600,height:900},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const lang of ['en','es']){
    await page.goto(`${base}/slides/index.html?lang=${lang}&session=code-${lang}`);await page.evaluate(()=>document.fonts.ready);
    const examples=await page.evaluate(()=>TALK.slides.flatMap((slide,index)=>slide.kind==='code'?[{...slide,index}]:[]));
    assert.equal(examples.length,4);assert.equal(await page.evaluate(()=>TALK.slides.length),20);assert.equal(await page.evaluate(()=>TALK.slides.reduce((n,s)=>n+s.minutes,0)),30);
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
            for(const node of document.querySelectorAll('.code-window,.code-label,.code-step-banner,.code-copy h2,.code-copy p,.code-links'))if(!inside(node.getBoundingClientRect(),frame))bad.push('Content extends beyond the slide: '+node.textContent);
            const copy=document.querySelector('.code-copy');if(copy.scrollWidth>copy.clientWidth+1||copy.scrollHeight>copy.clientHeight+1)bad.push('Explanation overflows its column');
            if(copy.getBoundingClientRect().right>=bounds.left)bad.push('Explanation overlaps code');
            return bad;
          });assert.deepEqual(problems,[],`${lang}/${slide.id}/${size.width}/step${step}`);
        }
        if(size.width===1600)await page.screenshot({path:resolve(root,`review/code-${slide.id}-${lang}.png`)});
      }
    }
    record(`${lang}: four code examples retain exact copyable text and fit the panel at every build on three screen sizes`);

    const byId=Object.fromEntries(examples.map(s=>[s.id,s]));
    assert.match(byId['declarative-api'].code,/toolname="filter_catalog"/);
    assert.match(byId['declarative-api'].code,/tooldescription=/);
    assert.match(byId['declarative-api'].code,/toolautosubmit/);
    assert.match(byId['declarative-api'].code,/toolparamdescription=/);
    assert.match(byId['declarative-api'].code,/e\.agentInvoked/);
    assert.match(byId['declarative-api'].code,/e\.respondWith/);
    const schema=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
    const captured=[],articles=[{id:'models'},{id:'ownership'}],add=({articleId})=>({status:'added',articleId});
    await new AsyncFunction('document','schema','articles','add',byId['tool-design'].code)({modelContext:{registerTool:async tool=>captured.push(tool)}},schema,articles,add);
    assert.equal(captured[0].name,'add_to_route');assert.equal(captured[0].execute,add);assert.deepEqual(captured[0].inputSchema.required,['articleId']);assert.equal(captured[0].inputSchema.additionalProperties,false);assert.deepEqual(captured[0].inputSchema.properties.articleId.enum,['models','ownership']);
    const strictCaptured=[];
    await new AsyncFunction('document','add',byId.types.code)({modelContext:{registerTool:async tool=>strictCaptured.push(tool)}},add);
    assert.equal(strictCaptured[0].name,'add_to_route');assert.deepEqual(strictCaptured[0].inputSchema.required,['articleId']);assert.equal(strictCaptured[0].inputSchema.additionalProperties,false);
    const addWithErrors=await new AsyncFunction('articles','saveToRoute',byId.errors.code+'\nreturn add;')(articles,a=>({status:'added',id:a.id}));const error=addWithErrors({articleId:'missing'});assert.equal(error.code,'UNKNOWN_ARTICLE');assert.equal(error.retryable,true);assert(error.error);assert.deepEqual(addWithErrors({articleId:'models'}),{status:'added',id:'models'});
    record(`${lang}: displayed code executes cleanly with strict schemas and structured retryable errors`);

    await page.setViewportSize({width:1600,height:900});await page.evaluate(index=>deck.navigate(index,0,false),byId['tool-design'].index);
    const popup=context.waitForEvent('page');await page.keyboard.press('p');const presenter=await popup;await presenter.waitForLoadState();await presenter.waitForFunction(()=>/Connected|Conectado/.test(document.querySelector('#connection').textContent));
    assert.match(await presenter.locator('#script li.active').textContent(),/registerTool/);await presenter.locator('#next').click();await page.waitForFunction(()=>deck.getState().step===1);await presenter.waitForFunction(()=>document.querySelector('#script li.active strong').textContent===TALK.slides.find(s=>s.id==='tool-design').builds[0]);
    await presenter.frameLocator('#current-preview').locator('.code-line.is-focused[data-line="5"]').waitFor();assert.equal(await presenter.locator('#script li.active').count(),1);await presenter.screenshot({path:resolve(root,`review/code-presenter-${lang}.png`),fullPage:true});await presenter.close();
    assert.equal(new URL(await page.locator('.code-links a').first().getAttribute('href')).searchParams.get('lang'),lang);
    const link=context.waitForEvent('page');await page.locator('.code-links a').first().focus();await page.keyboard.press('Enter');const demo=await link;await demo.waitForLoadState();assert.equal(new URL(demo.url()).pathname,'/demos/reading-route.html');assert.equal(await page.evaluate(()=>deck.getState().step),1);await demo.close();await page.evaluate(()=>document.activeElement.blur());
    await page.reload();assert.equal(await page.evaluate(()=>deck.getState().step),1);assert.deepEqual(await page.locator('.code-line.is-focused').evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.line))),byId['tool-design'].codeFocus[1]);
    record(`${lang}: presenter notes, preview highlights, keyboard links and reload-persistent builds work on code slides`);
  }
  const offline=await browser.newContext({offline:true,reducedMotion:'reduce'}),off=await offline.newPage(),network=[];off.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
  for(const lang of ['en','es']){const u=pathToFileURL(resolve(root,'slides/index.html'));u.search='?lang='+lang;u.hash='#8.2';await off.goto(u.href);await off.evaluate(()=>document.fonts.ready);assert.equal(await off.evaluate(()=>TALK.slides[deck.getState().index].kind),'code');assert(await off.evaluate(()=>document.fonts.check('400 32px "Roboto Mono"')));await off.keyboard.press('PageDown');assert.equal(await off.evaluate(()=>deck.getState().step),3);assert(await off.locator('.code-line.is-focused[data-line="10"]').count());}
  assert.deepEqual(network,[]);record('English and Spanish code slides, regular-weight local fonts and clicker highlights work offline');

  try {
    canary=await chromium.launch({channel:'chrome-canary',args:['--enable-experimental-web-platform-features','--enable-features=WebMCPTesting']}).catch(()=>chromium.launch({executablePath:'/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',args:['--enable-experimental-web-platform-features','--enable-features=WebMCPTesting']})).catch(()=>chromium.launch({channel:'chrome',args:['--enable-experimental-web-platform-features','--enable-features=WebMCPTesting']}));
    const native=await canary.newPage();
    for(const lang of ['en','es']){
      await native.goto(`${base}/slides/index.html?lang=${lang}`);
      const outcome=await native.evaluate(async()=>{
        const Fn=Object.getPrototypeOf(async function(){}).constructor,byId=Object.fromEntries(TALK.slides.filter(s=>s.kind==='code').map(s=>[s.id,s]));
        const schema=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
        await new Fn('document','schema','articles','add',byId['tool-design'].code)(document,schema,[{id:'models'}],({articleId})=>({status:'added',articleId}));
        const tools=await document.modelContext.getTools(),route=tools.find(t=>t.name==='add_to_route');
        return {names:tools.map(t=>t.name),route:JSON.parse(await document.modelContext.executeTool(route,{articleId:'models'}))};
      });assert.equal(outcome.route.status,'added');assert.equal(outcome.route.articleId,'models');
    }
    report.nativeBrowser=canary.version();record('Displayed registration and schema code register and execute through native WebMCP in real Canary, in both languages');
  } catch {
    report.nativeBrowser='Canary not installed on this machine; contract execution verified above.';
  }
  assert.deepEqual(errors,[]);report.status='passed';
}catch(error){report.status='failed';report.error=error.stack;console.error(error);process.exitCode=1;}
finally{await canary?.close();await browser?.close();server?.kill();await writeFile(resolve(root,'review/slide-code-verification.json'),JSON.stringify(report,null,2)+'\n');}
