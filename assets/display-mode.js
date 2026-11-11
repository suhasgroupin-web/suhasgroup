(function(){
'use strict';
var KEY='suhas-display-mode';
function init(){
  if(document.getElementById('suhas-display-trigger'))return;
  var savedMode='auto';
  try{savedMode=localStorage.getItem(KEY)||'auto'}catch(e){}
  var mode=savedMode;
  var nav=document.querySelector('.nav-wrap');
  if(!nav)return;

  function apply(){
    document.body.classList.toggle('suhas-desktop-mode',mode==='desktop');
    document.body.classList.toggle('suhas-mobile-mode',mode==='mobile');
  }

  var profileMenu=nav.querySelector('#profile-more-menu');
  if(profileMenu){
    Array.prototype.slice.call(profileMenu.querySelectorAll('a')).forEach(function(a){
      var h=(a.getAttribute('href')||'').toLowerCase();
      var t=(a.textContent||'').trim().toLowerCase();
      if(h.indexOf('home.html')>=0||h.indexOf('social.html')>=0||h.indexOf('messenger.html')>=0||h.indexOf('max-profile.html')>=0||t.indexOf('suhas max')>=0)a.remove();
    });
  }

  var actions=document.createElement('div');
  actions.className='suhas-nav-actions';
  nav.appendChild(actions);

  var trigger=document.createElement('button');
  trigger.id='suhas-display-trigger';
  trigger.className='suhas-display-trigger';
  trigger.type='button';
  trigger.textContent='⋮';
  trigger.setAttribute('aria-label','More options');
  trigger.setAttribute('title','More options');
  trigger.setAttribute('aria-haspopup','dialog');
  trigger.setAttribute('aria-expanded','false');
  actions.appendChild(trigger);

  var panel=document.createElement('section');
  panel.className='suhas-display-panel';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-label','More options and navigation');
  panel.setAttribute('aria-modal','true');
  panel.innerHTML='<div class="suhas-menu-heading"><h3>Display mode</h3><p>Choose how SUHAS GROUP appears on this device.</p></div><div class="suhas-display-options"><button type="button" data-mode="mobile">▣ &nbsp; Mobile Mode</button><button type="button" data-mode="desktop">▤ &nbsp; Desktop Mode</button></div><div class="suhas-display-section">SUHAS GROUP Navigation</div><nav class="suhas-menu-links" aria-label="SUHAS GROUP pages"></nav><div class="suhas-display-note">Your display preference is saved on this device.</div>';

  var links=panel.querySelector('.suhas-menu-links');
  if(profileMenu){
    Array.prototype.slice.call(profileMenu.querySelectorAll('a')).forEach(function(a){
      var copy=a.cloneNode(true);
      var h=(copy.getAttribute('href')||'').toLowerCase();
      var t=(copy.textContent||'').trim().toLowerCase();
      if(h.indexOf('home.html')>=0||h.indexOf('social.html')>=0||h.indexOf('messenger.html')>=0||h.indexOf('max-profile.html')>=0||t.indexOf('suhas max')>=0)return;
      links.appendChild(copy);
    });
    profileMenu.remove();
  }else{
    [
      ['index.html','Home'],
      ['jobs.html','Find Jobs'],
      ['group.html','Our Companies'],
      ['about.html','About SUHAS GROUP'],
      ['employers.html','For Employers'],
      ['contact.html','Contact'],
      ['main-menu.html','Main Menu']
    ].forEach(function(item){
      var a=document.createElement('a');a.href=item[0];a.textContent=item[1];links.appendChild(a);
    });
  }

  var backdrop=document.createElement('div');
  backdrop.className='suhas-menu-backdrop';
  backdrop.setAttribute('aria-hidden','true');

  var style=document.createElement('style');
  style.id='suhas-display-drawer-fix';
  style.textContent=`
    .suhas-nav-actions{position:relative;display:flex;align-items:center;margin-left:auto;flex:0 0 auto;z-index:1503}
    .suhas-display-trigger{display:grid!important;place-items:center!important;cursor:pointer!important;touch-action:manipulation}
    .suhas-menu-backdrop{position:fixed!important;inset:0!important;background:rgba(5,17,39,.48)!important;z-index:1500!important;display:none!important;touch-action:none!important}
    .suhas-menu-backdrop.open{display:block!important}
    .suhas-display-panel{display:none!important;position:fixed!important;top:calc(env(safe-area-inset-top,0px) + 76px)!important;right:0!important;left:auto!important;bottom:calc(78px + env(safe-area-inset-bottom,0px))!important;width:min(52vw,360px)!important;min-width:min(240px,calc(100vw - 24px))!important;max-width:calc(100vw - 16px)!important;max-height:none!important;overflow-y:auto!important;overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important;box-sizing:border-box!important;padding:16px 13px!important;margin:0!important;border:1px solid #dbe5f2!important;border-right:0!important;border-radius:18px 0 0 18px!important;background:linear-gradient(160deg,#fff 0%,#f5f8fd 100%)!important;color:#142b4d!important;box-shadow:0 14px 42px rgba(4,20,48,.28)!important;z-index:1502!important}
    .suhas-display-panel.open{display:block!important}
    .suhas-display-panel .suhas-menu-heading h3{font-size:17px!important;font-weight:900!important;margin:0 0 4px!important;color:#102b53!important}
    .suhas-display-panel .suhas-menu-heading p{font-size:11px!important;line-height:1.35!important;margin:0 0 10px!important;color:#6b7890!important}
    .suhas-display-panel .suhas-display-options{display:grid!important;grid-template-columns:1fr!important;gap:7px!important;margin:0 0 12px!important}
    .suhas-display-panel .suhas-display-options button{width:100%!important;min-height:39px!important;padding:9px 10px!important;border:1px solid #d8e2f0!important;border-radius:10px!important;background:linear-gradient(180deg,#fff,#edf3fb)!important;color:#17365f!important;text-align:left!important;font-size:12px!important;font-weight:850!important;box-shadow:0 2px 0 #d3deed!important}
    .suhas-display-panel .suhas-display-options button[aria-pressed=true]{background:linear-gradient(135deg,#e7f1ff,#d7e8ff)!important;border-color:#6b9ee6!important;color:#0755bd!important}
    .suhas-display-panel .suhas-display-section{padding:10px 0 6px!important;border-top:1px solid #e1e8f2!important;color:#71819a!important;font-size:10px!important;font-weight:900!important;letter-spacing:.12em!important;text-transform:uppercase!important}
    .suhas-display-panel .suhas-menu-links{display:flex!important;flex-direction:column!important;gap:3px!important}
    .suhas-display-panel .suhas-menu-links a{display:flex!important;align-items:center!important;min-height:38px!important;width:100%!important;box-sizing:border-box!important;padding:8px 9px!important;border:1px solid transparent!important;border-radius:9px!important;color:#17365f!important;text-decoration:none!important;font-size:12px!important;font-weight:800!important;background:rgba(255,255,255,.78)!important}
    .suhas-display-panel .suhas-menu-links a:active{background:#e8f1ff!important;border-color:#b8d1f5!important}
    .suhas-display-panel .suhas-display-note{margin-top:10px!important;padding-top:8px!important;border-top:1px solid #e6edf5!important;color:#8995a7!important;font-size:9px!important}
    body.suhas-options-open{overflow:hidden!important;overscroll-behavior:none!important}
    @media(min-width:821px){.suhas-display-panel{top:88px!important;bottom:20px!important;width:min(340px,34vw)!important;min-width:280px!important;border:1px solid #dbe5f2!important;border-radius:18px 0 0 18px!important}}
    @media(max-width:360px){.suhas-display-panel{width:calc(100vw - 34px)!important;min-width:0!important}}
  `;
  (document.head||document.documentElement).appendChild(style);
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);

  function close(){
    panel.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.classList.remove('suhas-options-open');
    trigger.setAttribute('aria-expanded','false');
  }
  function refresh(){
    apply();
    panel.querySelectorAll('[data-mode]').forEach(function(b){
      b.setAttribute('aria-pressed',String(b.dataset.mode===mode));
    });
  }
  trigger.addEventListener('click',function(){
    if(panel.classList.contains('open')){close();return;}
    panel.classList.add('open');
    backdrop.classList.add('open');
    document.body.classList.add('suhas-options-open');
    trigger.setAttribute('aria-expanded','true');
  });
  panel.addEventListener('click',function(e){
    var b=e.target.closest('[data-mode]');
    if(b){
      mode=b.dataset.mode;
      try{localStorage.setItem(KEY,mode);}catch(err){}
      refresh();close();return;
    }
    if(e.target.closest('a'))close();
  });
  backdrop.addEventListener('click',close);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  document.addEventListener('click',function(e){
    if(panel.classList.contains('open')&&!panel.contains(e.target)&&!trigger.contains(e.target)&&!backdrop.contains(e.target))close();
  });
  refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
