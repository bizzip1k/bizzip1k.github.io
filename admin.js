const CONFIG = {
  owner: "bizzip1k",
  repo: "bizzip1k.github.io",
  branch: "main",
  path: "posts.json"
};

const TAXONOMY = {"startup": {"label": "창업 준비", "page": "startup.html", "subs": {"idea-validation": {"label": "사업 아이디어 검증", "page": "startup-idea-validation.html"}, "market-check": {"label": "시장성 확인", "page": "startup-market-check.html"}, "business-registration": {"label": "사업자등록", "page": "startup-business-registration.html"}, "trademark": {"label": "상표 출원", "page": "startup-trademark.html"}, "domain": {"label": "도메인 확보", "page": "startup-domain.html"}, "office-contract": {"label": "사무실 계약", "page": "startup-office-contract.html"}, "startup-cost": {"label": "초기비용 계산", "page": "startup-startup-cost.html"}, "startup-checklist": {"label": "사업 시작 체크리스트", "page": "startup-startup-checklist.html"}}}, "product": {"label": "상품과 서비스", "page": "product.html", "subs": {"product-planning": {"label": "상품기획", "page": "product-product-planning.html"}, "costing": {"label": "원가 계산", "page": "product-costing.html"}, "pricing": {"label": "가격 결정", "page": "product-pricing.html"}, "oem": {"label": "OEM 견적 확인", "page": "product-oem.html"}, "package": {"label": "패키지", "page": "product-package.html"}, "launch-test": {"label": "출시 전 검증", "page": "product-launch-test.html"}}}, "brand": {"label": "브랜드", "page": "brand.html", "subs": {"brand-name": {"label": "브랜드명", "page": "brand-brand-name.html"}, "positioning": {"label": "포지셔닝", "page": "brand-positioning.html"}, "message": {"label": "브랜드 메시지", "page": "brand-message.html"}, "visual": {"label": "비주얼 기준", "page": "brand-visual.html"}, "brand-check": {"label": "브랜드 점검", "page": "brand-brand-check.html"}}}, "marketing": {"label": "마케팅", "page": "marketing.html", "subs": {"search": {"label": "검색 노출", "page": "marketing-search.html"}, "ads": {"label": "광고 성과", "page": "marketing-ads.html"}, "content": {"label": "콘텐츠 기획", "page": "marketing-content.html"}, "promotion": {"label": "프로모션", "page": "marketing-promotion.html"}, "conversion": {"label": "전환율", "page": "marketing-conversion.html"}}}, "sales": {"label": "판매와 유통", "page": "sales.html", "subs": {"channel-choice": {"label": "판매채널 선택", "page": "sales-channel-choice.html"}, "naver": {"label": "네이버 판매", "page": "sales-naver.html"}, "coupang": {"label": "쿠팡 판매", "page": "sales-coupang.html"}, "offline": {"label": "오프라인 입점", "page": "sales-offline.html"}, "proposal": {"label": "입점 제안서", "page": "sales-proposal.html"}}}, "operation": {"label": "회사 운영", "page": "operation.html", "subs": {"contract": {"label": "계약 확인", "page": "operation-contract.html"}, "expense": {"label": "비용 관리", "page": "operation-expense.html"}, "outsourcing": {"label": "외주 관리", "page": "operation-outsourcing.html"}, "workflow": {"label": "업무 정리", "page": "operation-workflow.html"}, "document": {"label": "문서 관리", "page": "operation-document.html"}}}, "logistics": {"label": "물류와 재고", "page": "logistics.html", "subs": {"3pl": {"label": "3PL 선택", "page": "logistics-3pl.html"}, "inventory": {"label": "재고 관리", "page": "logistics-inventory.html"}, "packing": {"label": "포장비", "page": "logistics-packing.html"}, "returns": {"label": "반품 관리", "page": "logistics-returns.html"}, "warehouse-move": {"label": "물류 이관", "page": "logistics-warehouse-move.html"}}}, "data-ai": {"label": "데이터와 AI", "page": "data-ai.html", "subs": {"sales-data": {"label": "매출 데이터", "page": "data-ai-sales-data.html"}, "customer-data": {"label": "고객 데이터", "page": "data-ai-customer-data.html"}, "free-data": {"label": "무료 데이터", "page": "data-ai-free-data.html"}, "ai-work": {"label": "AI 업무 활용", "page": "data-ai-ai-work.html"}, "automation": {"label": "업무 자동화", "page": "data-ai-automation.html"}}}};

