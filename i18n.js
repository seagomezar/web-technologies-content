/* Shared localization. Samples and machine-readable contracts keep their declared language. */
(() => {
  const requested = new URLSearchParams(location.search).get('lang');
  const lang = requested === 'es' ? 'es' : 'en';
  const messages = window.LOCALES?.[lang] || {};
  const patterns = (window.LOCALE_PATTERNS?.[lang] || []).map(([a,b]) => [new RegExp(a),b]);
  function text(value) {
    const input = String(value), core = input.trim();
    let translated = messages[core];
    if (translated === undefined) for (const [pattern, replacement] of patterns) {
      if (pattern.test(core)) { translated = core.replace(pattern,(...args)=>replacement.replace(/\$(\d+)/g,(_,n)=>text(args[Number(n)]??''))); break; }
    }
    return translated === undefined ? input : input.replace(core,translated);
  }
  const translateData = value => Array.isArray(value) ? value.map(translateData) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k,v])=>[k,translateData(v)])) : typeof value === 'string' ? text(value) : value;
  function url(href, targetLang=lang) {
    const target = new URL(href,location.href);
    if (target.origin !== location.origin) return href;
    const docNames=['README','topic-review','link-inventory'];
    for(const name of docNames)if(target.pathname.endsWith('/'+name+'.md')||target.pathname.endsWith('/'+name+'.es.md')){target.pathname=target.pathname.replace(/[^/]+$/,name+(targetLang==='es'?'.es':'')+'.md');return target.href;}
    if (!/\.html$|\/$/.test(target.pathname)) return href;
    target.searchParams.set('lang',targetLang);
    return target.href;
  }
  function localize(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      if (root.parentElement?.closest('script,style,code,pre:not(#ledger),textarea,[data-original],.language-switch')) return;
      const next=text(root.nodeValue); if(next!==root.nodeValue)root.nodeValue=next;
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) {
      for(const attr of ['placeholder','title','aria-label','alt','content']) {
        if (root.hasAttribute(attr)) { const a=root.getAttribute(attr),b=text(a);if(a!==b)root.setAttribute(attr,b); }
      }
      if (root.tagName === 'OPTION' && !root.hasAttribute('value')) root.setAttribute('value',root.textContent);
      if (root.tagName === 'A' && root.hasAttribute('href') && !root.closest('.language-switch')) {
        const a=root.getAttribute('href'); if(!a.startsWith('#')){const b=url(a);if(a!==b)root.setAttribute('href',b);}
      }
    }
    for(const node of [...root.childNodes])localize(node);
  }
  window.I18N={lang,text,translateData,url};
  document.documentElement.lang=lang;
  addEventListener('DOMContentLoaded',()=>{
    const nav=document.createElement('nav');nav.className='language-switch';nav.setAttribute('aria-label',lang==='es'?'Idioma':'Language');
    nav.innerHTML=['en','es'].map(code=>`<a lang="${code}" hreflang="${code}" href="${url(location.href,code)}" ${lang===code?'aria-current="true"':''}>${code==='en'?'English':'Español'}</a>`).join('');
    (document.querySelector('header')||document.body).append(nav);
    // Keep language links aligned with slide/build history without losing other query settings.
    const sync=()=>nav.querySelectorAll('a').forEach(a=>a.href=url(location.href,a.lang));
    addEventListener('hashchange',sync);addEventListener('popstate',sync);
    for(const method of ['pushState','replaceState']) {const original=history[method].bind(history);history[method]=(...args)=>{const result=original(...args);sync();return result;};}
    localize(document);
    new MutationObserver(records=>{for(const record of records){if(record.type==='characterData')localize(record.target);else if(record.type==='attributes')localize(record.target);else record.addedNodes.forEach(localize);}}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label','href']});
  });
})();
