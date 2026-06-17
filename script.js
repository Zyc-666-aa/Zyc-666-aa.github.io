const PROJECTS = [
  {
    id: "haojing",
    index: "01",
    title: "濠鏡新紋",
    label: "CULTURAL PRODUCT / MACAU VISUAL SYSTEM",
    summary: "以澳门城市意象、莲花、海浪和装饰纹样为视觉核心，建立一套偏东方装饰感的文创视觉系统，并延展到海报、书签、徽章、包装和产品应用。",
    kind: "design",
    images: [
      ["./haojing-01.jpg", "主视觉海报"],
      ["./haojing-02.jpg", "书签应用"],
      ["./haojing-03.jpg", "珐琅徽章"],
      ["./haojing-04.jpg", "手机壁纸"],
      ["./haojing-05.jpg", "礼盒包装"],
      ["./haojing-06.jpg", "帆布袋综合应用"],
      ["./haojing-07.jpg", "纹样符号系统"],
      ["./haojing-08.jpg", "连续纹样规范"],
      ["./haojing-09.jpg", "产品落地应用"],
    ],
  },
  {
    id: "lingnan",
    index: "02",
    title: "岭南山水",
    label: "FASHION METHOD / LINGNAN LANDSCAPE",
    summary: "从岭南山水的水墨层次、留白关系和地域气质出发，转译为服装调研、面辅料、立裁人台与效果图表达，呈现服装设计方法课的完整过程。",
    kind: "fashion",
    images: [
      ["./lingnan-cover.jpg", "封面"],
      ["./lingnan-theme.jpg", "主题灵感"],
      ["./lingnan-mannequin.jpg", "人台造型"],
      ["./lingnan-rendering.jpg", "效果图"],
      ["./lingnan-fabric.jpg", "面辅料"],
    ],
  },
  {
    id: "landao",
    index: "03",
    title: "浪道",
    label: "MENSWEAR COLLECTION / WATER COLOR SYSTEM",
    summary: "男装系列以海浪、工装和户外叙事为基底，强调蓝白水彩层次、廓形实验和成衣展示，在柔和水色与功能结构之间建立系列统一感。",
    kind: "fashion",
    images: Array.from({ length: 10 }, (_, index) => [
      `./landao-${String(index + 1).padStart(2, "0")}.jpg`,
      `浪道 ${String(index + 1).padStart(2, "0")}`,
    ]),
  },
  {
    id: "lychee",
    index: "04",
    title: "一枚荔枝里的岭南",
    label: "CULTURAL POSTER SERIES / LINGNAN STORYTELLING",
    summary: "以苏轼诗句、荔枝、岭南城市记忆和粤港澳大湾区意象为线索，将传统诗意、地方风物和当代城市连接起来，形成一组偏文旅叙事的竖版海报。",
    kind: "design",
    images: Array.from({ length: 6 }, (_, index) => [
      `./lychee-${String(index + 1).padStart(2, "0")}.png`,
      `海报 ${String(index + 1).padStart(2, "0")}`,
    ]),
  },
  {
    id: "beiyao",
    index: "05",
    title: "贝曜",
    label: "FASHION COLLECTION / MATERIAL STUDY",
    summary: "以贝壳、珠光、柔性褶皱和浅色礼服结构为视觉核心，整理成封面、主题、灵感、色彩、面料和款式展板，重点展示服装系列从氛围到材料的推导过程。",
    kind: "fashion",
    images: [
      ["./beiyao-cover.jpg", "封面"],
      ["./beiyao-theme.jpg", "主题"],
      ["./beiyao-inspiration.jpg", "灵感版"],
      ["./beiyao-color.jpg", "色彩版"],
      ["./beiyao-fabric.jpg", "面料版"],
      ["./beiyao-style.jpg", "款式版"],
    ],
  },
];

