const CONFIG = {
  owner:"bizzip1k",
  repo:"bizzip1k.github.io",
  branch:"main",
  postsPath:"posts.json",
  downloadsDir:"downloads"
};
const TAXONOMY = {"startup": {"label": "창업 준비", "subs": {"idea-validation": {"label": "사업 아이디어 검증", "page": "startup-idea-validation.html"}, "market-check": {"label": "시장성 확인", "page": "startup-market-check.html"}, "business-registration": {"label": "사업자등록", "page": "startup-business-registration.html"}, "trademark": {"label": "상표 출원", "page": "startup-trademark.html"}, "domain": {"label": "도메인 확보", "page": "startup-domain.html"}, "office-contract": {"label": "사무실 계약", "page": "startup-office-contract.html"}, "startup-cost": {"label": "초기비용 계산", "page": "startup-startup-cost.html"}, "startup-checklist": {"label": "사업 시작 체크리스트", "page": "startup-startup-checklist.html"}}}, "product": {"label": "상품과 서비스", "subs": {"product-planning": {"label": "상품기획", "page": "product-product-planning.html"}, "costing": {"label": "원가 계산", "page": "product-costing.html"}, "pricing": {"label": "가격 결정", "page": "product-pricing.html"}, "oem": {"label": "OEM 견적 확인", "page": "product-oem.html"}, "package": {"label": "패키지", "page": "product-package.html"}, "launch-test": {"label": "출시 전 검증", "page": "product-launch-test.html"}}}, "brand": {"label": "브랜드", "subs": {"brand-name": {"label": "브랜드명", "page": "brand-brand-name.html"}, "positioning": {"label": "포지셔닝", "page": "brand-positioning.html"}, "message": {"label": "브랜드 메시지", "page": "brand-message.html"}, "visual": {"label": "비주얼 기준", "page": "brand-visual.html"}, "brand-check": {"label": "브랜드 점검", "page": "brand-brand-check.html"}}}, "marketing": {"label": "마케팅", "subs": {"search": {"label": "검색 노출", "page": "marketing-search.html"}, "ads": {"label": "광고 성과", "page": "marketing-ads.html"}, "content": {"label": "콘텐츠 기획", "page": "marketing-content.html"}, "promotion": {"label": "프로모션", "page": "marketing-promotion.html"}, "conversion": {"label": "전환율", "page": "marketing-conversion.html"}}}, "sales": {"label": "판매와 유통", "subs": {"channel-choice": {"label": "판매채널 선택", "page": "sales-channel-choice.html"}, "naver": {"label": "네이버 판매", "page": "sales-naver.html"}, "coupang": {"label": "쿠팡 판매", "page": "sales-coupang.html"}, "offline": {"label": "오프라인 입점", "page": "sales-offline.html"}, "proposal": {"label": "입점 제안서", "page": "sales-proposal.html"}}}, "operation": {"label": "회사 운영", "subs": {"contract": {"label": "계약 확인", "page": "operation-contract.html"}, "expense": {"label": "비용 관리", "page": "operation-expense.html"}, "outsourcing": {"label": "외주 관리", "page": "operation-outsourcing.html"}, "workflow": {"label": "업무 정리", "page": "operation-workflow.html"}, "document": {"label": "문서 관리", "page": "operation-document.html"}}}, "logistics": {"label": "물류와 재고", "subs": {"3pl": {"label": "3PL 선택", "page": "logistics-3pl.html"}, "inventory": {"label": "재고 관리", "page": "logistics-inventory.html"}, "packing": {"label": "포장비", "page": "logistics-packing.html"}, "returns": {"label": "반품 관리", "page": "logistics-returns.html"}, "warehouse-move": {"label": "물류 이관", "page": "logistics-warehouse-move.html"}}}, "data-ai": {"label": "데이터와 AI", "subs": {"sales-data": {"label": "매출 데이터", "page": "data-ai-sales-data.html"}, "customer-data": {"label": "고객 데이터", "page": "data-ai-customer-data.html"}, "free-data": {"label": "무료 데이터", "page": "data-ai-free-data.html"}, "ai-work": {"label": "AI 업무 활용", "page": "data-ai-ai-work.html"}, "automation": {"label": "업무 자동화", "page": "data-ai-automation.html"}}}};

let token="", posts=[], postsSha="", currentPage={path:"",sha:"",html:""}, currentResource={path:"",sha:"",html:"",downloadPath:""}, currentProblem={path:"",sha:"",html:""}, currentAbout={path:"about.html",sha:"",html:""}, currentContact={path:"contact.html",sha:"",html:""}, files=[];
const $=id=>document.getElementById(id);

function setStatus(message,type="info"){
  const el=$("status"); el.textContent=message; el.className=`status show ${type}`;
}
function setPageStatus(message,type="info"){
  const el=$("pageSaveStatus");
  if(!el)return;
  el.textContent=message;
  el.className=`status show ${type}`;
}
function setResourceStatus(message,type="info"){
  const el=$("resourceSaveStatus");
  if(!el)return;
  el.textContent=message;
  el.className=`status show ${type}`;
}

function setProblemStatus(message,type="info"){
  const el=$("problemSaveStatus");
  if(!el)return;
  el.textContent=message;
  el.className=`status show ${type}`;
}

function setAboutStatus(message,type="info"){
  const el=$("aboutSaveStatus");
  if(!el)return;
  el.textContent=message;
  el.className=`status show ${type}`;
}

function setContactStatus(message,type="info"){
  const el=$("contactSaveStatus");
  if(!el)return;
  el.textContent=message;
  el.className=`status show ${type}`;
}

function todayLocal(){
  const d=new Date(), local=new Date(d.getTime()-d.getTimezoneOffset()*60000);
  return local.toISOString().slice(0,10);
}
function decodeBase64Utf8(base64){
  const binary=atob(base64.replace(/\n/g,""));
  const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
function bytesToBase64(bytes){
  let binary="", chunk=0x8000;
  for(let i=0;i<bytes.length;i+=chunk) binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));
  return btoa(binary);
}
function encodeBase64Utf8(text){ return bytesToBase64(new TextEncoder().encode(text)); }
function escapeHtml(s){ return String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"); }
function ghPath(path){ return `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`; }

async function githubRequest(url,options={}){
  const headers={"Accept":"application/vnd.github+json","Authorization":`Bearer ${token}`,"X-GitHub-Api-Version":"2022-11-28",...(options.headers||{})};
  const res=await fetch(url,{...options,headers});
  if(!res.ok){ let detail=""; try{detail=(await res.json()).message||""}catch{} throw new Error(`${res.status} ${detail}`.trim()); }
  return await res.json();
}
async function getFile(path){ return await githubRequest(ghPath(path)+`?ref=${CONFIG.branch}`); }
async function putFile(path,contentBase64,sha,message){
  const payload={message,content:contentBase64,branch:CONFIG.branch}; if(sha)payload.sha=sha;
  return await githubRequest(ghPath(path),{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
}
async function deleteFile(path,sha,message){
  return await githubRequest(ghPath(path),{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,sha,branch:CONFIG.branch})});
}

function populateTaxonomy(){
  const cats=Object.entries(TAXONOMY).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join("");
  $("category").innerHTML=cats; $("pageCategory").innerHTML=cats;
  fillSubcategories("category","subcategory"); fillSubcategories("pageCategory","pageSubcategory");
}
function fillSubcategories(catId,subId,selected=""){
  const cat=$(catId).value, subs=TAXONOMY[cat]?.subs||{};
  $(subId).innerHTML=Object.entries(subs).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join("");
  if(selected && subs[selected])$(subId).value=selected;
}

document.querySelectorAll(".tab-btn").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
  document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
  btn.classList.add("active"); $(`panel-${btn.dataset.tab}`).classList.add("active");
}));

