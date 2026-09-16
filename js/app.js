/* ======================================================================
   راهِ حفظ — منطق برنامه
   تمام داده‌ها فقط در همین مرورگر/گوشی (localStorage) ذخیره می‌شود.
   ====================================================================== */

/* ================= نورا — کاراکتر همراه (ستاره‌ی نورانی) ================= */
function MASCOT_SVG(size) {
  size = size || 120;
  return `
  <svg class="mascot-svg" width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="mascotGlowGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#E7B84E" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#E7B84E" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="mascotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F6DFA0"/>
        <stop offset="55%" stop-color="#E7B84E"/>
        <stop offset="100%" stop-color="#C9932E"/>
      </linearGradient>
    </defs>
    <g class="mascot-wrap">
      <circle class="mascot-aura" cx="100" cy="100" r="88" fill="url(#mascotGlowGrad)"/>
      <g class="mascot-float">
        <g class="mascot-star-shape">
          <polygon fill="url(#mascotBodyGrad)" stroke="#C9932E" stroke-width="2" stroke-linejoin="round"
            points="100,0 122,40 164,24 160,70 200,86 170,116 188,156 144,148 130,190 100,160 70,190 56,148 12,156 30,116 0,86 40,70 36,24 78,40"/>
        </g>
        <ellipse cx="72" cy="112" rx="9" ry="5" fill="#F08A9B" opacity="0.4"/>
        <ellipse cx="128" cy="112" rx="9" ry="5" fill="#F08A9B" opacity="0.4"/>
        <ellipse class="mascot-eye mascot-eye-l" cx="82" cy="96" rx="6" ry="7" fill="#2A1E08"/>
        <ellipse class="mascot-eye mascot-eye-r" cx="118" cy="96" rx="6" ry="7" fill="#2A1E08"/>
        <path d="M84,116 Q100,128 116,116" stroke="#2A1E08" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      </g>
      <g class="mascot-sparkles">
        <circle cx="26" cy="50" r="4" fill="#9AF0E1"/>
        <circle cx="176" cy="66" r="3" fill="#F6DFA0"/>
        <circle cx="150" cy="176" r="3.5" fill="#9AF0E1"/>
      </g>
    </g>
  </svg>`;
}

function mountMascots() {
  const splashEl = document.getElementById("splash-mascot");
  if (splashEl) splashEl.innerHTML = MASCOT_SVG(150);
  const menuEl = document.getElementById("menu-mascot");
  if (menuEl) menuEl.innerHTML = MASCOT_SVG(68);
}

/* ================= جلوه‌ی موج (ripple) روی دکمه‌ها و کارت‌ها ================= */
document.addEventListener("click", function (e) {
  const el = e.target.closest(".btn, .menu-card, .lesson-card, .chip, .icon-btn");
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const ripple = document.createElement("span");
  const size = Math.max(rect.width, rect.height) * 1.2;
  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
  ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
  const prevPos = getComputedStyle(el).position;
  if (prevPos === "static") el.style.position = "relative";
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

const STORAGE_KEY = "qhifz_state_v1";
const REVIEW_INTERVALS = [1, 3, 7, 16, 35, 90]; // روزهای فاصله‌ی مرور (شبیه یادگیری فاصله‌دار)

const LEVEL_TARGETS = { beginner: 3, intermediate: 8, advanced: 15 };

function defaultState() {
  return {
    name: "",
    fontSize: 22,
    level: "beginner",
    dailyTarget: 5,
    progress: {},      // { [surahId]: {memorizedAyahs, status, reviewStage, nextReview, lastReviewed} }
    activityDates: [],
    lessonsCompleted: [],
    focusSessions: 0,
    achievements: [],
    createdAt: todayStr()
  };
}

function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed);
  } catch (e) {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

/* ---------------- ناوبری بین صفحات ---------------- */
function goTo(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("page-" + pageId).classList.add("active");
  document.querySelectorAll(".tab-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.page === pageId);
  });
  if (pageId === "dashboard") renderDashboard();
  if (pageId === "surahs") renderSurahList();
  if (pageId === "plan") renderPlan();
  if (pageId === "review") renderReviewList();
  if (pageId === "settings") renderSettings();
  if (pageId === "hifzhome") renderHifzWizard();
  if (pageId === "recite") initReciteLab();
  if (pageId === "tilawat") initTilawat();
  if (pageId === "hadith") renderHadiths();
}

/* ---------------- کمکی‌های پیشرفت ---------------- */
function getProgress(id) {
  return state.progress[id] || { memorizedAyahs: 0, status: "none", reviewStage: -1, nextReview: null, lastReviewed: null };
}

function totalMemorizedAyahs() {
  let sum = 0;
  for (const s of SURAHS) {
    const p = getProgress(s.id);
    sum += p.status === "done" ? s.ayahs : (p.memorizedAyahs || 0);
  }
  return sum;
}

function countDoneSurahs() {
  return SURAHS.filter(s => getProgress(s.id).status === "done").length;
}

function markActivityToday() {
  const t = todayStr();
  if (!state.activityDates.includes(t)) state.activityDates.push(t);
}

function computeStreak() {
  const set = new Set(state.activityDates);
  let streak = 0;
  let cursor = 0;
  while (set.has(todayStr(-cursor))) {
    streak++;
    cursor++;
  }
  return streak;
}

function setSurahProgress(id, memorizedAyahs, status) {
  const surah = SURAHS.find(s => s.id === id);
  const prev = getProgress(id);
  const nextCount = Math.max(0, Math.min(memorizedAyahs, surah.ayahs));
  const entry = { memorizedAyahs: nextCount, status, reviewStage: prev.reviewStage, nextReview: prev.nextReview, lastReviewed: prev.lastReviewed, lastActivity: todayStr(), todayAyahs: (prev.lastActivity===todayStr()?Number(prev.todayAyahs||0):0) + Math.max(0, nextCount-Number(prev.memorizedAyahs||0)) };
  if (status === "done" && prev.status !== "done") {
    entry.reviewStage = 0;
    entry.nextReview = todayStr(REVIEW_INTERVALS[0]);
    entry.lastReviewed = todayStr();
    entry.memorizedAyahs = surah.ayahs;
  }
  if (status !== "done") {
    entry.reviewStage = -1;
    entry.nextReview = null;
  }
  state.progress[id] = entry;
  markActivityToday();
  saveState();
}

function advanceReview(id) {
  const p = getProgress(id);
  const nextStage = Math.min(p.reviewStage + 1, REVIEW_INTERVALS.length - 1);
  p.reviewStage = nextStage;
  p.lastReviewed = todayStr();
  p.nextReview = todayStr(REVIEW_INTERVALS[nextStage]);
  state.progress[id] = p;
  markActivityToday();
  saveState();
  renderReviewList();
  renderDashboard();
}

