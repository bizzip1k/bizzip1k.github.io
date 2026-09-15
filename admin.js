const CONFIG={owner:"bizzip1k",repo:"bizzip1k.github.io",branch:"main",posts:"posts.json",downloads:"downloads"};
const $=id=>document.getElementById(id);
let token="";
const state={
  structure:{sha:"",html:"",menus:[],sections:[]},
  business:{landingSha:"",landingHtml:"",categories:[],selectedCat:-1,cat:{sha:"",html:"",topics:[]},detail:{sha:"",html:"",path:"",steps:[]}},
  problems:{landingSha:"",landingHtml:"",roots:[],selectedRoot:-1,page:{sha:"",html:"",subs:[],path:""}},
  contents:{landingSha:"",landingHtml:"",postsSha:"",posts:[],editIndex:-1},
  resources:{landingSha:"",landingHtml:"",cards:[],selected:-1,detail:{sha:"",html:"",path:""}},
  about:{sha:"",html:"",consulting:[],brands:[],books:[]},
  contact:{sha:"",html:"",types:[]},
  files:[]
};

function status(id,msg,type="info"){const el=$(id);if(!el)return;el.textContent=msg;el.className=`status show ${type}`}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function lines(s=""){return String(s).split(/\r?\n/).map(x=>x.trim()).filter(Boolean)}
function b64decode(s){const bin=atob((s||"").replace(/\n/g,""));const a=Uint8Array.from(bin,c=>c.charCodeAt(0));return new TextDecoder().decode(a)}
function b64encode(s){const a=new TextEncoder().encode(s);let bin="";for(let i=0;i<a.length;i+=0x8000)bin+=String.fromCharCode(...a.subarray(i,i+0x8000));return btoa(bin)}
function today(){const d=new Date(Date.now()-new Date().getTimezoneOffset()*60000);return d.toISOString().slice(0,10)}
function docOf(html){return new DOMParser().parseFromString(html,"text/html")}
function htmlOf(doc){return "<!doctype html>\n"+doc.documentElement.outerHTML}
function txt(root,sel){return root?.querySelector(sel)?.textContent?.trim()||""}
function setTxt(root,sel,val){const x=root?.querySelector(sel);if(x)x.textContent=val}
function githubHeaders(){return{"Accept":"application/vnd.github+json","Authorization":`Bearer ${token}`,"X-GitHub-Api-Version":"2022-11-28"}}
async function api(path,opt={}){const r=await fetch(`https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}?ref=${CONFIG.branch}`,{...opt,headers:{...githubHeaders(),...(opt.headers||{})}});if(!r.ok){const t=await r.text();throw new Error(`${r.status} ${t.slice(0,180)}`)}return r.json()}
async function getFile(path){return api(path)}
async function putFile(path,text,sha,message){return api(path,{method:"PUT",body:JSON.stringify({message,content:b64encode(text),sha:sha||undefined,branch:CONFIG.branch})})}
async function deleteFile(path,sha,message){return api(path,{method:"DELETE",body:JSON.stringify({message,sha,branch:CONFIG.branch})})}
async function putBytes(path,bytes,sha,message){let bin="";for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return api(path,{method:"PUT",body:JSON.stringify({message,content:btoa(bin),sha:sha||undefined,branch:CONFIG.branch})})}

document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>openPanel(b.dataset.panel)));
function openPanel(name){
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.panel===name));
  document.querySelectorAll(".panel").forEach(x=>x.classList.toggle("active",x.id===`panel-${name}`));
  window.scrollTo({top:0,behavior:"smooth"});
}
function bindInputs(ids,fn){ids.forEach(id=>$(id)?.addEventListener("input",fn))}

$("connectBtn").addEventListener("click",async()=>{
  token=$("token").value.trim();if(!token)return status("globalStatus","GitHub token을 입력해주세요.","err");
  status("globalStatus","GitHub에 연결하고 각 메뉴를 독립적으로 불러오는 중입니다…","info");
  const loaders=[
    ["사이트 구조",loadStructure],["사업실무",loadBusiness],["문제별 해결",loadProblems],
    ["콘텐츠",loadContents],["실무자료",loadResources],["BIZZIP 소개",loadAbout],["문의",loadContact],["첨부파일",loadFiles]
  ];
  const errors=[];
  for(const [name,fn] of loaders){try{await fn()}catch(e){console.error(name,e);errors.push(`${name}: ${e.message}`)}}
  if(errors.length)status("globalStatus",`연결되었습니다. ${8-errors.length}개 메뉴 정상 / ${errors.length}개 메뉴 점검 필요. 한 메뉴의 오류는 다른 메뉴에 영향을 주지 않습니다.`,"ok");
  else status("globalStatus","연결되었습니다. 모든 관리자 메뉴를 정상적으로 불러왔습니다.","ok");
});

