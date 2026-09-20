const CFG={owner:"bizzip1k",repo:"bizzip1k.github.io",branch:"main",posts:"posts.json"};
const $=id=>document.getElementById(id);
let token="";
const S={
 index:{sha:"",html:"",menus:[],sections:[]},
 business:{sha:"",html:"",categories:[],selected:-1,cat:{sha:"",html:"",topics:[]},detail:{}},
 problems:{sha:"",html:"",roots:[],selected:-1,page:{sha:"",html:"",subs:[]},detail:{}},
 contents:{sha:"",posts:[],edit:-1,landingSha:"",landingHtml:""},
 resources:{sha:"",html:"",cards:[],selected:-1,detail:{}},
 about:{sha:"",html:"",people:[],consulting:[],brands:[],books:[]},
 contact:{sha:"",html:"",types:[]}
};
function stat(id,msg,type="info"){const e=$(id);if(!e)return;e.textContent=msg;e.className=`status show ${type}`}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function lines(s=""){return String(s).split(/\r?\n/).map(x=>x.trim()).filter(Boolean)}
function d64(s){const b=atob((s||"").replace(/\n/g,""));const u=Uint8Array.from(b,c=>c.charCodeAt(0));return new TextDecoder().decode(u)}
function e64(s){const u=new TextEncoder().encode(s);let b="";for(let i=0;i<u.length;i+=0x8000)b+=String.fromCharCode(...u.subarray(i,i+0x8000));return btoa(b)}
function doc(html){return new DOMParser().parseFromString(html,"text/html")}
function out(d){return "<!doctype html>\n"+d.documentElement.outerHTML}
function text(r,sel){return r?.querySelector(sel)?.textContent?.trim()||""}
function setText(r,sel,val){const e=r?.querySelector(sel);if(e)e.textContent=val}
function today(){const d=new Date(Date.now()-new Date().getTimezoneOffset()*60000);return d.toISOString().slice(0,10)}
function headers(){return{"Accept":"application/vnd.github+json","Authorization":`Bearer ${token}`,"X-GitHub-Api-Version":"2022-11-28"}}
async function api(path,opt={}){const r=await fetch(`https://api.github.com/repos/${CFG.owner}/${CFG.repo}/contents/${encodeURI(path)}?ref=${CFG.branch}`,{...opt,headers:{...headers(),...(opt.headers||{})}});if(!r.ok){throw new Error(`${r.status} ${(await r.text()).slice(0,160)}`)}return r.json()}
async function get(path){return api(path)}
async function put(path,content,sha,message){return api(path,{method:"PUT",body:JSON.stringify({message,content:e64(content),sha:sha||undefined,branch:CFG.branch})})}
async function del(path,sha,message){return api(path,{method:"DELETE",body:JSON.stringify({message,sha,branch:CFG.branch})})}
async function putBytes(path,bytes,sha,message){let b="";for(let i=0;i<bytes.length;i+=0x8000)b+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return api(path,{method:"PUT",body:JSON.stringify({message,content:btoa(b),sha:sha||undefined,branch:CFG.branch})})}
function move(a,i,d,render,preview){const j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];render();preview&&preview()}
function bind(ids,fn){ids.forEach(id=>$(id)?.addEventListener("input",fn))}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".panel").forEach(x=>x.classList.toggle("active",x.id===`panel-${b.dataset.panel}`));window.scrollTo({top:0,behavior:"smooth"})});

$("connectBtn").onclick=async()=>{
 token=$("token").value.trim();if(!token)return stat("globalStatus","GitHub token을 입력해주세요.","err");
 stat("globalStatus","GitHub에 연결하고 각 메뉴를 독립적으로 불러오는 중입니다…","info");
 const jobs=[["사이트 구조",loadIndex],["사업실무",loadBusiness],["문제별 해결",loadProblems],["콘텐츠",loadContents],["실무자료",loadResources],["BIZZIP 소개",loadAbout],["문의",loadContact]];
 let ok=0,fail=[];
 for(const [n,f] of jobs){try{await f();ok++}catch(e){console.error(n,e);fail.push(n)}}
 stat("globalStatus",fail.length?`연결되었습니다. ${ok}개 메뉴 정상 / ${fail.length}개 메뉴 점검 필요. 오류가 난 메뉴는 다른 메뉴에 영향을 주지 않습니다.`:"연결되었습니다. 모든 관리자 메뉴를 정상적으로 불러왔습니다.",fail.length?"info":"ok");
};

