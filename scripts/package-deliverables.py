"""Package original work and licensed runtime assets, with public source links."""
import json
import re
import zipfile
from pathlib import Path

root=Path(__file__).resolve().parents[1]
out=root/'deliverables'
out.mkdir(exist_ok=True)
sources={x['snapshot'].split('/')[-1]:x['url'].replace('/export?format=txt','/edit') for x in json.loads((root/'research/source-audit.json').read_text())['guide_exports'] if 'snapshot' in x}
files=[root/p for p in ['index.html','gallery.js','content-data.js','content-manifest.json','content-manifest.es.json','locale-data.js','i18n.js','i18n.css','package.json','package-lock.json','README.md','README.es.md']]
files+=list((root/'locales').rglob('*'))
files+=list((root/'demos').rglob('*'))+list((root/'slides').rglob('*'))
files += [root/p for p in ['scripts/serve.py','scripts/verify.mjs','scripts/verify-keyboard.mjs','scripts/verify-languages.mjs','scripts/verify-slide-code.mjs','scripts/render-slide-review.mjs','scripts/build-slide-contact-sheets.py','scripts/native-contracts.mjs','scripts/build-locales.py','scripts/build-pages.py','scripts/build-research.py','research/topic-review.md','research/topic-review.es.md','research/link-inventory.md','research/link-inventory.es.md','research/row-review.json','research/row-review.es.json','research/source-audit.json','output/spreadsheet/reviewed-topics.csv','output/spreadsheet/reviewed-topics.es.csv','review/verification.json','review/language-verification.json','review/slide-code-verification.json','review/slide-code-bundle-verification.json','review/bilingual-bundle-verification.json','review/deck-en.png','review/deck-es.png','review/presenter-en.png','review/presenter-es.png','review/offline-presenter.json','review/keyboard-verification.json','review/csv-validation.json','review/completion-audit.json','review/deck-contact-sheet.jpg','review/opening-1.png','review/opening-2.png','review/opening-3.png']]
files += sorted((root/'review').glob('code-*.png')) + sorted((root/'review').glob('*contact-sheet-en.jpg')) + sorted((root/'review').glob('*contact-sheet-es.jpg'))
with zipfile.ZipFile(out/'web-ai-content-studio.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in files:
        if not p.is_file():continue
        relative=p.relative_to(root).as_posix()
        if p.suffix not in {'.md','.json'}:
            z.write(p,relative)
            continue
        text=p.read_text()
        if relative in {'research/link-inventory.md','research/link-inventory.es.md'}:
            text=re.sub(r'\[(?:Export evidence|Evidencia exportada)\]\(snapshots/([^)]*)\)',lambda m:f'[{"Contenido de Google Docs" if relative.endswith(".es.md") else "Google Docs body"}]({sources[m.group(1)]})',text)
        if relative=='research/source-audit.json':
            data=json.loads(text)
            for row in data['links']+data['guide_exports']:
                if 'snapshot' in row:row['workspace_evidence_snapshot']=row.pop('snapshot')
            data['portable_bundle_note']='Raw third-party pages and template exports remain in the research workspace; use the public source URLs in this bundle.'
            text=json.dumps(data,ensure_ascii=False,indent=2)+'\n'
        if relative in {'slides/assets/SOURCES.md','slides/assets/SOURCES.es.md'}:
            text='\n'.join(line for line in text.splitlines() if not line.startswith('- Local inspection reference:') and not line.startswith('The original stylesheet responses') and not line.startswith('- Referencias locales:') and not line.startswith('Las respuestas CSS originales'))+'\n'
        if relative=='README.md':
            text=text.split('The research scripts preserve')[0]
            text+='\nThe original CSV, source-fetching scripts, downloaded third-party pages, and organizer template export remain in the original workspace.\nThe portable bundle includes the research conclusions, public links, verification evidence, editable demos, and complete offline deck assets.\n'
        if relative=='README.es.md':
            text=text.split('Los scripts preservan intacto el CSV original.')[0]+'El paquete incluye catálogos editables, scripts de generación, revisiones bilingües y todos los recursos de la presentación.\nEl CSV original, sus scripts de extracción y las capturas de fuentes externas se conservan en el espacio de trabajo original.\nNo se ha desplegado el sitio ni enviado mensajes o formularios.\n'
        z.writestr(relative,text)
    z.writestr('BUNDLE.md','# Portable content studio\n\nExtract this entire folder before opening index.html.\nRun npm run serve and open http://localhost:8080 for the complete lab, including the second-origin iframe probe.\nThe talk also runs directly from slides/index.html with no network connection.\nRaw third-party research pages and the full organizer template are retained only in the source workspace; the review links to their public originals.\nUse English / Español on every page, or add ?lang=en / ?lang=es.\n\n## Español\n\nExtrae toda la carpeta antes de abrir index.html.\nEjecuta npm run serve y abre http://localhost:8080/?lang=es para usar el laboratorio completo.\nLa charla funciona sin conexión desde slides/index.html?lang=es.\nUsa English / Español para cambiar de idioma.\nLas fuentes externas originales y la plantilla completa se conservan en el espacio de trabajo original.\n')
with zipfile.ZipFile(out/'web-ai-content-studio.zip') as z:
    assert z.testzip() is None
    names=set(z.namelist())
    manifest=json.loads(z.read('content-manifest.json'))
    for t in manifest:
        for d in t['demos']:assert f"demos/{d['id']}.html" in names
    assert 'slides/index.html' in names and 'slides/presenter.html' in names
    for lang in ('en','es'):
        assert f'locales/{lang}.json' in names
    assert 'content-manifest.es.json' in names and 'slides/talk-i18n.js' in names
    assert json.loads(z.read('review/language-verification.json'))['status']=='passed'
    assert json.loads(z.read('review/slide-code-verification.json'))['status']=='passed'
print(out/'web-ai-content-studio.zip')
print(f'{(out/"web-ai-content-studio.zip").stat().st_size/1024/1024:.1f} MB; {len(names)} files; archive integrity verified.')
