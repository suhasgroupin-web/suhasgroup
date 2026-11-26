#!/usr/bin/env bash
# Builds the SUHAS E-COM Cloudflare Pages site (https://suhasmax.pages.dev).
# Root of the site = apps/suhas-ecom, plus Pages Functions (/s/<id> share previews, order email).
# Nothing from SUHAS GROUP is published here and E-COM never links to suhasgroup.pages.dev.
set -euo pipefail
OUT="${1:-/tmp/suhasmax-site}"
URL="https://suhasmax.pages.dev"
rm -rf "$OUT"; mkdir -p "$OUT"
cp -a apps/suhas-ecom/. "$OUT/"
rm -f "$OUT/README.md"
cp -a functions "$OUT/functions"
cp privacy-policy.html "$OUT/privacy-policy.html"
[ -f _headers ] && cp _headers "$OUT/_headers" || true
printf '/apps/suhas-ecom/*  /:splat  301\n/apps/suhas-ecom  /  301\n/apps/suhas-max-ecommerce/*  /  301\n' > "$OUT/_redirects"
printf 'User-agent: *\nAllow: /\nDisallow: /manage.html\nDisallow: /delivery.html\nSitemap: %s/sitemap.xml\n' "$URL" > "$OUT/robots.txt"
printf '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>%s/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n<url><loc>%s/track.html</loc></url>\n<url><loc>%s/ai.html</loc></url>\n</urlset>\n' "$URL" "$URL" "$URL" > "$OUT/sitemap.xml"
# any absolute link that still points to the old home must point to this site
find "$OUT" -type f \( -name '*.html' -o -name '*.js' -o -name '*.webmanifest' \) -print0 | xargs -0 sed -i "s#https://suhasgroup.pages.dev/apps/suhas-ecom/#$URL/#g; s#https://suhasgroup.pages.dev/s/#$URL/s/#g"
# checks
test -f "$OUT/index.html" && test -f "$OUT/product.html" && test -f "$OUT/functions/s/[id].js"
if grep -rIl "suhasgroup.pages.dev" "$OUT" --include=*.html --include=*.js --include=*.webmanifest | grep -v privacy-policy.html | head -1 | grep -q .; then
  echo "ERROR: E-COM still links to suhasgroup.pages.dev:"; grep -rIn "suhasgroup.pages.dev" "$OUT" --include=*.html --include=*.js --include=*.webmanifest | grep -v privacy-policy.html | cut -c1-200 | head; exit 1
fi
echo "SUHAS E-COM site built at $OUT"
