
(function () {
  const CATEGORY_NAMES = {
    "startup":"창업 준비","product":"상품과 서비스","brand":"브랜드","marketing":"마케팅",
    "sales":"판매와 유통","operation":"회사 운영","logistics":"물류와 재고","data-ai":"데이터와 AI"
  };


  const CATEGORY_ORDER = ["startup","product","brand","marketing","sales","operation","logistics","data-ai"];

  function postSortTime(p) {
    if (p && p.publishedAt) {
      const t = Date.parse(p.publishedAt);
      if (!Number.isNaN(t)) return t;
    }
    if (p && p.date) {
      const t = Date.parse(String(p.date) + "T00:00:00");
      if (!Number.isNaN(t)) return t;
    }
    return 0;
  }

  function sortPostsNewestFirst(a, b) {
    return postSortTime(b) - postSortTime(a);
  }


  function escHtml(v) {
    return String(v ?? "").replace(/[&<>"']/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]));
  }

  function contentTopicCard(key, label, count, desc) {
    const url = `contents.html?topic=${encodeURIComponent(key)}`;
    return `<a class="topic-folder-card" href="${url}">
      <div class="topic-folder-icon">📁</div>
      <div class="topic-folder-copy"><strong>${escHtml(label)}</strong><p>${escHtml(desc || "")}</p></div>
      <span class="topic-folder-count">${count}</span>
    </a>`;
  }

  function renderContentTopicHub(posts) {
    const hub = document.querySelector("[data-content-topic-hub]");
    if (!hub) return;
    const counts = {};
    CATEGORY_ORDER.forEach(k => counts[k] = 0);
    let unclassified = 0;
    posts.forEach(p => p.category && counts[p.category] !== undefined ? counts[p.category]++ : unclassified++);
    const desc = {
      "startup":"사업을 시작하기 전에 확인할 실무",
      "product":"상품과 서비스를 기획하고 출시하는 실무",
      "brand":"이름, 포지셔닝, 메시지와 브랜드 관리",
      "marketing":"검색, 광고, 콘텐츠와 전환 관리",
      "sales":"판매채널, 입점과 유통 실무",
      "operation":"계약, 비용, 외주와 회사 운영",
      "logistics":"3PL, 재고, 포장과 반품 관리",
      "data-ai":"데이터 분석, AI 활용과 업무 자동화"
    };
    hub.innerHTML =
      CATEGORY_ORDER.map(k => contentTopicCard(k, CATEGORY_NAMES[k], counts[k] || 0, desc[k])).join("") +
      contentTopicCard("unclassified","미분류",unclassified,"새로 등록되어 아직 주제를 지정하지 않은 콘텐츠");
  }

  function configureContentsLanding(posts) {
    const target = document.querySelector('[data-post-list][data-topic-mode="contents"]');
    if (!target) return;
    renderContentTopicHub(posts);
    const params = new URLSearchParams(location.search);
    const topic = params.get("topic") || "";
    const title = document.getElementById("contentListTitle");
    const summary = document.getElementById("contentListSummary");
    if (topic === "unclassified") {
      target.dataset.unclassified = "1";
      target.dataset.limit = "0";
      if (title) title.textContent = "미분류 콘텐츠";
      if (summary) summary.textContent = "아직 주제가 지정되지 않은 콘텐츠입니다.";
    } else if (topic && CATEGORY_NAMES[topic]) {
      target.dataset.category = topic;
      target.dataset.limit = "0";
      if (title) title.textContent = CATEGORY_NAMES[topic] + " 콘텐츠";
      if (summary) summary.textContent = "선택한 주제에 등록된 콘텐츠입니다.";
    } else if (topic === "all") {
      target.dataset.limit = "0";
      if (title) title.textContent = "전체 콘텐츠";
      if (summary) summary.textContent = "등록된 모든 콘텐츠를 최신순으로 보여드립니다.";
    }
  }

  function getResourceTopics() {
    const el = document.getElementById("resource-topics-data");
    if (!el) return [];
    try { return JSON.parse(el.textContent || "[]"); } catch(e) { return []; }
  }

  function configureResourcesLanding() {
    const hub = document.querySelector("[data-resource-topic-hub]");
    const grid = document.querySelector("[data-resource-list]");
    if (!hub || !grid) return;
    const topics = getResourceTopics();
    const cards = Array.from(grid.querySelectorAll(".resource-card"));
    const counts = {};
    topics.forEach(t => counts[t.id] = 0);
    cards.forEach(c => { const t = c.dataset.topic || ""; counts[t] = (counts[t] || 0) + 1; });
    hub.innerHTML = topics.map(t => `<a class="topic-folder-card" href="resources.html?topic=${encodeURIComponent(t.id)}">
      <div class="topic-folder-icon">📁</div>
      <div class="topic-folder-copy"><strong>${escHtml(t.label)}</strong><p>${escHtml(t.desc || "")}</p></div>
      <span class="topic-folder-count">${counts[t.id] || 0}</span>
    </a>`).join("");

    const params = new URLSearchParams(location.search);
    const topic = params.get("topic") || "";
    const selected = topics.find(t => t.id === topic);
    const title = document.getElementById("resourceListTitle");
    const summary = document.getElementById("resourceListSummary");
    cards.forEach((c,i) => {
      const show = selected ? c.dataset.topic === selected.id : i < 6;
      c.hidden = !show;
    });
    if (selected) {
      if (title) title.textContent = selected.label + " 자료";
      if (summary) summary.textContent = selected.desc || "선택한 주제의 실무자료입니다.";
    }
  }

  function bindFolderSearches() {
    const cs = document.getElementById("contentSearch");
    if (cs) cs.addEventListener("input", () => {
      const q = cs.value.trim().toLowerCase();
      document.querySelectorAll('[data-post-list][data-topic-mode="contents"] .content-card').forEach(c => {
        c.hidden = !!q && !c.textContent.toLowerCase().includes(q);
      });
    });
    const rs = document.getElementById("resourceSearch");
    if (rs) rs.addEventListener("input", () => {
      const q = rs.value.trim().toLowerCase();
      document.querySelectorAll("[data-resource-list] .resource-card").forEach(c => {
        const topic = new URLSearchParams(location.search).get("topic") || "";
        const topicMatch = !topic || c.dataset.topic === topic;
        const searchMatch = !q || c.textContent.toLowerCase().includes(q);
        c.hidden = !(topicMatch && searchMatch);
      });
    });
  }


  function ensureHomeMenu() {
    const menu = document.querySelector("nav.menu");
    if (!menu || menu.querySelector('a[href="index.html"]')) return;
    const a = document.createElement("a");
    a.href = "index.html";
    a.textContent = "홈";
    a.className = "";
    menu.insertBefore(a, menu.firstChild);
  }

  async function getPosts() {
    const res = await fetch("posts.json?v=" + Date.now());
    if (!res.ok) throw new Error("posts.json을 불러오지 못했습니다.");
    return await res.json();
  }

  function postCard(post) {
    const sub = "";
    return `
      <a class="content-card auto-post-card" href="post.html?id=${encodeURIComponent(post.id)}">
        <div class="tag">${post.categoryLabel || CATEGORY_NAMES[post.category] || "BIZZIP"}</div>
        ${sub}
        <h3>${post.title}</h3>
        <p>${post.summary || ""}</p>
        <div class="post-date">${post.date || ""}</div>
      </a>`;
  }

  async function renderLists() {
    const targets = document.querySelectorAll("[data-post-list]");
    if (!targets.length) return;
    try {
      let posts = await getPosts();
      posts = posts.filter(p => !p.deleted);
      posts.sort(sortPostsNewestFirst);
      configureContentsLanding(posts);

      targets.forEach(target => {
        const category = target.dataset.category || "";
        const subcategory = target.dataset.subcategory || "";
        const unclassified = target.dataset.unclassified === "1";

        // 콘텐츠와 사업실무는 별도 체계로 운영합니다.
        // 사업실무 페이지에 남아 있는 기존 data-category / data-subcategory 목록은 표시하지 않습니다.
        if ((category || subcategory) && target.dataset.topicMode !== "contents") {
          const section = target.closest("section");
          if (section) section.hidden = true;
          return;
        }
        const limit = parseInt(target.dataset.limit || "0", 10);
        let list = posts;
        if (category) list = list.filter(p => p.category === category);
        if (subcategory) list = list.filter(p => p.subcategory === subcategory);
        if (unclassified) list = list.filter(p => !p.category);
        if (limit > 0) list = list.slice(0, limit);

        target.innerHTML = list.length
          ? list.map(postCard).join("")
          : `<div class="empty-posts">아직 이 주제에 등록된 콘텐츠가 없습니다.</div>`;
      });
    } catch (e) {
      console.error(e);
    }
  }

  function sectionHtml(section) {
    let html = `<section class="post-section">${section.heading ? `<h2>${section.heading}</h2>` : ""}`;
    (section.paragraphs || []).forEach(p => html += `<p>${p}</p>`);
    if (section.bullets && section.bullets.length) {
      html += "<ul>";
      section.bullets.forEach(item => html += `<li>${item}</li>`);
      html += "</ul>";
    }
    return html + "</section>";
  }

  async function renderPost() {
    const mount = document.getElementById("post-detail");
    if (!mount) return;
    try {
      const id = new URLSearchParams(location.search).get("id");
      const posts = await getPosts();
      const post = posts.find(p => p.id === id && !p.deleted);
      if (!post) {
        mount.innerHTML = `<div class="article"><h2>글을 찾을 수 없습니다.</h2><p>콘텐츠 목록에서 다시 선택해주세요.</p></div>`;
        return;
      }

      document.title = `${post.title} | BIZZIP`;

      const crumb = document.getElementById("post-breadcrumb");
      if (crumb) {
        let c = `<a href="index.html">홈</a> / <a href="contents.html">콘텐츠</a>`;
        if (post.category && post.categoryLabel) {
          c += ` / <a href="business.html">사업실무</a>`;
          c += ` / <a href="${post.category}.html">${post.categoryLabel}</a>`;
          if (post.subcategoryLabel && post.subcategoryPage) c += ` / <a href="${post.subcategoryPage}">${post.subcategoryLabel}</a>`;
        }
        crumb.innerHTML = c;
      }

      const category = document.getElementById("post-category");
      if (category) category.textContent =
        (post.categoryLabel || "");

      document.getElementById("post-title").textContent = post.title;
      document.getElementById("post-summary").textContent = post.summary || "";
      document.getElementById("post-date").textContent = post.date || "";

      mount.innerHTML = `
        <article class="article">
          ${(post.sections || []).map(sectionHtml).join("")}
          <div class="small-cta">
            <strong>${post.category ? "이 글은 사업실무의 세부 주제와 연결되어 있습니다." : "이 글은 최신 BIZZIP 콘텐츠로 등록되었습니다."}</strong>
            <span>${post.category ? (post.categoryLabel || "") : "관리자에서 콘텐츠 주제를 지정할 수 있습니다."}</span>
          </div>
        </article>`;
    } catch(e) {
      console.error(e);
    }
  }


  /* ===== Problem-entry breadcrumb context ===== */
  function preserveProblemEntryPath() {
    const problemPages = {
      "problem-start.html":"사업을 시작하려는데 무엇부터 해야 할지 모르겠다",
      "problem-sales.html":"제품은 있는데 어디서 팔아야 할지 모르겠다",
      "problem-ads.html":"광고비는 쓰는데 매출이 잘 나오지 않는다",
      "problem-price.html":"가격을 얼마로 정해야 할지 모르겠다",
      "problem-logistics.html":"재고와 물류비가 점점 부담스럽다",
      "problem-documents.html":"계약, 문서, 양식이 필요한데 어디서 구할지 모르겠다"
    };

    const currentFile = location.pathname.split("/").pop() || "index.html";

    if (problemPages[currentFile]) {
      document.querySelectorAll("a.problem-subcard").forEach(a => {
        try {
          const url = new URL(a.getAttribute("href"), location.href);
          url.searchParams.set("fromProblem", currentFile);
          url.searchParams.set("fromProblemTitle", problemPages[currentFile]);
          a.setAttribute("href", url.pathname.split("/").pop() + url.search);
        } catch(e) {}
      });
      return;
    }

    const params = new URLSearchParams(location.search);
    const fromProblem = params.get("fromProblem");
    const fromTitle = params.get("fromProblemTitle");
    if (!fromProblem || !fromTitle) return;

    const breadcrumb = document.querySelector(".breadcrumb");
    const pageTitle = document.querySelector(".page-hero h1")?.textContent.trim();
    if (!breadcrumb || !pageTitle) return;

    breadcrumb.innerHTML =
      `<a href="index.html">홈</a> / ` +
      `<a href="problems.html">문제별 해결</a> / ` +
      `<a href="${fromProblem}">${fromTitle}</a> / ` +
      `${pageTitle}`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureHomeMenu();
    preserveProblemEntryPath();
    configureResourcesLanding();
    bindFolderSearches();
    renderLists();
    renderPost();
  });
})();
