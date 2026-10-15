'use strict';
const instruments=[
  {id:'kkwaenggwari',name:'꽹과리',alt:'둥근 놋쇠 울림판과 손잡이 끈이 있는 꽹과리'},
  {id:'janggu',name:'장구',alt:'잘록한 나무 몸통의 양쪽에 가죽 북면을 댄 장구'},
  {id:'buk',name:'북',alt:'나무 몸통 양쪽의 가죽을 끈으로 엮은 농악북'},
  {id:'jing',name:'징',alt:'넓고 둥근 놋쇠 울림판과 손잡이 끈이 있는 징'},
  {id:'sogo',name:'소고',alt:'작은 둥근 북면과 나무 손잡이가 있는 소고'},
  {id:'taepyeongso',name:'태평소',alt:'지공이 있는 나무 관대와 나팔 모양의 금속 동팔랑을 갖춘 태평소'}
];
const playIcon='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 3.5 16 10 6 16.5Z" fill="currentColor"/></svg>';
const stopIcon='<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="4" width="12" height="12" rx="1.5" fill="currentColor"/></svg>';
const miniGrid=document.querySelector('#mini-grid');
const grid=document.querySelector('#instrument-grid');
for(const instrument of instruments){
  const image=`assets/images/${instrument.id}.${instrument.id==='sogo'?'jpg':'png'}?v=3`;
  miniGrid.insertAdjacentHTML('beforeend',`<div class="mini-instrument"><img src="${image}" alt="" decoding="async"><span>${instrument.name}</span></div>`);
  grid.insertAdjacentHTML('beforeend',`<article class="instrument-card" data-instrument="${instrument.id}" aria-labelledby="name-${instrument.id}"><div class="card-top"><h2 id="name-${instrument.id}">${instrument.name}</h2><span class="playing-indicator" aria-hidden="true"><span class="sound-bars"><i></i><i></i><i></i></span><span class="playing-label">재생 중</span></span></div><div class="photo-stage"><img class="instrument-image" src="${image}" alt="${instrument.alt}" decoding="async"></div><div class="card-actions"><button class="listen-button" data-play="${instrument.id}-basic" data-name="${instrument.name}" data-kind="소리" aria-label="${instrument.name} 소리 듣기" aria-pressed="false">${playIcon}<span>소리 듣기</span></button><button class="listen-button performance" data-play="${instrument.id}-performance" data-name="${instrument.name}" data-kind="연주" aria-label="${instrument.name} 연주 듣기" aria-pressed="false">${playIcon}<span>연주 듣기</span></button></div><div class="progress-track" aria-hidden="true"><span class="progress-fill"></span></div></article>`);
}
let current=null;
const status=document.querySelector('#status');
const errorMessage=document.querySelector('#error-message');
function stopAudio(announce=true){
  if(!current)return;
  const old=current;current=null;
  old.audio.pause();old.audio.currentTime=0;
  old.audio.removeAttribute('src');old.audio.load();
  old.button.setAttribute('aria-pressed','false');
  old.button.setAttribute('aria-label',`${old.button.dataset.name} ${old.button.dataset.kind} 듣기`);
  old.button.innerHTML=playIcon+`<span>${old.button.dataset.kind} 듣기</span>`;
  old.card.classList.remove('is-playing');
  old.card.querySelector('.progress-fill').style.width='0%';
  if(announce)status.textContent='재생을 멈췄습니다.';
}
async function toggleAudio(button){
  if(current?.button===button){stopAudio();return;}
  stopAudio(false);errorMessage.hidden=true;
  const audio=new Audio(`assets/audio/${button.dataset.play}.mp3`);
  audio.preload='auto';
  const card=button.closest('.instrument-card');
  const entry={audio,button,card};current=entry;
  button.setAttribute('aria-pressed','true');
  button.setAttribute('aria-label',`${button.dataset.name} ${button.dataset.kind} 멈추기`);
  button.innerHTML=stopIcon+`<span>${button.dataset.kind} 멈추기</span>`;
  card.classList.add('is-playing');
  card.querySelector('.playing-label').textContent='불러오는 중';
  function failure(){
    if(current!==entry)return;
    stopAudio(false);
    errorMessage.textContent='소리를 불러오지 못했어요. 인터넷 연결을 확인하고 듣기 버튼을 다시 눌러 주세요.';
    errorMessage.hidden=false;
  }
  audio.addEventListener('error',failure);
  audio.addEventListener('timeupdate',()=>{
    if(current===entry&&Number.isFinite(audio.duration))card.querySelector('.progress-fill').style.width=`${Math.min(100,audio.currentTime/audio.duration*100)}%`;
  });
  audio.addEventListener('ended',()=>{if(current===entry){stopAudio(false);status.textContent=`${button.dataset.name} ${button.dataset.kind} 재생이 끝났습니다.`;}});
  try{
    await audio.play();
    if(current===entry){card.querySelector('.playing-label').textContent='재생 중';status.textContent=`${button.dataset.name} ${button.dataset.kind} 재생 중입니다.`;}
  }catch(error){if(error.name!=='AbortError')failure();}
}
function setPage(exploring,updateHistory=true){
  stopAudio();errorMessage.hidden=true;
  document.querySelector('#intro').hidden=exploring;
  document.querySelector('#explore').hidden=!exploring;
  document.querySelector('.back-button').hidden=!exploring;
  document.querySelector('.header-caption').hidden=exploring;
  if(updateHistory){history.pushState(null,'',exploring?'#explore':location.pathname+location.search);}
  window.scrollTo(0,0);
  if(exploring)document.querySelector('#explore-title').focus({preventScroll:true});
  else document.querySelector('#start').focus({preventScroll:true});
}
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-play]');
  if(button){toggleAudio(button);return;}
  // Every non-playback click, including card/photo/gap clicks, stops playback.
  stopAudio();
  if(event.target.closest('#start'))setPage(true);
  if(event.target.closest('[data-home]'))setPage(false);
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')stopAudio();});
window.addEventListener('popstate',()=>setPage(location.hash==='#explore',false));
window.addEventListener('pagehide',()=>stopAudio(false));
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio(false);});
const credits=document.querySelector('#credits');
document.querySelector('#show-credits').addEventListener('click',()=>credits.showModal());
document.querySelector('#close-credits').addEventListener('click',()=>credits.close());
credits.addEventListener('click',event=>{if(event.target===credits){const rect=credits.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)credits.close();}});
if(location.hash==='#explore')setPage(true,false);
