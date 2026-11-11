(function(){
  'use strict';
  var KEY='suhas-display-mode';
  function init(){
    if(document.getElementById('suhas-display-trigger')) return;
    var savedMode='auto';
    try{savedMode=localStorage.getItem(KEY)||'auto';}catch(e){}
    var isPhone=window.matchMedia && window.matchMedia('(max-width: 820px), (pointer: coarse) and (max-width: 1024px)').matches;
    /* A phone/tablet must stay responsive even if Desktop Mode was selected earlier. */
    var mode=(isPhone && savedMode==='desktop')?'mobile':savedMode;
    function apply(){document.body.classList.toggle('suhas-desktop-mode',mode==='desktop' && !isPhone);document.body.classList.toggle('suhas-mobile-mode',mode==='mobile' || isPhone);}
    var nav=document.querySelector('.nav-wrap');
    if(!nav) return;
    var profileMenu=nav.querySelector('#profile-more-menu');
    var profileToggle=nav.querySelector('#profile-more-toggle');
    if(profileToggle) profileToggle.remove();
    /* Keep existing navigation links in place. Appending the display control avoids fragile DOM re-parenting and insertBefore errors. */
    var actions=document.createElement('div');actions.className='suhas-nav-actions';
    nav.appendChild(actions);
    var trigger=document.createElement('button');
    trigger.id='suhas-display-trigger';trigger.className='suhas-display-trigger';
    trigger.type='button';trigger.textContent='⋮';trigger.setAttribute('aria-label','More options');trigger.setAttribute('title','More options');
    trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','false');
    actions.appendChild(trigger);
    var panel=document.createElement('section');
    panel.className='suhas-display-panel'+(profileMenu?' profile-unified-panel':'');panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Display settings');
    panel.innerHTML='<h3>More options</h3><p>Navigation, device layout and display preferences.</p><div class="suhas-display-options"><button type="button" data-mode="auto">Auto · Responsive layout</button><button type="button" data-mode="mobile">Mobile Mode · Compact layout</button><button type="button" data-mode="desktop">Laptop / Desktop Mode · Wide layout</button></div><div class="suhas-display-note">Your choice is saved on this device. Desktop Mode may require horizontal scrolling on a small screen.</div>';
    if(profileMenu){var section=document.createElement('div');section.className='suhas-display-section';section.textContent='SUHAS GROUP Navigation';panel.insertBefore(section,panel.firstChild);panel.appendChild(profileMenu);}
    function refresh(){apply();panel.querySelectorAll('[data-mode]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});trigger.textContent='⋮';}
    trigger.addEventListener('click',function(){var open=panel.classList.toggle('open');trigger.setAttribute('aria-expanded',String(open));});
    panel.addEventListener('click',function(e){var b=e.target.closest('[data-mode]');if(!b)return;mode=(isPhone && b.dataset.mode==='desktop')?'mobile':b.dataset.mode;try{localStorage.setItem(KEY,mode);}catch(err){}refresh();panel.classList.remove('open');trigger.setAttribute('aria-expanded','false');});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){panel.classList.remove('open');trigger.setAttribute('aria-expanded','false');}});
    document.addEventListener('click',function(e){if(!panel.contains(e.target)&&!trigger.contains(e.target)){panel.classList.remove('open');trigger.setAttribute('aria-expanded','false');}});
    actions.appendChild(panel);refresh();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();