$("connectBtn").addEventListener("click",async()=>{
  token=$("token").value.trim(); if(!token)return setStatus("GitHub token을 입력해주세요.","err");
  setStatus("GitHub에 연결하는 중입니다…","info");
  try{
    await Promise.all([loadPosts(),loadFiles()]);
    const loadPageBtn=$("loadPageBtn");
    const uploadFileBtn=$("uploadFileBtn");
    const fileInput=$("fileInput");
    if(loadPageBtn) loadPageBtn.disabled=false;
    const loadResourceBtn=$("loadResourceBtn");
    if(loadResourceBtn) loadResourceBtn.disabled=false;
    const loadProblemBtn=$("loadProblemBtn");
    if(loadProblemBtn) loadProblemBtn.disabled=false;
    const loadAboutBtn=$("loadAboutBtn");
    if(loadAboutBtn) loadAboutBtn.disabled=false;
    const loadContactBtn=$("loadContactBtn");
    if(loadContactBtn) loadContactBtn.disabled=false;
    if(uploadFileBtn) uploadFileBtn.disabled=!(fileInput && fileInput.files && fileInput.files.length);
    setStatus(`연결되었습니다. 콘텐츠 ${posts.length}개와 첨부파일 ${files.length}개를 확인했습니다.`,"ok");
  }catch(e){ setStatus("연결하지 못했습니다: "+e.message,"err"); }
});

/* 콘텐츠 */
async function loadPosts(){
  const data=await getFile(CONFIG.postsPath); postsSha=data.sha; posts=JSON.parse(decodeBase64Utf8(data.content));
  posts.sort((a,b)=>String(b.date).localeCompare(String(a.date))); renderPostList(); const saveBtn=$("savePostBtn"); if(saveBtn) saveBtn.disabled=false;
}
function renderPostList(){
  $("postList").innerHTML=posts.length?posts.map((p,i)=>`
    <div class="item"><strong>${escapeHtml(p.title)}</strong>
    <div class="item-meta">${escapeHtml(p.date)} · ${escapeHtml(p.categoryLabel)}${p.subcategoryLabel?" → "+escapeHtml(p.subcategoryLabel):""}</div>
    <div class="item-actions"><button class="admin-btn light" onclick="editPost(${i})">수정</button><button class="admin-btn danger" onclick="removePost(${i})">삭제</button></div></div>`).join(""):'<div class="helper">등록된 콘텐츠가 없습니다.</div>';
}
function sectionsToText(sections=[]){
  const out=[]; sections.forEach(sec=>{ if(sec.heading)out.push("## "+sec.heading); (sec.paragraphs||[]).forEach(p=>{out.push(p);out.push("")}); (sec.bullets||[]).forEach(b=>out.push("- "+b)); out.push(""); });
  return out.join("\n").replace(/\n{3,}/g,"\n\n").trim();
}
function textToSections(text){
  const lines=text.split(/\r?\n/), sections=[]; let current={heading:"본문",paragraphs:[],bullets:[]},buffer=[];
  const flush=()=>{const p=buffer.join(" ").trim();if(p)current.paragraphs.push(p);buffer=[];};
  const push=()=>{flush();if(current.heading||current.paragraphs.length||current.bullets.length)sections.push(current);};
  for(const raw of lines){ const line=raw.trim();
    if(line.startsWith("## ")){if(current.paragraphs.length||current.bullets.length||current.heading!=="본문")push();current={heading:line.slice(3).trim(),paragraphs:[],bullets:[]};}
    else if(line.startsWith("- ")){flush();current.bullets.push(line.slice(2).trim());}
    else if(!line)flush(); else buffer.push(line);
  } push(); return sections.filter(s=>s.paragraphs.length||s.bullets.length||(s.heading&&s.heading!=="본문"));
}
function newPost(){
  $("postId").value="";$("title").value="";$("date").value=todayLocal();$("category").value="startup";fillSubcategories("category","subcategory");$("summary").value="";$("body").value="";$("editNote").textContent="새 글 작성";
}
window.editPost=i=>{
  const p=posts[i]; $("postId").value=p.id||"";$("title").value=p.title||"";$("date").value=p.date||todayLocal();$("category").value=p.category||"startup";fillSubcategories("category","subcategory",p.subcategory||"");$("summary").value=p.summary||"";$("body").value=sectionsToText(p.sections||[]);$("editNote").textContent="기존 글 수정 중";
};
window.removePost=async i=>{
  const p=posts[i]; if(!confirm(`"${p.title}" 글을 삭제할까요?`))return;
  const next=posts.filter((_,idx)=>idx!==i);
  try{const r=await putFile(CONFIG.postsPath,encodeBase64Utf8(JSON.stringify(next,null,2)),postsSha,`Delete post: ${p.title}`);postsSha=r.content.sha;posts=next;renderPostList();newPost();setStatus("콘텐츠를 삭제했습니다.","ok");}
  catch(e){setStatus("삭제하지 못했습니다: "+e.message,"err");}
};
$("newBtn").addEventListener("click",newPost);
$("category").addEventListener("change",()=>fillSubcategories("category","subcategory"));
$("savePostBtn").addEventListener("click",async()=>{
  const title=$("title").value.trim(),date=$("date").value,cat=$("category").value,sub=$("subcategory").value,summary=$("summary").value.trim(),body=$("body").value.trim();
  if(!title||!date||!summary||!body||!sub)return setStatus("제목, 발행일, 세부 메뉴, 요약, 본문을 모두 입력해주세요.","err");
  const subInfo=TAXONOMY[cat].subs[sub],id=$("postId").value||`bizzip-${Date.now()}`;
  const post={id,title,date,category:cat,categoryLabel:TAXONOMY[cat].label,subcategory:sub,subcategoryLabel:subInfo.label,subcategoryPage:subInfo.page,summary,sections:textToSections(body)};
  const idx=posts.findIndex(p=>p.id===id); if(idx>=0)posts[idx]=post;else posts.push(post); posts.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  try{const r=await putFile(CONFIG.postsPath,encodeBase64Utf8(JSON.stringify(posts,null,2)),postsSha,`${idx>=0?"Update":"Add"} post: ${title}`);postsSha=r.content.sha;renderPostList();newPost();setStatus("콘텐츠를 저장했습니다.","ok");}
  catch(e){setStatus("저장하지 못했습니다: "+e.message,"err");}
});

/* 사업실무 페이지 */
$("pageCategory").addEventListener("change",()=>fillSubcategories("pageCategory","pageSubcategory"));
function textList(el){ return Array.from(el?.querySelectorAll("li")||[]).map(li=>li.textContent.trim()).join("\n"); }
function setList(ul,text){ if(!ul)return; const items=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean); ul.innerHTML=items.map(s=>`<li>${escapeHtml(s)}</li>`).join(""); }
function qText(root,sel){ const el=root.querySelector(sel);return el?el.textContent.trim():""; }

