const SUPABASE_URL = "https://pokxiylebwzoxunccuwm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_H9F5NLitq2cHMnZyOYm4NA_bdD6Z850";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8"
};
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));
const money = (value) => "৳" + Number(value || 0).toLocaleString("en-BD", { maximumFractionDigits: 2 });

async function rpc(name, args) {
  const response = await fetch(SUPABASE_URL + "/rest/v1/rpc/" + name, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: "Bearer " + SUPABASE_PUBLISHABLE_KEY
    },
    body: JSON.stringify(args)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || payload?.hint || "Order email database request failed.");
  return payload;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: cors });
}

export async function onRequestPost({ request, env }) {
  if (!env.CLOUDFLARE_EMAIL_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID || !env.EMAIL_FROM) {
    return json({ ok: false, error: "Cloudflare Email Service is not configured yet." }, 503);
  }

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "Invalid request." }, 400); }
  const token = String(body?.token || "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) {
    return json({ ok: false, error: "Invalid order email token." }, 400);
  }

  let order;
  try {
    order = await rpc("ecom_claim_order_email", { p_token: token });
  } catch (error) {
    return json({ ok: false, error: error.message }, 502);
  }
  if (!order) return json({ ok: false, error: "This order email was already sent or the token has expired." }, 409);

  try {
    const items = Array.isArray(order.items) ? order.items : [];
    const itemRows = items.map((item) =>
      "<tr><td style='padding:10px;border-bottom:1px solid #e5eaf1'>" + esc(item.name) +
      " × " + Number(item.quantity || 0) + "</td><td style='padding:10px;border-bottom:1px solid #e5eaf1;text-align:right'>" +
      money(item.line_total) + "</td></tr>"
    ).join("");
    const payment = order.payment_method === "cod" ? "Cash on Delivery" : String(order.payment_method || "").toUpperCase();
    const subject = "SUHAS E-COM | আপনার অর্ডার নিশ্চিত হয়েছে — " + order.order_code;
    const html = "<!doctype html><html><body style='margin:0;background:#f3f6fb;font-family:Arial,sans-serif;color:#17243a'>" +
      "<div style='max-width:640px;margin:28px auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden'>" +
      "<div style='background:#10294b;padding:24px 28px;color:#fff'><div style='font-size:22px;font-weight:800'>SUHAS <span style='color:#e7b84b'>E-COM</span></div><div style='color:#dbe6f5;font-size:13px'>Your Shopping, Our Commitment.</div></div>" +
      "<div style='padding:28px'><h2 style='margin:0 0 12px;color:#147d4a'>অভিনন্দন! আপনার অর্ডারটি নিশ্চিত করা হয়েছে। ✓</h2>" +
      "<p>প্রিয় <b>" + esc(order.customer_name) + "</b>,</p><p>আপনার SUHAS E-COM অর্ডারটি সফলভাবে গ্রহণ ও নিশ্চিত করা হয়েছে।</p>" +
      "<div style='background:#f5f8fc;border-radius:12px;padding:16px;margin:18px 0'><b>Order ID:</b> " + esc(order.order_code) +
      "<br><b>তারিখ:</b> " + esc(new Date(order.created_at).toLocaleString("en-BD", { timeZone: "Asia/Dhaka" })) +
      "<br><b>পেমেন্ট:</b> " + esc(payment) + "<br><b>ডেলিভারি ঠিকানা:</b> " + esc(order.address) + "</div>" +
      "<table style='width:100%;border-collapse:collapse'><thead><tr><th style='text-align:left;padding:10px;background:#f5f8fc'>পণ্য</th><th style='text-align:right;padding:10px;background:#f5f8fc'>মূল্য</th></tr></thead><tbody>" + itemRows + "</tbody></table>" +
      "<div style='margin-top:16px;border-top:1px solid #e5eaf1;padding-top:14px'><p>Subtotal: <b>" + money(order.subtotal) +
      "</b><br>Delivery: <b>" + money(order.delivery) + "</b><br><span style='font-size:20px'>Total: <b>" + money(order.total) +
      "</b></span></p></div><p>Cash on Delivery হলে পণ্য হাতে পাওয়ার সময় মূল্য পরিশোধ করবেন। ডেলিভারি সংক্রান্ত প্রয়োজনে আমাদের প্রতিনিধি আপনার সঙ্গে যোগাযোগ করবেন।</p>" +
      "<p>SUHAS E-COM থেকে কেনাকাটা করার জন্য আন্তরিক ধন্যবাদ।</p><p style='margin-top:26px'>শুভেচ্ছান্তে,<br><b>SUHAS E-COM Customer Support Team</b></p></div></div></body></html>";
    const text = "প্রিয় " + order.customer_name + ",\n\nআপনার SUHAS E-COM অর্ডারটি সফলভাবে গ্রহণ ও নিশ্চিত করা হয়েছে।\nOrder ID: " +
      order.order_code + "\nতারিখ: " + new Date(order.created_at).toLocaleString("en-BD", { timeZone: "Asia/Dhaka" }) +
      "\nপণ্য: " + items.map(i => i.name + " × " + i.quantity + " — " + money(i.line_total)).join("; ") +
      "\nSubtotal: " + money(order.subtotal) + "\nDelivery: " + money(order.delivery) + "\nTotal: " + money(order.total) +
      "\nPayment: " + payment + "\nDelivery address: " + order.address +
      "\n\nCash on Delivery হলে পণ্য হাতে পাওয়ার সময় মূল্য পরিশোধ করবেন।\n\nশুভেচ্ছান্তে,\nSUHAS E-COM Customer Support Team";

    const sent = await fetch("https://api.cloudflare.com/client/v4/accounts/" + encodeURIComponent(env.CLOUDFLARE_ACCOUNT_ID) + "/email/sending/send", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.CLOUDFLARE_EMAIL_API_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: order.customer_email,
        from: env.EMAIL_FROM,
        subject,
        html,
        text
      })
    });
    const result = await sent.json().catch(() => null);
    if (!sent.ok || !result?.success) throw new Error(result?.errors?.[0]?.message || "Cloudflare could not send the confirmation email.");

    await rpc("ecom_mark_order_email_sent", { p_token: token });
    return json({ ok: true, order_code: order.order_code, email: order.customer_email });
  } catch (error) {
    try { await rpc("ecom_release_order_email", { p_token: token }); } catch (_) {}
    return json({ ok: false, error: error.message || "Email sending failed." }, 502);
  }
}