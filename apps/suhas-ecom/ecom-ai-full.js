// SUHAS E-COM full-screen AI: copied from the SUHAS GROUP chat experience and adapted for guest E-COM use.
(function(){
  const API='https://ehvgxbifqtyajeersnvq.supabase.co/functions/v1/ecom-assistant';
  const $=id=>document.getElementById(id);
  const log=$('log'),form=$('form'),input=$('prompt'),send=$('send'),status=$('status'),fileInput=$('files'),fileList=$('files-list');
  const historyPanel=$('history'),historyToggle=$('history-toggle'),newChat=$('new-chat');
  const voiceOverlay=$('voice-overlay'),voiceOrb=$('voice-orb'),voiceCaption=$('voice-caption'),voiceSubtitle=$('voice-subtitle');
  const storeKey='suhas-ecom-ai-conversations-v1';
  const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const format=s=>escapeHtml(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  let chats=[];try{const x=JSON.parse(localStorage.getItem(storeKey)||'[]');if(Array.isArray(x))chats=x;}catch(_){}
  let activeId=null,messages=[],pending=[],busy=false,liveMode=false,recognition=null,recognitionActive=false,speaking=false;
  function setStatus(t){status.textContent=t||'';}
  function saveChats(){
    if(!activeId)return;
    const i=chats.findIndex(c=>c.id===activeId);
    const chat={id:activeId,title:(messages.find(m=>m.role==='user')?.content||'New conversation').slice(0,64),updated:Date.now(),messages:messages.slice(-60)};
    if(i>=0)chats[i]=chat;else chats.unshift(chat);
    chats.sort((a,b)=>b.updated-a.updated);chats=chats.slice(0,25);
    try{localStorage.setItem(storeKey,JSON.stringify(chats));}catch(_){setStatus('Chat history storage is full on this device.');}
    renderHistory();
  }
  function bubble(text,role,files){
    const d=document.createElement('div');d.className='ai-bubble '+(role==='user'?'user':'bot');
    d.innerHTML=format(text||'');
    (files||[]).forEach(f=>{if(f.kind==='image'&&f.dataUrl){const im=document.createElement('img');im.src=f.dataUrl;im.alt=f.name||'Attached image';d.appendChild(im);}else{const p=document.createElement('div');p.textContent=(f.kind==='audio'?'🎧 ':'📎 ')+(f.name||'Attachment');d.appendChild(p);}});
    log.appendChild(d);log.scrollTop=log.scrollHeight;return d;
  }
  function renderMessages(){
    log.innerHTML='';
    if(!messages.length)bubble('Hello! I am SUHAS AI. Ask me about SUHAS E-COM or any general topic. You can write in Bangla, Banglish, English or another language.','bot');
    messages.forEach(m=>bubble(m.content,m.role,m.files||[]));
  }
  function renderHistory(){
    historyPanel.innerHTML='';
    if(!chats.length){const p=document.createElement('div');p.textContent='No saved chats on this device yet.';p.style.cssText='padding:12px;color:#78869a;font-size:12px';historyPanel.appendChild(p);return;}
    chats.forEach(c=>{const b=document.createElement('button');b.type='button';b.textContent=c.title||'New conversation';b.addEventListener('click',()=>{activeId=c.id;messages=Array.isArray(c.messages)?c.messages:[];renderMessages();historyPanel.hidden=true;historyToggle.setAttribute('aria-expanded','false');setStatus('Conversation restored from this device.');});historyPanel.appendChild(b);});
  }
  function startNewChat(){activeId='chat-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);messages=[];renderMessages();historyPanel.hidden=true;historyToggle.setAttribute('aria-expanded','false');setStatus('New conversation started.');input.focus();}
  newChat.addEventListener('click',startNewChat);
  historyToggle.addEventListener('click',()=>{historyPanel.hidden=!historyPanel.hidden;historyToggle.setAttribute('aria-expanded',String(!historyPanel.hidden));if(!historyPanel.hidden)renderHistory();});
  document.querySelectorAll('.ai-suggest [data-prompt]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.prompt||'';form.requestSubmit();}));
  $('attach').addEventListener('click',()=>fileInput.click());
  function renderFiles(){fileList.innerHTML='';pending.forEach((f,i)=>{const chip=document.createElement('span');chip.className='ai-file';chip.textContent=f.name+' ';const x=document.createElement('button');x.type='button';x.textContent='×';x.style.cssText='border:0;background:transparent;color:#64748b';x.addEventListener('click',()=>{pending.splice(i,1);renderFiles();});chip.appendChild(x);fileList.appendChild(chip);});}
  function readData(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error('Could not read '+file.name));r.readAsDataURL(file);});}
  fileInput.addEventListener('change',async()=>{
    const files=Array.from(fileInput.files||[]);fileInput.value='';
    for(const f of files){
      if(pending.length>=4){setStatus('You can attach up to 4 files per message.');break;}
      if(f.size>6*1024*1024){setStatus('Each image or audio file must be under 6 MB.');continue;}
      try{
        if(f.type.startsWith('image/')||f.type.startsWith('audio/'))pending.push({name:f.name,mime:f.type,dataUrl:await readData(f),kind:f.type.startsWith('image/')?'image':'audio'});
        else if(/\.(txt|md|csv)$/i.test(f.name)){const text=await f.text();input.value=(input.value+'\n\n[Attached text file: '+f.name+']\n'+text.slice(0,12000)).trim();}
        else{setStatus('Supported files: images, voice recordings, TXT, MD and CSV.');}
      }catch(e){setStatus(e.message||'File could not be read.');}
    }
    renderFiles();
  });
  function myOrders(){try{const a=JSON.parse(localStorage.getItem('suhas-ecom-my-orders-v1')||'[]');return Array.isArray(a)?a.slice(0,5).map(o=>({code:o.code,phone:o.phone})):[];}catch(_){return[];}}
  async function parseResponse(response,wait){
    const ct=response.headers.get('content-type')||'';
    if(ct.includes('text/event-stream')&&response.body){
      const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',answer='';
      while(true){
        const part=await reader.read();if(part.done)break;
        buffer+=decoder.decode(part.value,{stream:true});
        const lines=buffer.split(/\r?\n/);buffer=lines.pop()||'';
        for(const line of lines){
          if(!line.startsWith('data:'))continue;const payload=line.slice(5).trim();if(!payload||payload==='[DONE]')continue;
          try{const event=JSON.parse(payload);const delta=(event?.candidates?.[0]?.content?.parts||[]).map(x=>x?.text||'').join('');if(delta){answer+=delta;wait.textContent=answer;log.scrollTop=log.scrollHeight;}}catch(_){}
        }
      }
      return answer.trim();
    }
    const d=await response.json().catch(()=>({}));if(!response.ok)throw new Error(d.error||'SUHAS AI request failed ('+response.status+').');return String(d.output||'').trim();
  }
  async function submitMessage(prompt,attachments,autoSpeak){
    if(busy)return;
    const docs=attachments.filter(x=>x.kind==='document').map(x=>'\n\n[Attached document: '+x.name+']\n'+x.text).join('');
    const finalPrompt=(prompt+docs).slice(0,14000);
    if(!finalPrompt.trim()&&!attachments.length)return;
    busy=true;send.disabled=true;send.textContent='…';
    if(!activeId)activeId='chat-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);
    messages.push({role:'user',content:finalPrompt||'Please inspect the attached image or voice message and reply in the same language.',files:attachments.map(f=>({name:f.name,kind:f.kind}))});
    bubble(finalPrompt||'Please review the attachment.', 'user',attachments);saveChats();
    const wait=bubble('Thinking…','bot');setStatus('SUHAS AI is preparing a reply…');
    try{
      const total=attachments.reduce((n,f)=>n+(f.dataUrl?Math.floor(f.dataUrl.length*.75):0),0);
      if(total>8*1024*1024)throw new Error('Total attachments must be under 8 MB.');
      const response=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:finalPrompt,history:messages.slice(-8,-1).map(m=>({role:m.role,content:m.content})),orders:myOrders(),attachments:attachments.filter(f=>f.dataUrl).map(f=>({name:f.name,mime:f.mime,dataUrl:f.dataUrl}))}),signal:AbortSignal.timeout(45000)});
      if(!response.ok&&!(response.headers.get('content-type')||'').includes('application/json'))throw new Error('AI server returned HTTP '+response.status);
      const answer=await parseResponse(response,wait);if(!answer)throw new Error('SUHAS AI returned an empty response. Please try again.');
      wait.remove();bubble(answer,'bot');messages.push({role:'assistant',content:answer});saveChats();setStatus('');
      if(autoSpeak||liveMode)speakReply(answer);
    }catch(e){wait.remove();bubble((e.message||'AI request failed.')+' Please try again.','bot');setStatus('');}
    finally{busy=false;send.disabled=false;send.textContent='Send';input.focus();if(liveMode&&!speaking)setTimeout(startLiveRecognition,350);}
  }
  form.addEventListener('submit',e=>{e.preventDefault();const q=input.value.trim();const files=pending.slice();pending=[];renderFiles();input.value='';submitMessage(q,files,false);});
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
  function detectSpeechLang(text){
    if(/[ঀ-৿]/.test(text))return'bn-BD';if(/[\u0600-\u06FF]/.test(text))return'ar-SA';if(/[\u0900-\u097F]/.test(text))return'hi-IN';if(/[\u4E00-\u9FFF]/.test(text))return'zh-CN';if(/[\u0400-\u04FF]/.test(text))return'ru-RU';return' en-US'.trim();
  }
  function setVoiceStage(stage,title,sub){voiceOrb.className='voice-orb '+stage;voiceCaption.textContent=title;voiceSubtitle.textContent=sub||'';}
  function stopRecognition(){if(recognition&&recognitionActive){try{recognition.stop();}catch(_){}}recognitionActive=false;}
  function makeRecognition(continuous){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return null;
    const r=new SR();const selected=$('voice-language').value;r.lang=selected==='auto'?(navigator.language||'en-US'):selected;r.interimResults=false;r.maxAlternatives=1;r.continuous=!!continuous;
    r.onstart=()=>{recognitionActive=true;setStatus(liveMode?'Live voice: listening…':'Listening…');if(liveMode)setVoiceStage('listening','Listening…','Speak naturally. SUHAS AI is listening.');};
    r.onresult=e=>{const transcript=Array.from(e.results).map(x=>x[0]?.transcript||'').join(' ').trim();if(!transcript)return;if(liveMode){stopRecognition();setVoiceStage('thinking','Thinking…','Preparing your answer…');submitMessage(transcript,[],true);}else{input.value=(input.value+' '+transcript).trim();input.focus();setStatus('Voice converted to text. Press Send to submit.');}};
    r.onerror=e=>{recognitionActive=false;if(e.error==='not-allowed'||e.error==='service-not-allowed'){setStatus('Microphone permission blocked. Allow microphone access for this site, then reload.');if(liveMode)endLiveVoice();}else if(e.error!=='no-speech')setStatus('Voice input error: '+e.error);};
    r.onend=()=>{recognitionActive=false;if(liveMode&&!speaking&&!busy)setTimeout(startLiveRecognition,300);};
    return r;
  }
  function startOneShot(){if(!window.SpeechRecognition&&!window.webkitSpeechRecognition){setStatus('Voice input is not supported in this browser. Try Chrome.');return;}stopRecognition();recognition=makeRecognition(false);try{recognition.start();}catch(_){setStatus('Could not start voice input. Try again.');}}
  function startLiveRecognition(){if(!liveMode||speaking||busy||recognitionActive)return;if(!recognition)recognition=makeRecognition(true);try{recognition.start();}catch(_){setTimeout(()=>{if(liveMode&&!recognitionActive&&!speaking&&!busy)try{recognition.start();}catch(__){}},250);}}
  function splitSpeech(text){return String(text||'').replace(/https?:\/\/\S+/g,'link').split(/(?<=[.!?।])\s+/).flatMap(s=>{const a=[];while(s.length>170){let n=s.lastIndexOf(' ',170);if(n<60)n=150;a.push(s.slice(0,n));s=s.slice(n).trim();}if(s)a.push(s);return a;});}
  let speechQueue=[];
  function speakNext(){if(!speechQueue.length){speaking=false;if(liveMode)setTimeout(startLiveRecognition,250);return;}const part=speechQueue.shift();const u=new SpeechSynthesisUtterance(part);u.lang=detectSpeechLang(part);u.rate=1.03;u.onstart=()=>{speaking=true;if(liveMode)setVoiceStage('speaking','SUHAS AI is speaking…','You can speak again after the reply.');};u.onend=speakNext;u.onerror=()=>{speaking=false;speechQueue=[];if(liveMode)setTimeout(startLiveRecognition,250);};speechSynthesis.speak(u);}
  function speakReply(text){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();speechQueue=splitSpeech(text);speaking=true;speakNext();}
  $('voice-input').addEventListener('click',startOneShot);
  async function startLiveVoice(){
    if(!navigator.mediaDevices?.getUserMedia){setStatus('Microphone is unavailable in this browser.');return;}
    try{const s=await navigator.mediaDevices.getUserMedia({audio:true});s.getTracks().forEach(t=>t.stop());}
    catch(e){setStatus(e.name==='NotAllowedError'?'Microphone permission denied. Allow it in browser site settings and retry.':'Could not access microphone.');return;}
    if(!window.SpeechRecognition&&!window.webkitSpeechRecognition){setStatus('Live voice is not supported in this browser. Try Chrome.');return;}
    liveMode=true;voiceOverlay.classList.add('open');$('voice-mode').classList.add('live');setVoiceStage('listening','Listening…','Speak naturally. SUHAS AI will reply in your language.');recognition=makeRecognition(true);startLiveRecognition();
  }
  function endLiveVoice(){liveMode=false;stopRecognition();recognition=null;speechSynthesis?.cancel();speechQueue=[];speaking=false;voiceOverlay.classList.remove('open');$('voice-mode').classList.remove('live');setStatus('Live voice conversation ended.');}
  $('voice-mode').addEventListener('click',()=>{if(liveMode)endLiveVoice();else startLiveVoice();});
  $('voice-end').addEventListener('click',endLiveVoice);$('voice-close').addEventListener('click',endLiveVoice);
  window.addEventListener('pagehide',()=>{if(liveMode)endLiveVoice();});
  if(!activeId)startNewChat();else renderHistory();
})();