/* ================= داشبورد ================= */
function renderDashboard() {
  const pct = Math.round((totalMemorizedAyahs() / TOTAL_AYAHS) * 100);
  document.getElementById("star-fill").style.setProperty("--pct", pct);
  document.getElementById("dash-pct").textContent = toFa(pct) + "٪";
  document.getElementById("stat-streak").textContent = toFa(computeStreak());
  document.getElementById("stat-memorized").textContent = toFa(totalMemorizedAyahs());
  document.getElementById("stat-surahs").textContent = toFa(countDoneSurahs());

  const target = state.dailyTarget || LEVEL_TARGETS[state.level] || 5;
  document.getElementById("dash-goal-text").textContent =
    `هدف شما: ${toFa(target)} آیه در روز — تا این لحظه ${toFa(totalMemorizedAyahs())} آیه از ${toFa(TOTAL_AYAHS)} آیه‌ی قرآن را حفظ کرده‌اید.`;

  // ادامه‌ی حفظ: اولین سوره‌ی «در حال حفظ»
  const inProgress = SURAHS.find(s => getProgress(s.id).status === "progress");
  const cBody = document.getElementById("dash-continue-body");
  if (inProgress) {
    const p = getProgress(inProgress.id);
    cBody.innerHTML = `
      <div class="surah-item" onclick="openSurahModal(${inProgress.id})" style="border:none;padding:0;">
        <div class="surah-num"><span>${toFa(inProgress.id)}</span></div>
        <div class="surah-info">
          <div class="name-row"><span class="fa-name">${inProgress.fa}</span><span class="ar-name">${inProgress.ar}</span></div>
          <div class="meta">${toFa(p.memorizedAyahs)} از ${toFa(inProgress.ayahs)} آیه</div>
          <div class="progress-track"><div class="progress-fill" style="width:${(p.memorizedAyahs/inProgress.ayahs)*100}%"></div></div>
        </div>
      </div>`;
  } else {
    cBody.innerHTML = `<div class="empty" style="padding:6px 0;"><div class="mascot-wrap">${MASCOT_SVG(44)}</div>هنوز سوره‌ای را شروع نکرده‌اید. از تب «سوره‌ها» شروع کنید.</div>`;
  }

  // مرور امروز
  const due = SURAHS
    .filter(s => getProgress(s.id).status === "done" && getProgress(s.id).nextReview <= todayStr())
    .slice(0, 3);
  const rBody = document.getElementById("dash-review-body");
  if (due.length) {
    rBody.innerHTML = due.map(s => `
      <div class="review-item">
        <div>
          <div class="fa-name" style="font-weight:700;">${s.fa} <span class="ar-name">${s.ar}</span></div>
          <div class="due today">امروز</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="advanceReview(${s.id})">مرور شد</button>
      </div>`).join("");
  } else {
    rBody.innerHTML = `<div class="empty" style="padding:6px 0;">امروز مروری برایتان زمان‌بندی نشده 🌙</div>`;
  }
  renderSmartLayer();
}

/* ================= فهرست سوره‌ها ================= */
function renderSurahList() {
  const q = (document.getElementById("surah-search").value || "").trim();
  const list = document.getElementById("surah-list");
  const filtered = SURAHS.filter(s => !q || s.fa.includes(q) || s.ar.includes(q) || String(s.id).includes(q));
  list.innerHTML = filtered.map((s, idx) => {
    const p = getProgress(s.id);
    const dotClass = p.status === "done" ? "done" : p.status === "progress" ? "progress" : "none";
    const pctW = p.status === "done" ? 100 : Math.round((p.memorizedAyahs / s.ayahs) * 100);
    return `
      <div class="surah-item" style="animation-delay:${Math.min(idx * 30, 400)}ms" onclick="openSurahModal(${s.id})">
        <div class="surah-num"><span>${toFa(s.id)}</span></div>
        <div class="surah-info">
          <div class="name-row">
            <span class="fa-name"><span class="status-dot ${dotClass}" style="display:inline-block;margin-left:6px;"></span>${s.fa}</span>
            <span class="ar-name">${s.ar}</span>
          </div>
          <div class="meta">${toFa(s.ayahs)} آیه · ${s.type}</div>
          <div class="progress-track"><div class="progress-fill" style="width:${pctW}%"></div></div>
        </div>
      </div>`;
  }).join("") || `<div class="empty">سوره‌ای یافت نشد</div>`;
}

function openSurahModal(id) {
  const s = SURAHS.find(x => x.id === id);
  const p = getProgress(id);
  const body = document.getElementById("surah-modal-body");
  body.innerHTML = `
    <h3>${s.fa} <span class="ar-name">${s.ar}</span></h3>
    <p style="font-size:12.5px;color:var(--parchment-dim);margin:-6px 0 16px;">${toFa(s.ayahs)} آیه · ${s.type}</p>
    <div class="field">
      <label>تا آیه‌ی شماره‌ی حفظ‌شده</label>
      <input type="number" id="modal-ayah" min="0" max="${s.ayahs}" value="${p.memorizedAyahs || 0}">
    </div>
    <div class="field">
      <label>وضعیت</label>
      <select id="modal-status">
        <option value="none" ${p.status === "none" ? "selected" : ""}>شروع نشده</option>
        <option value="progress" ${p.status === "progress" ? "selected" : ""}>در حال حفظ</option>
        <option value="done" ${p.status === "done" ? "selected" : ""}>حفظ کامل</option>
      </select>
    </div>
    ${p.status === "done" ? `<p style="font-size:12px;color:var(--gold-soft);">مرور بعدی: ${p.nextReview}</p>` : ""}
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeSurahModal()">انصراف</button>
      <button class="btn btn-primary" onclick="saveSurahModal(${id})">ذخیره</button>
    </div>
    <div style="margin-top:16px;border-top:1px solid var(--line);padding-top:14px;">
      <button class="btn btn-ghost" id="load-text-btn" onclick="loadAyahText(${id})">📖 نمایش متن و ترجمه‌ی سوره</button>
      <div id="ayah-text-box" style="margin-top:12px;max-height:260px;overflow-y:auto;"></div>
    </div>`;
  document.getElementById("surah-modal").classList.add("active");
}
function closeSurahModal() {
  document.getElementById("surah-modal").classList.remove("active");
}
function saveSurahModal(id) {
  const ayah = parseInt(document.getElementById("modal-ayah").value || "0", 10);
  const status = document.getElementById("modal-status").value;
  setSurahProgress(id, ayah, status);
  closeSurahModal();
  renderSurahList();
  renderDashboard();
}

