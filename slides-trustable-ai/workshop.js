// Selects the active language talk payload (defaults to Spanish 'es' for DevFest Pereira 2026)
window.TALK = (window.I18N && window.I18N.lang === 'en')
  ? window.WORKSHOP_EN
  : window.WORKSHOP_ES;