$("loadPageBtn").addEventListener("click",async()=>{
  const cat=$("pageCategory").value,sub=$("pageSubcategory").value,path=TAXONOMY[cat].subs[sub].page;
  setStatus(`${TAXONOMY[cat].label} → ${TAXONOMY[cat].subs[sub].label} 페이지를 불러오는 중입니다…`,"info");
  setPageStatus("페이지를 불러오는 중입니다…","info");
  $("savePageBtn").disabled=true;
  try{
    const data=await getFile(path),html=decodeBase64Utf8(data.content); currentPage={path,sha:data.sha,html};
    const doc=new DOMParser().parseFromString(html,"text/html"),article=doc.querySelector("article.article"); if(!article)throw new Error("수정 가능한 본문 영역을 찾지 못했습니다.");
    $("fpTitle").value=qText(doc,".page-hero h1"); $("fpHeroSummary").value=qText(doc,".page-hero h1 + p"); $("fpIntro").value=qText(article,".detail-intro");
    const h2s=Array.from(article.querySelectorAll(":scope > h2")), criteriaH=h2s.find(h=>h.textContent.trim()==="실무에서 먼저 보는 기준");
    $("fpCriteria").value=textList(criteriaH?.nextElementSibling); $("fpAction").value=qText(article,".practice-box p");
    const steps=Array.from(article.querySelectorAll(".step-card")).map(step=>({
      title:qText(step,"strong").replace(/^STEP\s*\d+[.·:]?\s*/i,""),
      body:qText(step,"p")
    }));
    setBusinessSteps(steps.length ? steps : [{title:"",body:""}]);
    $("fpExample").value=qText(article,".example-box p"); $("fpMistakes").value=textList(article.querySelector(".mistake-box ul")); $("fpFinishTitle").value=qText(article,".finish-box strong"); $("fpFinishBody").value=qText(article,".finish-box p");
    $("savePageBtn").disabled=false;
    $("pageEditNote").textContent=`수정 중: ${TAXONOMY[cat].label} → ${TAXONOMY[cat].subs[sub].label}`;
    setStatus("페이지를 불러왔습니다.","ok");
    setPageStatus("페이지를 불러왔습니다. 이제 수정 후 ‘페이지 저장’을 누르세요.","ok");
    renderBusinessPreview();
  }catch(e){
    $("savePageBtn").disabled=true;
    setStatus("페이지를 불러오지 못했습니다: "+e.message,"err");
    setPageStatus("페이지를 불러오지 못했습니다: "+e.message,"err");
  }
});
$("savePageBtn").addEventListener("click",async()=>{
  if(!currentPage.path){
    setPageStatus("먼저 왼쪽에서 페이지를 선택하고 ‘페이지 불러오기’를 눌러주세요.","err");
    return;
  }
  const saveBtn=$("savePageBtn");
  saveBtn.disabled=true;
  saveBtn.textContent="저장 중…";
  setPageStatus("GitHub에 저장하는 중입니다…","info");
  try{
    const doc=new DOMParser().parseFromString(currentPage.html,"text/html"),article=doc.querySelector("article.article");
    const heroTitle=doc.querySelector(".page-hero h1"),heroSummary=doc.querySelector(".page-hero h1 + p"); if(heroTitle)heroTitle.textContent=$("fpTitle").value.trim();if(heroSummary)heroSummary.textContent=$("fpHeroSummary").value.trim();
    const intro=article.querySelector(".detail-intro");if(intro)intro.textContent=$("fpIntro").value.trim();
    const h2s=Array.from(article.querySelectorAll(":scope > h2")),criteriaH=h2s.find(h=>h.textContent.trim()==="실무에서 먼저 보는 기준");setList(criteriaH?.nextElementSibling,$("fpCriteria").value);
    const action=article.querySelector(".practice-box p");if(action)action.textContent=$("fpAction").value.trim();
    syncBusinessStepsToArticle(article);
    const ex=article.querySelector(".example-box p");if(ex)ex.textContent=$("fpExample").value.trim();setList(article.querySelector(".mistake-box ul"),$("fpMistakes").value);
    const ft=article.querySelector(".finish-box strong"),fb=article.querySelector(".finish-box p");if(ft)ft.textContent=$("fpFinishTitle").value.trim();if(fb)fb.textContent=$("fpFinishBody").value.trim();
    const html="<!doctype html>\n"+doc.documentElement.outerHTML,r=await putFile(currentPage.path,encodeBase64Utf8(html),currentPage.sha,`Update business page: ${currentPage.path}`);
    currentPage.sha=r.content.sha;
    currentPage.html=html;
    setStatus("사업실무 페이지를 저장했습니다.","ok");
    setPageStatus("✓ 저장 완료 — GitHub에 정상 저장되었습니다. 사이트 반영에는 잠시 시간이 걸릴 수 있습니다.","saved");
  }catch(e){
    setStatus("페이지 저장에 실패했습니다: "+e.message,"err");
    setPageStatus("저장 실패: "+e.message,"err");
  }finally{
    saveBtn.disabled=false;
    saveBtn.textContent="페이지 저장";
  }
});


/* ---------- 실무자료 관리 ---------- */

function renderResourcePreview(){
  const m=$("resourcePreview"); if(!m)return;
  const title=$("rsTitle")?.value.trim()||"실무자료";
  const hero=$("rsHeroSummary")?.value.trim()||"";
  const usage=previewLines($("rsUsage")?.value||"");
  const tip=$("rsTip")?.value.trim()||"";
  const ex=$("rsExample")?.value.trim()||"";
  const steps=previewLines($("rsSteps")?.value||"");
  const ft=$("rsFinishTitle")?.value.trim()||"";
  const fb=$("rsFinishBody")?.value.trim()||"";
  m.innerHTML=`<div class="live-hero"><div class="live-eyebrow">PRACTICAL RESOURCE</div><h1>${previewEsc(title)}</h1><p>${previewEsc(hero)}</p></div>
  <div class="live-body">
  ${usage.length?`<h2>이 자료는 이렇게 씁니다</h2><ul>${usage.map(x=>`<li>${previewEsc(x)}</li>`).join("")}</ul>`:""}
  ${tip?`<h2>사용 팁</h2><div class="live-box"><p>${previewEsc(tip)}</p></div>`:""}
  ${ex?`<h2>현장 예시</h2><div class="live-box"><p>${previewEsc(ex)}</p></div>`:""}
  ${steps.length?`<h2>실제로 사용하는 순서</h2>${steps.map((x,i)=>`<div class="live-card"><strong>${i+1}. ${previewEsc(x)}</strong></div>`).join("")}`:""}
  ${(ft||fb)?`<div class="live-box"><strong>${previewEsc(ft)}</strong><p>${previewEsc(fb)}</p></div>`:""}
  </div>`;
}
["rsTitle","rsHeroSummary","rsUsage","rsTip","rsExample","rsSteps","rsFinishTitle","rsFinishBody"].forEach(id=>{
  const el=$(id);if(el)el.addEventListener("input",renderResourcePreview);
});

function listTextFrom(el){
  return Array.from(el?.querySelectorAll("li")||[]).map(li=>li.textContent.trim()).join("\n");
}
function fillListElement(el,text){
  if(!el)return;
  const items=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  el.innerHTML=items.map(s=>`<li>${escapeHtml(s)}</li>`).join("");
}
function currentDownloadFromDoc(doc){
  const a=doc.querySelector('a[href^="downloads/"]');
  return a ? a.getAttribute("href") : "";
}
function ensureDownloadButton(doc,path){
  const article=doc.querySelector("article.article");
  if(!article)return;
  let a=article.querySelector('a[href^="downloads/"]');
  let wrapper=a?.parentElement;

  if(!path){
    if(wrapper && wrapper.querySelector('a[href^="downloads/"]')) wrapper.remove();
    return;
  }

  if(!a){
    wrapper=doc.createElement("div");
    wrapper.setAttribute("style","margin-top:24px");
    a=doc.createElement("a");
    a.className="btn primary";
    a.setAttribute("download","");
    a.textContent="샘플 파일 내려받기";
    wrapper.appendChild(a);
    article.appendChild(wrapper);
  }
  a.setAttribute("href",path);
}

