(function(){
'use strict';
const $=s=>document.querySelector(s);
const body=document.body;
const menuOpen=$('#menuOpen'), menuClose=$('#menuClose'), drawer=$('#drawer'), menuBackdrop=$('#menuBackdrop');
const searchOpen=$('#searchOpen'), heroSearch=$('#heroSearch'), searchClose=$('#searchClose');
const searchPanel=$('#searchPanel'), searchBackdrop=$('#searchBackdrop'), searchInput=$('#searchInput'), searchResults=$('#searchResults');

function lock(on){body.classList.toggle('locked',on)}
function openDrawer(){
  closeSearch();
  menuBackdrop.hidden=false;drawer.classList.add('open');menuBackdrop.classList.add('open');
  drawer.setAttribute('aria-hidden','false');menuOpen.setAttribute('aria-expanded','true');lock(true);
}
function closeDrawer(){
  drawer.classList.remove('open');menuBackdrop.classList.remove('open');
  drawer.setAttribute('aria-hidden','true');menuOpen.setAttribute('aria-expanded','false');
  setTimeout(()=>{menuBackdrop.hidden=true},220);lock(false);
}
function openSearch(){
  closeDrawer();
  searchBackdrop.hidden=false;searchPanel.classList.add('open');searchBackdrop.classList.add('open');
  searchPanel.setAttribute('aria-hidden','false');lock(true);
  renderSearch(searchInput.value);setTimeout(()=>searchInput.focus(),40);
}
function closeSearch(){
  searchPanel.classList.remove('open');searchBackdrop.classList.remove('open');
  searchPanel.setAttribute('aria-hidden','true');
  setTimeout(()=>{searchBackdrop.hidden=true},220);lock(false);
}
if(menuOpen&&menuClose&&drawer&&menuBackdrop){
  menuOpen.addEventListener('click',openDrawer);menuClose.addEventListener('click',closeDrawer);menuBackdrop.addEventListener('click',closeDrawer);
}
if(searchOpen)searchOpen.addEventListener('click',openSearch);
if(heroSearch)heroSearch.addEventListener('click',openSearch);
if(searchClose)searchClose.addEventListener('click',closeSearch);
if(searchBackdrop)searchBackdrop.addEventListener('click',closeSearch);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer();closeSearch()}});

const staticSearch=[
  ['사업실무','분야별 실무 가이드','business.html'],
  ['문제별 해결','지금 겪는 문제에서 시작','problems.html'],
  ['콘텐츠','BIZZIP 최신 콘텐츠','contents.html'],
  ['실무자료','체크리스트, 계산표, 가이드','resources.html'],
  ['창업 준비','사업 시작 전 준비와 검증','startup.html'],
  ['상품과 서비스','상품기획, 원가, 가격, OEM','product.html'],
  ['브랜드','브랜드명, 포지셔닝, 메시지','brand.html'],
  ['마케팅','검색, 광고, 콘텐츠, 전환','marketing.html'],
  ['판매와 유통','판매채널과 입점 실무','sales.html'],
  ['회사 운영','계약, 비용, 외주, 문서','operation.html'],
  ['물류와 재고','3PL, 재고, 포장, 반품','logistics.html'],
  ['데이터와 AI','데이터, AI, 업무 자동화','data-ai.html'],
  ['문의','BIZZIP에 문의하기','contact.html']
];
let postSearch=[];

function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function renderSearch(q){
  const term=(q||'').trim().toLowerCase();
  const source=[...staticSearch,...postSearch];
  const list=(term?source.filter(x=>(x[0]+' '+x[1]).toLowerCase().includes(term)):source.slice(0,7)).slice(0,10);
  searchResults.innerHTML=list.length
    ?list.map(x=>'<a href="'+esc(x[2])+'"><strong>'+esc(x[0])+'</strong><span>'+esc(x[1])+'</span></a>').join('')
    :'<div class="search-empty">검색 결과가 없습니다.</div>';
}
if(searchInput)searchInput.addEventListener('input',e=>renderSearch(e.target.value));

function postDate(v){
  const s=String(v||'').trim();
  if(!s)return '';
  return s.replaceAll('-','.');
}
function renderPosts(posts){
  const box=$('#latestPosts'); if(!box)return;
  const active=(posts||[]).filter(p=>!p.deleted).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,5);
  if(!active.length){box.innerHTML='<article class="content-card loading">등록된 콘텐츠가 없습니다.</article>';return}
  box.innerHTML=active.map(p=>{
    const href='post.html?id='+encodeURIComponent(p.id);
    const tag=p.categoryLabel||p.category||'BIZZIP';
    return '<a class="content-card" href="'+href+'">'
      +'<div class="content-visual">BIZZIP INSIGHT</div>'
      +'<div class="content-body"><span class="content-tag">'+esc(tag)+'</span>'
      +'<h3>'+esc(p.title)+'</h3>'
      +'<p>'+esc(p.summary||'사업 현장에서 바로 활용할 수 있는 내용을 정리했습니다.')+'</p>'
      +'<div class="content-meta">'+esc(postDate(p.date))+'</div></div></a>';
  }).join('');
}
fetch('../posts.json?v='+Date.now(),{cache:'no-store'})
  .then(r=>r.ok?r.json():Promise.reject(new Error('posts')))
  .then(posts=>{
    renderPosts(posts);
    postSearch=(posts||[]).filter(p=>!p.deleted).map(p=>[
      p.title||'',
      p.summary||'BIZZIP 콘텐츠',
      'post.html?id='+encodeURIComponent(p.id)
    ]);
  })
  .catch(()=>renderPosts([]));

