/* Workshop localization helper — defaults to Spanish ('es') for DevFest Pereira 2026, supports ?lang=en */
(() => {
  const requested = new URLSearchParams(location.search).get('lang');
  const lang = requested === 'en' ? 'en' : 'es';

  function url(href, targetLang = lang) {
    try {
      const target = new URL(href, location.href);
      if (target.origin !== location.origin) return href;
      if (!/\.html$|\/$/.test(target.pathname)) return href;
      target.searchParams.set('lang', targetLang);
      return target.href;
    } catch {
      return href;
    }
  }

  window.I18N = { lang, url };
  document.documentElement.lang = lang;

  addEventListener('DOMContentLoaded', () => {
    const nav = document.createElement('nav');
    nav.className = 'language-switch';
    nav.setAttribute('aria-label', lang === 'es' ? 'Idioma' : 'Language');
    nav.innerHTML = ['es', 'en']
      .map(
        code =>
          `<a lang="${code}" hreflang="${code}" href="${url(location.href, code)}" ${
            lang === code ? 'aria-current="true"' : ''
          }>${code === 'es' ? 'Español' : 'English'}</a>`
      )
      .join('');
    (document.querySelector('header') || document.body).append(nav);

    const sync = () =>
      nav.querySelectorAll('a').forEach(a => {
        a.href = url(location.href, a.lang);
      });
    addEventListener('hashchange', sync);
    addEventListener('popstate', sync);
    for (const method of ['pushState', 'replaceState']) {
      const original = history[method].bind(history);
      history[method] = (...args) => {
        const result = original(...args);
        sync();
        return result;
      };
    }
  });
})();