$("loadResourceBtn").addEventListener("click",async()=>{
  const path=$("resourceSelect").value;
  $("saveResourceBtn").disabled=true;
  setResourceStatus("실무자료를 불러오는 중입니다…","info");
  try{
    const data=await getFile(path);
    const html=decodeBase64Utf8(data.content);
    const doc=new DOMParser().parseFromString(html,"text/html");
    const article=doc.querySelector("article.article");
    if(!article)throw new Error("실무자료 본문 영역을 찾지 못했습니다.");

    currentResource={path,sha:data.sha,html,downloadPath:currentDownloadFromDoc(doc)};

    $("rsTitle").value=qText(doc,".page-hero h1");
    $("rsHeroSummary").value=qText(doc,".page-hero h1 + p");

    const h2s=Array.from(article.querySelectorAll(":scope > h2"));
    const usageH=h2s.find(h=>h.textContent.trim()==="이 자료는 이렇게 씁니다");
    const stepsH=h2s.find(h=>h.textContent.trim()==="실제로 사용하는 순서");

    $("rsUsage").value=listTextFrom(usageH?.nextElementSibling);
    $("rsTip").value=qText(article,".practice-box p");
    $("rsExample").value=qText(article,".example-box p");
    $("rsSteps").value=listTextFrom(stepsH?.nextElementSibling);
    $("rsFinishTitle").value=qText(article,".finish-box strong");
    $("rsFinishBody").value=qText(article,".finish-box p");

    const current=currentResource.downloadPath;
    $("rsCurrentFile").textContent=current ? current.replace("downloads/","") : "현재 연결된 다운로드 파일이 없습니다.";
    setResourceDownloadButton(current);
    $("rsFileName").value=current ? current.replace("downloads/","") : "";
    $("rsFileInput").value="";
    $("rsSelectedFileInfo").textContent="파일을 바꾸지 않으려면 선택하지 않아도 됩니다.";

    $("saveResourceBtn").disabled=false;
    $("resourceEditNote").textContent=`수정 중: ${$("resourceSelect").selectedOptions[0].textContent}`;
    setResourceStatus("실무자료를 불러왔습니다. 수정 후 ‘실무자료 저장’을 누르세요.","ok");
    renderResourcePreview();
  }catch(e){
    $("saveResourceBtn").disabled=true;
    setResourceStatus("실무자료를 불러오지 못했습니다: "+e.message,"err");
  }
});

$("resourceSelect").addEventListener("change",()=>{
  $("saveResourceBtn").disabled=true;
  $("resourceEditNote").textContent="자료를 다시 불러오세요";
  setResourceStatus("선택이 바뀌었습니다. ‘자료 불러오기’를 눌러주세요.","info");
});

$("rsFileInput").addEventListener("change",()=>{
  const f=$("rsFileInput").files[0];
  if(!f){
    $("rsSelectedFileInfo").textContent="파일을 바꾸지 않으려면 선택하지 않아도 됩니다.";
    return;
  }
  $("rsFileName").value=f.name;
  $("rsSelectedFileInfo").textContent=`선택됨: ${f.name} · ${humanSize(f.size)}`;
});

$("saveResourceBtn").addEventListener("click",async()=>{
  if(!currentResource.path){
    setResourceStatus("먼저 실무자료를 불러와주세요.","err");
    return;
  }

  const btn=$("saveResourceBtn");
  btn.disabled=true;
  btn.textContent="저장 중…";
  setResourceStatus("실무자료와 첨부파일을 저장하는 중입니다…","info");

  try{
    const doc=new DOMParser().parseFromString(currentResource.html,"text/html");
    const article=doc.querySelector("article.article");
    if(!article)throw new Error("실무자료 본문 영역을 찾지 못했습니다.");

    const heroTitle=doc.querySelector(".page-hero h1");
    const heroSummary=doc.querySelector(".page-hero h1 + p");
    if(heroTitle)heroTitle.textContent=$("rsTitle").value.trim();
    if(heroSummary)heroSummary.textContent=$("rsHeroSummary").value.trim();

    const h2s=Array.from(article.querySelectorAll(":scope > h2"));
    const usageH=h2s.find(h=>h.textContent.trim()==="이 자료는 이렇게 씁니다");
    const stepsH=h2s.find(h=>h.textContent.trim()==="실제로 사용하는 순서");
    fillListElement(usageH?.nextElementSibling,$("rsUsage").value);

    const tip=article.querySelector(".practice-box p");
    if(tip)tip.textContent=$("rsTip").value.trim();

    const ex=article.querySelector(".example-box p");
    if(ex)ex.textContent=$("rsExample").value.trim();

    fillListElement(stepsH?.nextElementSibling,$("rsSteps").value);

    const ft=article.querySelector(".finish-box strong");
    const fb=article.querySelector(".finish-box p");
    if(ft)ft.textContent=$("rsFinishTitle").value.trim();
    if(fb)fb.textContent=$("rsFinishBody").value.trim();

    let finalDownloadPath=currentResource.downloadPath;
    const newFile=$("rsFileInput").files[0];
    let fileName=$("rsFileName").value.trim();

    if(newFile){
      if(!fileName)fileName=newFile.name;
      if(fileName.includes("/")||fileName.includes("\\"))throw new Error("첨부파일명에는 / 또는 \\\\ 문자를 사용할 수 없습니다.");

      const uploadPath=`${CONFIG.downloadsDir}/${fileName}`;
      let existingSha="";
      try{
        const existing=await getFile(uploadPath);
        existingSha=existing.sha;
      }catch(e){
        if(!String(e.message).startsWith("404"))throw e;
      }

      const bytes=new Uint8Array(await newFile.arrayBuffer());
      await putFile(uploadPath,bytesToBase64(bytes),existingSha,`${existingSha?"Replace":"Add"} resource attachment: ${fileName}`);
      finalDownloadPath=uploadPath;
    }else if(fileName){
      finalDownloadPath=`${CONFIG.downloadsDir}/${fileName}`;
    }

    ensureDownloadButton(doc,finalDownloadPath);

    const newHtml="<!doctype html>\n"+doc.documentElement.outerHTML;
    const result=await putFile(currentResource.path,encodeBase64Utf8(newHtml),currentResource.sha,`Update resource page: ${currentResource.path}`);

    currentResource.sha=result.content.sha;
    currentResource.html=newHtml;
    currentResource.downloadPath=finalDownloadPath;

    $("rsCurrentFile").textContent=finalDownloadPath ? finalDownloadPath.replace("downloads/","") : "현재 연결된 다운로드 파일이 없습니다.";
    setResourceDownloadButton(finalDownloadPath);
    $("rsFileInput").value="";
    $("rsSelectedFileInfo").textContent="파일을 바꾸지 않으려면 선택하지 않아도 됩니다.";

    await loadFiles();

    setStatus("실무자료를 저장했습니다.","ok");
    setResourceStatus("✓ 저장 완료 — 페이지 내용과 다운로드 파일 연결이 GitHub에 정상 저장되었습니다.","saved");
  }catch(e){
    setStatus("실무자료 저장에 실패했습니다: "+e.message,"err");
    setResourceStatus("저장 실패: "+e.message,"err");
  }finally{
    btn.disabled=false;
    btn.textContent="실무자료 저장";
  }
});


/* ---------- 문제별 해결 관리 ---------- */
function renderProblemPreview(){
  const m=$("problemPreview");if(!m)return;
  const title=$("pbTitle")?.value.trim()||"문제별 해결";
  const hero=$("pbHeroSummary")?.value.trim()||"";
  const st=$("pbSectionTitle")?.value.trim()||"";
  const ss=$("pbSectionSummary")?.value.trim()||"";
  const cards=getRepeaterData("problemCardsEditor");
  const qt=$("pbQuickTitle")?.value.trim()||"";
  const qs=$("pbQuickSummary")?.value.trim()||"";
  const checks=getRepeaterData("quickChecksEditor");
  m.innerHTML=`<div class="live-hero"><div class="live-eyebrow">PROBLEM SOLVING</div><h1>${previewEsc(title)}</h1><p>${previewEsc(hero)}</p></div>
  <div class="live-body">
    ${st?`<h2>${previewEsc(st)}</h2>`:""}${ss?`<p>${previewEsc(ss)}</p>`:""}
    ${cards.map(c=>`<div class="live-card"><strong>${previewEsc(c.title)}</strong><p>${previewEsc(c.body)}</p></div>`).join("")}
    ${qt?`<h2>${previewEsc(qt)}</h2>`:""}${qs?`<p>${previewEsc(qs)}</p>`:""}
    ${checks.map(c=>`<div class="live-card"><strong>${previewEsc(c.title)}</strong><p>${previewEsc(c.body)}</p></div>`).join("")}
  </div>`;
}
["pbTitle","pbHeroSummary","pbSectionTitle","pbSectionSummary","pbQuickTitle","pbQuickSummary"].forEach(id=>{
  const el=$(id);if(el)el.addEventListener("input",renderProblemPreview);
});

