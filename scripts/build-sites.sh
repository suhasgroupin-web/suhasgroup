#!/usr/bin/env bash
# Build the SUHAS GROUP Cloudflare Pages site only.
# SUHAS E-COM is deployed independently from the SUHAS MAX repository.
set -euo pipefail
OUT="${1:-/tmp/suhas-group-site}"
rm -rf "$OUT"
mkdir -p "$OUT"

# Keep Group services and shared assets. E-Commerce and legacy MAX-only source
# folders remain in GitHub but are not published on suhasgroup.pages.dev.
tar --exclude='./.git' --exclude='./.github' --exclude='./node_modules' \
  --exclude='./functions' --exclude='./scripts' \
  --exclude='./apps/suhas-ecom' --exclude='./apps/suhas-max' \
  --exclude='./apps/suhas-max-ecommerce' --exclude='./apps/Suhas E-Commerce' \
  --exclude='./apps/Suhas Max' --exclude='./apps/Suhas Messenger' --exclude='./apps/Suhas AI' \
  --exclude='./max-profile.html' --exclude='./suhas-max-ai.html' \
  --exclude='./suhas-final.zip' -cf - . | tar -xf - -C "$OUT"

cat > "$OUT/_redirects" <<'R'
/apps/suhas-ecom/* https://suhasmax.pages.dev/ 302
/apps/suhas-ecom https://suhasmax.pages.dev/ 302
/apps/suhas-max-ecommerce/* https://suhasmax.pages.dev/ 302
/apps/suhas-max-ecommerce https://suhasmax.pages.dev/ 302
/suhas-max-ai.html /ai.html 301
/max-profile.html /profile.html 301
R

python3 - "$OUT" <<'PY'
import json, pathlib, re, sys
root = pathlib.Path(sys.argv[1])

# Remove any legacy E-Commerce links from the Group build without deleting source files.
for page in root.rglob("*.html"):
    text = page.read_text(errors="ignore")
    updated = re.sub(
        r'<a\b(?=[^>]*href=["\'][^"\']*apps/suhas-ecom[^"\']*["\'])[^>]*>[\s\S]*?</a>',
        '',
        text,
        flags=re.I,
    )
    if updated != text:
        page.write_text(updated)

# The Group PWA has its own identity and launch icon.
manifest_path = root / "manifest.json"
if manifest_path.exists():
    manifest = json.loads(manifest_path.read_text())
    manifest["name"] = "SUHAS GROUP"
    manifest["short_name"] = "SUHAS GROUP"
    manifest["description"] = "SUHAS GROUP — Careers, Social, Messenger and SUHAS AI."
    manifest["categories"] = ["business", "social", "productivity"]
    manifest["icons"] = [{"src": "/assets/logo.png", "sizes": "any", "type": "image/png", "purpose": "any"}]
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")

# Keep Group Social, Messenger and AI available in the offline app shell.
sw_path = root / "sw.js"
if sw_path.exists():
    sw = sw_path.read_text()
    sw = sw.replace("'max-profile.html',", "").replace("'suhas-max-ai.html',", "")
    sw = sw.replace("suhas-max-secure-entry-", "suhas-group-app-")
    sw = sw.replace("SUHAS-MAX", "SUHAS GROUP").replace("SUHAS MAX", "SUHAS GROUP")
    sw = sw.replace("/assets/suhas-max-app-icon.svg", "/assets/logo.png")
    if "'ai.html'," not in sw:
        sw = sw.replace("'social.html',", "'social.html','ai.html',")
    sw_path.write_text(sw)
PY

# Verify the publish folder contains the required Group services and no E-Commerce entry points.
test -f "$OUT/index.html"
test -f "$OUT/app.html"
test -f "$OUT/social.html"
test -f "$OUT/messenger.html"
test -f "$OUT/ai.html"
test ! -e "$OUT/apps/suhas-ecom"
test ! -e "$OUT/apps/suhas-max-ecommerce"
! grep -Eiq 'Shop Products|Suhas E-Com|apps/suhas-ecom' "$OUT/index.html" "$OUT/app.html" "$OUT/home.html"
echo "SUHAS GROUP site built and validated at $OUT"