/* ================= نمایش متن آیات (زنده از اینترنت) ================= */
async function loadAyahText(id) {
  const btn = document.getElementById("load-text-btn");
  const box = document.getElementById("ayah-text-box");
  btn.textContent = "در حال بارگذاری…";
  btn.disabled = true;
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,fa.makarem`);
    if (!res.ok) throw new Error("network");
    const json = await res.json();
    const arabic = json.data[0].ayahs;
    const farsi = json.data[1] ? json.data[1].ayahs : [];
    box.innerHTML = arabic.map((a, i) => `
      <div style="padding:10px 0;border-bottom:1px solid var(--line);">
        <div style="font-family:var(--font-display);font-size:${state.fontSize || 22}px;line-height:2.1;color:var(--parchment);text-align:right;">
          ${a.text} <span style="color:var(--gold-soft);font-size:14px;">(${toFa(a.numberInSurah)})</span>
        </div>
        ${farsi[i] ? `<div style="font-size:13px;color:var(--parchment-dim);margin-top:6px;line-height:1.9;">${farsi[i].text}</div>` : ""}
      </div>`).join("");
    btn.style.display = "none";
  } catch (e) {
    box.innerHTML = `<div class="empty" style="padding:10px 0;">
      متن سوره بارگذاری نشد. لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.
    </div>`;
    btn.textContent = "📖 تلاش دوباره";
    btn.disabled = false;
  }
}

/* ================= ماژول «شروع یادگیری» ================= */
function renderLearnList() {
  const done = state.lessonsCompleted || [];
  const pctDone = Math.round((done.length / LESSONS.length) * 100);
  document.getElementById("learn-progress-fill").style.width = pctDone + "%";
  document.getElementById("learn-progress-text").textContent = `${toFa(done.length)} از ${toFa(LESSONS.length)} درس کامل شد`;

  const list = document.getElementById("lesson-list");
  list.innerHTML = LESSONS.map((lesson, idx) => {
    const isDone = done.includes(lesson.id);
    const prevDone = idx === 0 || done.includes(LESSONS[idx - 1].id);
    const locked = !prevDone && !isDone;
    return `
      <div class="lesson-card ${locked ? "locked" : ""}" onclick="${locked ? "" : `openLesson(${lesson.id})`}">
        <div class="l-icon">${locked ? "🔒" : lesson.icon}</div>
        <div style="flex:1;">
          <div class="l-title">${toFa(lesson.id)}. ${lesson.title}</div>
          <div class="l-status">${isDone ? "تکمیل‌شده ✓" : locked ? "قفل — ابتدا درس قبلی را تمام کنید" : "آماده‌ی شروع"}</div>
        </div>
        ${isDone ? '<div class="l-check">✓</div>' : ""}
      </div>`;
  }).join("");
}

let currentLessonAnswers = {};

function openLesson(id) {
  const lesson = LESSONS.find(l => l.id === id);
  currentLessonAnswers = {};
  document.getElementById("lesson-view-title").textContent = `درس ${toFa(id)}`;
  const body = document.getElementById("lesson-view-body");
  body.innerHTML = `
    <div class="card">
      <h2>${lesson.title}</h2>
      ${lesson.content}
      <div class="quiz-block">
        <p class="eyebrow">تمرین کوتاه</p>
        ${lesson.quiz.map((q, qi) => `
          <div class="quiz-q">
            <p>${qi + 1}. ${q.q}</p>
            ${q.options.map((opt, oi) => `
              <button class="quiz-opt" onclick="selectQuizOption(${id},${qi},${oi})" id="opt-${id}-${qi}-${oi}">${opt}</button>
            `).join("")}
          </div>`).join("")}
        <div id="quiz-feedback-${id}"></div>
        <button class="btn btn-primary" onclick="checkQuiz(${id})" style="margin-top:6px;">بررسی پاسخ‌ها</button>
      </div>
    </div>`;
  showScreen("learn-lesson");
}

function selectQuizOption(lessonId, qIndex, oIndex) {
  currentLessonAnswers[qIndex] = oIndex;
  const lesson = LESSONS.find(l => l.id === lessonId);
  lesson.quiz[qIndex].options.forEach((_, oi) => {
    document.getElementById(`opt-${lessonId}-${qIndex}-${oi}`).classList.toggle("selected", oi === oIndex);
  });
}

function checkQuiz(lessonId) {
  const lesson = LESSONS.find(l => l.id === lessonId);
  let allCorrect = true;
  lesson.quiz.forEach((q, qi) => {
    const chosen = currentLessonAnswers[qi];
    q.options.forEach((_, oi) => {
      const el = document.getElementById(`opt-${lessonId}-${qi}-${oi}`);
      el.classList.remove("correct", "wrong");
      if (oi === q.correct) el.classList.add("correct");
      else if (oi === chosen) el.classList.add("wrong");
    });
    if (chosen !== q.correct) allCorrect = false;
  });
  const feedback = document.getElementById(`quiz-feedback-${lessonId}`);
  if (allCorrect) {
    feedback.innerHTML = `<div class="quiz-feedback ok">آفرین! همه‌ی پاسخ‌ها درست بود 🎉</div>
      <button class="btn btn-primary" style="margin-top:10px;" onclick="completeLesson(${lessonId})">تکمیل درس و ادامه</button>`;
  } else {
    feedback.innerHTML = `<div class="quiz-feedback bad">یکی از پاسخ‌ها اشتباه بود؛ گزینه‌های درست با رنگ طلایی مشخص شدند. دوباره تلاش کنید.</div>`;
  }
}

function completeLesson(lessonId) {
  if (!state.lessonsCompleted.includes(lessonId)) {
    state.lessonsCompleted.push(lessonId);
    saveState();
  }
  const next = LESSONS.find(l => l.id === lessonId + 1);
  if (next) {
    openLesson(next.id);
  } else {
    showScreen("learn-list");
  }
}

/* ================= کمک به مدارس دینی ================= */
function copyCardNumber() {
  const raw = document.getElementById("card-number").textContent.replace(/-/g, "");
  const btn = document.getElementById("copy-card-btn");
  navigator.clipboard.writeText(raw).then(() => {
    btn.textContent = "✓ کپی شد";
    setTimeout(() => (btn.textContent = "📋 کپی شماره کارت"), 1800);
  }).catch(() => {
    btn.textContent = "کپی نشد — دستی کپی کنید";
  });
}

/* ================= مودال ثبت سریع (از داشبورد) ================= */
function openLogModal() {
  const sel = document.getElementById("log-surah-select");
  sel.innerHTML = SURAHS.map(s => `<option value="${s.id}">${toFa(s.id)}. ${s.fa} (${s.ar})</option>`).join("");
  document.getElementById("log-ayah-input").value = "";
  document.getElementById("log-modal").classList.add("active");
}
function closeLogModal() {
  document.getElementById("log-modal").classList.remove("active");
}
function confirmLog() {
  const id = parseInt(document.getElementById("log-surah-select").value, 10);
  const ayah = parseInt(document.getElementById("log-ayah-input").value || "0", 10);
  const status = document.getElementById("log-status-select").value;
  setSurahProgress(id, ayah, status);
  closeLogModal();
  renderDashboard();
}

/* ================= برنامه‌ی حفظ ================= */
function renderPlan() {
  document.querySelectorAll("#level-chips .chip").forEach(c => {
    c.classList.toggle("active", c.dataset.level === state.level);
    c.onclick = () => {
      state.level = c.dataset.level;
      renderPlan();
    };
  });
  document.getElementById("daily-target").value = state.dailyTarget || LEVEL_TARGETS[state.level] || 5;
  renderForecast();
}

function savePlan() {
  const target = parseInt(document.getElementById("daily-target").value || "0", 10);
  state.dailyTarget = target > 0 ? target : LEVEL_TARGETS[state.level] || 5;
  saveState();
  renderForecast();
  renderDashboard();
}

function renderForecast() {
  const remaining = TOTAL_AYAHS - totalMemorizedAyahs();
  const target = state.dailyTarget || LEVEL_TARGETS[state.level] || 5;
  const days = Math.max(1, Math.ceil(remaining / target));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remDays = days % 30;
  let text = "";
  if (years > 0) text += `${toFa(years)} سال `;
  if (months > 0) text += `${toFa(months)} ماه `;
  if (years === 0) text += `${toFa(remDays)} روز`;
  document.getElementById("plan-forecast-body").innerHTML = `
    با هدف روزانه‌ی <b style="color:var(--gold-soft)">${toFa(target)} آیه</b>،
    حدود <b style="color:var(--gold-soft)">${text}</b> دیگر تا حفظ کامل قرآن باقی مانده
    (${toFa(remaining)} آیه از ${toFa(TOTAL_AYAHS)} آیه).`;
}

/* ================= مرور فاصله‌دار ================= */
function renderReviewList() {
  const doneSurahs = SURAHS
    .map(s => ({ s, p: getProgress(s.id) }))
    .filter(x => x.p.status === "done")
    .sort((a, b) => (a.p.nextReview || "").localeCompare(b.p.nextReview || ""));

  const list = document.getElementById("review-list");
  if (!doneSurahs.length) {
    list.innerHTML = `<div class="empty"><div class="mascot-wrap">${MASCOT_SVG(56)}</div>هنوز سوره‌ای را «حفظ کامل» علامت نزده‌اید.<br>وقتی سوره‌ای را کامل حفظ کنید، اینجا برای مرور دوره‌ای زمان‌بندی می‌شود.</div>`;
    return;
  }
  const today = todayStr();
  list.innerHTML = doneSurahs.map(({ s, p }) => {
    const isDue = p.nextReview <= today;
    const dueLabel = isDue
      ? (p.nextReview < today ? "دیرشده" : "امروز")
      : `${toFa(daysBetween(today, p.nextReview))} روز دیگر`;
    return `
      <div class="review-item">
        <div>
          <div style="font-weight:700;">${s.fa} <span class="ar-name">${s.ar}</span></div>
          <div class="due ${isDue ? (p.nextReview < today ? "overdue" : "today") : ""}">${dueLabel}</div>
        </div>
        ${isDue ? `<button class="btn btn-primary btn-sm" onclick="advanceReview(${s.id})">مرور شد</button>`
                : `<span style="font-size:11px;color:var(--parchment-dim);">مرحله ${toFa(p.reviewStage + 1)}</span>`}
      </div>`;
  }).join("");
}

function daysBetween(a, b) {
  const d1 = new Date(a), d2 = new Date(b);
  return Math.max(0, Math.round((d2 - d1) / 86400000));
}

/* ================= قابلیت‌های APEX ================= */
const ACHIEVEMENTS=[
{id:'first',icon:'🌱',title:'اولین قدم',desc:'اولین آیه را ثبت کن',test:()=>totalMemorizedAyahs()>=1},
{id:'fire',icon:'🔥',title:'هفته‌ی طلایی',desc:'۷ روز پیوسته فعال باش',test:()=>computeStreak()>=7},
{id:'hundred',icon:'💎',title:'صد آیه',desc:'۱۰۰ آیه حفظ‌شده',test:()=>totalMemorizedAyahs()>=100},
{id:'surah',icon:'🌙',title:'اولین سوره',desc:'یک سوره را کامل کن',test:()=>countDoneSurahs()>=1},
{id:'five',icon:'🏆',title:'پنج قله',desc:'۵ سوره را کامل کن',test:()=>countDoneSurahs()>=5},
{id:'thousand',icon:'⚡',title:'هزار آیه',desc:'۱۰۰۰ آیه حفظ‌شده',test:()=>totalMemorizedAyahs()>=1000},
{id:'focus',icon:'🧠',title:'ذهن متمرکز',desc:'۵ جلسه تمرکز',test:()=>Number(state.focusSessions||0)>=5},
{id:'lesson',icon:'📚',title:'شاگرد پرتلاش',desc:'همه‌ی درس‌های پایه',test:()=>((state.lessonsCompleted||[]).length>=LESSONS.length)}];
function getXP(){return Math.min(999999,totalMemorizedAyahs()*2+countDoneSurahs()*80+(state.lessonsCompleted||[]).length*35+computeStreak()*12+Number(state.focusSessions||0)*25)}
function getLevel(xp=getXP()){return Math.max(1,Math.floor(xp/250)+1)}
function syncAchievements(){const a=state.achievements||[];ACHIEVEMENTS.forEach(x=>{if(!a.includes(x.id)&&x.test())a.push(x.id)});state.achievements=a;saveState()}
function weeklyActivity(){const set=new Set(state.activityDates||[]);return Array.from({length:7},(_,i)=>{const d=todayStr(i-6);return{d,active:set.has(d)}})}
function getTodayAyahs(){let sum=0;for(const p of Object.values(state.progress||{})){if(p.lastActivity===todayStr())sum+=Number(p.todayAyahs||0)}return sum}
function renderWeekChart(){const box=document.getElementById('week-chart');if(!box)return;const labs=['ش','ی','د','س','چ','پ','ج'],v=weeklyActivity();box.innerHTML=v.map((x,i)=>`<div class="week-col"><div class="week-bar ${x.active?'active':''}" style="height:${x.active?56:18}px"></div><small>${labs[(new Date(x.d+'T12:00:00').getDay()+1)%7]}</small></div>`).join('');const s=document.getElementById('week-summary');if(s)s.textContent=v.filter(x=>x.active).length?`${toFa(v.filter(x=>x.active).length)} روز فعال`:'شروع یک هفته‌ی تازه'}
function renderMission(){const f=document.getElementById('mission-fill');if(!f)return;const target=state.dailyTarget||5,progress=Math.min(target,getTodayAyahs()),pct=Math.min(100,Math.round(progress/target*100));document.getElementById('mission-title').textContent=pct>=100?'ماموریت کامل شد 🎉':'ماموریت امروز';document.getElementById('mission-desc').textContent=pct>=100?'امروز سهم خودت را انجام دادی؛ اگر انرژی داری، مرور کن.':'فقط '+toFa(Math.max(0,target-progress))+' آیه‌ی دیگر تا هدف امروز.';document.getElementById('mission-progress-label').textContent=`${toFa(progress)} / ${toFa(target)} آیه`;document.getElementById('mission-percent').textContent=toFa(pct)+'٪';f.style.width=pct+'%'}
function renderSmartLayer(){syncAchievements();const xp=getXP(),level=getLevel(xp),pct=Math.min(100,Math.round(((xp-(level-1)*250)/250)*100)),e=id=>document.getElementById(id);if(e('menu-level-badge'))e('menu-level-badge').textContent='LV '+toFa(level);if(e('menu-xp'))e('menu-xp').textContent=toFa(xp)+' XP';if(e('menu-xp-next'))e('menu-xp-next').textContent=toFa(Math.max(0,level*250-xp))+' XP تا سطح بعدی';if(e('menu-xp-fill'))e('menu-xp-fill').style.width=pct+'%';if(e('menu-week-days'))e('menu-week-days').textContent=toFa(weeklyActivity().filter(x=>x.active).length);if(e('menu-achievements'))e('menu-achievements').textContent=toFa(state.achievements.length);if(e('menu-focus'))e('menu-focus').textContent=toFa(state.focusSessions||0);renderMission();renderWeekChart()}
function openAchievements(){syncAchievements();document.getElementById('achievement-grid').innerHTML=ACHIEVEMENTS.map(a=>{const ok=state.achievements.includes(a.id);return`<div class="achievement ${ok?'unlocked':''}"><div class="achievement-icon">${a.icon}</div><b>${a.title}</b><small>${a.desc}</small><span>${ok?'باز شد ✓':'قفل'}</span></div>`}).join('');document.getElementById('achievements-modal').classList.add('active')}
function closeAchievements(){document.getElementById('achievements-modal').classList.remove('active')}
let focusSeconds=900,focusTimer=null,focusRunning=false;
function openFocusModal(){document.getElementById('focus-modal').classList.add('active');setFocus(15)}
function closeFocusModal(){if(focusTimer)clearInterval(focusTimer);focusTimer=null;focusRunning=false;document.getElementById('focus-modal').classList.remove('active')}
function setFocus(min){if(focusTimer)clearInterval(focusTimer);focusRunning=false;focusSeconds=min*60;updateFocusUI();document.querySelectorAll('.focus-presets button').forEach(b=>b.classList.toggle('active',b.textContent.startsWith(String(min))));document.getElementById('focus-start').textContent='شروع تمرکز'}
function updateFocusUI(){const m=Math.floor(focusSeconds/60),s=focusSeconds%60;document.getElementById('focus-time').textContent=toFa(String(m).padStart(2,'0'))+':'+toFa(String(s).padStart(2,'0'))}
function toggleFocus(){if(focusRunning){clearInterval(focusTimer);focusTimer=null;focusRunning=false;document.getElementById('focus-start').textContent='ادامه';return}focusRunning=true;document.getElementById('focus-start').textContent='مکث';focusTimer=setInterval(()=>{focusSeconds--;updateFocusUI();if(focusSeconds<=0){clearInterval(focusTimer);focusTimer=null;focusRunning=false;state.focusSessions=(state.focusSessions||0)+1;markActivityToday();saveState();syncAchievements();renderSmartLayer();document.getElementById('focus-start').textContent='جلسه کامل شد ✓';document.getElementById('focus-message').textContent='آفرین! یک جلسه‌ی کامل تمرکز ثبت شد.'}},1000)}
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='hamrah-man-backup-'+todayStr()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function importData(ev){const file=ev.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const incoming=JSON.parse(r.result);if(!incoming.progress)throw Error();state=Object.assign(defaultState(),incoming);saveState();renderDashboard();renderSmartLayer();alert('پشتیبان با موفقیت بازیابی شد.')}catch(e){alert('فایل پشتیبان معتبر نیست.')}};r.readAsText(file);ev.target.value=''}


/* ================= SMART HIFZ — مسیر ۷ مرحله‌ای =================
   طراحی بر پایه retrieval practice + spacing + feedback + interleaving.
   منابع پژوهشی: Roediger/Bjork; Cepeda et al.; Agarwal & Roediger.
*/
const HIFZ_STAGES = [
  {t:'انتخاب سوره',d:'یک هدف کوچک و قابل‌انجام انتخاب کن.'},
  {t:'تماشای دقیق',d:'آیه را آرام بخوان و شکل کلمات و وقف‌ها را ببین.'},
  {t:'تکرار هدفمند',d:'هر آیه را چند بار با صدای خودت بخوان؛ سپس بدون نگاه آماده شو.'},
  {t:'یادآوری فعال',d:'متن را کنار بگذار و از حافظه بازخوانی کن.'},
  {t:'آزمون تلاوت',d:'حالا خودت بخوان؛ سیستم فقط به‌عنوان کمک شنیداری بازخورد می‌دهد.'},
  {t:'اتصال آیات',d:'آیه جدید را به آیه قبل وصل کن و بدون نگاه از ابتدا بخوان.'},
  {t:'تثبیت فاصله‌دار',d:'مرورهای بعدی را با فاصله انجام بده تا حفظ پایدارتر شود.'}
];
let hifzWizard={stage:0,surahId:1,ayahs:[],reps:3};
function hifzCacheKey(id){return 'hamrah_quran_surah_'+id}
async function fetchSurahText(id){
  const key=hifzCacheKey(id), cached=localStorage.getItem(key); if(cached){try{return JSON.parse(cached)}catch{}}
  const r=await fetch(`https://api.alquran.cloud/v1/surah/${id}/quran-uthmani`,{cache:'force-cache'});
  if(!r.ok) throw Error('network'); const j=await r.json(); const a=(j.data?.ayahs||[]).map(x=>({n:x.numberInSurah,text:x.text}));
  localStorage.setItem(key,JSON.stringify(a)); return a;
}
function surahOptions(selected){return SURAHS.map(x=>`<option value="${x.id}" ${x.id===selected?'selected':''}>${x.id}. ${x.fa} — ${x.ar}</option>`).join('')}
function renderHifzWizard(){
  const box=document.getElementById('hifz-wizard'); if(!box)return;
  const st=HIFZ_STAGES[hifzWizard.stage], fill=((hifzWizard.stage+1)/HIFZ_STAGES.length)*100;
  document.getElementById('hifz-step-label').textContent=`مرحله ${toFa(hifzWizard.stage+1)} از ${toFa(HIFZ_STAGES.length)}`;
  document.getElementById('hifz-step-title').textContent=st.t;
  document.getElementById('hifz-step-fill').style.width=fill+'%';
  if(hifzWizard.stage===0){box.innerHTML=`<div class="card wizard-card"><span class="eyebrow">گام صفر • هدف کوچک</span><h2>امروز کدام سوره؟</h2><p>برای شروع، یک سوره‌ی کوتاه یا بخشی که واقعاً می‌توانی روی آن تمرکز کنی انتخاب کن.</p><div class="field"><label>انتخاب سوره</label><select id="hifz-surah-select">${surahOptions(hifzWizard.surahId)}</select></div><button class="btn btn-primary full" onclick="hifzNext()">شروع مسیر ←</button></div>`;return}
  if(hifzWizard.stage===1){box.innerHTML=`<div class="card wizard-card"><span class="eyebrow">گام ۱ • توجه</span><h2>اول دقیق ببین</h2><div id="hifz-text" class="quran-text loading">در حال دریافت متن…</div><div class="rep-pill">آرام بخوان • روی کلمات مکث کن • بعد تأیید کن</div><button class="btn btn-primary full" onclick="hifzNext()">خواندم و آماده‌ام ✓</button></div>`;loadHifzText();return}
  if(hifzWizard.stage===2){box.innerHTML=`<div class="card wizard-card"><span class="eyebrow">گام ۲ • تکرار هدفمند</span><h2>تکرار با فاصله‌ی کوتاه</h2><div id="hifz-text" class="quran-text loading">در حال دریافت متن…</div><div class="rep-control"><button onclick="hifzWizard.reps=Math.max(1,hifzWizard.reps-1);renderHifzWizard()">−</button><strong>${toFa(hifzWizard.reps)} بار</strong><button onclick="hifzWizard.reps=Math.min(7,hifzWizard.reps+1);renderHifzWizard()">+</button></div><p>هر بار با توجه کامل بخوان. بعد از آخرین تکرار، متن را کنار بگذار.</p><button class="btn btn-primary full" onclick="hifzNext()">تکرارها انجام شد ✓</button></div>`;loadHifzText();return}
  if(hifzWizard.stage===3){box.innerHTML=`<div class="card wizard-card recall-card"><span class="eyebrow">گام ۳ • بازیابی فعال</span><h2>بدون نگاه بخوان</h2><p>متن را پنهان کردیم. از حافظه بازخوانی کن. سخت بودن این مرحله طبیعی است؛ همین تلاشِ یادآوری بخشی از تمرین است.</p><button class="btn btn-ghost full" onclick="revealHifzText()">نمایش متن برای بررسی</button><div id="hifz-hidden-text" class="quran-text hidden"></div><button class="btn btn-primary full" onclick="hifzNext()">بازخوانی انجام شد ✓</button></div>`;return}
  if(hifzWizard.stage===4){box.innerHTML=`<div class="card wizard-card"><span class="eyebrow">گام ۴ • ارزیابی صوتی</span><h2>حالا با صدایت ثابتش کن</h2><p>همین بخش را بخوان؛ اگر مرورگر اجازه دهد، ارزیابی تقریبی واژه‌ها انجام می‌شود.</p><button class="btn btn-primary full" onclick="openGuidedRecite()">شروع آزمون تلاوت 🎙</button><div id="guided-result"></div></div>`;return}
  if(hifzWizard.stage===5){box.innerHTML=`<div class="card wizard-card"><span class="eyebrow">گام ۵ • اتصال</span><h2>آیه‌ها را به هم قفل کن</h2><p>از ابتدای بخش تا اینجا را بدون نگاه بخوان. اگر گیر کردی، فقط همان نقطه را دوباره تمرین کن؛ از اولِ کل بخش شروع نکن.</p><div class="lock-sequence"><span>آیه قبل</span><b>→</b><span>آیه جدید</span></div><button class="btn btn-primary full" onclick="hifzNext()">اتصال انجام شد ✓</button></div>`;return}
  box.innerHTML=`<div class="card wizard-card finish-card"><div class="success-orb">✦</div><span class="eyebrow">گام ۶ • تثبیت</span><h2>حفظ امروز ثبت شد</h2><p>مرور را به یک زمان ثابت تبدیل کن: امروز، فردا، چند روز بعد و سپس با فاصله‌های بیشتر. برنامه بر اساس عملکردت یادآوری می‌کند.</p><div class="spacing-road"><span>امروز</span><i></i><span>فردا</span><i></i><span>+۳ روز</span><i></i><span>+۷ روز</span></div><button class="btn btn-primary full" onclick="finishHifz()">ثبت و بازگشت به خانه ✓</button></div>`;
}
async function loadHifzText(){const el=document.getElementById('hifz-text');if(!el)return;try{hifzWizard.ayahs=await fetchSurahText(hifzWizard.surahId);el.classList.remove('loading');el.innerHTML=hifzWizard.ayahs.slice(0,Math.min(8,hifzWizard.ayahs.length)).map(a=>`<span class="ayah-chip"><b>${toFa(a.n)}</b>${a.text}</span>`).join('')}catch(e){el.innerHTML='برای دریافت متن این بخش، یک‌بار اینترنت را روشن کن. سپس متن روی گوشی ذخیره می‌شود و دفعات بعدی قابل استفاده است.'}}
function hifzNext(){if(hifzWizard.stage===0){hifzWizard.surahId=Number(document.getElementById('hifz-surah-select').value)}hifzWizard.stage=Math.min(6,hifzWizard.stage+1);renderHifzWizard()}
async function revealHifzText(){const el=document.getElementById('hifz-hidden-text');try{hifzWizard.ayahs=await fetchSurahText(hifzWizard.surahId);el.innerHTML=hifzWizard.ayahs.slice(0,8).map(a=>`<span class="ayah-chip"><b>${toFa(a.n)}</b>${a.text}</span>`).join('');el.classList.remove('hidden')}catch{el.textContent='متن آفلاین هنوز ذخیره نشده است.';el.classList.remove('hidden')}}
function finishHifz(){markActivityToday();state.focusSessions=state.focusSessions||0;saveState();renderDashboard();goTo('dashboard');hifzWizard={stage:0,surahId:hifzWizard.surahId,ayahs:[],reps:3};}
function openGuidedRecite(){goTo('recite');const sel=document.getElementById('recite-surah');if(sel){sel.value=hifzWizard.surahId;loadReciteAyahs();}document.getElementById('recite-status').textContent='برای ارزیابی همین سوره آماده‌ای.'}

