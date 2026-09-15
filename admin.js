const CONFIG = {
  owner: "bizzip1k",
  repo: "bizzip1k.github.io",
  branch: "main",
  path: "posts.json"
};

const CATEGORY_LABELS = {
  "startup": "창업 준비",
  "product": "상품과 서비스",
  "brand": "브랜드",
  "marketing": "마케팅",
  "sales": "판매와 유통",
  "operation": "회사 운영",
  "logistics": "물류와 재고",
  "data-ai": "데이터와 AI"
};

let token = "";
let posts = [];
let fileSha = "";

const $ = id => document.getElementById(id);
const els = {
  token: $("token"),
  connectBtn: $("connectBtn"),
  status: $("status"),
  postList: $("postList"),
  postId: $("postId"),
  title: $("title"),
  date: $("date"),
  category: $("category"),
  summary: $("summary"),
  body: $("body"),
  newBtn: $("newBtn"),
  saveBtn: $("saveBtn"),
  editNote: $("editNote")
};

function setStatus(message, type="info") {
  els.status.textContent = message;
  els.status.className = `status show ${type}`;
}

function todayLocal() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function decodeBase64Utf8(base64) {
  const binary = atob(base64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64Utf8(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function apiUrl() {
  return `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.path}?ref=${CONFIG.branch}`;
}

async function githubRequest(url, options={}) {
  const headers = {
    "Accept": "application/vnd.github+json",
    "Authorization": `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    ...(options.headers || {})
  };
  const res = await fetch(url, {...options, headers});
  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data.message || "";
    } catch {}
    throw new Error(`${res.status} ${detail}`.trim());
  }
  return res.json();
}

async function loadPosts() {
  setStatus("GitHub에서 글 목록을 불러오는 중입니다…", "info");
  const data = await githubRequest(apiUrl());
  fileSha = data.sha;
  posts = JSON.parse(decodeBase64Utf8(data.content));
  posts.sort((a,b) => String(b.date).localeCompare(String(a.date)));
  renderPostList();
  els.saveBtn.disabled = false;
  setStatus(`연결되었습니다. 현재 ${posts.length}개의 글이 있습니다.`, "ok");
}

function renderPostList() {
  if (!posts.length) {
    els.postList.innerHTML = '<div class="helper">등록된 글이 없습니다.</div>';
    return;
  }
  els.postList.innerHTML = posts.map((p, index) => `
    <div class="post-item">
      <strong>${escapeHtml(p.title || "")}</strong>
      <div class="post-meta">${escapeHtml(p.date || "")} · ${escapeHtml(p.categoryLabel || CATEGORY_LABELS[p.category] || "")}</div>
      <div class="post-actions">
        <button class="admin-btn light" onclick="editPost(${index})">수정</button>
        <button class="admin-btn danger" onclick="deletePost(${index})">삭제</button>
      </div>
    </div>
  `).join("");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;");
}

function sectionsToText(sections=[]) {
  const out = [];
  sections.forEach(sec => {
    if (sec.heading) out.push(`## ${sec.heading}`);
    (sec.paragraphs || []).forEach(p => {
      out.push(p);
      out.push("");
    });
    (sec.bullets || []).forEach(b => out.push(`- ${b}`));
    out.push("");
  });
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function textToSections(text) {
  const lines = text.split(/\r?\n/);
  const sections = [];
  let current = {heading:"본문", paragraphs:[], bullets:[]};
  let paragraphBuffer = [];

  const flushParagraph = () => {
    const p = paragraphBuffer.join(" ").trim();
    if (p) current.paragraphs.push(p);
    paragraphBuffer = [];
  };
  const pushCurrent = () => {
    flushParagraph();
    if (current.heading || current.paragraphs.length || current.bullets.length) {
      sections.push(current);
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      if (current.paragraphs.length || current.bullets.length || current.heading !== "본문") {
        pushCurrent();
      }
      current = {heading:line.slice(3).trim(), paragraphs:[], bullets:[]};
    } else if (line.startsWith("- ")) {
      flushParagraph();
      current.bullets.push(line.slice(2).trim());
    } else if (!line) {
      flushParagraph();
    } else {
      paragraphBuffer.push(line);
    }
  }
  pushCurrent();
  return sections.filter(s => s.paragraphs.length || s.bullets.length || (s.heading && s.heading !== "본문"));
}

function makeId() {
  const d = new Date();
  const pad = n => String(n).padStart(2,"0");
  return `bizzip-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function clearForm() {
  els.postId.value = "";
  els.title.value = "";
  els.date.value = todayLocal();
  els.category.value = "startup";
  els.summary.value = "";
  els.body.value = "";
  els.editNote.textContent = "새 글 작성";
  els.title.focus();
}

window.editPost = function(index) {
  const p = posts[index];
  els.postId.value = p.id || "";
  els.title.value = p.title || "";
  els.date.value = p.date || todayLocal();
  els.category.value = p.category || "startup";
  els.summary.value = p.summary || "";
  els.body.value = sectionsToText(p.sections || []);
  els.editNote.textContent = "기존 글 수정 중";
  window.scrollTo({top:0, behavior:"smooth"});
};

window.deletePost = async function(index) {
  const p = posts[index];
  if (!confirm(`"${p.title}" 글을 삭제할까요?\n삭제하면 GitHub에도 바로 반영됩니다.`)) return;
  posts.splice(index, 1);
  try {
    await savePostsToGithub(`Delete post: ${p.title}`);
    renderPostList();
    clearForm();
    setStatus("글을 삭제했습니다. 사이트 반영에는 잠시 시간이 걸릴 수 있습니다.", "ok");
  } catch (e) {
    setStatus("삭제하지 못했습니다: " + e.message, "err");
  }
};

async function savePostsToGithub(message) {
  const payload = {
    message,
    content: encodeBase64Utf8(JSON.stringify(posts, null, 2)),
    sha: fileSha,
    branch: CONFIG.branch
  };
  const data = await githubRequest(
    `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.path}`,
    {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    }
  );
  fileSha = data.content.sha;
}

async function saveCurrentPost() {
  const title = els.title.value.trim();
  const date = els.date.value;
  const category = els.category.value;
  const summary = els.summary.value.trim();
  const bodyText = els.body.value.trim();

  if (!title) return setStatus("제목을 입력해주세요.", "err");
  if (!date) return setStatus("발행일을 선택해주세요.", "err");
  if (!summary) return setStatus("요약을 입력해주세요.", "err");
  if (!bodyText) return setStatus("본문을 입력해주세요.", "err");

  const id = els.postId.value || makeId();
  const post = {
    id,
    title,
    date,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    summary,
    sections: textToSections(bodyText)
  };

  const existingIndex = posts.findIndex(p => p.id === id);
  if (existingIndex >= 0) {
    posts[existingIndex] = post;
  } else {
    posts.push(post);
  }
  posts.sort((a,b) => String(b.date).localeCompare(String(a.date)));

  els.saveBtn.disabled = true;
  setStatus("GitHub에 저장하는 중입니다…", "info");
  try {
    await savePostsToGithub(existingIndex >= 0 ? `Update post: ${title}` : `Add post: ${title}`);
    renderPostList();
    clearForm();
    setStatus("저장했습니다. GitHub Pages 반영에는 보통 1~2분 정도 걸립니다.", "ok");
  } catch (e) {
    setStatus("저장하지 못했습니다: " + e.message, "err");
  } finally {
    els.saveBtn.disabled = false;
  }
}

els.connectBtn.addEventListener("click", async () => {
  token = els.token.value.trim();
  if (!token) return setStatus("GitHub token을 입력해주세요.", "err");
  try {
    await loadPosts();
  } catch (e) {
    setStatus("연결하지 못했습니다: " + e.message, "err");
  }
});

els.newBtn.addEventListener("click", clearForm);
els.saveBtn.addEventListener("click", saveCurrentPost);

clearForm();
