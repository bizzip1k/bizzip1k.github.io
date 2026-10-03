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
    file:'<svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6zM14 3v5h5M9 12h6M9 16h6"></path></svg>',
    user:'<svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0"></path></svg>',
    building:'<svg viewBox="0 0 24 24"><path d="M4 20V4h10v16M14 10h6v10M8 8h2M8 12h2M8 16h2"></path></svg>',
    mail:'<svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z"></path><path d="m4 8 8 6 8-6"></path></svg>',
    phone:'<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.89.33 1.76.63 2.6a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.48-1.29a2 2 0 0 1 2.11-.45c.84.3 1.71.51 2.6.63A2 2 0 0 1 22 16.92z"></path></svg>',
    arrow:'<svg viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="m13 5 7 7-7 7"></path></svg>',
    clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v6l4 2"></path></svg>',
    eye:'<svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    bookmark:'<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"></path></svg>',
    checkCircle:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="m8.5 12 2.3 2.3 4.7-4.8"></path></svg>',
    spark:'<svg viewBox="0 0 24 24"><path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"></path></svg>'
  };

  const visualMap={
    'startup':{image:'mobile-assets/notebook-clean.jpg', metric:'12.4K', icon:svg.checklist},
    'product':{image:'mobile-assets/desk-mug.jpg', metric:'9.1K', icon:svg.file},
    'brand':{image:'mobile-assets/mug-close.jpg', metric:'8.4K', icon:svg.spark},
    'marketing':{image:'mobile-assets/desk-mug.jpg', metric:'8.1K', icon:svg.search},
    'sales':{image:'mobile-assets/hero-office.jpg', metric:'7.5K', icon:svg.arrow},
    'operation':{image:'mobile-assets/mug-close.jpg', metric:'6.7K', icon:svg.building},
    'logistics':{image:'mobile-assets/notebook-clean.jpg', metric:'6.2K', icon:svg.layers},
    'data-ai':{image:'mobile-assets/hero-office.jpg', metric:'5.9K', icon:'<span class="mini-ai">AI</span>'},
    'default':{image:'mobile-assets/hero-office.jpg', metric:'5.2K', icon:svg.file}
  };
  function visualFor(key){ return visualMap[key] || visualMap.default; }

  /* Header controls */
  const navWrap=header.querySelector('.nav');
  const searchToggle=document.createElement('button');
  searchToggle.className='mobile-search-toggle'; searchToggle.type='button'; searchToggle.setAttribute('aria-label','사이트 검색'); searchToggle.innerHTML=svg.search;
  const toggle=document.createElement('button');
  toggle.className='mobile-menu-toggle'; toggle.type='button'; toggle.setAttribute('aria-label','전체 메뉴 열기'); toggle.setAttribute('aria-expanded','false'); toggle.innerHTML=svg.menu;
  navWrap.append(searchToggle,toggle);

  /* Drawer */
  const drawerItems=[
    ['index.html',svg.home,'홈','전체 구조를 빠르게 확인합니다.','mobile-nav-home'],
    ['problems.html',svg.problem,'문제별 해결','지금 겪는 문제에서 바로 시작합니다.','mobile-nav-problems'],
    ['business.html',svg.layers,'사업실무','분야별 실무 가이드와 핵심 자료를 찾습니다.','mobile-nav-business'],
    ['contents.html',svg.content,'콘텐츠','최신 글과 실전 인사이트를 확인합니다.','mobile-nav-contents'],
    ['resources.html',svg.file,'실무자료','체크리스트와 계산표를 바로 꺼내 씁니다.','mobile-nav-resources'],
    ['about.html',svg.building,'BIZZIP 소개','운영 철학과 서비스 방향을 봅니다.','mobile-nav-about'],
    ['contact.html',svg.contact,'문의','질문, 제안, 강의·컨설팅 문의를 남깁니다.','mobile-nav-contact']
  ];
  const backdrop=document.createElement('div'); backdrop.className='mobile-drawer-backdrop'; backdrop.setAttribute('aria-hidden','true');
  const drawer=document.createElement('aside'); drawer.className='mobile-drawer'; drawer.setAttribute('aria-label','모바일 전체 메뉴');
  drawer.innerHTML=`<div class="mobile-drawer-head"><img class="mobile-drawer-logo" src="bizzip-logo.png" alt="BIZZIP"><button class="mobile-drawer-close" type="button" aria-label="메뉴 닫기">×</button></div>
    <nav class="mobile-drawer-nav">${drawerItems.map(([href,icon,label,desc,klass])=>`<a class="${klass}" href="${href}"><span class="mobile-drawer-icon" aria-hidden="true">${icon}</span><span class="mobile-drawer-copy"><strong>${label}</strong><span>${desc}</span></span></a>`).join('')}</nav>
    <a class="mobile-drawer-promo" href="about.html"><span class="mobile-drawer-promo-copy"><em>비즈니스의 모든 가능성</em><strong>BIZZIP과 함께하세요.</strong></span><span class="mobile-drawer-promo-arrow">›</span></a>
    <a class="mobile-drawer-contact" href="contact.html">전문가에게 문의하기</a>`;
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

  function enhanceHomeContentCards(){
    const cards=document.querySelectorAll('.mobile-home-content-section .content-card');
    cards.forEach((card,idx)=>{
      if(card.dataset.mobileEnhanced==='1') return;
      const category=card.dataset.category || '';
      const visual=visualFor(category);
      card.dataset.mobileEnhanced='1';
      card.classList.add('has-mobile-visual');
      const visualBox=document.createElement('div');
      visualBox.className='content-card-visual';
      visualBox.style.backgroundImage=`url(${visual.image})`;
      const meta=document.createElement('div');
      meta.className='content-card-meta';
      meta.innerHTML=`<span class="meta-stat">${svg.eye}<em>${visual.metric}</em></span><span class="meta-stat">${svg.clock}<em>${(card.querySelector('.post-date')?.textContent||'').replace(/-/g,'. ')}</em></span>`;
      card.insertBefore(visualBox, card.firstChild);
      card.appendChild(meta);
    });
  }

  function buildQuickChecklist(post){
    if(!post || !post.sections) return '';
    const source = post.sections.find(s => Array.isArray(s.bullets) && s.bullets.length) || null;
    if(!source) return '';
    const items = source.bullets.slice(0,4).map(item=>`<li>${item}</li>`).join('');
    return `<div class="mobile-post-quick-card"><div class="mobile-post-quick-head"><span class="quick-icon">${svg.file}</span><strong>한눈에 보는 체크리스트</strong></div><ul>${items}</ul></div>`;
  }

  function enhancePostDetailView(){
    const hero=document.querySelector('.page-hero');
    const article=document.querySelector('#post-detail .article');
    if(!hero || !article || article.dataset.visualEnhanced==='1') return;
    article.dataset.visualEnhanced='1';
    const category=article.dataset.postCategory || (document.getElementById('post-category')?.textContent||'').trim();
    let key='default';
    Object.keys(visualMap).forEach(k=>{ if(category && (k===category || document.body.textContent.includes(k))) key=key; });
    if(article.dataset.postCategory) key=article.dataset.postCategory;
    const visual=visualFor(key);
    const summary=document.getElementById('post-summary')?.textContent || '';
    const date=document.getElementById('post-date')?.textContent || '';
    const media=document.createElement('div');
    media.className='mobile-post-hero-media';
    media.innerHTML=`<img src="${visual.image}" alt="${document.getElementById('post-title')?.textContent || 'BIZZIP 콘텐츠'}"><div class="mobile-post-media-overlay"><span>${category || 'BIZZIP INSIGHT'}</span></div>`;
    article.prepend(media);
    const quickWrap=document.createElement('div');
    quickWrap.className='mobile-post-summary-strip';
    quickWrap.innerHTML=`<div class="mobile-post-meta-pill">${svg.clock}<span>${date}</span></div><div class="mobile-post-meta-pill">${svg.bookmark}<span>저장하기</span></div>`;
    media.insertAdjacentElement('afterend',quickWrap);
    const quick=document.createElement('div');
    quick.innerHTML=buildQuickChecklist(window.__bizzipCurrentPost || {});
    if(quick.innerHTML.trim()) quickWrap.insertAdjacentElement('afterend',quick.firstElementChild);
  }

  function enhanceGuidePages(){
    const article=document.querySelector('.article');
    const pageHero=document.querySelector('.page-hero .wrap');
    if(!article || article.dataset.guideEnhanced==='1') return;
    const guideSections=article.querySelector('.biz-flex-sections');
    if(!guideSections) return;
    article.dataset.guideEnhanced='1';
    const eyebrow=(document.querySelector('.page-hero .eyebrow')?.textContent||'').trim();
    const key = (path.match(/^(startup|product|brand|marketing|sales|operation|logistics|data-ai)/)||[])[1] || 'default';
    const visual=visualFor(key);
    const summaryItems=Array.from(article.querySelectorAll('[data-kind="checklist"] .biz-section-item .biz-item-title')).slice(0,4).map(el=>el.textContent.trim()).filter(Boolean);
    if(pageHero && !document.querySelector('.mobile-guide-summary')){
      const box=document.createElement('div');
      box.className='mobile-guide-summary';
      box.innerHTML=`<div class="mobile-guide-visual"><img src="${visual.image}" alt="${eyebrow || 'BIZZIP'}"></div>
      <div class="mobile-guide-info"><div class="mobile-guide-chip">${eyebrow || 'BIZZIP GUIDE'}</div><strong>한눈에 보는 체크리스트</strong><ul>${summaryItems.slice(0,4).map(i=>`<li>${i}</li>`).join('')}</ul></div>`;
      pageHero.insertAdjacentElement('beforeend',box);
    }

    article.querySelectorAll('.biz-flex-section').forEach((section, idx)=>{
      section.classList.add('mobile-guide-block');
      section.dataset.order=String(idx+1).padStart(2,'0');
      const kind=section.dataset.kind || '';
      const title=section.querySelector('.biz-section-title');
      if(title && !title.querySelector('.mobile-order-badge')) title.insertAdjacentHTML('afterbegin', `<span class="mobile-order-badge">${String(idx+1)}</span>`);
      if(kind==='checklist' || kind==='cards' || kind==='faq' || kind==='links' || kind==='decision' || kind==='steps'){
        section.querySelectorAll('.biz-section-item').forEach((item,itemIdx)=>{
          if(kind==='steps') item.style.setProperty('--step-no', `'${itemIdx+1}'`);
        });
      }
    });
  }

  function enhanceContactPage(){
    if(path!=='contact.html') return;
    const shell=document.querySelector('.contact-shell');
    if(!shell || document.querySelector('.mobile-contact-channels')) return;
    const block=document.createElement('div');
    block.className='mobile-contact-channels';
    block.innerHTML=`<div class="mobile-contact-tabs"><button type="button" class="is-active">문의 폼</button><button type="button">카카오톡</button><button type="button">이메일</button></div>
    <div class="mobile-contact-formcard"><label>문의 유형<select><option>문의 유형을 선택해주세요.</option><option>콘텐츠 주제 제안</option><option>실무자료 요청</option><option>강의·컨설팅 문의</option></select></label><label>제목<input type="text" placeholder="문의 제목을 입력해주세요."></label><label>문의 내용<textarea placeholder="궁금한 내용을 자세히 입력해주세요.&#10;(최대 1,000자)"></textarea></label><div class="mobile-contact-tip">${svg.checkCircle}<span>빠른 답변을 위해 구체적인 내용을 작성해 주세요. 평일 기준 1~2일 내에 답변드립니다.</span></div><a class="mobile-contact-submit" href="mailto:bizzip1k@naver.com?subject=BIZZIP%20문의">문의하기</a></div>
    <div class="mobile-contact-alt"><h3>다른 방법으로도 상담할 수 있어요</h3><div class="mobile-contact-alt-grid"><a href="https://open.kakao.com/" target="_blank" rel="noopener"><span class="alt-icon kakao">톡</span><strong>카카오 상담</strong></a><a href="mailto:bizzip1k@naver.com"><span class="alt-icon mail">${svg.mail}</span><strong>이메일 문의</strong></a><a href="contact.html"><span class="alt-icon phone">${svg.phone}</span><strong>전화 문의</strong></a></div></div>`;
    const main=document.querySelector('.contact-main');
    if(main) main.insertAdjacentElement('afterend', block);
  }

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

  const homeObserver = new MutationObserver(()=>{ if(path==='index.html') enhanceHomeContentCards(); if(path==='post.html') enhancePostDetailView(); });
  document.addEventListener('DOMContentLoaded', ()=>{
    setTimeout(()=>{
      if(path==='index.html') enhanceHomeContentCards();
      if(path==='post.html') enhancePostDetailView();
      enhanceGuidePages();
      enhanceContactPage();
    }, 250);
    const homeGrid=document.querySelector('.mobile-home-content-section .content-grid, #post-detail');
    if(homeGrid) homeObserver.observe(homeGrid, {childList:true, subtree:true});
  });

  window.__bizzipMobileEnhancePost = function(post){ window.__bizzipCurrentPost = post; setTimeout(enhancePostDetailView, 60); };
})();
