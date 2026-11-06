import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
const AI_API_KEY = Deno.env.get("AI_API_KEY") ?? "";
const AI_PROVIDER = (Deno.env.get("AI_PROVIDER") ?? "openai").toLowerCase();
const AI_MODEL = Deno.env.get("AI_MODEL") ?? "gpt-5";
const AI_BASE_URL = (Deno.env.get("AI_BASE_URL") ?? "https://api.openai.com/v1").replace(/\/+$/, "");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}
function clean(value: unknown, max = 4000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

const SYSTEM_PROMPT = `You are the official SUHAS GROUP AI Assistant. Reply in the user's language, Bangla or English. Be professional, helpful and practical.

VERIFIED PUBLIC COMPANY KNOWLEDGE:
SUHAS GROUP tagline: Global Opportunities, Trusted Quality.
Website: https://suhasgroupin-web.github.io/suhasgroup/
Suhas Careers Ltd: recruitment and HR services.
Suhas Garments Ltd: apparel manufacturing.
Suhas Design Ltd: fashion and apparel design.
Suhas Jeans Ltd: denim, fit and wash development.
Values: Integrity, Quality, Opportunity and Partnership.
Company LinkedIn: https://www.linkedin.com/company/suhasgroup
Public owner bio: Md. Hasnain is described on the website as an apparel quality professional with 12+ years of experience. Do not invent other personal details.
Support: suhasgroup.in@gmail.com, +8801862144113.
Office directions: https://maps.app.goo.gl/VcLeViY8uchQNtxn9?g_st=ac

APP MODULES include HRM, Recruitment, Garments, Technical Tools, O5 & Barcode, Support, AI Automation, Design Studio, Admin & Security. A menu item does not prove its backend is operational. Do not claim employee directory, attendance, leave, payroll or reports are active unless verified.

TECHNICAL FORMULAS:
Fabric estimate = marker length × fabric width × GSM / 1000 / garments in marker (allowances excluded).
GSM to oz/yd² = GSM / 33.906.
Production efficiency = output × SMV / (manpower × hours × 60) × 100.
Defect percentage = defects / inspected × 100.
Explain units and assumptions.

Never invent vacancies, prices, certifications, clients, factory capacity, revenue, legal status or confidential company information. Direct users to support for unverified facts. Never reveal credentials, API keys, tokens or private employee/candidate information. Never claim to submit, approve, hire, book or contact anyone without a connected confirmation.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method === "GET") return json({ ok: true, service: "SUHAS AI", message: "Send an authenticated POST request to use the assistant." });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (!SUPABASE_URL || !SUPABASE_KEY) return json({ error: "Supabase environment is not configured." }, 500);
  if (!AI_API_KEY) return json({ error: "AI_API_KEY secret is missing in Supabase." }, 503);
  if (!["openai", "anthropic"].includes(AI_PROVIDER)) return json({ error: "Unsupported AI provider." }, 500);

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Please sign in to use SUHAS AI." }, 401);

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Your session is invalid. Please sign in again." }, 401);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON." }, 400); }
  const prompt = clean(body.prompt);
  if (!prompt) return json({ error: "Please enter a message." }, 400);

  const history = Array.isArray(body.history) ? body.history.slice(-10).flatMap((item: any) => {
    const role = item?.role === "assistant" || item?.role === "user" ? item.role : null;
    const content = clean(item?.content, 2000);
    return role && content ? [{ role, content }] : [];
  }) : [];
  const messages = [...history, { role: "user", content: prompt }];

  let endpoint: string;
  let headers: Record<string, string>;
  let payload: Record<string, unknown>;

  if (AI_PROVIDER === "anthropic") {
    endpoint = "https://api.anthropic.com/v1/messages";
    headers = { "Content-Type": "application/json", "x-api-key": AI_API_KEY, "anthropic-version": "2023-06-01" };
    payload = { model: AI_MODEL, max_tokens: 1200, system: SYSTEM_PROMPT, messages };
  } else {
    endpoint = `${AI_BASE_URL}/responses`;
    headers = { "Content-Type": "application/json", Authorization: `Bearer ${AI_API_KEY}` };
    payload = { model: AI_MODEL, instructions: SYSTEM_PROMPT, input: messages, max_output_tokens: 1200 };
  }

  try {
    const response = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("AI provider error:", response.status, data);
      return json({ error: "AI provider error. Check API key, model and billing in Supabase." }, 502);
    }
    const output = AI_PROVIDER === "anthropic"
      ? (data.content ?? []).filter((x: any) => x.type === "text").map((x: any) => x.text).join("\n").trim()
      : (data.output ?? []).flatMap((x: any) => x.content ?? []).filter((x: any) => x.type === "output_text").map((x: any) => x.text).join("\n").trim() || (typeof data.output_text === "string" ? data.output_text.trim() : "");
    if (!output) return json({ error: "AI returned an empty response. Please try again." }, 502);
    return json({ output, provider: AI_PROVIDER, model: AI_MODEL });
  } catch (error) {
    console.error("AI request failed:", error);
    return json({ error: "Could not connect to the AI service." }, 502);
  }
});
