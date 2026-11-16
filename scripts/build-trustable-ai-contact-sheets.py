"""Build 6-column contact sheets for all 37 slides of the Trustable AI at 100 MPH workshop (ES & EN)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
font = ImageFont.truetype(str(root / 'slides-trustable-ai/assets/roboto-mono-400.ttf'), 17)

for lang in ('es', 'en'):
    slides = sorted((root / f'review/trustable-ai-{lang}').glob('slide-*.png'))
    assert len(slides) == 37, f'Expected 37 slides for {lang}, found {len(slides)}'
    columns = 6
    width = 360
    height = round(width * 9 / 16)
    gap = 16
    label = 28
    rows = (len(slides) + columns - 1) // columns
    canvas = Image.new('RGB', (gap + (width + gap) * columns, gap + (height + label + gap) * rows), '#f0f0f0')
    draw = ImageDraw.Draw(canvas)
    for i, path in enumerate(slides):
        x = gap + (i % columns) * (width + gap)
        y = gap + (i // columns) * (height + label + gap)
        image = Image.open(path).convert('RGB').resize((width, height), Image.Resampling.LANCZOS)
        canvas.paste(image, (x, y))
        draw.text((x, y + height + 4), path.stem, font=font, fill='#1e1e1e')
    out_path = root / 'review' / f'trustable-ai-contact-sheet-{lang}.jpg'
    canvas.save(out_path, quality=91)
    print(f'Saved {out_path.name} ({canvas.size[0]}x{canvas.size[1]})')
