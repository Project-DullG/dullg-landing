"""Import the self-contained tabletop build under a collision-free public prefix."""
from pathlib import Path
import argparse, hashlib, json, subprocess, shutil

p = argparse.ArgumentParser()
p.add_argument('source', type=Path, help='울릉마블 web/dist 폴더')
args = p.parse_args()
root = Path(__file__).resolve().parents[1]
src = args.source.resolve()
dest = root / 'public/ulleung-marble'
runtime = {'film-poster.jpg', 'ulleung-marble-play.mp4', 'coast-bright.webp', 'table-spread.webp', 'play-ko.vtt'}
paths = [Path(x) for x in ['index.html', 'favicon.svg', 'tabletop/master.html', 'tabletop/components.html', 'tabletop/models.mjs', 'assets/master/character-candidates.webp']]
for folder in ['tabletop/v07', 'assets/v07', 'assets/geography', 'vendor']:
    paths += [f.relative_to(src) for f in (src / folder).rglob('*') if f.is_file() and f.name != '.DS_Store' and ('/promo/' not in str(f) or f.name in runtime)]
manifest = []
for rel in sorted(set(paths)):
    f, out = src / rel, dest / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    data = f.read_bytes()
    if f.suffix in {'.html', '.mjs', '.js', '.css', '.json', '.svg'}:
        s = data.decode('utf-8')
        for prefix in ['/assets/', '/tabletop/', '/vendor/', '/favicon.svg']:
            s = s.replace(prefix, '/ulleung-marble' + prefix)
        s = s.replace('href="/"', 'href="/games/ulleung-marble"')
        if rel == Path('index.html'):
            url = 'https://dullg-landing-one.vercel.app/games/ulleung-marble'
            s = s.replace('</head>', f'<link rel="canonical" href="{url}"><meta property="og:url" content="{url}"></head>')
            s = s.replace('content="/ulleung-marble/assets/v07/promo/coast-bright.webp"', 'content="https://dullg-landing-one.vercel.app/ulleung-marble/assets/v07/promo/coast-bright.webp"')
            s = s.replace('<footer class="wrap footer">', '<footer class="wrap footer"><a href="/mini-projects">단서공방 게임 목록 ↗</a>')
        data = s.encode('utf-8')
    if data == f.read_bytes():
        result = subprocess.run(['/bin/cp', '-c', str(f), str(out)], capture_output=True)
        if result.returncode: shutil.copy2(f, out)
    else:
        out.write_bytes(data)
    manifest.append({'path': str(rel), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
(root / 'docs/ulleung-marble-files.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
print(f'{len(manifest)} files imported into {dest}')