const PPT_PROJECTS = [
  {
    id: "zhilian-liyuan",
    index: "06",
    title: "智链梨园数字传承",
    label: "PDF DECK / AI HERITAGE EDUCATION",
    summary: "基于 Unity 与 AI 的中小学粤剧数字化传承教学系统汇报材料，围绕非遗教育、数字交互和系统化教学方案组织页面，适合作为完整项目提案展示。",
    kind: "ppt",
    images: Array.from({ length: 14 }, (_, index) => [
      `./zhilian-liyuan-${String(index + 1).padStart(2, "0")}.jpg`,
      `页面 ${String(index + 1).padStart(2, "0")}`,
    ]),
  },
  {
    id: "strata-ppt",
    index: "07",
    title: "Strata 结课汇报PPT",
    label: "PPT DECK / FASHION FINAL PRESENTATION",
    summary: "城市街头机能风格男装系列结课汇报，展示从风格定位、视觉系统、面料工艺到成衣方案的完整汇报版式，强化 Strata 系列的品牌化表达。",
    kind: "ppt",
    images: Array.from({ length: 7 }, (_, index) => [
      `./strata-ppt-${String(index + 1).padStart(2, "0")}.jpg`,
      `页面 ${String(index + 1).padStart(2, "0")}`,
    ]),
  },
  {
    id: "ppt-case-ipo",
    index: "08",
    title: "IPO 解决方案",
    label: "PPT COMMISSION / FINANCE PRESENTATION",
    summary: "面向商业汇报的金融类 PPT 视觉方案，强调版式秩序、信息层级和专业可信的图文组织，属于接单型商务文档案例。",
    kind: "ppt",
    images: Array.from({ length: 1 }, (_, index) => [
      `./ppt-case-ipo-slide-${String(index + 1).padStart(2, "0")}.jpg`,
      `页面 ${String(index + 1).padStart(2, "0")}`,
    ]),
  },
  {
    id: "ppt-case-opera",
    index: "09",
    title: "Peking Opera Decoded",
    label: "PPT COMMISSION / CULTURE STORYTELLING",
    summary: "京剧主题文化讲解型 PPT，偏叙事长图结构，用强视觉主题统领知识内容与段落节奏，兼顾课堂展示和视觉吸引力。",
    kind: "ppt",
    images: Array.from({ length: 10 }, (_, index) => [
      `./ppt-case-opera-slide-${String(index + 1).padStart(2, "0")}.jpg`,
      `页面 ${String(index + 1).padStart(2, "0")}`,
    ]),
  },
  {
    id: "ppt-case-literature",
    index: "10",
    title: "Stray Dog Redemption",
    label: "PPT COMMISSION / LITERATURE ANALYSIS",
    summary: "文学与动漫主题分析型 PPT，使用暗色叙事、图像拼贴和长页结构组织复杂内容，让内容分析更有情绪和段落推进感。",
    kind: "ppt",
    images: Array.from({ length: 9 }, (_, index) => [
      `./ppt-case-literature-slide-${String(index + 1).padStart(2, "0")}.jpg`,
      `页面 ${String(index + 1).padStart(2, "0")}`,
    ]),
  },
  {
    id: "ppt-case-youth",
    index: "11",
    title: "青春担当向未来",
    label: "PPT COMMISSION / CAMPUS PRESENTATION",
    summary: "校园主题汇报 PPT，采用清爽图文排布与情绪化场景图，强化主题演讲的节奏感，适合班会、汇报与主题展示场景。",
    kind: "ppt",
    images: Array.from({ length: 5 }, (_, index) => [
      `./ppt-case-youth-slide-${String(index + 1).padStart(2, "0")}.jpg`,
      `页面 ${String(index + 1).padStart(2, "0")}`,
    ]),
  },
  {
    id: "ppt-case-strategy",
    index: "12",
    title: "市场策略汇报",
    label: "PPT COMMISSION / STRATEGY REPORT",
    summary: "策略型商业汇报页面，处理数据、结构说明和阶段规划，突出信息清晰度与可读性，重点展示商业信息的整理能力。",
    kind: "ppt",
    images: Array.from({ length: 2 }, (_, index) => [
      `./ppt-case-strategy-slide-${String(index + 1).padStart(2, "0")}.jpg`,
      `页面 ${String(index + 1).padStart(2, "0")}`,
    ]),
  },
  {
    id: "ppt-case-legacy",
    index: "13",
    title: "Henry Lee Legacy",
    label: "PPT COMMISSION / BIOGRAPHY DECK",
    summary: "人物主题叙事 PPT，使用深色视觉线索与分段式长页内容组织人物经历、观点和影响力，适合演讲与课堂展示。",
    kind: "ppt",
    images: Array.from({ length: 12 }, (_, index) => [
      `./ppt-case-legacy-slide-${String(index + 1).padStart(2, "0")}.jpg`,
      `页面 ${String(index + 1).padStart(2, "0")}`,
    ]),
  },
];

const ALL_PROJECTS = [...PROJECTS, ...PPT_PROJECTS];

const navLinks = [...document.querySelectorAll(".nav-links a")];
const sectionTargets = navLinks
  .map((link) => [link.getAttribute("href"), document.querySelector(link.getAttribute("href"))])
  .filter(([, section]) => section);
const sectionByHref = new Map(navLinks.map((link) => [link.getAttribute("href"), link]));