$("loadProblemBtn").addEventListener("click",async()=>{
  const path=$("problemSelect").value;
  $("saveProblemBtn").disabled=true;
  setProblemStatus("문제 페이지를 불러오는 중입니다…","info");
  try{
    const data=await getFile(path);
    const html=decodeBase64Utf8(data.content);
    const doc=new DOMParser().parseFromString(html,"text/html");
    const hero=doc.querySelector(".page-hero");
    const sections=doc.querySelectorAll("main > section");
    const cards=Array.from(doc.querySelectorAll(".problem-subcard"));
    const featureBoxes=Array.from(doc.querySelectorAll(".feature-box"));
    if(!hero || !cards.length || !featureBoxes.length)throw new Error("현재 문제 페이지 구조를 인식하지 못했습니다.");

    currentProblem={path,sha:data.sha,html};
    $("pbTitle").value=qText(doc,".page-hero h1");
    $("pbHeroSummary").value=qText(doc,".page-hero h1 + p");

    const firstHead=sections[1]?.querySelector(".section-head");
    $("pbSectionTitle").value=qText(firstHead||doc,"h2");
    $("pbSectionSummary").value=qText(firstHead||doc,"p");

    makeRepeater("problemCardsEditor",cards.map(c=>({
      title:qText(c,"h3"),body:qText(c,"p"),href:c.getAttribute("href")||""
    })),[
      {key:"title",label:"카드 제목"},
      {key:"body",label:"카드 설명",type:"textarea",height:70}
    ],renderProblemPreview);

    const quickHead=sections[2]?.querySelector(".section-head");
    $("pbQuickTitle").value=qText(quickHead||doc,"h2");
    $("pbQuickSummary").value=qText(quickHead||doc,"p");

    makeRepeater("quickChecksEditor",featureBoxes.map(c=>({
      title:qText(c,"h3"),body:qText(c,"p")
    })),[
      {key:"title",label:"QUICK CHECK 제목"},
      {key:"body",label:"QUICK CHECK 설명",type:"textarea",height:70}
    ],renderProblemPreview);

    $("saveProblemBtn").disabled=false;
    $("problemEditNote").textContent=`수정 중: ${$("problemSelect").selectedOptions[0].textContent}`;
    setProblemStatus("문제 페이지를 불러왔습니다. 수정 후 저장하세요.","ok");
    renderProblemPreview();
  }catch(e){
    setProblemStatus("문제 페이지를 불러오지 못했습니다: "+e.message,"err");
  }
});
$("problemSelect").addEventListener("change",()=>{
  $("saveProblemBtn").disabled=true;$("problemEditNote").textContent="페이지를 다시 불러오세요";
  setProblemStatus("선택이 바뀌었습니다. ‘문제 페이지 불러오기’를 눌러주세요.","info");
});
$("addProblemCardBtn").addEventListener("click",()=>addRepeaterItem("problemCardsEditor",{title:"",body:"",href:""},renderProblemPreview));
$("removeProblemCardBtn").addEventListener("click",()=>removeLastRepeaterItem("problemCardsEditor",renderProblemPreview));
$("addQuickCheckBtn").addEventListener("click",()=>addRepeaterItem("quickChecksEditor",{title:"",body:""},renderProblemPreview));
$("removeQuickCheckBtn").addEventListener("click",()=>removeLastRepeaterItem("quickChecksEditor",renderProblemPreview));

$("saveProblemBtn").addEventListener("click",async()=>{
  if(!currentProblem.path)return setProblemStatus("먼저 문제 페이지를 불러와주세요.","err");
  const btn=$("saveProblemBtn");btn.disabled=true;btn.textContent="저장 중…";
  setProblemStatus("GitHub에 저장하는 중입니다…","info");
  try{
    const doc=new DOMParser().parseFromString(currentProblem.html,"text/html");
    const sections=doc.querySelectorAll("main > section");
    const heroTitle=doc.querySelector(".page-hero h1");
    const heroSummary=doc.querySelector(".page-hero h1 + p");
    if(heroTitle)heroTitle.textContent=$("pbTitle").value.trim();
    if(heroSummary)heroSummary.textContent=$("pbHeroSummary").value.trim();

    const firstHead=sections[1]?.querySelector(".section-head");
    if(firstHead?.querySelector("h2"))firstHead.querySelector("h2").textContent=$("pbSectionTitle").value.trim();
    if(firstHead?.querySelector("p"))firstHead.querySelector("p").textContent=$("pbSectionSummary").value.trim();

    const grid=doc.querySelector(".problem-subgrid");
    const existingCards=Array.from(doc.querySelectorAll(".problem-subcard"));
    if(grid && existingCards.length){
      const template=existingCards[0].cloneNode(true);
      existingCards.forEach(x=>x.remove());
      getRepeaterData("problemCardsEditor").forEach((c,i)=>{
        const node=template.cloneNode(true);
        const h3=node.querySelector("h3"),p=node.querySelector("p");
        if(h3)h3.textContent=c.title||"";
        if(p)p.textContent=c.body||"";
        const href=c.href || "";
        if(href)node.setAttribute("href",href); else node.removeAttribute("href");
        grid.appendChild(node);
      });
    }

    const quickHead=sections[2]?.querySelector(".section-head");
    if(quickHead?.querySelector("h2"))quickHead.querySelector("h2").textContent=$("pbQuickTitle").value.trim();
    if(quickHead?.querySelector("p"))quickHead.querySelector("p").textContent=$("pbQuickSummary").value.trim();

    const pair=doc.querySelector(".feature-pair");
    const featureBoxes=Array.from(doc.querySelectorAll(".feature-box"));
    if(pair && featureBoxes.length){
      const template=featureBoxes[0].cloneNode(true);
      featureBoxes.forEach(x=>x.remove());
      getRepeaterData("quickChecksEditor").forEach(c=>{
        const node=template.cloneNode(true);
        const h3=node.querySelector("h3"),p=node.querySelector("p");
        if(h3)h3.textContent=c.title||"";
        if(p)p.textContent=c.body||"";
        pair.appendChild(node);
      });
    }

    const newHtml="<!doctype html>\n"+doc.documentElement.outerHTML;
    const result=await putFile(currentProblem.path,encodeBase64Utf8(newHtml),currentProblem.sha,`Update problem page: ${currentProblem.path}`);
    currentProblem.sha=result.content.sha;currentProblem.html=newHtml;
    setStatus("문제별 해결 페이지를 저장했습니다.","ok");
    setProblemStatus("✓ 저장 완료 — 문제 페이지가 GitHub에 정상 저장되었습니다.","saved");
  }catch(e){
    setProblemStatus("저장 실패: "+e.message,"err");
  }finally{
    btn.disabled=false;btn.textContent="문제 페이지 저장";
  }
});