/* INDEX */
async function loadIndex(){
 const g=await get("index.html"),h=d64(g.content),d=doc(h);S.index={sha:g.sha,html:h,menus:[],sections:[]};
 $("ixEyebrow").value=text(d,".hero .eyebrow");$("ixTitle").value=text(d,".hero h1");$("ixSummary").value=text(d,".hero p");
 S.index.menus=Array.from(d.querySelectorAll(".menu a")).map(a=>({label:a.textContent.trim(),href:a.getAttribute("href")||""}));
 const secs=Array.from(d.querySelectorAll("main > section")).slice(1);
 S.index.sections=secs.map((s,i)=>{
   const head=s.querySelector(".section-head"),title=text(head,"h2")||`섹션 ${i+1}`,summary=text(head,"p");
   let type=s.querySelector(".problem-grid")?"problem":s.querySelector("[data-post-list]")?"posts":"cards";
   const cards=type==="problem"?Array.from(s.querySelectorAll(".problem-card")).map(a=>({title:text(a,"strong"),summary:"",href:a.getAttribute("href")||""})):
     type==="cards"?Array.from(s.querySelectorAll(".grid .card")).map(a=>({title:text(a,"h3"),summary:text(a,"p"),href:a.getAttribute("href")||""})):[];
   return {title,summary,type,cards,raw:s.outerHTML};
 });
 renderIxMenus();renderIxSections();previewIndex();$("saveIndex").disabled=false;
}
function renderIxMenus(){
 $("ixMenus").innerHTML=S.index.menus.map((m,i)=>`<div class="tile" data-i="${i}"><input class="input im-label" value="${esc(m.label)}"><input class="input im-href" value="${esc(m.href)}"><div class="actions"><button class="btn light mini im-left">←</button><button class="btn light mini im-right">→</button><button class="btn danger mini im-del">삭제</button></div></div>`).join("");
 $("ixMenus").querySelectorAll(".tile").forEach(r=>{const i=+r.dataset.i,sync=()=>{S.index.menus[i].label=r.querySelector(".im-label").value;S.index.menus[i].href=r.querySelector(".im-href").value;previewIndex()};r.querySelectorAll("input").forEach(x=>x.oninput=sync);r.querySelector(".im-left").onclick=()=>move(S.index.menus,i,-1,renderIxMenus,previewIndex);r.querySelector(".im-right").onclick=()=>move(S.index.menus,i,1,renderIxMenus,previewIndex);r.querySelector(".im-del").onclick=()=>{S.index.menus.splice(i,1);renderIxMenus();previewIndex()}})
}
$("addIxMenu").onclick=()=>{S.index.menus.push({label:"새 메뉴",href:"new-page.html"});renderIxMenus();previewIndex()};
function renderIxSections(){
 $("ixSections").innerHTML=S.index.sections.map((s,i)=>`<div class="index-section" data-i="${i}">
  <div class="section-title"><h3>${i+1}. INDEX 섹션</h3><div class="actions"><button class="btn light mini is-left">←</button><button class="btn light mini is-right">→</button><button class="btn danger mini is-del">삭제</button></div></div>
  <div class="form-grid"><div><label class="label">섹션 제목</label><input class="input is-title" value="${esc(s.title)}"></div><div><label class="label">섹션 설명</label><input class="input is-summary" value="${esc(s.summary)}"></div></div>
  <div class="section-title" style="margin-top:8px"><span class="hint">유형: ${s.type==="posts"?"최근 콘텐츠 자동 영역":s.type==="problem"?"문제 카드":"일반 카드"}</span>${s.type!=="posts"?`<button class="btn light mini is-add-card">+ 카드</button>`:""}</div>
  <div class="index-card-grid">${s.cards.map((c,j)=>`<div class="tile" data-j="${j}"><input class="input isc-title" value="${esc(c.title)}"><input class="input isc-href" value="${esc(c.href)}"><textarea class="textarea isc-summary" style="min-height:54px">${esc(c.summary)}</textarea><div class="actions"><button class="btn light mini isc-left">←</button><button class="btn light mini isc-right">→</button><button class="btn danger mini isc-del">삭제</button></div></div>`).join("")}</div>
 </div>`).join("");
 $("ixSections").querySelectorAll(".index-section").forEach(sec=>{const i=+sec.dataset.i;const sync=()=>{S.index.sections[i].title=sec.querySelector(".is-title").value;S.index.sections[i].summary=sec.querySelector(".is-summary").value;previewIndex()};sec.querySelectorAll(".is-title,.is-summary").forEach(x=>x.oninput=sync);sec.querySelector(".is-left").onclick=()=>move(S.index.sections,i,-1,renderIxSections,previewIndex);sec.querySelector(".is-right").onclick=()=>move(S.index.sections,i,1,renderIxSections,previewIndex);sec.querySelector(".is-del").onclick=()=>{S.index.sections.splice(i,1);renderIxSections();previewIndex()};sec.querySelector(".is-add-card")?.addEventListener("click",()=>{S.index.sections[i].cards.push({title:"새 카드",summary:"",href:""});renderIxSections();previewIndex()});
  sec.querySelectorAll(".tile").forEach(card=>{const j=+card.dataset.j;const cs=()=>{let c=S.index.sections[i].cards[j];c.title=card.querySelector(".isc-title").value;c.href=card.querySelector(".isc-href").value;c.summary=card.querySelector(".isc-summary").value;previewIndex()};card.querySelectorAll("input,textarea").forEach(x=>x.oninput=cs);card.querySelector(".isc-left").onclick=()=>move(S.index.sections[i].cards,j,-1,renderIxSections,previewIndex);card.querySelector(".isc-right").onclick=()=>move(S.index.sections[i].cards,j,1,renderIxSections,previewIndex);card.querySelector(".isc-del").onclick=()=>{S.index.sections[i].cards.splice(j,1);renderIxSections();previewIndex()}})
 })
}
$("addIxSection").onclick=()=>{S.index.sections.push({title:"새 섹션",summary:"",type:"cards",cards:[],raw:""});renderIxSections();previewIndex()};
function previewIndex(){$("indexPreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">${esc($("ixEyebrow").value)}</div><h1>${esc($("ixTitle").value)}</h1><p>${esc($("ixSummary").value)}</p></div><div class="pv-section"><div class="actions">${S.index.menus.map(m=>`<span class="btn light mini">${esc(m.label)}</span>`).join("")}</div></div>${S.index.sections.map(s=>`<div class="pv-section"><h2>${esc(s.title)}</h2><p>${esc(s.summary)}</p>${s.type==="posts"?`<div class="pv-item"><strong>최근 콘텐츠 자동 표시 영역</strong><small>posts.json에서 최신 글을 자동으로 가져옵니다.</small></div>`:`<div class="pv-grid">${s.cards.map(c=>`<div class="pv-item"><strong>${esc(c.title)}</strong><small>${esc(c.summary)}</small></div>`).join("")}</div>`}</div>`).join("")}`}
bind(["ixEyebrow","ixTitle","ixSummary"],previewIndex);
$("saveIndex").onclick=async()=>{try{const d=doc(S.index.html);setText(d,".hero .eyebrow",$("ixEyebrow").value);setText(d,".hero h1",$("ixTitle").value);setText(d,".hero p",$("ixSummary").value);const menu=d.querySelector(".menu");if(menu){menu.innerHTML="";S.index.menus.forEach(m=>{const a=d.createElement("a");a.href=m.href;a.textContent=m.label;menu.appendChild(a)})}
 const main=d.querySelector("main"),hero=main.querySelector(".hero");main.innerHTML="";main.appendChild(hero);
 S.index.sections.forEach(s=>{let sec;if(s.raw){sec=doc(s.raw).querySelector("section")}else{sec=d.createElement("section");sec.innerHTML=`<div class="wrap"><div class="section-head"><h2></h2><p></p></div><div class="grid"></div></div>`}
  setText(sec,".section-head h2",s.title);setText(sec,".section-head p",s.summary);
  if(s.type==="problem"){let grid=sec.querySelector(".problem-grid");if(!grid){grid=d.createElement("div");grid.className="problem-grid";sec.querySelector(".wrap")?.appendChild(grid)}grid.innerHTML="";s.cards.forEach((c,k)=>{const a=d.createElement("a");a.className="problem-card";a.href=c.href;a.innerHTML=`<span>${String(k+1).padStart(2,"0")}</span><strong>${esc(c.title)}</strong>`;grid.appendChild(a)})}
  else if(s.type==="posts"){let grid=sec.querySelector("[data-post-list]");if(!grid){grid=d.createElement("div");grid.className="content-grid";grid.setAttribute("data-post-list","");grid.setAttribute("data-limit","3");sec.querySelector(".wrap")?.appendChild(grid)}}
  else{let grid=sec.querySelector(".grid");if(!grid){grid=d.createElement("div");grid.className="grid";sec.querySelector(".wrap")?.appendChild(grid)}grid.innerHTML="";s.cards.forEach((c,k)=>{const a=d.createElement("a");a.className="card";a.href=c.href;a.innerHTML=`<div class="num">${String(k+1).padStart(2,"0")}</div><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p>`;grid.appendChild(a)})}
  main.appendChild(d.importNode(sec,true))
 });
 const h=out(d),r=await put("index.html",h,S.index.sha,"Update BIZZIP index structure");S.index.sha=r.content.sha;S.index.html=h;stat("structureStatus","✓ index.html을 저장했습니다.","ok")
 }catch(e){stat("structureStatus","저장 실패: "+e.message,"err")}};

/* generic detail editor */
function detailEditorHtml(prefix){return `<div class="form-grid">
 <div><label class="label">제목</label><input id="${prefix}Title" class="input"></div><div><label class="label">상단 설명</label><input id="${prefix}Summary" class="input"></div>

 <div class="wide section-box"><label class="label">도입 섹션 제목</label><input id="${prefix}IntroHeading" class="input"></div>
 <div class="wide"><label class="label">도입문</label><textarea id="${prefix}Intro" class="textarea"></textarea></div>

 <div class="wide section-box"><label class="label">실무 기준 섹션 제목</label><input id="${prefix}CriteriaHeading" class="input"></div>
 <div class="wide"><label class="label">실무 기준 (한 줄에 한 항목)</label><textarea id="${prefix}Criteria" class="textarea"></textarea></div>

 <div><label class="label">바로 해볼 일 제목</label><input id="${prefix}ActionHeading" class="input"></div>
 <div><label class="label">바로 해볼 일 본문</label><textarea id="${prefix}Action" class="textarea"></textarea></div>

 <div class="wide section-box"><div class="section-title"><div style="flex:1"><label class="label">실행 순서 섹션 제목</label><input id="${prefix}StepHeading" class="input"></div><button id="${prefix}AddStep" class="btn light mini">+ STEP</button></div><div id="${prefix}Steps" class="repeat"></div></div>

 <div class="wide section-box"><label class="label">현장 상황 섹션 제목</label><input id="${prefix}ExampleHeading" class="input"></div>
 <div><label class="label">예시 라벨</label><input id="${prefix}ExampleLabel" class="input"></div>
 <div><label class="label">현장 예시 본문</label><textarea id="${prefix}Example" class="textarea"></textarea></div>

 <div><label class="label">자주 하는 실수 제목</label><input id="${prefix}MistakeHeading" class="input"></div>
 <div><label class="label">자주 하는 실수 (한 줄에 한 항목)</label><textarea id="${prefix}Mistakes" class="textarea"></textarea></div>

 <div><label class="label">마무리 제목</label><input id="${prefix}FinishTitle" class="input"></div><div><label class="label">마무리 본문</label><textarea id="${prefix}FinishBody" class="textarea"></textarea></div>
 <div class="wide"><button id="${prefix}Save" class="btn primary" disabled>상세페이지 저장</button></div></div>`}
$("bizDetailEditor").innerHTML=detailEditorHtml("bd");
$("problemDetailEditor").innerHTML=detailEditorHtml("pd");

function loadDetailInto(prefix,st,d,h,path,sha){
 st.path=path;st.sha=sha;st.html=h;st.steps=Array.from(d.querySelectorAll(".step-card")).map(x=>({title:text(x,"strong"),body:text(x,"p")}));
 const article=d.querySelector(".article"),h2s=Array.from(article?.querySelectorAll(":scope > h2")||[]);
 $(`${prefix}Title`).value=text(d,".page-hero h1");
 $(`${prefix}Summary`).value=text(d,".page-hero h1 + p");
 $(`${prefix}IntroHeading`).value=h2s[0]?.textContent.trim()||"왜 이 내용을 먼저 봐야 할까요?";
 $(`${prefix}Intro`).value=text(d,".detail-intro");
 $(`${prefix}CriteriaHeading`).value=h2s[1]?.textContent.trim()||"실무에서 먼저 보는 기준";
 const uls=Array.from(d.querySelectorAll(".article > ul"));$(`${prefix}Criteria`).value=uls[0]?Array.from(uls[0].querySelectorAll("li")).map(x=>x.textContent.trim()).join("\n"):"";
 $(`${prefix}ActionHeading`).value=text(d,".practice-box strong")||"바로 해볼 일";
 $(`${prefix}Action`).value=text(d,".practice-box p");
 $(`${prefix}StepHeading`).value=h2s[2]?.textContent.trim()||"실행 순서";
 $(`${prefix}ExampleHeading`).value=h2s[3]?.textContent.trim()||"현장에서 자주 생기는 상황";
 $(`${prefix}ExampleLabel`).value=text(d,".example-box strong")||"예시";
 $(`${prefix}Example`).value=text(d,".example-box p");
 $(`${prefix}MistakeHeading`).value=text(d,".mistake-box strong")||"자주 하는 실수";
 $(`${prefix}Mistakes`).value=Array.from(d.querySelectorAll(".mistake-box li")).map(x=>x.textContent.trim()).join("\n");
 $(`${prefix}FinishTitle`).value=text(d,".finish-box strong");$(`${prefix}FinishBody`).value=text(d,".finish-box p");
 renderDetailSteps(prefix,st);renderDetailPreview(prefix,st);$(`${prefix}Save`).disabled=false;
}
function renderDetailSteps(prefix,st){$(`${prefix}Steps`).innerHTML=(st.steps||[]).map((x,i)=>`<div class="repeat-row" data-i="${i}"><div class="repeat-head"><strong>STEP ${i+1}</strong><div class="actions"><button class="btn light mini ds-up">↑</button><button class="btn light mini ds-down">↓</button><button class="btn danger mini ds-del">삭제</button></div></div><input class="input ds-title" value="${esc(x.title)}"><textarea class="textarea ds-body" style="min-height:55px;margin-top:5px">${esc(x.body)}</textarea></div>`).join("");$(`${prefix}Steps`).querySelectorAll(".repeat-row").forEach(r=>{const i=+r.dataset.i,sync=()=>{st.steps[i]={title:r.querySelector(".ds-title").value,body:r.querySelector(".ds-body").value};renderDetailPreview(prefix,st)};r.querySelectorAll("input,textarea").forEach(x=>x.oninput=sync);r.querySelector(".ds-up").onclick=()=>move(st.steps,i,-1,()=>renderDetailSteps(prefix,st),()=>renderDetailPreview(prefix,st));r.querySelector(".ds-down").onclick=()=>move(st.steps,i,1,()=>renderDetailSteps(prefix,st),()=>renderDetailPreview(prefix,st));r.querySelector(".ds-del").onclick=()=>{st.steps.splice(i,1);renderDetailSteps(prefix,st);renderDetailPreview(prefix,st)}})}
function renderDetailPreview(prefix,st){const m=prefix==="bd"?$("bizDetailPreview"):$("problemDetailPreview");m.innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">BUSINESS PRACTICE</div><h1>${esc($(`${prefix}Title`).value)}</h1><p>${esc($(`${prefix}Summary`).value)}</p></div><div class="pv-section article-preview">
<h3>${esc($(`${prefix}IntroHeading`).value)}</h3><p>${esc($(`${prefix}Intro`).value)}</p>
<h3>${esc($(`${prefix}CriteriaHeading`).value)}</h3><ul>${lines($(`${prefix}Criteria`).value).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
<div class="detail-pv-box detail-pv-practice"><strong>${esc($(`${prefix}ActionHeading`).value)}</strong><p>${esc($(`${prefix}Action`).value)}</p></div>
<h3>${esc($(`${prefix}StepHeading`).value)}</h3><div class="detail-pv-step-grid">${(st.steps||[]).map((x,i)=>`<div class="detail-pv-step"><b>STEP ${i+1}</b><strong>${esc(x.title)}</strong><small>${esc(x.body)}</small></div>`).join("")}</div>
<h3>${esc($(`${prefix}ExampleHeading`).value)}</h3><div class="detail-pv-box"><strong>${esc($(`${prefix}ExampleLabel`).value)}</strong><p>${esc($(`${prefix}Example`).value)}</p></div>
<div class="detail-pv-box detail-pv-mistake"><strong>${esc($(`${prefix}MistakeHeading`).value)}</strong><ul>${lines($(`${prefix}Mistakes`).value).map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>
<div class="detail-pv-box detail-pv-finish"><strong>${esc($(`${prefix}FinishTitle`).value)}</strong><p>${esc($(`${prefix}FinishBody`).value)}</p></div>
</div>`}
async function saveDetail(prefix,st,statusId){try{
 const d=doc(st.html),article=d.querySelector(".article"),h2s=Array.from(article?.querySelectorAll(":scope > h2")||[]);
 setText(d,".page-hero h1",$(`${prefix}Title`).value);setText(d,".page-hero h1 + p",$(`${prefix}Summary`).value);
 if(h2s[0])h2s[0].textContent=$(`${prefix}IntroHeading`).value;
 setText(d,".detail-intro",$(`${prefix}Intro`).value);
 if(h2s[1])h2s[1].textContent=$(`${prefix}CriteriaHeading`).value;
 const ul=d.querySelector(".article > ul");if(ul)ul.innerHTML=lines($(`${prefix}Criteria`).value).map(x=>`<li>${esc(x)}</li>`).join("");
 setText(d,".practice-box strong",$(`${prefix}ActionHeading`).value);setText(d,".practice-box p",$(`${prefix}Action`).value);
 if(h2s[2])h2s[2].textContent=$(`${prefix}StepHeading`).value;
 const sg=d.querySelector(".step-grid");if(sg)sg.innerHTML=(st.steps||[]).map((x,i)=>`<div class="step-card"><b>STEP ${i+1}</b><strong>${esc(x.title)}</strong><p>${esc(x.body)}</p></div>`).join("");
 if(h2s[3])h2s[3].textContent=$(`${prefix}ExampleHeading`).value;
 setText(d,".example-box strong",$(`${prefix}ExampleLabel`).value);setText(d,".example-box p",$(`${prefix}Example`).value);
 setText(d,".mistake-box strong",$(`${prefix}MistakeHeading`).value);
 const mu=d.querySelector(".mistake-box ul");if(mu)mu.innerHTML=lines($(`${prefix}Mistakes`).value).map(x=>`<li>${esc(x)}</li>`).join("");
 setText(d,".finish-box strong",$(`${prefix}FinishTitle`).value);setText(d,".finish-box p",$(`${prefix}FinishBody`).value);
 const h=out(d),r=await put(st.path,h,st.sha,`Update detail ${st.path}`);st.sha=r.content.sha;st.html=h;stat(statusId,"✓ 상세페이지를 저장했습니다.","ok")
 }catch(e){stat(statusId,"상세페이지 저장 실패: "+e.message,"err")}}
["bd","pd"].forEach(p=>{bind([`${p}Title`,`${p}Summary`,`${p}IntroHeading`,`${p}Intro`,`${p}CriteriaHeading`,`${p}Criteria`,`${p}ActionHeading`,`${p}Action`,`${p}StepHeading`,`${p}ExampleHeading`,`${p}ExampleLabel`,`${p}Example`,`${p}MistakeHeading`,`${p}Mistakes`,`${p}FinishTitle`,`${p}FinishBody`],()=>renderDetailPreview(p,p==="bd"?S.business.detail:S.problems.detail));$(`${p}AddStep`).onclick=()=>{const st=p==="bd"?S.business.detail:S.problems.detail;st.steps=st.steps||[];st.steps.push({title:"새 단계",body:""});renderDetailSteps(p,st);renderDetailPreview(p,st)}});
$("bdSave").onclick=()=>saveDetail("bd",S.business.detail,"businessStatus");$("pdSave").onclick=()=>saveDetail("pd",S.problems.detail,"problemStatus");


function previewBusinessHierarchy(){
  const selected=S.business.selected>=0?S.business.categories[S.business.selected]:null;
  const topics=(S.business.cat&&S.business.cat.topics)||[];
  $("businessHierarchyPreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">BUSINESS PRACTICE</div><h1>${esc($("bizLandingTitle").value||"사업실무")}</h1><p>${esc($("bizLandingSummary").value||"")}</p></div>
  <div class="pv-section"><h2>1단계 분야</h2><div class="pv-grid">${S.business.categories.map((x,i)=>`<div class="pv-item"><strong>${esc(x.title)}</strong><small>${esc(x.summary)}</small></div>`).join("")}</div></div>
  ${selected?`<div class="pv-section"><h2>${esc($("bizCatTitle").value||selected.title)}</h2><p>${esc($("bizCatSummary").value||selected.summary)}</p><h2 style="margin-top:10px">${esc($("bizCatSectionTitle").value||"세부주제")}</h2><p>${esc($("bizCatSectionSummary").value||"")}</p><div class="pv-grid">${topics.map(t=>`<div class="pv-item"><strong>${esc(t.title)}</strong><small>${esc(t.summary)}</small></div>`).join("")}</div></div>`:""}`;
}

/* BUSINESS */
async function loadBusiness(){const g=await get("business.html"),h=d64(g.content),d=doc(h);S.business.sha=g.sha;S.business.html=h;$("bizLandingTitle").value=text(d,".page-hero h1");$("bizLandingSummary").value=text(d,".page-hero h1 + p");S.business.categories=Array.from(d.querySelectorAll(".grid .card")).map(a=>({title:text(a,"h3"),summary:text(a,"p"),href:a.getAttribute("href")||""}));renderBizCategories();previewBusinessHierarchy();$("saveBizLanding").disabled=false;if(S.business.categories.length)await selectBizCategory(0)}
function renderBizCategories(){$("bizCategories").innerHTML=S.business.categories.map((x,i)=>`<div class="tile ${i===S.business.selected?"active":""}" data-i="${i}"><input class="input bc-title" value="${esc(x.title)}"><input class="input bc-href" value="${esc(x.href)}"><textarea class="textarea bc-summary" style="min-height:55px">${esc(x.summary)}</textarea><div class="actions"><button class="btn dark mini bc-edit">2단계</button><button class="btn light mini bc-left">←</button><button class="btn light mini bc-right">→</button><button class="btn danger mini bc-del">삭제</button></div></div>`).join("");$("bizCategories").querySelectorAll(".tile").forEach(r=>{const i=+r.dataset.i,sync=()=>{const x=S.business.categories[i];x.title=r.querySelector(".bc-title").value;x.href=r.querySelector(".bc-href").value;x.summary=r.querySelector(".bc-summary").value;previewBusinessHierarchy()};r.querySelectorAll("input,textarea").forEach(x=>x.oninput=sync);r.querySelector(".bc-edit").onclick=()=>{sync();selectBizCategory(i)};r.querySelector(".bc-left").onclick=()=>move(S.business.categories,i,-1,renderBizCategories);r.querySelector(".bc-right").onclick=()=>move(S.business.categories,i,1,renderBizCategories);r.querySelector(".bc-del").onclick=()=>{S.business.categories.splice(i,1);renderBizCategories();previewBusinessHierarchy()}})}
$("addBizCategory").onclick=()=>{S.business.categories.push({title:"새 분야",summary:"",href:`business-${Date.now()}.html`});renderBizCategories();previewBusinessHierarchy()};
async function selectBizCategory(i){S.business.selected=i;renderBizCategories();const x=S.business.categories[i];try{const g=await get(x.href),h=d64(g.content),d=doc(h);S.business.cat={sha:g.sha,html:h,topics:Array.from(d.querySelectorAll(".topic-card")).map(a=>({title:text(a,"h3"),summary:text(a,"p"),href:a.getAttribute("href")||""}))};$("bizCatTitle").value=text(d,".page-hero h1");$("bizCatSummary").value=text(d,".page-hero h1 + p");$("bizCatSectionTitle").value=text(d,".section-head h2");$("bizCatSectionSummary").value=text(d,".section-head p");renderBizTopics();previewBusinessHierarchy();$("saveBizCategory").disabled=false}catch(e){stat("businessStatus","분야 페이지를 불러오지 못했습니다: "+e.message,"err")}}
function renderBizTopics(){$("bizTopics").innerHTML=(S.business.cat.topics||[]).map((x,i)=>`<div class="tile" data-i="${i}"><input class="input bt-title" value="${esc(x.title)}"><input class="input bt-href" value="${esc(x.href)}"><textarea class="textarea bt-summary" style="min-height:55px">${esc(x.summary)}</textarea><div class="actions"><button class="btn dark mini bt-detail">상세 편집</button><button class="btn light mini bt-left">←</button><button class="btn light mini bt-right">→</button><button class="btn danger mini bt-del">삭제</button></div></div>`).join("");$("bizTopics").querySelectorAll(".tile").forEach(r=>{const i=+r.dataset.i,sync=()=>{const x=S.business.cat.topics[i];x.title=r.querySelector(".bt-title").value;x.href=r.querySelector(".bt-href").value;x.summary=r.querySelector(".bt-summary").value;previewBusinessHierarchy()};r.querySelectorAll("input,textarea").forEach(x=>x.oninput=sync);r.querySelector(".bt-detail").onclick=async()=>{sync();try{const x=S.business.cat.topics[i],g=await get(x.href),h=d64(g.content),d=doc(h);$("bizDetailPath").textContent=x.href;loadDetailInto("bd",S.business.detail,d,h,x.href,g.sha)}catch(e){stat("businessStatus","상세페이지를 불러오지 못했습니다: "+e.message,"err")}};r.querySelector(".bt-left").onclick=()=>move(S.business.cat.topics,i,-1,renderBizTopics);r.querySelector(".bt-right").onclick=()=>move(S.business.cat.topics,i,1,renderBizTopics);r.querySelector(".bt-del").onclick=()=>{S.business.cat.topics.splice(i,1);renderBizTopics();previewBusinessHierarchy()}})}
$("addBizTopic").onclick=()=>{S.business.cat.topics=S.business.cat.topics||[];S.business.cat.topics.push({title:"새 세부주제",summary:"",href:`detail-${Date.now()}.html`});renderBizTopics();previewBusinessHierarchy()};
$("saveBizLanding").onclick=async()=>{try{const d=doc(S.business.html);setText(d,".page-hero h1",$("bizLandingTitle").value);setText(d,".page-hero h1 + p",$("bizLandingSummary").value);const old=Array.from(d.querySelectorAll(".grid .card")),p=old[0]?.parentElement,t=old[0]?.cloneNode(true);if(p&&t){old.forEach(x=>x.remove());S.business.categories.forEach((x,i)=>{const n=t.cloneNode(true);n.href=x.href;setText(n,".num",String(i+1).padStart(2,"0"));setText(n,"h3",x.title);setText(n,"p",x.summary);p.appendChild(n)})}const h=out(d),r=await put("business.html",h,S.business.sha,"Update business landing");S.business.sha=r.content.sha;S.business.html=h;stat("businessStatus","✓ 사업실무 랜딩/1단계를 저장했습니다.","ok")}catch(e){stat("businessStatus","저장 실패: "+e.message,"err")}};
$("saveBizCategory").onclick=async()=>{try{const x=S.business.categories[S.business.selected],d=doc(S.business.cat.html);setText(d,".page-hero h1",$("bizCatTitle").value);setText(d,".page-hero h1 + p",$("bizCatSummary").value);setText(d,".section-head h2",$("bizCatSectionTitle").value);setText(d,".section-head p",$("bizCatSectionSummary").value);const grid=d.querySelector(".topic-grid");if(grid){grid.innerHTML="";S.business.cat.topics.forEach(t=>{const a=d.createElement("a");a.className="topic-card";a.href=t.href;a.innerHTML=`<div class="kicker">${esc($("bizCatTitle").value)}</div><h3>${esc(t.title)}</h3><p>${esc(t.summary)}</p><div class="more">내용 보기 →</div>`;grid.appendChild(a)})}const h=out(d),r=await put(x.href,h,S.business.cat.sha,`Update ${x.title}`);S.business.cat.sha=r.content.sha;S.business.cat.html=h;stat("businessStatus","✓ 선택 분야/2단계를 저장했습니다.","ok")}catch(e){stat("businessStatus","저장 실패: "+e.message,"err")}};


function previewProblemHierarchy(){
  const selected=S.problems.selected>=0?S.problems.roots[S.problems.selected]:null;
  const subs=(S.problems.page&&S.problems.page.subs)||[];
  $("problemHierarchyPreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">SOLVE THE PROBLEM</div><h1>${esc($("prLandingTitle").value||"문제별 해결")}</h1><p>${esc($("prLandingSummary").value||"")}</p></div>
  <div class="pv-section"><h2>1단계 큰 문제</h2><div class="pv-grid">${S.problems.roots.map(x=>`<div class="pv-item"><strong>${esc(x.title)}</strong></div>`).join("")}</div></div>
  ${selected?`<div class="pv-section"><h2>${esc($("prPageTitle").value||selected.title)}</h2><p>${esc($("prPageSummary").value||"")}</p><h2 style="margin-top:10px">${esc($("prSectionTitle").value||"관련 문제")}</h2><p>${esc($("prSectionSummary").value||"")}</p><div class="pv-grid">${subs.map(x=>`<div class="pv-item"><strong>${esc(x.title)}</strong><small>${esc(x.summary)}</small></div>`).join("")}</div></div>`:""}`;
}

/* PROBLEMS */
async function loadProblems(){const g=await get("problems.html"),h=d64(g.content),d=doc(h);S.problems.sha=g.sha;S.problems.html=h;$("prLandingTitle").value=text(d,".page-hero h1");$("prLandingSummary").value=text(d,".page-hero h1 + p");S.problems.roots=Array.from(d.querySelectorAll(".problem-card")).map(a=>({title:text(a,"strong"),href:a.getAttribute("href")||""}));renderProblemRoots();previewProblemHierarchy();$("saveProblemLanding").disabled=false;if(S.problems.roots.length)await selectProblemRoot(0)}
function renderProblemRoots(){$("problemRoots").innerHTML=S.problems.roots.map((x,i)=>`<div class="tile ${i===S.problems.selected?"active":""}" data-i="${i}"><textarea class="textarea pr-title" style="min-height:62px">${esc(x.title)}</textarea><input class="input pr-href" value="${esc(x.href)}"><div class="actions"><button class="btn dark mini pr-edit">2단계</button><button class="btn light mini pr-left">←</button><button class="btn light mini pr-right">→</button><button class="btn danger mini pr-del">삭제</button></div></div>`).join("");$("problemRoots").querySelectorAll(".tile").forEach(r=>{const i=+r.dataset.i,sync=()=>{S.problems.roots[i].title=r.querySelector(".pr-title").value;S.problems.roots[i].href=r.querySelector(".pr-href").value;previewProblemHierarchy()};r.querySelectorAll("input,textarea").forEach(x=>x.oninput=sync);r.querySelector(".pr-edit").onclick=()=>{sync();selectProblemRoot(i)};r.querySelector(".pr-left").onclick=()=>move(S.problems.roots,i,-1,renderProblemRoots);r.querySelector(".pr-right").onclick=()=>move(S.problems.roots,i,1,renderProblemRoots);r.querySelector(".pr-del").onclick=()=>{S.problems.roots.splice(i,1);renderProblemRoots();previewProblemHierarchy()}})}
$("addProblemRoot").onclick=()=>{S.problems.roots.push({title:"새 큰 문제",href:`problem-${Date.now()}.html`});renderProblemRoots();previewProblemHierarchy()};
async function selectProblemRoot(i){S.problems.selected=i;renderProblemRoots();const x=S.problems.roots[i];try{const g=await get(x.href),h=d64(g.content),d=doc(h);S.problems.page={sha:g.sha,html:h,subs:Array.from(d.querySelectorAll(".problem-subcard")).map(a=>({title:text(a,"h3"),summary:text(a,"p"),href:a.getAttribute("href")||""}))};$("prPageTitle").value=text(d,".page-hero h1");$("prPageSummary").value=text(d,".page-hero h1 + p");$("prSectionTitle").value=text(d,".section-head h2");$("prSectionSummary").value=text(d,".section-head p");renderProblemSubs();previewProblemHierarchy();$("saveProblemPage").disabled=false}catch(e){stat("problemStatus","문제 페이지를 불러오지 못했습니다: "+e.message,"err")}}
function renderProblemSubs(){$("problemSubs").innerHTML=(S.problems.page.subs||[]).map((x,i)=>`<div class="tile" data-i="${i}"><input class="input ps-title" value="${esc(x.title)}"><input class="input ps-href" value="${esc(x.href)}"><textarea class="textarea ps-summary" style="min-height:55px">${esc(x.summary)}</textarea><div class="actions"><button class="btn dark mini ps-detail">상세 편집</button><button class="btn light mini ps-left">←</button><button class="btn light mini ps-right">→</button><button class="btn danger mini ps-del">삭제</button></div></div>`).join("");$("problemSubs").querySelectorAll(".tile").forEach(r=>{const i=+r.dataset.i,sync=()=>{const x=S.problems.page.subs[i];x.title=r.querySelector(".ps-title").value;x.href=r.querySelector(".ps-href").value;x.summary=r.querySelector(".ps-summary").value;previewProblemHierarchy()};r.querySelectorAll("input,textarea").forEach(x=>x.oninput=sync);r.querySelector(".ps-detail").onclick=async()=>{sync();try{const x=S.problems.page.subs[i],g=await get(x.href),h=d64(g.content),d=doc(h);$("problemDetailPath").textContent=x.href;loadDetailInto("pd",S.problems.detail,d,h,x.href,g.sha)}catch(e){stat("problemStatus","연결 상세페이지를 불러오지 못했습니다: "+e.message,"err")}};r.querySelector(".ps-left").onclick=()=>move(S.problems.page.subs,i,-1,renderProblemSubs);r.querySelector(".ps-right").onclick=()=>move(S.problems.page.subs,i,1,renderProblemSubs);r.querySelector(".ps-del").onclick=()=>{S.problems.page.subs.splice(i,1);renderProblemSubs();previewProblemHierarchy()}})}
$("addProblemSub").onclick=()=>{S.problems.page.subs=S.problems.page.subs||[];S.problems.page.subs.push({title:"새 관련 문제",summary:"",href:""});renderProblemSubs();previewProblemHierarchy()};
$("saveProblemLanding").onclick=async()=>{try{const d=doc(S.problems.html);setText(d,".page-hero h1",$("prLandingTitle").value);setText(d,".page-hero h1 + p",$("prLandingSummary").value);const old=Array.from(d.querySelectorAll(".problem-card")),p=old[0]?.parentElement,t=old[0]?.cloneNode(true);if(p&&t){old.forEach(x=>x.remove());S.problems.roots.forEach((x,i)=>{const n=t.cloneNode(true);n.href=x.href;setText(n,"span",String(i+1).padStart(2,"0"));setText(n,"strong",x.title);p.appendChild(n)})}const h=out(d),r=await put("problems.html",h,S.problems.sha,"Update problems landing");S.problems.sha=r.content.sha;S.problems.html=h;stat("problemStatus","✓ 문제별 해결 랜딩/1단계를 저장했습니다.","ok")}catch(e){stat("problemStatus","저장 실패: "+e.message,"err")}};
$("saveProblemPage").onclick=async()=>{try{const root=S.problems.roots[S.problems.selected],d=doc(S.problems.page.html);setText(d,".page-hero h1",$("prPageTitle").value);setText(d,".page-hero h1 + p",$("prPageSummary").value);setText(d,".section-head h2",$("prSectionTitle").value);setText(d,".section-head p",$("prSectionSummary").value);const grid=d.querySelector(".problem-subgrid");if(grid){grid.innerHTML="";S.problems.page.subs.forEach(x=>{const a=d.createElement("a");a.className="problem-subcard";a.href=x.href;a.innerHTML=`<div class="kicker">관련 문제</div><h3>${esc(x.title)}</h3><p>${esc(x.summary)}</p><div class="more">관련 내용 보기 →</div>`;grid.appendChild(a)})}const h=out(d),r=await put(root.href,h,S.problems.page.sha,`Update problem ${root.title}`);S.problems.page.sha=r.content.sha;S.problems.page.html=h;stat("problemStatus","✓ 선택 문제/2단계를 저장했습니다.","ok")}catch(e){stat("problemStatus","저장 실패: "+e.message,"err")}};

bind(["prLandingTitle","prLandingSummary","prPageTitle","prPageSummary","prSectionTitle","prSectionSummary"],previewProblemHierarchy);

/* CONTENTS */
async function loadContents(){const [pg,lg]=await Promise.all([get(CFG.posts),get("contents.html")]);S.contents.sha=pg.sha;S.contents.posts=JSON.parse(d64(pg.content));S.contents.filterCategory=S.contents.filterCategory||"all";S.contents.landingSha=lg.sha;S.contents.landingHtml=d64(lg.content);const d=doc(S.contents.landingHtml);$("ctLandingTitle").value=text(d,".page-hero h1");$("ctLandingSummary").value=text(d,".page-hero h1 + p");fillPostCategories();renderPostFolders();renderPostList();newPost()}
function contentAdminCats(){return S.business.categories.length?S.business.categories.map(x=>({key:(x.href||"").replace(".html",""),label:x.title})):Array.from(new Map(S.contents.posts.filter(p=>p.category).map(p=>[p.category,p.categoryLabel])).entries()).map(([key,label])=>({key,label}))}
function renderPostFolders(){
 const cats=contentAdminCats(),counts={};cats.forEach(x=>counts[x.key]=0);let unclassified=0;
 S.contents.posts.forEach(p=>p.category?(counts[p.category]=(counts[p.category]||0)+1):unclassified++);
 const folders=[{key:"all",label:"전체",count:S.contents.posts.length},{key:"unclassified",label:"미분류",count:unclassified},...cats.map(x=>({...x,count:counts[x.key]||0}))];
 $("postFolderBar").innerHTML=folders.map(x=>`<button class="admin-folder ${S.contents.filterCategory===x.key?"active":""}" data-key="${esc(x.key)}"><strong>${esc(x.label)}</strong><small>${x.count}개</small></button>`).join("");
 $("postFolderBar").querySelectorAll(".admin-folder").forEach(b=>b.onclick=()=>{S.contents.filterCategory=b.dataset.key;renderPostFolders();renderPostList()});
}
function renderPostList(){
 const filter=S.contents.filterCategory||"all",q=($("postAdminSearch")?.value||"").trim().toLowerCase();
 let arr=S.contents.posts.slice().filter(p=>filter==="all"||filter==="unclassified"?!p.category:p.category===filter);
 if(q)arr=arr.filter(p=>(p.title||"").toLowerCase().includes(q)||(p.summary||"").toLowerCase().includes(q));
 arr.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 $("postList").innerHTML=arr.length?arr.map(p=>{const i=S.contents.posts.findIndex(x=>x.id===p.id);return `<div class="list-row"><div><strong>${esc(p.title)}</strong><small>${esc(p.date||"")} · ${esc(p.categoryLabel||"미분류")}${p.subcategoryLabel?" / "+esc(p.subcategoryLabel):""}</small></div><button class="btn light mini ep" data-i="${i}">수정</button></div>`}).join(""):`<div class="hint">이 폴더에는 콘텐츠가 없습니다.</div>`;
 $("postList").querySelectorAll(".ep").forEach(b=>b.onclick=()=>editPost(+b.dataset.i))
}
$("postAdminSearch").oninput=renderPostList;
function fillPostCategories(){const cats=S.business.categories.length?S.business.categories.map(x=>({key:(x.href||"").replace(".html",""),label:x.title})):Array.from(new Map(S.contents.posts.map(p=>[p.category,p.categoryLabel])).entries()).map(([key,label])=>({key,label}));$("postCategory").innerHTML=`<option value="">미분류 (최신 콘텐츠에만 표시)</option>`+cats.map(x=>`<option value="${esc(x.key)}">${esc(x.label)}</option>`).join("");refreshPostSubs()}
async function refreshPostSubs(selected=""){
 const cat=$("postCategory").value;if(!cat){$("postSubcategory").innerHTML=`<option value="">미분류</option>`;return}
 const info=S.business.categories.find(x=>(x.href||"").replace(/\.html$/,'')===cat);let topics=[];
 if(info){try{const g=await get(info.href),d=doc(d64(g.content));topics=Array.from(d.querySelectorAll(".topic-card")).map(a=>{const href=a.getAttribute("href")||"";let key=href.replace(/\.html$/,'');if(key.startsWith(cat+"-"))key=key.slice(cat.length+1);return{key,label:text(a,"h3"),page:href}})}catch(e){console.warn("subcategory load",e)}}
 if(!topics.length){const map=new Map();S.contents.posts.filter(p=>p.category===cat&&p.subcategory).forEach(p=>map.set(p.subcategory,{key:p.subcategory,label:p.subcategoryLabel,page:p.subcategoryPage||""}));topics=Array.from(map.values())}
 $("postSubcategory").innerHTML=`<option value="">세부주제 선택</option>`+topics.map(x=>`<option value="${esc(x.key)}" data-page="${esc(x.page)}">${esc(x.label)}</option>`).join("");if(selected)$("postSubcategory").value=selected
}
$("postCategory").onchange=()=>refreshPostSubs();
function newPost(){S.contents.edit=-1;$("postTitle").value="";$("postDate").value=today();$("postSummary").value="";const f=S.contents.filterCategory||"all";$("postCategory").value=(f!=="all"&&f!=="unclassified")?f:"";refreshPostSubs();S.contents.editSections=[{heading:"새 소제목",paragraphs:[""],bullets:[]}];renderPostSections();$("savePost").disabled=false;previewPost()}
$("newPost").onclick=newPost;
async function editPost(i){S.contents.edit=i;const p=S.contents.posts[i];$("postTitle").value=p.title||"";$("postDate").value=p.date||today();$("postSummary").value=p.summary||"";$("postCategory").value=p.category||"";await refreshPostSubs(p.subcategory||"");S.contents.editSections=JSON.parse(JSON.stringify(p.sections||[]));if(!S.contents.editSections.length)S.contents.editSections=[{heading:"본문",paragraphs:[""],bullets:[]}];renderPostSections();$("savePost").disabled=false;previewPost()}
function renderPostSections(){$("postSections").innerHTML=(S.contents.editSections||[]).map((s,i)=>`<div class="repeat-row" data-i="${i}"><div class="repeat-head"><strong>본문 섹션 ${i+1}</strong><div class="actions"><button class="btn light mini psec-up">↑</button><button class="btn light mini psec-down">↓</button><button class="btn danger mini psec-del">삭제</button></div></div><label class="label">소제목</label><input class="input psec-head" value="${esc(s.heading||"")}"><label class="label">문단 (한 줄에 한 문단)</label><textarea class="textarea psec-par">${esc((s.paragraphs||[]).join("\n"))}</textarea><label class="label">목록 (한 줄에 한 항목)</label><textarea class="textarea psec-bul">${esc((s.bullets||[]).join("\n"))}</textarea></div>`).join("");$("postSections").querySelectorAll(".repeat-row").forEach(r=>{const i=+r.dataset.i,sync=()=>{S.contents.editSections[i]={heading:r.querySelector(".psec-head").value,paragraphs:lines(r.querySelector(".psec-par").value),bullets:lines(r.querySelector(".psec-bul").value)};previewPost()};r.querySelectorAll("input,textarea").forEach(x=>x.oninput=sync);r.querySelector(".psec-up").onclick=()=>move(S.contents.editSections,i,-1,renderPostSections,previewPost);r.querySelector(".psec-down").onclick=()=>move(S.contents.editSections,i,1,renderPostSections,previewPost);r.querySelector(".psec-del").onclick=()=>{S.contents.editSections.splice(i,1);renderPostSections();previewPost()}})}
$("addPostSection").onclick=()=>{S.contents.editSections=S.contents.editSections||[];S.contents.editSections.push({heading:"새 소제목",paragraphs:[""],bullets:[]});renderPostSections();previewPost()};
function previewPost(){$("postPreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">BIZZIP CONTENT</div><h1>${esc($("postTitle").value)}</h1><p>${esc($("postSummary").value)}</p></div><div class="pv-section article-preview">${(S.contents.editSections||[]).map(s=>`<h3>${esc(s.heading||"")}</h3>${(s.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join("")}${(s.bullets||[]).length?`<ul>${s.bullets.map(b=>`<li>${esc(b)}</li>`).join("")}</ul>`:""}`).join("")}</div>`}
bind(["postTitle","postSummary"],previewPost);
$("savePost").onclick=async()=>{try{const old=S.contents.edit>=0?S.contents.posts[S.contents.edit]:{};const cat=$("postCategory").value,catLabel=cat?($("postCategory").selectedOptions[0]?.textContent||""):"";const sub=$("postSubcategory").value,subLabel=sub?($("postSubcategory").selectedOptions[0]?.textContent||""):"";const subPage=sub?($("postSubcategory").selectedOptions[0]?.dataset.page||""):"";const p={...old,id:old.id||`post-${Date.now()}`,title:$("postTitle").value.trim(),date:$("postDate").value,category:cat,categoryLabel:catLabel,summary:$("postSummary").value.trim(),sections:S.contents.editSections||[],subcategory:sub,subcategoryLabel:subLabel,subcategoryPage:subPage};if(S.contents.edit>=0)S.contents.posts[S.contents.edit]=p;else S.contents.posts.push(p);const r=await put(CFG.posts,JSON.stringify(S.contents.posts,null,2),S.contents.sha,"Update BIZZIP posts");S.contents.sha=r.content.sha;renderPostFolders();renderPostList();stat("contentsStatus","✓ 콘텐츠 본문까지 저장했습니다.","ok")}catch(e){stat("contentsStatus","저장 실패: "+e.message,"err")}};
$("saveContentsLanding").onclick=async()=>{try{const d=doc(S.contents.landingHtml);setText(d,".page-hero h1",$("ctLandingTitle").value);setText(d,".page-hero h1 + p",$("ctLandingSummary").value);const h=out(d),r=await put("contents.html",h,S.contents.landingSha,"Update contents landing");S.contents.landingSha=r.content.sha;S.contents.landingHtml=h;stat("contentsStatus","✓ 콘텐츠 랜딩을 저장했습니다.","ok")}catch(e){stat("contentsStatus","저장 실패: "+e.message,"err")}};


const DEFAULT_RESOURCE_TOPICS=[
 {id:"business-prep",label:"사업 준비",desc:"사업 시작과 준비 단계에서 사용하는 자료"},
 {id:"product-cost",label:"상품기획·원가",desc:"상품기획, 원가, 가격, OEM 관련 자료"},
 {id:"marketing-sales",label:"마케팅·판매",desc:"광고, 판매채널, 입점과 영업 관련 자료"},
 {id:"contract-operation",label:"계약·운영",desc:"계약, 비용, 외주와 문서 운영 자료"},
 {id:"logistics-inventory",label:"물류·재고",desc:"3PL, 재고, 포장, 반품 관련 자료"},
 {id:"data-analysis",label:"데이터·분석",desc:"매출, 고객, 성과분석과 데이터 활용 자료"},
 {id:"forms-checklists",label:"양식·체크리스트",desc:"바로 내려받아 활용하는 양식과 점검표"}
];
function slugTopic(v){return String(v||"topic").toLowerCase().trim().replace(/[^a-z0-9가-힣]+/g,"-").replace(/^-|-$/g,"")||("topic-"+Date.now())}
function renderResourceTopics(){
 $("resourceTopicRows").innerHTML=(S.resources.topics||[]).map((t,i)=>`<div class="repeat-row" data-i="${i}">
  <div class="repeat-head"><strong>폴더 ${i+1}</strong><div class="actions"><button class="btn light mini rt-up">↑</button><button class="btn light mini rt-down">↓</button><button class="btn danger mini rt-del">삭제</button></div></div>
  <div class="form-grid"><div><label class="label">폴더명</label><input class="input rt-label" value="${esc(t.label)}"></div><div><label class="label">폴더 ID</label><input class="input rt-id" value="${esc(t.id)}"></div><div class="wide"><label class="label">설명</label><input class="input rt-desc" value="${esc(t.desc||"")}"></div></div>
 </div>`).join("");
 $("resourceTopicRows").querySelectorAll(".repeat-row").forEach(r=>{const i=+r.dataset.i;const sync=()=>{const old=S.resources.topics[i].id;S.resources.topics[i]={id:slugTopic(r.querySelector(".rt-id").value),label:r.querySelector(".rt-label").value,desc:r.querySelector(".rt-desc").value};const now=S.resources.topics[i].id;if(old!==now)S.resources.cards.forEach(c=>{if(c.topic===old)c.topic=now});renderResourceFolderBar();renderResourceCards();previewResourceLanding()};r.querySelectorAll("input").forEach(x=>x.onchange=sync);r.querySelector(".rt-up").onclick=()=>move(S.resources.topics,i,-1,renderResourceTopics,()=>{renderResourceFolderBar();previewResourceLanding()});r.querySelector(".rt-down").onclick=()=>move(S.resources.topics,i,1,renderResourceTopics,()=>{renderResourceFolderBar();previewResourceLanding()});r.querySelector(".rt-del").onclick=()=>{const id=S.resources.topics[i].id;if(S.resources.cards.some(c=>c.topic===id)&&!confirm("이 폴더에 연결된 자료가 있습니다. 폴더를 삭제하면 해당 자료는 미분류가 됩니다. 계속할까요?"))return;S.resources.cards.forEach(c=>{if(c.topic===id)c.topic=""});S.resources.topics.splice(i,1);if(S.resources.filterTopic===id)S.resources.filterTopic="all";renderResourceTopics();renderResourceFolderBar();renderResourceCards();previewResourceLanding()}})
}
$("addResourceTopic").onclick=()=>{const id="topic-"+Date.now();S.resources.topics.push({id,label:"새 폴더",desc:""});renderResourceTopics();renderResourceFolderBar();previewResourceLanding()};
function renderResourceFolderBar(){
 const counts={};(S.resources.topics||[]).forEach(t=>counts[t.id]=0);let unclassified=0;S.resources.cards.forEach(c=>c.topic?(counts[c.topic]=(counts[c.topic]||0)+1):unclassified++);
 const folders=[{id:"all",label:"전체",count:S.resources.cards.length},{id:"unclassified",label:"미분류",count:unclassified},...(S.resources.topics||[]).map(t=>({...t,count:counts[t.id]||0}))];
 $("resourceFolderBar").innerHTML=folders.map(x=>`<button class="admin-folder ${S.resources.filterTopic===x.id?"active":""}" data-id="${esc(x.id)}"><strong>${esc(x.label)}</strong><small>${x.count}개</small></button>`).join("");
 $("resourceFolderBar").querySelectorAll(".admin-folder").forEach(b=>b.onclick=()=>{S.resources.filterTopic=b.dataset.id;renderResourceFolderBar();renderResourceCards()})
}
function resourceTopicOptions(selected){return `<option value="">미분류</option>`+(S.resources.topics||[]).map(t=>`<option value="${esc(t.id)}" ${t.id===selected?"selected":""}>${esc(t.label)}</option>`).join("")}


function previewResourceLanding(){
  const counts={};(S.resources.topics||[]).forEach(t=>counts[t.id]=0);S.resources.cards.forEach(c=>{if(c.topic)counts[c.topic]=(counts[c.topic]||0)+1});
  $("resourceLandingPreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">PRACTICAL RESOURCES</div><h1>${esc($("rsLandingTitle").value||"실무자료")}</h1><p>${esc($("rsLandingSummary").value||"")}</p></div>
  <div class="pv-section"><h3>주제 폴더</h3><div class="pv-grid">${(S.resources.topics||[]).map(t=>`<div class="pv-item"><strong>📁 ${esc(t.label)}</strong><small>${counts[t.id]||0}개 · ${esc(t.desc||"")}</small></div>`).join("")}</div></div>`;
}

/* RESOURCES */
async function loadResources(){const g=await get("resources.html"),h=d64(g.content),d=doc(h);S.resources.sha=g.sha;S.resources.html=h;$("rsLandingTitle").value=text(d,".page-hero h1");$("rsLandingSummary").value=text(d,".page-hero h1 + p");const te=d.querySelector("#resource-topics-data");try{S.resources.topics=JSON.parse(te?.textContent||"[]")}catch(e){S.resources.topics=[]}if(!S.resources.topics.length)S.resources.topics=JSON.parse(JSON.stringify(DEFAULT_RESOURCE_TOPICS));S.resources.filterTopic=S.resources.filterTopic||"all";S.resources.cards=Array.from(d.querySelectorAll(".resource-card")).map(a=>({title:text(a,"h3"),summary:text(a,"p"),href:a.getAttribute("href")||"",topic:a.dataset.topic||"",topicLabel:a.dataset.topicLabel||""}));renderResourceTopics();renderResourceFolderBar();renderResourceCards();previewResourceLanding();$("saveResourceLanding").disabled=false;if(S.resources.cards.length)await selectResource(0)}
function renderResourceCards(){
 const filter=S.resources.filterTopic||"all",q=($("resourceAdminSearch")?.value||"").trim().toLowerCase();
 const visible=S.resources.cards.map((x,i)=>({x,i})).filter(o=>(filter==="all"||filter==="unclassified"?!o.x.topic:o.x.topic===filter)&&(!q||(o.x.title||"").toLowerCase().includes(q)||(o.x.summary||"").toLowerCase().includes(q)));
 $("resourceCards").innerHTML=visible.length?visible.map(({x,i})=>`<div class="tile ${i===S.resources.selected?"active":""}" data-i="${i}"><input class="input rc-title" value="${esc(x.title)}"><select class="resource-topic-select rc-topic">${resourceTopicOptions(x.topic)}</select><input class="input rc-href" value="${esc(x.href)}"><textarea class="textarea rc-summary" style="min-height:55px">${esc(x.summary)}</textarea><div class="actions"><button class="btn dark mini rc-edit">상세 편집</button><button class="btn light mini rc-left">←</button><button class="btn light mini rc-right">→</button><button class="btn danger mini rc-del">삭제</button></div></div>`).join(""):`<div class="hint">이 폴더에는 자료가 없습니다.</div>`;
 $("resourceCards").querySelectorAll(".tile").forEach(r=>{const i=+r.dataset.i,sync=()=>{const x=S.resources.cards[i];x.title=r.querySelector(".rc-title").value;x.topic=r.querySelector(".rc-topic").value;x.topicLabel=(S.resources.topics.find(t=>t.id===x.topic)||{}).label||"";x.href=r.querySelector(".rc-href").value;x.summary=r.querySelector(".rc-summary").value;renderResourceFolderBar();previewResourceLanding()};r.querySelectorAll("input,textarea,select").forEach(x=>x.oninput=sync);r.querySelector(".rc-edit").onclick=()=>{sync();selectResource(i)};r.querySelector(".rc-left").onclick=()=>move(S.resources.cards,i,-1,renderResourceCards);r.querySelector(".rc-right").onclick=()=>move(S.resources.cards,i,1,renderResourceCards);r.querySelector(".rc-del").onclick=()=>{S.resources.cards.splice(i,1);renderResourceFolderBar();renderResourceCards();previewResourceLanding()}})
}
$("resourceAdminSearch").oninput=renderResourceCards;
$("addResourceCard").onclick=()=>{const f=S.resources.filterTopic||"all",topic=(f!=="all"&&f!=="unclassified")?f:"";S.resources.cards.push({title:"새 자료",summary:"",href:`resource-${Date.now()}.html`,topic,topicLabel:(S.resources.topics.find(t=>t.id===topic)||{}).label||""});renderResourceFolderBar();renderResourceCards();previewResourceLanding()};
async function selectResource(i){S.resources.selected=i;renderResourceCards();const x=S.resources.cards[i];try{
 const g=await get(x.href),h=d64(g.content),d=doc(h);const a=d.querySelector(".article a[download]"),article=d.querySelector(".article"),h2s=Array.from(article?.querySelectorAll(":scope > h2")||[]);
 S.resources.detail={sha:g.sha,html:h,path:x.href,file:a?.getAttribute("href")||"",fileSha:""};
 $("rsTitle").value=text(d,".page-hero h1");$("rsSummary").value=text(d,".page-hero h1 + p");
 $("rsUsageHeading").value=h2s[0]?.textContent.trim()||"이 자료는 이렇게 씁니다";
 const ul=d.querySelector(".article > ul");$("rsUsage").value=ul?Array.from(ul.querySelectorAll("li")).map(n=>n.textContent.trim()).join("\n"):"";
 $("rsTipHeading").value=text(d,".practice-box strong")||"사용 팁";$("rsTip").value=text(d,".practice-box p");
 $("rsExampleHeading").value=h2s[1]?.textContent.trim()||"예를 들어 이렇게 확인합니다";
 $("rsExampleLabel").value=text(d,".example-box strong")||"현장 예시";$("rsExample").value=text(d,".example-box p");
 $("rsStepsHeading").value=h2s[2]?.textContent.trim()||"실제로 사용하는 순서";
 $("rsSteps").value=Array.from(d.querySelectorAll(".resource-steps li")).map(n=>n.textContent.trim()).join("\n");
 $("rsFinishTitle").value=text(d,".finish-box strong");$("rsFinishBody").value=text(d,".finish-box p");
 updateResourceFileBox();$("saveResourceDetail").disabled=false;previewResource()
 }catch(e){stat("resourcesStatus","자료 상세를 불러오지 못했습니다: "+e.message,"err")}}
function updateResourceFileBox(){const p=S.resources.detail.file||"";$("rsFileName").textContent=p||"연결 파일 없음";$("rsDownloadFile").disabled=!p;$("rsDeleteFile").disabled=!p}
$("rsDownloadFile").onclick=()=>{const p=S.resources.detail.file;if(p)window.open(`https://${CFG.owner}.github.io/${p}`,"_blank")};
$("rsReplaceFile").onchange=async()=>{const f=$("rsReplaceFile").files[0];if(!f)return;try{const old=S.resources.detail.file;let oldSha="";if(old){try{oldSha=(await get(old)).sha}catch(e){}}const target=old?old:`downloads/${f.name}`;const bytes=new Uint8Array(await f.arrayBuffer());await putBytes(target,bytes,oldSha,`Replace resource file ${target}`);S.resources.detail.file=target;updateResourceFileBox();stat("resourcesStatus","✓ 파일을 업로드/교체했습니다. 자료 상세 저장을 누르면 링크도 확정됩니다.","ok")}catch(e){stat("resourcesStatus","파일 교체 실패: "+e.message,"err")}};
$("rsDeleteFile").onclick=async()=>{const p=S.resources.detail.file;if(!p||!confirm("현재 연결 파일을 삭제할까요?"))return;try{const g=await get(p);await del(p,g.sha,`Delete resource file ${p}`);S.resources.detail.file="";updateResourceFileBox();stat("resourcesStatus","✓ 파일을 삭제했습니다. 자료 상세 저장을 누르면 페이지 링크도 제거됩니다.","ok")}catch(e){stat("resourcesStatus","파일 삭제 실패: "+e.message,"err")}};
function previewResource(){$("resourcePreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">PRACTICAL RESOURCE</div><h1>${esc($("rsTitle").value)}</h1><p>${esc($("rsSummary").value)}</p></div><div class="pv-section article-preview">
<h3>${esc($("rsUsageHeading").value)}</h3><ul>${lines($("rsUsage").value).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
<div class="detail-pv-box detail-pv-practice"><strong>${esc($("rsTipHeading").value)}</strong><p>${esc($("rsTip").value)}</p></div>
<h3>${esc($("rsExampleHeading").value)}</h3><div class="detail-pv-box"><strong>${esc($("rsExampleLabel").value)}</strong><p>${esc($("rsExample").value)}</p></div>
<h3>${esc($("rsStepsHeading").value)}</h3><ol>${lines($("rsSteps").value).map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
<div class="detail-pv-box detail-pv-finish"><strong>${esc($("rsFinishTitle").value)}</strong><p>${esc($("rsFinishBody").value)}</p></div>
</div>`}
bind(["rsLandingTitle","rsLandingSummary"],previewResourceLanding);
bind(["rsTitle","rsSummary","rsUsageHeading","rsUsage","rsTipHeading","rsTip","rsExampleHeading","rsExampleLabel","rsExample","rsStepsHeading","rsSteps","rsFinishTitle","rsFinishBody"],previewResource);
$("saveResourceLanding").onclick=async()=>{try{
 const d=doc(S.resources.html);setText(d,".page-hero h1",$("rsLandingTitle").value);setText(d,".page-hero h1 + p",$("rsLandingSummary").value);
 let td=d.querySelector("#resource-topics-data");if(!td){td=d.createElement("script");td.id="resource-topics-data";td.type="application/json";d.head.appendChild(td)}td.textContent=JSON.stringify(S.resources.topics||[]);
 const old=Array.from(d.querySelectorAll(".resource-card")),p=old[0]?.parentElement,t=old[0]?.cloneNode(true);
 if(p&&t){old.forEach(x=>x.remove());S.resources.cards.forEach(x=>{const n=t.cloneNode(true);n.href=x.href;n.dataset.topic=x.topic||"";n.dataset.topicLabel=(S.resources.topics.find(t=>t.id===x.topic)||{}).label||"";setText(n,"h3",x.title);setText(n,"p",x.summary);p.appendChild(n)})}
 const h=out(d),r=await put("resources.html",h,S.resources.sha,"Update resources landing and topic folders");S.resources.sha=r.content.sha;S.resources.html=h;renderResourceTopics();renderResourceFolderBar();stat("resourcesStatus","✓ 실무자료 폴더와 자료 목록을 저장했습니다.","ok")
 }catch(e){stat("resourcesStatus","저장 실패: "+e.message,"err")}};
$("saveResourceDetail").onclick=async()=>{try{
 const st=S.resources.detail,d=doc(st.html),article=d.querySelector(".article"),h2s=Array.from(article?.querySelectorAll(":scope > h2")||[]);
 setText(d,".page-hero h1",$("rsTitle").value);setText(d,".page-hero h1 + p",$("rsSummary").value);
 if(h2s[0])h2s[0].textContent=$("rsUsageHeading").value;
 const ul=d.querySelector(".article > ul");if(ul)ul.innerHTML=lines($("rsUsage").value).map(x=>`<li>${esc(x)}</li>`).join("");
 setText(d,".practice-box strong",$("rsTipHeading").value);setText(d,".practice-box p",$("rsTip").value);
 if(h2s[1])h2s[1].textContent=$("rsExampleHeading").value;
 setText(d,".example-box strong",$("rsExampleLabel").value);setText(d,".example-box p",$("rsExample").value);
 if(h2s[2])h2s[2].textContent=$("rsStepsHeading").value;
 const ol=d.querySelector(".resource-steps");if(ol)ol.innerHTML=lines($("rsSteps").value).map(x=>`<li>${esc(x)}</li>`).join("");
 setText(d,".finish-box strong",$("rsFinishTitle").value);setText(d,".finish-box p",$("rsFinishBody").value);
 let a=d.querySelector(".article a[download]");if(st.file){if(!a){a=d.createElement("a");a.className="btn primary";a.setAttribute("download","");a.textContent="샘플 파일 내려받기";d.querySelector(".article")?.appendChild(a)}a.href=st.file}else if(a){a.parentElement?.remove()}
 const h=out(d),r=await put(st.path,h,st.sha,`Update resource ${st.path}`);st.sha=r.content.sha;st.html=h;stat("resourcesStatus","✓ 자료 상세내용과 파일 연결을 저장했습니다.","ok")
 }catch(e){stat("resourcesStatus","저장 실패: "+e.message,"err")}};

/* ABOUT */
async function loadAbout(){
 const g=await get("about.html"),h=d64(g.content),d=doc(h);S.about.sha=g.sha;S.about.html=h;
 $("abTitle").value=text(d,".page-hero h1");$("abSummary").value=text(d,".page-hero h1 + p");
 const ps=d.querySelector(".people-section");$("abPeopleTitle").value=text(ps,".section-head h2")||"BIZZIP을 만드는 사람";$("abPeopleSummary").value=text(ps,".section-head p");
 S.about.people=Array.from(d.querySelectorAll(".person-card")).map(x=>({
   image:x.querySelector(".person-photo img")?.getAttribute("src")||"",
   tag:text(x,".tag"),name:text(x,"h3"),role:text(x,".person-role"),body:text(x,".person-body > p"),
   career:Array.from(x.querySelectorAll(".list > div")).map(v=>v.textContent.trim()).join("\n"),
   linkLabel:text(x,".person-link a"),link:x.querySelector(".person-link a")?.getAttribute("href")||""
 }));
 if(!S.about.people.length)S.about.people=[{image:"bizzip-operator.png",tag:"FOUNDER",name:"",role:"",body:"",career:"",linkLabel:"",link:""}];
 const secs=Array.from(d.querySelectorAll(".about-section"));
 $("abConsultingTitle").value=text(secs[0],".section-head h2");$("abConsultingSummary").value=text(secs[0],".section-head p");
 $("abBrandTitle").value=text(secs[1],".section-head h2");$("abBrandSummary").value=text(secs[1],".section-head p");
 $("abBookTitle").value=text(secs[2],".section-head h2");$("abBookSummary").value=text(secs[2],".section-head p");
 S.about.consulting=readProjects(secs[0]);S.about.brands=readProjects(secs[1]);S.about.books=Array.from(secs[2]?.querySelectorAll(".book-card")||[]).map(a=>({year:text(a,".year"),title:text(a,"h3"),desc:text(a,"p"),href:a.getAttribute("href")||"",image:a.querySelector("img")?.getAttribute("src")||""}));
 renderAbout();previewAbout();$("saveAbout").disabled=false
}
function readProjects(sec){return Array.from(sec?.querySelectorAll(".project-card")||[]).map(x=>{const st=text(x,"p strong"),all=text(x,"p");return{year:text(x,".year"),name:text(x,"h3"),topic:st,desc:all.replace(st,"").trim()}})}
function renderAbout(){
 renderRep("peopleRows",S.about.people,[["image","프로필 이미지 경로/URL"],["tag","표시 라벨"],["name","이름"],["role","역할/직함"],["body","소개"],["career","주요 경력 (줄바꿈 구분)"],["linkLabel","링크 문구"],["link","LinkedIn/홈페이지 링크"]],previewAbout);
 renderRep("consultingRows",S.about.consulting,[["year","기간"],["name","기업명"],["topic","주제"],["desc","설명"]],previewAbout);renderRep("brandRows",S.about.brands,[["year","연도"],["name","브랜드"],["topic","주제"],["desc","설명"]],previewAbout);renderRep("bookRows",S.about.books,[["year","연도"],["title","도서명"],["desc","설명"],["href","링크"],["image","표지 이미지 URL"]],previewAbout)
}
$("addPerson").onclick=()=>{S.about.people.push({image:"",tag:"TEAM",name:"새 사람",role:"",body:"",career:"",linkLabel:"",link:""});renderAbout();previewAbout()};
$("addConsulting").onclick=()=>{S.about.consulting.push({year:"",name:"",topic:"",desc:""});renderAbout()};$("addBrandProject").onclick=()=>{S.about.brands.push({year:"",name:"",topic:"",desc:""});renderAbout()};$("addBook").onclick=()=>{S.about.books.push({year:"",title:"",desc:"",href:"",image:""});renderAbout()};
function previewAbout(){$("aboutPreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">ABOUT BIZZIP</div><h1>${esc($("abTitle").value)}</h1><p>${esc($("abSummary").value)}</p></div><div class="pv-section"><h2>${esc($("abPeopleTitle").value)}</h2><p>${esc($("abPeopleSummary").value)}</p><div class="pv-grid">${S.about.people.map(x=>`<div class="pv-item"><strong>${esc(x.name)}</strong><small>${esc(x.role)}</small><small>${esc(x.body)}</small></div>`).join("")}</div></div><div class="pv-section"><h2>${esc($("abConsultingTitle").value)}</h2><div class="pv-grid">${S.about.consulting.map(x=>`<div class="pv-item"><strong>${esc(x.name)}</strong><small>${esc(x.topic)}</small></div>`).join("")}</div></div><div class="pv-section"><h2>${esc($("abBrandTitle").value)}</h2><div class="pv-grid">${S.about.brands.map(x=>`<div class="pv-item"><strong>${esc(x.name)}</strong><small>${esc(x.topic)}</small></div>`).join("")}</div></div><div class="pv-section"><h2>${esc($("abBookTitle").value)}</h2><div class="pv-grid">${S.about.books.map(x=>`<div class="pv-item"><strong>${esc(x.title)}</strong><small>${esc(x.desc)}</small></div>`).join("")}</div></div>`}
bind(["abTitle","abSummary","abPeopleTitle","abPeopleSummary","abConsultingTitle","abConsultingSummary","abBrandTitle","abBrandSummary","abBookTitle","abBookSummary"],previewAbout);
$("saveAbout").onclick=async()=>{try{
 const d=doc(S.about.html);setText(d,".page-hero h1",$("abTitle").value);setText(d,".page-hero h1 + p",$("abSummary").value);
 let ps=d.querySelector(".people-section");if(!ps){ps=d.createElement("section");ps.className="people-section";ps.innerHTML=`<div class="wrap"><div class="section-head"><h2></h2><p></p></div><div class="people-grid"></div></div>`;d.querySelector("main")?.insertBefore(ps,d.querySelector("main")?.children[1]||null)}
 setText(ps,".section-head h2",$("abPeopleTitle").value);setText(ps,".section-head p",$("abPeopleSummary").value);const pg=ps.querySelector(".people-grid");if(pg)pg.innerHTML=S.about.people.map(x=>`<article class="person-card"><div class="person-photo">${x.image?`<img src="${esc(x.image)}" alt="${esc(x.name)}">`:""}</div><div class="person-body"><div class="tag">${esc(x.tag)}</div><h3>${esc(x.name)}</h3><div class="person-role">${esc(x.role)}</div><p>${esc(x.body)}</p><div class="list">${lines(x.career).map(c=>`<div>${esc(c)}</div>`).join("")}</div><div class="person-link">${x.link?`<a href="${esc(x.link)}" target="_blank" rel="noopener">${esc(x.linkLabel||"자세히 보기")} →</a>`:""}</div></div></article>`).join("");
 const secs=Array.from(d.querySelectorAll(".about-section"));setText(secs[0],".section-head h2",$("abConsultingTitle").value);setText(secs[0],".section-head p",$("abConsultingSummary").value);setText(secs[1],".section-head h2",$("abBrandTitle").value);setText(secs[1],".section-head p",$("abBrandSummary").value);setText(secs[2],".section-head h2",$("abBookTitle").value);setText(secs[2],".section-head p",$("abBookSummary").value);syncProjects(secs[0],S.about.consulting);syncProjects(secs[1],S.about.brands);const bg=secs[2]?.querySelector(".book-grid");if(bg)bg.innerHTML=S.about.books.map(x=>`<a class="book-card book-link book-with-cover" href="${esc(x.href)}" target="_blank" rel="noopener">${x.image?`<img class="book-cover" src="${esc(x.image)}" alt="${esc(x.title)} 표지">`:""}<div class="book-body"><span class="year">${esc(x.year)}</span><h3>${esc(x.title)}</h3><p>${esc(x.desc)}</p><span class="book-more">네이버 도서에서 보기 →</span></div></a>`).join("");const h=out(d),r=await put("about.html",h,S.about.sha,"Update about");S.about.sha=r.content.sha;S.about.html=h;stat("aboutStatus","✓ BIZZIP 소개 전체 내용을 저장했습니다.","ok")
 }catch(e){stat("aboutStatus","저장 실패: "+e.message,"err")}};

/* CONTACT */
async function loadContact(){const g=await get("contact.html"),h=d64(g.content),d=doc(h);S.contact.sha=g.sha;S.contact.html=h;$("coTitle").value=text(d,".page-hero h1");$("coSummary").value=text(d,".page-hero h1 + p");$("coMainTitle").value=text(d,".contact-main h2").replace(/\s+/g," ");$("coMainBody").value=text(d,".contact-main p");$("coEmail").value=(d.querySelector(".contact-mail")?.getAttribute("href")||"").replace("mailto:","");const info=d.querySelector(".bizzip-contact-info");$("coManager").value=text(info,"[data-manager]")||"BIZZIP 운영담당";$("coKakao").value=text(info,"[data-kakao]");$("coKakaoUrl").value=info?.querySelector("[data-kakao] a")?.getAttribute("href")||"";$("coPrivacy").value=text(info,".privacy-note")||"문의 시 회신에 필요한 최소한의 정보만 보내주세요. 주민등록번호, 계좌번호, 건강정보 등 불필요한 민감정보는 보내지 마세요. 문의 내용과 연락처는 문의 확인 및 회신 목적으로만 사용합니다.";$("coGuideTitle").value=text(d,".contact-guide h3");$("coGuideItems").value=Array.from(d.querySelectorAll(".contact-guide ol li")).map(x=>x.textContent.trim()).join("\n");S.contact.types=Array.from(d.querySelectorAll(".contact-option")).map(x=>({label:text(x,".label"),title:text(x,"h3"),body:text(x,"p")}));renderContactTypes();previewContact();$("saveContact").disabled=false}
function renderContactTypes(){renderRep("contactTypeRows",S.contact.types,[["label","라벨"],["title","유형 제목"],["body","설명"]],previewContact)}
$("addContactType").onclick=()=>{S.contact.types.push({label:"INQUIRY",title:"새 문의 유형",body:""});renderContactTypes()};
function previewContact(){$("contactPreview").innerHTML=`<div class="pv-hero"><div class="pv-eyebrow">CONTACT</div><h1>${esc($("coTitle").value)}</h1><p>${esc($("coSummary").value)}</p></div><div class="pv-section"><h2>${esc($("coMainTitle").value)}</h2><p>${esc($("coMainBody").value)}</p><div class="pv-item"><strong>${esc($("coManager").value)}</strong><small>${esc($("coEmail").value)}${$("coKakao").value?" / "+esc($("coKakao").value):""}</small></div></div><div class="pv-section"><div class="pv-grid">${S.contact.types.map(x=>`<div class="pv-item"><strong>${esc(x.title)}</strong><small>${esc(x.body)}</small></div>`).join("")}</div><h2 style="margin-top:12px">${esc($("coGuideTitle").value)}</h2><ol>${lines($("coGuideItems").value).map(x=>`<li>${esc(x)}</li>`).join("")}</ol><p class="hint">${esc($("coPrivacy").value)}</p></div>`}
bind(["coTitle","coSummary","coMainTitle","coMainBody","coManager","coEmail","coKakao","coKakaoUrl","coGuideTitle","coGuideItems","coPrivacy"],previewContact);
$("saveContact").onclick=async()=>{try{const d=doc(S.contact.html);setText(d,".page-hero h1",$("coTitle").value);setText(d,".page-hero h1 + p",$("coSummary").value);const h2=d.querySelector(".contact-main h2");if(h2)h2.textContent=$("coMainTitle").value;setText(d,".contact-main p",$("coMainBody").value);const mail=d.querySelector(".contact-mail");if(mail){mail.href=`mailto:${$("coEmail").value}`;mail.textContent=$("coEmail").value+" →"}const side=d.querySelector(".contact-side");if(side)side.innerHTML=S.contact.types.map(x=>`<div class="contact-option"><div class="label">${esc(x.label)}</div><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></div>`).join("");setText(d,".contact-guide h3",$("coGuideTitle").value);const ol=d.querySelector(".contact-guide ol");if(ol)ol.innerHTML=lines($("coGuideItems").value).map(x=>`<li>${esc(x)}</li>`).join("");let info=d.querySelector(".bizzip-contact-info");if(!info){info=d.createElement("div");info.className="bizzip-contact-info contact-guide";d.querySelector(".contact-guide")?.before(info)}info.innerHTML=`<h3>문의 연락처</h3><p data-manager><strong>담당자</strong> ${esc($("coManager").value)}</p><p><strong>이메일</strong> <a href="mailto:${esc($("coEmail").value)}">${esc($("coEmail").value)}</a></p>${$("coKakao").value?`<p data-kakao><strong>카카오톡</strong> ${$("coKakaoUrl").value?`<a href="${esc($("coKakaoUrl").value)}">${esc($("coKakao").value)}</a>`:esc($("coKakao").value)}</p>`:""}<p class="privacy-note">${esc($("coPrivacy").value)}</p>`;const h=out(d),r=await put("contact.html",h,S.contact.sha,"Update contact");S.contact.sha=r.content.sha;S.contact.html=h;stat("contactStatus","✓ 문의 페이지 전체 내용을 저장했습니다.","ok")}catch(e){stat("contactStatus","저장 실패: "+e.message,"err")}};

/* repeat helpers */
function renderRep(id,arr,fields,preview){$(id).innerHTML=arr.map((x,i)=>`<div class="repeat-row" data-i="${i}"><div class="repeat-head"><strong>${i+1}번</strong><div class="actions"><button class="btn light mini rr-up">↑</button><button class="btn light mini rr-down">↓</button><button class="btn danger mini rr-del">삭제</button></div></div>${fields.map(([k,l])=>`<label class="label">${l}</label>${["desc","body","career"].includes(k)?`<textarea class="textarea rr-field" data-k="${k}" style="min-height:55px">${esc(x[k]||"")}</textarea>`:`<input class="input rr-field" data-k="${k}" value="${esc(x[k]||"")}">`}`).join("")}</div>`).join("");$(id).querySelectorAll(".repeat-row").forEach(r=>{const i=+r.dataset.i;r.querySelectorAll(".rr-field").forEach(e=>e.oninput=()=>{arr[i][e.dataset.k]=e.value;preview&&preview()});r.querySelector(".rr-up").onclick=()=>move(arr,i,-1,()=>renderRep(id,arr,fields,preview),preview);r.querySelector(".rr-down").onclick=()=>move(arr,i,1,()=>renderRep(id,arr,fields,preview),preview);r.querySelector(".rr-del").onclick=()=>{arr.splice(i,1);renderRep(id,arr,fields,preview);preview&&preview()}})}
function syncProjects(sec,arr){const g=sec?.querySelector(".project-grid");if(g)g.innerHTML=arr.map(x=>`<article class="project-card"><span class="year">${esc(x.year)}</span><h3>${esc(x.name)}</h3><p><strong>${esc(x.topic)}</strong><br>${esc(x.desc)}</p></article>`).join("")}
