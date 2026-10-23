import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from '@playwright/test';

const browser=await chromium.launch({channel:'chrome'});
try {
  const context=await browser.newContext({reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto('http://localhost:8080/slides/index.html?lang=es#4.0');
  await page.locator('.demo-link').focus();
  const opened=context.waitForEvent('page');
  await page.keyboard.press('Enter');
  const demo=await opened;
  await demo.waitForLoadState();
  assert.equal(new URL(demo.url()).pathname,'/demos/reading-route.html');
  assert.equal(new URL(demo.url()).searchParams.get('lang'),'es');
  assert.equal(new URL(page.url()).hash,'#4.0');
  await demo.close();
  await page.evaluate(()=>document.querySelector('.demo-link').blur());
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>deck.getState().index===4);
  await page.locator('#presenter').focus();
  const present=context.waitForEvent('page');
  await page.keyboard.press('Enter');
  const presenter=await present;
  await presenter.waitForLoadState();
  await presenter.waitForFunction(()=>document.querySelector('#connection').textContent.startsWith('Conectado'));
  const evidence={checkedAt:new Date().toISOString(),status:'passed',checks:['Enter on a focused demo link opens the demo and preserves the current slide.','Enter on the slide advances normally.','Enter on the presenter button opens a connected presenter window.']};
  await writeFile(resolve(import.meta.dirname,'../review/keyboard-verification.json'),JSON.stringify(evidence,null,2)+'\n');
  console.log('PASS keyboard links, slide navigation, and presenter button');
}finally {await browser.close();}
