(function(){
  var sceneTimer=null, activeVideos=[], videoIndex=0, videoEl=null, showcase=null, playlistBound=false;
  var ambientScenes=[
    {title:"SUHAS GROUP · CORPORATE OFFICE",subtitle:"A world of opportunities"},
    {title:"SUHAS GROUP · FACTORY & QUALITY",subtitle:"Quality in every detail"},
    {title:"SUHAS GROUP · MOBILITY",subtitle:"Moving forward, together"},
    {title:"SUHAS GROUP · SCHOOL & COMMUNITY",subtitle:"Building brighter futures"},
    {title:"SUHAS GROUP · FACTORY VISIT",subtitle:"People · Progress · Innovation"}
  ];
  function setSceneText(item){
    var title=document.getElementById('ambient-scene-title');
    var subtitle=document.getElementById('ambient-scene-subtitle');
    var caption=document.getElementById('ambient-caption-title');
    if(title)title.textContent=item.title;
    if(subtitle)subtitle.textContent=item.subtitle;
    if(caption)caption.textContent=item.title.replace('SUHAS GROUP · ','');
  }
  function showFallbackRotation(){
    if(sceneTimer)clearInterval(sceneTimer);
    var index=0;
    function activate(){
      var scenes=showcase?showcase.querySelectorAll('.ambient-scene'):[];
      scenes.forEach(function(scene,i){scene.classList.toggle('active',i===index);});
      setSceneText(ambientScenes[index%ambientScenes.length]);
    }
    activate();
    sceneTimer=setInterval(function(){
      if(document.hidden||showcase&&showcase.classList.contains('has-video'))return;
      index=(index+1)%ambientScenes.length;activate();
    },8000);
  }
  async function loadVideoPlaylist(){
    if(!videoEl||!showcase||playlistBound)return;
    playlistBound=true;
    try{
      var response=await fetch('assets/ambient-scenes/manifest.json?v=1',{cache:'no-store'});
      if(!response.ok)return;
      var manifest=await response.json();
      activeVideos=Array.isArray(manifest.videos)?manifest.videos.filter(function(item){
        return item&&typeof item.src==='string'&&item.src.indexOf('assets/ambient-scenes/')===0&&item.src.toLowerCase().slice(-4)==='.mp4';
      }):[];
      if(!activeVideos.length)return;
      function play(index){
        var item=activeVideos[index%activeVideos.length];
        videoEl.src=item.src;videoEl.load();
        if(item.title)setSceneText({title:item.title,subtitle:item.subtitle||'SUHAS GROUP · A world of opportunities'});
        videoEl.play().then(function(){showcase.classList.add('has-video');}).catch(function(){showcase.classList.remove('has-video');});
      }
      videoEl.addEventListener('ended',function(){videoIndex=(videoIndex+1)%activeVideos.length;play(videoIndex);});
      videoEl.addEventListener('error',function(){showcase.classList.remove('has-video');});
      play(0);
    }catch(error){/* Free CSS scene carousel remains available offline. */}
  }
  async function check(){
    showcase=document.getElementById('suhas-ambient-showcase');
    videoEl=document.getElementById('suhas-ambient-video');
    showFallbackRotation();loadVideoPlaylist();
    var onboarding=document.getElementById('new-member-onboarding');
    if(!onboarding||!window.sb||!sb.auth)return;
    try{
      var sessionResult=await sb.auth.getSession();
      var session=sessionResult.data&&sessionResult.data.session;
      if(!session){onboarding.classList.remove('active');onboarding.setAttribute('aria-hidden','true');return;}
      var profile=await sb.from('suhas_member_profiles').select('profile_complete').eq('user_id',session.user.id).maybeSingle();
      if(profile.error)throw profile.error;
      if(profile.data&&profile.data.profile_complete===true){
        onboarding.classList.remove('active');onboarding.setAttribute('aria-hidden','true');return;
      }
      onboarding.classList.add('active');onboarding.removeAttribute('aria-hidden');
      var cta=onboarding.querySelector('.create-profile-cta');
      if(cta&&!cta.dataset.sequenceBound){
        cta.dataset.sequenceBound='1';
        cta.addEventListener('click',function(event){
          event.preventDefault();
          if(cta.dataset.leaving==='1')return;
          cta.dataset.leaving='1';cta.setAttribute('aria-disabled','true');
          onboarding.classList.add('welcome-departing');
          window.setTimeout(function(){location.href=cta.href;},1900);
        });
      }
    }catch(error){console.warn('SUHAS welcome state could not be verified:',error);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check);else check();
  document.addEventListener('suhas-auth-ready',check);
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){if(sceneTimer)clearInterval(sceneTimer);return;}
    showFallbackRotation();
    if(videoEl&&showcase&&showcase.classList.contains('has-video'))videoEl.play().catch(function(){});
  });
})();