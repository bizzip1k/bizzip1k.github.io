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

  const toggle=document.createElement('button');
  toggle.className='mobile-menu-toggle';
  toggle.type='button';
  toggle.setAttribute('aria-label','전체 메뉴 열기');
  toggle.setAttribute('aria-expanded','false');
  const navWrap=header.querySelector('.nav');
  navWrap.appendChild(toggle);

  const backdrop=document.createElement('div');
  backdrop.className='mobile-drawer-backdrop';
  backdrop.setAttribute('aria-hidden','true');

  const drawer=document.createElement('aside');
  drawer.className='mobile-drawer';
  drawer.setAttribute('aria-label','모바일 전체 메뉴');
  drawer.innerHTML=`
    <div class="mobile-drawer-head">
      <div class="mobile-drawer-brand">BIZZIP</div>
      <button class="mobile-drawer-close" type="button" aria-label="메뉴 닫기">×</button>
    </div>
    <nav class="mobile-drawer-nav">
      <a href="index.html">홈</a>
      <a class="mobile-nav-problems" href="problems.html">문제별 해결</a>
      <a class="mobile-nav-business" href="business.html">사업실무</a>
      <a href="contents.html">콘텐츠</a>
      <a href="resources.html">실무자료</a>
      <a href="about.html">BIZZIP 소개</a>
      <a href="contact.html">문의</a>
    </nav>
    <a class="mobile-drawer-contact" href="contact.html">전문가에게 문의하기</a>`;

  document.body.append(backdrop,drawer);
  drawer.querySelectorAll('a').forEach(a=>{
    const href=(a.getAttribute('href')||'').toLowerCase();
    if(href===current) a.setAttribute('aria-current','page');
  });

  function openMenu(){body.classList.add('mobile-menu-open');toggle.setAttribute('aria-expanded','true')}
  function closeMenu(){body.classList.remove('mobile-menu-open');toggle.setAttribute('aria-expanded','false')}
  toggle.addEventListener('click',openMenu);
  drawer.querySelector('.mobile-drawer-close').addEventListener('click',closeMenu);
  backdrop.addEventListener('click',closeMenu);
  document.addEventListener('keydown',e=>{if(e.key==='Escape') closeMenu()});

  const bottom=document.createElement('nav');
  bottom.className='mobile-bottom-nav';
  bottom.setAttribute('aria-label','모바일 빠른 메뉴');
  const items=[
    ['index.html','⌂','홈'],
    ['problems.html','⌕','문제별 해결'],
    ['business.html','▤','사업실무'],
    ['contents.html','▧','콘텐츠'],
    ['contact.html','▣','문의']
  ];
  bottom.innerHTML=items.map(([href,icon,label])=>`<a href="${href}"${href===current?' aria-current="page"':''}><span class="m-icon" aria-hidden="true">${icon}</span><span>${label}</span></a>`).join('');
  document.body.appendChild(bottom);

  // Inner/detail pages get a persistent contact action in the approved original navy tone.
  const isDetail=/^(startup|product|brand|marketing|sales|operation|logistics|data-ai)-/.test(path) || /^problem-/.test(path) || /^resource-/.test(path) || path==='post.html';
  if(isDetail){
    const main=document.querySelector('main');
    if(main){
      const cta=document.createElement('a');
      cta.href='contact.html';
      cta.className='mobile-contact-cta';
      cta.innerHTML='<span aria-hidden="true">▣</span> 전문가에게 문의하기 <span aria-hidden="true">›</span>';
      main.appendChild(cta);
    }
  }
})();
