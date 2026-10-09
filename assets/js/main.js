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
     L02 · V1 — Interaction Count Comparison  (data-interact-count)
     ========================================================= */
  function initInteractCount() {
    var root = document.querySelector("[data-interact-count]");
    if (!root) return;
    var panels  = root.querySelectorAll(".ic-panel");
    var btn     = root.querySelector(".ic-predict-btn");
    var reveal  = root.querySelector(".ic-reveal");
    if (!btn || !reveal) return;
    panels.forEach(function (p) {
      p.addEventListener("click", function () {
        panels.forEach(function (x) { x.classList.remove("chosen"); });
        p.classList.add("chosen");
      });
    });
    btn.addEventListener("click", function () {
      panels.forEach(function (p) {
        var c = p.getAttribute("data-compound");
        p.classList.toggle("winner", c === "B");
        p.classList.toggle("loser",  c === "A");
      });
      reveal.classList.add("show");
      btn.disabled = true;
    });
  }

  /* =========================================================
     L02 · V2 — H-bond Geometry Explorer  (data-hbond-geometry)
     ========================================================= */
  function initHbondGeo() {
    var root = document.querySelector("[data-hbond-geometry]");
    if (!root) return;
    var distRange  = root.querySelector(".hbg-dist");
    var angRange   = root.querySelector(".hbg-angle");
    var distVal    = root.querySelector(".hbg-dist-val");
    var angVal     = root.querySelector(".hbg-angle-val");
    var statusEl   = root.querySelector(".hbond-geo__status");
    var hbLine     = root.querySelector("[data-hbond-line]");
    if (!distRange || !angRange) return;
    function render() {
      var dist = parseFloat(distRange.value);
      var ang  = parseInt(angRange.value, 10);
      if (distVal) distVal.textContent = dist.toFixed(1) + " Å";
      if (angVal)  angVal.textContent  = ang + "°";
      var distOk   = dist >= 2.7 && dist <= 3.2;
      var distMarg = dist > 3.2  && dist <= 3.5;
      var angOk    = ang >= 150;
      var angMarg  = ang >= 120 && ang < 150;
      var quality;
      if (distOk && angOk)                               quality = "good";
      else if ((distOk || distMarg) && (angOk || angMarg)) quality = "ok";
      else                                               quality = "poor";
      var texts = {
        good: "Optimal — 좋은 H-bond geometry (거리 + 방향성 모두 양호)",
        ok:   "Acceptable — geometry 개선 여지 있음",
        poor: "Poor — H-bond로 계산하기 어려운 geometry"
      };
      if (statusEl) {
        statusEl.textContent  = texts[quality];
        statusEl.className    = "hbond-geo__status hbond-geo__status--" + quality;
      }
      if (hbLine) {
        var op = quality === "poor" ? 0.18 : quality === "ok" ? 0.55 : 1.0;
        hbLine.style.opacity = op;
      }
    }
    distRange.addEventListener("input", render);
    angRange.addEventListener("input", render);
    render();
  }

  /* =========================================================
     L02 · V3 — H-bond Desolvation Toggle  (data-hbond-desolv)
     ========================================================= */
  function initHbondDesolv() {
    var root = document.querySelector("[data-hbond-desolv]");
    if (!root) return;
    var btns     = root.querySelectorAll(".hbdesolv__btn");
    var gainFill = root.querySelector(".hbdesolv-gain");
    var costFill = root.querySelector(".hbdesolv-cost");
    var netFill  = root.querySelector(".hbdesolv-net");
    var gainVal  = root.querySelector(".hbdesolv-gain-val");
    var netVal   = root.querySelector(".hbdesolv-net-val");
    var resultEl = root.querySelector(".hbdesolv__result");
    var MODES = {
      strong: { gain: 85, cost: 55, net: 30,  label: "Net favorable — strong H-bond이 desolvation penalty를 초과합니다. ΔG < 0.", cls: "favorable" },
      weak:   { gain: 30, cost: 55, net: -25, label: "Net unfavorable — weak H-bond은 desolvation cost를 보상하지 못합니다. OH 추가가 오히려 손해.", cls: "unfavorable" }
    };
    function show(key) {
      var d = MODES[key];
      btns.forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-mode") === key); });
      if (gainFill) gainFill.style.width = d.gain + "%";
      if (costFill) costFill.style.width = "55%";
      var absNet = Math.abs(d.net);
      if (netFill)  netFill.style.width  = absNet + "%";
      if (gainVal)  gainVal.textContent  = "+" + d.gain;
      if (netVal)   netVal.textContent   = (d.net >= 0 ? "+" : "") + d.net;
      if (resultEl) { resultEl.textContent = d.label; resultEl.className = "hbdesolv__result " + d.cls; }
    }
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () { show(btn.getAttribute("data-mode")); });
    });
    show("strong");
  }

  /* =========================================================
     L02 · V4 — Protonation Preview  (data-protonation)
     ========================================================= */
  function initProtonation() {
    var root = document.querySelector("[data-protonation]");
    if (!root) return;
    var pHRange    = root.querySelector(".protonation__range");
    var pHValEl    = root.querySelector(".protonation__ph-val");
    var amineEl    = root.querySelector("[data-amine]");
    var bridgeEl   = root.querySelector("[data-saltbridge]");
    var labelEl    = root.querySelector(".prot-label");
    if (!pHRange) return;
    function render() {
      var pH = parseFloat(pHRange.value);
      if (pHValEl) pHValEl.textContent = "pH " + pH.toFixed(1);
      var protonated = pH < 8.5;
      if (amineEl) {
        amineEl.textContent = protonated ? "NH⁺" : "N";
        amineEl.className = "protonation__atom " + (protonated ? "protonation__atom--amine" : "protonation__atom--neutral");
      }
      if (bridgeEl) bridgeEl.classList.toggle("hidden", !protonated);
      if (labelEl) {
        labelEl.textContent = protonated
          ? "Amine protonated → salt bridge 형성 가능 (pH < pKa)"
          : "Amine neutral → charge 없음, salt bridge 없음 (pH > pKa)";
        labelEl.className = "prot-label " + (protonated ? "prot-label--yes" : "prot-label--no");
      }
    }
    pHRange.addEventListener("input", render);
    render();
  }

  /* =========================================================
     L02 · V5 — π Interaction Gallery  (data-pi-gallery)
     ========================================================= */
  function initPiGallery() {
    var root = document.querySelector("[data-pi-gallery]");
    if (!root) return;
    var cards  = root.querySelectorAll(".pi-card");
    var descEl = root.querySelector(".pi-gallery__desc");
    var DESCS = {
      "pp": "<b>π–π Stacking (Parallel displaced)</b><br>두 aromatic ring이 평행하게 배치. 전자 밀도 차이가 있는 ring pair (electron-rich vs. electron-poor) 에서 특히 favorable. 완전한 eclipsed orientation보다 offset된 geometry가 일반적.",
      "ef": "<b>Edge-to-face / T-shaped</b><br>하나의 ring이 다른 ring에 수직으로 향함. Aromatic C–H가 π electron cloud를 향하는 C–H···π interaction. Protein 내 Phe residue clusters에서 자주 관찰됨.",
      "cp": "<b>Cation–π</b><br>Positive charge (protonated amine 등)이 aromatic π electron cloud와 상호작용. Trp, Phe, Tyr 같은 aromatic residue가 partner. Ligand amine 설계 시 salt bridge 외에 cation–π 가능성도 체크."
    };
    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        cards.forEach(function (c) { c.classList.remove("selected"); });
        card.classList.add("selected");
        var key = card.getAttribute("data-pi");
        if (descEl) descEl.innerHTML = DESCS[key] || "";
      });
    });
  }

  /* =========================================================
     L02 · V6 — Hydrophobic Demo  (data-hydrophobic-demo)
     ========================================================= */
  function initHydrophobicDemo() {
    var root = document.querySelector("[data-hydrophobic-demo]");
    if (!root) return;
    var btn      = root.querySelector(".hydro-toggle-btn");
    var msgEl    = root.querySelector(".hydro-msg");
    var pocketW  = root.querySelectorAll(".water-dot[data-pocket]");
    var bound    = false;
    if (!btn) return;
    btn.addEventListener("click", function () {
      bound = !bound;
      pocketW.forEach(function (w) { w.classList.toggle("displaced", bound); });
      btn.textContent = bound ? "← Unbound 상태로" : "Pocket에 결합 →";
      if (msgEl) msgEl.textContent = bound
        ? "Pocket water가 bulk solvent로 이동 → 시스템 ΔS 증가 (favorable). Nonpolar surface burial."
        : "Pocket에 water molecule이 자리잡고 있음. Nonpolar surface 노출 상태.";
    });
  }

  /* =========================================================
     L02 · V7 — Lipophilicity Trap  (data-lipo-trap)
     ========================================================= */
  function initLipoTrap() {
    var root = document.querySelector("[data-lipo-trap]");
    if (!root) return;
    var btns    = root.querySelectorAll(".lipo-btn");
    var potFill = root.querySelector(".lipo-chart__fill--potency");
    var solFill = root.querySelector(".lipo-chart__fill--solubility");
    var noteEl  = root.querySelector(".lipo-note");
    var DATA = {
      "A":    { pot: 22, sol: 78, note: "Lead compound. Potency 보통, solubility 좋음." },
      "A-Me": { pot: 48, sol: 62, note: "CH₃ 추가 → potency 개선, solubility 소폭 감소. Trade-off 시작." },
      "A-Et": { pot: 68, sol: 38, note: "Ethyl → potency ↑↑, solubility ↓. 추가할수록 balance 깨짐." },
      "A-Ph": { pot: 88, sol: 12, note: "Phenyl → potency 우수하지만 solubility 심각하게 감소. Compound quality 악화. 개발 불가 가능성." }
    };
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var d = DATA[btn.getAttribute("data-cpd")];
        if (!d) return;
        if (potFill) potFill.style.width = d.pot + "%";
        if (solFill) solFill.style.width = d.sol + "%";
        if (noteEl) noteEl.textContent = d.note;
      });
    });
    if (btns.length) btns[0].click();
  }

  /* =========================================================
     L02 · V8 — Gefitinib Functional Map  (data-gefitinib-map)
     ========================================================= */
  function initGefitinibMap() {
    var root = document.querySelector("[data-gefitinib-map]");
    if (!root) return;
    var regions = root.querySelectorAll(".gef-region");
    var descEl  = root.querySelector(".gef-map__desc");
    var DESCS = {
      core: "<b>Quinazoline core — Hinge-binding anchor</b><br>Ring nitrogen이 EGFR hinge backbone과 H-bond를 형성. Ligand pose를 정의하는 핵심. Scaffold를 바꿀 때 hinge interaction이 유지되는지 가장 먼저 확인.",
      aryl: "<b>Aniline aromatic region — Hydrophobic pocket</b><br>Methoxyphenyl group이 EGFR hydrophobic pocket을 점유. Aromatic size와 substituent pattern이 hydrophobic contact에 영향. 이 방향의 steric clash를 주의.",
      side: "<b>Solvent-facing substituent — Property region</b><br>Polar group이 solvent-exposed area에 위치. Binding에 직접 기여가 적지만 solubility, permeability, metabolic liability를 조절하는 핵심 영역."
    };
    regions.forEach(function (r) {
      r.addEventListener("click", function () {
        regions.forEach(function (x) { x.classList.remove("active"); });
        r.classList.add("active");
        var key = r.getAttribute("data-region");
        if (descEl) descEl.innerHTML = DESCS[key] || "";
      });
    });
  }

  /* =========================================================
     L02 · V9 — Modification Lab  (data-mod-lab)
     ========================================================= */
  function initModLab() {
    var root = document.querySelector("[data-mod-lab]");
    if (!root) return;
    var chips    = root.querySelectorAll(".mod-lab__chip");
    var propEls  = root.querySelectorAll("[data-prop]");
    var insightEl = root.querySelector(".mod-lab__insight");
    var MODS = {
      "OH":  { hbond:"up", hydro:"down", polarity:"up", lipo:"down", perm:"down", steric:"neutral",
               insight:"OH group을 추가한 위치에 H-bond partner가 존재하는가? Desolvation penalty가 interaction gain보다 크지 않은가? Permeability 감소 예상." },
      "NH2": { hbond:"up", hydro:"down", polarity:"up", lipo:"down", perm:"down", steric:"neutral",
               insight:"NH₂의 pKa와 pocket environment를 확인. Charged form과 neutral form이 서로 다른 interaction을 만든다. → 3강 pKa 학습 필요." },
      "F":   { hbond:"neutral", hydro:"neutral", polarity:"neutral", lipo:"neutral", perm:"up", steric:"neutral",
               insight:"F는 weak HBA이지만 주효과는 metabolic blocking과 electronic/conformational 조절. 'H-bond acceptor 추가'로만 보면 실패한다." },
      "CH3": { hbond:"neutral", hydro:"up", polarity:"neutral", lipo:"up", perm:"neutral", steric:"up",
               insight:"CH₃ → cavity filling + lipophilicity 동시 변화. Potency 개선 원인이 hydrophobic contact인지 conformational 변화인지 analogue series로 분리해야 함." },
      "Ph":  { hbond:"neutral", hydro:"up", polarity:"neutral", lipo:"up", perm:"down", steric:"up",
               insight:"Phenyl → MW + LogP 대폭 증가. Off-target binding, metabolic liability 동시 증가. Potency gain이 compound quality loss를 정당화하는가?" }
    };
    var ARROWS = { up:"↑", down:"↓", neutral:"–" };
    var CLS = { up:"mod-lab__prop-arrow--up", down:"mod-lab__prop-arrow--down", neutral:"mod-lab__prop-arrow--neutral" };
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        var d = MODS[chip.getAttribute("data-mod")];
        if (!d) return;
        propEls.forEach(function (el) {
          var p = el.getAttribute("data-prop");
          var v = d[p] || "neutral";
          var arr = el.querySelector(".mod-lab__prop-arrow");
          if (arr) { arr.textContent = ARROWS[v]; arr.className = "mod-lab__prop-arrow " + CLS[v]; }
        });
        if (insightEl) insightEl.textContent = d.insight;
      });
    });
    if (chips.length) chips[0].click();
  }

  /* =========================================================
     L02 · V10 — AI Interaction Audit  (data-ai-audit)
     ========================================================= */
  function initAiAudit() {
    var root = document.querySelector("[data-ai-audit]");
    if (!root) return;
    var items   = root.querySelectorAll(".ai-audit__item");
    var scoreEl = root.querySelector(".ai-audit__score");
    var resultEl = root.querySelector(".ai-audit__result");
    var wrongItems = Array.prototype.filter.call(items, function (i) { return i.getAttribute("data-wrong") === "true"; });
    var found = 0;
    items.forEach(function (item) {
      item.addEventListener("click", function () {
        if (item.classList.contains("verified") || item.classList.contains("flagged")) return;
        var wrong = item.getAttribute("data-wrong") === "true";
        var badge = item.querySelector(".ai-audit__badge");
        if (wrong) {
          item.classList.add("flagged");
          if (badge) { badge.textContent = "⚠ 문제 발견"; badge.className = "ai-audit__badge ai-audit__badge--wrong"; }
          found++;
        } else {
          item.classList.add("verified");
          if (badge) { badge.textContent = "✓ 확인됨"; badge.className = "ai-audit__badge ai-audit__badge--valid"; }
        }
        if (scoreEl) scoreEl.textContent = "오류 발견: " + found + " / " + wrongItems.length;
        if (found >= wrongItems.length && resultEl) {
          resultEl.textContent = "✓ 모든 오류 발견! AI가 interaction을 labeling해도 반드시 검증이 필요합니다.";
          resultEl.className = "ai-audit__result ai-audit__result--success";
        }
      });
    });
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

  /* ============================================================
     L03 · pKa / Ionization / logP / logD — 13 Visualizations
     ============================================================ */

  /* V1: Protonation Slider */
  function initProtSlider() {
    var el = document.querySelector('[data-prot-slider]');
    if (!el) return;
    var slider = el.querySelector('.prot-ph-slider');
    var phVal  = el.querySelector('.prot-ph-val');
    var fillBH = el.querySelector('.prot-bar-fill--bh');
    var fillB  = el.querySelector('.prot-bar-fill--b');
    var pctBH  = el.querySelector('.prot-bar-pct--bh');
    var pctB   = el.querySelector('.prot-bar-pct--b');
    var dec    = el.querySelector('.prot-decision');
    var pKa    = parseFloat(el.dataset.pka || '8.5');
    function update() {
      var pH = parseFloat(slider.value);
      phVal.textContent = pH.toFixed(1);
      var ratio = Math.pow(10, pKa - pH);
      var bhPct = Math.round(ratio / (1 + ratio) * 100);
      var bPct  = 100 - bhPct;
      fillBH.style.width = bhPct + '%';
      fillB.style.width  = bPct  + '%';
      pctBH.textContent  = bhPct + '%';
      pctB.textContent   = bPct  + '%';
      dec.className = 'prot-decision';
      if (bhPct >= 90)      { dec.classList.add('prot-decision--protonated'); dec.textContent = 'BH⁺ 우세 — 대부분 protonated (pH ≪ pKa)'; }
      else if (bPct >= 90)  { dec.classList.add('prot-decision--neutral');    dec.textContent = 'B 우세 — 대부분 neutral (pH ≫ pKa)'; }
      else                  { dec.classList.add('prot-decision--mixed');       dec.textContent = 'BH⁺ / B 혼재 (pH ≈ pKa)'; }
    }
    slider.addEventListener('input', update);
    update();
  }

  /* V2: Acid/Base Mirror */
  function initAcidBaseMirror() {
    var el = document.querySelector('[data-acid-base-mirror]');
    if (!el) return;
    var btns = el.querySelectorAll('.abm-toggle-btn');
    var rows = el.querySelector('.abm-rows');
    var ruleEl = el.querySelector('.abm-rule');
    var acidData = [
      { ph:'Low pH',  charge:'0',  name:'R–COOH (neutral)' },
      { ph:'pH = pKa', charge:'−½',name:'50% each' },
      { ph:'High pH', charge:'−',  name:'R–COO⁻ (ionized)' }
    ];
    var baseData = [
      { ph:'Low pH',  charge:'+',  name:'R–NH₃⁺ (protonated)' },
      { ph:'pH = pKa', charge:'+½',name:'50% each' },
      { ph:'High pH', charge:'0',  name:'R–NH₂ (neutral)' }
    ];
    var acidRule = 'pH 상승 → 더 많이 ionized (음전하 증가)';
    var baseRule = 'pH 상승 → neutral fraction 증가 (양전하 감소)';
    function render(data, rule) {
      rows.innerHTML = data.map(function(d) {
        var cls = d.charge === '+' || d.charge === '+½' ? 'abm-charge--pos' : d.charge === '−' || d.charge === '−½' ? 'abm-charge--neg' : 'abm-charge--0';
        return '<div class="abm-row"><span class="abm-ph-label">' + d.ph + '</span><span class="abm-charge ' + cls + '">' + d.charge + '</span><span class="abm-species-name">' + d.name + '</span></div>';
      }).join('');
      ruleEl.textContent = rule;
    }
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        btns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        if (btn.dataset.type === 'acid') render(acidData, acidRule);
        else render(baseData, baseRule);
      });
    });
    render(baseData, baseRule);
  }

  /* V3: 10× Rule Trainer */
  function initTenRule() {
    var el = document.querySelector('[data-ten-rule]');
    if (!el) return;
    var pkaEl    = el.querySelector('.ten-rule__pka');
    var modeEl   = el.querySelector('.ten-rule__mode-tag');
    var choiceBtns = el.querySelectorAll('.ten-rule__choice-btn');
    var ratioEl  = el.querySelector('.ten-rule__ratio');
    var labelEl  = el.querySelector('.ten-rule__ratio-label');
    var scoreEl  = el.querySelector('.ten-rule__score');
    var prevBtn  = el.querySelector('.ten-rule__prev');
    var nextBtn  = el.querySelector('.ten-rule__next');
    var cards = [
      { pKa:7.0, mode:'base', pH:5.0, ratio:'100:1 (BH⁺:B)', hint:'pH가 pKa보다 2 낮음 → protonated 100배 많음' },
      { pKa:7.0, mode:'base', pH:7.0, ratio:'1:1 (BH⁺:B)',    hint:'pH = pKa → 50:50' },
      { pKa:7.0, mode:'base', pH:9.0, ratio:'1:100 (BH⁺:B)',  hint:'pH가 pKa보다 2 높음 → neutral 100배 많음' },
      { pKa:4.5, mode:'acid', pH:4.5, ratio:'1:1 (HA:A⁻)',    hint:'pH = pKa → 50:50' },
      { pKa:4.5, mode:'acid', pH:7.4, ratio:'~1:800 (HA:A⁻)', hint:'pH가 pKa보다 ~3 높음 → 거의 모두 ionized' }
    ];
    var current = 0;
    var correct = 0;
    var answered = false;
    var pHChoices = [
      [5.0, 6.0, 7.0, 9.0],
      [5.0, 6.0, 7.0, 8.0],
      [6.0, 7.0, 8.0, 9.0],
      [3.5, 4.5, 6.0, 7.4],
      [4.5, 5.5, 6.5, 7.4]
    ];
    function render() {
      var c = cards[current];
      pkaEl.textContent = 'pKa = ' + c.pKa;
      modeEl.textContent = c.mode === 'acid' ? 'Weak Acid' : 'Weak Base';
      modeEl.className = 'ten-rule__mode-tag ten-rule__mode-tag--' + c.mode;
      ratioEl.textContent = '—';
      labelEl.textContent = 'pH를 선택하면 비율이 나옵니다';
      answered = false;
      choiceBtns.forEach(function(btn, i) {
        btn.className = 'ten-rule__choice-btn';
        btn.textContent = 'pH ' + pHChoices[current][i];
        btn.dataset.ph = pHChoices[current][i];
      });
      scoreEl.textContent = correct + '/' + cards.length;
    }
    choiceBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (answered) return;
        answered = true;
        var pH = parseFloat(btn.dataset.ph);
        var c = cards[current];
        if (pH === c.pH) {
          btn.classList.add('correct');
          ratioEl.textContent = c.ratio;
          labelEl.textContent = c.hint;
          correct++;
        } else {
          btn.classList.add('wrong');
          choiceBtns.forEach(function(b) { if (parseFloat(b.dataset.ph) === c.pH) b.classList.add('correct'); });
          ratioEl.textContent = c.ratio;
          labelEl.textContent = c.hint;
        }
        scoreEl.textContent = correct + '/' + cards.length;
      });
    });
    nextBtn.addEventListener('click', function() { current = (current + 1) % cards.length; render(); });
    prevBtn.addEventListener('click', function() { current = (current - 1 + cards.length) % cards.length; render(); });
    render();
  }

  /* V4: Membrane Crossing (static with toggle) */
  function initMembraneCrossing() {
    var el = document.querySelector('[data-membrane-crossing]');
    if (!el) return;
    /* Static – no additional interaction needed */
  }

  /* V5: Solubility/Permeability Balance */
  function initSolPermBalance() {
    var el = document.querySelector('[data-sol-perm-balance]');
    if (!el) return;
    var slider = el.querySelector('.spb-ph-slider');
    var phVal  = el.querySelector('.spb-ph-val');
    var marker = el.querySelector('.spb-marker');
    var pKa    = parseFloat(el.dataset.pka || '8.5');
    function update() {
      var pH = parseFloat(slider.value);
      phVal.textContent = pH.toFixed(1);
      var ratio = Math.pow(10, pKa - pH);
      var bhPct = ratio / (1 + ratio);
      var pos = bhPct * 100;
      marker.style.left = pos + '%';
    }
    slider.addEventListener('input', update);
    update();
  }

  /* V6: logP/logD Partition */
  function initLogPDPartition() {
    var el = document.querySelector('[data-logpd-partition]');
    if (!el) return;
    var modeBtns  = el.querySelectorAll('.lpp-mode-btn');
    var octanel   = el.querySelector('.lpp-octanol');
    var waterEl   = el.querySelector('.lpp-water');
    var phRow     = el.querySelector('.lpp-ph-row');
    var phSlider  = el.querySelector('.lpp-ph-slider');
    var phNum     = el.querySelector('.lpp-ph-num');
    var logdDisp  = el.querySelector('.lpp-logd-display');
    var pKa       = parseFloat(el.dataset.pka || '9.0');
    var logP      = parseFloat(el.dataset.logp || '2.0');
    var totalMols = 12;

    function renderMols(octCount, watCount, type) {
      octanel.querySelectorAll('.lpp-mol-dot').forEach(function(d) { d.remove(); });
      waterEl.querySelectorAll('.lpp-mol-dot').forEach(function(d) { d.remove(); });
      for (var i = 0; i < octCount; i++) {
        var d = document.createElement('div');
        d.className = 'lpp-mol-dot lpp-mol-dot--' + type;
        d.textContent = type === 'n' ? 'B' : 'BH';
        octanel.appendChild(d);
      }
      for (var j = 0; j < watCount; j++) {
        var d2 = document.createElement('div');
        d2.className = 'lpp-mol-dot lpp-mol-dot--' + (type === 'n' ? 'n' : 'c');
        d2.textContent = type === 'n' ? 'B' : 'BH';
        waterEl.appendChild(d2);
      }
    }

    function renderLogP() {
      var oct = Math.round(totalMols * (Math.pow(10, logP) / (1 + Math.pow(10, logP))));
      renderMols(oct, totalMols - oct, 'n');
      logdDisp.textContent = 'logP = ' + logP.toFixed(1) + ' (neutral species only)';
    }

    function renderLogD() {
      var pH    = parseFloat(phSlider.value);
      var fneu  = 1 / (1 + Math.pow(10, pKa - pH));
      var logD  = logP + Math.log10(fneu);
      var oct   = Math.round(totalMols * (Math.pow(10, logD) / (1 + Math.pow(10, logD))));
      oct = Math.max(0, Math.min(totalMols, oct));
      var neuInOct = Math.round(oct * fneu);
      var bhInOct  = oct - neuInOct;
      var bhInWat  = Math.round((totalMols - oct) * (1 - fneu));
      var neuInWat = (totalMols - oct) - bhInWat;
      octanel.querySelectorAll('.lpp-mol-dot').forEach(function(d) { d.remove(); });
      waterEl.querySelectorAll('.lpp-mol-dot').forEach(function(d) { d.remove(); });
      for (var i = 0; i < neuInOct; i++) { var d = document.createElement('div'); d.className='lpp-mol-dot lpp-mol-dot--n'; d.textContent='B'; octanel.appendChild(d); }
      for (var i = 0; i < bhInOct;  i++) { var d = document.createElement('div'); d.className='lpp-mol-dot lpp-mol-dot--c'; d.textContent='BH'; octanel.appendChild(d); }
      for (var i = 0; i < neuInWat; i++) { var d = document.createElement('div'); d.className='lpp-mol-dot lpp-mol-dot--n'; d.textContent='B'; waterEl.appendChild(d); }
      for (var i = 0; i < bhInWat;  i++) { var d = document.createElement('div'); d.className='lpp-mol-dot lpp-mol-dot--c'; d.textContent='BH'; waterEl.appendChild(d); }
      logdDisp.textContent = 'logD (pH ' + pH.toFixed(1) + ') ≈ ' + logD.toFixed(1) + ' | logP = ' + logP.toFixed(1);
    }

    var mode = 'logp';
    modeBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        modeBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        mode = btn.dataset.mode;
        phRow.style.display = mode === 'logd' ? 'flex' : 'none';
        if (mode === 'logp') renderLogP();
        else renderLogD();
      });
    });
    phSlider.addEventListener('input', function() {
      phNum.textContent = parseFloat(phSlider.value).toFixed(1);
      renderLogD();
    });
    phRow.style.display = 'none';
    renderLogP();
  }

  /* V7: logD-pH Curve (SVG, static) */
  function initLogDCurve() {
    /* Static SVG rendered in HTML */
  }

  /* V8: Ibuprofen Story */
  function initIbuprofenStory() {
    var el = document.querySelector('[data-ib-story]');
    if (!el) return;
    var tabs = el.querySelectorAll('.ib-tab-btn');
    var content = el.querySelector('.ib-content');
    var moreBtn  = el.querySelector('.ib-more-btn');
    var moreBody = el.querySelector('.ib-more-body');
    var scenarios = [
      { label:'Gastric',    badgeClass:'ib-ph-badge--gastric',    phText:'pH ~2', neutral:99, ionized:1,  note:'위산성 환경. R–COOH(neutral) 형태가 거의 대부분.' },
      { label:'Intestinal', badgeClass:'ib-ph-badge--intestinal', phText:'pH ~6', neutral:3,  ionized:97, note:'소장. pKa 4.5에서 pH 6은 ~1.5 unit 높음 → COO⁻ 우세.' },
      { label:'Plasma',     badgeClass:'ib-ph-badge--plasma',     phText:'pH 7.4', neutral:1, ionized:99, note:'혈장. 거의 모두 COO⁻ 상태.' }
    ];
    function showScenario(idx) {
      tabs.forEach(function(t, i) { t.classList.toggle('active', i === idx); });
      var s = scenarios[idx];
      content.innerHTML = '<span class="ib-ph-badge ' + s.badgeClass + '">' + s.phText + '</span>' +
        '<div class="ib-species-display">' +
        '<div class="ib-sp-row"><span class="ib-sp-label">R–COOH</span><div class="ib-sp-track"><div class="ib-sp-fill ib-sp-fill--neutral" style="width:' + s.neutral + '%"></div></div><span class="ib-sp-pct">' + s.neutral + '%</span></div>' +
        '<div class="ib-sp-row"><span class="ib-sp-label">R–COO⁻</span><div class="ib-sp-track"><div class="ib-sp-fill ib-sp-fill--ionized" style="width:' + s.ionized + '%"></div></div><span class="ib-sp-pct">' + s.ionized + '%</span></div>' +
        '</div>' +
        '<p style="font-size:13px;color:var(--ink-soft);">' + s.note + '</p>' +
        '<button class="ib-more-btn">"Absorption ≠ ionization alone" → 자세히 보기</button>' +
        '<div class="ib-more-body"><ul>' +
        '<li>소장은 표면적이 매우 크다 (villi, microvilli)</li>' +
        '<li>산성 약도 소장에서 대부분 흡수</li>' +
        '<li>Residence time, 혈류, transporter, formulation도 기여</li>' +
        '<li>단순한 "위에서만 흡수" 암기는 불완전한 모델</li>' +
        '</ul></div>';
      var mb = content.querySelector('.ib-more-btn');
      var mbody = content.querySelector('.ib-more-body');
      if (mb && mbody) {
        mb.addEventListener('click', function() { mbody.classList.toggle('show'); mb.textContent = mbody.classList.contains('show') ? '접기 ▲' : '"Absorption ≠ ionization alone" → 자세히 보기'; });
      }
    }
    tabs.forEach(function(t, i) { t.addEventListener('click', function() { showScenario(i); }); });
    showScenario(0);
  }

  /* V9: Ion Trapping */
  function initIonTrap() {
    var el = document.querySelector('[data-ion-trap]');
    if (!el) return;
    var slider  = el.querySelector('.it-lyso-slider');
    var phCtrl  = el.querySelector('.it-lyso-ph-ctrl');
    var lysoPhEl = el.querySelector('.it-lyso-ph');
    var molsArea = el.querySelector('.it-mols-area');
    var infoEl  = el.querySelector('.it-info');
    var pKa = parseFloat(el.dataset.pka || '8.5');
    function update() {
      var pH = parseFloat(slider.value);
      phCtrl.textContent  = 'pH ' + pH.toFixed(1);
      lysoPhEl.textContent = 'pH ' + pH.toFixed(1);
      var ratio = Math.pow(10, pKa - pH);
      var bhPct = Math.round(ratio / (1 + ratio) * 100);
      molsArea.innerHTML = '';
      for (var i = 0; i < 8; i++) {
        var mol = document.createElement('div');
        var isCharged = (i / 8 * 100) < bhPct;
        mol.className = 'it-mol ' + (isCharged ? 'it-mol--bh' : 'it-mol--b');
        mol.textContent = isCharged ? 'BH' : 'B';
        mol.style.animationDelay = (i * 50) + 'ms';
        molsArea.appendChild(mol);
      }
      if (bhPct >= 90)     infoEl.textContent = 'Lysosome (pH ' + pH.toFixed(1) + '): BH⁺ ' + bhPct + '% 축적 — ion trapping 활발';
      else if (bhPct >= 50) infoEl.textContent = 'Lysosome (pH ' + pH.toFixed(1) + '): 혼재 상태 — BH⁺ ' + bhPct + '%';
      else                  infoEl.textContent = 'Lysosome (pH ' + pH.toFixed(1) + '): 중성에 가까움 — 축적 적음';
    }
    slider.addEventListener('input', update);
    update();
  }

  /* V10: pKa Tuning Lab */
  function initPkaTuning() {
    var el = document.querySelector('[data-pka-tuning]');
    if (!el) return;
    var btns = el.querySelectorAll('.pkt-btn');
    var fills = {
      binding:  el.querySelector('.pkt-fill--binding'),
      neutral:  el.querySelector('.pkt-fill--neutral'),
      perm:     el.querySelector('.pkt-fill--perm'),
      solub:    el.querySelector('.pkt-fill--solub')
    };
    var analogues = {
      high:   { binding:85, neutral:15, perm:20, solub:60, label:'High pKa (~10.5) — 거의 전부 protonated' },
      medium: { binding:60, neutral:50, perm:55, solub:70, label:'Medium pKa (~8.5) — 혼재 상태' },
      low:    { binding:30, neutral:85, perm:80, solub:55, label:'Low pKa (~6.5) — neutral fraction 높음' }
    };
    var noteEl = el.querySelector('.pkt-note');
    function render(key) {
      var a = analogues[key];
      btns.forEach(function(b) { b.classList.toggle('active', b.dataset.analogue === key); });
      Object.keys(fills).forEach(function(k) { if (fills[k]) fills[k].style.width = a[k] + '%'; });
      if (noteEl) noteEl.textContent = a.label + ' (교육용 예시 — 실제 값은 측정 필요)';
    }
    btns.forEach(function(btn) { btn.addEventListener('click', function() { render(btn.dataset.analogue); }); });
    render('medium');
  }

  /* V11: AI Protonation Failure */
  function initAiProtFail() {
    var el = document.querySelector('[data-ai-prot-fail]');
    if (!el) return;
    var tabs = el.querySelectorAll('.apf-tab-btn');
    var aiPanel  = el.querySelector('.apf-panel--ai');
    var realPanel = el.querySelector('.apf-panel--real');
    var msgEl    = el.querySelector('.apf-msg');
    var states = {
      off: {
        ai:   '<div class="apf-panel-title">AI Input</div><div class="apf-panel-data">Molecule X<br>SMILES: …<br>Assay A: IC50 = 10 nM<br>Assay B: IC50 = 5 µM</div>',
        real: '<div class="apf-panel-title">실제 Condition</div><div class="apf-panel-data">Assay A: pH 6.0<br>Assay B: pH 8.0<br>Molecule X: pKa 7.2</div>',
        msg:  'conflict', msgText: 'AI는 같은 molecule에서 1000배 차이를 노이즈로 볼 수 있다'
      },
      on: {
        ai:   '<div class="apf-panel-title">AI Input (pH 포함)</div><div class="apf-panel-data">Molecule X<br>Assay A: pH 6.0, BH⁺ ~94%<br>Assay B: pH 8.0, B ~86%</div>',
        real: '<div class="apf-panel-title">실제 Condition</div><div class="apf-panel-data">pH 차이로 charge state가 다름<br>→ permeability, binding mode 차이<br>→ 모순이 아닌 pH-dependent behavior</div>',
        msg:  'explained', msgText: 'pH 메타데이터가 있으면 activity discrepancy가 설명된다'
      }
    };
    function render(mode) {
      tabs.forEach(function(t) { t.classList.toggle('active', t.dataset.meta === mode); });
      aiPanel.innerHTML   = states[mode].ai;
      realPanel.innerHTML = states[mode].real;
      msgEl.className = 'apf-msg apf-msg--' + states[mode].msg;
      msgEl.textContent = states[mode].msgText;
    }
    tabs.forEach(function(t) { t.addEventListener('click', function() { render(t.dataset.meta); }); });
    render('off');
  }

  /* V12: Property Cascade */
  function initPropCascade() {
    var el = document.querySelector('[data-prop-cascade]');
    if (!el) return;
    el.querySelectorAll('.pcasc-node').forEach(function(node) {
      node.addEventListener('click', function() {
        var wasOpen = node.classList.contains('open');
        el.querySelectorAll('.pcasc-node').forEach(function(n) { n.classList.remove('open'); });
        el.querySelectorAll('.pcasc-detail').forEach(function(d) { d.classList.remove('open'); });
        if (!wasOpen) {
          node.classList.add('open');
          var det = node.nextElementSibling;
          if (det && det.classList.contains('pcasc-detail')) det.classList.add('open');
        }
      });
    });
  }

  /* V13: Scientist Decision Flow */
  function initSciDecision() {
    var el = document.querySelector('[data-sci-decision]');
    if (!el) return;
    var choiceBtns = el.querySelectorAll('.scd-choice-btn');
    var branches   = el.querySelectorAll('.scd-branch');
    var resetBtn   = el.querySelector('.scd-reset-btn');
    choiceBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        choiceBtns.forEach(function(b) { b.classList.remove('selected'); });
        branches.forEach(function(b) { b.classList.remove('show'); });
        btn.classList.add('selected');
        var target = btn.dataset.branch;
        var branch = el.querySelector('.scd-branch[data-branch="' + target + '"]');
        if (branch) {
          branch.classList.add('show');
          branch.querySelectorAll('.scd-step').forEach(function(step, i) {
            step.style.animationDelay = (i * 120) + 'ms';
          });
        }
      });
    });
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        choiceBtns.forEach(function(b) { b.classList.remove('selected'); });
        branches.forEach(function(b) { b.classList.remove('show'); });
      });
    }
  }

  /* ---------- DOMContentLoaded ---------- */
  /* ============================================================
     L05 – Functional Group 별 성질
     ============================================================ */

  var FG_DATA = {
    OH:   { hbd:'✓', hba:'✓', ion:'중성 (pH 7.4)', polar:'높음', lipo:'낮춤', metab:'oxidation / glucuronidation', bind:'H-bond donor + acceptor' },
    OMe:  { hbd:'✗', hba:'✓', ion:'중성', polar:'중간', lipo:'증가', metab:'O-dealkylation 가능', bind:'H-bond acceptor' },
    NH2:  { hbd:'✓', hba:'✓', ion:'pKa ~10 → 대부분 BH⁺', polar:'높음', lipo:'낮춤', metab:'N-dealkylation / oxidation', bind:'salt bridge / H-bond' },
    NHAc: { hbd:'✓', hba:'✓ (C=O)', ion:'매우 약한 base', polar:'중간', lipo:'다양', metab:'amide 가수분해', bind:'H-bond donor(NH) + acceptor(C=O)' },
    COOH: { hbd:'✓', hba:'✓', ion:'pH 7.4 → 대부분 COO⁻', polar:'매우 높음', lipo:'낮춤', metab:'acyl glucuronidation', bind:'ionic + H-bond' },
    COOEt:{ hbd:'✗', hba:'✓', ion:'중성', polar:'중간', lipo:'증가', metab:'ester hydrolysis', bind:'H-bond acceptor (C=O)' },
    CN:   { hbd:'✗', hba:'약한 ✓', ion:'중성', polar:'낮은 편', lipo:'약간 낮춤', metab:'상대적으로 안정', bind:'dipolar / weak HBA' }
  };

  function initFgInspector() {
    document.querySelectorAll('[data-fg-inspector]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('.fgi-group-btn');
      var cards = wrap.querySelectorAll('.fgi-card');
      var keys = ['hbd','hba','ion','polar','lipo','metab','bind'];

      function update(grp) {
        btns.forEach(function(b){ b.classList.toggle('active', b.dataset.grp === grp); });
        var d = FG_DATA[grp] || {};
        cards.forEach(function(card, i) {
          var val = card.querySelector('.fgi-card-val');
          if (!val || !keys[i]) return;
          val.textContent = d[keys[i]] || '—';
          val.className = 'fgi-card-val';
          var v = d[keys[i]] || '';
          if (v === '✓' || v.startsWith('✓')) val.classList.add('fgi-card-val--yes');
          else if (v === '✗') val.classList.add('fgi-card-val--no');
          else if (v.includes('가능') || v.includes('가수')) val.classList.add('fgi-card-val--warn');
          else val.classList.add('fgi-card-val--neutral');
        });
      }

      btns.forEach(function(b){ b.addEventListener('click', function(){ update(b.dataset.grp); }); });
      update('OH');
    });
  }

  var AET_DATA = {
    oh: { hbd:'✓', hba:'✓', polar:'높음', lipo:'낮음', metab:'oxidation / conjugation' },
    ome:{ hbd:'✗', hba:'✓', polar:'중간', lipo:'높음', metab:'O-dealkylation 가능' }
  };

  function initAlcEther() {
    document.querySelectorAll('[data-alc-ether]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('.aet-toggle-btn');
      var rows = wrap.querySelectorAll('.aet-row');
      var labels = ['HBD','HBA','Polarity','Lipophilicity','Metabolism'];
      var keys   = ['hbd','hba','polar','lipo','metab'];

      function update(mode) {
        btns.forEach(function(b){ b.classList.toggle('active', b.dataset.mol === mode); });
        var d = AET_DATA[mode] || {};
        rows.forEach(function(row, i) {
          var lbl = row.querySelector('.aet-row-label');
          var val = row.querySelector('.aet-row-val');
          if (!lbl || !val) return;
          lbl.textContent = labels[i] || '';
          val.textContent = d[keys[i]] || '—';
          val.className = 'aet-row-val';
          var v = d[keys[i]] || '';
          if (v === '✓') val.classList.add('aet-row-val--yes');
          else if (v === '✗') val.classList.add('aet-row-val--no');
          else if (v.includes('높') || v.includes('증가')) val.classList.add('aet-row-val--up');
          else if (v.includes('낮') || v.includes('감소')) val.classList.add('aet-row-val--down');
          else val.style.color = 'var(--ink-soft)';
        });
      }

      btns.forEach(function(b){ b.addEventListener('click', function(){ update(b.dataset.mol); }); });
      update('oh');
    });
  }

  var AMINE_STATES = {
    primary:   {
      neutral:    { hbd:'✓ (NH₂)', hba:'✓ (N)', charge:'중성', inter:'H-bond donor/acceptor' },
      protonated: { hbd:'✓ (NH₃⁺)', hba:'↓', charge:'+ 양전하', inter:'salt bridge / solvation' }
    },
    secondary:  {
      neutral:    { hbd:'✓ (NH)', hba:'✓ (N)', charge:'중성', inter:'H-bond donor/acceptor' },
      protonated: { hbd:'✓ (NH₂⁺)', hba:'↓', charge:'+ 양전하', inter:'salt bridge' }
    },
    tertiary:   {
      neutral:    { hbd:'✗', hba:'✓ (N)', charge:'중성', inter:'H-bond acceptor' },
      protonated: { hbd:'✗', hba:'변화', charge:'+ 양전하', inter:'ionic center' }
    }
  };

  function initAmineCards() {
    document.querySelectorAll('[data-amine-cards]').forEach(function(wrap) {
      wrap.querySelectorAll('.amc-card').forEach(function(card) {
        var type = card.dataset.amine;
        var btns = card.querySelectorAll('.amc-state-btn');
        var propVals = card.querySelectorAll('.amc-prop-val');
        var propKeys = ['hbd','hba','charge','inter'];

        function update(state) {
          btns.forEach(function(b){ b.classList.toggle('active', b.dataset.state === state); });
          var d = (AMINE_STATES[type] || {})[state] || {};
          propVals.forEach(function(v, i){ v.textContent = d[propKeys[i]] || '—'; });
        }

        btns.forEach(function(b){ b.addEventListener('click', function(){ update(b.dataset.state); }); });
        update('neutral');
      });
    });
  }

  function initAmideResonance() {
    document.querySelectorAll('[data-amide-resonance]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('.ar-toggle-btn');
      var consRows = wrap.querySelectorAll('.ar-cons-row');

      var DATA = {
        amide: [
          { label:'N basicity', val:'매우 낮음', cls:'ar-cons-val--red' },
          { label:'N as HBA?',  val:'아니오',   cls:'ar-cons-val--red' },
          { label:'C–N rotation',val:'제한됨',  cls:'ar-cons-val--red' },
          { label:'Planarity',  val:'높음',     cls:'ar-cons-val--off' }
        ],
        amine: [
          { label:'N basicity', val:'높음',     cls:'ar-cons-val--off' },
          { label:'N as HBA?',  val:'가능',     cls:'ar-cons-val--off' },
          { label:'C–N rotation',val:'자유로움', cls:'ar-cons-val--off' },
          { label:'Planarity',  val:'낮음',     cls:'ar-cons-val--red' }
        ]
      };

      function update(mode) {
        btns.forEach(function(b){ b.classList.toggle('active', b.dataset.mode === mode); });
        var rows = DATA[mode] || DATA['amide'];
        consRows.forEach(function(row, i) {
          if (!rows[i]) return;
          var lbl = row.querySelector('.ar-cons-label');
          var val = row.querySelector('.ar-cons-val');
          if (lbl) lbl.textContent = rows[i].label;
          if (val) { val.textContent = rows[i].val; val.className = 'ar-cons-val ' + rows[i].cls; }
        });
      }

      btns.forEach(function(b){ b.addEventListener('click', function(){ update(b.dataset.mode); }); });
      update('amide');
    });
  }

  function initAcidEster() {
    document.querySelectorAll('[data-acid-ester]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('.aes-toggle-btn');
      var phSlider = wrap.querySelector('.aes-ph-slider');
      var phVal    = wrap.querySelector('.aes-ph-val');
      var propRows = wrap.querySelectorAll('.aes-prop-row');
      var labels   = ['Charge at pH','HBD','HBA','Permeability tendency','Hydrolysis risk'];
      var keys     = ['charge','hbd','hba','perm','hydro'];
      var mode = 'acid';

      var DATA = {
        acid: function(ph) {
          var ionized = ph > 4.5;
          return {
            charge: ionized ? '음전하 (COO⁻)' : '중성 (COOH)',
            hbd: '✓', hba: '✓',
            perm: ionized ? '낮음' : '중간',
            hydro: '낮음'
          };
        },
        ester: function(ph) {
          return { charge:'중성', hbd:'✗', hba:'✓', perm:'높음', hydro:'가능 (esterase)' };
        }
      };

      function update() {
        var ph = phSlider ? +phSlider.value : 7.4;
        if (phVal) phVal.textContent = ph.toFixed(1);
        var d = (DATA[mode] || DATA['acid'])(ph);
        propRows.forEach(function(row, i) {
          var lbl = row.querySelector('.aes-prop-label');
          var val = row.querySelector('.aes-prop-val');
          if (!lbl || !val) return;
          if (i === 0) lbl.textContent = 'Charge at pH ' + ph.toFixed(1);
          else lbl.textContent = labels[i];
          val.textContent = d[keys[i]] || '—';
          val.className = 'aes-prop-val';
          var v = d[keys[i]] || '';
          if (v === '✓' || v === '높음' || v === '중성')  val.classList.add('aes-prop-val--pos');
          else if (v === '✗' || v === '낮음' || v.includes('음전')) val.classList.add('aes-prop-val--neg');
          else if (v.includes('가능')) val.classList.add('aes-prop-val--warn');
          else val.classList.add('aes-prop-val--neu');
        });
      }

      btns.forEach(function(b){
        b.addEventListener('click', function(){ mode = b.dataset.mol; btns.forEach(function(x){ x.classList.toggle('active', x.dataset.mol === mode); }); update(); });
      });
      if (phSlider) phSlider.addEventListener('input', update);
      update();
    });
  }

  var HETERO_DATA = {
    pyridine:  { hba:true,  hbd:false, explain:'N lone pair는 aromatic sextet에 참여하지 않음 → HBA 가능, protonation 가능. HBD 없음.' },
    pyrrole:   { hba:false, hbd:true,  explain:'N lone pair가 aromaticity에 참여 → HBA 아님. N–H → HBD 가능.' },
    imidazole: { hba:true,  hbd:true,  explain:'pyridine-like N (HBA) + pyrrole-like N–H (HBD) 공존. Tautomerism도 가능.' },
    indole:    { hba:false, hbd:true,  explain:'N lone pair가 aromatic system에 참여. N–H → HBD. HBA 아님.' },
    pyrazole:  { hba:true,  hbd:true,  explain:'두 N 중 하나는 pyridine-like (HBA), 하나는 pyrrole-like (HBD 가능).' }
  };

  function initHeteroQuiz() {
    document.querySelectorAll('[data-hetero-quiz]').forEach(function(wrap) {
      var structBtns = wrap.querySelectorAll('.hq-struct-btn');
      var questionArea = wrap.querySelector('.hq-question-area');
      var scoreEl = wrap.querySelector('.hq-score');
      var current = null;
      var scores = { correct:0, total:0 };
      var QUESTIONS = [
        { text:'이 N이 H-bond Acceptor(HBA)로 작동할 수 있는가?', key:'hba' },
        { text:'이 N–H가 H-bond Donor(HBD)로 작동할 수 있는가?', key:'hbd' }
      ];
      var qIdx = 0;

      function showQuestion() {
        if (!current || !questionArea) return;
        var q = QUESTIONS[qIdx % QUESTIONS.length];
        var qEl = questionArea.querySelector('.hq-question');
        var btns = questionArea.querySelectorAll('.hq-answer-btn');
        var result = questionArea.querySelector('.hq-result');
        if (qEl) qEl.textContent = current + ': ' + q.text;
        if (btns) { btns.forEach(function(b){ b.classList.remove('correct','incorrect'); }); }
        if (result) { result.className = 'hq-result'; result.textContent = ''; }
      }

      structBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          structBtns.forEach(function(b){ b.classList.remove('selected'); });
          btn.classList.add('selected');
          current = btn.dataset.ring;
          qIdx = 0;
          showQuestion();
        });
      });

      if (questionArea) {
        questionArea.querySelectorAll('.hq-answer-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            if (!current) return;
            var d = HETERO_DATA[current];
            var q = QUESTIONS[qIdx % QUESTIONS.length];
            var userAns = btn.dataset.ans === 'yes';
            var correct = userAns === d[q.key];
            btn.classList.add(correct ? 'correct' : 'incorrect');
            scores.total++;
            if (correct) scores.correct++;
            var result = questionArea.querySelector('.hq-result');
            if (result) {
              result.className = 'hq-result ' + (correct ? 'hq-result--ok' : 'hq-result--bad');
              result.textContent = (correct ? '✓ 정답! ' : '✗ 틀렸습니다. ') + d.explain;
            }
            if (scoreEl) scoreEl.textContent = scores.correct + '/' + scores.total;
            qIdx++;
            setTimeout(function() {
              var btns2 = questionArea.querySelectorAll('.hq-answer-btn');
              btns2.forEach(function(b){ b.classList.remove('correct','incorrect'); });
              if (result) { result.className = 'hq-result'; result.textContent = ''; }
              showQuestion();
            }, 2200);
          });
        });
      }
    });
  }

  var HALOGEN_DATA = {
    F:  { size:15, polar:80, elec:90, hydro:30, metab:70, note:'Organic F는 일반적으로 strong H-bond acceptor가 아니다. Electronic tuning, metabolic blocking에 주로 사용.' },
    Cl: { size:40, polar:45, elec:45, hydro:60, metab:40, note:'Hydrophobic pocket에 잘 맞음. Polarizability → halogen bond 가능. Metabolic liability는 substrate에 따라 다름.' },
    Br: { size:55, polar:70, elec:35, hydro:65, metab:30, note:'Cl보다 큰 van der Waals radius. Polarizability 높음 → halogen bond에 유리. Heavy atom impact on MW.' }
  };

  function initHalogenBox() {
    document.querySelectorAll('[data-halogen-box]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('.hb-tab-btn');
      var fills = wrap.querySelectorAll('.hb-meter-fill');
      var note  = wrap.querySelector('.hb-note');

      function update(hal) {
        btns.forEach(function(b){ b.classList.toggle('active', b.dataset.hal === hal); });
        var d = HALOGEN_DATA[hal] || HALOGEN_DATA['F'];
        var vals = [d.size, d.polar, d.elec, d.hydro, d.metab];
        fills.forEach(function(f, i){ f.style.width = (vals[i] || 0) + '%'; });
        if (note) note.textContent = d.note;
      }

      btns.forEach(function(b){ b.addEventListener('click', function(){ update(b.dataset.hal); }); });
      update('F');
    });
  }

  var METAB_GROUPS = {
    methoxy: { title:'OMe (Methoxy)', text:'CYP-mediated O-dealkylation: Ar–O–CH₃ → Ar–OH. Methoxy는 단순 hydrophobic group이 아니라 metabolic soft spot이 될 수 있다.' },
    amine:   { title:'Amine (N-R₂)', text:'N-dealkylation, N-oxidation, MAO substrate 가능. 기본 amine은 특히 CYP와 MAO에 의해 대사될 수 있다.' },
    alcohol: { title:'Alcohol (OH)', text:'Oxidation → aldehyde/ketone → acid. Phase II: glucuronidation, sulfation. OH 추가가 clearance를 높이는 이유 중 하나.' },
    ester:   { title:'Ester (–COOR)', text:'혈장 및 조직 esterase에 의한 hydrolysis. In vivo stability 확인 필요. Prodrug로도 활용 가능.' },
    benzyl:  { title:'Benzylic CH', text:'Benzylic position은 CYP에 의한 benzylic hydroxylation의 주요 target. Aromatic ring에 F 추가로 blocking 가능.' }
  };

  function initMetabMap() {
    document.querySelectorAll('[data-metab-map]').forEach(function(wrap) {
      var btns   = wrap.querySelectorAll('.mm-group-btn');
      var result = wrap.querySelector('.mm-result');

      btns.forEach(function(b) {
        b.addEventListener('click', function() {
          btns.forEach(function(x){ x.classList.remove('active'); });
          b.classList.add('active');
          var d = METAB_GROUPS[b.dataset.mg] || {};
          if (result) result.innerHTML = '<strong>' + (d.title||'') + '</strong><br>' + (d.text||'');
        });
      });
    });
  }

  var LIDO_REGIONS = {
    ring:  { title:'Aromatic Ring', tag:'Hydrophobic', icon:'⬡', desc:'Lipophilic region. Aromatic π-stacking 및 hydrophobic pocket과 상호작용. Diethyl substituent가 bulk를 더하며 steric shielding 역할도 함.', props: { 'HBD/HBA':'없음', 'Charge':'중성', 'Role':'hydrophobic interaction', 'Metab':'aromatic hydroxylation 가능' } },
    amide: { title:'Amide Linker', tag:'Polar', icon:'⬕', desc:'Neutral polar linker. Resonance로 인해 N이 basic하지 않음. Carbonyl HBA. Planarity로 geometry 고정. Tertiary amine과 달리 ionization 없음.', props: { 'HBD/HBA':'C=O → HBA; N: HBD 아님', 'Charge':'중성', 'Role':'H-bond acceptor + spacer', 'Metab':'amide bond은 상대적으로 안정' } },
    amine: { title:'Tertiary Amine', tag:'Ionizable', icon:'N', desc:'Ionizable basic center. Physiological pH에서 부분적으로 protonated. Ion channel target binding 및 membrane 접근에서 ionization state가 중요. 3강 pKa 개념과 직접 연결.', props: { 'HBD/HBA':'Neutral→HBA; protonated→ionic', 'Charge':'pKa에 따라 양전하 가능', 'Role':'ionic interaction / solubility', 'Metab':'N-dealkylation 가능' } }
  };

  function initLidoMap() {
    document.querySelectorAll('[data-lido-map]').forEach(function(wrap) {
      var btns   = wrap.querySelectorAll('.lm-region-btn');
      var detail = wrap.querySelector('.lm-detail');

      function update(region) {
        btns.forEach(function(b){ b.classList.toggle('active', b.dataset.region === region); });
        var d = LIDO_REGIONS[region];
        if (!detail || !d) { if(detail) detail.classList.remove('show'); return; }
        var html = '<strong>' + d.title + '</strong><br>' + d.desc;
        html += '<div class="lm-detail-grid">';
        Object.keys(d.props).forEach(function(k){
          html += '<div class="lm-detail-prop"><div class="lm-detail-prop-label">' + k + '</div><div class="lm-detail-prop-val">' + d.props[k] + '</div></div>';
        });
        html += '</div>';
        detail.innerHTML = html;
        detail.classList.add('show');
      }

      btns.forEach(function(b){ b.addEventListener('click', function(){ update(b.dataset.region); }); });
    });
  }

  var FGS_DATA = {
    OH:   { hbd:80, hba:75, ion:30, lipo:25, perm:40, metab:60, note:'HBD + HBA. Polarity ↑. Conjugation target.' },
    OMe:  { hbd:0,  hba:55, ion:5,  lipo:55, perm:58, metab:50, note:'HBA only. Lipophilicity ↑. O-dealkylation 가능.' },
    NH2:  { hbd:70, hba:65, ion:80, lipo:20, perm:30, metab:65, note:'pKa ~10 → BH⁺ major at pH 7.4. Salt bridge 가능.' },
    NHAc: { hbd:40, hba:60, ion:5,  lipo:35, perm:55, metab:40, note:'Basicity 크게 감소. Amide HBA. Planar.' },
    COOH: { hbd:70, hba:80, ion:85, lipo:20, perm:25, metab:45, note:'pH 7.4 → COO⁻ major. Strong ionic anchor. Permeability 문제.' },
    COOEt:{ hbd:0,  hba:65, ion:5,  lipo:65, perm:70, metab:75, note:'Neutral. Permeability ↑. Esterase hydrolysis.' },
    CN:   { hbd:0,  hba:35, ion:5,  lipo:45, perm:60, metab:30, note:'작고 linear. Weak HBA. Electronic tuning.' }
  };

  function initFgSwap() {
    document.querySelectorAll('[data-fg-swap]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('.fgs-group-btn');
      var fills = {
        hbd:  wrap.querySelector('.fgs-meter-fill--hbd'),
        hba:  wrap.querySelector('.fgs-meter-fill--hba'),
        ion:  wrap.querySelector('.fgs-meter-fill--ion'),
        lipo: wrap.querySelector('.fgs-meter-fill--lipo'),
        perm: wrap.querySelector('.fgs-meter-fill--perm'),
        metab:wrap.querySelector('.fgs-meter-fill--metab')
      };
      var noteEl = wrap.querySelector('.fgs-note');

      function apply(grp) {
        btns.forEach(function(b){ b.classList.toggle('active', b.dataset.grp === grp); });
        var d = FGS_DATA[grp] || FGS_DATA['OH'];
        Object.keys(fills).forEach(function(k){ if(fills[k]) fills[k].style.width = (d[k]||0)+'%'; });
        if (noteEl) noteEl.textContent = d.note || '';
      }

      btns.forEach(function(b){ b.addEventListener('click', function(){ apply(b.dataset.grp); }); });
      apply('OH');
    });
  }

  function initAiContextFail() {
    document.querySelectorAll('[data-ai-context]').forEach(function(wrap) {
      var btn    = wrap.querySelector('.acf-context-btn');
      var reveal = wrap.querySelector('.acf-context-reveal');
      var msgEl  = wrap.querySelector('.acf-msg');

      if (btn) {
        btn.addEventListener('click', function() {
          if (reveal) reveal.classList.add('show');
          if (msgEl) { msgEl.className = 'acf-msg acf-msg--ok'; msgEl.textContent = 'Chemical context 확인 시 완전히 다른 N 특성이 드러난다.'; }
          btn.style.display = 'none';
        });
      }
    });
  }

  var FGC_DATA = {
    amide: [
      { q:'HBD / HBA?', a:'C=O → HBA. NH가 있으면 HBD. 하지만 amide N 자체는 HBA가 아니다.' },
      { q:'Ionizable?', a:'매우 약한 base (pKa ~0). Physiological pH에서 실질적으로 neutral.' },
      { q:'Resonance 효과?', a:'N lone pair가 carbonyl과 conjugation → N basicity 크게 감소, C–N partial double bond, planarity.' },
      { q:'Conformational effect?', a:'Amide bond rotation 제한 → backbone geometry 고정. 4강 conformational restriction과 연결.' },
      { q:'Metabolic liability?', a:'Amide bond은 상대적으로 hydrolysis에 안정. 하지만 일부 환경에서 가수분해 가능.' },
      { q:'Binding role?', a:'Carbonyl oxygen이 H-bond acceptor로 protein NH/OH와 interaction. Planar geometry가 binding pose를 고정.' }
    ],
    amine: [
      { q:'HBD / HBA?', a:'Primary/secondary: HBD + HBA. Tertiary neutral: HBA only. Protonated: ionic center.' },
      { q:'Ionizable?', a:'Aliphatic amine은 대개 basic (pKa 8–11). 생리적 pH에서 부분적으로 protonated.' },
      { q:'Resonance 효과?', a:'일반 amine에는 강한 resonance delocalization 없음. N lone pair 사용 가능 → basic / HBA.' },
      { q:'Metabolic liability?', a:'N-dealkylation, N-oxidation (CYP), MAO substrate 가능.' },
      { q:'Binding role?', a:'Protonated amine → salt bridge (Asp/Glu). Cation–π (Phe/Tyr/Trp). 강력한 binding anchor.' }
    ],
    phenol: [
      { q:'HBD / HBA?', a:'OH: HBD + HBA. Aromatic system도 weak π-acceptor.' },
      { q:'Ionizable?', a:'Weak acid. pKa ~10 (하지만 substituent에 따라 달라짐). 생리적 pH에서 대부분 neutral.' },
      { q:'Metabolism?', a:'Glucuronidation, sulfation이 주요 phase II 경로. Oxidation도 가능.' },
      { q:'Binding role?', a:'H-bond donor + acceptor. Aromatic pocket에서 π interaction도 가능.' }
    ],
    ether: [
      { q:'HBD / HBA?', a:'HBA only (O는 acceptor). HBD 없음.' },
      { q:'Ionizable?', a:'중성. 생리적 pH에서 charge 없음.' },
      { q:'vs Alcohol?', a:'OH 제거 → HBD 손실, polarity 감소, lipophilicity 증가. O-dealkylation 대사 가능.' }
    ]
  };

  function initFgChecklist() {
    document.querySelectorAll('[data-fg-checklist]').forEach(function(wrap) {
      var sel   = wrap.querySelector('.fgc-select');
      var items = wrap.querySelector('.fgc-items');

      function buildItems(grp) {
        if (!items) return;
        items.innerHTML = '';
        var rows = FGC_DATA[grp] || [];
        rows.forEach(function(row) {
          var item = document.createElement('div');
          item.className = 'fgc-item';
          item.innerHTML = '<div class="fgc-item-head"><span class="fgc-item-q">' + row.q + '</span><span class="fgc-item-caret">▼</span></div><div class="fgc-item-body"><div class="fgc-item-inner">' + row.a + '</div></div>';
          item.querySelector('.fgc-item-head').addEventListener('click', function() {
            var isOpen = item.classList.contains('open');
            items.querySelectorAll('.fgc-item').forEach(function(x){ x.classList.remove('open'); x.querySelector('.fgc-item-body').classList.remove('open'); });
            if (!isOpen) { item.classList.add('open'); item.querySelector('.fgc-item-body').classList.add('open'); }
          });
          items.appendChild(item);
        });
      }

      if (sel) {
        sel.addEventListener('change', function(){ buildItems(sel.value); });
        buildItems(sel.value || 'amide');
      }
    });
  }

  /* ============================================================
     L04 – Stereochemistry / Conformational Restriction
     ============================================================ */

  function initMirrorBinding() {
    document.querySelectorAll('[data-mirror-binding]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('.mb-toggle-btn');
      var verdict = wrap.querySelector('.mb-verdict');
      var grpC = wrap.querySelector('.mb-lig-grp--c');
      var grpA = wrap.querySelector('.mb-lig-grp--a');

      function update(mode) {
        btns.forEach(function(b){ b.classList.toggle('active', b.dataset.stereo === mode); });
        if (mode === 'r') {
          if (grpC) { grpC.className = 'mb-lig-grp mb-lig-grp--c'; grpC.textContent = 'C → solvent'; }
          if (grpA) { grpA.textContent = 'A → H-bond'; }
          if (verdict) { verdict.className = 'mb-verdict mb-verdict--match'; verdict.textContent = '3개 interaction 모두 성립 → High Affinity'; }
        } else {
          if (grpC) { grpC.className = 'mb-lig-grp mb-lig-grp--clash'; grpC.textContent = 'C → steric clash'; }
          if (grpA) { grpA.textContent = 'A → misaligned'; }
          if (verdict) { verdict.className = 'mb-verdict mb-verdict--clash'; verdict.textContent = 'Steric clash + H-bond miss → Low Affinity'; }
        }
      }

      btns.forEach(function(b){
        b.addEventListener('click', function(){ update(b.dataset.stereo); });
      });
      update('r');
    });
  }

  function initStereoMap() {
    document.querySelectorAll('[data-stereo-map]').forEach(function(wrap) {
      wrap.querySelectorAll('.sm-card').forEach(function(card) {
        card.querySelector('.sm-card-head').addEventListener('click', function() {
          var isOpen = card.classList.contains('open');
          wrap.querySelectorAll('.sm-card').forEach(function(c){ c.classList.remove('open'); c.querySelector('.sm-card-body').classList.remove('open'); });
          if (!isOpen) { card.classList.add('open'); card.querySelector('.sm-card-body').classList.add('open'); }
        });
      });
    });
  }

  function initThreePoint() {
    document.querySelectorAll('[data-three-point]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('.tp-toggle-btn');
      var grps = wrap.querySelectorAll('.tp-lig-grp');
      var verdict = wrap.querySelector('.tp-verdict');

      function update(mode) {
        btns.forEach(function(b){ b.classList.toggle('active', b.dataset.stereo === mode); });
        if (mode === 'active') {
          grps.forEach(function(g){ g.className = 'tp-lig-grp tp-lig-grp--match'; g.querySelector('.tp-check') && (g.querySelector('.tp-check').textContent = '✓'); });
          if (verdict) { verdict.className = 'tp-verdict tp-verdict--ok'; verdict.textContent = '세 지점 모두 인식 → Stereoselective Binding'; }
        } else {
          if (grps[2]) { grps[2].className = 'tp-lig-grp tp-lig-grp--miss'; }
          var c = grps[2] && grps[2].querySelector('.tp-check');
          if (c) c.textContent = '✗';
          if (verdict) { verdict.className = 'tp-verdict tp-verdict--fail'; verdict.textContent = 'C 지점 불일치 → Stereoselective Rejection'; }
        }
      }

      btns.forEach(function(b){
        b.addEventListener('click', function(){ update(b.dataset.stereo); });
      });
      update('active');
    });
  }

  function initConfCarousel() {
    var CONFORMERS = [
      { name:'A', pct:'40%', bioactive:false },
      { name:'B', pct:'30%', bioactive:false },
      { name:'C', pct:'20%', bioactive:false },
      { name:'D', pct:'8%',  bioactive:true  },
      { name:'E', pct:'2%',  bioactive:false }
    ];
    var SHAPES = ['⬡','⬠','◇','⬤','◻'];

    document.querySelectorAll('[data-conf-carousel]').forEach(function(wrap) {
      var grid = wrap.querySelector('.cc-conformers');
      var protBtn = wrap.querySelector('.cc-protein-btn');
      var result = wrap.querySelector('.cc-result');
      var selected = null;
      var revealed = false;

      CONFORMERS.forEach(function(cf, i) {
        var card = document.createElement('div');
        card.className = 'cc-conf-card';
        card.innerHTML = '<div class="cc-conf-shape">' + SHAPES[i] + '</div><div class="cc-conf-name">' + cf.name + '</div><div class="cc-conf-pct">' + cf.pct + '</div>';
        card.addEventListener('click', function(){
          if (revealed) return;
          grid.querySelectorAll('.cc-conf-card').forEach(function(c){ c.classList.remove('selected'); });
          card.classList.add('selected');
          selected = cf;
          if (result) { result.className = 'cc-result cc-result--neutral'; result.textContent = '이 conformer를 선택했습니다. Protein 버튼으로 확인하세요.'; }
        });
        grid.appendChild(card);
      });

      if (protBtn) {
        protBtn.addEventListener('click', function(){
          revealed = true;
          grid.querySelectorAll('.cc-conf-card').forEach(function(card, i){
            if (CONFORMERS[i].bioactive) card.classList.add('bioactive');
          });
          if (!selected) {
            if (result) { result.className = 'cc-result cc-result--nomatch'; result.textContent = 'Bioactive conformer는 D (8%)입니다. Solution에서는 드문 conformer.'; }
          } else if (selected.bioactive) {
            if (result) { result.className = 'cc-result cc-result--match'; result.textContent = '정답! D가 bioactive conformer입니다.'; }
          } else {
            if (result) { result.className = 'cc-result cc-result--nomatch'; result.textContent = 'D가 bioactive conformer입니다. 선택한 ' + selected.name + '는 아닙니다.'; }
          }
          protBtn.disabled = true;
        });
      }
    });
  }

  function initEntropyFunnel() {
    document.querySelectorAll('[data-entropy-funnel]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('.ef-toggle-btn');
      var conformers = wrap.querySelector('.ef-conformers');
      var label = wrap.querySelector('.ef-label');

      function buildDots(n) {
        if (!conformers) return;
        conformers.innerHTML = '';
        for (var i = 0; i < n; i++) {
          var d = document.createElement('div');
          d.className = 'ef-dot';
          conformers.appendChild(d);
        }
      }

      function update(mode) {
        btns.forEach(function(b){ b.classList.toggle('active', b.dataset.mol === mode); });
        if (mode === 'flexible') {
          buildDots(24);
          if (label) label.textContent = 'Binding 시 대부분 freedom 상실 → entropy penalty 큼';
        } else {
          buildDots(6);
          if (label) label.textContent = 'Solution에서 이미 restricted → entropy penalty 감소 가능';
        }
      }

      btns.forEach(function(b){
        b.addEventListener('click', function(){ update(b.dataset.mol); });
      });
      update('flexible');
    });
  }

  function initFlexPreorg() {
    document.querySelectorAll('[data-flex-preorg]').forEach(function(wrap) {
      var flexDots = wrap.querySelector('.fp-col--flexible .fp-conformers');
      var rigidDots = wrap.querySelector('.fp-col--rigid .fp-conformers');

      function makeDots(el, total, greenIdx) {
        if (!el) return;
        el.innerHTML = '';
        for (var i = 0; i < total; i++) {
          var d = document.createElement('div');
          d.className = 'fp-dot ' + (i === greenIdx ? 'fp-dot--green' : 'fp-dot--gray');
          el.appendChild(d);
        }
      }
      makeDots(flexDots, 18, 3);
      makeDots(rigidDots, 5, 1);
    });
  }

  function initWrongRigid() {
    document.querySelectorAll('[data-wrong-rigid]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('.wr-ring-btn');
      var result = wrap.querySelector('.wr-ring-result');

      btns.forEach(function(btn){
        btn.addEventListener('click', function(){
          btns.forEach(function(b){ b.classList.remove('correct','incorrect'); });
          var isCorrect = btn.dataset.choice === 'correct';
          btn.classList.add(isCorrect ? 'correct' : 'incorrect');
          if (result) {
            result.classList.add('show');
            result.style.background = isCorrect ? '#dcfce7' : '#fee2e2';
            result.style.color = isCorrect ? '#15803d' : '#dc2626';
            result.textContent = isCorrect
              ? '✓ 맞습니다! 이 위치에서 ring closure하면 bound conformation을 preorganize합니다.'
              : '✗ 이 위치의 ring closure는 잘못된 geometry를 고정합니다. Potency 감소 가능.';
          }
        });
      });
    });
  }

  function initLorlatinibStory() {
    document.querySelectorAll('[data-lorlatinib]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('.ls-ring-btn');
      var macroRing = wrap.querySelector('.ls-macro-ring');
      var rotBadge  = wrap.querySelector('.ls-rot-badge');

      function update(mode) {
        btns.forEach(function(b){ b.classList.toggle('active', b.dataset.ring === mode); });
        if (mode === 'macro') {
          if (macroRing) { macroRing.classList.remove('open'); macroRing.textContent = 'Macro-\ncyclic'; }
          if (rotBadge)  { rotBadge.className = 'ls-rot-badge ls-rot-badge--low'; rotBadge.textContent = 'Rotatable bonds ↓'; }
        } else {
          if (macroRing) { macroRing.classList.add('open'); macroRing.textContent = 'Open chain'; }
          if (rotBadge)  { rotBadge.className = 'ls-rot-badge ls-rot-badge--high'; rotBadge.textContent = 'Rotatable bonds ↑'; }
        }
      }

      btns.forEach(function(b){
        b.addEventListener('click', function(){ update(b.dataset.ring); });
      });
      update('macro');
    });
  }

  function initConfAdme() {
    document.querySelectorAll('[data-conf-adme]').forEach(function(wrap) {
      wrap.querySelectorAll('.ca-branch').forEach(function(branch) {
        branch.querySelector('.ca-branch-head').addEventListener('click', function(){
          var isOpen = branch.classList.contains('open');
          wrap.querySelectorAll('.ca-branch').forEach(function(b){ b.classList.remove('open'); b.querySelector('.ca-branch-body').classList.remove('open'); });
          if (!isOpen) { branch.classList.add('open'); branch.querySelector('.ca-branch-body').classList.add('open'); }
        });
      });
    });
  }

  function initMethylEffect() {
    document.querySelectorAll('[data-methyl-effect]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('.me-toggle-btn');
      var slider = wrap.querySelector('.me-torsion-slider');
      var angleDisp = wrap.querySelector('.me-angle-display');
      var clashZone = wrap.querySelector('.me-clash-zone');
      var fillConf = wrap.querySelector('.me-bar-fill--conf');
      var fillHydro = wrap.querySelector('.me-bar-fill--hydro');
      var fillMW = wrap.querySelector('.me-bar-fill--mw');
      var hasMethyl = false;

      function checkClash(angle) {
        if (!slider || !angleDisp) return;
        if (angleDisp) angleDisp.textContent = 'Torsion angle: ' + angle + '°';
        if (clashZone) {
          var isClash = hasMethyl && (angle > 120 && angle < 240);
          clashZone.className = 'me-clash-zone ' + (isClash ? 'me-clash-zone--clash' : 'me-clash-zone--free');
          clashZone.textContent = isClash ? 'Steric clash — 이 torsion 선호 안됨' : '이 torsion 허용';
        }
      }

      function update(methyl) {
        hasMethyl = methyl;
        btns.forEach(function(b){ b.classList.toggle('active', b.dataset.sub === (methyl ? 'ch3' : 'h')); });
        if (fillConf)  fillConf.style.width  = methyl ? '75%' : '30%';
        if (fillHydro) fillHydro.style.width = methyl ? '45%' : '25%';
        if (fillMW)    fillMW.style.width    = methyl ? '40%' : '20%';
        checkClash(slider ? +slider.value : 90);
      }

      if (slider) {
        slider.addEventListener('input', function(){ checkClash(+slider.value); });
      }

      btns.forEach(function(b){
        b.addEventListener('click', function(){ update(b.dataset.sub === 'ch3'); });
      });
      update(false);
    });
  }

  function initAiStereo() {
    document.querySelectorAll('[data-ai-stereo]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('.ast-toggle-btn');
      var panelR = wrap.querySelector('.ast-panel--r');
      var panelS = wrap.querySelector('.ast-panel--s');
      var msg = wrap.querySelector('.ast-msg');

      function update(mode) {
        btns.forEach(function(b){ b.classList.toggle('active', b.dataset.stereo === mode); });
        if (mode === 'keep') {
          if (panelR) { panelR.classList.remove('merged'); panelR.querySelector('.ast-activity').className = 'ast-activity ast-activity--high'; panelR.querySelector('.ast-activity').textContent = 'IC50 = 5 nM'; var p = panelR.querySelector('.ast-prediction'); if(p) p.textContent = 'AI: ~20 nM'; }
          if (panelS) { panelS.classList.remove('merged'); panelS.querySelector('.ast-activity').className = 'ast-activity ast-activity--low'; panelS.querySelector('.ast-activity').textContent = 'IC50 = 1.5 µM'; var p2 = panelS.querySelector('.ast-prediction'); if(p2) p2.textContent = 'AI: ~2 µM'; }
          if (msg) { msg.className = 'ast-msg ast-msg--distinct'; msg.textContent = 'AI가 R/S를 구분해 activity 차이 예측 가능'; }
        } else {
          if (panelR) { panelR.classList.add('merged'); panelR.querySelector('.ast-activity').className = 'ast-activity ast-activity--same'; panelR.querySelector('.ast-activity').textContent = 'IC50 = 5 nM'; var p3 = panelR.querySelector('.ast-prediction'); if(p3) p3.textContent = 'AI: ~25 nM (same graph)'; }
          if (panelS) { panelS.classList.add('merged'); panelS.querySelector('.ast-activity').className = 'ast-activity ast-activity--same'; panelS.querySelector('.ast-activity').textContent = 'IC50 = 1.5 µM'; var p4 = panelS.querySelector('.ast-prediction'); if(p4) p4.textContent = 'AI: ~22 nM (same graph)'; }
          if (msg) { msg.className = 'ast-msg ast-msg--collapsed'; msg.textContent = 'AI: 같은 graph → 같은 prediction → activity 차이 설명 불가'; }
        }
      }

      btns.forEach(function(b){
        b.addEventListener('click', function(){ update(b.dataset.stereo); });
      });
      update('keep');
    });
  }

  function initSingleConf() {
    var CONFS = [
      { name:'A', pct:'42%', bioactive:false },
      { name:'B', pct:'28%', bioactive:false },
      { name:'C', pct:'18%', bioactive:false },
      { name:'D', pct:'9%',  bioactive:true  },
      { name:'E', pct:'3%',  bioactive:false }
    ];

    document.querySelectorAll('[data-single-conf]').forEach(function(wrap) {
      var conformers = wrap.querySelector('.sc-conformers');
      var btns = wrap.querySelectorAll('.sc-mode-btn');
      var verdict = wrap.querySelector('.sc-verdict');

      CONFS.forEach(function(cf){
        var card = document.createElement('div');
        card.className = 'sc-conf-card';
        card.innerHTML = cf.name + '<br><span style="font-size:10px;font-weight:400;color:var(--ink-faint)">' + cf.pct + '</span>';
        if (cf.bioactive) card.dataset.bioactive = '1';
        conformers.appendChild(card);
      });

      function update(mode) {
        btns.forEach(function(b){ b.classList.toggle('active', b.dataset.mode === mode); });
        var cards = conformers.querySelectorAll('.sc-conf-card');
        cards.forEach(function(c){ c.classList.remove('selected','bioactive','input-used'); });
        if (mode === 'single') {
          cards[0].classList.add('selected','input-used');
          if (verdict) { verdict.className = 'sc-verdict sc-verdict--bad'; verdict.textContent = 'A (42%) 입력 → D가 실제 bioactive인데 모름 → 잘못된 3D relationship 학습 가능'; }
        } else {
          cards.forEach(function(c){ c.classList.add('selected'); });
          cards[3].classList.add('bioactive');
          if (verdict) { verdict.className = 'sc-verdict sc-verdict--ok'; verdict.textContent = 'Ensemble 입력 → D (9%)도 포함 → bioactive conformer 커버 가능'; }
        }
      }

      btns.forEach(function(b){
        b.addEventListener('click', function(){ update(b.dataset.mode); });
      });
      update('single');
    });
  }

  function initRigidLab() {
    var MOD_DATA = {
      none:       { conf:20, potent:30, solub:80, synth:10, perm:50, exp: '기준 flexible lead. 여러 conformation을 sampling 중. Permeability와 solubility는 보통.' },
      methyl:     { conf:55, potent:55, solub:65, synth:20, perm:55, exp: 'Methyl 추가로 steric bias 증가. Conformational preference가 생겼을 수 있다. Hydrophobicity 증가.' },
      alkene:     { conf:60, potent:48, solub:60, synth:35, perm:52, exp: 'Double bond으로 rotation 제한. E/Z stereochemistry 주의. Geometry가 약간 다를 수 있음.' },
      ring:       { conf:72, potent:65, solub:55, synth:55, perm:58, exp: 'Ring closure로 U-shape preorganization 가능. Solubility 감소 주의. Synth accessibility 고려.' },
      fused:      { conf:85, potent:72, solub:40, synth:70, perm:50, exp: 'Fused ring으로 scaffold 완전히 고정. 강한 3D precision. Solubility & conformational adaptability 감소.' },
      macrocycle: { conf:80, potent:70, solub:45, synth:85, perm:62, exp: 'Macrocycle로 constrained. BBB/permeability design과 연결 가능. 합성 난이도 높음.' }
    };
    var EXP_DATA = {
      biochem: 'Biochemical assay: potency를 가장 먼저 확인. 하지만 conformational restriction 효과를 단독으로 설명하기 어렵다.',
      crystal:  'Crystal structure: restriction이 bioactive conformation을 향했는지 직접 확인. 가장 강력한 증거.',
      perm:     'Permeability assay: PAMPA/Caco-2로 membrane crossing 변화 확인. Restriction이 permeability에도 영향을 줄 수 있다.',
      solub:    'Solubility: 새 conformer/rigidity가 crystal packing을 바꿀 수 있다. 조기 확인 권장.',
      metab:    'Metabolic stability: 새 geometry가 CYP450 recognition을 바꿀 수 있다. Clearance 변화 확인.'
    };

    document.querySelectorAll('[data-rigid-lab]').forEach(function(wrap) {
      var modBtns = wrap.querySelectorAll('.rl-mod-btn');
      var expBtns = wrap.querySelectorAll('.rl-exp-btn');
      var explain = wrap.querySelector('.rl-exp-explain');
      var fills = {
        conf:   wrap.querySelector('.rl-ind-fill--conf'),
        potent: wrap.querySelector('.rl-ind-fill--potent'),
        solub:  wrap.querySelector('.rl-ind-fill--solub'),
        synth:  wrap.querySelector('.rl-ind-fill--synth'),
        perm:   wrap.querySelector('.rl-ind-fill--perm')
      };
      var vals = {
        conf:   wrap.querySelector('.rl-ind-val[data-key="conf"]'),
        potent: wrap.querySelector('.rl-ind-val[data-key="potent"]'),
        solub:  wrap.querySelector('.rl-ind-val[data-key="solub"]'),
        synth:  wrap.querySelector('.rl-ind-val[data-key="synth"]'),
        perm:   wrap.querySelector('.rl-ind-val[data-key="perm"]')
      };

      function applyMod(mod) {
        modBtns.forEach(function(b){ b.classList.toggle('active', b.dataset.mod === mod); });
        var d = MOD_DATA[mod] || MOD_DATA['none'];
        Object.keys(fills).forEach(function(k){
          if (fills[k]) fills[k].style.width = d[k] + '%';
          if (vals[k])  vals[k].textContent = (d[k] < 40 ? 'Low' : d[k] < 70 ? 'Med' : 'High');
        });
      }

      modBtns.forEach(function(b){
        b.addEventListener('click', function(){ applyMod(b.dataset.mod); });
      });

      expBtns.forEach(function(btn){
        btn.addEventListener('click', function(){
          expBtns.forEach(function(b){ b.classList.remove('picked'); });
          btn.classList.add('picked');
          if (explain) {
            explain.classList.add('show');
            explain.textContent = EXP_DATA[btn.dataset.exp] || '';
          }
        });
      });

      applyMod('none');
    });
  }

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

    initInteractCount();
    initHbondGeo();
    initHbondDesolv();
    initProtonation();
    initPiGallery();
    initHydrophobicDemo();
    initLipoTrap();
    initGefitinibMap();
    initModLab();
    initAiAudit();

    initProtSlider();
    initAcidBaseMirror();
    initTenRule();
    initMembraneCrossing();
    initSolPermBalance();
    initLogPDPartition();
    initLogDCurve();
    initIbuprofenStory();
    initIonTrap();
    initPkaTuning();
    initAiProtFail();
    initPropCascade();
    initSciDecision();

    initFgInspector();
    initAlcEther();
    initAmineCards();
    initAmideResonance();
    initAcidEster();
    initHeteroQuiz();
    initHalogenBox();
    initMetabMap();
    initLidoMap();
    initFgSwap();
    initAiContextFail();
    initFgChecklist();

    initMirrorBinding();
    initStereoMap();
    initThreePoint();
    initConfCarousel();
    initEntropyFunnel();
    initFlexPreorg();
    initWrongRigid();
    initLorlatinibStory();
    initConfAdme();
    initMethylEffect();
    initAiStereo();
    initSingleConf();
    initRigidLab();

    initHub();
  });

})();
