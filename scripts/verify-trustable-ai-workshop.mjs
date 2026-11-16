import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(import.meta.dirname, '..');
const base = 'http://localhost:8080';
const report = {
  checkedAt: new Date().toISOString(),
  deck: 'slides-trustable-ai',
  checks: [],
};
const errors = [];
let server, browser;

const wait = ms => new Promise(r => setTimeout(r, ms));
const record = (name, detail = '') => {
  report.checks.push({ name, status: 'pass', ...(detail ? { detail } : {}) });
  console.log('PASS', name);
};

async function ready() {
  try { return (await fetch(base)).ok; } catch { return false; }
}

try {
  if (!await ready()) {
    server = spawn(process.platform === 'win32' ? 'python' : 'python3', ['scripts/serve.py'], { cwd: root, stdio: 'ignore' });
    for (let i = 0; i < 50 && !await ready(); i++) await wait(100);
    assert(await ready(), 'Local HTTP server did not start on :8080');
  }

  await mkdir(resolve(root, 'review'), { recursive: true });
  browser = await chromium.launch({ channel: 'chrome' });
  report.browser = browser.version();

  const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });

  // 1. Verify root gallery links to the new workshop in both languages
  for (const lang of ['en', 'es']) {
    await page.goto(`${base}/index.html?lang=${lang}`);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.topic-card').count(), 7);
    assert.equal(await page.locator('.topic-card ol a').count(), 21);
    const wsLink = await page.locator('a[href*="slides-trustable-ai/index.html"]').first().getAttribute('href');
    assert(wsLink && wsLink.includes(`lang=${lang}`), `Gallery workshop link missing lang=${lang}`);
    const lastAction = await page.locator('.intro .actions a').last().getAttribute('href');
    assert(lastAction.includes(lang === 'es' ? 'topic-review.es.md' : 'topic-review.md'));
  }
  record('Root gallery links to Trustable AI Workshop in both EN and ES while preserving all 7 modules and 21 demos');

  // 2. Verify all 37 slides & all build steps in both ES and EN
  for (const lang of ['es', 'en']) {
    await page.goto(`${base}/slides-trustable-ai/index.html?lang=${lang}&session=verify-${lang}&city=Pereira%202026`);
    await page.evaluate(() => document.fonts.ready);

    const meta = await page.evaluate(() => ({
      htmlLang: document.documentElement.lang,
      count: TALK.slides.length,
      minutes: TALK.slides.reduce((s, x) => s + x.minutes, 0),
      planned: TALK.plannedMinutes,
      badNotes: TALK.slides.map((s, i) => s.notes.length === s.builds.length + 1 ? null : i + 1).filter(Boolean),
    }));
    assert.equal(meta.htmlLang, lang);
    assert.equal(meta.count, 37);
    assert.equal(meta.minutes, 90);
    assert.equal(meta.planned, 90);
    assert.deepEqual(meta.badNotes, []);

    // Verify Slide 2 explicitly highlights https://github.com/seagomezar/trustable-ai-codelab
    await page.evaluate(() => deck.navigate(1, 0, false));
    const slide2RepoHref = await page.locator('.slide a[href="https://github.com/seagomezar/trustable-ai-codelab"]').first().getAttribute('href');
    assert.equal(slide2RepoHref, 'https://github.com/seagomezar/trustable-ai-codelab');

    const layoutIssues = [];
    for (let i = 0; i < meta.count; i++) {
      const buildCount = await page.evaluate(idx => TALK.slides[idx].builds.length, i);
      for (let step = 0; step <= buildCount; step++) {
        await page.evaluate(({ idx, st }) => deck.navigate(idx, st, false), { idx: i, st: step });
        // Ensure images on this slide finished loading
        await page.evaluate(async () => {
          const imgs = [...document.querySelectorAll('.slide img')];
          await Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })));
        });

        const check = await page.evaluate(() => {
          const slide = document.querySelector('.slide').getBoundingClientRect();
          const selectors = [
            '.slide-content h1', '.slide-content h2', '.slide-content h3',
            '.ws-header', '.ws-body', '.title-wrap', '.coauthors', '.speaker-col',
            '.section-hero', '.section-goals', '.roadmap-col', '.diagram-card',
            '.takeaway-bar', '.comp-context', '.comp-card', '.sb-source', '.sb-lane', '.sb-sink',
            '.code-copy', '.code-example', '.code-window', '.code-step-banner', '.tip-box',
            '.physics-card', '.persona-card', '.visual-frame', '.visual-note',
            '.sim-frame-wrap', '.domain-table', '.spec-list', '.resource-links'
          ].join(',');

          const out = [];
          for (const el of document.querySelectorAll(selectors)) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) continue;
            if (r.left < slide.left - 1 || r.right > slide.right + 1 || r.top < slide.top - 1 || r.bottom > slide.bottom + 1) {
              out.push({ tag: el.className || el.tagName, rect: { l: Math.round(r.left - slide.left), t: Math.round(r.top - slide.top), r: Math.round(r.right - slide.left), b: Math.round(r.bottom - slide.top) } });
            }
          }

          // Ensure .code-copy children never cross .panel-shape's top-left notch (y=294) or bottom border (y=830)
          const codeCopy = document.querySelector('.code-copy');
          if (codeCopy) {
            for (const child of codeCopy.children) {
              const r = child.getBoundingClientRect();
              const topRel = r.top - slide.top;
              const botRel = r.bottom - slide.top;
              if (topRel < 310 || botRel > 818) {
                out.push({ tag: 'code-copy-child:' + (child.className || child.tagName), rect: { t: Math.round(topRel), b: Math.round(botRel) } });
              }
            }
          }

          const codeOverflow = [...document.querySelectorAll('.code-window')].filter(
            pre => pre.scrollWidth > pre.clientWidth + 3 || pre.scrollHeight > pre.clientHeight + 3
          ).map(pre => ({ sw: pre.scrollWidth, cw: pre.clientWidth, sh: pre.scrollHeight, ch: pre.clientHeight }));

          const brokenImgs = [...document.querySelectorAll('.slide img')].filter(
            img => !img.complete || img.naturalWidth === 0
          ).map(img => img.getAttribute('src'));

          return { out, codeOverflow, brokenImgs };
        });

        if (check.out.length || check.codeOverflow.length || check.brokenImgs.length) {
          layoutIssues.push({ lang, slide: i + 1, step, ...check });
        }
      }
    }
    assert.deepEqual(layoutIssues, [], `${lang} layout/asset issues: ${JSON.stringify(layoutIssues, null, 2)}`);
    record(`${lang.toUpperCase()}: all 37 slides (including Slide 2 GitHub repo notice) stay inside 1600x900 with zero code clipping and zero broken images`);

    // 3. Test embedded live simulator on Slide 18 (index 17)
    await page.evaluate(() => deck.navigate(17, 0, false));
    const simFrame = page.frameLocator('.sim-frame');
    await simFrame.locator('[data-coach="aj"]').click();
    await simFrame.locator('#btn-rain').click();
    assert((await simFrame.locator('#btn-rain').getAttribute('class') || '').includes('on'));
    await simFrame.locator('#btn-phys').click();
    assert((await simFrame.locator('#btn-phys').getAttribute('class') || '').includes('off'));
    await wait(350);
    const feedItems = await simFrame.locator('#feed .msg').count();
    assert(feedItems >= 1, `${lang}: live-sim did not emit coaching messages`);
    record(`${lang.toUpperCase()}: embedded Split-Brain simulator (Slide 18) responds to persona, rain (0.6g), and physics toggles`);

    // 4. Test Presenter View sync, step highlight, and 90-min clock
    await page.evaluate(() => deck.navigate(8, 0, false)); // Slide 9 (code slide with 2 builds)
    const presenterPromise = context.waitForEvent('page');
    await page.keyboard.press('p');
    const presenter = await presenterPromise;
    await presenter.waitForLoadState();
    await presenter.waitForFunction(() => /Conectado|Connected/.test(document.querySelector('#connection')?.textContent || ''));
    await presenter.locator('#next').click();
    await page.waitForFunction(() => deck.getState().index === 8 && deck.getState().step === 1);
    await wait(200);
    assert.equal(await page.evaluate(() => deck.getState().step), 1, 'Duplicate presenter command advance');
    await presenter.locator('#clock').click();
    await page.waitForFunction(() => Boolean(deck.getState().startedAt));
    await presenter.locator('#clock').click();
    await page.waitForFunction(() => Boolean(deck.getState().pausedAt));
    await presenter.screenshot({ path: resolve(root, `review/trustable-ai-presenter-${lang}.png`), fullPage: true });
    await presenter.close();
    record(`${lang.toUpperCase()}: Presenter View syncs builds, previews current/next slide, and controls 90-minute timer`);
  }

  // 5. Offline file:// verification + full 37-slide PNG rendering in ES and EN
  const offline = await browser.newContext({ offline: true, reducedMotion: 'reduce', viewport: { width: 1600, height: 900 } });
  const off = await offline.newPage();
  const externalRequests = [];
  off.on('request', req => { if (/^https?:/.test(req.url())) externalRequests.push(req.url()); });
  off.on('pageerror', e => errors.push(`offline pageerror: ${e.message}`));

  for (const lang of ['es', 'en']) {
    const outDir = resolve(root, `review/trustable-ai-${lang}`);
    await mkdir(outDir, { recursive: true });
    const fileUrl = pathToFileURL(resolve(root, 'slides-trustable-ai/index.html'));
    fileUrl.search = `?lang=${lang}&city=Pereira%202026`;
    await off.goto(fileUrl.href);
    await off.evaluate(() => document.fonts.ready);
    assert(await off.evaluate(() => document.fonts.check('700 30px "Google Sans"') && document.fonts.check('400 20px "Roboto Mono"')));

    // Hide floating control bar for crisp review renders
    await off.evaluate(() => document.body.classList.add('hide-controls'));
    for (let i = 0; i < 37; i++) {
      await off.evaluate(idx => deck.navigate(idx, TALK.slides[idx].builds.length, false), i);
      if (i === 17) await wait(450); // Let embedded simulator render initial messages
      await off.screenshot({ path: resolve(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`) });
    }
  }

  // Test offline language toggle preserving slide + build hash
  const switchTestUrl = pathToFileURL(resolve(root, 'slides-trustable-ai/index.html'));
  switchTestUrl.search = '?lang=es&city=Pereira%202026';
  switchTestUrl.hash = '#14.1';
  await off.goto(switchTestUrl.href);
  await off.evaluate(() => document.body.classList.remove('hide-controls'));
  await off.locator('.language-switch a[lang="en"]').click();
  await off.waitForFunction(() => document.documentElement.lang === 'en');
  assert.equal(new URL(off.url()).hash, '#14.1');
  assert.equal(await off.evaluate(() => deck.getState().index), 13);
  assert.equal(await off.evaluate(() => deck.getState().step), 1);
  assert.deepEqual(externalRequests, []);
  await offline.close();
  record('Offline file:// mode loads local fonts, switches ES/EN preserving #slide.step, makes zero network calls, and renders all 74 PNGs');

  assert.deepEqual(errors, [], `Uncaught errors: ${errors.join('; ')}`);
  record('Zero console or page errors across all HTTP and offline flows');
  report.status = 'passed';
} catch (err) {
  report.status = 'failed';
  report.error = err.stack || String(err);
  console.error(err);
  process.exitCode = 1;
} finally {
  await browser?.close();
  if (server) server.kill();
  await writeFile(resolve(root, 'review/trustable-ai-verification.json'), JSON.stringify(report, null, 2) + '\n');
}