/* ---------- BIZZIP 소개 관리 ---------- */
function renderAboutPreview(){
  const m=$("aboutPreview");if(!m)return;
  const title=$("abTitle")?.value.trim()||"BIZZIP 소개";
  const hero=$("abHeroSummary")?.value.trim()||"";
  const opTitle=$("abOperatorTitle")?.value.trim()||"";
  const opBody=$("abOperatorBody")?.value.trim()||"";
  const opList=previewLines($("abOperatorList")?.value||"");
  const cons=getRepeaterData("consultingEditor");
  const brands=getRepeaterData("brandProjectsEditor");
  const books=getRepeaterData("booksEditor");
  m.innerHTML=`<div class="live-hero"><div class="live-eyebrow">ABOUT BIZZIP</div><h1>${previewEsc(title)}</h1><p>${previewEsc(hero)}</p></div>
  <div class="live-body">
    ${opTitle?`<h2>${previewEsc(opTitle)}</h2>`:""}${opBody?`<p>${previewEsc(opBody)}</p>`:""}
    ${opList.length?`<ul>${opList.map(x=>`<li>${previewEsc(x)}</li>`).join("")}</ul>`:""}
    ${cons.length?`<h2>2026 컨설팅 프로젝트</h2>${cons.map(c=>`<div class="live-card"><strong>${previewEsc(c.name)} ${c.period?`/ ${previewEsc(c.period)}`:""}</strong><p>${previewEsc(c.topic)} ${c.desc?`- ${previewEsc(c.desc)}`:""}</p></div>`).join("")}`:""}
    ${brands.length?`<h2>주요 브랜드 프로젝트</h2>${brands.map(c=>`<div class="live-card"><strong>${previewEsc(c.name)} ${c.year?`/ ${previewEsc(c.year)}`:""}</strong><p>${previewEsc(c.topic)} ${c.desc?`- ${previewEsc(c.desc)}`:""}</p></div>`).join("")}`:""}
    ${books.length?`<h2>출판서적</h2>${books.map(c=>`<div class="live-card"><strong>${previewEsc(c.title)} ${c.year?`/ ${previewEsc(c.year)}`:""}</strong><p>${previewEsc(c.desc)}</p></div>`).join("")}`:""}
  </div>`;
}
["abTitle","abHeroSummary","abOperatorTitle","abOperatorBody","abOperatorList"].forEach(id=>{
  const el=$(id);if(el)el.addEventListener("input",renderAboutPreview);
});
$("addConsultingBtn").addEventListener("click",()=>addRepeaterItem("consultingEditor",{period:"",name:"",topic:"",desc:""},renderAboutPreview));
$("removeConsultingBtn").addEventListener("click",()=>removeLastRepeaterItem("consultingEditor",renderAboutPreview));
$("addBrandProjectBtn").addEventListener("click",()=>addRepeaterItem("brandProjectsEditor",{year:"",name:"",topic:"",desc:""},renderAboutPreview));
$("removeBrandProjectBtn").addEventListener("click",()=>removeLastRepeaterItem("brandProjectsEditor",renderAboutPreview));
$("addBookBtn").addEventListener("click",()=>addRepeaterItem("booksEditor",{year:"",title:"",desc:"",href:""},renderAboutPreview));
$("removeBookBtn").addEventListener("click",()=>removeLastRepeaterItem("booksEditor",renderAboutPreview));

$("loadAboutBtn").addEventListener("click",async()=>{
  $("saveAboutBtn").disabled=true;setAboutStatus("BIZZIP 소개 페이지를 불러오는 중입니다…","info");
  try{
    const data=await getFile("about.html");
    const html=decodeBase64Utf8(data.content);
    const doc=new DOMParser().parseFromString(html,"text/html");
    currentAbout={path:"about.html",sha:data.sha,html};
    $("abTitle").value=qText(doc,".page-hero h1");
    $("abHeroSummary").value=qText(doc,".page-hero h1 + p");
    $("abOperatorTitle").value=qText(doc,".about-equal .panel h2");
    $("abOperatorBody").value=qText(doc,".about-equal .panel > p");
    $("abOperatorList").value=Array.from(doc.querySelectorAll(".about-equal .panel .list > div")).map(x=>x.textContent.trim()).join("\n");

    const sections=Array.from(doc.querySelectorAll(".about-section"));
    const cons=Array.from(sections[0]?.querySelectorAll(".project-card")||[]).map(c=>({
      period:qText(c,".year"),name:qText(c,"h3"),
      topic:qText(c,"p strong"),
      desc:(qText(c,"p")||"").replace(qText(c,"p strong")||"","").trim()
    }));
    const brands=Array.from(sections[1]?.querySelectorAll(".project-card")||[]).map(c=>({
      year:qText(c,".year"),name:qText(c,"h3"),
      topic:qText(c,"p strong"),
      desc:(qText(c,"p")||"").replace(qText(c,"p strong")||"","").trim()
    }));
    const books=Array.from(sections[2]?.querySelectorAll(".book-card")||[]).map(c=>({
      year:qText(c,".year"),title:qText(c,"h3"),desc:qText(c,"p"),href:c.getAttribute("href")||""
    }));

    makeRepeater("consultingEditor",cons.length?cons:[{period:"",name:"",topic:"",desc:""}],[
      {key:"period",label:"기간"},{key:"name",label:"회사명"},{key:"topic",label:"주제"},{key:"desc",label:"설명",type:"textarea",height:70}
    ],renderAboutPreview);
    makeRepeater("brandProjectsEditor",brands.length?brands:[{year:"",name:"",topic:"",desc:""}],[
      {key:"year",label:"연도"},{key:"name",label:"브랜드명"},{key:"topic",label:"주제"},{key:"desc",label:"설명",type:"textarea",height:70}
    ],renderAboutPreview);
    makeRepeater("booksEditor",books.length?books:[{year:"",title:"",desc:"",href:""}],[
      {key:"year",label:"연도"},{key:"title",label:"도서명"},{key:"desc",label:"설명",type:"textarea",height:70},{key:"href",label:"링크"}
    ],renderAboutPreview);

    $("saveAboutBtn").disabled=false;$("aboutEditNote").textContent="BIZZIP 소개 수정 중";
    setAboutStatus("소개 페이지를 불러왔습니다. 수정 후 저장하세요.","ok");
    renderAboutPreview();
  }catch(e){setAboutStatus("소개 페이지를 불러오지 못했습니다: "+e.message,"err");}
});

