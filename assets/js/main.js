/* =========================================================
   AIDD — AI 신약개발 교재 · 공통 인터랙션 (바닐라 JS)
   외부 의존성 없음
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1. 모바일 사이드바 드로어 ---------- */
  function initSidebar() {
    var sidebar = document.querySelector(".sidebar");
    var burger  = document.querySelector(".hamburger");
    var scrim   = document.querySelector(".scrim");
    if (!sidebar || !burger) return;
    function open() {
      sidebar.classList.add("open");
      if (scrim) scrim.classList.add("show");
      burger.setAttribute("aria-expanded", "true");
    }
    function close() {
      sidebar.classList.remove("open");
      if (scrim) scrim.classList.remove("show");
      burger.setAttribute("aria-expanded", "false");
    }
    burger.addEventListener("click", function () {
      sidebar.classList.contains("open") ? close() : open();
    });
    if (scrim) scrim.addEventListener("click", close);
    document.querySelectorAll("[data-open-toc]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        sidebar.classList.contains("open") ? close() : open();
      });
    });
    sidebar.querySelectorAll(".toc a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 860px)").matches) close();
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------- 2. 스크롤스파이 ---------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll(".toc a[href^='#']")
    );
    if (!links.length) return;
    var map = {};
    var sections = [];
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      if (el) { map[id] = a; sections.push(el); }
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("active"); });
          var active = map[en.target.id];
          if (active) active.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { obs.observe(s); });
  }

  /* ---------- 3. Quiz reveal ---------- */
  function initQuiz() {
    document.querySelectorAll(".qcard .reveal-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var ans = btn.parentElement.querySelector(".answer");
        if (!ans) return;
        var shown = ans.classList.toggle("show");
        btn.textContent = shown ? "정답 숨기기" : "정답 보기";
      });
    });
  }

  /* ---------- 4. MCQ ---------- */
  function initMCQ() {
    document.querySelectorAll(".mcq").forEach(function (list) {
      var answer = list.getAttribute("data-answer");
      list.querySelectorAll("li").forEach(function (li) {
        li.addEventListener("click", function () {
          if (list.getAttribute("data-done")) return;
          list.setAttribute("data-done", "1");
          list.querySelectorAll("li").forEach(function (x) {
            if (x.getAttribute("data-opt") === answer) x.classList.add("correct");
          });
          if (li.getAttribute("data-opt") !== answer) li.classList.add("wrong");
          var exp = list.parentElement.querySelector(".mcq-exp");
          if (exp) exp.style.display = "block";
        });
      });
    });
  }

  /* ---------- 5. General selector tabs ---------- */
  function initSelectors() {
    document.querySelectorAll("[data-selector]").forEach(function (root) {
      var btns   = root.querySelectorAll(".sel-btn");
      var panels = root.querySelectorAll(".sel-panel");
      function show(target) {
        btns.forEach(function (b) {
          b.classList.toggle("active", b.getAttribute("data-target") === target);
        });
        panels.forEach(function (p) {
          p.classList.toggle("active", p.getAttribute("data-panel") === target);
        });
      }
      btns.forEach(function (b) {
        b.addEventListener("click", function () { show(b.getAttribute("data-target")); });
      });
      if (btns.length) show(btns[0].getAttribute("data-target"));
    });
  }

  /* ---------- 6. fstep accordion ---------- */
  function initFstep() {
    document.querySelectorAll(".fstep .exp").forEach(function (exp) {
      exp.closest(".fstep").addEventListener("click", function () {
        this.classList.toggle("open");
      });
    });
  }

  /* ---------- 7. Layer toggle ---------- */
  function initLayerToggle() {
    document.querySelectorAll("[data-layer-toggle]").forEach(function (root) {
      var btns     = root.querySelectorAll(".layer-toggle__btn");
      var contents = root.querySelectorAll(".layer-toggle__content");
      btns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var target = btn.getAttribute("data-layer");
          btns.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          contents.forEach(function (c) {
            c.classList.toggle("active", c.getAttribute("data-layer") === target);
          });
        });
      });
      if (btns.length) btns[0].click();
    });
  }

  /* =========================================================
     시각화 1 · Binding Free-energy Balance  (data-balance)
     ========================================================= */
  function initBalance() {
    var root = document.querySelector("[data-balance]");
    if (!root) return;

    var beam    = root.querySelector(".balance__beam");
    var btns    = root.querySelectorAll(".balance__btn");
    var result  = root.querySelector(".balance__result");
    var drops   = root.querySelectorAll(".balance__drop");

    var STATES = {
      unbound: {
        tilt: "",
        result: "Unbound — 단백질과 리간드가 별도로 존재. 자유에너지 변화 없음.",
        cls: "",
        dropGone: false
      },
      partial: {
        tilt: "",
        result: "결합 진행 중 — desolvation penalty가 발생하며 interaction gain과 상쇄됨.",
        cls: "marginal",
        dropGone: false
      },
      bound: {
        tilt: "tilt-left",
        result: "결합 완료 — Interaction gain이 모든 penalty를 초과 → ΔG < 0 → Favorable.",
        cls: "favorable",
        dropGone: true
      }
    };

    function setState(key) {
      var s = STATES[key];
      if (!s) return;
      // update beam
      beam.classList.remove("tilt-left", "tilt-right");
      if (s.tilt) beam.classList.add(s.tilt);
      // update result
      result.textContent = s.result;
      result.className = "balance__result" + (s.cls ? " " + s.cls : "");
      // water drops
      drops.forEach(function (d) { d.classList.toggle("gone", s.dropGone); });
      // update buttons
      btns.forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-state") === key);
      });
    }

    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setState(btn.getAttribute("data-state"));
      });
    });
    setState("unbound");
  }

  /* =========================================================
     시각화 2 · Kd Interactive Equilibrium  (data-kd-slider)
     ========================================================= */
  function initKdSlider() {
    var root = document.querySelector("[data-kd-slider]");
    if (!root) return;

    var range     = root.querySelector(".kd__range");
    var fillBound = root.querySelector(".kd__bar-fill--bound");
    var fillFree  = root.querySelector(".kd__bar-fill--free");
    var kdVal     = root.querySelector(".kd__value");
    var dgVal     = root.querySelector(".kd__dg");

    var PROTEIN_NM = 100; // 100 nM reference protein concentration

    function render() {
      var exp = parseFloat(range.value);          // 0=1pM … 6=1mM in nM units: 10^(exp-3) µM
      var kdNM = Math.pow(10, exp);               // Kd in nM
      var boundFrac = PROTEIN_NM / (PROTEIN_NM + kdNM);
      var pctBound  = Math.round(boundFrac * 100);
      var pctFree   = 100 - pctBound;

      fillBound.style.width = pctBound + "%";
      fillBound.textContent = pctBound > 10 ? pctBound + "%" : "";
      fillFree.style.width  = pctFree + "%";
      fillFree.textContent  = pctFree > 10 ? pctFree + "%" : "";

      // display Kd in human-readable form
      var label;
      if (kdNM < 0.001)      label = (kdNM * 1000).toFixed(1) + " fM";
      else if (kdNM < 1)     label = (kdNM * 1000).toFixed(0) + " pM";
      else if (kdNM < 1000)  label = kdNM.toFixed(0) + " nM";
      else if (kdNM < 1e6)   label = (kdNM / 1000).toFixed(0) + " µM";
      else                   label = (kdNM / 1e6).toFixed(0) + " mM";
      kdVal.textContent = "Kd = " + label;

      // ΔG = RT ln(Kd[M])  at 298K, R=1.987 cal/mol·K
      var kdM = kdNM * 1e-9;
      var dg  = 1.987 * 298 * Math.log(kdM) / 1000; // kcal/mol
      dgVal.textContent = "ΔG ≈ " + dg.toFixed(1) + " kcal/mol";
    }

    range.addEventListener("input", render);
    render();
  }

  /* =========================================================
     시각화 3 · H-bond Desolvation Steps  (data-hbond-steps)
     ========================================================= */
  function initHbondSteps() {
    var root = document.querySelector("[data-hbond-steps]");
    if (!root) return;

    var steps   = Array.prototype.slice.call(root.querySelectorAll(".stepthrough__step"));
    var prevBtn = root.querySelector(".stepthrough__prev");
    var nextBtn = root.querySelector(".stepthrough__next");
    var counter = root.querySelector(".stepthrough__counter");
    var current = 0;

    function show(idx) {
      steps.forEach(function (s, i) { s.classList.toggle("active", i === idx); });
      if (counter) counter.textContent = (idx + 1) + " / " + steps.length;
      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) nextBtn.disabled = idx === steps.length - 1;
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { if (current > 0) show(--current); });
    if (nextBtn) nextBtn.addEventListener("click", function () { if (current < steps.length - 1) show(++current); });
    show(0);
  }

  /* =========================================================
     시각화 4 · Conformational Ensemble  (data-conf-ensemble)
     ========================================================= */
  function initConfEnsemble() {
    var root = document.querySelector("[data-conf-ensemble]");
    if (!root) return;

    var cards  = root.querySelectorAll(".ensemble__card");
    var result = root.querySelector(".ensemble__result");

    var OUTCOMES = {
      "A": { cls: "clash", text: "Conformation A — ligand와 steric clash 발생. 결합 불가." },
      "B": { cls: "fit",   text: "Conformation B — ligand가 잘 맞음! 이 상태를 안정화시킵니다." },
      "C": { cls: "miss",  text: "Conformation C — pocket이 너무 열려 있어 key interaction이 형성되지 않습니다." }
    };

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        cards.forEach(function (c) {
          c.classList.remove("selected", "fit", "clash", "miss");
        });
        var key = card.getAttribute("data-conf");
        var o   = OUTCOMES[key];
        if (!o) return;
        card.classList.add("selected", o.cls);
        result.textContent = o.text;
        result.className = "ensemble__result " + o.cls;
      });
    });
  }

  /* =========================================================
     시각화 5 · Three-Layer Pocket  (data-pocket-layers)
     ========================================================= */
  function initPocketLayers() {
    var root = document.querySelector("[data-pocket-layers]");
    if (!root) return;

    var btns   = root.querySelectorAll(".pocket-layers__btn");
    var legend = root.querySelector(".pocket-layers__legend");
    var svgRoot = root.querySelector("svg");

    var LEGENDS = {
      geometry: "<b>Layer 1 — Geometry</b><br>Pocket의 모양과 부피. Ligand가 공간적으로 들어가는가? Steric clash 여부와 cavity 크기를 확인합니다.",
      chemistry: "<b>Layer 2 — Chemistry</b><br>Pocket 내의 hydrogen bond donor/acceptor, hydrophobic region, charge. 어떤 interaction이 가능한가?",
      energetics: "<b>Layer 3 — Energetics / Dynamics</b><br>그 interaction을 만들기 위해 무엇을 포기해야 하는가? Desolvation cost, conformational strain, water network."
    };

    var LAYER_COLORS = {
      geometry: "#2563eb",
      chemistry: "#0d8a7a",
      energetics: "#dc2626"
    };

    function showLayer(layer) {
      btns.forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-layer") === layer);
      });
      if (legend) legend.innerHTML = LEGENDS[layer] || "";
      if (svgRoot) {
        svgRoot.querySelectorAll("[data-layer]").forEach(function (g) {
          g.style.display = g.getAttribute("data-layer") === layer ? "" : "none";
        });
      }
    }

    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        showLayer(btn.getAttribute("data-layer"));
      });
    });
    showLayer("geometry");
  }

  /* =========================================================
     시각화 6 · Imatinib × ABL DFG Slider  (data-dfg-slider)
     ========================================================= */
  function initDfgSlider() {
    var root = document.querySelector("[data-dfg-slider]");
    if (!root) return;

    var range      = root.querySelector(".dfg__range");
    var stateLabel = root.querySelector(".dfg__state-label");
    var info       = root.querySelector(".dfg__info");
    var svgDfg     = root.querySelector("[data-dfg-motif]");
    var imatinibEl = root.querySelector("[data-imatinib-fit]");

    var STATES = [
      {
        range: [0, 30],
        label: "DFG-in (Active-like state)",
        info:  "ABL이 active conformation에 가깝습니다. ATP가 결합하는 상태. Imatinib은 이 형태에 잘 결합하지 않습니다.",
        dfgAngle: 0,
        imatinibOpacity: 0.1
      },
      {
        range: [30, 70],
        label: "Transitioning…",
        info:  "DFG motif가 움직이고 있습니다. 구조가 불안정한 중간 상태.",
        dfgAngle: 45,
        imatinibOpacity: 0.4
      },
      {
        range: [70, 101],
        label: "DFG-out (Inactive state)",
        info:  "ABL이 inactive conformation — DFG-out 상태입니다. 이 구조에서만 imatinib이 들어갈 수 있는 hydrophobic pocket이 드러납니다. Imatinib은 이 상태를 선택적으로 인식하고 안정화합니다.",
        dfgAngle: 90,
        imatinibOpacity: 1.0
      }
    ];

    function render() {
      var v = parseInt(range.value, 10);
      var s = null;
      for (var i = 0; i < STATES.length; i++) {
        if (v >= STATES[i].range[0] && v < STATES[i].range[1]) { s = STATES[i]; break; }
      }
      if (!s) s = STATES[STATES.length - 1];

      if (stateLabel) stateLabel.textContent = s.label;
      if (info) info.textContent = s.info;

      // SVG DFG motif rotation
      if (svgDfg) {
        svgDfg.setAttribute("transform", "rotate(" + s.dfgAngle + ", 50, 50)");
      }
      // Imatinib opacity
      if (imatinibEl) {
        imatinibEl.style.opacity = s.imatinibOpacity;
      }
      // set CSS var for more complex SVG interpolation
      root.style.setProperty("--dfg-t", v / 100);
    }

    range.addEventListener("input", render);
    render();
  }

  /* =========================================================
     시각화 7 · Tier Ladder  (data-tier-ladder)
     ========================================================= */
  function initTierLadder() {
    var root = document.querySelector("[data-tier-ladder]");
    if (!root) return;

    var rungs = root.querySelectorAll(".tier-ladder__rung");
    var dots  = root.querySelectorAll(".tier-progress__dot");

    rungs.forEach(function (rung, idx) {
      var head = rung.querySelector(".tier-ladder__head");
      if (!head) return;
      head.addEventListener("click", function () {
        var isOpen = rung.classList.contains("open");
        rungs.forEach(function (r) { r.classList.remove("open"); });
        if (!isOpen) rung.classList.add("open");
        // progress dots
        dots.forEach(function (d, i) { d.classList.toggle("active", i === idx && !isOpen); });
      });
    });
  }

  /* =========================================================
     시각화 8 · Docking Sees/Misses  (data-docking-reveal)
     ========================================================= */
  function initDockingReveal() {
    var root = document.querySelector("[data-docking-reveal]");
    if (!root) return;

    var cards   = root.querySelectorAll(".reveal-flip");
    var countEl = root.querySelector(".docking-reveal__count");
    var flipped = 0;

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        if (!card.classList.contains("flipped")) {
          card.classList.add("flipped");
          flipped++;
          if (countEl) countEl.textContent = flipped + " / " + cards.length + " 확인됨";
        }
      });
    });
  }

  /* =========================================================
     시각화 9 · Failure Case Simulator  (data-failure-sim)
     ========================================================= */
  function initFailureSim() {
    var root = document.querySelector("[data-failure-sim]");
    if (!root) return;

    var gainRange   = root.querySelector("[data-meter='gain'] .meter__range");
    var costRange   = root.querySelector("[data-meter='cost'] .meter__range");
    var strainRange = root.querySelector("[data-meter='strain'] .meter__range");
    var gainFill    = root.querySelector("[data-meter='gain'] .meter__fill");
    var costFill    = root.querySelector("[data-meter='cost'] .meter__fill");
    var strainFill  = root.querySelector("[data-meter='strain'] .meter__fill");
    var gainVal     = root.querySelector("[data-meter='gain'] .meter__val");
    var costVal     = root.querySelector("[data-meter='cost'] .meter__val");
    var strainVal   = root.querySelector("[data-meter='strain'] .meter__val");
    var verdict     = root.querySelector(".failure-sim__verdict");
    var resetBtn    = root.querySelector(".failure-sim__reset");

    function update() {
      var gain   = gainRange   ? parseInt(gainRange.value,10)   : 0;
      var cost   = costRange   ? parseInt(costRange.value,10)   : 0;
      var strain = strainRange ? parseInt(strainRange.value,10) : 0;

      if (gainFill)   { gainFill.style.width   = gain   + "%"; }
      if (costFill)   { costFill.style.width   = cost   + "%"; }
      if (strainFill) { strainFill.style.width = strain + "%"; }
      if (gainVal)    gainVal.textContent   = gain   + "%";
      if (costVal)    costVal.textContent   = cost   + "%";
      if (strainVal)  strainVal.textContent = strain + "%";

      if (!verdict) return;
      var net = gain - cost - strain * 0.5;
      if (net >= 20) {
        verdict.textContent = "✓ Net favorable — 결합 가능성 높음";
        verdict.className = "failure-sim__verdict ok";
      } else if (net >= -10) {
        verdict.textContent = "△ Marginal — 실험 결과는 case-by-case";
        verdict.className = "failure-sim__verdict warn";
      } else {
        verdict.textContent = "✗ Net unfavorable — potency 감소 가능";
        verdict.className = "failure-sim__verdict bad";
      }
    }

    [gainRange, costRange, strainRange].forEach(function (r) {
      if (r) r.addEventListener("input", update);
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        [gainRange, costRange, strainRange].forEach(function (r) { if (r) r.value = 0; });
        update();
      });
    }
    update();
  }

  /* =========================================================
     시각화 10 · Scientist's Thinking Flow  (data-scientist-flow)
     ========================================================= */
  function initScientistFlow() {
    var root = document.querySelector("[data-scientist-flow]");
    if (!root) return;

    var steps      = root.querySelectorAll(".accord-flow__step");
    var toggleAll  = root.querySelector(".accord-flow__toggle-all");
    var allOpen    = false;

    steps.forEach(function (step) {
      var head = step.querySelector(".accord-flow__head");
      if (!head) return;
      head.addEventListener("click", function () {
        step.classList.toggle("open");
      });
    });

    if (toggleAll) {
      toggleAll.addEventListener("click", function () {
        allOpen = !allOpen;
        steps.forEach(function (s) {
          s.classList.toggle("open", allOpen);
        });
        toggleAll.textContent = allOpen ? "모두 접기" : "모두 펼치기";
      });
    }
  }

  /* =========================================================
     허브 렌더러  (index.html에서만 사용)
     ========================================================= */
  function initHub() {
    if (!window.AIDD_TRACKS) return;
    var trackGridEl  = document.querySelector("#trackGrid");
    var gridHeadEl   = document.querySelector("#gridHead");
    var lessonGridEl = document.querySelector("#lessonGrid");
    if (!trackGridEl || !lessonGridEl) return;

    // render track cards
    var tracks = window.AIDD_TRACKS;
    tracks.forEach(function (track) {
      var card = document.createElement("button");
      card.className = "track-card" + (track.id === "b" ? " track-card--b" : "");
      card.innerHTML =
        "<div class='track-card__head'>" +
          "<div class='track-card__ico'>" + track.icon + "</div>" +
          "<div>" +
            "<div class='track-card__label'>" + track.label + "</div>" +
            "<div class='track-card__name'>" + track.name + "</div>" +
          "</div>" +
        "</div>" +
        "<p>" + track.desc + "</p>" +
        "<span class='track-card__count'>" + track.lessons.filter(function(l){return l.status==="ready";}).length + "강 공개</span>";
      card.addEventListener("click", function () {
        document.querySelectorAll(".track-card").forEach(function (c) { c.classList.remove("active"); });
        card.classList.add("active");
        showTrack(track);
      });
      trackGridEl.appendChild(card);
    });

    function showTrack(track) {
      if (gridHeadEl) {
        gridHeadEl.innerHTML = "<span class='grid-head__ico'>" + track.icon + "</span> " + track.name + " — " + track.ko;
      }
      lessonGridEl.innerHTML = "";
      track.lessons.forEach(function (lesson) {
        var isReady = lesson.status === "ready";
        var isBTrack = track.id === "b";
        var el = document.createElement(isReady ? "a" : "div");
        el.className = "lesson-card" + (isBTrack ? " lesson-card--b" : "") + (!isReady ? " disabled" : "");
        if (isReady) el.href = lesson.href;
        var tags = (lesson.tags || []).map(function (t) {
          return "<span class='lc-tag'>" + t + "</span>";
        }).join("");
        el.innerHTML =
          "<div class='lc-track'>" + track.label + "</div>" +
          "<div class='lc-no'>" + (isBTrack ? "C" : "L") + String(lesson.no).padStart(2,"0") + "</div>" +
          "<h3>" + lesson.title + "</h3>" +
          "<p>" + lesson.desc + "</p>" +
          "<div class='lc-tags'>" + tags + "</div>" +
          "<div class='lc-status'>" + (isReady ? "학습 가능" : "준비 중") + "</div>";
        lessonGridEl.appendChild(el);
      });
    }

    // Show track A by default
    if (tracks.length) {
      trackGridEl.querySelector(".track-card").classList.add("active");
      showTrack(tracks[0]);
    }
  }

  /* ---------- DOMContentLoaded ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initSidebar();
    initScrollSpy();
    initQuiz();
    initMCQ();
    initSelectors();
    initFstep();
    initLayerToggle();

    initBalance();
    initKdSlider();
    initHbondSteps();
    initConfEnsemble();
    initPocketLayers();
    initDfgSlider();
    initTierLadder();
    initDockingReveal();
    initFailureSim();
    initScientistFlow();

    initHub();
  });

})();