renderSearch('');
})();
/* Mobile contents page */
(function(){
  const pageList=document.getElementById('contentPageList');
  if(!pageList)return;

  const chips=document.getElementById('contentTopicChips');
  const reset=document.getElementById('contentReset');
  const q=document.getElementById('contentPageSearch');
  const title=document.getElementById('contentPageTitle');
  const summary=document.getElementById('contentPageSummary');
  const count=document.getElementById('contentCount');
  let all=[];
  let active='all';

  const esc2=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const labelFor=p=>(p.categoryLabel||p.category||'').trim()||'미분류';

  function renderChips(){
    const labels=[...new Set(all.map(labelFor))];
    const ordered=['창업 준비','상품과 서비스','브랜드','마케팅','판매와 유통','회사 운영','물류와 재고','데이터와 AI','미분류']
      .filter(x=>labels.includes(x))
      .concat(labels.filter(x=>!['창업 준비','상품과 서비스','브랜드','마케팅','판매와 유통','회사 운영','물류와 재고','데이터와 AI','미분류'].includes(x)));
    chips.innerHTML=ordered.map(x=>'<button type="button" class="content-topic-chip" data-topic="'+esc2(x)+'">'+esc2(x)+'</button>').join('');
    chips.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
      active=btn.dataset.topic; q.value=''; render();
    }));
  }

  function render(){
    const term=(q.value||'').trim().toLowerCase();
    let list=all.filter(p=>active==='all'||labelFor(p)===active);
    if(term)list=list.filter(p=>((p.title||'')+' '+(p.summary||'')+' '+labelFor(p)).toLowerCase().includes(term));
    list.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));

    reset.classList.toggle('is-active',active==='all');
    chips.querySelectorAll('button').forEach(b=>b.classList.toggle('is-active',b.dataset.topic===active));
    if(term){
      title.textContent='검색 결과';
      summary.textContent='"'+q.value.trim()+'"에 대한 콘텐츠입니다.';
    }else if(active!=='all'){
      title.textContent=active;
      summary.textContent=active==='미분류'?'아직 주제가 지정되지 않은 최신 콘텐츠입니다.':'선택한 주제의 콘텐츠입니다.';
    }else{
      title.textContent='최근 콘텐츠';
      summary.textContent='최근 등록된 글부터 보여드립니다.';
    }
    count.textContent=list.length;

    pageList.innerHTML=list.length?list.map(p=>{
      const label=labelFor(p), uncl=label==='미분류'?' unclassified':'';
      return '<a class="mobile-content-item'+uncl+'" href="post.html?id='+encodeURIComponent(p.id)+'">'
        +'<div class="mobile-content-thumb"></div>'
        +'<div class="mobile-content-copy"><span class="mobile-content-topic">'+esc2(label)+'</span>'
        +'<h3>'+esc2(p.title||'제목 없음')+'</h3>'
        +'<p>'+esc2(p.summary||'BIZZIP 콘텐츠')+'</p>'
        +'<span class="mobile-content-date">'+esc2(String(p.date||'').replaceAll('-','.'))+'</span></div></a>';
    }).join(''):'<div class="mobile-content-empty">조건에 맞는 콘텐츠가 없습니다.</div>';
  }

  reset.addEventListener('click',()=>{active='all';q.value='';render()});
  q.addEventListener('input',render);

  fetch('../posts.json?v='+Date.now(),{cache:'no-store'})
    .then(r=>r.ok?r.json():Promise.reject(new Error('posts')))
    .then(posts=>{
      all=(posts||[]).filter(p=>!p.deleted);
      renderChips();render();
    })
    .catch(()=>{pageList.innerHTML='<div class="mobile-content-empty">콘텐츠를 불러오지 못했습니다.</div>';});
})();
/* Mobile resources page - reads PC resources.html as the single source of truth */
(function(){
  const box=document.getElementById('resourcePageList');
  if(!box)return;

  const chips=document.getElementById('resourceTopicChips');
  const reset=document.getElementById('resourceReset');
  const q=document.getElementById('resourcePageSearch');
  const title=document.getElementById('resourcePageTitle');
  const summary=document.getElementById('resourcePageSummary');
  const count=document.getElementById('resourceCount');
  let data=[];
  let active='all';

  const esc3=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function renderChips(){
    const topics=[...new Set(data.map(x=>x.topic))];
    chips.innerHTML=topics.map(x=>'<button type="button" class="content-topic-chip" data-topic="'+esc3(x)+'">'+esc3(x)+'</button>').join('');
    chips.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
      active=btn.dataset.topic;q.value='';render();
    }));
  }

  function render(){
    const term=(q.value||'').trim().toLowerCase();
    let list=data.filter(x=>active==='all'||x.topic===active);
    if(term)list=list.filter(x=>(x.title+' '+x.desc+' '+x.topic).toLowerCase().includes(term));

    reset.classList.toggle('is-active',active==='all');
    chips.querySelectorAll('button').forEach(b=>b.classList.toggle('is-active',b.dataset.topic===active));
    if(term){
      title.textContent='검색 결과';
      summary.textContent='"'+q.value.trim()+'"에 대한 실무자료입니다.';
    }else if(active!=='all'){
      title.textContent=active;
      summary.textContent='선택한 용도의 실무자료입니다.';
    }else{
      title.textContent='전체 실무자료';
      summary.textContent='현재 등록된 자료를 모두 보여드립니다.';
    }
    count.textContent=list.length;

    box.innerHTML=list.length?list.map(x=>
      '<article class="mobile-resource-card">'
      +'<div class="mobile-resource-card-head"><span class="mobile-resource-badge">'+esc3(x.topic)+'</span><span class="mobile-resource-format">자료</span></div>'
      +'<h3>'+esc3(x.title)+'</h3><p>'+esc3(x.desc)+'</p>'
      +'<a class="mobile-resource-link" href="'+esc3(x.href)+'">내용 보기</a></article>'
    ).join(''):'<div class="mobile-resource-empty">조건에 맞는 실무자료가 없습니다.</div>';
  }

  reset.addEventListener('click',()=>{active='all';q.value='';render()});
  q.addEventListener('input',render);

  fetch('../resources.html?v='+Date.now(),{cache:'no-store'})
    .then(r=>r.ok?r.text():Promise.reject(new Error('resources')))
    .then(html=>{
      const d=new DOMParser().parseFromString(html,'text/html');
      let topics=[];
      try{topics=JSON.parse(d.querySelector('#resource-topics-data')?.textContent||'[]')}catch(_){}
      const topicMap=Object.fromEntries((topics||[]).map(t=>[t.id,t.label]));
      data=Array.from(d.querySelectorAll('.resource-card')).map(a=>{
        const href=(a.getAttribute('href')||'').split('/').pop();
        const topicId=a.dataset.topic||'';
        const topic=(a.dataset.topicLabel||topicMap[topicId]||'미분류').trim()||'미분류';
        return {topic,title:a.querySelector('h3')?.textContent?.trim()||'자료',desc:a.querySelector('p')?.textContent?.trim()||'',href};
      }).filter(x=>x.href);
      renderChips();render();
    })
    .catch(()=>{box.innerHTML='<div class="mobile-resource-empty">실무자료를 불러오지 못했습니다.</div>';});
})();
/* Mobile dynamic post detail */
(function(){
  const body=document.getElementById('postBody');
  if(!body)return;
  const params=new URLSearchParams(location.search);
  const id=params.get('id');
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  fetch('../posts.json?v='+Date.now(),{cache:'no-store'})
    .then(r=>r.ok?r.json():Promise.reject(new Error('posts')))
    .then(posts=>{
      const p=(posts||[]).find(x=>String(x.id)===String(id)&&!x.deleted);
      if(!p)throw new Error('not-found');
      const cat=(p.categoryLabel||p.category||'BIZZIP CONTENT').trim()||'BIZZIP CONTENT';
      document.getElementById('postTitle').textContent=p.title||'콘텐츠';
      document.getElementById('postSummary').textContent=p.summary||'';
      document.getElementById('postCategory').textContent=cat;
      document.getElementById('postCrumb').textContent=p.title||'콘텐츠';
      document.getElementById('postDate').textContent=String(p.date||'').replaceAll('-','.');
      document.title=(p.title||'콘텐츠')+' | BIZZIP Mobile';
      const pc='../post.html?id='+encodeURIComponent(p.id);
      document.getElementById('postPcLink').href=pc;
      document.getElementById('postDrawerPc').href=pc;
      const sections=Array.isArray(p.sections)?p.sections:[];
      body.innerHTML=sections.length?sections.map((s,i)=>{
        const ps=(s.paragraphs||[]).map(x=>'<p>'+esc(x)+'</p>').join('');
        const bs=(s.bullets||[]).length?'<ul>'+(s.bullets||[]).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'';
        return (i?'<div class="mobile-post-divider"></div>':'')+'<section class="mobile-post-section">'
          +(s.heading?'<h2>'+esc(s.heading)+'</h2>':'')+ps+bs+'</section>';
      }).join(''):'<div class="mobile-content-empty">본문이 없습니다.</div>';
    })
    .catch(()=>{
      body.innerHTML='<div class="mobile-content-empty">콘텐츠를 찾을 수 없습니다.</div>';
      document.getElementById('postTitle').textContent='콘텐츠를 찾을 수 없습니다.';
    });
})();