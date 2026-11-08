(function(){
  'use strict';
  var KEY='suhas-display-mode';
  function init(){
    if(document.getElementById('suhas-display-trigger')) return;
    var mode='auto';
    try{mode=localStorage.getItem(KEY)||'auto';}catch(e){}
    function apply(){document.body.classList.toggle('suhas-desktop-mode',mode==='desktop');}
    var trigger=document.createElement('button');
    trigger.id='suhas-display-trigger';trigger.className='suhas-display-trigger';
    trigger.type='button';trigger.textContent='⚙ Display';
    trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','false');
    var panel=document.createElement('section');
    panel.className='suhas-display-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Display settings');
    panel.innerHTML='<h3>Display settings</h3><p>Choose how SUHAS appears on this device.</p><div class="suhas-display-options"><button type="button" data-mode="auto">Auto · Responsive layout</button><button type="button" data-mode="desktop">Desktop Mode · Wide layout</button></div><div class="suhas-display-note">Your choice is saved on this device. Desktop Mode may require horizontal scrolling on a small screen.</div>';
    function refresh(){apply();panel.querySelectorAll('[data-mode]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});trigger.textContent=mode==='desktop'?'⚙ Desktop':'⚙ Display';}
    trigger.addEventListener('click',function(){var open=panel.classList.toggle('open');trigger.setAttribute('aria-expanded',String(open));});
    panel.addEventListener('click',function(e){var b=e.target.closest('[data-mode]');if(!b)return;mode=b.dataset.mode;try{localStorage.setItem(KEY,mode);}catch(err){}refresh();panel.classList.remove('open');trigger.setAttribute('aria-expanded','false');});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){panel.classList.remove('open');trigger.setAttribute('aria-expanded','false');}});
    document.addEventListener('click',function(e){if(!panel.contains(e.target)&&!trigger.contains(e.target)){panel.classList.remove('open');trigger.setAttribute('aria-expanded','false');}});
    document.body.appendChild(panel);document.body.appendChild(trigger);refresh();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();