/* ================= TILAWAT PLAYER ================= */
let tilawat={surahId:1,ayah:1,audio:null,playing:false,repeat:false,token:0};
function initTilawat(){const s=document.getElementById('tilawat-surah');if(!s)return;if(!s.options.length){s.innerHTML=surahOptions(1);s.onchange=()=>{tilawat.surahId=Number(s.value);tilawat.ayah=1;loadTilawatAyah(false)}}loadTilawatAyah(false)}
function tilawatUrl(surah,ayah){return `https://everyayah.com/data/Alafasy_128kbps/${String(surah).padStart(3,'0')}${String(ayah).padStart(3,'0')}.mp3`}
function fmtTime(sec){if(!Number.isFinite(sec))return '۰۰:۰۰';const m=Math.floor(sec/60),ss=Math.floor(sec%60);return toFa(String(m).padStart(2,'0'))+':'+toFa(String(ss).padStart(2,'0'))}
function loadTilawatAyah(auto){const s=SURAHS.find(x=>x.id===tilawat.surahId)||SURAHS[0];if(tilawat.audio){tilawat.audio.pause();tilawat.audio.src='';tilawat.audio=null}const a=tilawat.ayah;document.getElementById('tilawat-now').textContent=`سوره ${s.fa}`;document.getElementById('tilawat-meta').textContent=`آیه ${toFa(a)} از ${toFa(s.ayahs)} • مشاری راشد العفاسی`;document.getElementById('tilawat-ayah-label').textContent=`آیه ${toFa(a)}`;document.getElementById('tilawat-time').textContent='۰۰:۰۰';document.getElementById('tilawat-fill').style.width='0%';const audio=new Audio(tilawatUrl(s.id,a));audio.preload='metadata';const token=++tilawat.token;audio.onloadedmetadata=()=>{if(token!==tilawat.token)return};audio.ontimeupdate=()=>{if(!audio.duration)return;document.getElementById('tilawat-fill').style.width=(audio.currentTime/audio.duration*100)+'%';document.getElementById('tilawat-time').textContent=fmtTime(audio.currentTime)+' / '+fmtTime(audio.duration)};audio.onended=()=>{if(token!==tilawat.token)return;if(tilawat.repeat){audio.currentTime=0;audio.play().catch(()=>{});return}if(tilawat.ayah<s.ayahs){tilawat.ayah++;loadTilawatAyah(true)}else{tilawat.playing=false;document.getElementById('tilawat-play').textContent='▶';document.getElementById('tilawat-meta').textContent='تلاوت سوره به پایان رسید ✦'}};audio.onerror=()=>{document.getElementById('tilawat-meta').textContent='فایل صوتی دریافت نشد؛ اتصال اینترنت را بررسی کن.';tilawat.playing=false;document.getElementById('tilawat-play').textContent='▶'};tilawat.audio=audio;if(auto||tilawat.playing)audio.play().then(()=>{tilawat.playing=true;document.getElementById('tilawat-play').textContent='Ⅱ'}).catch(()=>{tilawat.playing=false})}
function toggleTilawat(){if(!tilawat.audio)loadTilawatAyah(false);if(tilawat.playing){tilawat.audio.pause();tilawat.playing=false;document.getElementById('tilawat-play').textContent='▶'}else{tilawat.audio.play().then(()=>{tilawat.playing=true;document.getElementById('tilawat-play').textContent='Ⅱ'}).catch(()=>{document.getElementById('tilawat-meta').textContent='برای پخش، یک‌بار دیگر دکمه شروع را بزن.'})}}
function tilawatPrev(){tilawat.ayah=Math.max(1,tilawat.ayah-1);const was=tilawat.playing;loadTilawatAyah(was)}
function tilawatNext(){const s=SURAHS.find(x=>x.id===tilawat.surahId)||SURAHS[0];tilawat.ayah=Math.min(s.ayahs,tilawat.ayah+1);const was=tilawat.playing;loadTilawatAyah(was)}
function restartTilawat(){tilawat.ayah=1;loadTilawatAyah(tilawat.playing)}
function toggleTilawatRepeat(){tilawat.repeat=!tilawat.repeat;const b=document.getElementById('tilawat-repeat');if(b){b.textContent=tilawat.repeat?'↻ تکرار آیه: روشن':'↻ تکرار آیه';b.classList.toggle('active',tilawat.repeat)}}

