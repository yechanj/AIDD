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

    initHub();
  });

})();
