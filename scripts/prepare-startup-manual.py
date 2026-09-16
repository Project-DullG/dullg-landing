"""Prepare the user-supplied application manual for public reading."""
from pathlib import Path
import fitz

source = Path('/Users/kimkanghoon/Downloads/모두의 창업_신청접수 매뉴얼 2차.pdf')
target = Path('public/assets/materials/modoo-startup')
target.mkdir(parents=True, exist_ok=True)
doc = fitz.open(source)
page = doc[3]
# Remove the sample account email from the embedded screenshot, not just cover it.
page.add_redact_annot(fitz.Rect(157, 249, 260, 269), fill=(1, 1, 1))
page.apply_redactions(images=2)
doc.set_metadata({})
doc.save(target / 'application-manual-round2.pdf', garbage=4, deflate=True)
doc.close()
with fitz.open(target / 'application-manual-round2.pdf') as clean:
    for index, page in enumerate(clean):
        page.get_pixmap(matrix=fitz.Matrix(1.8, 1.8)).save(target / f'page-{index + 1:02}.png')