/* ================= ۴۵ حدیث منتخب و مستند درباره نماز ================= */
const HADITHS=[
['نماز','Sahih Muslim 377','اذان برای اعلام وقت نماز','پیامبر ﷺ به بلال دستور داد مردم را برای نماز فراخواند.'],
['اذان','Sahih Muslim 378a','شیوه اذان و اقامه','بلال مأمور شد عبارت‌های اذان را دو بار و اقامه را یک بار بگوید.'],
['اذان','Sahih Muslim 379','آموزش اذان','پیامبر ﷺ شیوه گفتن اذان را به ابومحذوره آموزش داد.'],
['نماز','Sahih Muslim 380a','مؤذنان پیامبر','پیامبر ﷺ دو مؤذن داشت: بلال و ابن‌ام‌مکتوم.'],
['اذان','Sahih Muslim 381a','اذان ابن‌ام‌مکتوم','ابن‌ام‌مکتوم برای پیامبر ﷺ اذان می‌گفت.'],
['نماز','Sahih Muslim 382','توجه به اذان','پیامبر ﷺ هنگام شنیدن اذان آن را نشانه برپایی اسلام می‌دانست.'],
['اذان','Sahih Muslim 383','پاسخ به مؤذن','هرگاه اذان را شنیدید، همانند گفته مؤذن پاسخ دهید.'],
['اذان','Sahih Muslim 384','صلوات و وسیله','پس از پاسخ به اذان، بر پیامبر ﷺ صلوات بفرستید و وسیله را برای او از خدا بخواهید.'],
['اذان','Sahih Muslim 385','پاسخ به حی علی الصلاة','برای «حی علی الصلاة» و «حی علی الفلاح» پاسخ «لا حول و لا قوة إلا بالله» آمده است.'],
['نماز','Sahih Muslim 386','فضیلت فاصله صف‌ها','در روایات این بخش بر فضیلت حضور و آمادگی برای نماز جماعت تأکید شده است.'],
['نماز','Sahih Muslim 387','نماز جماعت','روایت بر اهمیت برپایی نماز با جماعت و حضور در مسجد دلالت دارد.'],
['نماز','Sahih Muslim 388','مسجد و نماز','مسجد جایگاه اصلی اجتماع مؤمنان برای نماز است و پیامبر ﷺ بر آن اهتمام داشت.'],
['نماز','Sahih Muslim 389','پاکیزگی برای نماز','روایات نماز در این بخش بر آداب آمادگی و پاکیزگی تأکید دارند.'],
['نماز','Sahih Muslim 390','وقت نماز','پیامبر ﷺ نماز را در وقت خود و با توجه به نشانه‌های زمان اقامه می‌کرد.'],
['خشوع','Sahih Muslim 391','حضور قلب','در نماز باید با آرامش و توجه ایستاد و از شتاب در ارکان پرهیز کرد.'],
['نماز','Sahih Muslim 392a','تکبیرهای نماز','پیامبر ﷺ نماز را با تکبیر آغاز می‌کرد و هنگام رکوع، سجود و برخاستن تکبیر می‌گفت.'],
['نماز','Sahih Muslim 392b','ترتیب ارکان','پس از رکوع می‌ایستاد، سپس سجده می‌کرد و میان ارکان با نظم حرکت می‌کرد.'],
['نماز','Sahih Muslim 393','قرائت در نماز','پیامبر ﷺ در نماز قرائت قرآن داشت و شیوه قرائت او برای صحابه الگو بود.'],
['نماز','Sahih Muslim 394','آرامش در رکوع','رکوع باید با قرار گرفتن بدن و آرامش انجام شود، نه با حرکت شتاب‌زده.'],
['خشوع','Sahih Muslim 395','آرامش در سجود','در سجده نیز باید بدن آرام بگیرد و سپس برای حرکت بعدی بلند شود.'],
['نماز','Sahih Muslim 396a','قرائت نماز','در روایات این باب، شیوه قرائت پیامبر ﷺ در نماز و جایگاه حمد و سوره بیان شده است.'],
['نماز','Sahih Muslim 396b','ذکر بعد از رکوع','پس از بلند شدن از رکوع، ذکر «سمع الله لمن حمده» و سپس حمد پروردگار آمده است.'],
['نماز','Sahih Muslim 396c','نماز مانند نماز پیامبر','ابوهریره گفت نماز او بیشترین شباهت را به نماز پیامبر ﷺ دارد.'],
['نماز','Sahih Muslim 397a','آموزش نماز به کسی که اشتباه خواند','پیامبر ﷺ مردی را که نماز را نادرست خوانده بود، به بازگشت و خواندن صحیح نماز راهنمایی کرد.'],
['نماز','Sahih Muslim 398','ارکان نماز','در آموزش نماز بر تکبیر، قرائت، رکوع، قیام، سجده و نشستن با آرامش تأکید شد.'],
['نماز','Sahih Muslim 399','نماز با طمأنینه','پیامبر ﷺ بر کامل کردن رکوع و سجود و آرام گرفتن میان ارکان تأکید کرد.'],
['نماز','Sahih Muslim 400','قیام پس از رکوع','بعد از رکوع باید کاملاً راست ایستاد و سپس به سجده رفت.'],
['نماز','Sahih Muslim 401','آموزش مستقیم نماز','در حدیث مردی که نماز را درست انجام نمی‌داد، پیامبر ﷺ ترتیب اصلی نماز را آموزش داد.'],
['نماز','Sahih Muslim 402a','تشهد','پیامبر ﷺ به عبدالله بن مسعود تشهد را آموزش داد و شهادتین در آن آمده است.'],
['نماز','Sahih Muslim 402b','دعای پس از تشهد','پس از تشهد، نمازگزار می‌تواند از دعاهای پسندیده برای خود درخواست کند.'],
['نماز','Sahih Muslim 403','تشهد و سلام','تشهد از اعمال پایانی نماز است و نماز با سلام پایان می‌یابد.'],
['خشوع','Sahih Muslim 404','دعا در نماز','پیامبر ﷺ دعا کردن پس از تشهد را برای نمازگزار بیان کرد.'],
['خشوع','Sahih Muslim 405','دعا در سجده','نزدیک‌ترین حالت بنده به پروردگار در سجده است؛ پس در سجده دعا کنید.'],
['نماز','Sahih Muslim 406','ذکر رکوع و سجود','در رکوع و سجود ذکرهای مخصوصی از پیامبر ﷺ نقل شده است.'],
['نماز','Sahih Muslim 407','تسبیح در رکوع','از پیامبر ﷺ ذکر «سبوح قدوس رب الملائکة والروح» در رکوع و سجود نقل شده است.'],
['نماز','Sahih Muslim 408','آغاز نماز','پیامبر ﷺ نماز را با تکبیر آغاز می‌کرد و سپس قرائت را شروع می‌کرد.'],
['نماز','Sahih Muslim 409','چگونگی رکوع','در رکوع سر نه بیش از حد بالا بود و نه بیش از حد پایین؛ حالت متعادل داشت.'],
['نماز','Sahih Muslim 410','نشستن میان دو سجده','پیامبر ﷺ پس از سجده می‌نشست و سپس برای سجده بعدی می‌رفت.'],
['نماز','Sahih Muslim 411','نشستن تشهد','در تشهد، دست‌ها روی ران‌ها یا زانوها قرار می‌گرفتند و انگشت اشاره به شیوه روایت‌شده به کار می‌رفت.'],
['نماز','Sahih Muslim 412','پرهیز از حرکت بیهوده','در نماز از بازی با سنگ‌ریزه و کارهای بی‌فایده نهی شده است.'],
['نماز','Sahih Muslim 413','سجده و جای دست‌ها','در سجده نباید دست‌ها را مانند حیوان روی زمین پهن کرد.'],
['نماز','Sahih Muslim 414','پایان نماز','پیامبر ﷺ نماز را با سلام به پایان می‌رساند.'],
['نماز','Sahih Muslim 415','دو رکعت نخست','در هر دو رکعت، تشهد و نظم مشخصی در نشستن و برخاستن روایت شده است.'],
['نماز','Sahih Muslim 417','پیروی از امام جماعت','امام برای پیروی کردن قرار داده شده است؛ نمازگزار با تکبیر و رکوع او هماهنگ می‌شود و از او پیشی نمی‌گیرد.'],
['نماز','Sahih Muslim 418a','امامت در دوران بیماری پیامبر ﷺ','در بیماری پیامبر ﷺ، وقتی توان حضور برای نماز نداشت، به ابوبکر دستور داده شد مردم را در نماز جماعت امامت کند.']
];
let hadithFilter='all';
function setHadithFilter(f){hadithFilter=f;document.querySelectorAll('#hadith-filters .chip').forEach(x=>x.classList.toggle('active',x.dataset.filter===f));renderHadiths()}
function renderHadiths(){const box=document.getElementById('hadith-list');if(!box)return;const q=(document.getElementById('hadith-search')?.value||'').trim();const rows=HADITHS.filter(h=>(hadithFilter==='all'||h[0]===hadithFilter)&&(!q||h.join(' ').includes(q)));box.innerHTML=rows.map((h,i)=>`<article class="hadith-card"><div class="hadith-number">${toFa(i+1)}</div><div class="hadith-content"><div class="hadith-top"><span>${h[0]}</span><small>✓ صحیح • ${h[1]}</small></div><h3>${h[2]}</h3><p>${h[3]}</p><div class="hadith-ref">منبع: <a href="https://sunnah.com/muslim/4" target="_blank" rel="noopener">Sahih Muslim • Book 4</a></div></div></article>`).join('')||'<div class="card empty">موردی پیدا نشد.</div>'}