$("saveAboutBtn").addEventListener("click",async()=>{
  if(!currentAbout.sha)return setAboutStatus("먼저 소개 페이지를 불러와주세요.","err");
  const btn=$("saveAboutBtn");btn.disabled=true;btn.textContent="저장 중…";setAboutStatus("GitHub에 저장하는 중입니다…","info");
  try{
    const doc=new DOMParser().parseFromString(currentAbout.html,"text/html");
    const heroTitle=doc.querySelector(".page-hero h1"),heroSummary=doc.querySelector(".page-hero h1 + p");
    if(heroTitle)heroTitle.textContent=$("abTitle").value.trim(); if(heroSummary)heroSummary.textContent=$("abHeroSummary").value.trim();
    const opTitle=doc.querySelector(".about-equal .panel h2"),opBody=doc.querySelector(".about-equal .panel > p");
    if(opTitle)opTitle.textContent=$("abOperatorTitle").value.trim(); if(opBody)opBody.textContent=$("abOperatorBody").value.trim();
    const opList=Array.from(doc.querySelectorAll(".about-equal .panel .list > div")),opLines=previewLines($("abOperatorList").value);
    opList.forEach((el,i)=>{if(opLines[i])el.textContent=opLines[i];});

    const sections=Array.from(doc.querySelectorAll(".about-section"));
    function syncCards(container,cards,templateSelector,kind){
      const old=Array.from(container.querySelectorAll(templateSelector)); if(!old.length)return;
      const template=old[0].cloneNode(true);old.forEach(x=>x.remove());
      cards.forEach(c=>{
        const node=template.cloneNode(true);
        const y=node.querySelector(".year"),h3=node.querySelector("h3"),p=node.querySelector("p");
        if(kind==="book"){
          if(y)y.textContent=c.year||"";if(h3)h3.textContent=c.title||"";if(p)p.textContent=c.desc||"";if(c.href)node.setAttribute("href",c.href);
        }else{
          if(y)y.textContent=(c.period||c.year||"");if(h3)h3.textContent=c.name||"";
          if(p){p.innerHTML="";const strong=document.createElement("strong");strong.textContent=c.topic||"";p.appendChild(strong);p.appendChild(document.createElement("br"));p.appendChild(document.createTextNode(c.desc||""));}
        }
        container.appendChild(node);
      });
    }
    if(sections[0])syncCards(sections[0],getRepeaterData("consultingEditor"),".project-card","project");
    if(sections[1])syncCards(sections[1],getRepeaterData("brandProjectsEditor"),".project-card","project");
    if(sections[2])syncCards(sections[2],getRepeaterData("booksEditor"),".book-card","book");

    const newHtml="<!doctype html>\n"+doc.documentElement.outerHTML;
    const result=await putFile("about.html",encodeBase64Utf8(newHtml),currentAbout.sha,"Update BIZZIP about page");
    currentAbout.sha=result.content.sha;currentAbout.html=newHtml;
    setStatus("BIZZIP 소개 페이지를 저장했습니다.","ok");
    setAboutStatus("✓ 저장 완료 — BIZZIP 소개 페이지가 GitHub에 정상 저장되었습니다.","saved");
  }catch(e){setAboutStatus("저장 실패: "+e.message,"err");}
  finally{btn.disabled=false;btn.textContent="BIZZIP 소개 저장";}
});
/* ---------- 사업실무 실시간 미리보기 ---------- */
function previewLines(text){
  return text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
}
function previewEsc(text){
  return escapeHtml(text||"");
}
function renderBusinessPreview(){
  const mount=$("businessPreview");
  if(!mount)return;

  const title=$("fpTitle")?.value.trim()||"페이지 제목";
  const hero=$("fpHeroSummary")?.value.trim()||"상단 한줄 설명";
  const intro=$("fpIntro")?.value.trim()||"";
  const criteria=previewLines($("fpCriteria")?.value||"");
  const action=$("fpAction")?.value.trim()||"";
  const example=$("fpExample")?.value.trim()||"";
  const mistakes=previewLines($("fpMistakes")?.value||"");
  const finishTitle=$("fpFinishTitle")?.value.trim()||"";
  const finishBody=$("fpFinishBody")?.value.trim()||"";

  const steps=getBusinessSteps();

  let bodyHtml="";
  if(intro) bodyHtml+=`<h2>왜 이 내용을 먼저 봐야 할까요?</h2><p>${previewEsc(intro)}</p>`;
  if(criteria.length){
    bodyHtml+=`<h2>실무에서 먼저 보는 기준</h2><ul>${criteria.map(x=>`<li>${previewEsc(x)}</li>`).join("")}</ul>`;
  }
  if(action){
    bodyHtml+=`<h2>바로 해볼 일</h2><div class="preview-box"><p>${previewEsc(action)}</p></div>`;
  }
  if(steps.some(s=>s.title||s.body)){
    bodyHtml+=`<h2>실행 순서</h2>`;
    steps.forEach((s,i)=>{
      if(!s.title&&!s.body)return;
      bodyHtml+=`<div class="preview-step"><strong>STEP ${i+1}. ${previewEsc(s.title)}</strong><p>${previewEsc(s.body)}</p></div>`;
    });
  }
  if(example){
    bodyHtml+=`<h2>현장 예시</h2><div class="preview-box"><p>${previewEsc(example)}</p></div>`;
  }
  if(mistakes.length){
    bodyHtml+=`<h2>자주 하는 실수</h2><ul>${mistakes.map(x=>`<li>${previewEsc(x)}</li>`).join("")}</ul>`;
  }
  if(finishTitle||finishBody){
    bodyHtml+=`<div class="preview-box"><strong>${previewEsc(finishTitle)}</strong><p>${previewEsc(finishBody)}</p></div>`;
  }

  mount.innerHTML=`
    <div class="preview-hero">
      <div class="preview-eyebrow">BUSINESS PRACTICE</div>
      <h1>${previewEsc(title)}</h1>
      <p>${previewEsc(hero)}</p>
    </div>
    <div class="preview-body">${bodyHtml||"<p>내용을 입력하면 이곳에 미리 표시됩니다.</p>"}</div>
  `;
}

[
  "fpTitle","fpHeroSummary","fpIntro","fpCriteria","fpAction",
  "fpExample","fpMistakes","fpFinishTitle","fpFinishBody"
].forEach(id=>{
  const el=$(id);
  if(el)el.addEventListener("input",renderBusinessPreview);
});


/* ---------- 문의 관리 ---------- */
let contactMethodsData=[{title:"",body:"",linkText:"",href:""}];
function renderContactMethods(){
  makeRepeater("contactMethods",contactMethodsData,[
    {key:"title",label:"항목 제목"},
    {key:"body",label:"설명",type:"textarea",height:70},
    {key:"linkText",label:"링크/버튼 문구"},
    {key:"href",label:"연결 주소"}
  ],renderContactPreview);
}
function renderContactPreview(){
  const m=$("contactPreview");if(!m)return;
  const title=$("ctTitle")?.value.trim()||"문의";
  const hero=$("ctHeroSummary")?.value.trim()||"";
  const st=$("ctSectionTitle")?.value.trim()||"";
  const sb=$("ctSectionBody")?.value.trim()||"";
  const methods=getRepeaterData("contactMethods");
  const finish=$("ctFinish")?.value.trim()||"";
  m.innerHTML=`<div class="live-hero"><div class="live-eyebrow">CONTACT</div><h1>${previewEsc(title)}</h1><p>${previewEsc(hero)}</p></div>
  <div class="live-body">${st?`<h2>${previewEsc(st)}</h2>`:""}${sb?`<p>${previewEsc(sb)}</p>`:""}
  ${methods.map(x=>`<div class="live-card"><strong>${previewEsc(x.title)}</strong><p>${previewEsc(x.body)}</p>${x.linkText?`<div class="live-box">${previewEsc(x.linkText)}</div>`:""}</div>`).join("")}
  ${finish?`<div class="live-box"><p>${previewEsc(finish)}</p></div>`:""}</div>`;
}
["ctTitle","ctHeroSummary","ctSectionTitle","ctSectionBody","ctFinish"].forEach(id=>{
  const el=$(id);if(el)el.addEventListener("input",renderContactPreview);
});
$("addContactMethodBtn").addEventListener("click",()=>addRepeaterItem("contactMethods",{title:"",body:"",linkText:"",href:""},renderContactPreview));
$("removeContactMethodBtn").addEventListener("click",()=>removeLastRepeaterItem("contactMethods",renderContactPreview));

$("loadContactBtn").addEventListener("click",async()=>{
  $("saveContactBtn").disabled=true;setContactStatus("문의 페이지를 불러오는 중입니다…","info");
  try{
    const data=await getFile("contact.html");
    const html=decodeBase64Utf8(data.content);
    const doc=new DOMParser().parseFromString(html,"text/html");
    currentContact={path:"contact.html",sha:data.sha,html};

    $("ctTitle").value=qText(doc,".page-hero h1");
    $("ctHeroSummary").value=qText(doc,".page-hero h1 + p");

    const mainCard=doc.querySelector("main .panel, main .article, main section .wrap > div");
    $("ctSectionTitle").value=qText(mainCard||doc,"h2");
    $("ctSectionBody").value=qText(mainCard||doc,"p");

    const candidates=Array.from(doc.querySelectorAll("main .feature-box, main .contact-card, main .card, main .panel")).filter(x=>x!==mainCard);
    const methods=candidates.slice(0,4).map(c=>{
      const a=c.querySelector("a");
      return {title:qText(c,"h3")||qText(c,"strong"),body:qText(c,"p"),linkText:a?.textContent.trim()||"",href:a?.getAttribute("href")||""};
    }).filter(x=>x.title||x.body||x.linkText);

    contactMethodsData=methods.length?methods:[{title:"",body:"",linkText:"",href:""}];
    makeRepeater("contactMethods",contactMethodsData,[
      {key:"title",label:"항목 제목"},{key:"body",label:"설명",type:"textarea",height:70},{key:"linkText",label:"링크/버튼 문구"},{key:"href",label:"연결 주소"}
    ],renderContactPreview);

    const ps=Array.from(doc.querySelectorAll("main p"));
    $("ctFinish").value=ps.length?ps[ps.length-1].textContent.trim():"";

    $("saveContactBtn").disabled=false;$("contactEditNote").textContent="문의 페이지 수정 중";
    setContactStatus("문의 페이지를 불러왔습니다. 수정 후 저장하세요.","ok");
    renderContactPreview();
  }catch(e){setContactStatus("문의 페이지를 불러오지 못했습니다: "+e.message,"err");}
});

