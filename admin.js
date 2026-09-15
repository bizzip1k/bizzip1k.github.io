const CONFIG = {
  owner:"bizzip1k",
  repo:"bizzip1k.github.io",
  branch:"main",
  postsPath:"posts.json",
  downloadsDir:"downloads"
};
const TAXONOMY = {"startup": {"label": "창업 준비", "subs": {"idea-validation": {"label": "사업 아이디어 검증", "page": "startup-idea-validation.html"}, "market-check": {"label": "시장성 확인", "page": "startup-market-check.html"}, "business-registration": {"label": "사업자등록", "page": "startup-business-registration.html"}, "trademark": {"label": "상표 출원", "page": "startup-trademark.html"}, "domain": {"label": "도메인 확보", "page": "startup-domain.html"}, "office-contract": {"label": "사무실 계약", "page": "startup-office-contract.html"}, "startup-cost": {"label": "초기비용 계산", "page": "startup-startup-cost.html"}, "startup-checklist": {"label": "사업 시작 체크리스트", "page": "startup-startup-checklist.html"}}}, "product": {"label": "상품과 서비스", "subs": {"product-planning": {"label": "상품기획", "page": "product-product-planning.html"}, "costing": {"label": "원가 계산", "page": "product-costing.html"}, "pricing": {"label": "가격 결정", "page": "product-pricing.html"}, "oem": {"label": "OEM 견적 확인", "page": "product-oem.html"}, "package": {"label": "패키지", "page": "product-package.html"}, "launch-test": {"label": "출시 전 검증", "page": "product-launch-test.html"}}}, "brand": {"label": "브랜드", "subs": {"brand-name": {"label": "브랜드명", "page": "brand-brand-name.html"}, "positioning": {"label": "포지셔닝", "page": "brand-positioning.html"}, "message": {"label": "브랜드 메시지", "page": "brand-message.html"}, "visual": {"label": "비주얼 기준", "page": "brand-visual.html"}, "brand-check": {"label": "브랜드 점검", "page": "brand-brand-check.html"}}}, "marketing": {"label": "마케팅", "subs": {"search": {"label": "검색 노출", "page": "marketing-search.html"}, "ads": {"label": "광고 성과", "page": "marketing-ads.html"}, "content": {"label": "콘텐츠 기획", "page": "marketing-content.html"}, "promotion": {"label": "프로모션", "page": "marketing-promotion.html"}, "conversion": {"label": "전환율", "page": "marketing-conversion.html"}}}, "sales": {"label": "판매와 유통", "subs": {"channel-choice": {"label": "판매채널 선택", "page": "sales-channel-choice.html"}, "naver": {"label": "네이버 판매", "page": "sales-naver.html"}, "coupang": {"label": "쿠팡 판매", "page": "sales-coupang.html"}, "offline": {"label": "오프라인 입점", "page": "sales-offline.html"}, "proposal": {"label": "입점 제안서", "page": "sales-proposal.html"}}}, "operation": {"label": "회사 운영", "subs": {"contract": {"label": "계약 확인", "page": "operation-contract.html"}, "expense": {"label": "비용 관리", "page": "operation-expense.html"}, "outsourcing": {"label": "외주 관리", "page": "operation-outsourcing.html"}, "workflow": {"label": "업무 정리", "page": "operation-workflow.html"}, "document": {"label": "문서 관리", "page": "operation-document.html"}}}, "logistics": {"label": "물류와 재고", "subs": {"3pl": {"label": "3PL 선택", "page": "logistics-3pl.html"}, "inventory": {"label": "재고 관리", "page": "logistics-inventory.html"}, "packing": {"label": "포장비", "page": "logistics-packing.html"}, "returns": {"label": "반품 관리", "page": "logistics-returns.html"}, "warehouse-move": {"label": "물류 이관", "page": "logistics-warehouse-move.html"}}}, "data-ai": {"label": "데이터와 AI", "subs": {"sales-data": {"label": "매출 데이터", "page": "data-ai-sales-data.html"}, "customer-data": {"label": "고객 데이터", "page": "data-ai-customer-data.html"}, "free-data": {"label": "무료 데이터", "page": "data-ai-free-data.html"}, "ai-work": {"label": "AI 업무 활용", "page": "data-ai-ai-work.html"}, "automation": {"label": "업무 자동화", "page": "data-ai-automation.html"}}}};

let token="", posts=[], postsSha="", currentPage={path:"",sha:"",html:""}, files=[];
const $=id=>document.getElementById(id);

