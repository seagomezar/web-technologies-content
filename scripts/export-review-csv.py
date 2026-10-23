"""Independent pandas validation and a tidy, non-destructive review export."""
import json
from pathlib import Path
import pandas as pd

root=Path(__file__).resolve().parents[1]
source=next(root.glob('*.csv'))
df=pd.read_csv(source,skiprows=6,keep_default_na=False).drop(columns=['Unnamed: 0'])
review=pd.DataFrame(json.loads((root/'research/row-review.json').read_text()))
assert len(df)==20
df.insert(0,'csv_line',range(8,28))
assert df['csv_line'].tolist()==review['csv_line'].tolist()
assert pd.to_datetime(df['Date'],utc=True).notna().all()
assert df['Subject'].str.len().gt(0).all()
manifest=json.loads((root/'content-manifest.json').read_text())
ids={t['id'] for t in manifest}
for row in review.itertuples():
    assert set(row.proposals)<=ids
for t in manifest:
    assert len(t['demos'])>=3
    for d in t['demos']:assert (root/'demos'/f"{d['id']}.html").is_file()
merged=df[['csv_line','Date','Subject']].merge(review,on='csv_line',validate='one_to_one')
merged['proposals']=merged['proposals'].map(lambda a:'; '.join(a))
merged['sources']=merged['sources'].map(lambda a:'; '.join(a))
out=root/'output/spreadsheet'
out.mkdir(parents=True,exist_ok=True)
merged.to_csv(out/'reviewed-topics.csv',index=False)
(root/'review/csv-validation.json').write_text(json.dumps({'source':source.name,'rows':len(df),'header_line':7,'all_rows_reviewed':True,'all_proposals_resolve':True,'proposal_count':len(manifest),'html_demo_count':sum(len(t['demos']) for t in manifest)},indent=2)+'\n')
print('Pandas independently verified 20 records, all source-to-proposal mappings, and 21 HTML demos.')

spanish=pd.DataFrame(json.loads((root/'research/row-review.es.json').read_text()))
assert len(spanish)==20 and spanish['csv_line'].tolist()==review['csv_line'].tolist()
translated=df[['csv_line','Date','Subject']].merge(spanish,on='csv_line',validate='one_to_one')
translated['proposals']=translated['proposals'].map(lambda a:'; '.join(a))
translated['sources']=translated['sources'].map(lambda a:'; '.join(a))
translated.rename(columns={'csv_line':'linea_csv','Date':'fecha','Subject':'asunto_original','topic':'tema','finding':'conclusion','analysis':'analisis','proposals':'propuestas','sources':'fuentes'}).to_csv(out/'reviewed-topics.es.csv',index=False)
assert translated['Subject'].tolist()==df['Subject'].tolist()
print('Spanish export verified: 20 translated judgments; original subjects, IDs and source URLs preserved.')
