// SUHAS AI shortcut for SUHAS E-COM (customers, sellers and admin).
// One tap on the floating SUHAS AI button opens the full SUHAS AI chat page (ai.html).
let mounted=false;
export function mountAI(){
  if(mounted)return;mounted=true;
  const fabs=document.getElementById('fabs');
  const btn=document.createElement('button');
  btn.className='aifab';btn.id='aiBtn';btn.type='button';
  btn.setAttribute('aria-label','Open SUHAS AI');
  btn.innerHTML='✨ <span>SUHAS AI</span>';
  if(fabs)fabs.prepend(btn);
  else{btn.style.cssText='position:fixed;right:16px;bottom:18px;z-index:45';document.body.appendChild(btn)}
  btn.addEventListener('click',()=>{window.location.href='ai.html'});
}
