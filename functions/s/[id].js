// Share link with Open Graph tags so Facebook / LinkedIn / WhatsApp show the product photo, name and price.
// Share URL: https://suhasgroup.pages.dev/s/<product-id>  (humans are redirected to the product page).
const SUPABASE_URL = "https://pokxiylebwzoxunccuwm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_H9F5NLitq2cHMnZyOYm4NA_bdD6Z850";
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function onRequestGet({ params, request }) {
  const origin = new URL(request.url).origin;
  const id = String(params.id || "");
  const home = origin + "/apps/suhas-ecom/index.html";
  let p = null;
  if (UUID.test(id)) {
    try {
      const r = await fetch(SUPABASE_URL + "/rest/v1/ecom_products?id=eq." + id + "&is_active=eq.true&select=id,name,description,price_bdt,compare_at_bdt,image_url,images,category,min_order,unit&limit=1", {
        headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: "Bearer " + SUPABASE_PUBLISHABLE_KEY }
      });
      const rows = r.ok ? await r.json() : [];
      p = rows && rows[0] ? rows[0] : null;
    } catch (_) { /* fall back to generic preview */ }
  }
  const target = p ? origin + "/apps/suhas-ecom/product.html?id=" + id : home;
  const first = p ? ((Array.isArray(p.images) && p.images.find((u) => /^https:\/\//i.test(u))) || (/^https:\/\//i.test(p.image_url || "") ? p.image_url : "")) : "";
  const image = first || origin + "/apps/suhas-ecom/logo.png";
  const price = p ? "৳" + Number(p.price_bdt).toLocaleString("en-BD", { maximumFractionDigits: 2 }) : "";
  const title = p ? p.name + " — " + price : "SUHAS E-COM — Online Marketplace";
  const desc = p
    ? (price + " per " + (p.unit || "piece") + " · Min. order " + (p.min_order || 1) + " · " + (p.description || "Order online on SUHAS E-COM or chat on WhatsApp.")).replace(/\s+/g, " ").slice(0, 200)
    : "Browse products from verified sellers, order online, pay on delivery or chat on WhatsApp.";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(target)}">
<meta property="og:type" content="${p ? "product" : "website"}"><meta property="og:site_name" content="SUHAS E-COM">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(image)}"><meta property="og:image:alt" content="${esc(p ? p.name : "SUHAS E-COM")}">
<meta property="og:url" content="${esc(origin + "/s/" + id)}">
${p ? `<meta property="product:price:amount" content="${esc(p.price_bdt)}"><meta property="product:price:currency" content="BDT">` : ""}
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${esc(image)}">
<meta http-equiv="refresh" content="0; url=${esc(target)}"></head>
<body style="font-family:system-ui,sans-serif;padding:24px"><p>Opening <a href="${esc(target)}">${esc(p ? p.name : "SUHAS E-COM")}</a>…</p><script>location.replace(${JSON.stringify(target)})</script></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
