// SUHAS AI chat widget for SUHAS E-COM (customers, sellers and admin).
const AI_URL='https://ehvgxbifqtyajeersnvq.supabase.co/functions/v1/ecom-assistant';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const myOrders=()=>{try{const v=JSON.parse(localStorage.getItem('suhas-ecom-my-orders-v1')||'[]');return Array.isArray(v)?v.slice(0,5).map(o=>({code:o.code,phone:o.phone})):[]}catch(e){return[]}};

/* ---------- instant local answers (no network wait) ---------- */
const WA_NUM='8801862144113',money=n=>'৳'+Number(n||0).toLocaleString('en-BD',{maximumFractionDigits:2});
const has=(q,...w)=>w.some(x=>q.includes(x));
const STATUS={new:'⏳ Received — waiting for the seller to confirm',confirmed:'🎉 Confirmed by the seller',processing:'📦 Being packed',shipped:'🚚 Out for delivery',delivered:'✅ Delivered',cancelled:'✖ Cancelled'};
const STOP=new Set(['the','a','an','of','for','to','in','is','are','do','you','have','any','price','prices','show','me','i','want','need','buy','product','products','what','how','much','koto','dam','daam','ache','achhe','ki','kono','dekhao','chai','lagbe','er','ar']);
async function localAnswer(raw,ctx){
  const q=raw.toLowerCase().trim();if(!q||q.length>90)return null;
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
  if(prods.length&&words.length&&words.length<=4&&!ctx.staff){
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

/* ---------- markdown (safe) ---------- */
const URLRE=/(^|[\s(])(https?:\/\/[^\s<)]+)/g;
function inline(h){
  return h.replace(/`([^`\n]+)`/g,'<code>$1</code>').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(^|[^*\w])\*([^*\n]+)\*/g,'$1<i>$2</i>')
   .replace(/\[([^\]]+)\]\(((?:https?:\/\/|[a-z.\-]+\.html)[^)\s]*)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
   .replace(URLRE,(m,p,u)=>p+'<a href="'+u+'" target="_blank" rel="noopener">'+u+'</a>');
}
export function md(src){
  const blocks=[];
  src=String(src||'').replace(/```(\w*)\n?([\s\S]*?)(```|$)/g,(m,l,c)=>{blocks.push('<div class="sai-code"><div class="sai-ch"><span>'+esc(l||'code')+'</span><button type="button" data-copycode>Copy</button></div><pre><code>'+esc(c.replace(/\n$/,''))+'</code></pre></div>');return '\u0000'+(blocks.length-1)+'\u0000'});
  const out=[];let list=null;
  const close=()=>{if(list){out.push('</'+list+'>');list=null}};
  for(const raw of src.split('\n')){
    const line=esc(raw);let m;
    if(/^\u0000\d+\u0000$/.test(raw.trim())){close();out.push(raw.trim());continue}
    if((m=line.match(/^\s*(#{1,4})\s+(.*)$/))){close();out.push('<h4>'+inline(m[2])+'</h4>');continue}
    if((m=line.match(/^\s*[-*•]\s+(.*)$/))){if(list!=='ul'){close();out.push('<ul>');list='ul'}out.push('<li>'+inline(m[1])+'</li>');continue}
    if((m=line.match(/^\s*\d+[.)]\s+(.*)$/))){if(list!=='ol'){close();out.push('<ol>');list='ol'}out.push('<li>'+inline(m[1])+'</li>');continue}
    close();if(!line.trim())out.push('<div class="sai-sp"></div>');else out.push('<p>'+inline(line)+'</p>');
  }
  close();return out.join('').replace(/\u0000(\d+)\u0000/g,(m,i)=>blocks[+i]);
}
const plain=t=>String(t||'').replace(/```[\s\S]*?```/g,' ').replace(/https?:\/\/\S+/g,' ').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[*#_`>|~]/g,'').replace(/\s+/g,' ').trim();

/* ---------- styles ---------- */
const CSS=`
.aifab{border:0;background:linear-gradient(120deg,#0b2447,#2556a8);color:#fff;font-weight:800;border-radius:999px;padding:12px 18px;box-shadow:0 8px 24px #0a1f3a38;display:flex;gap:8px;align-items:center;font-size:14px;cursor:pointer}
.aibox{position:fixed;right:16px;bottom:78px;z-index:95;width:min(430px,calc(100vw - 24px));height:min(680px,calc(100vh - 100px));background:#fff;color:#1c2736;border-radius:20px;box-shadow:0 22px 70px #0a1f3a66;border:1px solid #e3e7ee;display:flex;flex-direction:column;overflow:hidden;font:15px/1.55 Inter,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
.aibox.hidden{display:none}.aibox.big{right:0;bottom:0;top:0;left:0;width:auto;height:auto;border-radius:0}
.aibox *{box-sizing:border-box}
.aih{padding:10px 12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #eef1f6;background:#fff}
.aih .t{flex:1;min-width:0}.aih b{display:block;font-size:16px}.aih small{display:block;color:#6b778a;font-size:12px}
.aih button,.aih select{border:0;background:#f3f5f9;border-radius:10px;height:34px;min-width:34px;font-size:16px;cursor:pointer;color:#273449}
.aih select{font-size:12px;max-width:86px;padding:0 4px}.aih button.on{background:#ffe8d6}
.aim{flex:1;overflow:auto;padding:16px 14px;display:flex;flex-direction:column;gap:14px;background:#fff;scroll-behavior:smooth}
.aib{max-width:100%;word-wrap:break-word;overflow-wrap:anywhere}
.aib.me{align-self:flex-end;max-width:85%;background:#eef1f6;color:#1c2736;padding:9px 14px;border-radius:18px 18px 4px 18px;white-space:pre-wrap}
.aib.bot{display:flex;gap:10px;align-items:flex-start}.aib .av{flex:none;width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#0b2447,#2556a8);color:#fff;display:grid;place-items:center;font-size:14px;margin-top:2px}
.aib .bd{flex:1;min-width:0}.aib .bd p{margin:0 0 6px}.aib .bd h4{margin:8px 0 4px;font-size:15px}.aib .bd ul,.aib .bd ol{margin:4px 0 8px;padding-left:22px}.aib .bd li{margin:2px 0}.aib .bd a{color:#d35400;font-weight:600}
.aib .bd code{background:#f1f4f9;border-radius:5px;padding:1px 5px;font-size:13px}.sai-sp{height:6px}
.sai-code{background:#0f1b2e;color:#e8eefb;border-radius:12px;overflow:hidden;margin:8px 0}.sai-ch{display:flex;justify-content:space-between;align-items:center;background:#1b2b47;padding:5px 10px;font-size:12px}.sai-ch button{border:0;background:none;color:#cfe0ff;cursor:pointer}
.sai-code pre{margin:0;padding:10px 12px;overflow:auto}.sai-code code{background:none!important;color:inherit;font-size:13px}
.acts{display:flex;gap:4px;margin-top:4px}.acts button{border:0;background:none;color:#6b778a;border-radius:8px;padding:3px 7px;font-size:13px;cursor:pointer}.acts button:hover{background:#f3f5f9;color:#1c2736}
.typing{display:inline-flex;gap:4px;padding:8px 0}.typing i{width:7px;height:7px;border-radius:50%;background:#9aa6b8;animation:sai 1s infinite}.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}
@keyframes sai{0%,60%,100%{opacity:.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
.aiw{margin:auto 0;text-align:center;padding:10px}.aiw h3{margin:6px 0 14px;font-size:22px}.aiw .logo{width:54px;height:54px;border-radius:50%;margin:0 auto;background:linear-gradient(135deg,#0b2447,#2556a8);color:#fff;display:grid;place-items:center;font-size:26px}
.ais{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ais.hidden{display:none}.ais button{border:1px solid #e3e7ee;background:#fff;border-radius:14px;padding:10px 12px;font-size:13px;text-align:left;color:#273449;cursor:pointer}.ais button:hover{background:#f6f8fc}
.aif{display:flex;gap:6px;align-items:flex-end;padding:10px 12px 12px;border-top:1px solid #eef1f6;background:#fff}
.aif .box{flex:1;display:flex;align-items:flex-end;background:#f3f5f9;border-radius:24px;padding:4px 6px 4px 14px}
.aif textarea{flex:1;border:0;background:none;outline:none;resize:none;max-height:130px;min-height:36px;padding:8px 0;font:inherit;color:inherit}
.aif .ib{border:0;background:none;width:36px;height:36px;border-radius:50%;font-size:18px;cursor:pointer;color:#273449;flex:none}.aif .ib.rec{background:#ffdede;animation:sai 1s infinite}
.aif .send{border:0;background:#0b2447;color:#fff;width:38px;height:38px;border-radius:50%;font-size:18px;cursor:pointer;flex:none}.aif .send:disabled{background:#c9d0db}
.aif .live{border:0;background:#ff6a00;color:#fff;width:38px;height:38px;border-radius:50%;font-size:17px;cursor:pointer;flex:none}
.aiv{position:absolute;inset:0;background:radial-gradient(circle at 50% 35%,#16396f,#0b1730);color:#fff;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center;padding:20px}.aiv.hidden{display:none}
.aiv .orb{width:150px;height:150px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#8fd0ff,#2f6fe0 55%,#0b2447);box-shadow:0 0 60px #4aa3ff88;transition:transform .2s}.aiv.listening .orb{animation:orb 1.2s infinite}.aiv.speaking .orb{animation:orb .6s infinite;background:radial-gradient(circle at 35% 30%,#ffd9a8,#ff6a00 55%,#7a2d00);box-shadow:0 0 60px #ff6a0088}.aiv.thinking .orb{opacity:.6;animation:orb 2s infinite}
@keyframes orb{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
.aiv .st{font-size:18px;font-weight:700}.aiv .tx{max-width:90%;max-height:90px;overflow:auto;color:#cfe0ff;font-size:14px}.aiv .row{display:flex;gap:10px;align-items:center}
.aiv button,.aiv select{border:0;border-radius:999px;padding:10px 18px;font-weight:700;cursor:pointer;font-size:14px}.aiv .end{background:#e5484d;color:#fff}.aiv select{background:#ffffff26;color:#fff}.aiv select option{color:#000}
@media(max-width:620px){.aibox{inset:0;width:auto;height:auto;border-radius:0;right:0;bottom:0}.aifab span{display:none}.aifab{padding:13px 15px}.ais{grid-template-columns:1fr}}
`;
const LANGS=[['auto','Auto'],['en-US','English'],['bn-BD','বাংলা'],['hi-IN','हिन्दी'],['ar-SA','العربية'],['ur-PK','اردو'],['es-ES','Español'],['fr-FR','Français'],['de-DE','Deutsch'],['id-ID','Indonesia'],['tr-TR','Türkçe'],['ru-RU','Русский'],['zh-CN','中文'],['ja-JP','日本語'],['ko-KR','한국어']];
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const textLang=(t,pref)=>/[ঀ-৿]/.test(t)?'bn-BD':/[؀-ۿ]/.test(t)?'ar-SA':/[ऀ-ॿ]/.test(t)?'hi-IN':/[一-鿿]/.test(t)?'zh-CN':/[぀-ヿ]/.test(t)?'ja-JP':/[가-힯]/.test(t)?'ko-KR':/[Ѐ-ӿ]/.test(t)?'ru-RU':(pref&&pref!=='auto'&&!/^(bn|hi|ar|ur|zh|ja|ko|ru)/.test(pref)?pref:'en-US');
let mounted=false,hist=[];
try{hist=JSON.parse(sessionStorage.getItem('suhas-ecom-ai')||'[]')}catch(e){}
const saveHist=()=>{try{sessionStorage.setItem('suhas-ecom-ai',JSON.stringify(hist.slice(-20)))}catch(e){}};

export function mountAI({getToken,staff=false,getProducts,track}={}){
  if(mounted)return;mounted=true;
  const ctx={getProducts,track,staff};
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const fabs=document.getElementById('fabs');
  const btn=document.createElement('button');btn.className='aifab';btn.id='aiBtn';btn.type='button';btn.setAttribute('aria-label','Open SUHAS AI');btn.innerHTML='✨ <span>SUHAS AI</span>';
  if(fabs)fabs.prepend(btn);else{btn.style.cssText+=';position:fixed;right:16px;bottom:18px;z-index:45';document.body.appendChild(btn)}
  const box=document.createElement('section');box.className='aibox hidden';box.id='aiBox';box.setAttribute('role','dialog');box.setAttribute('aria-label','SUHAS AI chat');
  const sug=staff?["How many new orders are there?","Which orders are out for delivery?","Show today's delivered orders","Write a polite WhatsApp reply to a customer"]:['Where is my order?','Show me the best deals','How do I place an order?','Explain something to me'];
  let pref='auto';try{pref=localStorage.getItem('suhas-ai-lang')||'auto'}catch(e){}
  let speakOn=false;try{speakOn=localStorage.getItem('suhas-ai-speak')==='1'}catch(e){}
  box.innerHTML='<div class="aih"><div class="t"><b>✨ SUHAS AI</b><small>'+(staff?'Orders, products & anything else':'Ask me anything — any language')+'</small></div><select id="aiLang" aria-label="Voice language">'+LANGS.map(l=>'<option value="'+l[0]+'">'+l[1]+'</option>').join('')+'</select><button type="button" id="aiSpk" title="Read answers aloud" aria-label="Read answers aloud">🔊</button><button type="button" id="aiNew" title="New chat" aria-label="New chat">✎</button><button type="button" id="aiBig" title="Full screen" aria-label="Full screen">⤢</button><button type="button" id="aiX" aria-label="Close">×</button></div>'+
   '<div class="aim" id="aiLog" aria-live="polite"></div>'+
   '<form class="aif" id="aiForm"><div class="box"><textarea id="aiIn" rows="1" maxlength="2000" placeholder="Message SUHAS AI…" autocomplete="off"></textarea><button type="button" class="ib" id="aiMic" title="Dictate" aria-label="Dictate">🎤</button></div><button type="button" class="live" id="aiLive" title="Live voice chat" aria-label="Live voice chat">🎧</button><button type="submit" class="send" id="aiSend" aria-label="Send">➤</button></form>'+
   '<div class="aiv hidden" id="aiVoice"><div class="orb"></div><div class="st" id="aiVst">Listening…</div><div class="tx" id="aiVtx"></div><div class="row"><select id="aiVlang" aria-label="Language">'+LANGS.map(l=>'<option value="'+l[0]+'">'+l[1]+'</option>').join('')+'</select><button type="button" id="aiVstop">Tap to interrupt</button><button type="button" class="end" id="aiVend">End</button></div></div>';
  document.body.appendChild(box);
  const $q=s=>box.querySelector(s);
  const log=$q('#aiLog'),inp=$q('#aiIn'),send=$q('#aiSend'),form=$q('#aiForm');
  $q('#aiLang').value=pref;$q('#aiVlang').value=pref;$q('#aiSpk').classList.toggle('on',speakOn);
  const setPref=v=>{pref=v;$q('#aiLang').value=v;$q('#aiVlang').value=v;try{localStorage.setItem('suhas-ai-lang',v)}catch(e){}};
  $q('#aiLang').onchange=e=>setPref(e.target.value);$q('#aiVlang').onchange=e=>setPref(e.target.value);
  const scroll=()=>{log.scrollTop=log.scrollHeight};
  let busy=false,ctrl=null,speaking=false;
  /* ---- speech out ---- */
  const synth=window.speechSynthesis;
  function speak(text,onend){
    if(!synth){onend&&onend();return}
    synth.cancel();const t=plain(text);if(!t){onend&&onend();return}
    const u=new SpeechSynthesisUtterance(t.slice(0,1800));const lang=textLang(t,pref);u.lang=lang;
    const v=synth.getVoices().find(x=>x.lang===lang)||synth.getVoices().find(x=>x.lang.startsWith(lang.split('-')[0]));if(v)u.voice=v;
    u.onend=u.onerror=()=>{speaking=false;onend&&onend()};speaking=true;synth.speak(u);
  }
  const stopSpeak=()=>{try{synth&&synth.cancel()}catch(e){}speaking=false};
  /* ---- rendering ---- */
  function addMe(t){const d=document.createElement('div');d.className='aib me';d.textContent=t;log.appendChild(d);scroll();return d}
  function addBot(t,done=true){
    const d=document.createElement('div');d.className='aib bot';d.innerHTML='<span class="av">✨</span><div class="bd"></div>';
    const bd=d.querySelector('.bd');if(t)bd.innerHTML=md(t);else bd.innerHTML='<span class="typing"><i></i><i></i><i></i></span>';
    log.appendChild(d);scroll();if(done)addActs(d,t);return d;
  }
  function addActs(d,t){
    const a=document.createElement('div');a.className='acts';a.innerHTML='<button type="button" data-a="copy" title="Copy">⧉ Copy</button><button type="button" data-a="speak" title="Read aloud">🔊</button><button type="button" data-a="again" title="Regenerate">↻</button>';
    a.dataset.text=t;d.querySelector('.bd').appendChild(a);
  }
  const welcome=()=>{log.innerHTML='<div class="aiw"><div class="logo">✨</div><h3>'+(staff?'How can I help with your shop?':'How can I help you today?')+'</h3><div class="ais" id="aiSug">'+sug.map(s=>'<button type="button">'+esc(s)+'</button>').join('')+'</div></div>'};
  if(hist.length){hist.forEach(m=>m.role==='assistant'?addBot(m.content):addMe(m.content))}else welcome();
  log.addEventListener('click',async e=>{
    const sb=e.target.closest('#aiSug button');if(sb){ask(sb.textContent);return}
    const cc=e.target.closest('[data-copycode]');if(cc){try{await navigator.clipboard.writeText(cc.closest('.sai-code').querySelector('code').textContent);cc.textContent='Copied ✔'}catch(_){}return}
    const b=e.target.closest('.acts button');if(!b)return;const txt=b.closest('.acts').dataset.text;
    if(b.dataset.a==='copy'){try{await navigator.clipboard.writeText(txt);b.textContent='✔ Copied'}catch(_){}}
    else if(b.dataset.a==='speak'){speaking?stopSpeak():speak(txt)}
    else if(b.dataset.a==='again'){const last=[...hist].reverse().find(m=>m.role==='user');if(last){while(hist.length&&hist[hist.length-1].role==='assistant')hist.pop();hist.pop();saveHist();[...log.querySelectorAll('.aib')].slice(-2).forEach(n=>n.remove());ask(last.content)}}
  });
  /* ---- ask ---- */
  async function serverAnswer(q,onText){
    ctrl=new AbortController();const to=setTimeout(()=>ctrl.abort(),60000);
    try{
      const token=getToken?await getToken():'';
      const r=await fetch(AI_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:q,history:hist.slice(-10),orders:myOrders(),token:token||'',lang:pref}),signal:ctrl.signal});
      const ct=r.headers.get('content-type')||'';
      if(!r.ok||ct.includes('json')){const j=await r.json().catch(()=>({}));if(j.output){onText(j.output);return j.output}throw new Error(j.error||'SUHAS AI is unavailable right now.')}
      const rd=r.body.getReader(),dec=new TextDecoder();let acc='';
      for(;;){const {done,value}=await rd.read();if(done)break;acc+=dec.decode(value,{stream:true});onText(acc)}
      acc+=dec.decode();if(!acc.trim())throw new Error('Empty reply. Please try again.');onText(acc);return acc;
    }finally{clearTimeout(to);ctrl=null}
  }
  async function ask(q,voice){
    q=(q||'').trim();if(!q||busy)return null;busy=true;send.disabled=true;stopSpeak();
    const w=log.querySelector('.aiw');if(w)w.remove();
    addMe(q);let answer='';
    try{
      let quick=null;try{quick=await Promise.race([localAnswer(q,ctx),new Promise(r=>setTimeout(()=>r(null),3500))])}catch(e){}
      const d=addBot(quick||'',false),bd=d.querySelector('.bd');
      if(quick){answer=quick}
      else{
        let raf=0;
        try{answer=await serverAnswer(q,t=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;bd.innerHTML=md(t);scroll()});answer=t})}
        catch(e){bd.innerHTML=esc((e.name==='AbortError'?'The reply took too long.':(e.message||'Error'))+' Please try again, or use WhatsApp for help.');answer='';}
        if(answer)bd.innerHTML=md(answer);
      }
      if(answer){addActs(d,answer);hist.push({role:'user',content:q},{role:'assistant',content:answer});hist=hist.slice(-20);saveHist();if(speakOn&&!voice)speak(answer)}
    }finally{busy=false;send.disabled=false;scroll()}
    return answer;
  }
  /* ---- composer ---- */
  const grow=()=>{inp.style.height='auto';inp.style.height=Math.min(130,inp.scrollHeight)+'px'};
  inp.addEventListener('input',grow);
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();form.requestSubmit()}});
  form.addEventListener('submit',e=>{e.preventDefault();const q=inp.value.trim();inp.value='';grow();ask(q)});
  const toggle=o=>{box.classList.toggle('hidden',!o);if(o)setTimeout(()=>inp.focus(),60);else{stopSpeak();endLive()}};
  btn.onclick=()=>toggle(box.classList.contains('hidden'));$q('#aiX').onclick=()=>toggle(false);
  $q('#aiBig').onclick=()=>box.classList.toggle('big');
  $q('#aiNew').onclick=()=>{if(ctrl)ctrl.abort();stopSpeak();hist=[];saveHist();welcome()};
  $q('#aiSpk').onclick=e=>{speakOn=!speakOn;e.currentTarget.classList.toggle('on',speakOn);try{localStorage.setItem('suhas-ai-speak',speakOn?'1':'0')}catch(_){}if(!speakOn)stopSpeak()};
  /* ---- dictation ---- */
  let rec=null;
  function listen(onFinal,onInterim,onEnd){
    if(!SR){toast2('Voice input is not supported in this browser. Try Chrome.');onEnd&&onEnd();return null}
    const r=new SR();r.lang=pref==='auto'?(navigator.language||'en-US'):pref;r.interimResults=true;r.continuous=false;r.maxAlternatives=1;
    let finalText='';
    r.onresult=e=>{let i='';for(let k=e.resultIndex;k<e.results.length;k++){const t=e.results[k][0].transcript;if(e.results[k].isFinal)finalText+=t;else i+=t}onInterim&&onInterim(finalText+i)};
    r.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed')toast2('Allow microphone access to use voice.')};
    r.onend=()=>{onEnd&&onEnd();if(finalText.trim())onFinal&&onFinal(finalText.trim())};
    try{r.start()}catch(e){onEnd&&onEnd();return null}return r;
  }
  function toast2(m){const d=document.createElement('div');d.className='aib bot';d.innerHTML='<span class="av">ℹ️</span><div class="bd">'+esc(m)+'</div>';log.appendChild(d);scroll()}
  const mic=$q('#aiMic');
  mic.onclick=()=>{
    if(rec){rec.stop();return}
    mic.classList.add('rec');rec=listen(t=>{inp.value=(inp.value+' '+t).trim();grow();form.requestSubmit()},t=>{inp.value=t;grow()},()=>{mic.classList.remove('rec');rec=null});
    if(!rec)mic.classList.remove('rec');
  };
  /* ---- live voice mode ---- */
  const vo=$q('#aiVoice');let live=false,lrec=null;
  const vset=(c,t,tx)=>{vo.className='aiv '+c;$q('#aiVst').textContent=t;if(tx!==undefined)$q('#aiVtx').textContent=tx};
  function loop(){
    if(!live)return;vset('listening','Listening…','');
    lrec=listen(async t=>{
      if(!live)return;vset('thinking','Thinking…',t);
      const ans=await ask(t,true);
      if(!live)return;
      if(ans){vset('speaking','Speaking…',plain(ans).slice(0,300));speak(ans,()=>{if(live)setTimeout(loop,250)})}else setTimeout(loop,600);
    },t=>{$q('#aiVtx').textContent=t},()=>{lrec=null;if(live&&vo.classList.contains('listening')&&!busy)setTimeout(loop,400)});
    if(!lrec&&live){}
  }
  function startLive(){if(!SR){toast2('Live voice needs a browser with speech recognition (Chrome / Edge / Safari).');return}live=true;vo.classList.remove('hidden');loop()}
  function endLive(){live=false;if(lrec){try{lrec.abort()}catch(e){}lrec=null}stopSpeak();vo.classList.add('hidden')}
  $q('#aiLive').onclick=startLive;$q('#aiVend').onclick=endLive;
  $q('#aiVstop').onclick=()=>{if(speaking){stopSpeak();if(live)setTimeout(loop,200)}else if(lrec){try{lrec.stop()}catch(e){}}};
  if(synth)synth.onvoiceschanged=()=>{};
}