/* ================= RECITATION LAB — پایدارتر و بدون startهای تکراری ================= */
let recite={recognition:null,running:false,finalText:'',interim:'',target:[],lastResultAt:0};
function normalizeArabic(t){return String(t||'').toLowerCase().replace(/[ًٌٍَُِّْـٰٓ]/g,'').replace(/[إأٱآ]/g,'ا').replace(/ى/g,'ی').replace(/ي/g,'ی').replace(/ؤ/g,'و').replace(/ئ/g,'ی').replace(/ة/g,'ه').replace(/[،؛؟.,!?]/g,' ').replace(/\s+/g,' ').trim()}
function wordSimilarity(a,b){const x=normalizeArabic(a).split(' ').filter(Boolean),y=normalizeArabic(b).split(' ').filter(Boolean);if(!x.length||!y.length)return 0;const m=x.length,n=y.length,dp=Array.from({length:m+1},()=>Array(n+1).fill(0));for(let i=0;i<=m;i++)dp[i][0]=i;for(let j=0;j<=n;j++)dp[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(x[i-1]===y[j-1]?0:1));return Math.max(0,Math.round((1-dp[m][n]/Math.max(m,n))*100))}
function initReciteLab(){const s=document.getElementById('recite-surah');if(!s)return;if(!s.options.length){s.innerHTML=surahOptions(1);s.onchange=loadReciteAyahs}loadReciteAyahs()}
async function loadReciteAyahs(){const id=Number(document.getElementById('recite-surah')?.value||1),box=document.getElementById('recite-ayahs');if(!box)return;box.textContent='در حال آماده‌سازی متن…';try{const a=await fetchSurahText(id);recite.target=a;box.innerHTML=a.slice(0,8).map(x=>`<span class="ayah-chip"><b>${toFa(x.n)}</b>${x.text}</span>`).join('');}catch{box.textContent='متن این سوره برای ارزیابی نیاز به اتصال اولیه اینترنت دارد.'}}
function startRecitationLab(){if(recite.running)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){setReciteStatus('این مرورگر تشخیص گفتار عربی را پشتیبانی نمی‌کند. Chrome/Edge را امتحان کن.');return}const target=recite.target.slice(0,8).map(x=>x.text).join(' ');if(!target){setReciteStatus('اول متن سوره را دریافت کن.');return}stopRecitationLab(false);recite={...recite,recognition:new SR(),running:true,finalText:'',interim:'',target:recite.target,lastResultAt:Date.now()};const r=recite.recognition;r.lang='ar-SA';r.continuous=true;r.interimResults=true;r.maxAlternatives=1;r.onstart=()=>{setReciteStatus('گوش می‌دهم… آرام و طبیعی بخوان.');document.getElementById('mic-orb')?.classList.add('listening')};r.onresult=e=>{let f='',i='';for(let k=e.resultIndex;k<e.results.length;k++){const t=e.results[k][0]?.transcript||'';if(e.results[k].isFinal) f+=t; else i+=t}if(f)recite.finalText+=' '+f;recite.interim=i;document.getElementById('recite-status').textContent=i?`در حال شنیدن: ${i}`:'در حال شنیدن…';recite.lastResultAt=Date.now()};r.onerror=e=>{if(e.error==='no-speech')setReciteStatus('صدایی دریافت نشد؛ دوباره آرام شروع کن.');else if(e.error==='not-allowed')setReciteStatus('دسترسی میکروفون مسدود است. اجازه‌ی Microphone را فعال کن.');else setReciteStatus('تشخیص گفتار متوقف شد؛ می‌توانی دوباره تلاش کنی.');};r.onend=()=>{document.getElementById('mic-orb')?.classList.remove('listening');if(recite.running){recite.running=false;finishRecitationResult()}};try{r.start()}catch{recite.running=false;setReciteStatus('مرورگر اجازه‌ی شروع دوباره نداد؛ یک لحظه صبر کن و دوباره بزن.')}}
function stopRecitationLab(show=true){if(recite.recognition){try{recite.recognition.onend=null;recite.recognition.stop()}catch{}}const was=recite.running;recite.running=false;document.getElementById('mic-orb')?.classList.remove('listening');if(show&&was)finishRecitationResult()}
function setReciteStatus(t){const e=document.getElementById('recite-status');if(e)e.textContent=t}
function finishRecitationResult(){const result=document.getElementById('recite-result');if(!result)return;const target=recite.target.slice(0,8).map(x=>x.text).join(' '),score=wordSimilarity(target,recite.finalText);const heard=normalizeArabic(recite.finalText).split(' ').filter(Boolean), expected=normalizeArabic(target).split(' ').filter(Boolean);let misses=[];expected.forEach((w,i)=>{if(!heard.includes(w))misses.push(w)});result.classList.remove('hidden');result.innerHTML=`<div class="score-ring"><strong>${toFa(score)}٪</strong><small>شباهت تقریبی</small></div><div class="feedback-title">${score>=85?'تلاوت ثبت شد ✓':score>=65?'خوب بود؛ چند بخش نیاز به مرور دارد':'این بخش را دوباره آرام تمرین کن'}</div><p>واژه‌های نیازمند بررسی: ${misses.slice(0,8).map(x=>`<b>${x}</b>`).join('، ')||'مورد مشخصی پیدا نشد'}</p><small>این امتیاز فقط مقایسه‌ی متنِ تشخیص‌داده‌شده با متن قرآن است و داوری تجوید/مخارج حروف نیست.</small>`}

