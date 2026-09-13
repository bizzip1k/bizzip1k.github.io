
(function () {
  const categoryNames = {
    "startup": "창업 준비",
    "product": "상품과 서비스",
    "brand": "브랜드",
    "marketing": "마케팅",
    "sales": "판매와 유통",
    "operation": "회사 운영",
    "logistics": "물류와 재고",
    "data-ai": "데이터와 AI"
  };

  async function getPosts() {
    const res = await fetch("posts.json?v=" + Date.now());
    if (!res.ok) throw new Error("posts.json을 불러오지 못했습니다.");
    return await res.json();
  }

  function postCard(post) {
    return `
      <a class="content-card auto-post-card" href="post.html?id=${encodeURIComponent(post.id)}">
        <div class="tag">${post.categoryLabel || categoryNames[post.category] || "BIZZIP"}</div>
        <h3>${post.title}</h3>
        <p>${post.summary || ""}</p>
        <div class="post-date">${post.date || ""}</div>
      </a>
    `;
  }

  async function renderLists() {
    const targets = document.querySelectorAll("[data-post-list]");
    if (!targets.length) return;

    try {
      let posts = await getPosts();
      posts = posts.sort((a,b) => String(b.date).localeCompare(String(a.date)));

      targets.forEach(target => {
        const category = target.dataset.category || "";
        const limit = parseInt(target.dataset.limit || "0", 10);
        let list = category ? posts.filter(p => p.category === category) : posts;
        if (limit > 0) list = list.slice(0, limit);

        if (!list.length) {
          target.innerHTML = `<div class="empty-posts">아직 등록된 글이 없습니다.</div>`;
        } else {
          target.innerHTML = list.map(postCard).join("");
        }
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
    html += "</section>";
    return html;
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
        crumb.innerHTML = `<a href="index.html">홈</a> / <a href="contents.html">콘텐츠</a> / ${post.categoryLabel || ""}`;
      }
      const category = document.getElementById("post-category");
      if (category) category.textContent = post.categoryLabel || "";
      const title = document.getElementById("post-title");
      if (title) title.textContent = post.title;
      const summary = document.getElementById("post-summary");
      if (summary) summary.textContent = post.summary || "";
      const date = document.getElementById("post-date");
      if (date) date.textContent = post.date || "";

      mount.innerHTML = `
        <article class="article">
          ${(post.sections || []).map(sectionHtml).join("")}
          <div class="small-cta">
            <strong>BIZZIP의 관련 실무자료도 함께 준비합니다.</strong>
            <span>이 글과 연결되는 체크리스트나 양식이 만들어지면 실무자료에서 바로 연결할 수 있습니다.</span>
          </div>
        </article>
      `;
    } catch (e) {
      console.error(e);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderLists();
    renderPost();
  });
})();
