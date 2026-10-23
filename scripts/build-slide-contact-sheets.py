"""Create language-specific review sheets from the rendered slides. Requires Pillow."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

root=Path(__file__).resolve().parents[1]
font=ImageFont.truetype(str(root/'slides/assets/roboto-mono-400.ttf'),18)
for lang in ('en','es'):
    slides=sorted((root/f'review/slides-{lang}').glob('slide-*.png'))
    assert len(slides)==16
    for name,files,columns,width in [
        (f'deck-contact-sheet-{lang}.jpg',slides,4,400),
        (f'code-contact-sheet-{lang}.jpg',sorted((root/'review').glob(f'code-*-{lang}.png')),2,800)
    ]:
        files=[p for p in files if 'presenter' not in p.name]
        height=round(width*9/16)
        gap=18;label=32;rows=(len(files)+columns-1)//columns
        canvas=Image.new('RGB',(gap+(width+gap)*columns,gap+(height+label+gap)*rows),'#f0f0f0')
        draw=ImageDraw.Draw(canvas)
        for i,path in enumerate(files):
            x=gap+(i%columns)*(width+gap);y=gap+(i//columns)*(height+label+gap)
            image=Image.open(path).convert('RGB').resize((width,height),Image.Resampling.LANCZOS)
            canvas.paste(image,(x,y));draw.text((x,y+height+5),path.stem,font=font,fill='#1e1e1e')
        canvas.save(root/'review'/name,quality=91)
        if name=='deck-contact-sheet-es.jpg':canvas.save(root/'review/deck-contact-sheet.jpg',quality=91)
        print(name)
