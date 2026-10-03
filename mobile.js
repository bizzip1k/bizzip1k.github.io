(function(){
  'use strict';
  if (window.matchMedia && !window.matchMedia('(max-width: 768px)').matches) return;

  const body=document.body;
  const header=document.querySelector('header');
  const desktopMenu=document.querySelector('header .menu');
  if(!header || !desktopMenu) return;

  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const topMap={
    'index.html':'index.html',
    'business.html':'business.html','startup.html':'business.html','product.html':'business.html','brand.html':'business.html','marketing.html':'business.html','sales.html':'business.html','operation.html':'business.html','logistics.html':'business.html','data-ai.html':'business.html',
    'problems.html':'problems.html','problem-start.html':'problems.html','problem-price.html':'problems.html','problem-sales.html':'problems.html','problem-ads.html':'problems.html','problem-logistics.html':'problems.html','problem-documents.html':'problems.html',
    'contents.html':'contents.html','post.html':'contents.html',
    'resources.html':'resources.html','about.html':'about.html','contact.html':'contact.html'
  };
  function sectionFor(p){
    if(topMap[p]) return topMap[p];
    if(/^(startup|product|brand|marketing|sales|operation|logistics|data-ai)-/.test(p)) return 'business.html';
    if(/^resource-/.test(p)) return 'resources.html';
    return '';
  }
  const current=sectionFor(path);
  const svg={
    search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>',
    menu:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>',
    home:'<svg viewBox="0 0 24 24"><path d="m4 11 8-7 8 7v9H7v-6h10v6"></path></svg>',
    problem:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"></circle><path d="m20 20-4.5-4.5"></path></svg>',
    business:'<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"></path></svg>',
    content:'<svg viewBox="0 0 24 24"><path d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h4"></path></svg>',
    contact:'<svg viewBox="0 0 24 24"><path d="M4 5h16v12H8l-4 3zM8 10h.01M12 10h.01M16 10h.01"></path></svg>',
    layers:'<svg viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"></path></svg>',
    checklist:'<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5zM8 8l1.5 1.5L12 7M13 9h3M8 14l1.5 1.5L12 13M13 15h3"></path></svg>',
    file:'<svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6zM14 3v5h5M9 12h6M9 16h6"></path></svg>'
  };

  /* Header controls */
  const navWrap=header.querySelector('.nav');
  const searchToggle=document.createElement('button');
  searchToggle.className='mobile-search-toggle'; searchToggle.type='button'; searchToggle.setAttribute('aria-label','사이트 검색'); searchToggle.innerHTML=svg.search;
  const toggle=document.createElement('button');
  toggle.className='mobile-menu-toggle'; toggle.type='button'; toggle.setAttribute('aria-label','전체 메뉴 열기'); toggle.setAttribute('aria-expanded','false'); toggle.innerHTML=svg.menu;
  navWrap.append(searchToggle,toggle);

  /* Drawer */
  const backdrop=document.createElement('div'); backdrop.className='mobile-drawer-backdrop'; backdrop.setAttribute('aria-hidden','true');
  const drawer=document.createElement('aside'); drawer.className='mobile-drawer'; drawer.setAttribute('aria-label','모바일 전체 메뉴');
  drawer.innerHTML=`<div class="mobile-drawer-head"><div class="mobile-drawer-brand">BIZZIP</div><button class="mobile-drawer-close" type="button" aria-label="메뉴 닫기">×</button></div>
    <nav class="mobile-drawer-nav">
      <a href="index.html">홈</a><a class="mobile-nav-problems" href="problems.html">문제별 해결</a><a class="mobile-nav-business" href="business.html">사업실무</a><a href="contents.html">콘텐츠</a><a href="resources.html">실무자료</a><a href="about.html">BIZZIP 소개</a><a href="contact.html">문의</a>
    </nav><a class="mobile-drawer-contact" href="contact.html">전문가에게 문의하기</a>`;
  document.body.append(backdrop,drawer);
  drawer.querySelectorAll('a').forEach(a=>{if((a.getAttribute('href')||'').toLowerCase()===current) a.setAttribute('aria-current','page')});
  function openMenu(){closeSearch();body.classList.add('mobile-menu-open');toggle.setAttribute('aria-expanded','true')}
  function closeMenu(){body.classList.remove('mobile-menu-open');toggle.setAttribute('aria-expanded','false')}
  toggle.addEventListener('click',openMenu); drawer.querySelector('.mobile-drawer-close').addEventListener('click',closeMenu); backdrop.addEventListener('click',closeMenu);

  /* Search panel */
  const searchBackdrop=document.createElement('div'); searchBackdrop.className='mobile-search-backdrop'; searchBackdrop.setAttribute('aria-hidden','true');
  const searchPanel=document.createElement('section'); searchPanel.className='mobile-search-panel'; searchPanel.setAttribute('aria-label','BIZZIP 검색');
  searchPanel.innerHTML=`<div class="mobile-search-head"><div class="mobile-search-box">${svg.search}<input class="mobile-search-input" type="search" placeholder="궁금한 내용을 검색해보세요." aria-label="검색어 입력"></div><button class="mobile-search-close" type="button" aria-label="검색 닫기">×</button></div><div class="mobile-search-results"></div>`;
  document.body.append(searchBackdrop,searchPanel);
  const searchInput=searchPanel.querySelector('.mobile-search-input'); const searchResults=searchPanel.querySelector('.mobile-search-results');
  const staticSearch=[
    ['사업실무','사업 분야별 실무 가이드','business.html'],['문제별 해결','지금 겪는 문제에서 시작하기','problems.html'],['콘텐츠','BIZZIP 실전 콘텐츠','contents.html'],['실무자료','체크리스트, 계산표, 가이드','resources.html'],['창업 준비','사업 시작 전 준비와 검증','startup.html'],['상품과 서비스','상품기획, 원가, 가격, OEM','product.html'],['브랜드','브랜드명, 포지셔닝, 메시지','brand.html'],['마케팅','검색, 광고, 콘텐츠, 전환','marketing.html'],['판매와 유통','판매채널과 입점 실무','sales.html'],['회사 운영','계약, 비용, 외주, 문서','operation.html'],['물류와 재고','3PL, 재고, 포장, 반품','logistics.html'],['데이터와 AI','데이터, AI, 업무 자동화','data-ai.html'],['문의','BIZZIP에 문의하기','contact.html']
  ];
  let postSearch=[];
  fetch('posts.json?v='+Date.now()).then(r=>r.ok?r.json():[]).then(posts=>{postSearch=(posts||[]).filter(p=>!p.deleted).map(p=>[p.title||'',p.summary||'콘텐츠','post.html?id='+encodeURIComponent(p.id)])}).catch(()=>{});
  function renderSearch(q){
    const query=(q||'').trim().toLowerCase();
    let list=query?[...staticSearch,...postSearch].filter(x=>(x[0]+' '+x[1]).toLowerCase().includes(query)).slice(0,10):staticSearch.slice(0,7);
    searchResults.innerHTML=list.length?list.map(x=>`<a href="${x[2]}"><strong>${x[0]}</strong><span>${x[1]}</span></a>`).join(''):'<div class="mobile-search-empty">검색 결과가 없습니다.</div>';
  }
  function openSearch(){closeMenu();body.classList.add('mobile-search-open');renderSearch(searchInput.value);setTimeout(()=>searchInput.focus(),50)}
  function closeSearch(){body.classList.remove('mobile-search-open')}
  searchToggle.addEventListener('click',openSearch); searchBackdrop.addEventListener('click',closeSearch); searchPanel.querySelector('.mobile-search-close').addEventListener('click',closeSearch); searchInput.addEventListener('input',e=>renderSearch(e.target.value));

  /* Bottom nav */
  const bottom=document.createElement('nav'); bottom.className='mobile-bottom-nav'; bottom.setAttribute('aria-label','모바일 빠른 메뉴');
  const items=[['index.html',svg.home,'홈'],['problems.html',svg.problem,'문제별 해결'],['business.html',svg.business,'사업실무'],['contents.html',svg.content,'콘텐츠'],['contact.html',svg.contact,'문의']];
  bottom.innerHTML=items.map(([href,icon,label])=>`<a href="${href}"${href===current?' aria-current="page"':''}><span class="m-icon" aria-hidden="true">${icon}</span><span>${label}</span></a>`).join('');
  document.body.appendChild(bottom);

  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();closeSearch()}});

  /* Home-only restructuring: uses the same original content/links, only changes mobile presentation. */
  if(path==='index.html'){
    const hero=document.querySelector('.hero .wrap');
    if(hero){
      const p=hero.querySelector('p');
      const btn=document.createElement('button'); btn.type='button'; btn.className='mobile-hero-search'; btn.innerHTML=svg.search+'<span>궁금한 내용을 검색해보세요.</span>'; btn.addEventListener('click',openSearch); if(p) p.insertAdjacentElement('afterend',btn);
    }
    const actions=document.querySelector('.mobile-primary-actions');
    if(actions){
      const links=actions.querySelectorAll('a');
      if(links[0]){const icon=links[0].querySelector('.mobile-action-icon');if(icon) icon.innerHTML=svg.checklist}
      if(links[1]){const icon=links[1].querySelector('.mobile-action-icon');if(icon) icon.innerHTML=svg.layers}
    }
    const sections=Array.from(document.querySelectorAll('main>section'));
    const problemSection=sections.find(s=>/문제부터 찾아도 됩니다/.test(s.textContent||'')); if(problemSection) problemSection.classList.add('mobile-home-problem-section');
    const contentSection=sections.find(s=>/최근 BIZZIP 콘텐츠/.test(s.textContent||'')); if(contentSection) contentSection.classList.add('mobile-home-content-section');

    if(contentSection){
      const resources=document.createElement('section'); resources.className='mobile-home-resources';
      resources.innerHTML=`<div class="wrap"><div class="section-head"><h2>실무자료</h2><p>사업할 때 바로 꺼내 쓸 수 있는 체크리스트와 가이드입니다.</p></div><div class="mobile-resource-list">
        <a class="mobile-resource-item" href="resource-start-check.html"><span class="mobile-resource-icon">${svg.checklist}</span><span class="mobile-resource-copy"><strong>사업 시작 체크리스트</strong><span>시작 전에 놓치기 쉬운 준비항목 점검</span></span></a>
        <a class="mobile-resource-item" href="resource-pricing.html"><span class="mobile-resource-icon">${svg.file}</span><span class="mobile-resource-copy"><strong>원가·판매가 계산표</strong><span>제품 한 개가 팔릴 때 실제 수익 확인</span></span></a>
        <a class="mobile-resource-item" href="resource-oem.html"><span class="mobile-resource-icon">${svg.file}</span><span class="mobile-resource-copy"><strong>OEM 견적 확인 가이드</strong><span>단가 외에 꼭 확인할 항목 정리</span></span></a>
      </div><a class="mobile-section-more" href="resources.html">실무자료 전체보기 →</a></div>`;
      contentSection.insertAdjacentElement('afterend',resources);
      const contact=document.createElement('section'); contact.className='mobile-home-contact'; contact.innerHTML=`<div class="wrap"><a class="mobile-home-contact-card" href="contact.html"><span class="mobile-contact-mark">${svg.contact}</span><span><strong>궁금한 점이 있으신가요?</strong><span>BIZZIP 문의에서 편하게 질문해주세요.</span></span></a></div>`; resources.insertAdjacentElement('afterend',contact);
    }
  }

  /* Detail-page persistent CTA in original navy. */
  const isDetail=/^(startup|product|brand|marketing|sales|operation|logistics|data-ai)-/.test(path)||/^problem-/.test(path)||/^resource-/.test(path)||path==='post.html';
  if(isDetail){const main=document.querySelector('main');if(main){const cta=document.createElement('a');cta.href='contact.html';cta.className='mobile-contact-cta';cta.innerHTML=svg.contact+' 전문가에게 문의하기 <span aria-hidden="true">›</span>';main.appendChild(cta)}}
})();
