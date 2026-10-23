/* Capture the final build of every slide, in both languages, at its native 16:9 size. */
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
const root=resolve(import.meta.dirname,'..'),browser=await chromium.launch({channel:'chrome'});
try{
  const context=await browser.newContext({offline:true,reducedMotion:'reduce',viewport:{width:1600,height:900}}),page=await context.newPage();
  for(const lang of ['en','es']){
    const folder=resolve(root,`review/slides-${lang}`);await mkdir(folder,{recursive:true});
    const url=pathToFileURL(resolve(root,'slides/index.html'));url.search='?lang='+lang;
    await page.goto(url.href);await page.evaluate(()=>document.fonts.ready);
    const count=await page.evaluate(()=>TALK.slides.length);
    for(let index=0;index<count;index++){
      await page.evaluate(index=>deck.navigate(index,TALK.slides[index].builds.length,false),index);
      await page.screenshot({path:resolve(folder,`slide-${String(index+1).padStart(2,'0')}.png`)});
    }
    console.log(`Rendered ${count} ${lang} slides offline.`);
  }
}finally{await browser.close();}