function updateActiveLink() {
  const marker = window.scrollY + window.innerHeight * 0.42;
  let currentHref = "#top";
  for (const [href, section] of sectionTargets) {
    if (section.offsetTop <= marker) currentHref = href;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) currentHref = "#contact";
  navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === currentHref));
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  window.requestAnimationFrame(() => {
    updateActiveLink();
    ticking = false;
  });
  ticking = true;
});
updateActiveLink();

function alignHashSection() {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (!target) return;
  const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height || 0;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({ top: Math.max(0, targetTop), behavior: "auto" });
  updateActiveLink();
}

window.addEventListener("load", () => {
  window.setTimeout(alignHashSection, 80);
});
window.addEventListener("hashchange", () => {
  window.setTimeout(alignHashSection, 20);
});
navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#") || !document.querySelector(href)) return;
    event.preventDefault();
    window.history.pushState(null, "", href);
    alignHashSection();
  });
});
window.addEventListener("popstate", () => {
  window.setTimeout(alignHashSection, 20);
});

const projectList = document.querySelector("[data-project-list]");
const pptList = document.querySelector("[data-ppt-list]");
const projectViewer = document.querySelector("[data-project-viewer]");
const projectViewerIndex = document.querySelector("[data-project-viewer-index]");
const projectViewerLabel = document.querySelector("[data-project-viewer-label]");
const projectViewerTitle = document.querySelector("[data-project-viewer-title]");
const projectViewerSummary = document.querySelector("[data-project-viewer-summary]");
const projectViewerImage = document.querySelector("[data-project-viewer-image]");
const projectViewerCaption = document.querySelector("[data-project-viewer-caption]");
const projectViewerCount = document.querySelector("[data-project-viewer-count]");
const projectViewerThumbs = document.querySelector("[data-project-viewer-thumbs]");
let activeProjectIndex = -1;
let activeProjectImageIndex = 0;

function renderProjects() {
  if (!projectList) return;
  projectList.textContent = "";
  PROJECTS.forEach((project, index) => {
    const row = document.createElement("button");
    row.className = "project-row";
    row.type = "button";
    row.dataset.projectTitle = project.title;
    row.setAttribute("aria-haspopup", "dialog");
    const previewImages = project.images
      .slice(0, 3)
      .map(([src, caption]) => `<img src="${src}" alt="${project.title} ${caption}" loading="lazy" decoding="async" />`)
      .join("");
    row.innerHTML = `
      <span class="project-number">${project.index}</span>
      <span class="project-copy">
        <span class="project-tag">OPEN PROJECT</span>
        <h2>${project.title}</h2>
        <p>${project.label}</p>
        <em>${String(project.images.length).padStart(2, "0")} IMAGES / CLICK TO VIEW</em>
      </span>
      <figure class="project-thumb">
        <img src="${project.images[0][0]}" alt="${project.title}" loading="lazy" decoding="async" />
        <span class="project-preview-strip" aria-hidden="true">${previewImages}</span>
      </figure>
    `;
    row.addEventListener("click", () => openProjectViewer(index));
    projectList.append(row);
  });
}

function renderPptProjects() {
  if (!pptList) return;
  pptList.textContent = "";
  PPT_PROJECTS.forEach((project, index) => {
    const card = document.createElement("button");
    card.className = "deck-card";
    card.type = "button";
    card.setAttribute("aria-haspopup", "dialog");
    const pageLabel = project.images.length === 1 ? "01 PAGE" : `${String(project.images.length).padStart(2, "0")} PAGES`;
    card.innerHTML = `
      <div class="deck-card-copy">
        <span>${project.index}</span>
        <div>
          <h2>${project.title}</h2>
          <p>${project.label}</p>
        </div>
        <span>${pageLabel}</span>
      </div>
      <figure>
        <img src="${project.images[0][0]}" alt="${project.title}" loading="lazy" decoding="async" />
        <figcaption>COVER / SLIDE 01</figcaption>
      </figure>
    `;
    card.addEventListener("click", () => openProjectViewer(PROJECTS.length + index));
    pptList.append(card);
  });
}

function setProjectViewerImage(imageIndex) {
  const project = ALL_PROJECTS[activeProjectIndex];
  if (!project || !projectViewerImage) return;
  activeProjectImageIndex = (imageIndex + project.images.length) % project.images.length;
  const [src, caption] = project.images[activeProjectImageIndex];
  projectViewerImage.src = src;
  projectViewerImage.alt = `${project.title} ${caption}`;
  projectViewerCaption.textContent = caption;
  projectViewerCount.textContent = `${String(activeProjectImageIndex + 1).padStart(2, "0")} / ${String(project.images.length).padStart(2, "0")}`;
  projectViewerThumbs
    .querySelectorAll(".project-thumb-button")
    .forEach((button, index) => button.classList.toggle("is-active", index === activeProjectImageIndex));
}

