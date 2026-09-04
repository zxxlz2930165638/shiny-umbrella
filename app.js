const seed = {
  profile: { name: "林默", role: "独立写作者 · 产品设计师", bio: "把复杂的事情想简单，把平凡的日子过具体。", avatar: "林" },
  announcement: { title: "欢迎来到栖迟博客", body: "这里记录生活、设计、阅读，以及那些值得被记住的小事。", version: 1, updatedAt: "2026-09-04T09:00:00+08:00" },
  reward: { image: "" },
  coCreateArticles: [
    { id: 101, title: "一起补完这段关于慢生活的记录", body: ["我们常常把节奏放慢理解为停止行动，其实它更像是一种重新选择注意力的方式。", "当我们愿意把目光放回日常，那些微小但真实的感受便会慢慢浮现出来。"], media: [], createdAt: "2026-09-04T09:00:00+08:00", updatedAt: "2026-09-04T09:00:00+08:00" }
  ],
  articles: [
    { id: 1, title: "给生活留一点不被安排的时间", date: "2026-08-28", read: 8, likes: 24, liked: false, tags: ["生活", "随笔"], summary: "我们总以为自由需要大片完整的时间，其实它也可以发生在一杯茶和一段散步之间。", body: ["最近开始有意识地给每天留出一小块空白。不安排任务，不追赶进度，只是让注意力回到眼前。", "有时候是下班后沿着河边走一圈，有时候是把手机放在另一个房间，认真读完几页书。那些看起来没有产出的时刻，反而让生活重新长出了纹理。"], cover: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80" },
    { id: 2, title: "做一个更有温度的数字产品", date: "2026-08-16", read: 11, likes: 18, liked: false, tags: ["设计", "产品"], summary: "界面不只是功能的容器，它也应该照顾使用者当下的情绪和节奏。", body: ["好的产品体验经常藏在一些不显眼的地方：一个合适的默认值，一句不责备人的错误提示，或者一个让人知道系统正在努力工作的加载状态。", "设计师需要关注的不只是用户想完成什么，也包括他在完成这件事的路上感受如何。"], cover: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=80" },
    { id: 3, title: "夜航船：关于学习的一些小事", date: "2026-07-30", read: 6, likes: 31, liked: false, tags: ["学习", "方法"], summary: "学习不是把知识搬进脑子，而是逐渐改变自己看待世界的方式。", body: ["我喜欢把学习想象成一艘夜航船。你不总能看清岸边的景物，但知道自己正在向某个方向移动。", "重要的不是一次读完多少，而是每隔一段时间回头看，发现自己已经能够提出更好的问题。"], cover: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80" }
  ],
  comments: [{ articleId: 1, name: "周末散步者", text: "很喜欢这句：让注意力回到眼前。" }],
  guestbook: [{ name: "一颗小树", text: "路过，祝博客越写越好。", date: "2026-09-01", status: "approved" }],
  backupFriends: [],
  friends: [
    { name: "纸上造物", desc: "关于设计和生活", avatar: "https://i.pravatar.cc/100?img=32" },
    { name: "慢慢写字", desc: "读书、摄影与远方", avatar: "https://i.pravatar.cc/100?img=12" },
    { name: "山止川行", desc: "工程师的思考记录", avatar: "https://i.pravatar.cc/100?img=5" }
  ]
};
const store = JSON.parse(localStorage.getItem("qichi-blog") || "null") || seed;
store.guestbook = (store.guestbook || []).map((message, index) => ({
  ...message,
  id: message.id || `guestbook-${index + 1}`,
  status: message.status || "approved"
}));
store.backupFriends = store.backupFriends || [];
store.announcement = store.announcement || null;
store.reward = store.reward || { image: "" };
if (!Array.isArray(store.coCreateArticles)) store.coCreateArticles = seed.coCreateArticles.map(item => ({ ...item, body: [...item.body], media: [...item.media] }));
store.coCreationRequests = store.coCreationRequests || [];
store.auditLogs = store.auditLogs || [];
const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const auth = JSON.parse(sessionStorage.getItem("qichi-auth") || "null") || { mode: "guest" };
let currentPage = location.hash.slice(1) || "home";
let activeFilter = "全部";

function save() { localStorage.setItem("qichi-blog", JSON.stringify(store)); }
function saveAuth() { sessionStorage.setItem("qichi-auth", JSON.stringify(auth)); }
function isAdmin() { return auth.mode === "admin"; }
function isPublished(article) { return article.status !== "draft"; }
function avatarMarkup(className = "") {
  return store.profile.avatarImage
    ? `<img class="${className}" src="${store.profile.avatarImage}" alt="个人头像" />`
    : `<span>${store.profile.avatar || store.profile.name.slice(0, 1)}</span>`;
}
function showToast(message) {
  toast.textContent = message; toast.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}
function setPage(page) { currentPage = page; location.hash = page; render(); window.scrollTo(0, 0); }
function tags() { return ["全部", ...new Set(store.articles.flatMap(a => a.tags))]; }
function navState() {
  document.querySelectorAll("[data-nav]").forEach(link => link.classList.toggle("active", link.dataset.nav === currentPage));
  const status = document.querySelector("[data-auth-status]");
  if (status) status.textContent = isAdmin() ? "管理员" : "访客";
  const adminPetAction = document.querySelector("[data-admin-pet-action]");
  if (adminPetAction) adminPetAction.hidden = !isAdmin();
  const coCreateEntry = document.querySelector("[data-co-create-entry]");
  if (coCreateEntry) coCreateEntry.hidden = !isAdmin();
  const headerAvatar = document.querySelector("[data-header-avatar]");
  if (headerAvatar) {
    headerAvatar.innerHTML = avatarMarkup();
    headerAvatar.parentElement.classList.toggle("has-image", Boolean(store.profile.avatarImage));
  }
}
function articleCard(article) {
  return `<article class="article-card"><a href="#article-${article.id}">
    <div class="article-cover"><img src="${article.cover}" alt="" /></div>
    <div class="article-body"><div class="article-meta"><span>${article.date}</span><span>${article.read} min read</span>${article.status === "draft" ? `<span class="draft-label">草稿</span>` : ""}</div>
    <h3>${article.title}</h3><p>${article.summary}</p><div class="tag-row">${article.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div></div></a>${isAdmin() && isPublished(article) ? `<button class="delete-article" data-delete="${article.id}" aria-label="删除文章" title="删除文章">删除</button>` : ""}</article>`;
}
function articleMediaMarkup(article) {
  if (!article.media?.length) return "";
  return `<div class="article-media">${article.media.map(media => media.type === "video"
    ? `<video controls preload="metadata" src="${media.src}"></video>`
    : `<img src="${media.src}" alt="${media.name || "文章配图"}" />`).join("")}</div>`;
}
function layout(content) { return content + `<footer class="footer"><span>© 2026 栖迟博客</span><span>慢一点，也没有关系。</span></footer>`; }
function formatAnnouncementTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date).replace(/\//g, "-");
}
function renderHome() {
  const latest = store.articles.slice(0, 3);
  return layout(`<section class="hero"><div class="hero-content"><div class="eyebrow">A QUIET PLACE FOR LOUD THOUGHTS</div><h1>记录生活，<br />也记录正在成为的自己。</h1><p>${store.profile.bio} 这里是我的个人博客，写设计、技术、阅读，以及那些值得被记住的小事。</p><div class="hero-actions"><a class="button button-primary" href="#archive">阅读文章</a><button class="button button-ghost" data-action="guestbook">留下足迹</button><button class="button button-ghost" data-action="recommend">推荐</button></div></div></section>
    <section class="announcement-home"><div class="announcement-home-inner"><div><span class="eyebrow">ANNOUNCEMENT</span><h2>${store.announcement ? store.announcement.title : "公告栏"}</h2><p>${store.announcement ? store.announcement.body : "暂无公告"}</p></div><a class="text-link" href="#announcement">查看公告 →</a></div></section>
    <section class="section"><div class="section-heading"><div><h2>最近写下</h2><p>一些关于生活、设计和持续学习的记录</p></div><a class="text-link" href="#archive">查看全部文章 →</a></div><div class="article-grid">${latest.map(articleCard).join("")}</div></section>
    <section class="feature-band"><div class="section feature-layout"><div class="feature-note"><div class="eyebrow">NOTES FROM THE DESK</div><h2>愿你在这里，<br />找到一点自己的节奏。</h2><p>博客不是答案集，而是一张持续展开的地图。我把走过的路、遇到的问题和偶尔闪光的念头放在这里，等它们与另一个人相遇。</p><a class="text-link" href="#timeline">沿着时间轴走走 →</a></div><div class="stats"><div class="stat"><strong>${store.articles.length}</strong><span>篇文章</span></div><div class="stat"><strong>${store.articles.reduce((sum, a) => sum + a.likes, 0)}</strong><span>次喜欢</span></div><div class="stat"><strong>${store.guestbook.length}</strong><span>位访客</span></div></div></div></section>`);
}
function renderArchive() {
  const q = new URLSearchParams(location.hash.split("?")[1] || "").get("q") || "";
  const filtered = store.articles.filter(a => (activeFilter === "全部" || a.tags.includes(activeFilter)) && `${a.title}${a.summary}`.includes(q));
  return layout(`<section class="page-top"><div class="page-top-inner"><div><h1>文章</h1><p>把想法写下来，事情就开始变得清晰。</p></div>${isAdmin() ? `<button class="button button-primary" data-action="publish">发布文章</button>` : ""}</div></section><section class="section"><div class="toolbar"><div class="filter-list">${tags().map(t => `<button class="filter ${activeFilter === t ? "selected" : ""}" data-filter="${t}">${t}</button>`).join("")}</div><input class="search-input" id="article-search" placeholder="搜索文章..." value="${q}" /></div><div class="article-grid">${filtered.length ? filtered.map(articleCard).join("") : `<div class="empty">暂无相关文章</div>`}</div></section>`);
}
function renderArticle(id) {
  const article = store.articles.find(a => a.id === Number(id));
  if (!article) return layout(`<section class="section"><div class="empty">这篇文章不可访问。</div></section>`);
  const comments = store.comments.filter(c => c.articleId === article.id);
  return layout(`<section class="section"><article class="detail"><div class="detail-topline"><a class="text-link" href="#archive">← 返回文章列表</a>${isAdmin() && isPublished(article) ? `<button class="delete-article" data-delete="${article.id}">删除文章</button>` : ""}</div><div class="article-meta" style="margin-top:34px"><span>${article.date}</span><span>${article.read} min read</span></div><h1>${article.title}</h1><p class="lead">${article.summary}</p><div class="tag-row">${article.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div><div class="detail-content">${article.body.map(p => `<p>${p}</p>`).join("")}${articleMediaMarkup(article)}</div><div class="interaction"><button class="${article.liked ? "active" : ""}" data-like="${article.id}">♡ ${article.liked ? "已喜欢" : "喜欢"} · ${article.likes}</button><button data-action="comment" data-id="${article.id}">评论 · ${comments.length}</button></div><h2>评论</h2><div class="comment-list">${comments.length ? comments.map(c => `<div class="comment"><div class="comment-head"><span>${c.name}</span><span>刚刚</span></div><p>${c.text}</p></div>`).join("") : `<div class="empty">还没有评论，来说点什么吧。</div>`}</div></article></section>`);
}
function renderTimeline() {
  return layout(`<section class="page-top"><h1>时间轴</h1><p>按照时间，回看一路写下的痕迹。</p></section><section class="section"><div class="timeline">${[...store.articles].sort((a,b) => b.date.localeCompare(a.date)).map(a => `<div class="timeline-item"><div class="timeline-date">${a.date.slice(0,7)}</div><a class="timeline-card" href="#article-${a.id}"><h3>${a.title}</h3><p>${a.summary}</p></a></div>`).join("")}</div></section>`);
}
function renderFriends() {
  return layout(`<section class="page-top"><div class="page-top-inner"><div><h1>友链</h1><p>一些我愿意反复访问的地方。</p></div>${isAdmin() ? `<button class="button button-primary" data-action="friend-add">添加好友</button>` : ""}</div></section><section class="section"><div class="friends-grid">${store.friends.map(f => `<a class="friend" href="${f.url || "#"}" ${f.url ? 'target="_blank" rel="noreferrer"' : 'data-action="friend"'}><img class="friend-avatar" src="${f.avatar}" alt="" /><div><h3>${f.name}</h3><p>${f.desc || f.url || ""}</p></div></a>`).join("")}</div><div style="margin-top:46px"><button class="button button-primary" data-action="friend-backup">留名</button></div></section>`);
}
function renderFriendBackup() {
  return layout(`<section class="page-top"><div class="page-top-inner"><div><h1>好友备用列表</h1><p>留下你的博客信息，和喜欢记录生活的人彼此发现。</p></div><button class="button button-primary" data-action="friend-sign">留名</button></div></section><section class="section"><div class="backup-note">无需登录，填写公开的博客信息即可留名。管理员点击头像可进行列表管理。</div><div class="friends-grid">${store.backupFriends.length ? store.backupFriends.map(friend => `<div class="friend backup-friend"><button class="backup-avatar-button" data-backup-manage="${friend.id}" aria-label="管理${friend.name}的留名" title="${isAdmin() ? "管理留名" : "查看头像"}"><img class="friend-avatar" src="${friend.avatar}" alt="${friend.name}的头像" /></button><div class="friend-info"><h3>${friend.name}</h3><a href="${friend.url}" target="_blank" rel="noreferrer">${friend.url}</a></div></div>`).join("") : `<div class="empty">备用列表还没有朋友，欢迎第一个留下信息。</div>`}</div></section>`);
}
function renderAnnouncement() {
  const announcement = store.announcement;
  return layout(`<section class="page-top"><div class="page-top-inner"><div><h1>公告栏</h1><p>博客的重要通知和近期动态。</p></div>${isAdmin() ? `<button class="button button-primary" data-action="edit-announcement">编辑公告</button>` : ""}</div></section><section class="section announcement-section">${announcement ? `<article class="announcement-card"><div class="announcement-meta"><span>第 ${announcement.version || 1} 版</span><span>更新时间：${formatAnnouncementTime(announcement.updatedAt)}</span></div><h2>${announcement.title}</h2><div class="announcement-body">${announcement.body.split(/\r?\n/).map(paragraph => `<p>${paragraph}</p>`).join("")}</div></article>` : `<div class="empty">暂无公告</div>`}</section>`);
}
function diffMarkup(original, proposed) {
  return `<div class="diff-block"><div class="diff-original"><strong>原文</strong><p>${original}</p></div><div class="diff-proposed"><strong>修改稿</strong><p>${proposed}</p></div></div>`;
}
function coCreateMediaMarkup(item) {
  if (!item.media?.length) return "";
  return `<div class="article-media">${item.media.map(media => media.type === "video" ? `<video controls preload="metadata" src="${media.src}"></video>` : `<img src="${media.src}" alt="${media.name || "共创配图"}" />`).join("")}</div>`;
}
function renderCoCreate(id) {
  const item = store.coCreateArticles.find(article => article.id === Number(id));
  if (!item) return layout(`<section class="section"><div class="empty">共创内容不存在。</div></section>`);
  return layout(`<section class="section"><article class="detail"><div class="detail-topline"><a class="text-link" href="#co-create">← 返回共创界面</a></div><div class="article-meta" style="margin-top:34px"><span>更新时间：${formatAnnouncementTime(item.updatedAt)}</span></div><h1>${item.title}</h1><div class="detail-content">${item.body.map(p => `<p>${p}</p>`).join("")}${coCreateMediaMarkup(item)}</div><button class="button button-primary co-create-button" data-action="co-create-apply" data-id="${item.id}">申请修改</button></article></section>`);
}
function renderCoCreateHome() {
  const pending = store.coCreationRequests.filter(request => request.status === "pending").length;
  return layout(`<section class="page-top"><div class="page-top-inner"><div><h1>共创界面</h1><p>一起阅读、补充和完善独立发布的共创内容。</p></div>${isAdmin() ? `<div class="page-top-actions"><span class="pending-count">${pending} 条待审核</span><button class="button button-primary" data-action="co-create-publish">发布共创内容</button></div>` : ""}</div></section><section class="section"><div class="article-grid">${store.coCreateArticles.length ? store.coCreateArticles.map(item => `<article class="article-card"><a href="#co-create-${item.id}"><div class="article-body"><div class="article-meta"><span>更新于 ${formatAnnouncementTime(item.updatedAt)}</span></div><h3>${item.title}</h3><p>${item.body[0] || ""}</p><div class="tag-row"><span class="tag">可申请修改</span>${item.media?.length ? `<span class="tag">${item.media.length} 个媒体</span>` : ""}</div></div></a></article>`).join("") : `<div class="empty">暂无共创内容。</div>`}</div>${isAdmin() ? `<div class="review-link"><a class="text-link" href="#co-create-review">进入申请审核 →</a></div>` : ""}</section>`);
}
function renderCoCreateReview() {
  if (!isAdmin()) return layout(`<section class="section"><div class="empty">请先登录管理员账户。</div></section>`);
  const pending = store.coCreationRequests.filter(request => request.status === "pending");
  return layout(`<section class="page-top"><h1>共创申请审核</h1><p>审核游客对共创界面内容的修改申请。</p></section><section class="section"><div class="comment-list">${pending.length ? pending.map(request => { const item = store.coCreateArticles.find(article => article.id === request.coCreateId); return `<article class="co-request"><div class="comment-head"><span>${request.applicant} · ${item ? item.title : "内容已不存在"}</span><span>${formatAnnouncementTime(request.createdAt)}</span></div>${item ? diffMarkup(request.originalText, request.proposedText) : `<p class="confirm-copy">共创内容已不存在。</p>`}<div class="helper-actions"><button class="button button-danger" data-co-reject="${request.id}">拒绝</button><button class="button button-primary" data-co-approve="${request.id}">通过并合并</button></div></article>`; }).join("") : `<div class="empty">暂无待审核的共创申请。</div>`}</div></section>`);
}
function renderGuestbook() {
  const messages = store.guestbook.filter(message => message.status === "approved");
  return layout(`<section class="page-top"><h1>留言</h1><p>如果你愿意，可以在这里留下一句话。</p></section><section class="section"><button class="button button-primary" data-action="guestbook-form">到此一游</button><div class="comment-list" style="margin-top:28px">${messages.length ? messages.map(g => `<div class="comment"><div class="comment-head"><span>${g.name}</span><span>${g.date}</span></div><p>${g.text}</p></div>`).join("") : `<div class="empty">还没有公开留言，来说点什么吧。</div>`}</div></section>`);
}
function renderPetHelper() {
  if (!isAdmin()) return layout(`<section class="section"><div class="empty">请先登录管理员账户。</div></section>`);
  const pending = store.guestbook.filter(message => message.status === "pending").length;
  return layout(`<section class="page-top"><div class="page-top-inner"><div><h1>宠物助手</h1><p>管理访客留言，让值得留下的话被看见。</p></div><span class="pending-count">${pending} 条待处理</span></div></section><section class="section"><div class="helper-toolbar"><span class="helper-summary">共 ${store.guestbook.length} 条留言</span><button class="button button-light" data-action="guestbook">查看公开留言</button></div><div class="comment-list">${store.guestbook.length ? store.guestbook.map(message => `<div class="comment helper-message"><div class="comment-head"><span>${message.name}</span><span>${message.date} · ${message.status === "pending" ? "待审核" : "已通过"}</span></div><p>${message.text}</p><div class="helper-actions">${message.status === "pending" ? `<button class="button button-primary" data-pet-save="${message.id}">通过留言</button>` : ""}<button class="button button-danger" data-pet-delete="${message.id}">删除</button></div></div>`).join("") : `<div class="empty">暂时没有留言。</div>`}</div></section>`);
}
function render() {
  if (currentPage.startsWith("article-")) app.innerHTML = renderArticle(currentPage.split("-")[1]);
  else if (currentPage === "archive") app.innerHTML = renderArchive();
  else if (currentPage === "timeline") app.innerHTML = renderTimeline();
  else if (currentPage === "friends") app.innerHTML = renderFriends();
  else if (currentPage === "friend-backup") app.innerHTML = renderFriendBackup();
  else if (currentPage === "announcement") app.innerHTML = renderAnnouncement();
  else if (currentPage === "co-create") app.innerHTML = renderCoCreateHome();
  else if (currentPage === "co-create-review") app.innerHTML = renderCoCreateReview();
  else if (currentPage.startsWith("co-create-")) app.innerHTML = renderCoCreate(currentPage.split("-")[2]);
  else if (currentPage === "guestbook") app.innerHTML = renderGuestbook();
  else if (currentPage === "pet-helper") app.innerHTML = renderPetHelper();
  else app.innerHTML = renderHome();
  navState();
}
function modal(title, body) {
  document.querySelector("#modal-root").innerHTML = `<div class="modal-backdrop" data-close><div class="modal" role="dialog" aria-modal="true"><h2>${title}</h2>${body}</div></div>`;
}
function closeModal() { document.querySelector("#modal-root").innerHTML = ""; }
function copyRecommendation() {
  const input = document.querySelector("#recommendation-text");
  if (!input) return;
  const fallbackCopy = () => {
    input.focus();
    input.select();
    try {
      if (!document.execCommand("copy")) throw new Error("copy failed");
      showToast("复制成功");
    } catch {
      showToast("复制失败，请手动选择文本复制");
    }
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(input.value).then(() => showToast("复制成功")).catch(fallbackCopy);
  } else {
    fallbackCopy();
  }
}
function initDesktopPet() {
  const pet = document.querySelector("#desktop-pet");
  const character = document.querySelector("#pet-character");
  const bubble = document.querySelector("#pet-bubble");
  const message = document.querySelector("#pet-message");
  if (!pet || !character || !bubble || !message) return;
  const messages = [
    "今天也要慢慢写下想说的话。",
    "一小段文字，也值得被认真保存。",
    "欢迎回来，今天想和我一起做点什么？",
    "休息一下，再继续也完全可以。"
  ];
  character.addEventListener("click", () => {
    bubble.hidden = !bubble.hidden;
    if (!bubble.hidden) message.textContent = messages[Math.floor(Math.random() * messages.length)];
  });
  bubble.addEventListener("click", event => {
    const action = event.target.closest("[data-pet-action]")?.dataset.petAction;
    if (!action) return;
    if (action === "close") bubble.hidden = true;
    if (action === "encourage") message.textContent = "你已经做得很好了，继续保持自己的节奏。";
    if (action === "guestbook") { bubble.hidden = true; setPage("guestbook"); }
    if (action === "view-messages") {
      if (!isAdmin()) return showToast("请先登录管理员账户");
      bubble.hidden = true;
      setPage("pet-helper");
    }
  });
  let dragging = false;
  let moved = false;
  let offsetX = 0;
  let offsetY = 0;
  character.addEventListener("pointerdown", event => {
    dragging = true;
    moved = false;
    const rect = pet.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    character.setPointerCapture(event.pointerId);
  });
  character.addEventListener("pointermove", event => {
    if (!dragging) return;
    moved = true;
    pet.style.left = `${Math.max(8, Math.min(window.innerWidth - 120, event.clientX - offsetX))}px`;
    pet.style.top = `${Math.max(8, Math.min(window.innerHeight - 145, event.clientY - offsetY))}px`;
    pet.style.right = "auto";
    pet.style.bottom = "auto";
  });
  character.addEventListener("pointerup", event => {
    dragging = false;
    character.releasePointerCapture(event.pointerId);
    if (moved) event.preventDefault();
  });
}
document.addEventListener("click", e => {
  const filter = e.target.closest("[data-filter]");
  if (filter) { activeFilter = filter.dataset.filter; render(); return; }
  const like = e.target.closest("[data-like]");
  if (like) { const a = store.articles.find(x => x.id === Number(like.dataset.like)); a.liked = !a.liked; a.likes += a.liked ? 1 : -1; save(); render(); return; }
  const deleteButton = e.target.closest("[data-delete]");
  if (deleteButton) {
    e.preventDefault();
    e.stopPropagation();
    const article = store.articles.find(item => item.id === Number(deleteButton.dataset.delete));
    if (!article || !isAdmin() || !isPublished(article)) return showToast("无权删除文章");
    modal("确认删除文章", `<p class="confirm-copy">删除后文章和相关评论都将被移除，且无法恢复。</p><div class="modal-actions"><button class="button button-light" data-close>取消</button><button class="button button-danger" data-confirm-delete="${article.id}">确认删除</button></div>`);
    return;
  }
  const action = e.target.closest("[data-action]");
  if (!action) return;
  const name = action.dataset.action;
  if (name === "search") modal("搜索文章", `<input class="form-input" id="modal-search" placeholder="输入关键词..." autofocus /><div class="modal-actions"><button class="button button-light" data-close>取消</button><button class="button button-primary" id="do-search">搜索</button></div>`);
  if (name === "recommend") {
    const recommendation = `推荐你访问「栖迟 · 个人博客」
记录生活、设计、阅读，以及那些值得被记住的小事。
http://localhost:4173/`;
    modal("推荐博客", `<p class="confirm-copy">把这份安静的记录分享给朋友。</p><textarea class="form-textarea recommendation-text" id="recommendation-text" readonly>${recommendation}</textarea><p class="form-help recommendation-help">点击复制失败时，请手动选择上方文字并复制。</p><div class="modal-actions"><button class="button button-light" data-close>关闭</button><button class="button button-primary" data-action="copy-recommendation">复制推荐内容</button></div>`);
  }
  if (name === "copy-recommendation") copyRecommendation();
  if (name === "reward") {
    if (isAdmin()) {
      modal("微信打赏", `<form id="reward-form" class="form-stack"><p class="confirm-copy">上传微信赞赏码后，游客可以在此处查看。</p><label class="form-label">赞赏码图片<button type="button" class="button button-light upload-button">选择图片<input id="reward-file" type="file" accept="image/png,image/jpeg,image/webp" /></button><span class="form-help">支持 PNG、JPG、WEBP，大小不超过 2MB。</span><div id="reward-preview" class="reward-preview">${store.reward.image ? `<img src="${store.reward.image}" alt="当前微信赞赏码" />` : `<span>尚未上传</span>`}</div></label><div class="modal-actions"><button type="button" class="button button-light" data-close>取消</button><button class="button button-primary">保存赞赏码</button></div></form>`);
    } else {
      modal("微信打赏", store.reward.image
        ? `<p class="confirm-copy">感谢你的支持，每一份心意都会被认真收下。</p><div class="reward-code-wrap"><img class="reward-code" src="${store.reward.image}" alt="微信赞赏码" /></div><div class="modal-actions"><button class="button button-primary" data-close>关闭</button></div>`
        : `<div class="reward-empty"><strong>赞赏码暂未上传</strong><p>管理员上传微信赞赏码后，这里会展示赞赏图片。</p></div><div class="modal-actions"><button class="button button-primary" data-close>关闭</button></div>`);
    }
  }
  if (name === "profile") {
    if (!isAdmin()) {
      modal("登录博客后台", `<form id="login-form" class="form-stack"><p class="login-tip">管理员登录后可以编辑个人资料和管理博客内容。</p><label class="form-label">管理员密码<input class="form-input" name="password" type="password" autocomplete="current-password" required autofocus /></label><div class="modal-actions"><button type="button" class="button button-light" data-action="guest-mode">访客模式</button><button class="button button-primary">登录</button></div></form>`);
    } else {
      modal("管理员账户", `<div class="form-stack"><div class="profile-editor-head"><div class="profile-preview">${avatarMarkup()}</div><p style="line-height:1.8;color:var(--muted)">${store.profile.name}，${store.profile.role}<br />当前已登录管理员模式。</p></div></div><div class="modal-actions"><button class="button button-light" data-close>关闭</button><button class="button button-light" data-action="logout">退出登录</button><button class="button button-primary" id="edit-profile">编辑资料</button></div>`);
    }
  }
  if (name === "guest-mode") { auth.mode = "guest"; saveAuth(); closeModal(); showToast("已进入访客模式"); }
  if (name === "logout") { auth.mode = "guest"; saveAuth(); closeModal(); navState(); showToast("已退出登录"); }
  if (name === "publish") {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    modal("发布文章", `<form id="publish-form" class="form-stack"><label class="form-label">文章标题<input class="form-input" name="title" maxlength="80" required placeholder="输入文章标题" /></label><label class="form-label">文章摘要<textarea class="form-textarea compact-textarea" name="summary" maxlength="180" required placeholder="用一句话介绍这篇文章"></textarea></label><label class="form-label">文章正文<textarea class="form-textarea publish-content" name="body" maxlength="10000" required placeholder="写下你的文章内容"></textarea></label><label class="form-label">标签<input class="form-input" name="tags" maxlength="100" required placeholder="用逗号分隔，例如：生活，随笔" /></label><label class="form-label">图片或视频<button type="button" class="button button-light upload-button media-upload-button">选择文件<input id="article-media" type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm" multiple /></button><span class="form-help">支持 PNG、JPG、WEBP、MP4、WEBM；图片不超过 5MB，视频不超过 30MB。</span><div id="media-preview" class="media-preview"></div></label><div class="modal-actions"><button type="button" class="button button-light" data-close>取消</button><button type="submit" name="status" value="draft" class="button button-light">保存草稿</button><button type="submit" name="status" value="published" class="button button-primary">正式发布</button></div></form>`);
  }
  if (name === "guestbook") setPage("guestbook");
  if (name === "friend-backup") setPage("friend-backup");
  if (name === "friend-sign") {
    modal("游客留名", `<form id="friend-sign-form" class="form-stack"><label class="form-label">头像图片<button type="button" class="button button-light upload-button friend-avatar-upload">选择图片<input id="friend-avatar-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" required /></button><span class="form-help">支持 PNG、JPG、WEBP、GIF，大小不超过 2MB。</span><div id="friend-avatar-preview" class="friend-avatar-preview"></div></label><label class="form-label">名称<input class="form-input" name="name" maxlength="30" required placeholder="你的名称" /></label><label class="form-label">博客网址<input class="form-input" name="url" type="url" maxlength="300" required placeholder="https://your-blog.com" /></label><div class="modal-actions"><button type="button" class="button button-light" data-close>取消</button><button class="button button-primary">保存并返回</button></div></form>`);
  }
  if (name === "friend-add") {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    modal("添加好友博客", `<form id="friend-add-form" class="form-stack"><label class="form-label">头像或展示图片<button type="button" class="button button-light upload-button">选择图片<input id="friend-add-avatar-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" required /></button><span class="form-help">支持 PNG、JPG、WEBP、GIF，大小不超过 2MB。</span><div id="friend-add-avatar-preview" class="friend-avatar-preview"></div></label><label class="form-label">博客名称<input class="form-input" name="name" maxlength="30" required placeholder="输入博客名称" /></label><label class="form-label">博客网址<input class="form-input" name="url" type="url" maxlength="300" required placeholder="https://your-blog.com" /></label><label class="form-label">简介<textarea class="form-textarea compact-textarea" name="desc" maxlength="120" placeholder="输入博客简介"></textarea></label><div class="modal-actions"><button type="button" class="button button-light" data-close>取消</button><button class="button button-primary">保存好友</button></div></form>`);
  }
  if (name === "edit-announcement") {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    const announcement = store.announcement || { title: "", body: "" };
    modal("编辑公告", `<form id="announcement-form" class="form-stack"><label class="form-label">公告标题<input class="form-input" name="title" maxlength="80" value="${announcement.title}" required placeholder="输入公告标题" /></label><label class="form-label">公告正文<textarea class="form-textarea announcement-editor" name="body" maxlength="2000" required placeholder="输入公告内容">${announcement.body}</textarea></label><p class="form-help">公告不能为空，保存后会自动生成新版本和更新时间。</p><div class="modal-actions"><button type="button" class="button button-light" data-close>取消</button><button class="button button-primary">保存公告</button></div></form>`);
  }
  if (name === "pet-helper") {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    setPage("pet-helper");
  }
  if (name === "co-create-apply") {
    const item = store.coCreateArticles.find(article => article.id === Number(action.dataset.id));
    if (!item) return showToast("共创内容不存在");
    modal("申请修改", `<form id="co-create-form" class="form-stack"><input type="hidden" name="coCreateId" value="${item.id}" /><label class="form-label">申请人<input class="form-input" name="applicant" maxlength="30" required placeholder="你的昵称" /></label><fieldset class="paragraph-picker"><legend>选择目标段落</legend>${item.body.map((paragraph, index) => `<label class="paragraph-option"><input type="radio" name="paragraphIndex" value="${index}" /><span>${paragraph}</span></label>`).join("")}</fieldset><label class="form-label">修改稿<textarea class="form-textarea co-create-editor" name="proposedText" maxlength="1000" required placeholder="请输入完整的修改内容"></textarea></label><div class="modal-actions"><button type="button" class="button button-light" data-close>取消</button><button class="button button-primary">申请合并</button></div></form>`);
  }
  if (name === "co-create-publish") {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    modal("发布共创内容", `<form id="co-create-publish-form" class="form-stack"><label class="form-label">标题<input class="form-input" name="title" maxlength="80" required placeholder="输入共创内容标题" /></label><label class="form-label">正文<textarea class="form-textarea publish-content" name="body" maxlength="10000" required placeholder="输入共创内容正文"></textarea></label><label class="form-label">图片或视频<button type="button" class="button button-light upload-button media-upload-button">选择文件<input id="co-create-media" type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm" multiple /></button><span class="form-help">支持 PNG、JPG、WEBP、MP4、WEBM；图片不超过 5MB，视频不超过 30MB。</span><div id="co-create-media-preview" class="media-preview"></div></label><div class="modal-actions"><button type="button" class="button button-light" data-close>取消</button><button class="button button-primary">发布内容</button></div></form>`);
  }
  if (name === "guestbook-form") modal("留下足迹", `<form id="guestbook-form" class="form-stack"><label class="form-label">昵称<input class="form-input" name="name" required maxlength="20" /></label><label class="form-label">留言内容<textarea class="form-textarea" name="text" required maxlength="300"></textarea></label><div class="modal-actions"><button type="button" class="button button-light" data-close>取消</button><button class="button button-primary">提交留言</button></div></form>`);
  if (name === "comment") modal("写下评论", `<form id="comment-form" class="form-stack"><label class="form-label">昵称<input class="form-input" name="name" required maxlength="20" /></label><label class="form-label">评论内容<textarea class="form-textarea" name="text" required maxlength="300"></textarea></label><div class="modal-actions"><button type="button" class="button button-light" data-close>取消</button><button class="button button-primary">发布评论</button></div></form>`);
  if (name === "friend") { e.preventDefault(); showToast("友链地址将在接入后台后开放"); }
  if (name === "close") closeModal();
});
document.addEventListener("click", e => {
  if (e.target.matches("[data-close]")) closeModal();
  if (e.target.matches("[data-confirm-delete]")) {
    const articleId = Number(e.target.dataset.confirmDelete);
    const articleIndex = store.articles.findIndex(article => article.id === articleId);
    if (articleIndex < 0 || !isAdmin()) return showToast("删除失败");
    store.articles.splice(articleIndex, 1);
    store.comments = store.comments.filter(comment => comment.articleId !== articleId);
    save();
    closeModal();
    setPage("archive");
    showToast("文章删除成功");
  }
  const petSave = e.target.closest("[data-pet-save]");
  if (petSave) {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    const message = store.guestbook.find(item => String(item.id) === String(petSave.dataset.petSave));
    if (!message) return showToast("留言不存在");
    message.status = "approved";
    save();
    render();
    showToast("留言已通过");
    return;
  }
  const petDelete = e.target.closest("[data-pet-delete]");
  if (petDelete) {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    const message = store.guestbook.find(item => String(item.id) === String(petDelete.dataset.petDelete));
    if (!message) return showToast("留言不存在");
    modal("确认删除留言", `<p class="confirm-copy">删除后这条留言将无法恢复。</p><div class="modal-actions"><button class="button button-light" data-close>取消</button><button class="button button-danger" data-confirm-pet-delete="${message.id}">确认删除</button></div>`);
    return;
  }
  if (e.target.matches("[data-confirm-pet-delete]")) {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    const messageIndex = store.guestbook.findIndex(item => String(item.id) === String(e.target.dataset.confirmPetDelete));
    if (messageIndex < 0) return showToast("留言不存在");
    store.guestbook.splice(messageIndex, 1);
    save();
    closeModal();
    render();
    showToast("留言已删除");
    return;
  }
  const backupDelete = e.target.closest("[data-backup-delete]");
  const backupManage = e.target.closest("[data-backup-manage]");
  if (backupManage) {
    if (!isAdmin()) return;
    const friend = store.backupFriends.find(item => String(item.id) === String(backupManage.dataset.backupManage));
    if (!friend) return showToast("好友信息不存在");
    modal("管理好友留名", `<p class="confirm-copy">${friend.name}<br />${friend.url}</p><div class="modal-actions"><button class="button button-light" data-close>取消</button><button class="button button-danger" data-backup-delete="${friend.id}">删除</button><button class="button button-primary" data-backup-move="${friend.id}">移入友链</button></div>`);
    return;
  }
  if (backupDelete) {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    modal("确认删除留名", `<p class="confirm-copy">删除后这条好友信息将从备用列表移除。</p><div class="modal-actions"><button class="button button-light" data-close>取消</button><button class="button button-danger" data-confirm-backup-delete="${backupDelete.dataset.backupDelete}">确认删除</button></div>`);
    return;
  }
  if (e.target.matches("[data-confirm-backup-delete]")) {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    const index = store.backupFriends.findIndex(friend => String(friend.id) === String(e.target.dataset.confirmBackupDelete));
    if (index < 0) return showToast("好友信息不存在");
    store.backupFriends.splice(index, 1);
    save();
    closeModal();
    render();
    showToast("留名已删除");
    return;
  }
  if (e.target.matches("[data-backup-move]")) {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    const backupIndex = store.backupFriends.findIndex(friend => String(friend.id) === String(e.target.dataset.backupMove));
    if (backupIndex < 0) return showToast("好友信息不存在");
    const friend = store.backupFriends[backupIndex];
    if (store.friends.some(item => item.name.toLowerCase() === friend.name.toLowerCase() || (item.url && item.url.toLowerCase() === friend.url.toLowerCase()))) return showToast("该好友已在友链列表中");
    store.friends.push({ name: friend.name, desc: friend.url, avatar: friend.avatar, url: friend.url });
    store.backupFriends.splice(backupIndex, 1);
    save();
    closeModal();
    render();
    showToast("已移入友链列表");
    return;
  }
  const approveRequest = e.target.closest("[data-co-approve]");
  if (approveRequest) {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    const request = store.coCreationRequests.find(item => String(item.id) === String(approveRequest.dataset.coApprove));
    const article = request && store.coCreateArticles.find(item => item.id === request.coCreateId);
    if (!request || request.status !== "pending") return showToast("申请已处理");
    if (!article) return showToast("原文章已不存在");
    if (article.body[request.paragraphIndex] !== request.originalText) {
      request.status = "conflict";
      request.reviewedAt = new Date().toISOString();
      request.reviewedBy = "管理员";
      request.reviewResult = "共创内容已发生变化，无法合并";
      store.auditLogs.push({ action: "co-create-conflict", requestId: request.id, at: request.reviewedAt, operator: "管理员" });
      save();
      render();
      return showToast("共创内容已发生变化，无法合并");
    }
    if (request.originalText === request.proposedText) return showToast("文章未被修改");
    article.body[request.paragraphIndex] = request.proposedText;
    request.status = "approved";
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = "管理员";
    request.reviewResult = "已通过并合并";
    store.auditLogs.push({ action: "co-create-approved", requestId: request.id, coCreateId: article.id, at: request.reviewedAt, operator: "管理员" });
    save();
    render();
    showToast("共创申请已通过并合并");
    return;
  }
  const rejectRequest = e.target.closest("[data-co-reject]");
  if (rejectRequest) {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    const request = store.coCreationRequests.find(item => String(item.id) === String(rejectRequest.dataset.coReject));
    if (!request || request.status !== "pending") return showToast("申请已处理");
    request.status = "rejected";
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = "管理员";
    request.reviewResult = "管理员拒绝申请";
    store.auditLogs.push({ action: "co-create-rejected", requestId: request.id, at: request.reviewedAt, operator: "管理员" });
    save();
    render();
    showToast("共创申请已拒绝");
    return;
  }
  if (e.target.id === "do-search") { const q = document.querySelector("#modal-search").value.trim(); closeModal(); location.href = q ? `#archive?q=${encodeURIComponent(q)}` : "#archive"; currentPage = "archive"; render(); }
  if (e.target.id === "edit-profile") modal("编辑资料", `<form id="profile-form" class="form-stack"><div class="profile-editor-head"><div class="profile-preview" id="profile-preview">${avatarMarkup()}</div><div><button type="button" class="button button-light upload-button">选择头像<input id="avatar-file" type="file" accept="image/png,image/jpeg,image/webp" /></button><p class="form-help">支持 PNG、JPG、WEBP，大小不超过 2MB。</p></div></div><label class="form-label">昵称<input class="form-input" name="name" value="${store.profile.name}" required /></label><label class="form-label">个性签名<textarea class="form-textarea" name="bio" required>${store.profile.bio}</textarea></label><label class="form-label">微信赞赏码<button type="button" class="button button-light upload-button">选择图片<input id="reward-file" type="file" accept="image/png,image/jpeg,image/webp" /></button><span class="form-help">上传微信赞赏码图片，支持 PNG、JPG、WEBP，大小不超过 2MB。</span><div id="reward-preview" class="reward-preview">${store.reward.image ? `<img src="${store.reward.image}" alt="当前微信赞赏码" />` : `<span>尚未上传</span>`}</div></label><div class="modal-actions"><button type="button" class="button button-light" data-close>取消</button><button class="button button-primary">保存资料</button></div></form>`);
});
document.addEventListener("change", e => {
  if (e.target.id === "co-create-media") {
    const files = [...e.target.files];
    const allowed = ["image/png", "image/jpeg", "image/webp", "video/mp4", "video/webm"];
    if (files.some(file => !allowed.includes(file.type) || file.size > (file.type.startsWith("video/") ? 30 : 5) * 1024 * 1024)) {
      e.target.value = "";
      return showToast("文件格式不支持或文件过大");
    }
    const pending = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        pending.push({ name: file.name, type: file.type.startsWith("video/") ? "video" : "image", src: reader.result });
        e.target.dataset.pendingMedia = JSON.stringify(pending);
        const preview = document.querySelector("#co-create-media-preview");
        if (preview) preview.innerHTML = pending.map(media => media.type === "video" ? `<video controls src="${media.src}"></video>` : `<img src="${media.src}" alt="${media.name}" />`).join("");
      };
      reader.readAsDataURL(file);
    });
    return;
  }
  if (e.target.id === "friend-avatar-file") {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type) || file.size > 2 * 1024 * 1024) {
      e.target.value = "";
      return showToast("头像格式不支持或超过 2MB");
    }
    const reader = new FileReader();
    reader.onload = () => {
      const preview = document.querySelector("#friend-avatar-preview");
      if (preview) preview.innerHTML = `<img src="${reader.result}" alt="头像预览" />`;
      e.target.dataset.pendingAvatar = reader.result;
      showToast("头像已加载");
    };
    reader.readAsDataURL(file);
    return;
  }
  if (e.target.id === "friend-add-avatar-file") {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type) || file.size > 2 * 1024 * 1024) {
      e.target.value = "";
      return showToast("图片格式不支持或超过 2MB");
    }
    const reader = new FileReader();
    reader.onload = () => {
      const preview = document.querySelector("#friend-add-avatar-preview");
      if (preview) preview.innerHTML = `<img src="${reader.result}" alt="好友头像预览" />`;
      e.target.dataset.pendingAvatar = reader.result;
      showToast("好友图片已加载");
    };
    reader.readAsDataURL(file);
    return;
  }
  if (e.target.id !== "avatar-file") return;
  const file = e.target.files[0];
  if (!file) return;
  const validTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!validTypes.includes(file.type) || file.size > 2 * 1024 * 1024) {
    e.target.value = "";
    return showToast("头像格式不合法或超过 2MB");
  }
  const reader = new FileReader();
  reader.onload = () => {
    const preview = document.querySelector("#profile-preview");
    if (preview) preview.innerHTML = `<img src="${reader.result}" alt="头像预览" />`;
    e.target.dataset.pendingAvatar = reader.result;
    showToast("头像已加载，保存后生效");
  };
  reader.readAsDataURL(file);
});
document.addEventListener("change", e => {
  if (e.target.id !== "reward-file") return;
  const file = e.target.files[0];
  if (!file) return;
  const validTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!validTypes.includes(file.type) || file.size > 2 * 1024 * 1024) {
    e.target.value = "";
    return showToast("赞赏码格式不合法或超过 2MB");
  }
  const reader = new FileReader();
  reader.onload = () => {
    const preview = document.querySelector("#reward-preview");
    if (preview) preview.innerHTML = `<img src="${reader.result}" alt="微信赞赏码预览" />`;
    e.target.dataset.pendingReward = reader.result;
    showToast("赞赏码已加载，保存后生效");
  };
  reader.readAsDataURL(file);
});
document.addEventListener("change", e => {
  if (e.target.id !== "article-media") return;
  const files = [...e.target.files];
  const allowed = ["image/png", "image/jpeg", "image/webp", "video/mp4", "video/webm"];
  if (files.some(file => !allowed.includes(file.type) || file.size > (file.type.startsWith("video/") ? 30 : 5) * 1024 * 1024)) {
    e.target.value = "";
    return showToast("文件格式不支持或文件过大");
  }
  const pending = [];
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      pending.push({ name: file.name, type: file.type.startsWith("video/") ? "video" : "image", src: reader.result });
      e.target.dataset.pendingMedia = JSON.stringify(pending);
      const preview = document.querySelector("#media-preview");
      if (preview) preview.innerHTML = pending.map(media => media.type === "video"
        ? `<video controls src="${media.src}"></video>`
        : `<img src="${media.src}" alt="${media.name}" />`).join("");
    };
    reader.readAsDataURL(file);
  });
});
document.addEventListener("submit", e => {
  e.preventDefault();
  if (e.target.id === "login-form") {
    const password = new FormData(e.target).get("password");
    if (password !== "admin123") return showToast("密码错误");
    auth.mode = "admin";
    saveAuth();
    closeModal();
    navState();
    showToast("登录成功，欢迎回来");
    return;
  }
  if (e.target.id === "reward-form") {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    const rewardFile = e.target.querySelector("#reward-file");
    if (!rewardFile?.dataset.pendingReward && !store.reward.image) return showToast("请先上传赞赏码");
    if (rewardFile?.dataset.pendingReward) store.reward.image = rewardFile.dataset.pendingReward;
    save();
    closeModal();
    showToast("赞赏码保存成功");
    return;
  }
  if (e.target.id === "comment-form") { const data = new FormData(e.target); if (!data.get("text").trim()) return showToast("评论内容不能为空"); store.comments.push({ articleId: Number(currentPage.split("-")[1]), name: data.get("name"), text: data.get("text") }); save(); closeModal(); render(); showToast("评论发布成功"); }
  if (e.target.id === "profile-form") {
    const data = new FormData(e.target);
    store.profile.name = data.get("name");
    store.profile.bio = data.get("bio");
    const avatarFile = e.target.querySelector("#avatar-file");
    if (avatarFile?.dataset.pendingAvatar) store.profile.avatarImage = avatarFile.dataset.pendingAvatar;
    const rewardFile = e.target.querySelector("#reward-file");
    if (rewardFile?.dataset.pendingReward) store.reward.image = rewardFile.dataset.pendingReward;
    save();
    closeModal();
    render();
    showToast("资料保存成功");
  }
  if (e.target.id === "publish-form") {
    if (!isAdmin()) return showToast("登录状态已失效，请重新登录");
    const data = new FormData(e.target);
    const title = data.get("title").trim();
    const summary = data.get("summary").trim();
    const body = data.get("body").trim();
    const parsedTags = data.get("tags").split(/[,，]/).map(tag => tag.trim()).filter(Boolean);
    if (!title || !summary || !body || !parsedTags.length) return showToast("文章内容不完整");
    const now = new Date().toISOString().slice(0, 10);
    const mediaInput = e.target.querySelector("#article-media");
    store.articles.unshift({ id: Date.now(), title, date: now, updatedAt: now, status: e.submitter?.value || "published", read: Math.max(1, Math.ceil(body.length / 350)), likes: 0, liked: false, tags: [...new Set(parsedTags)], summary, body: body.split(/\r?\n/).map(paragraph => paragraph.trim()).filter(Boolean), media: mediaInput?.dataset.pendingMedia ? JSON.parse(mediaInput.dataset.pendingMedia) : [], cover: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80" });
    save();
    closeModal();
    setPage("archive");
    showToast(e.submitter?.value === "draft" ? "草稿保存成功" : "文章发布成功");
  }
  if (e.target.id === "guestbook-form") { const data = new FormData(e.target); if (!data.get("text").trim()) return showToast("留言内容不合法"); store.guestbook.unshift({ id: Date.now(), name: data.get("name").trim(), text: data.get("text").trim(), date: new Date().toISOString().slice(0,10), status: "pending" }); save(); closeModal(); render(); showToast("留言已提交，等待审核"); }
  if (e.target.id === "friend-sign-form") {
    const data = new FormData(e.target);
    const name = data.get("name").trim();
    const url = data.get("url").trim();
    const avatarFile = e.target.querySelector("#friend-avatar-file");
    const avatar = avatarFile?.dataset.pendingAvatar;
    if (!avatar) return showToast("请先上传头像");
    let blogUrl;
    try { blogUrl = new URL(url); } catch { return showToast("博客网址格式不正确"); }
    if (!["http:", "https:"].includes(blogUrl.protocol)) return showToast("仅支持 http 或 https 地址");
    if (store.backupFriends.some(friend => friend.name.toLowerCase() === name.toLowerCase() || friend.url.toLowerCase() === blogUrl.href.toLowerCase())) return showToast("名称或博客网址已留名");
    store.backupFriends.unshift({ id: Date.now(), name, avatar, url: blogUrl.href, date: new Date().toISOString().slice(0, 10) });
    save();
    closeModal();
    setPage("friend-backup");
    showToast("留名成功");
  }
  if (e.target.id === "friend-add-form") {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    const data = new FormData(e.target);
    const name = data.get("name").trim();
    const url = data.get("url").trim();
    const desc = data.get("desc").trim();
    const avatarFile = e.target.querySelector("#friend-add-avatar-file");
    const avatar = avatarFile?.dataset.pendingAvatar;
    if (!name || !avatar) return showToast("好友信息不完整");
    let blogUrl;
    try { blogUrl = new URL(url); } catch { return showToast("信息不正确"); }
    if (!["http:", "https:"].includes(blogUrl.protocol)) return showToast("信息不正确");
    if (store.friends.some(friend => friend.name.toLowerCase() === name.toLowerCase() || (friend.url && friend.url.toLowerCase() === blogUrl.href.toLowerCase()))) return showToast("好友名称或网址已存在");
    store.friends.push({ name, url: blogUrl.href, avatar, desc });
    save();
    closeModal();
    setPage("friends");
    showToast("好友添加成功");
  }
  if (e.target.id === "announcement-form") {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    const data = new FormData(e.target);
    const title = data.get("title").trim();
    const body = data.get("body").trim();
    if (!title || !body) return showToast("公告不存在");
    store.announcement = {
      title,
      body,
      version: (store.announcement?.version || 0) + 1,
      updatedAt: new Date().toISOString()
    };
    save();
    closeModal();
    setPage("announcement");
    showToast("公告保存成功");
  }
  if (e.target.id === "co-create-form") {
    const data = new FormData(e.target);
    const coCreateId = Number(data.get("coCreateId"));
    const paragraphIndex = Number(data.get("paragraphIndex"));
    const applicant = data.get("applicant").trim();
    const proposedText = data.get("proposedText").trim();
    const article = store.coCreateArticles.find(item => item.id === coCreateId);
    if (!article) return showToast("共创内容不存在");
    if (!applicant || !Number.isInteger(paragraphIndex) || !article.body[paragraphIndex] || !proposedText) return showToast("修改内容不完整");
    if (store.coCreationRequests.some(request => request.coCreateId === coCreateId && request.paragraphIndex === paragraphIndex && request.applicant.toLowerCase() === applicant.toLowerCase() && request.status === "pending")) return showToast("你已有相同段落的待审核申请");
    const originalText = article.body[paragraphIndex];
    if (originalText === proposedText) return showToast("文章未被修改");
    const createdAt = new Date().toISOString();
    store.coCreationRequests.unshift({
      id: Date.now(),
      coCreateId,
      paragraphIndex,
      originalText,
      proposedText,
      diff: { removed: originalText, added: proposedText },
      applicant,
      createdAt,
      status: "pending",
      reviewedAt: null,
      reviewedBy: null,
      reviewResult: null
    });
    store.auditLogs.push({ action: "co-create-submitted", coCreateId: coCreateId, at: createdAt, operator: applicant });
    save();
    closeModal();
    setPage(`co-create-${coCreateId}`);
    modal("申请成功", `<p class="confirm-copy">你的修改申请已提交，等待管理员审核。</p><div class="modal-actions"><button class="button button-primary" data-close>返回共创内容</button></div>`);
  }
  if (e.target.id === "co-create-publish-form") {
    if (!isAdmin()) return showToast("请先登录管理员账户");
    const data = new FormData(e.target);
    const title = data.get("title").trim();
    const body = data.get("body").trim();
    if (!title || !body) return showToast("共创内容不完整");
    const now = new Date().toISOString();
    const mediaInput = e.target.querySelector("#co-create-media");
    store.coCreateArticles.unshift({
      id: Date.now(),
      title,
      body: body.split(/\r?\n/).map(paragraph => paragraph.trim()).filter(Boolean),
      media: mediaInput?.dataset.pendingMedia ? JSON.parse(mediaInput.dataset.pendingMedia) : [],
      createdAt: now,
      updatedAt: now
    });
    store.auditLogs.push({ action: "co-create-published", coCreateId: store.coCreateArticles[0].id, at: now, operator: "管理员" });
    save();
    closeModal();
    setPage("co-create");
    showToast("共创内容发布成功");
  }
});
document.addEventListener("input", e => { if (e.target.id === "article-search") { const q = e.target.value.trim(); history.replaceState({}, "", q ? `#archive?q=${encodeURIComponent(q)}` : "#archive"); render(); } });
document.addEventListener("click", e => { if (e.target.id === "guestbook-form") return; });
window.addEventListener("hashchange", () => { const hash = location.hash.slice(1) || "home"; currentPage = hash.split("?")[0]; render(); });
document.addEventListener("DOMContentLoaded", () => { render(); initDesktopPet(); });
