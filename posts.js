
(function () {
  const CATEGORY_NAMES = {
    "startup":"창업 준비","product":"상품과 서비스","brand":"브랜드","marketing":"마케팅",
    "sales":"판매와 유통","operation":"회사 운영","logistics":"물류와 재고","data-ai":"데이터와 AI"
  };

  async function getPosts() {
    const res = await fetch("posts.json?v=" + Date.now());
    if (!res.ok) throw new Error("posts.json을 불러오지 못했습니다.");
    return await res.json();
  }

  function postCard(post) {
    const sub = post.subcategoryLabel ? `<span class="post-subtopic">${post.subcategoryLabel}</span>` : "";
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
      posts.sort((a,b) => String(b.date).localeCompare(String(a.date)));

      targets.forEach(target => {
        const category = target.dataset.category || "";
        const subcategory = target.dataset.subcategory || "";
        const limit = parseInt(target.dataset.limit || "0", 10);
        let list = posts;
        if (category) list = list.filter(p => p.category === category);
        if (subcategory) list = list.filter(p => p.subcategory === subcategory);
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
    let html = `<section class="post-section"><h2>${section.heading || ""}</h2>`;
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
      const post = posts.find(p => p.id === id);
      if (!post) {
        mount.innerHTML = `<div class="article"><h2>글을 찾을 수 없습니다.</h2><p>콘텐츠 목록에서 다시 선택해주세요.</p></div>`;
        return;
      }

      document.title = `${post.title} | BIZZIP`;

      const crumb = document.getElementById("post-breadcrumb");
      if (crumb) {
        let c = `<a href="index.html">홈</a> / <a href="business.html">사업실무</a>`;
        if (post.category && post.categoryLabel) c += ` / <a href="${post.category}.html">${post.categoryLabel}</a>`;
        if (post.subcategoryLabel && post.subcategoryPage) c += ` / <a href="${post.subcategoryPage}">${post.subcategoryLabel}</a>`;
        c += ` / 콘텐츠`;
        crumb.innerHTML = c;
      }

      const category = document.getElementById("post-category");
      if (category) category.textContent =
        post.subcategoryLabel ? `${post.categoryLabel} / ${post.subcategoryLabel}` : (post.categoryLabel || "");

      document.getElementById("post-title").textContent = post.title;
      document.getElementById("post-summary").textContent = post.summary || "";
      document.getElementById("post-date").textContent = post.date || "";

      mount.innerHTML = `
        <article class="article">
          ${(post.sections || []).map(sectionHtml).join("")}
          <div class="small-cta">
            <strong>이 글은 사업실무의 세부 주제와 연결되어 있습니다.</strong>
            <span>${post.subcategoryLabel ? `${post.categoryLabel} → ${post.subcategoryLabel}` : post.categoryLabel || ""}</span>
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
    preserveProblemEntryPath();
    renderLists();
    renderPost();
  });
})();
