/* 库里投篮解剖 —— 交互（无依赖）；图表是静态内联 SVG */
(function () {
  "use strict";

  var DATA = window.CURRY;
  var seasons = DATA.seasons;

  /* ---------------- 工具 ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }



  function shortSeason(s) { return s.slice(2); } // 2009-10 -> 09-10

  /* ---------------- 导航高亮 ---------------- */
  var navLinks = $$("#nav a");
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* 顶部栏滚动态 */
  var topbar = $("#topbar");
  function onScroll() {
    topbar.classList.toggle("is-stuck", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- 对比 tab ---------------- */
  var segBtns = $$(".seg-btn");
  segBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-panel");
      segBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      $$(".compare-panel").forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === key);
      });
    });
  });

  /* ---------------- 年龄滑杆 ---------------- */
  var range = $("#ageRange");
  var ageNum = $("#ageNum"), ageSeason = $("#ageSeason");
  var mPct = $("#mPct"), mTpa = $("#mTpa"), mPts = $("#mPts"), mGp = $("#mGp");
  var phaseTag = $("#phaseTag"), phaseTitle = $("#phaseTitle"), phaseText = $("#phaseText");
  var driftMech = $("#driftMech"), driftBody = $("#driftBody"), driftShot = $("#driftShot");
  var ticksHost = $("#ageTicks");

  function phaseFor(season) {
    var year = parseInt(season.s.slice(0, 4), 10);
    for (var i = 0; i < DATA.phases.length; i++) {
      var p = DATA.phases[i];
      if (year >= p.from && year < p.to) return p;
    }
    return DATA.phases[DATA.phases.length - 1];
  }

  var currentPhase = null;
  function renderAge(index) {
    var s = seasons[index];
    if (!s) return;
    ageNum.textContent = s.age;
    ageSeason.textContent = s.s;
    mPct.textContent = s.pct.toFixed(1);
    mTpa.textContent = s.tpa.toFixed(1);
    mPts.textContent = s.pts.toFixed(1);
    mGp.textContent = s.gp;

    var p = phaseFor(s);
    if (p !== currentPhase) {
      currentPhase = p;
      phaseTag.textContent = p.tag;
      phaseTitle.textContent = p.title;
      phaseText.textContent = p.text;
      driftMech.textContent = p.mech;
      driftBody.textContent = p.body;
      driftShot.textContent = p.shot;
      var panel = $(".age-phase");
      panel.classList.remove("flash");
      void panel.offsetWidth;
      panel.classList.add("flash");
    }
    $$(".age-ticks span").forEach(function (el, i) {
      el.classList.toggle("on", i === index);
    });
  }

  if (range && seasons.length) {
    range.max = String(seasons.length - 1);
    seasons.forEach(function (s, i) {
      var t = document.createElement("span");
      t.textContent = shortSeason(s.s);
      t.title = s.s;
      t.addEventListener("click", function () {
        range.value = String(i);
        renderAge(i);
      });
      ticksHost.appendChild(t);
    });
    range.addEventListener("input", function () { renderAge(parseInt(range.value, 10)); });
    renderAge(parseInt(range.value, 10));
  }

  window.addEventListener("resize", function () { /* noop */ }, { passive: true });
})();
