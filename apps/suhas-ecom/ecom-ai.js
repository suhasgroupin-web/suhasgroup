// SUHAS AI chat widget for SUHAS E-COM (customers, sellers and admin).
const AI_URL='https://ehvgxbifqtyajeersnvq.supabase.co/functions/v1/ecom-assistant';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=t=>esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\[([^\]]+)\]\(((?:https:\/\/wa\.me\/|[a-z.\-]+\.html)[^)\s]*)\)/g,'<a href="$2" target="_blank" rel="noopener" style="color:#d35400;font-weight:700">$1</a>').replace(/\n/g,'<br>');
const myOrders=()=>{try{const v=JSON.parse(localStorage.getItem('suhas-ecom-my-orders-v1')||'[]');return Array.isArray(v)?v.slice(0,5).map(o=>({code:o.code,phone:o.phone})):[]}catch(e){return[]}};

/* ---------- instant local answers (no network wait) ---------- */
const WA_NUM='8801862144113',money=n=>'৳'+Number(n||0).toLocaleString('en-BD',{maximumFractionDigits:2});
const has=(q,...w)=>w.some(x=>q.includes(x));
const STATUS={new:'⏳ Received — waiting for the seller to confirm',confirmed:'🎉 Confirmed by the seller',processing:'📦 Being packed',shipped:'🚚 Out for delivery',delivered:'✅ Delivered',cancelled:'✖ Cancelled'};
const STOP=new Set(['the','a','an','of','for','to','in','is','are','do','you','have','any','price','prices','show','me','i','want','need','buy','product','products','what','how','much','koto','dam','daam','ache','achhe','ki','kono','dekhao','chai','lagbe','er','ar']);
async function localAnswer(raw,ctx){
  const q=raw.toLowerCase().trim();if(!q)return null;
  const prods=(ctx.getProducts?ctx.getProducts():[]).filter(p=>!p.isDemo);
  // order status: code + phone, or remembered orders
  const codeM=raw.match(/\b([A-Za-z]{2,5}-?[A-Za-z0-9-]{4,})\b/),phoneM=raw.replace(/[^0-9+ ]/g,' ').match(/\+?[0-9]{8,15}/);
  if(ctx.track&&has(q,'order','track','deliver','status','parcel','kothay','kothai','pailam','pabo','ashbe')){
    const saved=myOrders();
    if(codeM&&phoneM&&/[0-9]/.test(codeM[1])&&codeM[1].length>=6){
      try{const d=await ctx.track(codeM[1],phoneM[0]);if(d)return '**Order '+(d.order_code||codeM[1])+'**\nStatus: '+(STATUS[d.status]||d.status)+(d.total_bdt!=null?'\nTotal: '+money(d.total_bdt):'')+'\n[Open full tracking](track.html?code='+encodeURIComponent(codeM[1])+'&phone='+encodeURIComponent(phoneM[0])+')';return 'I could not find that order. Check the order code and the mobile number you used when ordering.'}catch(e){return null}
    }
    if(saved.length&&!ctx.staff){
      const out=[];for(const o of saved.slice(0,3)){try{const d=await ctx.track(o.code,o.phone);if(d)out.push('**'+o.code+'** — '+(STATUS[d.status]||d.status)+(d.total_bdt!=null?' · '+money(d.total_bdt):''))}catch(e){}}
      if(out.length)return 'Your recent orders:\n'+out.join('\n')+'\n[Open order tracking](track.html)';
    }
    if(!ctx.staff&&has(q,'my order','where','kothay','track','status','deliver'))return 'To check an order, send me your **order code and the mobile number** you used (example: SE-XXXXXX 01XXXXXXXXX), or open [Track order](track.html).';
  }
  if(has(q,'how to order','kivabe order','kibhabe order','kemne order','how do i order','how can i order','order korbo','order korte'))return '**How to order**\n1. Open a product and tap **Order Now** (or add to cart).\n2. Enter your name, mobile, address and email.\n3. Choose Cash on Delivery, bKash or Nagad and confirm.\n4. The seller confirms, packs and ships — you get live status updates.\nYou can also chat with the seller on WhatsApp from every product.';
  if(has(q,'payment','pay ','bkash','nagad','cash on','taka dibo','kivabe pay'))return '**Payment options**: Cash on Delivery, bKash and Nagad. For bKash / Nagad, the seller gives payment instructions on WhatsApp and you enter the transaction ID at checkout.';
  if(has(q,'delivery charge','shipping','delivery fee','delivery cost','free delivery','delivery time','koto din','kotodin'))return '**Delivery**: free on orders over ৳2,000, otherwise ৳120. Each product shows its lead time. You can follow the order live in [Track order](track.html).';
  if(has(q,'cancel','return','refund','ferot'))return 'To cancel or return an order, message the seller on WhatsApp as early as possible (before it is shipped). Support: [WhatsApp +880 1862-144113](https://wa.me/'+WA_NUM+').';
  if(has(q,'become a seller','sell on','open shop','open a shop','seller account','how to sell','kivabe sell','bikri','dokan'))return '**Become a seller (free)**\n1. Open [Seller Centre](manage.html#seller) and sign up.\n2. Wait for admin approval.\n3. Add products with photos, price and description, set your own WhatsApp number under **My shop**, and manage orders and delivery.';
  if(has(q,'share','facebook','linkedin','instagram')||/\bimo\b/.test(q))return '**Share a product**: tap the **⋮** (3 dots) on any product → Facebook, LinkedIn, WhatsApp, imo, Instagram or Others. Facebook, LinkedIn and WhatsApp show the product photo, name and price; open link → **Order Now**.';
  if(has(q,'whatsapp','contact','support','helpline','phone number','call'))return 'Chat with us on [WhatsApp +880 1862-144113](https://wa.me/'+WA_NUM+'). Each product also has a WhatsApp button for its seller.';
  if(/^(hi|hello|hey|salam|assalam|hlw|helo)\b/.test(q))return 'Hello! 👋 I am SUHAS AI. Ask me about products, prices, ordering, payment, delivery or your order status.';
  if(/^(thanks|thank you|thx|dhonnobad|ok thanks)\b/.test(q))return 'You are welcome! Anything else I can help with?';
  // product search
  const words=q.replace(/[^a-z0-9\u0980-\u09FF ]/g,' ').split(/\s+/).filter(w=>w.length>2&&!STOP.has(w));
  if(prods.length&&words.length&&!ctx.staff){
    const sc=prods.map(p=>{const h=(p.title+' '+p.category+' '+(p.brand||'')).toLowerCase();return [p,words.reduce((n,w)=>n+(h.includes(w)?1:0),0)]}).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]||a[0].price_bdt-b[0].price_bdt).slice(0,5);
    if(sc.length)return 'Here is what I found:\n'+sc.map(([p])=>'• [**'+p.title.replace(/[\[\]]/g,'')+'**](product.html?id='+p.id+') — '+money(p.price_bdt)+' (min. '+p.min+' '+p.unit+')').join('\n')+'\nTap a product, then **Order Now**.';
  }
  if(prods.length&&has(q,'cheap','sasta','lowest price','best deal','offer','discount')){
    const l=[...prods].sort((a,b)=>a.price_bdt-b.price_bdt).slice(0,5);return 'Lowest priced products:\n'+l.map(p=>'• [**'+p.title.replace(/[\[\]]/g,'')+'**](product.html?id='+p.id+') — '+money(p.price_bdt)).join('\n');
  }
  if(prods.length&&has(q,'price','dam','daam','products','product list','what do you sell')&&!ctx.staff){
    const cats=[...new Set(prods.map(p=>p.category))].slice(0,8);return 'We have **'+prods.length+' live products** in: '+cats.join(', ')+'. Tell me what you need (for example "shoes" or "headphones") and I will show prices.';
  }
  return null;
}
let mounted=false,hist=[];
try{hist=JSON.parse(sessionStorage.getItem('suhas-ecom-ai')||'[]')}catch(e){}
export function mountAI({getToken,staff=false,getProducts,track}={}){
  const ctx={getProducts,track,staff};
  if(mounted)return;mounted=true;
  const fabs=document.getElementById('fabs');
  const btn=document.createElement('button');btn.className='aifab';btn.id='aiBtn';btn.type='button';btn.setAttribute('aria-label','Open SUHAS AI');btn.innerHTML='✨ <span>SUHAS AI</span>';
  if(fabs)fabs.prepend(btn);else{btn.style.cssText='position:fixed;right:16px;bottom:18px;z-index:45';document.body.appendChild(btn)}
  const box=document.createElement('section');box.className='aibox hidden';box.id='aiBox';box.setAttribute('role','dialog');box.setAttribute('aria-label','SUHAS AI chat');
  const sug=staff?['How many new orders are there?','Which orders are out for delivery?','Show today\'s delivered orders']:['Where is my order?','What is the price of the products?','How do I order?','Is my delivery done?'];
  box.innerHTML='<div class="aih"><div><b>✨ SUHAS AI</b><small>'+(staff?'Orders & products assistant':'Ask about products, orders & delivery')+'</small></div><button type="button" id="aiX" aria-label="Close">×</button></div><div class="aim" id="aiLog" aria-live="polite"></div><div class="ais" id="aiSug">'+sug.map(s=>'<button type="button">'+esc(s)+'</button>').join('')+'</div><form class="aif" id="aiForm"><input id="aiIn" maxlength="1500" placeholder="Type your question…" autocomplete="off"><button type="submit" id="aiSend">Send</button></form>';
  document.body.appendChild(box);
  const log=box.querySelector('#aiLog'),inp=box.querySelector('#aiIn'),send=box.querySelector('#aiSend');
  const add=(t,who)=>{const d=document.createElement('div');d.className='aib '+who;d.innerHTML=who==='bot'?fmt(t):esc(t);log.appendChild(d);log.scrollTop=log.scrollHeight;return d};
  const greet=staff?'Hello! I can tell you about your orders, their status, totals and deliveries. What would you like to know?':'Hello! I am SUHAS AI. I can help with products, prices, your order status and delivery. How can I help?';
  add(greet,'bot');hist.forEach(m=>add(m.content,m.role==='assistant'?'bot':'me'));
  const toggle=o=>{box.classList.toggle('hidden',!o);if(o)setTimeout(()=>inp.focus(),50)};
  btn.onclick=()=>toggle(box.classList.contains('hidden'));box.querySelector('#aiX').onclick=()=>toggle(false);
  async function ask(q){
    if(!q||send.disabled)return;send.disabled=true;box.querySelector('#aiSug').classList.add('hidden');
    add(q,'me');
    try{const quick=await Promise.race([localAnswer(q,ctx),new Promise(r=>setTimeout(()=>r(undefined),4000))]);
      if(quick){add(quick,'bot');hist.push({role:'user',content:q},{role:'assistant',content:quick});hist=hist.slice(-12);try{sessionStorage.setItem('suhas-ecom-ai',JSON.stringify(hist))}catch(e){}send.disabled=false;return}
    }catch(e){}
    const w=add('Thinking…','bot');
    try{
      const token=getToken?await getToken():'';
      const r=await fetch(AI_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:q,history:hist.slice(-6),orders:myOrders(),token:token||''}),signal:AbortSignal.timeout(40000)});
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.output)throw new Error(d.error||'SUHAS AI is unavailable right now.');
      w.innerHTML=fmt(d.output);hist.push({role:'user',content:q},{role:'assistant',content:d.output});hist=hist.slice(-12);
      try{sessionStorage.setItem('suhas-ecom-ai',JSON.stringify(hist))}catch(e){}
    }catch(e){w.innerHTML=esc((e.message||'Error')+' Please try again, or use WhatsApp for help.')}
    send.disabled=false;log.scrollTop=log.scrollHeight;
  }
  box.querySelector('#aiForm').addEventListener('submit',e=>{e.preventDefault();const q=inp.value.trim();inp.value='';ask(q)});
  box.querySelector('#aiSug').addEventListener('click',e=>{const b=e.target.closest('button');if(b)ask(b.textContent)});
}
