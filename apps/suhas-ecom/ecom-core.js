// SUHAS E-COM shared storefront module: Supabase client, catalogue, cart, checkout, order alerts.
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.57.0';

export const db=createClient('https://pokxiylebwzoxunccuwm.supabase.co','sb_publishable_H9F5NLitq2cHMnZyOYm4NA_bdD6Z850',{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
export const $=id=>document.getElementById(id);
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const money=n=>'৳'+Number(n||0).toLocaleString('en-BD',{maximumFractionDigits:2});
export const WA='8801862144113';
export const waLink=t=>'https://wa.me/'+WA+'?text='+encodeURIComponent(t);
export const FREE_SHIP=2000,SHIP_FEE=120;
export const CATS=[['Fashion & Clothing','👕'],['Footwear','👟'],['Bags & Luggage','🎒'],['Jewellery & Accessories','💍'],['Electronics','🎧'],['Mobile & Accessories','📱'],['Home & Kitchen','🏠'],['Grocery & Food','🛒'],['Beauty & Personal Care','🧴'],['Health & Wellness','🌿'],['Baby & Kids','🧸'],['Books & Stationery','📚'],['Sports & Outdoors','⚽'],['Toys & Games','🧩'],['Automotive','🚗'],['Office Supplies','🖊️'],['Other','✨']];
export const catIcon=c=>(CATS.find(x=>x[0]===c)||[0,'🛍️'])[1];
export const disc=p=>p.compare_at_bdt&&p.compare_at_bdt>p.price_bdt?Math.round(100-p.price_bdt*100/p.compare_at_bdt):0;

/* ---------- catalogue ---------- */
export async function loadCatalog(){
  const [pr,sh]=await Promise.all([
    db.from('ecom_products').select('*').eq('is_active',true).order('created_at',{ascending:false}),
    db.from('ecom_shops').select('*')
  ]);
  if(pr.error)throw pr.error;
  const shops=new Map((sh.data||[]).map(s=>[s.id,s]));
  const list=(pr.data||[]).map(p=>{
    const demo=String(p.name||'').startsWith('DEMO ·'),s=shops.get(p.vendor_id);
    const images=(Array.isArray(p.images)&&p.images.length?p.images:(p.image_url?[p.image_url]:[])).filter(Boolean);
    return {...p,images,isDemo:demo,title:demo?p.name.replace(/^DEMO · /,''):p.name,shop:demo?'SUHAS MAX Demo Catalogue':(s?.shop_name||'Verified seller'),shopCity:s?.city||'',min:Math.max(1,p.min_order||1),unit:p.unit||'piece',icon:catIcon(p.category)};
  });
  list.sort((a,b)=>(a.isDemo-b.isDemo)||(new Date(b.created_at)-new Date(a.created_at)));
  return list;
}
export const pimg=(p,cls='')=>p.images[0]?'<img src="'+esc(p.images[0])+'" alt="'+esc(p.title)+'" loading="lazy">':esc(p.icon||'🛍️');

export function cardHtml(p){
  const d=disc(p);
  return '<article class="pc"><a class="pimg" href="product.html?id='+esc(p.id)+'">'+(p.isDemo?'<span class="demo">DEMO PREVIEW</span>':(d?'<span class="off">-'+d+'%</span>':''))+pimg(p)+'</a>'+
  '<div class="pb"><a class="pt" href="product.html?id='+esc(p.id)+'">'+esc(p.title)+'</a>'+
  '<div class="pp">'+money(p.price_bdt)+(d?'<s>'+money(p.compare_at_bdt)+'</s>':'')+'</div>'+
  '<div class="moq">Min. order: '+p.min+' '+esc(p.unit)+(p.min>1?'s':'')+'</div>'+
  '<div class="sup"><span class="vf">Verified</span> '+esc(p.shop)+'</div>'+
  '<div class="pbtn">'+(p.isDemo?'<a href="product.html?id='+esc(p.id)+'">View</a>':'<button data-add="'+esc(p.id)+'"'+(p.stock<p.min?' disabled':'')+'>'+(p.stock<p.min?'Sold out':'Add to cart')+'</button><button class="o" data-buy="'+esc(p.id)+'"'+(p.stock<p.min?' disabled':'')+'>Order</button>')+'</div></div></article>';
}

/* ---------- shell (header / footer) ---------- */
export function mountShell(active=''){
  const q=new URLSearchParams(location.search);
  $('shellTop').innerHTML=
  '<div class="strip"><div class="wrap"><span>🚚 Free delivery over ৳2,000 · Cash on Delivery · bKash · Nagad</span><span><a href="manage.html#seller">Sell on SUHAS E-COM</a><a href="manage.html">Seller / Admin login</a><a href="track.html">Track order</a></span></div></div>'+
  '<header class="hd"><div class="wrap"><button class="menuBtn" id="menuBtn" aria-label="Menu">☰</button>'+
  '<a class="logo" href="index.html"><img src="logo.png" alt="SUHAS E-COM logo">SUHAS <span>E-COM</span></a>'+
  '<form class="sbar" id="shellSearch" action="index.html" method="get" role="search"><select name="cat" aria-label="Category"><option value="">All categories</option>'+CATS.map(c=>'<option>'+esc(c[0])+'</option>').join('')+'</select><input name="q" type="search" placeholder="What are you looking for?" aria-label="Search products" value="'+esc(q.get('q')||'')+'"><button type="submit">Search</button></form>'+
  '<div class="hact"><a class="hbtn" href="track.html"><b>📦</b><span>Orders</span></a><button class="hbtn" id="cartBtn"><b>🛒</b><span>Cart</span><em class="cnt" id="cartCount" style="font-style:normal">0</em></button><a class="hbtn" href="manage.html"><b>👤</b><span>Sign in</span></a></div></div></header>'+
  '<nav class="cats"><div class="wrap"><a href="index.html" class="'+(active==='home'?'on':'')+'">Home</a><a href="index.html#catalog">All products</a><a href="index.html?sort=deal#catalog">Top deals</a><a href="track.html" class="'+(active==='track'?'on':'')+'">Track order</a><a href="manage.html#seller">Become a seller</a><a href="'+waLink('Hello SUHAS E-COM, I need support.')+'" target="_blank" rel="noopener">Help &amp; WhatsApp</a></div></nav>';
  $('shellBottom').innerHTML=
  '<a class="wafab" href="'+waLink('Hello SUHAS E-COM, I need product support.')+'" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">💬 <span>WhatsApp</span></a>'+
  '<footer class="ft">© '+new Date().getFullYear()+' SUHAS E-COM · A SUHAS Group company · Dhaka, Bangladesh<br>Guest checkout · Cash on Delivery · bKash &amp; Nagad · WhatsApp +880 1862-144113 · <a href="../../privacy-policy.html">Privacy Policy</a></footer>';
}

/* ---------- cart ---------- */
const CART_KEY='suhas-ecom-cart-v1';
let cart=(()=>{try{const v=JSON.parse(localStorage.getItem(CART_KEY)||'[]');return Array.isArray(v)?v:[]}catch(e){return[]}})();
const saveCart=()=>{try{localStorage.setItem(CART_KEY,JSON.stringify(cart))}catch(e){}};
let getProducts=()=>[],direct=null; // direct = buy-now list
const find=id=>getProducts().find(p=>String(p.id)===String(id));
function lines(list){return list.map(l=>({p:find(l.id),qty:l.qty})).filter(x=>x.p&&!x.p.isDemo)}
function totals(list){const items=lines(list),sub=items.reduce((s,x)=>s+x.p.price_bdt*x.qty,0),ship=!items.length||sub>=FREE_SHIP?0:SHIP_FEE;return{items,sub,ship,total:sub+ship}}
const totalsHtml=t=>'<div class="tot"><span>Subtotal</span><span>'+money(t.sub)+'</span></div><div class="tot"><span>Delivery</span><span>'+(t.ship?money(t.ship):'Free')+'</span></div><div class="tot big"><span>Total</span><span>'+money(t.total)+'</span></div>';
export function addToCart(id,qty){
  const p=find(id);if(!p||p.isDemo||p.stock<p.min)return false;
  qty=Math.max(p.min,qty||p.min);
  const l=cart.find(x=>String(x.id)===String(id));
  if(l)l.qty=Math.min(p.stock,l.qty+qty);else cart.push({id:p.id,qty:Math.min(p.stock,qty)});
  saveCart();renderCart();return true;
}
export function renderCart(){
  const t=totals(cart),n=t.items.reduce((s,x)=>s+x.qty,0);
  if($('cartCount')){$('cartCount').textContent=n;$('cartCount').classList.toggle('hidden',!n)}
  if(!$('cartLines'))return;
  $('cartLines').innerHTML=t.items.length?t.items.map(({p,qty})=>'<div class="ln"><div class="th">'+pimg(p)+'</div><div><b>'+esc(p.title)+'</b><div class="muted" style="font-size:12px">'+esc(p.shop)+' · MOQ '+p.min+'</div><div class="qty"><button data-dec="'+esc(p.id)+'" aria-label="Decrease">−</button><span>'+qty+'</span><button data-inc="'+esc(p.id)+'" aria-label="Increase">+</button></div></div><b>'+money(p.price_bdt*qty)+'</b></div>').join(''):'<p class="muted">Your cart is empty.</p>';
  $('cartTotals').innerHTML=t.items.length?totalsHtml(t)+(t.sub<FREE_SHIP?'<div class="note">Add '+money(FREE_SHIP-t.sub)+' more for free delivery.</div>':''):'';
  $('toCheckout').classList.toggle('hidden',!t.items.length);
}
function changeQty(id,d){
  const l=cart.find(x=>String(x.id)===String(id)),p=find(id);if(!l||!p)return;
  l.qty=Math.min(p.stock,l.qty+d);
  if(l.qty<p.min)cart=cart.filter(x=>x!==l);
  saveCart();renderCart();
}
const open=id=>$(id).classList.add('open'),close=id=>$(id).classList.remove('open');

/* ---------- my orders + live alerts ---------- */
const ORD_KEY='suhas-ecom-my-orders-v1';
export const myOrders=()=>{try{const v=JSON.parse(localStorage.getItem(ORD_KEY)||'[]');return Array.isArray(v)?v:[]}catch(e){return[]}};
const saveOrders=l=>{try{localStorage.setItem(ORD_KEY,JSON.stringify(l.slice(0,30)))}catch(e){}};
export function rememberOrder(code,phone,status='new'){const l=myOrders().filter(o=>o.code!==code);l.unshift({code,phone,status,at:Date.now()});saveOrders(l)}
export const STATUS_TEXT={
  new:['⏳','Order received','Waiting for the seller to confirm your order.'],
  confirmed:['🎉','Congratulations! Your order is confirmed.','The seller has confirmed your order and is preparing it.'],
  processing:['📦','Your order is being packed','The seller is packing your products.'],
  shipped:['🚚','Your order is out for delivery','Our delivery person is on the way. Keep your phone nearby.'],
  delivered:['✅','Delivered','Your order has been delivered. Thank you for shopping with SUHAS E-COM!'],
  cancelled:['✖','Order cancelled','This order was cancelled.']
};
export function toast(title,body){
  const t=document.createElement('div');t.className='toast';t.setAttribute('role','status');
  t.innerHTML='<div><b>'+esc(title)+'</b>'+esc(body||'')+'</div><button aria-label="Close">×</button>';
  t.querySelector('button').onclick=()=>t.remove();document.body.appendChild(t);setTimeout(()=>t.remove(),12000);
  try{if('Notification' in window&&Notification.permission==='granted'&&document.hidden)new Notification(title,{body:body||'',icon:'favicon.png'})}catch(e){}
}
export async function trackOrder(code,phone){
  const {data,error}=await db.rpc('ecom_track_order',{p_code:code,p_phone:phone});
  if(error)throw error;return data;
}
let watching=false;
export function watchMyOrders(onChange){
  if(watching)return;watching=true;
  const check=async()=>{
    const list=myOrders();let dirty=false;
    for(const o of list){
      if(['delivered','cancelled'].includes(o.status))continue;
      try{
        const d=await trackOrder(o.code,o.phone);if(!d)continue;
        if(d.status!==o.status){
          o.status=d.status;dirty=true;const s=STATUS_TEXT[d.status];
          if(s)toast(s[0]+' '+s[1],'Order '+o.code+' · '+s[2]);
          if(onChange)onChange(o.code,d);
        }
      }catch(e){}
    }
    if(dirty)saveOrders(list);
  };
  check();setInterval(check,15000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
}

/* ---------- cart / checkout UI ---------- */
export function mountCommerce(productsFn){
  getProducts=productsFn;
  const host=document.createElement('div');
  host.innerHTML=
  '<div class="ov" id="cartModal"><section class="md"><div class="mh"><h2>Your cart</h2><button class="x" data-close="cartModal" aria-label="Close">×</button></div><div id="cartLines"></div><div id="cartTotals"></div><button class="prim" id="toCheckout">Proceed to checkout</button></section></div>'+
  '<div class="ov" id="checkoutModal"><section class="md"><div class="mh"><h2>Place your order</h2><button class="x" data-close="checkoutModal" aria-label="Close">×</button></div>'+
  '<form id="checkoutForm" autocomplete="on"><div id="coItems"></div>'+
  '<label class="f" for="cName">Full name</label><input class="in" id="cName" name="name" required minlength="2" maxlength="80" autocomplete="name">'+
  '<label class="f" for="cPhone">Mobile number</label><input class="in" id="cPhone" name="phone" required inputmode="tel" pattern="[0-9+ ]{6,20}" autocomplete="tel" placeholder="01XXXXXXXXX">'+
  '<label class="f" for="cAddress">Delivery address</label><textarea class="in" id="cAddress" name="address" required minlength="5" maxlength="300" autocomplete="street-address" placeholder="House, road, area, district"></textarea>'+
  '<label class="f" for="cEmail">Email address *</label><input class="in" id="cEmail" name="email" type="email" required maxlength="254" autocomplete="email" placeholder="you@example.com">'+
  '<label class="f">Payment method</label><div class="pay"><label><input type="radio" name="pay" value="cod" checked><span>Cash on Delivery</span></label><label><input type="radio" name="pay" value="bkash"><span>bKash</span></label><label><input type="radio" name="pay" value="nagad"><span>Nagad</span></label></div>'+
  '<div id="payBox" class="hidden"><div class="note">After placing the order, pay through bKash / Nagad as instructed by the seller on WhatsApp (<b>+880 1862-144113</b>). Enter your transaction ID below.</div><label class="f" for="cRef">Transaction ID</label><input class="in" id="cRef" name="ref" maxlength="40"></div>'+
  '<div id="coSummary" style="margin-top:12px"></div><div class="err" id="coErr" role="alert"></div><button class="prim" type="submit" id="placeBtn">Confirm order</button></form></section></div>'+
  '<div class="ov" id="doneModal"><section class="md"><div class="mh"><h2>Order placed</h2><button class="x" data-close="doneModal" aria-label="Close">×</button></div><div id="doneBody"></div></section></div>';
  document.body.appendChild(host);
  document.addEventListener('click',e=>{
    const t=e.target.closest('[data-close],[data-add],[data-buy],[data-inc],[data-dec],#cartBtn,#toCheckout');if(!t)return;
    if(t.dataset.close)close(t.dataset.close);
    else if(t.dataset.add){if(addToCart(t.dataset.add)){const p=find(t.dataset.add);toast('🛒 Added to cart',p?p.title:'')}}
    else if(t.dataset.buy){const p=find(t.dataset.buy);if(p)openCheckout([{id:p.id,qty:p.min}])}
    else if(t.dataset.inc)changeQty(t.dataset.inc,1);
    else if(t.dataset.dec)changeQty(t.dataset.dec,-1);
    else if(t.id==='cartBtn'){renderCart();open('cartModal')}
    else if(t.id==='toCheckout'){close('cartModal');openCheckout(null)}
  });
  document.querySelectorAll('.ov').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open')}));
  $('checkoutForm').addEventListener('submit',placeOrder);
  $('checkoutForm').addEventListener('change',e=>{if(e.target.name==='pay')$('payBox').classList.toggle('hidden',e.target.value==='cod')});
  const last=(()=>{try{return JSON.parse(localStorage.getItem('suhas-ecom-buyer')||'{}')}catch(e){return{}}})();
  for(const k of ['name','phone','address','email'])if(last[k])$('checkoutForm').elements[k].value=last[k];
  renderCart();
}
export function openCheckout(list){
  direct=list;const t=totals(direct||cart);
  if(!t.items.length){toast('Cart is empty','Add a product first.');return}
  $('coItems').innerHTML=t.items.map(({p,qty})=>'<div class="ln"><div class="th">'+pimg(p)+'</div><div><b>'+esc(p.title)+'</b><div class="muted" style="font-size:12px">'+esc(p.shop)+' · Qty '+qty+'</div></div><b>'+money(p.price_bdt*qty)+'</b></div>').join('');
  $('coSummary').innerHTML=totalsHtml(t);$('coErr').textContent='';open('checkoutModal');
}
async function placeOrder(e){
  e.preventDefault();$('coErr').textContent='';
  const f=e.currentTarget,list=direct||cart,t=totals(list);
  if(!t.items.length){$('coErr').textContent='Your cart is empty.';return}
  const pay=f.elements.pay.value,ref=f.elements.ref.value.trim();
  if(pay!=='cod'&&ref.length<4){$('coErr').textContent='Please enter your payment transaction ID.';return}
  $('placeBtn').disabled=true;$('placeBtn').textContent='Placing order…';
  try{
    const buyer={name:f.elements.name.value.trim(),phone:f.elements.phone.value.trim(),address:f.elements.address.value.trim(),email:f.elements.email.value.trim().toLowerCase()};
    const {data,error}=await db.rpc('ecom_place_order',{p_name:buyer.name,p_phone:buyer.phone,p_address:buyer.address,p_email:buyer.email,p_pay:pay,p_ref:ref,p_items:t.items.map(x=>({id:x.p.id,qty:x.qty}))});
    if(error)throw error;
    if(!data||!data.order_code||data.total==null)throw new Error('The store did not confirm your order. Please try again.');
    try{localStorage.setItem('suhas-ecom-buyer',JSON.stringify(buyer))}catch(_){}
    rememberOrder(data.order_code,buyer.phone,'new');
    let mailLine='';
    try{const m=await fetch('/api/ecom-order-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:data.email_token})});const j=await m.json().catch(()=>({}));if(m.ok&&j.ok)mailLine='<p class="muted">A confirmation email was sent to '+esc(buyer.email)+'.</p>'}catch(_){}
    if(!direct){cart=[];saveCart()}direct=null;renderCart();f.elements.ref.value='';$('payBox').classList.add('hidden');
    const track='track.html?code='+encodeURIComponent(data.order_code)+'&phone='+encodeURIComponent(buyer.phone);
    $('doneBody').innerHTML='<div class="note ok" style="font-size:15px"><b style="font-size:20px">🎉 Congratulations!</b><br>Your order <b>'+esc(data.order_code)+'</b> has been placed successfully. The seller has been notified and will confirm it shortly. You will get a “Your order is confirmed” notification here.</div>'+
      '<div class="tot"><span>Subtotal</span><b>'+money(data.subtotal)+'</b></div><div class="tot"><span>Delivery</span><b>'+(data.delivery?money(data.delivery):'Free')+'</b></div><div class="tot big"><span>Total · '+(pay==='cod'?'Cash on Delivery':esc(pay)+' (ref '+esc(ref)+')')+'</span><span>'+money(data.total)+'</span></div>'+mailLine+
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px"><a class="btn pri" style="flex:1" href="'+track+'">Track my order</a><a class="btn wa" style="flex:1" target="_blank" rel="noopener" href="'+waLink('Hello SUHAS E-COM, I placed order '+data.order_code+'. Please help me with this order.')+'">WhatsApp us</a></div>';
    close('checkoutModal');open('doneModal');
    try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission()}catch(_){}
    watchMyOrders();
  }catch(error){
    $('coErr').textContent='Order was not placed: '+(error?.message||'Store connection error. Please try again.');
  }finally{
    $('placeBtn').disabled=false;$('placeBtn').textContent='Confirm order';
  }
}
