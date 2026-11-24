// SUHAS AI chat widget for SUHAS E-COM (customers, sellers and admin).
const AI_URL='https://ehvgxbifqtyajeersnvq.supabase.co/functions/v1/ecom-assistant';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=t=>esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');
const myOrders=()=>{try{const v=JSON.parse(localStorage.getItem('suhas-ecom-my-orders-v1')||'[]');return Array.isArray(v)?v.slice(0,5).map(o=>({code:o.code,phone:o.phone})):[]}catch(e){return[]}};
let mounted=false,hist=[];
try{hist=JSON.parse(sessionStorage.getItem('suhas-ecom-ai')||'[]')}catch(e){}
export function mountAI({getToken,staff=false}={}){
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
    add(q,'me');const w=add('Thinking…','bot');
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