/* ================= تنظیمات ================= */
function renderSettings() {
  document.getElementById("setting-name").value = state.name || "";
  document.querySelectorAll("#font-chips .chip").forEach(c => {
    c.classList.toggle("active", parseInt(c.dataset.size, 10) === state.fontSize);
    c.onclick = () => {
      state.fontSize = parseInt(c.dataset.size, 10);
      renderSettings();
    };
  });
}
function saveSettings() {
  state.name = document.getElementById("setting-name").value.trim();
  saveState();
  goTo("dashboard");
}
function resetData() {
  if (confirm("آیا مطمئن هستید؟ تمام پیشرفت شما پاک خواهد شد.")) {
    state = defaultState();
    saveState();
    goTo("dashboard");
  }
}

/* ================= ابزار: تبدیل اعداد به فارسی ================= */
function toFa(n) {
  const map = { "0":"۰","1":"۱","2":"۲","3":"۳","4":"۴","5":"۵","6":"۶","7":"۷","8":"۸","9":"۹" };
  return String(n).replace(/[0-9]/g, d => map[d]);
}

/* ================= شروع برنامه ================= */
document.addEventListener("DOMContentLoaded", () => {
  mountMascots();
  renderDashboard();
  renderSmartLayer();
  // ثبت سرویس‌ورکر برای نصب‌پذیری به‌عنوان اپ (PWA) در صورت پشتیبانی مرورگر
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  // --- صفحه‌ی ورود سینمایی ---
  const name = state.name ? `${state.name} عزیز` : "";
  const menuName = document.getElementById("menu-profile-name");
  if (menuName) menuName.textContent = name ? `مسیر ${name}` : "شروع مسیر حفظ";
  document.getElementById("splash-status").textContent = "در حال آماده‌سازی مسیر شما…";
  setTimeout(() => {
    document.getElementById("splash-status").textContent = name ? `خوش آمدید، ${name} ✦` : "خوش آمدید ✦";
  }, 1050);
  setTimeout(() => {
    const splash = document.getElementById("splash-screen");
    splash.classList.add("fade-out");
    showScreen("menu");
    setTimeout(() => splash.remove(), 650);
  }, 3000);
});

/* ================= ناوبری بین صفحات اصلی (منو / یادگیری / حفظ / کمک / سازنده) ================= */
function showScreen(name) {
  document.querySelectorAll(".top-screen").forEach(s => s.classList.remove("active"));
  document.getElementById("screen-" + name).classList.add("active");
  if (name === "learn-list") renderLearnList();
}
