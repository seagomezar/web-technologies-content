(() => {
  if (I18N.lang === 'en') {
    TALK.title=TALK_EN.title; TALK.defaults={...TALK.defaults,...TALK_EN.defaults};
    TALK.slides=TALK.slides.map(slide=>({...slide,...TALK_EN.slides.find(s=>s.id===slide.id)}));
  } else {
    TALK.slides.forEach(slide=>{if(slide.demoTitle)slide.demoTitle=I18N.text(slide.demoTitle);});
  }
  TALK.language=I18N.lang;
})();
