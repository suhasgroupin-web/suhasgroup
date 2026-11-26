#!/usr/bin/env bash
# Builds the two separate Cloudflare Pages roots.
#   $1 = output base dir (default /tmp/suhas-sites)
#   <base>/ecom  -> https://suhasmax.pages.dev   (SUHAS E-COM only, with Pages Functions)
#   <base>/group -> https://suhasgroup.pages.dev (SUHAS GROUP apps only, no SUHAS MAX social site, no functions)
set -euo pipefail
OUT="${1:-/tmp/suhas-sites}"
ECOM_URL="https://suhasmax.pages.dev"
GROUP_URL="https://suhasgroup.pages.dev"
rm -rf "$OUT"; mkdir -p "$OUT/ecom" "$OUT/group"

# ---------- E-COM site (root = apps/suhas-ecom) ----------
cp -a apps/suhas-ecom/. "$OUT/ecom/"
rm -f "$OUT/ecom/README.md"
cp -a functions "$OUT/ecom/functions"
cp privacy-policy.html "$OUT/ecom/privacy-policy.html"
cp _headers "$OUT/ecom/_headers" 2>/dev/null || true
# old URLs keep working
cat > "$OUT/ecom/_redirects" <<'R'
/apps/suhas-ecom/*  /:splat  301
/apps/suhas-ecom    /        301
R
cat > "$OUT/ecom/robots.txt" <<R
User-agent: *
Allow: /
Disallow: /manage.html
Disallow: /delivery.html
Sitemap: $ECOM_URL/sitemap.xml
R
cat > "$OUT/ecom/sitemap.xml" <<R
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>$ECOM_URL/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>$ECOM_URL/track.html</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>
</urlset>
R
# fix absolute URLs that still point to the old location
sed -i "s#https://suhasgroup.pages.dev/apps/suhas-ecom/#$ECOM_URL/#g; s#https://suhasgroup.pages.dev#$ECOM_URL#g" "$OUT/ecom"/*.html "$OUT/ecom"/*.js "$OUT/ecom/functions"/*/*.js 2>/dev/null || true

# ---------- GROUP site ----------
tar --exclude='./.git' --exclude='./.github' --exclude='./node_modules' --exclude='./functions' --exclude='./scripts' \
  --exclude='./apps/suhas-ecom' --exclude='./apps/suhas-max' --exclude='./apps/suhas-max-ecommerce' \
  --exclude='./social.html' --exclude='./max-profile.html' --exclude='./suhas-max-ai.html' \
  --exclude='./messenger.html' --exclude='./messenger.js' --exclude='./messenger.css' \
  --exclude='./suhas-final.zip' -cf - . | tar -xf - -C "$OUT/group"
G="$OUT/group"
# SUHAS MAX pages are gone from this site: send visitors to the Group home
cat > "$G/_redirects" <<'R'
/social.html        /home.html  302
/social             /home.html  302
/max-profile.html   /home.html  302
/suhas-max-ai.html  /home.html  302
/messenger.html     /home.html  302
/messenger          /home.html  302
/apps/suhas-max/*   /home.html  302
/apps/suhas-max-ecommerce/*  https://suhasmax.pages.dev/  302
/apps/suhas-ecom/*  https://suhasmax.pages.dev/:splat  301
/apps/suhas-ecom    https://suhasmax.pages.dev/  301
R
python3 - "$G" "$ECOM_URL" <<'PY'
import re,sys,pathlib
g=pathlib.Path(sys.argv[1]); ecom=sys.argv[2]
# 1) home.html: drop the SUHAS MAX tiles, E-COM tile opens the E-COM site
p=g/'home.html'; s=p.read_text()
s=re.sub(r'<a class="app-card[^"]*" href="(social|messenger|suhas-max-ai)\.html".*?</a>\n?','',s,flags=re.S)
s=s.replace('href="apps/suhas-ecom/index.html"','href="%s/" target="_blank" rel="noopener"'%ecom)
s=s.replace('src="apps/suhas-ecom/logo.png"','src="assets/logo.png"')
p.write_text(s)
# 2) every other page: E-COM links -> E-COM site
for f in g.rglob('*.html'):
    t=f.read_text(errors='ignore'); o=t
    t=t.replace('href="apps/suhas-ecom/"',f'href="{ecom}/"').replace('href="apps/suhas-ecom/index.html"',f'href="{ecom}/"')
    t=t.replace('href="/apps/suhas-ecom/index.html"',f'href="{ecom}/"')
    if t!=o: f.write_text(t)
# 3) service worker: no MAX files in the precache / default push target
p=g/'sw.js'; s=p.read_text()
for n in ['social.html','max-profile.html','suhas-max-ai.html','messenger.html','messenger.js','messenger.css']:
    s=s.replace("'%s',"%n,'')
s=s.replace("'/social.html'","'/home.html'")
p.write_text(s)
# 4) manifest: this site is SUHAS GROUP
import json
p=g/'manifest.json'; m=json.loads(p.read_text())
m['name']='SUHAS GROUP'; m['short_name']='SUHAS GROUP'; m['description']='SUHAS GROUP apps: careers, jobs, CV Studio and tools.'
p.write_text(json.dumps(m,indent=2))
# 5) sitemap: drop messenger
p=g/'sitemap.xml'; s=p.read_text()
s=re.sub(r'\s*<url><loc>[^<]*/messenger</loc>.*?</url>','',s); p.write_text(s)
# 6) discover page + nav label: no SUHAS MAX / Messenger on this site
p=g/'discover.html'; s=p.read_text()
s=re.sub(r'<a class="item" href="/messenger.html">.*?</a>\n?','',s,flags=re.S)
s=re.sub(r',?\s*\{"@type":"SoftwareApplication","name":"SUHAS Messenger".*?\}(?=\s*[\],])','',s,flags=re.S)
p.write_text(s)
p=g/'assets'/'script.js'; s=p.read_text()
s=s.replace("['home.html', 'SUHAS MAX',","['home.html', 'Apps',"); p.write_text(s)
PY
echo "built: $OUT/ecom ($(find "$OUT/ecom" -type f | wc -l) files), $OUT/group ($(find "$G" -type f | wc -l) files)"