function renderProjectThumbs(project) {
  projectViewerThumbs.textContent = "";
  project.images.forEach(([src, caption], index) => {
    const button = document.createElement("button");
    button.className = "project-thumb-button";
    button.type = "button";
    button.innerHTML = `<img src="${src}" alt="${project.title} ${caption}" loading="eager" decoding="async" /><span>${caption}</span>`;
    button.addEventListener("click", () => setProjectViewerImage(index));
    projectViewerThumbs.append(button);
  });
}

function openProjectViewer(projectIndex) {
  const project = ALL_PROJECTS[projectIndex];
  if (!project || !projectViewer) return;
  activeProjectIndex = projectIndex;
  activeProjectImageIndex = 0;
  projectViewerIndex.textContent = project.index;
  projectViewerLabel.textContent = project.label;
  projectViewerTitle.textContent = project.title;
  projectViewerSummary.textContent = project.summary;
  renderProjectThumbs(project);
  setProjectViewerImage(0);
  projectViewer.hidden = false;
  document.body.style.overflow = "hidden";
  document.querySelector("[data-project-viewer-close]")?.focus({ preventScroll: true });
}

function closeProjectViewer() {
  if (!projectViewer) return;
  projectViewer.hidden = true;
  activeProjectIndex = -1;
  document.body.style.overflow = "";
}

function stepProject(delta) {
  if (!ALL_PROJECTS.length) return;
  const nextIndex = activeProjectIndex < 0 ? 0 : (activeProjectIndex + delta + ALL_PROJECTS.length) % ALL_PROJECTS.length;
  openProjectViewer(nextIndex);
}

document.querySelector("[data-project-viewer-close]")?.addEventListener("click", closeProjectViewer);
document.querySelector("[data-project-viewer-prev]")?.addEventListener("click", () => stepProject(-1));
document.querySelector("[data-project-viewer-next]")?.addEventListener("click", () => stepProject(1));
projectViewer?.addEventListener("click", (event) => {
  if (event.target === projectViewer) closeProjectViewer();
});

const galleryRoot = document.querySelector("[data-gallery]");
const flatGalleryItems = [];
function renderGallery() {
  if (!galleryRoot) return;
  galleryRoot.textContent = "";
  flatGalleryItems.length = 0;
  document.querySelector("[data-gallery-count]").textContent = `ALL IMAGES / ${ALL_PROJECTS.reduce((sum, project) => sum + project.images.length, 0)} ITEMS`;
  ALL_PROJECTS.forEach((project) => {
    const article = document.createElement("article");
    article.className = "gallery-category";
    article.innerHTML = `
      <div class="gallery-category-head">
        <h3>${project.title}</h3>
        <span class="gallery-count">${String(project.images.length).padStart(2, "0")}</span>
      </div>
      <div class="gallery-grid"></div>
    `;
    const grid = article.querySelector(".gallery-grid");
    project.images.forEach(([src, caption]) => {
      const item = { src, caption, projectTitle: project.title };
      flatGalleryItems.push(item);
      const card = document.createElement("button");
      card.className = "gallery-card";
      card.type = "button";
      card.innerHTML = `<span><img src="${src}" alt="${project.title} ${caption}" loading="lazy" decoding="async" /></span><figcaption>${caption}</figcaption>`;
      card.addEventListener("click", () => openLightbox(flatGalleryItems.indexOf(item)));
      grid.append(card);
    });
    galleryRoot.append(article);
  });
}

const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxTitle = document.querySelector("[data-lightbox-title]");
const lightboxMeta = document.querySelector("[data-lightbox-meta]");
let activeGalleryIndex = -1;
function openLightbox(index) {
  if (!lightbox || !flatGalleryItems[index]) return;
  activeGalleryIndex = index;
  const item = flatGalleryItems[index];
  lightboxImage.src = item.src;
  lightboxImage.alt = `${item.projectTitle} ${item.caption}`;
  lightboxTitle.textContent = item.caption;
  lightboxMeta.textContent = `${item.projectTitle} / ${index + 1} of ${flatGalleryItems.length}`;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.style.overflow = "";
}
document.querySelector("[data-lightbox-close]")?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

window.addEventListener("keydown", (event) => {
  if (projectViewer && !projectViewer.hidden) {
    if (event.key === "Escape") closeProjectViewer();
    if (event.key === "ArrowLeft") setProjectViewerImage(activeProjectImageIndex - 1);
    if (event.key === "ArrowRight") setProjectViewerImage(activeProjectImageIndex + 1);
    return;
  }
  if (lightbox && !lightbox.hidden && event.key === "Escape") closeLightbox();
});

renderProjects();
renderPptProjects();
renderGallery();