$("saveContactBtn").addEventListener("click",async()=>{
  if(!currentContact.sha)return setContactStatus("먼저 문의 페이지를 불러와주세요.","err");
  const btn=$("saveContactBtn");btn.disabled=true;btn.textContent="저장 중…";setContactStatus("GitHub에 저장하는 중입니다…","info");
  try{
    const doc=new DOMParser().parseFromString(currentContact.html,"text/html");
    const h1=doc.querySelector(".page-hero h1"),hp=doc.querySelector(".page-hero h1 + p");
    if(h1)h1.textContent=$("ctTitle").value.trim();if(hp)hp.textContent=$("ctHeroSummary").value.trim();

    const mainCard=doc.querySelector("main .panel, main .article, main section .wrap > div");
    if(mainCard){
      const h2=mainCard.querySelector("h2"),p=mainCard.querySelector("p");
      if(h2)h2.textContent=$("ctSectionTitle").value.trim();
      if(p)p.textContent=$("ctSectionBody").value.trim();
    }

    const candidates=Array.from(doc.querySelectorAll("main .feature-box, main .contact-card, main .card, main .panel")).filter(x=>x!==mainCard);
    const data=getRepeaterData("contactMethods");
    candidates.forEach((c,i)=>{
      if(!data[i])return;
      const h=c.querySelector("h3, strong"),p=c.querySelector("p"),a=c.querySelector("a");
      if(h)h.textContent=data[i].title||"";
      if(p)p.textContent=data[i].body||"";
      if(a){a.textContent=data[i].linkText||"";if(data[i].href)a.setAttribute("href",data[i].href);}
    });

    const ps=Array.from(doc.querySelectorAll("main p"));
    if(ps.length && $("ctFinish").value.trim())ps[ps.length-1].textContent=$("ctFinish").value.trim();

    const newHtml="<!doctype html>\n"+doc.documentElement.outerHTML;
    const result=await putFile("contact.html",encodeBase64Utf8(newHtml),currentContact.sha,"Update contact page");
    currentContact.sha=result.content.sha;currentContact.html=newHtml;
    setStatus("문의 페이지를 저장했습니다.","ok");
    setContactStatus("✓ 저장 완료 — 문의 페이지가 GitHub에 정상 저장되었습니다.","saved");
  }catch(e){setContactStatus("저장 실패: "+e.message,"err");}
  finally{btn.disabled=false;btn.textContent="문의 페이지 저장";}
});

/* 첨부파일 */
async function loadFiles(){
  try{const data=await githubRequest(ghPath(CONFIG.downloadsDir)+`?ref=${CONFIG.branch}`);files=(Array.isArray(data)?data:[]).filter(x=>x.type==="file");}
  catch(e){if(String(e.message).startsWith("404"))files=[];else throw e;} renderFileList();
}

function siteDownloadUrl(name){
  return `downloads/${encodeURIComponent(name).replaceAll("%2F","/")}`;
}
function setResourceDownloadButton(path){
  const btn=$("rsDownloadBtn");
  if(!btn)return;
  if(!path){
    btn.style.display="none";
    btn.removeAttribute("href");
    return;
  }
  const name=path.replace(/^downloads\//,"");
  btn.href=siteDownloadUrl(name);
  btn.setAttribute("download",name);
  btn.style.display="inline-flex";
}

function humanSize(n){if(n<1024)return n+" B";if(n<1024*1024)return(n/1024).toFixed(1)+" KB";return(n/1024/1024).toFixed(1)+" MB";}
function renderFileList(){
  $("fileList").innerHTML=files.length?files.map((f,i)=>`<div class="item"><strong>${escapeHtml(f.name)}</strong><div class="item-meta">${humanSize(f.size||0)} · downloads/</div><div class="item-actions"><a class="admin-btn light" href="${siteDownloadUrl(f.name)}" download="${escapeHtml(f.name)}">다운로드</a><button class="admin-btn light" onclick="prepareReplace(${i})">교체</button><button class="admin-btn danger" onclick="removeAttachment(${i})">삭제</button></div></div>`).join(""):'<div class="helper">등록된 첨부파일이 없습니다.</div>';
}
$("fileInput").addEventListener("change",()=>{
  const f=$("fileInput").files[0];if(!f){$("selectedFileInfo").textContent="파일을 선택해주세요.";$("uploadFileBtn").disabled=true;return;}
  $("fileName").value=f.name;$("selectedFileInfo").textContent=`${f.name} · ${humanSize(f.size)}`;$("uploadFileBtn").disabled=!token;
});
$("clearFileBtn").addEventListener("click",()=>{$("fileInput").value="";$("fileName").value="";$("selectedFileInfo").textContent="PDF, XLSX, DOCX, HWP, CSV, ZIP, 이미지 등 일반 파일을 올릴 수 있습니다.";$("uploadFileBtn").disabled=true;});
window.prepareReplace=i=>{$("fileName").value=files[i].name;$("selectedFileInfo").textContent=`교체 대상: ${files[i].name} — 새 파일을 선택해주세요.`;$("fileInput").click();};
$("uploadFileBtn").addEventListener("click",async()=>{
  const f=$("fileInput").files[0],name=$("fileName").value.trim();if(!f||!name)return setStatus("업로드할 파일과 저장할 파일명을 확인해주세요.","err");
  if(name.includes("/")||name.includes("\\"))return setStatus("파일명에는 / 또는 \\\\ 문자를 사용할 수 없습니다.","err");
  if(f.size>25*1024*1024&&!confirm("파일이 25MB보다 큽니다. 업로드가 오래 걸리거나 실패할 수 있습니다. 계속할까요?"))return;
  setStatus("첨부파일을 GitHub에 업로드하는 중입니다…","info");
  try{
    const path=`${CONFIG.downloadsDir}/${name}`;let sha="";try{const existing=await getFile(path);sha=existing.sha;}catch(e){if(!String(e.message).startsWith("404"))throw e;}
    const bytes=new Uint8Array(await f.arrayBuffer());await putFile(path,bytesToBase64(bytes),sha,`${sha?"Replace":"Add"} attachment: ${name}`);await loadFiles();$("clearFileBtn").click();setStatus(`첨부파일 "${name}"을 ${sha?"교체":"업로드"}했습니다.`,"ok");
  }catch(e){setStatus("첨부파일 업로드에 실패했습니다: "+e.message,"err");}
});
window.removeAttachment=async i=>{
  const f=files[i];if(!confirm(`"${f.name}" 파일을 삭제할까요?\n이 파일을 내려받는 링크가 페이지에 남아 있다면 링크가 깨질 수 있습니다.`))return;
  try{await deleteFile(f.path,f.sha,`Delete attachment: ${f.name}`);await loadFiles();setStatus("첨부파일을 삭제했습니다.","ok");}catch(e){setStatus("첨부파일을 삭제하지 못했습니다: "+e.message,"err");}
};

populateTaxonomy();newPost();


$("pageSubcategory").addEventListener("change",()=>{
  const s=$("pageSaveStatus");
  if(s){s.className="status";s.textContent="";}
  $("savePageBtn").disabled=true;
  $("pageEditNote").textContent="페이지를 다시 불러오세요";
});

setBusinessSteps([{title:"",body:""}]);