function setStatus(message,type="info"){
  const el=$("status"); el.textContent=message; el.className=`status show ${type}`;
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
  try{
    const data=await getFile(path),html=decodeBase64Utf8(data.content); currentPage={path,sha:data.sha,html};
    const doc=new DOMParser().parseFromString(html,"text/html"),article=doc.querySelector("article.article"); if(!article)throw new Error("수정 가능한 본문 영역을 찾지 못했습니다.");
    $("fpTitle").value=qText(doc,".page-hero h1"); $("fpHeroSummary").value=qText(doc,".page-hero h1 + p"); $("fpIntro").value=qText(article,".detail-intro");
    const h2s=Array.from(article.querySelectorAll(":scope > h2")), criteriaH=h2s.find(h=>h.textContent.trim()==="실무에서 먼저 보는 기준");
    $("fpCriteria").value=textList(criteriaH?.nextElementSibling); $("fpAction").value=qText(article,".practice-box p");
    const steps=Array.from(article.querySelectorAll(".step-card"));
    for(let i=0;i<4;i++){ $("fpStep"+(i+1)+"Title").value=qText(steps[i]||article,"strong"); $("fpStep"+(i+1)+"Body").value=qText(steps[i]||article,"p"); }
    $("fpExample").value=qText(article,".example-box p"); $("fpMistakes").value=textList(article.querySelector(".mistake-box ul")); $("fpFinishTitle").value=qText(article,".finish-box strong"); $("fpFinishBody").value=qText(article,".finish-box p");
    $("savePageBtn").disabled=false; $("pageEditNote").textContent=`수정 중: ${TAXONOMY[cat].label} → ${TAXONOMY[cat].subs[sub].label}`; setStatus("페이지를 불러왔습니다.","ok");
  }catch(e){ $("savePageBtn").disabled=true;setStatus("페이지를 불러오지 못했습니다: "+e.message,"err"); }
});
$("savePageBtn").addEventListener("click",async()=>{
  if(!currentPage.path)return;
  try{
    const doc=new DOMParser().parseFromString(currentPage.html,"text/html"),article=doc.querySelector("article.article");
    const heroTitle=doc.querySelector(".page-hero h1"),heroSummary=doc.querySelector(".page-hero h1 + p"); if(heroTitle)heroTitle.textContent=$("fpTitle").value.trim();if(heroSummary)heroSummary.textContent=$("fpHeroSummary").value.trim();
    const intro=article.querySelector(".detail-intro");if(intro)intro.textContent=$("fpIntro").value.trim();
    const h2s=Array.from(article.querySelectorAll(":scope > h2")),criteriaH=h2s.find(h=>h.textContent.trim()==="실무에서 먼저 보는 기준");setList(criteriaH?.nextElementSibling,$("fpCriteria").value);
    const action=article.querySelector(".practice-box p");if(action)action.textContent=$("fpAction").value.trim();
    const steps=Array.from(article.querySelectorAll(".step-card")); for(let i=0;i<4;i++){if(!steps[i])continue;const st=steps[i].querySelector("strong"),sp=steps[i].querySelector("p");if(st)st.textContent=$("fpStep"+(i+1)+"Title").value.trim();if(sp)sp.textContent=$("fpStep"+(i+1)+"Body").value.trim();}
    const ex=article.querySelector(".example-box p");if(ex)ex.textContent=$("fpExample").value.trim();setList(article.querySelector(".mistake-box ul"),$("fpMistakes").value);
    const ft=article.querySelector(".finish-box strong"),fb=article.querySelector(".finish-box p");if(ft)ft.textContent=$("fpFinishTitle").value.trim();if(fb)fb.textContent=$("fpFinishBody").value.trim();
    const html="<!doctype html>\n"+doc.documentElement.outerHTML,r=await putFile(currentPage.path,encodeBase64Utf8(html),currentPage.sha,`Update business page: ${currentPage.path}`);
    currentPage.sha=r.content.sha;currentPage.html=html;setStatus("사업실무 페이지를 저장했습니다.","ok");
  }catch(e){setStatus("페이지 저장에 실패했습니다: "+e.message,"err");}
});

/* 첨부파일 */
async function loadFiles(){
  try{const data=await githubRequest(ghPath(CONFIG.downloadsDir)+`?ref=${CONFIG.branch}`);files=(Array.isArray(data)?data:[]).filter(x=>x.type==="file");}
  catch(e){if(String(e.message).startsWith("404"))files=[];else throw e;} renderFileList();
}
function humanSize(n){if(n<1024)return n+" B";if(n<1024*1024)return(n/1024).toFixed(1)+" KB";return(n/1024/1024).toFixed(1)+" MB";}
function renderFileList(){
  $("fileList").innerHTML=files.length?files.map((f,i)=>`<div class="item"><strong>${escapeHtml(f.name)}</strong><div class="item-meta">${humanSize(f.size||0)} · downloads/</div><div class="item-actions"><button class="admin-btn light" onclick="prepareReplace(${i})">교체</button><button class="admin-btn danger" onclick="removeAttachment(${i})">삭제</button></div></div>`).join(""):'<div class="helper">등록된 첨부파일이 없습니다.</div>';
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