let token = "";
let posts = [];
let fileSha = "";

const $ = id => document.getElementById(id);
const els = {
  token:$("token"), connectBtn:$("connectBtn"), status:$("status"), postList:$("postList"),
  postId:$("postId"), title:$("title"), date:$("date"), category:$("category"),
  subcategory:$("subcategory"), summary:$("summary"), body:$("body"),
  newBtn:$("newBtn"), saveBtn:$("saveBtn"), editNote:$("editNote")
};

function setStatus(message,type="info") {
  els.status.textContent=message;
  els.status.className=`status show ${type}`;
}
function todayLocal() {
  const d=new Date(), local=new Date(d.getTime()-d.getTimezoneOffset()*60000);
  return local.toISOString().slice(0,10);
}
function decodeBase64Utf8(base64) {
  const binary=atob(base64.replace(/\n/g,""));
  const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
function encodeBase64Utf8(text) {
  const bytes=new TextEncoder().encode(text); let binary=""; const chunk=0x8000;
  for(let i=0;i<bytes.length;i+=chunk) binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));
  return btoa(binary);
}
function apiUrl() {
  return `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.path}?ref=${CONFIG.branch}`;
}
async function githubRequest(url,options={}) {
  const headers={"Accept":"application/vnd.github+json","Authorization":`Bearer ${token}`,"X-GitHub-Api-Version":"2022-11-28",...(options.headers||{})};
  const res=await fetch(url,{...options,headers});
  if(!res.ok) {
    let detail=""; try{detail=(await res.json()).message||""}catch{}
    throw new Error(`${res.status} ${detail}`.trim());
  }
  return res.json();
}
async function loadPosts() {
  setStatus("GitHub에서 글 목록을 불러오는 중입니다…","info");
  const data=await githubRequest(apiUrl());
  fileSha=data.sha;
  posts=JSON.parse(decodeBase64Utf8(data.content));
  posts.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  renderPostList(); els.saveBtn.disabled=false;
  setStatus(`연결되었습니다. 현재 ${posts.length}개의 글이 있습니다.`,"ok");
}
function escapeHtml(str) {
  return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function renderPostList() {
  if(!posts.length) return els.postList.innerHTML='<div class="helper">등록된 글이 없습니다.</div>';
  els.postList.innerHTML=posts.map((p,index)=>`
    <div class="post-item">
      <strong>${escapeHtml(p.title||"")}</strong>
      <div class="post-meta">${escapeHtml(p.date||"")} · ${escapeHtml(p.categoryLabel||"")}${p.subcategoryLabel ? " → "+escapeHtml(p.subcategoryLabel) : ""}</div>
      <div class="post-actions">
        <button class="admin-btn light" onclick="editPost(${index})">수정</button>
        <button class="admin-btn danger" onclick="deletePost(${index})">삭제</button>
      </div>
    </div>`).join("");
}
function fillSubcategories(selected="") {
  const cat=els.category.value;
  const subs=TAXONOMY[cat].subs;
  els.subcategory.innerHTML=Object.entries(subs).map(([key,v])=>`<option value="${key}">${v.label}</option>`).join("");
  if(selected && subs[selected]) els.subcategory.value=selected;
}
function sectionsToText(sections=[]) {
  const out=[];
  sections.forEach(sec=>{
    if(sec.heading) out.push(`## ${sec.heading}`);
    (sec.paragraphs||[]).forEach(p=>{out.push(p);out.push("")});
    (sec.bullets||[]).forEach(b=>out.push(`- ${b}`));
    out.push("");
  });
  return out.join("\n").replace(/\n{3,}/g,"\n\n").trim();
}
function textToSections(text) {
  const lines=text.split(/\r?\n/), sections=[]; let current={heading:"본문",paragraphs:[],bullets:[]}, paragraphBuffer=[];
  const flush=()=>{const p=paragraphBuffer.join(" ").trim();if(p)current.paragraphs.push(p);paragraphBuffer=[];};
  const push=()=>{flush();if(current.heading||current.paragraphs.length||current.bullets.length)sections.push(current);};
  for(const raw of lines) {
    const line=raw.trim();
    if(line.startsWith("## ")) {
      if(current.paragraphs.length||current.bullets.length||current.heading!=="본문") push();
      current={heading:line.slice(3).trim(),paragraphs:[],bullets:[]};
    } else if(line.startsWith("- ")) {flush();current.bullets.push(line.slice(2).trim());}
    else if(!line) flush(); else paragraphBuffer.push(line);
  }
  push();
  return sections.filter(s=>s.paragraphs.length||s.bullets.length||(s.heading&&s.heading!=="본문"));
}
function makeId() {
  const d=new Date(), pad=n=>String(n).padStart(2,"0");
  return `bizzip-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
function clearForm() {
  els.postId.value=""; els.title.value=""; els.date.value=todayLocal(); els.category.value="startup";
  fillSubcategories(); els.summary.value=""; els.body.value=""; els.editNote.textContent="새 글 작성"; els.title.focus();
}
window.editPost=function(index) {
  const p=posts[index];
  els.postId.value=p.id||""; els.title.value=p.title||""; els.date.value=p.date||todayLocal();
  els.category.value=p.category||"startup"; fillSubcategories(p.subcategory||"");
  els.summary.value=p.summary||""; els.body.value=sectionsToText(p.sections||[]);
  els.editNote.textContent="기존 글 수정 중"; window.scrollTo({top:0,behavior:"smooth"});
};
window.deletePost=async function(index) {
  const p=posts[index];
  if(!confirm(`"${p.title}" 글을 삭제할까요?\n삭제하면 GitHub에도 바로 반영됩니다.`))return;
  posts.splice(index,1);
  try{await savePostsToGithub(`Delete post: ${p.title}`);renderPostList();clearForm();setStatus("글을 삭제했습니다. 사이트 반영에는 잠시 시간이 걸릴 수 있습니다.","ok");}
  catch(e){setStatus("삭제하지 못했습니다: "+e.message,"err");}
};
async function savePostsToGithub(message) {
  const payload={message,content:encodeBase64Utf8(JSON.stringify(posts,null,2)),sha:fileSha,branch:CONFIG.branch};
  const data=await githubRequest(`https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.path}`,{
    method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)
  });
  fileSha=data.content.sha;
}
async function saveCurrentPost() {
  const title=els.title.value.trim(), date=els.date.value, category=els.category.value;
  const subcategory=els.subcategory.value, summary=els.summary.value.trim(), bodyText=els.body.value.trim();
  if(!title)return setStatus("제목을 입력해주세요.","err");
  if(!date)return setStatus("발행일을 선택해주세요.","err");
  if(!subcategory)return setStatus("세부 메뉴를 선택해주세요.","err");
  if(!summary)return setStatus("요약을 입력해주세요.","err");
  if(!bodyText)return setStatus("본문을 입력해주세요.","err");

  const sub=TAXONOMY[category].subs[subcategory];
  const id=els.postId.value||makeId();
  const post={
    id,title,date,category,categoryLabel:TAXONOMY[category].label,
    subcategory,subcategoryLabel:sub.label,subcategoryPage:sub.page,
    summary,sections:textToSections(bodyText)
  };
  const existingIndex=posts.findIndex(p=>p.id===id);
  if(existingIndex>=0)posts[existingIndex]=post;else posts.push(post);
  posts.sort((a,b)=>String(b.date).localeCompare(String(a.date)));

  els.saveBtn.disabled=true;setStatus("GitHub에 저장하는 중입니다…","info");
  try{
    await savePostsToGithub(existingIndex>=0?`Update post: ${title}`:`Add post: ${title}`);
    renderPostList();clearForm();
    setStatus(`저장했습니다. "${TAXONOMY[category].label} → ${sub.label}"에 연결됩니다. GitHub Pages 반영에는 잠시 시간이 걸립니다.`,"ok");
  }catch(e){setStatus("저장하지 못했습니다: "+e.message,"err");}
  finally{els.saveBtn.disabled=false;}
}
els.category.addEventListener("change",()=>fillSubcategories());
els.connectBtn.addEventListener("click",async()=>{
  token=els.token.value.trim();if(!token)return setStatus("GitHub token을 입력해주세요.","err");
  try{await loadPosts();}catch(e){setStatus("연결하지 못했습니다: "+e.message,"err");}
});
els.newBtn.addEventListener("click",clearForm);
els.saveBtn.addEventListener("click",saveCurrentPost);
clearForm();