/* =========================
   SITE STRUCTURE / HOME
========================= */
async function loadStructure(){
  const d=await getFile("index.html"),html=b64decode(d.content),doc=docOf(html);
  state.structure.sha=d.sha;state.structure.html=html;
  $("homeEyebrow").value=txt(doc,".hero .eyebrow");
  $("homeTitle").value=txt(doc,".hero h1");
  $("homeSummary").value=txt(doc,".hero p");
  const nav=doc.querySelector(".menu");
  state.structure.menus=Array.from(nav?.querySelectorAll("a")||[]).map(a=>({label:a.textContent.trim(),href:a.getAttribute("href")||""}));
  const secs=Array.from(doc.querySelectorAll("main > section"));
  state.structure.sections=secs.map((s,i)=>({id:i,title:i===0?"메인 HERO":txt(s,".section-head h2")||`섹션 ${i+1}`,html:s.outerHTML,visible:true}));
  renderTopMenus();renderHomeSections();renderStructurePreview();$("saveStructure").disabled=false;
}
function renderTopMenus(){
  $("topMenuCards").innerHTML=state.structure.menus.map((m,i)=>`<div class="h-card" data-i="${i}">
    <input class="input tm-label" value="${esc(m.label)}"><input class="input tm-href" value="${esc(m.href)}">
    <div class="h-actions"><button class="btn light mini tm-left">←</button><button class="btn light mini tm-right">→</button><button class="btn danger mini tm-del">삭제</button></div></div>`).join("");
  $("topMenuCards").querySelectorAll(".h-card").forEach(row=>{
    const i=+row.dataset.i;const sync=()=>{state.structure.menus[i].label=row.querySelector(".tm-label").value;state.structure.menus[i].href=row.querySelector(".tm-href").value;renderStructurePreview()};
    row.querySelectorAll("input").forEach(x=>x.addEventListener("input",sync));
    row.querySelector(".tm-left").onclick=()=>move(state.structure.menus,i,-1,renderTopMenus,renderStructurePreview);
    row.querySelector(".tm-right").onclick=()=>move(state.structure.menus,i,1,renderTopMenus,renderStructurePreview);
    row.querySelector(".tm-del").onclick=()=>{state.structure.menus.splice(i,1);renderTopMenus();renderStructurePreview()};
  });
}
$("addTopMenu").onclick=()=>{state.structure.menus.push({label:"새 메뉴",href:"new-page.html"});renderTopMenus();renderStructurePreview()};
function renderHomeSections(){
  $("homeSectionCards").innerHTML=state.structure.sections.map((s,i)=>`<div class="h-card"><strong>${esc(s.title)}</strong><div class="h-actions" style="margin-top:8px"><button class="btn light mini sec-left" data-i="${i}">←</button><button class="btn light mini sec-right" data-i="${i}">→</button><label class="hint"><input type="checkbox" class="sec-vis" data-i="${i}" ${s.visible?"checked":""}> 표시</label></div></div>`).join("");
  document.querySelectorAll(".sec-left").forEach(b=>b.onclick=()=>move(state.structure.sections,+b.dataset.i,-1,renderHomeSections,renderStructurePreview));
  document.querySelectorAll(".sec-right").forEach(b=>b.onclick=()=>move(state.structure.sections,+b.dataset.i,1,renderHomeSections,renderStructurePreview));
  document.querySelectorAll(".sec-vis").forEach(b=>b.onchange=()=>{state.structure.sections[+b.dataset.i].visible=b.checked;renderStructurePreview()});
}
function renderStructurePreview(){
  const visible=state.structure.sections.filter(x=>x.visible);
  $("structurePreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">${esc($("homeEyebrow").value)}</div><h1>${esc($("homeTitle").value).replace(/\n/g,"<br>")}</h1><p>${esc($("homeSummary").value)}</p></div>
  <div class="pv-section"><strong>상단 메뉴</strong><div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">${state.structure.menus.map(x=>`<span class="btn light mini">${esc(x.label)}</span>`).join("")}</div></div>
  ${visible.filter(x=>x.title!=="메인 HERO").map(x=>`<div class="pv-section"><strong>${esc(x.title)}</strong><p class="hint">홈 랜딩 섹션</p></div>`).join("")}`;
}
bindInputs(["homeEyebrow","homeTitle","homeSummary"],renderStructurePreview);
$("saveStructure").onclick=async()=>{
  try{
    const doc=docOf(state.structure.html);
    setTxt(doc,".hero .eyebrow",$("homeEyebrow").value);setTxt(doc,".hero h1",$("homeTitle").value);setTxt(doc,".hero p",$("homeSummary").value);
    const nav=doc.querySelector(".menu");if(nav){nav.innerHTML="";state.structure.menus.forEach(m=>{const a=doc.createElement("a");a.href=m.href;a.textContent=m.label;nav.appendChild(a)})}
    const main=doc.querySelector("main"),existing=Array.from(main.children);
    const hero=state.structure.sections.find(x=>x.title==="메인 HERO");
    const order=state.structure.sections.filter(x=>x.visible);
    main.innerHTML="";
    order.forEach(s=>{if(s.title==="메인 HERO"){const sec=docOf(hero.html).querySelector("section");setTxt(sec,".eyebrow",$("homeEyebrow").value);setTxt(sec,"h1",$("homeTitle").value);setTxt(sec,"p",$("homeSummary").value);main.appendChild(doc.importNode(sec,true))}
      else{const sec=docOf(s.html).querySelector("section");main.appendChild(doc.importNode(sec,true))}});
    const out=htmlOf(doc),r=await putFile("index.html",out,state.structure.sha,"Update BIZZIP home structure");
    state.structure.sha=r.content.sha;state.structure.html=out;status("structureStatus","✓ 홈 랜딩페이지 구조를 저장했습니다.","ok");
  }catch(e){status("structureStatus","저장 실패: "+e.message,"err")}
};

/* =========================
   BUSINESS
========================= */
async function loadBusiness(){
  const d=await getFile("business.html"),html=b64decode(d.content),doc=docOf(html);
  state.business.landingSha=d.sha;state.business.landingHtml=html;
  $("bizLandingTitle").value=txt(doc,".page-hero h1");$("bizLandingSummary").value=txt(doc,".page-hero h1 + p");
  state.business.categories=Array.from(doc.querySelectorAll(".grid .card")).map(a=>({title:txt(a,"h3"),summary:txt(a,"p"),href:a.getAttribute("href")||""}));
  renderBizCategories();renderBusinessPreview();$("saveBizLanding").disabled=false;
  if(state.business.categories.length)await selectBizCategory(0);
}
function renderBizCategories(){
  $("bizCategoryCards").innerHTML=state.business.categories.map((c,i)=>`<div class="h-card ${i===state.business.selectedCat?"active":""}" data-i="${i}">
  <input class="input bc-title" value="${esc(c.title)}"><input class="input bc-href" value="${esc(c.href)}"><textarea class="textarea bc-summary" style="min-height:58px">${esc(c.summary)}</textarea>
  <div class="h-actions"><button class="btn dark mini bc-edit">2단계</button><button class="btn light mini bc-left">←</button><button class="btn light mini bc-right">→</button><button class="btn danger mini bc-del">삭제</button></div></div>`).join("");
  $("bizCategoryCards").querySelectorAll(".h-card").forEach(row=>{
    const i=+row.dataset.i, sync=()=>{const c=state.business.categories[i];c.title=row.querySelector(".bc-title").value;c.href=row.querySelector(".bc-href").value;c.summary=row.querySelector(".bc-summary").value;renderBusinessPreview()};
    row.querySelectorAll("input,textarea").forEach(x=>x.addEventListener("input",sync));
    row.querySelector(".bc-edit").onclick=()=>{sync();selectBizCategory(i)};
    row.querySelector(".bc-left").onclick=()=>move(state.business.categories,i,-1,renderBizCategories,renderBusinessPreview);
    row.querySelector(".bc-right").onclick=()=>move(state.business.categories,i,1,renderBizCategories,renderBusinessPreview);
    row.querySelector(".bc-del").onclick=()=>{state.business.categories.splice(i,1);state.business.selectedCat=-1;renderBizCategories();$("bizTopicCards").innerHTML="";renderBusinessPreview()};
  });
}
$("addBizCategory").onclick=()=>{state.business.categories.push({title:"새 분야",summary:"",href:`business-${Date.now()}.html`});renderBizCategories();renderBusinessPreview()};
async function selectBizCategory(i){
  state.business.selectedCat=i;renderBizCategories();const c=state.business.categories[i];
  try{
    const d=await getFile(c.href),html=b64decode(d.content),doc=docOf(html);state.business.cat={sha:d.sha,html,topics:Array.from(doc.querySelectorAll(".topic-card")).map(a=>({title:txt(a,"h3"),summary:txt(a,"p"),href:a.getAttribute("href")||""}))};
    $("bizCatTitle").value=txt(doc,".page-hero h1");$("bizCatSummary").value=txt(doc,".page-hero h1 + p");$("bizCatSectionTitle").value=txt(doc,".section-head h2");$("bizCatSectionSummary").value=txt(doc,".section-head p");
    renderBizTopics();$("saveBizCategory").disabled=false;renderBusinessPreview();
  }catch(e){state.business.cat={sha:"",html:"",topics:[]};renderBizTopics();status("businessStatus",`분야 페이지 ${c.href}를 찾지 못했습니다. 새 분야라면 저장 시 생성할 수 있도록 파일명을 확인하세요.`,"info")}
}
function renderBizTopics(){
  $("bizTopicCards").innerHTML=(state.business.cat.topics||[]).map((t,i)=>`<div class="h-card" data-i="${i}"><input class="input bt-title" value="${esc(t.title)}"><input class="input bt-href" value="${esc(t.href)}"><textarea class="textarea bt-summary" style="min-height:58px">${esc(t.summary)}</textarea><div class="h-actions"><button class="btn dark mini bt-detail">상세 편집</button><button class="btn light mini bt-left">←</button><button class="btn light mini bt-right">→</button><button class="btn danger mini bt-del">삭제</button></div></div>`).join("");
  $("bizTopicCards").querySelectorAll(".h-card").forEach(row=>{
    const i=+row.dataset.i,sync=()=>{const t=state.business.cat.topics[i];t.title=row.querySelector(".bt-title").value;t.href=row.querySelector(".bt-href").value;t.summary=row.querySelector(".bt-summary").value;renderBusinessPreview()};
    row.querySelectorAll("input,textarea").forEach(x=>x.addEventListener("input",sync));
    row.querySelector(".bt-detail").onclick=()=>{sync();loadBizDetail(state.business.cat.topics[i].href)};
    row.querySelector(".bt-left").onclick=()=>move(state.business.cat.topics,i,-1,renderBizTopics,renderBusinessPreview);
    row.querySelector(".bt-right").onclick=()=>move(state.business.cat.topics,i,1,renderBizTopics,renderBusinessPreview);
    row.querySelector(".bt-del").onclick=()=>{state.business.cat.topics.splice(i,1);renderBizTopics();renderBusinessPreview()};
  })
}
$("addBizTopic").onclick=()=>{state.business.cat.topics.push({title:"새 세부주제",summary:"",href:`detail-${Date.now()}.html`});renderBizTopics();renderBusinessPreview()};
function renderBusinessPreview(){
  const c=state.business.selectedCat>=0?state.business.categories[state.business.selectedCat]:null;
  $("businessPreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">BUSINESS PRACTICE</div><h1>${esc($("bizLandingTitle").value||"사업실무")}</h1><p>${esc($("bizLandingSummary").value||"")}</p></div><div class="pv-section"><div class="pv-grid">${state.business.categories.map((x,i)=>`<div class="pv-item"><strong>${esc(x.title)}</strong><small>${esc(x.summary)}</small></div>`).join("")}</div></div>${c?`<div class="pv-section"><strong>${esc($("bizCatTitle").value||c.title)}의 세부주제</strong><div class="pv-grid" style="margin-top:8px">${(state.business.cat.topics||[]).map(t=>`<div class="pv-item"><strong>${esc(t.title)}</strong><small>${esc(t.summary)}</small></div>`).join("")}</div></div>`:""}`;
}
bindInputs(["bizLandingTitle","bizLandingSummary","bizCatTitle","bizCatSummary","bizCatSectionTitle","bizCatSectionSummary"],renderBusinessPreview);
$("saveBizLanding").onclick=async()=>{
  try{const doc=docOf(state.business.landingHtml);setTxt(doc,".page-hero h1",$("bizLandingTitle").value);setTxt(doc,".page-hero h1 + p",$("bizLandingSummary").value);
    const cards=Array.from(doc.querySelectorAll(".grid .card"));const parent=cards[0]?.parentElement,template=cards[0]?.cloneNode(true);if(parent&&template){cards.forEach(x=>x.remove());state.business.categories.forEach((c,i)=>{const n=template.cloneNode(true);n.href=c.href;setTxt(n,".num",String(i+1).padStart(2,"0"));setTxt(n,"h3",c.title);setTxt(n,"p",c.summary);parent.appendChild(n)})}
    const out=htmlOf(doc),r=await putFile("business.html",out,state.business.landingSha,"Update business landing");state.business.landingSha=r.content.sha;state.business.landingHtml=out;status("businessStatus","✓ 사업실무 랜딩과 1단계 분야를 저장했습니다.","ok")
  }catch(e){status("businessStatus","저장 실패: "+e.message,"err")}
};
$("saveBizCategory").onclick=async()=>{
  const i=state.business.selectedCat;if(i<0)return;const c=state.business.categories[i];
  try{
    let doc,sha=state.business.cat.sha;
    if(state.business.cat.html)doc=docOf(state.business.cat.html);else doc=makeCategoryDoc(c.title,c.summary);
    setTxt(doc,".page-hero h1",$("bizCatTitle").value||c.title);setTxt(doc,".page-hero h1 + p",$("bizCatSummary").value||c.summary);setTxt(doc,".section-head h2",$("bizCatSectionTitle").value);setTxt(doc,".section-head p",$("bizCatSectionSummary").value);
    const grid=doc.querySelector(".topic-grid");if(grid){grid.innerHTML="";state.business.cat.topics.forEach(t=>{const a=doc.createElement("a");a.className="topic-card";a.href=t.href;a.innerHTML=`<div class="kicker">${esc($("bizCatTitle").value||c.title)}</div><h3>${esc(t.title)}</h3><p>${esc(t.summary)}</p><div class="more">내용 보기 →</div>`;grid.appendChild(a)})}
    const out=htmlOf(doc),r=await putFile(c.href,out,sha,`Update business category ${c.title}`);state.business.cat.sha=r.content.sha;state.business.cat.html=out;status("businessStatus","✓ 선택 분야와 2단계 세부주제를 저장했습니다.","ok")
  }catch(e){status("businessStatus","저장 실패: "+e.message,"err")}
};
function makeCategoryDoc(title,summary){const d=docOf(state.business.cat.html||state.business.landingHtml);let main=d.querySelector("main");main.innerHTML=`<section class="page-hero"><div class="wrap"><div class="breadcrumb"><a href="index.html">홈</a> / <a href="business.html">사업실무</a> / ${esc(title)}</div><div class="eyebrow">BUSINESS PRACTICE</div><h1>${esc(title)}</h1><p>${esc(summary)}</p></div></section><section><div class="wrap"><div class="section-head"><h2>${esc(title)}에서 먼저 볼 것</h2><p>세부주제를 선택하세요.</p></div><div class="topic-grid"></div></div></section>`;return d}

async function loadBizDetail(path){
  if(!path)return;try{const d=await getFile(path),html=b64decode(d.content),doc=docOf(html);state.business.detail={sha:d.sha,html,path,steps:[]};
    $("bizDetailPath").textContent=path;$("bdTitle").value=txt(doc,".page-hero h1");$("bdSummary").value=txt(doc,".page-hero h1 + p");$("bdIntro").value=txt(doc,".detail-intro");
    $("bdCriteria").value=Array.from(doc.querySelectorAll(".article h2:nth-of-type(2) + ul li")).map(x=>x.textContent.trim()).join("\n")||Array.from(doc.querySelectorAll(".article ul")).shift()?.querySelectorAll("li")?Array.from(doc.querySelectorAll(".article ul")[0].querySelectorAll("li")).map(x=>x.textContent.trim()).join("\n"):"";
    $("bdAction").value=txt(doc,".practice-box p");state.business.detail.steps=Array.from(doc.querySelectorAll(".step-card")).map(x=>({title:txt(x,"strong"),body:txt(x,"p")}));
    $("bdExample").value=txt(doc,".example-box p");$("bdMistakes").value=Array.from(doc.querySelectorAll(".mistake-box li")).map(x=>x.textContent.trim()).join("\n");$("bdFinishTitle").value=txt(doc,".finish-box strong");$("bdFinishBody").value=txt(doc,".finish-box p");
    renderBdSteps();renderBusinessDetailPreview();$("saveBizDetail").disabled=false;
  }catch(e){status("businessStatus","상세페이지를 불러오지 못했습니다: "+e.message,"err")}
}
function renderBdSteps(){
  $("bdSteps").innerHTML=state.business.detail.steps.map((s,i)=>`<div class="repeat-row" data-i="${i}"><div class="repeat-top"><strong>STEP ${i+1}</strong><div><button class="btn light mini st-up">↑</button><button class="btn light mini st-down">↓</button><button class="btn danger mini st-del">삭제</button></div></div><input class="input st-title" value="${esc(s.title)}"><textarea class="textarea st-body" style="min-height:62px;margin-top:6px">${esc(s.body)}</textarea></div>`).join("");
  $("bdSteps").querySelectorAll(".repeat-row").forEach(row=>{const i=+row.dataset.i,sync=()=>{state.business.detail.steps[i]={title:row.querySelector(".st-title").value,body:row.querySelector(".st-body").value};renderBusinessDetailPreview()};row.querySelectorAll("input,textarea").forEach(x=>x.addEventListener("input",sync));row.querySelector(".st-up").onclick=()=>move(state.business.detail.steps,i,-1,renderBdSteps,renderBusinessDetailPreview);row.querySelector(".st-down").onclick=()=>move(state.business.detail.steps,i,1,renderBdSteps,renderBusinessDetailPreview);row.querySelector(".st-del").onclick=()=>{state.business.detail.steps.splice(i,1);renderBdSteps();renderBusinessDetailPreview()}})
}
$("addBdStep").onclick=()=>{state.business.detail.steps.push({title:"새 단계",body:""});renderBdSteps();renderBusinessDetailPreview()};
function renderBusinessDetailPreview(){
  $("businessDetailPreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">BUSINESS PRACTICE</div><h1>${esc($("bdTitle").value)}</h1><p>${esc($("bdSummary").value)}</p></div><div class="pv-section"><p>${esc($("bdIntro").value)}</p>${lines($("bdCriteria").value).length?`<ul>${lines($("bdCriteria").value).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}${state.business.detail.steps.map((s,i)=>`<div class="pv-item" style="margin-top:6px"><strong>STEP ${i+1}. ${esc(s.title)}</strong><small>${esc(s.body)}</small></div>`).join("")}</div>`;
}
bindInputs(["bdTitle","bdSummary","bdIntro","bdCriteria","bdAction","bdExample","bdMistakes","bdFinishTitle","bdFinishBody"],renderBusinessDetailPreview);
$("saveBizDetail").onclick=async()=>{
  const st=state.business.detail;if(!st.path||!st.html)return;
  try{const doc=docOf(st.html);setTxt(doc,".page-hero h1",$("bdTitle").value);setTxt(doc,".page-hero h1 + p",$("bdSummary").value);setTxt(doc,".detail-intro",$("bdIntro").value);
    const article=doc.querySelector(".article");const intro=article?.querySelector(".detail-intro");if(intro){let h2=intro.previousElementSibling;let ul=h2?.nextElementSibling===intro?intro.nextElementSibling:null}
    const uls=article?.querySelectorAll("ul")||[];if(uls[0])uls[0].innerHTML=lines($("bdCriteria").value).map(x=>`<li>${esc(x)}</li>`).join("");
    setTxt(doc,".practice-box p",$("bdAction").value);const sg=doc.querySelector(".step-grid");if(sg)sg.innerHTML=st.steps.map((s,i)=>`<div class="step-card"><b>STEP ${i+1}</b><strong>${esc(s.title)}</strong><p>${esc(s.body)}</p></div>`).join("");
    setTxt(doc,".example-box p",$("bdExample").value);const mb=doc.querySelector(".mistake-box ul");if(mb)mb.innerHTML=lines($("bdMistakes").value).map(x=>`<li>${esc(x)}</li>`).join("");setTxt(doc,".finish-box strong",$("bdFinishTitle").value);setTxt(doc,".finish-box p",$("bdFinishBody").value);
    const out=htmlOf(doc),r=await putFile(st.path,out,st.sha,`Update business detail ${st.path}`);st.sha=r.content.sha;st.html=out;status("businessStatus","✓ 상세페이지를 저장했습니다.","ok")
  }catch(e){status("businessStatus","저장 실패: "+e.message,"err")}
};

/* =========================
   PROBLEMS
========================= */
async function loadProblems(){
  const d=await getFile("problems.html"),html=b64decode(d.content),doc=docOf(html);state.problems.landingSha=d.sha;state.problems.landingHtml=html;
  $("problemLandingTitle").value=txt(doc,".page-hero h1");$("problemLandingSummary").value=txt(doc,".page-hero h1 + p");
  state.problems.roots=Array.from(doc.querySelectorAll(".problem-card")).map(a=>({title:txt(a,"strong"),href:a.getAttribute("href")||""}));
  renderProblemRoots();renderProblemPreview();$("saveProblemLanding").disabled=false;if(state.problems.roots.length)await selectProblemRoot(0);
}
function renderProblemRoots(){
  $("problemRootCards").innerHTML=state.problems.roots.map((x,i)=>`<div class="h-card ${i===state.problems.selectedRoot?"active":""}" data-i="${i}"><textarea class="textarea pr-title" style="min-height:70px">${esc(x.title)}</textarea><input class="input pr-href" value="${esc(x.href)}"><div class="h-actions"><button class="btn dark mini pr-edit">관련 문제</button><button class="btn light mini pr-left">←</button><button class="btn light mini pr-right">→</button><button class="btn danger mini pr-del">삭제</button></div></div>`).join("");
  $("problemRootCards").querySelectorAll(".h-card").forEach(row=>{const i=+row.dataset.i,sync=()=>{state.problems.roots[i].title=row.querySelector(".pr-title").value;state.problems.roots[i].href=row.querySelector(".pr-href").value;renderProblemPreview()};row.querySelectorAll("input,textarea").forEach(x=>x.addEventListener("input",sync));row.querySelector(".pr-edit").onclick=()=>{sync();selectProblemRoot(i)};row.querySelector(".pr-left").onclick=()=>move(state.problems.roots,i,-1,renderProblemRoots,renderProblemPreview);row.querySelector(".pr-right").onclick=()=>move(state.problems.roots,i,1,renderProblemRoots,renderProblemPreview);row.querySelector(".pr-del").onclick=()=>{state.problems.roots.splice(i,1);state.problems.selectedRoot=-1;renderProblemRoots();$("problemSubCards").innerHTML="";renderProblemPreview()}})
}
$("addProblemRoot").onclick=()=>{state.problems.roots.push({title:"새 큰 문제",href:`problem-${Date.now()}.html`});renderProblemRoots();renderProblemPreview()};
async function selectProblemRoot(i){
  state.problems.selectedRoot=i;renderProblemRoots();const x=state.problems.roots[i];
  try{const d=await getFile(x.href),html=b64decode(d.content),doc=docOf(html);state.problems.page={sha:d.sha,html,path:x.href,subs:Array.from(doc.querySelectorAll(".problem-subcard")).map(a=>({title:txt(a,"h3"),summary:txt(a,"p"),href:a.getAttribute("href")||""}))};
    $("problemPageTitle").value=txt(doc,".page-hero h1");$("problemPageSummary").value=txt(doc,".page-hero h1 + p");$("problemSectionTitle").value=txt(doc,".section-head h2");$("problemSectionSummary").value=txt(doc,".section-head p");renderProblemSubs();$("saveProblemPage").disabled=false;renderProblemPreview()
  }catch(e){state.problems.page={sha:"",html:"",path:x.href,subs:[]};renderProblemSubs();status("problemStatus","중간 문제 페이지를 찾지 못했습니다. 새 문제라면 파일명을 확인한 뒤 저장하세요.","info")}
}
function renderProblemSubs(){
  $("problemSubCards").innerHTML=state.problems.page.subs.map((x,i)=>`<div class="h-card" data-i="${i}"><input class="input ps-title" value="${esc(x.title)}"><input class="input ps-href" value="${esc(x.href)}"><textarea class="textarea ps-summary" style="min-height:58px">${esc(x.summary)}</textarea><div class="h-actions"><button class="btn dark mini ps-detail">상세 편집</button><button class="btn light mini ps-left">←</button><button class="btn light mini ps-right">→</button><button class="btn danger mini ps-del">삭제</button></div></div>`).join("");
  $("problemSubCards").querySelectorAll(".h-card").forEach(row=>{const i=+row.dataset.i,sync=()=>{const x=state.problems.page.subs[i];x.title=row.querySelector(".ps-title").value;x.href=row.querySelector(".ps-href").value;x.summary=row.querySelector(".ps-summary").value;renderProblemPreview()};row.querySelectorAll("input,textarea").forEach(x=>x.addEventListener("input",sync));row.querySelector(".ps-detail").onclick=()=>{sync();openPanel("business");loadBizDetail(state.problems.page.subs[i].href)};row.querySelector(".ps-left").onclick=()=>move(state.problems.page.subs,i,-1,renderProblemSubs,renderProblemPreview);row.querySelector(".ps-right").onclick=()=>move(state.problems.page.subs,i,1,renderProblemSubs,renderProblemPreview);row.querySelector(".ps-del").onclick=()=>{state.problems.page.subs.splice(i,1);renderProblemSubs();renderProblemPreview()}})
}
$("addProblemSub").onclick=()=>{state.problems.page.subs.push({title:"새 관련 문제",summary:"",href:""});renderProblemSubs();renderProblemPreview()};
function renderProblemPreview(){
  $("problemPreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">SOLVE THE PROBLEM</div><h1>${esc($("problemLandingTitle").value||"문제별 해결")}</h1><p>${esc($("problemLandingSummary").value)}</p></div><div class="pv-section"><div class="pv-grid">${state.problems.roots.map(x=>`<div class="pv-item"><strong>${esc(x.title)}</strong></div>`).join("")}</div></div>${state.problems.selectedRoot>=0?`<div class="pv-section"><strong>${esc($("problemPageTitle").value)}</strong><div class="pv-grid" style="margin-top:8px">${state.problems.page.subs.map(x=>`<div class="pv-item"><strong>${esc(x.title)}</strong><small>${esc(x.summary)}</small></div>`).join("")}</div></div>`:""}`;
}
bindInputs(["problemLandingTitle","problemLandingSummary","problemPageTitle","problemPageSummary","problemSectionTitle","problemSectionSummary"],renderProblemPreview);
$("saveProblemLanding").onclick=async()=>{try{const doc=docOf(state.problems.landingHtml);setTxt(doc,".page-hero h1",$("problemLandingTitle").value);setTxt(doc,".page-hero h1 + p",$("problemLandingSummary").value);const cards=Array.from(doc.querySelectorAll(".problem-card")),parent=cards[0]?.parentElement,template=cards[0]?.cloneNode(true);if(parent&&template){cards.forEach(x=>x.remove());state.problems.roots.forEach((x,i)=>{const n=template.cloneNode(true);n.href=x.href;setTxt(n,"span",String(i+1).padStart(2,"0"));setTxt(n,"strong",x.title);parent.appendChild(n)})}const out=htmlOf(doc),r=await putFile("problems.html",out,state.problems.landingSha,"Update problems landing");state.problems.landingSha=r.content.sha;state.problems.landingHtml=out;status("problemStatus","✓ 문제별 해결 랜딩과 1단계 구조를 저장했습니다.","ok")}catch(e){status("problemStatus","저장 실패: "+e.message,"err")}};
$("saveProblemPage").onclick=async()=>{const root=state.problems.roots[state.problems.selectedRoot];if(!root)return;try{let doc=state.problems.page.html?docOf(state.problems.page.html):makeProblemDoc(root.title);setTxt(doc,".page-hero h1",$("problemPageTitle").value||root.title);setTxt(doc,".page-hero h1 + p",$("problemPageSummary").value);setTxt(doc,".section-head h2",$("problemSectionTitle").value);setTxt(doc,".section-head p",$("problemSectionSummary").value);const grid=doc.querySelector(".problem-subgrid");if(grid){grid.innerHTML="";state.problems.page.subs.forEach(x=>{const a=doc.createElement("a");a.className="problem-subcard";a.href=x.href;a.innerHTML=`<div class="kicker">관련 문제</div><h3>${esc(x.title)}</h3><p>${esc(x.summary)}</p><div class="more">관련 내용 보기 →</div>`;grid.appendChild(a)})}const out=htmlOf(doc),r=await putFile(root.href,out,state.problems.page.sha,`Update problem page ${root.title}`);state.problems.page.sha=r.content.sha;state.problems.page.html=out;status("problemStatus","✓ 선택 문제와 관련 문제를 저장했습니다.","ok")}catch(e){status("problemStatus","저장 실패: "+e.message,"err")}};
function makeProblemDoc(title){const d=docOf(state.problems.landingHtml);d.querySelector("main").innerHTML=`<section class="page-hero"><div class="wrap"><div class="eyebrow">PROBLEM GUIDE</div><h1>${esc(title)}</h1><p></p></div></section><section><div class="wrap"><div class="section-head"><h2>어떤 부분에서 막혀 있나요?</h2><p>가장 가까운 문제를 선택하세요.</p></div><div class="problem-subgrid"></div></div></section>`;return d}

/* =========================
   CONTENTS
========================= */
async function loadContents(){
  const [pd,ld]=await Promise.all([getFile(CONFIG.posts),getFile("contents.html")]);state.contents.postsSha=pd.sha;state.contents.posts=JSON.parse(b64decode(pd.content));state.contents.landingSha=ld.sha;state.contents.landingHtml=b64decode(ld.content);
  const doc=docOf(state.contents.landingHtml);$("contentsLandingTitle").value=txt(doc,".page-hero h1");$("contentsLandingSummary").value=txt(doc,".page-hero h1 + p");fillPostCategories();renderPostList();newPost();
}
function fillPostCategories(){
  $("postCategory").innerHTML=state.business.categories.map((c,i)=>`<option value="${i}">${esc(c.title)}</option>`).join("");refreshPostSubs()
}
function refreshPostSubs(){const c=state.business.categories[+$("postCategory").value]||state.business.categories[0];const catKey=(c?.href||"").replace(".html","");const map=state.business.selectedCat>=0&&state.business.categories[state.business.selectedCat]?.href===c?.href?state.business.cat.topics:[];$("postSubcategory").innerHTML=(map||[]).map((x,i)=>`<option value="${i}">${esc(x.title)}</option>`).join("")}
$("postCategory").onchange=refreshPostSubs;
function renderPostList(){
  $("postList").innerHTML=state.contents.posts.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(p=>{const i=state.contents.posts.findIndex(x=>x.id===p.id);return `<div class="list-row"><div><strong>${esc(p.title)}</strong><small>${esc(p.date||"")}</small></div><button class="btn light mini edit-post" data-i="${i}">수정</button></div>`}).join("");
  document.querySelectorAll(".edit-post").forEach(b=>b.onclick=()=>editPost(+b.dataset.i))
}
function newPost(){state.contents.editIndex=-1;$("postTitle").value="";$("postDate").value=today();$("postSummary").value="";$("postBody").value="";$("savePost").disabled=false;renderPostPreview()}
$("newPost").onclick=newPost;
function editPost(i){state.contents.editIndex=i;const p=state.contents.posts[i];$("postTitle").value=p.title||"";$("postDate").value=p.date||today();$("postSummary").value=p.summary||"";$("postBody").value=p.body||"";$("savePost").disabled=false;renderPostPreview()}
function renderPostPreview(){const body=$("postBody").value.split(/\r?\n/).map(x=>x.startsWith("## ")?`<h3>${esc(x.slice(3))}</h3>`:x.startsWith("- ")?`<div>• ${esc(x.slice(2))}</div>`:`<p>${esc(x)}</p>`).join("");$("postPreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">BIZZIP CONTENT</div><h1>${esc($("postTitle").value)}</h1><p>${esc($("postSummary").value)}</p></div><div class="pv-section">${body}</div>`}
bindInputs(["postTitle","postSummary","postBody"],renderPostPreview);
$("savePost").onclick=async()=>{try{const i=state.contents.editIndex,old=i>=0?state.contents.posts[i]:{};const p={...old,id:old.id||`post-${Date.now()}`,title:$("postTitle").value.trim(),date:$("postDate").value,summary:$("postSummary").value.trim(),body:$("postBody").value,categoryLabel:$("postCategory").selectedOptions[0]?.textContent||"",subcategoryLabel:$("postSubcategory").selectedOptions[0]?.textContent||""};if(i>=0)state.contents.posts[i]=p;else state.contents.posts.push(p);const r=await putFile(CONFIG.posts,JSON.stringify(state.contents.posts,null,2),state.contents.postsSha,"Update BIZZIP contents");state.contents.postsSha=r.content.sha;renderPostList();status("contentsStatus","✓ 콘텐츠를 저장했습니다.","ok")}catch(e){status("contentsStatus","저장 실패: "+e.message,"err")}};
$("saveContentsLanding").onclick=async()=>{try{const doc=docOf(state.contents.landingHtml);setTxt(doc,".page-hero h1",$("contentsLandingTitle").value);setTxt(doc,".page-hero h1 + p",$("contentsLandingSummary").value);const out=htmlOf(doc),r=await putFile("contents.html",out,state.contents.landingSha,"Update contents landing");state.contents.landingSha=r.content.sha;state.contents.landingHtml=out;status("contentsStatus","✓ 콘텐츠 랜딩을 저장했습니다.","ok")}catch(e){status("contentsStatus","저장 실패: "+e.message,"err")}};

/* =========================
   RESOURCES
========================= */
async function loadResources(){
  const d=await getFile("resources.html"),html=b64decode(d.content),doc=docOf(html);state.resources.landingSha=d.sha;state.resources.landingHtml=html;$("resourceLandingTitle").value=txt(doc,".page-hero h1");$("resourceLandingSummary").value=txt(doc,".page-hero h1 + p");
  state.resources.cards=Array.from(doc.querySelectorAll(".resource-card")).map(a=>({title:txt(a,"h3"),summary:txt(a,"p"),href:a.getAttribute("href")||"",type:txt(a,".resource-meta b")||"GUIDE"}));renderResourceCards();renderResourceLandingPreview();$("saveResourceLanding").disabled=false;if(state.resources.cards.length)loadResourceDetail(0)
}
function renderResourceCards(){$("resourceCards").innerHTML=state.resources.cards.map((x,i)=>`<div class="h-card ${i===state.resources.selected?"active":""}" data-i="${i}"><input class="input rc-title" value="${esc(x.title)}"><input class="input rc-href" value="${esc(x.href)}"><textarea class="textarea rc-summary" style="min-height:58px">${esc(x.summary)}</textarea><div class="h-actions"><button class="btn dark mini rc-edit">상세 편집</button><button class="btn light mini rc-left">←</button><button class="btn light mini rc-right">→</button><button class="btn danger mini rc-del">삭제</button></div></div>`).join("");$("resourceCards").querySelectorAll(".h-card").forEach(row=>{const i=+row.dataset.i,sync=()=>{const x=state.resources.cards[i];x.title=row.querySelector(".rc-title").value;x.href=row.querySelector(".rc-href").value;x.summary=row.querySelector(".rc-summary").value;renderResourceLandingPreview()};row.querySelectorAll("input,textarea").forEach(x=>x.addEventListener("input",sync));row.querySelector(".rc-edit").onclick=()=>{sync();loadResourceDetail(i)};row.querySelector(".rc-left").onclick=()=>move(state.resources.cards,i,-1,renderResourceCards,renderResourceLandingPreview);row.querySelector(".rc-right").onclick=()=>move(state.resources.cards,i,1,renderResourceCards,renderResourceLandingPreview);row.querySelector(".rc-del").onclick=()=>{state.resources.cards.splice(i,1);renderResourceCards();renderResourceLandingPreview()}})}
$("addResourceCard").onclick=()=>{state.resources.cards.push({title:"새 실무자료",summary:"",href:`resource-${Date.now()}.html`,type:"GUIDE"});renderResourceCards();renderResourceLandingPreview()};
function renderResourceLandingPreview(){$("resourceLandingPreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">PRACTICAL RESOURCES</div><h1>${esc($("resourceLandingTitle").value)}</h1><p>${esc($("resourceLandingSummary").value)}</p></div><div class="pv-section"><div class="pv-grid">${state.resources.cards.map(x=>`<div class="pv-item"><strong>${esc(x.title)}</strong><small>${esc(x.summary)}</small></div>`).join("")}</div></div>`}
bindInputs(["resourceLandingTitle","resourceLandingSummary"],renderResourceLandingPreview);
async function loadResourceDetail(i){state.resources.selected=i;renderResourceCards();const x=state.resources.cards[i];try{const d=await getFile(x.href),html=b64decode(d.content),doc=docOf(html);state.resources.detail={sha:d.sha,html,path:x.href};$("rdTitle").value=txt(doc,".page-hero h1");$("rdSummary").value=txt(doc,".page-hero h1 + p");$("rdUsage").value=Array.from(doc.querySelectorAll(".article > ul:first-of-type li")).map(x=>x.textContent.trim()).join("\n");$("rdTip").value=txt(doc,".practice-box p");$("rdExample").value=txt(doc,".example-box p");$("rdSteps").value=Array.from(doc.querySelectorAll(".resource-steps li")).map(x=>x.textContent.trim()).join("\n");$("rdFinishTitle").value=txt(doc,".finish-box strong");$("rdFinishBody").value=txt(doc,".finish-box p");$("rdDownload").value=doc.querySelector(".article a[download]")?.getAttribute("href")||"";$("saveResourceDetail").disabled=false;renderResourceDetailPreview()}catch(e){status("resourcesStatus","자료 상세를 불러오지 못했습니다: "+e.message,"err")}}
function renderResourceDetailPreview(){$("resourceDetailPreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">PRACTICAL RESOURCE</div><h1>${esc($("rdTitle").value)}</h1><p>${esc($("rdSummary").value)}</p></div><div class="pv-section"><ul>${lines($("rdUsage").value).map(x=>`<li>${esc(x)}</li>`).join("")}</ul><div class="pv-item"><strong>사용 팁</strong><small>${esc($("rdTip").value)}</small></div></div>`}
bindInputs(["rdTitle","rdSummary","rdUsage","rdTip","rdExample","rdSteps","rdFinishTitle","rdFinishBody","rdDownload"],renderResourceDetailPreview);
$("saveResourceLanding").onclick=async()=>{try{const doc=docOf(state.resources.landingHtml);setTxt(doc,".page-hero h1",$("resourceLandingTitle").value);setTxt(doc,".page-hero h1 + p",$("resourceLandingSummary").value);const cards=Array.from(doc.querySelectorAll(".resource-card")),p=cards[0]?.parentElement,t=cards[0]?.cloneNode(true);if(p&&t){cards.forEach(x=>x.remove());state.resources.cards.forEach(x=>{const n=t.cloneNode(true);n.href=x.href;setTxt(n,"h3",x.title);setTxt(n,"p",x.summary);setTxt(n,".resource-meta b",x.type||"GUIDE");p.appendChild(n)})}const out=htmlOf(doc),r=await putFile("resources.html",out,state.resources.landingSha,"Update resources landing");state.resources.landingSha=r.content.sha;state.resources.landingHtml=out;status("resourcesStatus","✓ 실무자료 랜딩을 저장했습니다.","ok")}catch(e){status("resourcesStatus","저장 실패: "+e.message,"err")}};
$("saveResourceDetail").onclick=async()=>{const st=state.resources.detail;try{const doc=docOf(st.html);setTxt(doc,".page-hero h1",$("rdTitle").value);setTxt(doc,".page-hero h1 + p",$("rdSummary").value);const ul=doc.querySelector(".article > ul:first-of-type");if(ul)ul.innerHTML=lines($("rdUsage").value).map(x=>`<li>${esc(x)}</li>`).join("");setTxt(doc,".practice-box p",$("rdTip").value);setTxt(doc,".example-box p",$("rdExample").value);const ol=doc.querySelector(".resource-steps");if(ol)ol.innerHTML=lines($("rdSteps").value).map(x=>`<li>${esc(x)}</li>`).join("");setTxt(doc,".finish-box strong",$("rdFinishTitle").value);setTxt(doc,".finish-box p",$("rdFinishBody").value);const a=doc.querySelector(".article a[download]");if(a)a.href=$("rdDownload").value;const out=htmlOf(doc),r=await putFile(st.path,out,st.sha,`Update resource ${st.path}`);st.sha=r.content.sha;st.html=out;status("resourcesStatus","✓ 자료 상세를 저장했습니다.","ok")}catch(e){status("resourcesStatus","저장 실패: "+e.message,"err")}};

/* =========================
   ABOUT
========================= */
async function loadAbout(){const d=await getFile("about.html"),html=b64decode(d.content),doc=docOf(html);state.about.sha=d.sha;state.about.html=html;$("aboutTitle").value=txt(doc,".page-hero h1");$("aboutSummary").value=txt(doc,".page-hero h1 + p");const op=doc.querySelector(".split .panel");$("aboutOperatorTitle").value=txt(op,"h2");$("aboutOperatorBody").value=txt(op,"p");$("aboutOperatorList").value=Array.from(op?.querySelectorAll(".list > div")||[]).map(x=>x.textContent.trim()).join("\n");const sections=Array.from(doc.querySelectorAll(".about-section"));state.about.consulting=projectData(sections[0]);state.about.brands=projectData(sections[1]);state.about.books=Array.from(sections[2]?.querySelectorAll(".book-card")||[]).map(x=>({year:txt(x,".year"),title:txt(x,"h3"),desc:txt(x,"p"),href:x.getAttribute("href")||x.querySelector("a")?.getAttribute("href")||""}));renderAboutRows();renderAboutPreview();$("saveAbout").disabled=false}
function projectData(sec){return Array.from(sec?.querySelectorAll(".project-card")||[]).map(x=>({period:txt(x,".year"),name:txt(x,"h3"),topic:txt(x,"p strong"),desc:txt(x,"p").replace(txt(x,"p strong"),"").trim()}))}
function renderAboutRows(){renderRep("consultingRows",state.about.consulting,[["period","기간"],["name","기업명"],["topic","주제"],["desc","설명"]],renderAboutPreview);renderRep("brandProjectRows",state.about.brands,[["period","연도"],["name","브랜드"],["topic","주제"],["desc","설명"]],renderAboutPreview);renderRep("bookRows",state.about.books,[["year","연도"],["title","도서명"],["desc","설명"],["href","링크"]],renderAboutPreview)}
$("addConsulting").onclick=()=>{state.about.consulting.push({period:"",name:"",topic:"",desc:""});renderAboutRows()};$("addBrandProject").onclick=()=>{state.about.brands.push({period:"",name:"",topic:"",desc:""});renderAboutRows()};$("addBook").onclick=()=>{state.about.books.push({year:"",title:"",desc:"",href:""});renderAboutRows()};
function renderAboutPreview(){$("aboutPreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">ABOUT BIZZIP</div><h1>${esc($("aboutTitle").value)}</h1><p>${esc($("aboutSummary").value)}</p></div><div class="pv-section"><strong>${esc($("aboutOperatorTitle").value)}</strong><p>${esc($("aboutOperatorBody").value)}</p></div><div class="pv-section"><strong>프로젝트</strong><div class="pv-grid">${state.about.consulting.map(x=>`<div class="pv-item"><strong>${esc(x.name)}</strong><small>${esc(x.topic)}</small></div>`).join("")}</div></div>`}
bindInputs(["aboutTitle","aboutSummary","aboutOperatorTitle","aboutOperatorBody","aboutOperatorList"],renderAboutPreview);
$("saveAbout").onclick=async()=>{try{const doc=docOf(state.about.html);setTxt(doc,".page-hero h1",$("aboutTitle").value);setTxt(doc,".page-hero h1 + p",$("aboutSummary").value);const op=doc.querySelector(".split .panel");setTxt(op,"h2",$("aboutOperatorTitle").value);setTxt(op,"p",$("aboutOperatorBody").value);const list=op?.querySelector(".list");if(list)list.innerHTML=lines($("aboutOperatorList").value).map(x=>`<div>${esc(x)}</div>`).join("");const secs=Array.from(doc.querySelectorAll(".about-section"));syncProjects(doc,secs[0],state.about.consulting);syncProjects(doc,secs[1],state.about.brands);syncBooks(doc,secs[2],state.about.books);const out=htmlOf(doc),r=await putFile("about.html",out,state.about.sha,"Update BIZZIP about");state.about.sha=r.content.sha;state.about.html=out;status("aboutStatus","✓ BIZZIP 소개를 저장했습니다.","ok")}catch(e){status("aboutStatus","저장 실패: "+e.message,"err")}};

/* =========================
   CONTACT
========================= */
async function loadContact(){const d=await getFile("contact.html"),html=b64decode(d.content),doc=docOf(html);state.contact.sha=d.sha;state.contact.html=html;$("contactTitle").value=txt(doc,".page-hero h1");$("contactSummary").value=txt(doc,".page-hero h1 + p");$("contactGuideTitle").value=txt(doc,".contact-main h2");$("contactGuideBody").value=txt(doc,".contact-main p");$("contactEmail").value=(doc.querySelector(".contact-mail")?.getAttribute("href")||"").replace("mailto:","");const info=doc.querySelector(".bizzip-contact-info");$("contactManager").value=txt(info,"[data-manager]")||"BIZZIP 운영담당";$("contactKakao").value=txt(info,"[data-kakao]");$("contactKakaoUrl").value=info?.querySelector("[data-kakao] a")?.getAttribute("href")||"";$("contactPrivacy").value=txt(info,".privacy-note")||"문의 시 회신에 필요한 최소한의 정보만 보내주세요. 주민등록번호, 계좌번호, 건강정보 등 불필요한 민감정보는 보내지 마세요. 문의 내용과 연락처는 문의 확인 및 회신 목적으로만 사용합니다.";state.contact.types=Array.from(doc.querySelectorAll(".contact-option")).map(x=>({label:txt(x,".label"),title:txt(x,"h3"),body:txt(x,"p")}));renderContactRows();renderContactPreview();$("saveContact").disabled=false}
function renderContactRows(){renderRep("contactTypeRows",state.contact.types,[["label","라벨"],["title","유형 제목"],["body","설명"]],renderContactPreview)}
$("addContactType").onclick=()=>{state.contact.types.push({label:"INQUIRY",title:"새 문의 유형",body:""});renderContactRows()};
function renderContactPreview(){$("contactPreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">CONTACT</div><h1>${esc($("contactTitle").value)}</h1><p>${esc($("contactSummary").value)}</p></div><div class="pv-section"><strong>${esc($("contactGuideTitle").value)}</strong><p>${esc($("contactGuideBody").value)}</p><div class="pv-item"><strong>담당자 ${esc($("contactManager").value)}</strong><small>${esc($("contactEmail").value)}${$("contactKakao").value?" / 카카오톡 "+esc($("contactKakao").value):""}</small></div></div><div class="pv-section"><div class="pv-grid">${state.contact.types.map(x=>`<div class="pv-item"><strong>${esc(x.title)}</strong><small>${esc(x.body)}</small></div>`).join("")}</div><p class="hint">${esc($("contactPrivacy").value)}</p></div>`}
bindInputs(["contactTitle","contactSummary","contactManager","contactEmail","contactKakao","contactKakaoUrl","contactGuideTitle","contactGuideBody","contactPrivacy"],renderContactPreview);
$("saveContact").onclick=async()=>{try{const doc=docOf(state.contact.html);setTxt(doc,".page-hero h1",$("contactTitle").value);setTxt(doc,".page-hero h1 + p",$("contactSummary").value);setTxt(doc,".contact-main h2",$("contactGuideTitle").value);setTxt(doc,".contact-main p",$("contactGuideBody").value);let mail=doc.querySelector(".contact-mail");if(mail){mail.href=`mailto:${$("contactEmail").value}`;mail.textContent=$("contactEmail").value+" →"}const side=doc.querySelector(".contact-side");if(side)side.innerHTML=state.contact.types.map(x=>`<div class="contact-option"><div class="label">${esc(x.label)}</div><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></div>`).join("");let info=doc.querySelector(".bizzip-contact-info");if(!info){info=doc.createElement("div");info.className="bizzip-contact-info contact-guide";doc.querySelector(".contact-shell")?.after(info)}info.innerHTML=`<h3>문의 연락처</h3><p data-manager><strong>담당자</strong> ${esc($("contactManager").value)}</p><p><strong>이메일</strong> <a href="mailto:${esc($("contactEmail").value)}">${esc($("contactEmail").value)}</a></p>${$("contactKakao").value?`<p data-kakao><strong>카카오톡</strong> ${$("contactKakaoUrl").value?`<a href="${esc($("contactKakaoUrl").value)}">${esc($("contactKakao").value)}</a>`:esc($("contactKakao").value)}</p>`:""}<p class="privacy-note">${esc($("contactPrivacy").value)}</p>`;const out=htmlOf(doc),r=await putFile("contact.html",out,state.contact.sha,"Update BIZZIP contact");state.contact.sha=r.content.sha;state.contact.html=out;status("contactStatus","✓ 문의 페이지를 저장했습니다.","ok")}catch(e){status("contactStatus","저장 실패: "+e.message,"err")}};

/* =========================
   FILES
========================= */
async function loadFiles(){const arr=await api(CONFIG.downloads);state.files=arr.filter(x=>x.type==="file");renderFiles();$("uploadFileBtn").disabled=false}
function renderFiles(){$("fileList").innerHTML=state.files.map((f,i)=>`<div class="list-row"><div><strong>${esc(f.name)}</strong><small>${Math.round((f.size||0)/1024)} KB</small></div><div class="compact-actions"><button class="btn light mini file-down" data-i="${i}">다운로드</button><button class="btn danger mini file-del" data-i="${i}">삭제</button></div></div>`).join("");document.querySelectorAll(".file-down").forEach(b=>b.onclick=()=>window.open(state.files[+b.dataset.i].download_url,"_blank"));document.querySelectorAll(".file-del").forEach(b=>b.onclick=async()=>{const f=state.files[+b.dataset.i];if(!confirm(`${f.name} 파일을 삭제할까요?`))return;try{await deleteFile(f.path,f.sha,`Delete ${f.name}`);await loadFiles();status("filesStatus","✓ 파일을 삭제했습니다.","ok")}catch(e){status("filesStatus","삭제 실패: "+e.message,"err")}})}
$("uploadFileBtn").onclick=async()=>{const file=$("fileUpload").files[0];if(!file)return status("filesStatus","업로드할 파일을 선택하세요.","err");try{const bytes=new Uint8Array(await file.arrayBuffer());const existing=state.files.find(x=>x.name===file.name);await putBytes(`${CONFIG.downloads}/${file.name}`,bytes,existing?.sha,`Upload ${file.name}`);await loadFiles();status("filesStatus","✓ 파일을 업로드했습니다.","ok")}catch(e){status("filesStatus","업로드 실패: "+e.message,"err")}};

/* =========================
   COMMON HELPERS
========================= */
function move(arr,i,d,...renders){const j=i+d;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];renders.forEach(f=>f&&f())}
function renderRep(id,arr,fields,preview){
  $(id).innerHTML=arr.map((x,i)=>`<div class="repeat-row" data-i="${i}"><div class="repeat-top"><strong>${i+1}번</strong><div><button class="btn light mini rp-up">↑</button><button class="btn light mini rp-down">↓</button><button class="btn danger mini rp-del">삭제</button></div></div>${fields.map(([k,l])=>`<label class="label">${l}</label>${k==="desc"||k==="body"?`<textarea class="textarea rp-field" data-k="${k}" style="min-height:60px">${esc(x[k]||"")}</textarea>`:`<input class="input rp-field" data-k="${k}" value="${esc(x[k]||"")}">`}`).join("")}</div>`).join("");
  $(id).querySelectorAll(".repeat-row").forEach(row=>{const i=+row.dataset.i;row.querySelectorAll(".rp-field").forEach(el=>el.oninput=()=>{arr[i][el.dataset.k]=el.value;preview&&preview()});row.querySelector(".rp-up").onclick=()=>move(arr,i,-1,()=>renderRep(id,arr,fields,preview),preview);row.querySelector(".rp-down").onclick=()=>move(arr,i,1,()=>renderRep(id,arr,fields,preview),preview);row.querySelector(".rp-del").onclick=()=>{arr.splice(i,1);renderRep(id,arr,fields,preview);preview&&preview()}})
}
function syncProjects(doc,sec,arr){if(!sec)return;const grid=sec.querySelector(".project-grid");if(!grid)return;grid.innerHTML=arr.map(x=>`<article class="project-card"><span class="year">${esc(x.period)}</span><h3>${esc(x.name)}</h3><p><strong>${esc(x.topic)}</strong><br>${esc(x.desc)}</p></article>`).join("")}
function syncBooks(doc,sec,arr){if(!sec)return;const grid=sec.querySelector(".book-grid");if(!grid)return;grid.innerHTML=arr.map(x=>`<a class="book-card book-link" href="${esc(x.href)}"><span class="year">${esc(x.year)}</span><h3>${esc(x.title)}</h3><p>${esc(x.desc)}</p></a>`).join("")}
