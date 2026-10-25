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
    var tg = document.createElement("button");
    tg.className = "sidebar-toggle";
    tg.setAttribute("aria-label", "목차 접기/펼치기");
    function setCollapsed(c) {
      document.body.classList.toggle("sb-collapsed", c);
      tg.textContent = c ? "☰" : "◀";
      try { localStorage.setItem("aidd-sb-collapsed", c ? "1" : "0"); } catch (e) {}
    }
    tg.addEventListener("click", function () {
      setCollapsed(!document.body.classList.contains("sb-collapsed"));
    });
    document.body.appendChild(tg);
    var saved = null;
    try { saved = localStorage.getItem("aidd-sb-collapsed"); } catch (e) {}
    setCollapsed(saved === "1");
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

  /* ============================================================
     L06 – Bioisostere
     ============================================================ */

  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function(k){ el.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(el);
    return el;
  }

  /* V1 – Preserve vs Change Designer */
  var BI_CANDS = {
    tz:      { charge:.9, arg:.85, geom:.8, metab:.8, perm:.3,  pk:.6,
               name:'Tetrazole',        keepNote:'acidic anchor를 유지하는 대표 후보', changeNote:'metabolism은 개선 가능하지만 permeability 개선은 제한적일 수 있다' },
    acs:     { charge:.8, arg:.7,  geom:.6, metab:.6, perm:.6,  pk:.55,
               name:'Acyl sulfonamide', keepNote:'acidic하지만 geometry가 COOH와 다를 수 있다', changeNote:'lipophilicity·permeability가 다르게 움직일 수 있다' },
    neutral: { charge:.1, arg:.2,  geom:.3, metab:.7, perm:.85, pk:.6,
               name:'Neutral mimic',    keepNote:'charge/Arg interaction을 유지하기 어렵다', changeNote:'permeability에 유리할 수 있으나 binding 손실 위험이 크다' }
  };

  function initBiDesigner() {
    document.querySelectorAll('[data-bi-designer]').forEach(function(wrap) {
      var chips = wrap.querySelectorAll('.bi-chip');
      var cands = wrap.querySelectorAll('.bi-cand');
      var note  = wrap.querySelector('.bi-des-note');
      var sel = {};

      function update() {
        var keys = Object.keys(sel).filter(function(k){ return sel[k]; });
        var keepKeys = keys.filter(function(k){ return ['charge','arg','geom'].indexOf(k) >= 0; });
        var best = null, bestScore = -1;
        cands.forEach(function(c) {
          var d = BI_CANDS[c.dataset.cand];
          var fill = c.querySelector('.bi-cand-fill');
          var flag = c.querySelector('.bi-cand-flag');
          c.classList.remove('best');
          if (!keys.length) { fill.style.width = '0'; flag.textContent = ''; return; }
          var s = keys.reduce(function(a, k){ return a + d[k]; }, 0) / keys.length;
          fill.style.width = Math.round(s * 100) + '%';
          var lost = keepKeys.some(function(k){ return d[k] < .4; });
          flag.textContent = lost ? '⚠ 손실' : '';
          if (!lost && s > bestScore) { bestScore = s; best = c; }
        });
        if (!keys.length) { note.textContent = 'PRESERVE와 CHANGE 항목을 선택해 보세요.'; return; }
        if (best) {
          best.classList.add('best');
          var d = BI_CANDS[best.dataset.cand];
          note.innerHTML = '<b>' + d.name + '</b> — ' + d.keepNote + '. ' + d.changeNote + '.';
        } else {
          note.textContent = '보존 조건을 만족하는 후보가 없다. 보존 항목을 줄이거나 새 후보 panel이 필요하다.';
        }
      }

      chips.forEach(function(ch) {
        ch.addEventListener('click', function() {
          sel[ch.dataset.key] = !sel[ch.dataset.key];
          ch.classList.toggle('active', !!sel[ch.dataset.key]);
          update();
        });
      });
      update();
    });
  }

  /* V2 – COOH vs Tetrazole overlay */
  function initBiCompare() {
    document.querySelectorAll('[data-bi-compare]').forEach(function(wrap) {
      var btn = wrap.querySelector('[data-overlay]');
      var ov  = wrap.querySelector('.bi-cmp-overlay');
      if (!btn || !ov) return;
      btn.addEventListener('click', function() {
        var on = ov.classList.toggle('show');
        btn.textContent = on ? 'Hide overlay' : 'Overlay pharmacophore';
      });
    });
  }

  /* V3 – Property radar (conceptual) */
  function initBiRadar() {
    document.querySelectorAll('[data-bi-radar]').forEach(function(wrap) {
      var svg = wrap.querySelector('.bi-radar-svg');
      var tabs = wrap.querySelectorAll('.bi-tab');
      var axes = ['Binding geometry','Acidity','Lipophilicity','Metabolic stability','Permeability','Size'];
      var data = {
        cooh: [.9, .8, .3, .4, .3, .4],
        tz:   [.75, .8, .5, .7, .4, .6]
      };
      var colors = { cooh:'#c2410c', tz:'#5b3fd4' };
      var cx = 160, cy = 150, R = 100;

      function pt(i, v) {
        var a = -Math.PI / 2 + i * 2 * Math.PI / axes.length;
        return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v];
      }

      function draw(show) {
        svg.innerHTML = '';
        [.25, .5, .75, 1].forEach(function(r) {
          svgEl('polygon', { points: axes.map(function(_, i){ return pt(i, r).join(','); }).join(' '), fill:'none', stroke:'#dce3ef', 'stroke-width':1 }, svg);
        });
        axes.forEach(function(name, i) {
          var p = pt(i, 1), l = pt(i, 1.2);
          svgEl('line', { x1:cx, y1:cy, x2:p[0], y2:p[1], stroke:'#dce3ef', 'stroke-width':1 }, svg);
          var t = svgEl('text', { x:l[0], y:l[1] + 4, 'text-anchor': l[0] < cx - 5 ? 'end' : (l[0] > cx + 5 ? 'start' : 'middle') }, svg);
          t.textContent = name;
        });
        ['cooh','tz'].forEach(function(k) {
          if (show !== 'both' && show !== k) return;
          svgEl('polygon', {
            points: data[k].map(function(v, i){ return pt(i, v).join(','); }).join(' '),
            fill: colors[k], 'fill-opacity': .18, stroke: colors[k], 'stroke-width': 2
          }, svg);
        });
      }

      tabs.forEach(function(t) {
        t.addEventListener('click', function() {
          tabs.forEach(function(x){ x.classList.toggle('active', x === t); });
          draw(t.dataset.show);
        });
      });
      tabs[0].classList.add('active');
      draw('both');
    });
  }

  /* V4 – Heteroaryl scanner */
  function initBiScan() {
    document.querySelectorAll('[data-bi-scan]').forEach(function(wrap) {
      var svg = wrap.querySelector('.bi-scan-svg');
      var tabs = wrap.querySelectorAll('.bi-tab');
      var hba = wrap.querySelector('.sc-hba'), dip = wrap.querySelector('.sc-dip'), geo = wrap.querySelector('.sc-geo');
      var verdict = wrap.querySelector('.bi-scan-verdict');
      var cx = 120, cy = 110, r = 48;
      var info = [
        { hba:'없음', dip:'작음 (대칭)', geo:'H-bond 불가', ok:false, msg:'✗ Phenyl에는 HBA가 없어 donor와 H-bond을 만들 수 없다.' },
        { hba:'ring 연결부 바로 옆 (ortho)', dip:'N 방향으로 치우침', geo:'N의 방향이 donor와 어긋남', ok:false, msg:'✗ N 방향이 donor와 맞지 않는다. 위치가 다르면 같은 pyridyl도 다른 experiment다.' },
        { hba:'오른쪽 아래 (meta)', dip:'N 쪽으로 향함', geo:'N lone pair가 donor를 향함', ok:true, msg:'✓ N lone pair가 protein donor 방향에 놓여 H-bond geometry에 맞는다.' },
        { hba:'ring 반대편 (para)', dip:'축 방향 (linear)', geo:'donor와 거리가 멀다', ok:false, msg:'✗ N이 donor에서 멀어 interaction이 성립하지 않는다.' }
      ];

      function vtx(i) {
        var a = (-90 + 60 * i) * Math.PI / 180;
        return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
      }

      function draw(pos) {
        svg.innerHTML = '';
        var pts = [0,1,2,3,4,5].map(function(i){ return vtx(i).join(','); }).join(' ');
        svgEl('polygon', { points: pts, fill:'#f8fafc', stroke:'#3d4f6b', 'stroke-width':2 }, svg);
        var v0 = vtx(0);
        svgEl('line', { x1:v0[0], y1:v0[1], x2:v0[0], y2:v0[1] - 28, stroke:'#3d4f6b', 'stroke-width':2 }, svg);
        svgEl('text', { x:v0[0] + 6, y:v0[1] - 22 }, svg).textContent = 'scaffold';
        [1,2,3].forEach(function(i) {
          var p = vtx(i);
          svgEl('text', { x:p[0] + (i === 3 ? 8 : 10), y:p[1] + 4 }, svg).textContent = i + 1;
        });
        var donor = { x: 250, y: 150 };
        svgEl('circle', { cx:donor.x, cy:donor.y, r:16, fill:'#dbeafe', stroke:'#2563eb', 'stroke-width':2 }, svg);
        svgEl('text', { x:donor.x - 9, y:donor.y + 4 }, svg).textContent = 'N–H';
        svgEl('text', { x:donor.x - 26, y:donor.y + 32 }, svg).textContent = 'protein donor';
        if (pos > 0) {
          var p = vtx(pos);
          svgEl('circle', { cx:p[0], cy:p[1], r:11, fill:'#fee2e2', stroke:'#dc2626', 'stroke-width':2 }, svg);
          svgEl('text', { x:p[0] - 4, y:p[1] + 4 }, svg).textContent = 'N';
          svgEl('line', { x1:p[0], y1:p[1], x2:donor.x - 16, y2:donor.y, stroke: pos === 2 ? '#15803d' : '#94a3b8', 'stroke-width':2, 'stroke-dasharray':'5 4' }, svg);
        }
      }

      function update(pos) {
        tabs.forEach(function(t){ t.classList.toggle('active', +t.dataset.pos === pos); });
        draw(pos);
        var d = info[pos];
        hba.textContent = d.hba; dip.textContent = d.dip; geo.textContent = d.geo;
        verdict.textContent = d.msg;
        verdict.className = 'bi-scan-verdict ' + (d.ok ? 'ok' : 'bad');
      }

      tabs.forEach(function(t){ t.addEventListener('click', function(){ update(+t.dataset.pos); }); });
      draw(0);
      verdict.textContent = 'Analogue를 선택하세요.';
    });
  }

  /* V5 – Fluorine simulator */
  function initBiFluor() {
    document.querySelectorAll('[data-bi-fluor]').forEach(function(wrap) {
      var atomBtns = wrap.querySelectorAll('[data-atom]');
      var distBtns = wrap.querySelectorAll('[data-dist]');
      var ster = wrap.querySelector('.fl-ster'), elec = wrap.querySelector('.fl-elec'),
          pka = wrap.querySelector('.fl-pka'), met = wrap.querySelector('.fl-met');
      var bar = wrap.querySelector('.bi-fl-bar-fill');
      var state = { atom:'F', dist:'beta' };
      var pkaData = {
        alpha: { txt:'amine basicity 크게 ↓ (큰 ΔpKa)', w:90 },
        beta:  { txt:'amine basicity ↓ (중간 ΔpKa)',     w:55 },
        far:   { txt:'영향 작음',                         w:15 }
      };

      function update() {
        atomBtns.forEach(function(b){ b.classList.toggle('active', b.dataset.atom === state.atom); });
        distBtns.forEach(function(b){ b.classList.toggle('active', b.dataset.dist === state.dist); });
        if (state.atom === 'H') {
          ster.textContent = '기준 (H)';
          elec.textContent = '기준';
          pka.textContent = '기준 pKa';
          bar.style.width = '0';
          met.textContent = 'C–H: oxidation soft spot일 수 있음';
        } else {
          ster.textContent = '작은 변화 (H보다 약간 큼)';
          elec.textContent = '큰 변화 가능 (strong EWG)';
          pka.textContent = pkaData[state.dist].txt;
          bar.style.width = pkaData[state.dist].w + '%';
          met.textContent = '해당 C–H oxidation 차단 가능 · metabolic switching 주의';
        }
      }

      atomBtns.forEach(function(b){ b.addEventListener('click', function(){ state.atom = b.dataset.atom; update(); }); });
      distBtns.forEach(function(b){ b.addEventListener('click', function(){ state.dist = b.dataset.dist; update(); }); });
      update();
    });
  }

  /* V6 – Metabolic switching */
  function initBiSwitch() {
    document.querySelectorAll('[data-bi-switch]').forEach(function(wrap) {
      var sites = wrap.querySelectorAll('.bi-sw-site');
      var totalFill = wrap.querySelector('.bi-sw-fill--total');
      var totalTag = wrap.querySelector('.bi-sw-total-tag');
      var msg = wrap.querySelector('.bi-sw-msg');
      var before = [60, 20, 20];
      var after  = [0, 60, 20];

      function render(vals, blocked) {
        var total = vals[0] + vals[1] + vals[2];
        sites.forEach(function(s, i) {
          var f = s.querySelector('.bi-sw-fill');
          f.style.width = vals[i] + '%';
          f.style.background = vals[i] >= 50 ? '#dc2626' : '#f59e0b';
          s.querySelector('.bi-sw-tag').textContent = (i === 0 && blocked) ? 'blocked (F)' : '';
        });
        totalFill.style.width = total + '%';
        totalTag.textContent = total >= 100 ? '≈ 변화 없음' : 'baseline';
      }

      wrap.querySelector('[data-block]').addEventListener('click', function() {
        render(after, true);
        msg.textContent = 'Site 1은 막혔지만 CYP가 Site 2를 산화한다. Total clearance는 거의 변하지 않는다.';
      });
      wrap.querySelector('[data-reset]').addEventListener('click', function() {
        render(before, false);
        msg.textContent = 'Site 1이 major pathway다.';
      });
      render(before, false);
      msg.textContent = 'Site 1이 major pathway다.';
    });
  }

  /* V7 – Amide deconstruction */
  function initBiAmide() {
    document.querySelectorAll('[data-bi-amide]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('[data-cand]');
      var roles = wrap.querySelectorAll('.bi-am-role');
      var note = wrap.querySelector('.bi-am-note');
      var mark = { keep:'✓', part:'~', lost:'✗' };
      var D = {
        oxa:  { hba:'keep', hbd:'lost', plan:'keep', space:'keep', dip:'part',
                note:'NH donor가 사라진다. Amide NH가 critical HBD였다면 potency 손실 위험, polarity만 높이던 NH였다면 오히려 유리할 수 있다.' },
        tri:  { hba:'part', hbd:'lost', plan:'keep', space:'keep', dip:'keep',
                note:'planar하고 dipole이 amide와 유사한 편이지만 NH donor는 없다. Acceptor 위치·방향은 substitution pattern에 의존한다.' },
        urea: { hba:'keep', hbd:'keep', plan:'part', space:'part', dip:'part',
                note:'HBD는 유지(오히려 2개)되지만 polarity와 desolvation cost가 커져 permeability 문제가 생길 수 있고 spacing도 달라진다.' }
      };

      function update(c) {
        btns.forEach(function(b){ b.classList.toggle('active', b.dataset.cand === c); });
        var d = D[c];
        roles.forEach(function(r) {
          var st = d[r.dataset.role];
          r.className = 'bi-am-role ' + st;
          r.querySelector('b').textContent = mark[st];
        });
        note.textContent = d.note;
      }

      btns.forEach(function(b){ b.addEventListener('click', function(){ update(b.dataset.cand); }); });
    });
  }

  /* V8 – Scaffold hopping */
  function initBiHop() {
    document.querySelectorAll('[data-bi-hop]').forEach(function(wrap) {
      var box = wrap.querySelector('.bi-hop');
      var btn = wrap.querySelector('[data-hop]');
      var msg = wrap.querySelector('.bi-hop-msg');
      var feats = [
        { x:230, y:45,  c:'#dc2626', t:'HBA' },
        { x:240, y:150, c:'#2563eb', t:'+' },
        { x:45,  y:160, c:'#94a3b8', t:'hyd' }
      ];

      function ring(svg, pts, closed) {
        svgEl(closed ? 'polygon' : 'polyline', { points: pts.map(function(p){ return p.join(','); }).join(' '), fill:'none', stroke:'#3d4f6b', 'stroke-width':2 }, svg);
      }
      function hexAt(x, y, r) {
        var out = [];
        for (var i = 0; i < 6; i++) { var a = (60 * i - 30) * Math.PI / 180; out.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
        return out;
      }
      function pentAt(x, y, r) {
        var out = [];
        for (var i = 0; i < 5; i++) { var a = (72 * i - 90) * Math.PI / 180; out.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
        return out;
      }

      wrap.querySelectorAll('.bi-hop-svg').forEach(function(svg) {
        if (svg.dataset.mol === 'a') {
          ring(svg, hexAt(95, 100, 32), true);
          ring(svg, hexAt(151, 100, 32), true);
          ring(svg, [[170,82],[200,60],[230,45]], false);
          ring(svg, [[170,118],[205,138],[240,150]], false);
          ring(svg, [[78,116],[60,140],[45,160]], false);
        } else {
          ring(svg, pentAt(110, 95, 34), true);
          ring(svg, pentAt(165, 118, 28), true);
          ring(svg, [[170,92],[200,70],[230,45]], false);
          ring(svg, [[190,122],[215,140],[240,150]], false);
          ring(svg, [[95,120],[70,140],[45,160]], false);
        }
        var g = svgEl('g', { 'class':'feat' }, svg);
        feats.forEach(function(f) {
          svgEl('circle', { cx:f.x, cy:f.y, r:11, fill:f.c, 'fill-opacity':.85 }, g);
          svgEl('text', { x:f.x, y:f.y + 4, 'text-anchor':'middle', style:'fill:#fff;font-size:9px' }, g).textContent = f.t;
        });
        svgEl('polygon', { points: feats.map(function(f){ return f.x + ',' + f.y; }).join(' '), fill:'none', stroke:'#5b3fd4', 'stroke-width':1.5, 'stroke-dasharray':'5 4' }, g);
      });

      btn.addEventListener('click', function() {
        var on = box.classList.toggle('on');
        btn.textContent = on ? 'Hide pharmacophore' : 'Show pharmacophore';
        msg.innerHTML = on ? '2D similarity: <b>낮음</b> · Pharmacophoric similarity: <b>높음</b> (feature 3개의 3D 위치가 일치)'
                           : '2D similarity: <b>낮음</b>';
      });
    });
  }

  /* V9 – Property triangle */
  function initBiTri() {
    document.querySelectorAll('[data-bi-tri]').forEach(function(wrap) {
      var svg = wrap.querySelector('.bi-tri-svg');
      var tabs = wrap.querySelectorAll('.bi-tab');
      var q = function(s){ return wrap.querySelector(s); };
      var D = {
        cooh: { s:[.9, .3, .3], pot:'기준 (strong)', logd:'낮음', perm:'낮음', stab:'acyl glucuronide 우려',
                v:'Target recognition은 강하지만 property와 PK 축이 약하다 → 삼각형이 target 쪽으로 기울었다.' },
        tz:   { s:[.8, .5, .7], pot:'비슷하게 유지', logd:'↑', perm:'큰 개선 없음', stab:'개선',
                v:'Stability는 좋아졌지만 logD ↑로 PPB 증가 위험이 있다. 목적함수에 따라 성공/실패가 갈린다.' },
        acs:  { s:[.7, .6, .55], pot:'약간 ↓ 가능', logd:'중간', perm:'개선 가능', stab:'중간',
                v:'세 축이 비교적 균형적이지만 geometry가 COOH와 달라 potency를 확인해야 한다.' }
      };
      var V = [[160,30],[40,220],[280,220]];
      var labels = ['TARGET','PROPERTY','PK'];

      function draw(s) {
        svg.innerHTML = '';
        svgEl('polygon', { points: V.map(function(p){ return p.join(','); }).join(' '), fill:'#f8fafc', stroke:'#c2cede', 'stroke-width':2 }, svg);
        var c = [160, 160];
        V.forEach(function(p, i) {
          var t = svgEl('text', { x:p[0], y: i === 0 ? p[1] - 10 : p[1] + 20, 'text-anchor':'middle' }, svg);
          t.textContent = labels[i];
        });
        if (!s) return;
        var pts = V.map(function(p, i){ return [c[0] + (p[0] - c[0]) * s[i], c[1] + (p[1] - c[1]) * s[i]]; });
        svgEl('polygon', { points: pts.map(function(p){ return p.join(','); }).join(' '), fill:'#5b3fd4', 'fill-opacity':.2, stroke:'#5b3fd4', 'stroke-width':2.5 }, svg);
        pts.forEach(function(p){ svgEl('circle', { cx:p[0], cy:p[1], r:5, fill:'#5b3fd4' }, svg); });
      }

      function update(k) {
        tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.c === k); });
        var d = D[k];
        draw(d.s);
        q('.t-pot').textContent = d.pot; q('.t-logd').textContent = d.logd;
        q('.t-perm').textContent = d.perm; q('.t-stab').textContent = d.stab;
        q('.bi-tri-verdict').textContent = d.v;
      }

      tabs.forEach(function(t){ t.addEventListener('click', function(){ update(t.dataset.c); }); });
      draw(null);
      q('.bi-tri-verdict').textContent = '후보를 선택하세요.';
    });
  }

  /* V10 – Matched molecular pair explorer (illustrative data) */
  function initBiMmp() {
    document.querySelectorAll('[data-bi-mmp]').forEach(function(wrap) {
      var tabs = wrap.querySelectorAll('[data-mode]');
      var prev = wrap.querySelector('[data-prev]'), next = wrap.querySelector('[data-next]');
      var count = wrap.querySelector('.bi-mmp-count'), title = wrap.querySelector('.bi-mmp-title');
      var note = wrap.querySelector('.bi-mmp-note');
      var q = function(s){ return wrap.querySelector(s); };
      var pairs = [
        { pot:1.0, logd:-0.8, sol:4, cl:-30, src:'Series 1' },
        { pot:2.0, logd:-0.6, sol:3, cl:-20, src:'Series 2' },
        { pot:0.8, logd:-1.0, sol:6, cl:-40, src:'Series 3' },
        { pot:0.5, logd:-0.5, sol:2, cl:-10, src:'Series 4' },
        { pot:1.2, logd:-0.9, sol:5, cl:-35, src:'Series 5' }
      ];
      var proj = { pot:0.005, logd:-0.7, sol:5, cl:-25 };
      var state = { mode:'pairs', i:0 };

      function mean(k){ return pairs.reduce(function(a, p){ return a + p[k]; }, 0) / pairs.length; }
      function gmean(k){ return Math.exp(pairs.reduce(function(a, p){ return a + Math.log(p[k]); }, 0) / pairs.length); }
      function fold(v){ return v >= 1 ? v.toFixed(1) + '× ↑' : (1 / v >= 100 ? Math.round(1 / v) : (1 / v).toFixed(1)) + '× ↓'; }
      function setCard(sel, txt, cls){ var e = q(sel); e.textContent = txt; e.className = cls || ''; }

      function show(d, ttl) {
        title.textContent = ttl;
        setCard('.m-pot', d.pot === 1 ? '≈ 1×' : fold(d.pot), d.pot >= 1 ? 'good' : 'bad');
        setCard('.m-logd', (d.logd > 0 ? '+' : '') + d.logd.toFixed(1), d.logd < 0 ? 'good' : 'bad');
        setCard('.m-sol', d.sol.toFixed(0) + '× ↑', 'good');
        setCard('.m-cl', d.cl + '%', d.cl < 0 ? 'good' : 'bad');
      }

      function update() {
        tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.mode === state.mode); });
        var nav = state.mode === 'pairs';
        prev.style.visibility = next.style.visibility = nav ? 'visible' : 'hidden';
        count.textContent = nav ? (state.i + 1) + ' / ' + pairs.length : '';
        if (state.mode === 'pairs') {
          show(pairs[state.i], pairs[state.i].src + ' (historical, 가상)');
          note.textContent = '개별 pair마다 결과가 다르다. 한 pair로 일반 법칙을 만들면 위험하다.';
        } else if (state.mode === 'avg') {
          show({ pot:gmean('pot'), logd:mean('logd'), sol:gmean('sol'), cl:Math.round(mean('cl')) }, 'Average trend (n = ' + pairs.length + ')');
          note.textContent = '평균적으로 logD ↓, solubility ↑, clearance ↓. Potency는 대체로 유지 → "pyridyl이 유리하다"는 가설이 생긴다.';
        } else {
          show(proj, 'This project');
          note.textContent = '평균 trend는 개선이지만 이 project에서는 potency가 200× 악화됐다. Pyridine N이 H-bond partner 없이 buried된 구조적 context 때문일 수 있다.';
        }
      }

      tabs.forEach(function(t){ t.addEventListener('click', function(){ state.mode = t.dataset.mode; update(); }); });
      prev.addEventListener('click', function(){ state.i = (state.i + pairs.length - 1) % pairs.length; update(); });
      next.addEventListener('click', function(){ state.i = (state.i + 1) % pairs.length; update(); });
      update();
    });
  }

  /* V11 – AI bioisostere generator (mock) */
  function initBiGen() {
    document.querySelectorAll('[data-bi-gen]').forEach(function(wrap) {
      var goals = wrap.querySelectorAll('[data-goal]');
      var anchor = wrap.querySelector('.gen-anchor');
      var cards = wrap.querySelector('.bi-gen-cards');
      var detail = wrap.querySelector('.bi-gen-detail');
      var C = {
        tz: { name:'Tetrazole', keep:'acidic anchor, 음전하', anchor:true,
              chg:{ metab:'acyl glucuronidation 경로 회피 가능', logd:'logD는 오히려 ↑ 가능', perm:'ionized 상태 유지 → 개선 제한적' },
              risk:{ metab:'다른 soft spot으로 metabolic switching', logd:'PPB ↑, free fraction ↓', perm:'permeability 기대만큼 안 오를 수 있음' },
              bind:'Arg와의 salt bridge geometry가 유지되는지 co-crystal/docking으로 확인',
              prop:'pKa, logD 측정으로 charge/lipophilicity 변화 확인',
              exp:'biochemical IC50 · pKa · logD · microsomal stability · PPB' },
        acs: { name:'Acyl sulfonamide', keep:'acidic anchor', anchor:true,
              chg:{ metab:'COOH와 다른 metabolic profile', logd:'lipophilicity 조절 폭이 넓음', perm:'logD 조절로 개선 가능성' },
              risk:{ metab:'새 soft spot 가능', logd:'substituent에 따라 logD 편차 큼', perm:'여전히 anionic, 개선 폭 불확실' },
              bind:'acid의 위치·방향이 COOH와 달라 potency 변화 가능',
              prop:'pKa 범위와 lipophilicity가 COOH와 다름',
              exp:'IC50 · pKa · logD · permeability(PAMPA/Caco-2)' },
        neutral: { name:'Neutral mimic', keep:'geometry 일부', anchor:false,
              chg:{ metab:'acid 특이 경로 제거', logd:'logD 변화 큼', perm:'charge 제거로 큰 개선 가능' },
              risk:{ metab:'새 soft spot', logd:'너무 lipophilic해질 위험', perm:'Arg interaction 손실로 potency ↓ 위험 큼' },
              bind:'ionic interaction을 다른 interaction이 대체해야 함',
              prop:'neutral이므로 ionization 의존성 제거',
              exp:'IC50 · logD · permeability · target engagement' }
      };
      var order = {
        metab:['tz','acs','neutral'], logd:['acs','neutral','tz'], perm:['neutral','acs','tz']
      };
      var state = { goal:'metab' };

      function render() {
        goals.forEach(function(g){ g.classList.toggle('active', g.dataset.goal === state.goal); });
        cards.innerHTML = '';
        detail.className = 'bi-gen-detail';
        detail.innerHTML = '';
        order[state.goal].forEach(function(k, i) {
          var c = C[k];
          var btn = document.createElement('button');
          var violates = anchor.checked && !c.anchor;
          btn.className = 'bi-gen-card' + (violates ? ' dim' : '');
          btn.innerHTML = '<h6>Candidate ' + (i + 1) + ' · ' + c.name + '</h6>' +
            '<div><b>Preserved:</b> ' + (violates ? 'acidic anchor 유지 안 됨 ⚠' : c.keep) + '</div>' +
            '<div><b>Changes:</b> ' + c.chg[state.goal] + '</div>' +
            '<div><b>Main risk:</b> ' + c.risk[state.goal] + '</div>';
          btn.addEventListener('click', function() {
            cards.querySelectorAll('.bi-gen-card').forEach(function(x){ x.classList.remove('active'); });
            btn.classList.add('active');
            detail.innerHTML = '<div><b>Binding hypothesis</b>' + c.bind + '</div>' +
              '<div><b>Property hypothesis</b>' + c.prop + '</div>' +
              '<div><b>Required experiment</b>' + c.exp + '</div>';
            detail.classList.add('show');
          });
          cards.appendChild(btn);
        });
      }

      goals.forEach(function(g){ g.addEventListener('click', function(){ state.goal = g.dataset.goal; render(); }); });
      anchor.addEventListener('change', render);
      render();
    });
  }

  /* V12 – Decision flow */
  function initBiFlow() {
    document.querySelectorAll('[data-bi-flow]').forEach(function(wrap) {
      var out = wrap.querySelector('.bi-flow-out');
      var state = { ess:null, liab:null };
      var ESS = {
        charge: 'negative charge를 유지해야 한다 → acidic replacement(tetrazole, acyl sulfonamide 등)가 중심 후보.',
        hba:    'HBA geometry가 핵심이다 → acceptor 위치·방향을 맞추는 후보를 구조 정보로 선별.',
        shape:  'Shape/spacing이 핵심이다 → 형태를 유지하는 ring/heterocycle 후보를 고려.',
        all:    '⚠ 모든 것을 보존하려 하면 사실상 같은 group만 남는다. 무엇이 진짜 essential인지 먼저 구조 데이터로 분리해야 한다.'
      };
      var LIAB = {
        metab: ['Tetrazole', 'Acyl sulfonamide', 'Neutral mimic'],
        perm:  ['Acyl sulfonamide (logD 조절)', 'Neutral mimic', 'Tetrazole'],
        sol:   ['Heteroaryl 치환', 'Acidic heterocycle', 'Polar group 조정'],
        sel:   ['Geometry가 다른 acid isostere', 'Scaffold hopping', 'Selectivity pocket 이용']
      };

      function update() {
        wrap.querySelectorAll('.bi-flow-opts').forEach(function(g) {
          g.querySelectorAll('.bi-tab').forEach(function(b){ b.classList.toggle('active', state[g.dataset.grp] === b.dataset.v); });
        });
        if (!state.ess || !state.liab) { out.classList.remove('show'); return; }
        var warn = state.ess === 'all' ? ' bi-flow-box--warn' : '';
        out.innerHTML =
          '<div class="bi-flow-box' + warn + '"><b>Preserve:</b> ' + ESS[state.ess] + '</div>' +
          '<div class="bi-flow-box"><b>Candidate panel:</b> ' + LIAB[state.liab].join(' · ') + ' — 하나만 고르지 않고 panel로 설계한다.</div>' +
          '<div class="bi-flow-box"><b>Experiments:</b> potency · pKa · logD · permeability · microsomal stability (가능하면 structure)</div>' +
          '<div class="bi-flow-box"><b>Decision:</b> Target recognition · Physicochemical · Metabolism/PK 세 축을 함께 보고, project goal에 맞춰 판단한다.</div>';
        out.classList.add('show');
      }

      wrap.querySelectorAll('.bi-flow-opts').forEach(function(g) {
        g.querySelectorAll('.bi-tab').forEach(function(b) {
          b.addEventListener('click', function(){ state[g.dataset.grp] = b.dataset.v; update(); });
        });
      });
    });
  }

  /* ============================================================
     L07 – Ligand Efficiency / Lipophilic Efficiency
     ============================================================ */

  function leLE(pK, ha) { return 1.37 * pK / ha; }
  function lePfromNM(nm) { return 9 - Math.log(nm) / Math.LN10; }
  function leFmtNM(nm) {
    if (nm >= 1000) return (nm / 1000).toPrecision(2).replace(/\.0+$/, '') + ' µM';
    if (nm < 1) return nm.toPrecision(2) + ' nM';
    return (nm >= 10 ? Math.round(nm) : nm.toPrecision(2)) + ' nM';
  }

  /* V1 */
  function initLeOpen() {
    document.querySelectorAll('[data-le-open]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('[data-ans]');
      var rev = wrap.querySelector('.le-reveal');
      var fb = wrap.querySelector('.le-fb');
      var msg = {
        A: '아직 판단할 수 없다. A는 더 작고 덜 greasy하지만 potency는 20× 낮다. 비교하려면 potency, size, lipophilicity를 함께 봐야 한다.',
        B: 'Raw potency는 B가 낫지만, B는 MW +110, logD +2.2를 지불했다. 그 대가를 보기 전에는 B가 낫다고 말할 수 없다.',
        N: '✓ 정답. Potency만으로는 lead quality를 비교할 수 없다. 세 축(potency / size / lipophilicity)을 함께 본다.'
      };
      btns.forEach(function(b) {
        b.addEventListener('click', function() {
          btns.forEach(function(x){ x.classList.toggle('active', x === b); });
          fb.textContent = msg[b.dataset.ans];
          fb.classList.toggle('ok', b.dataset.ans === 'N');
          rev.classList.add('show');
        });
      });
    });
  }

  /* V2 */
  function initLeLadder() {
    document.querySelectorAll('[data-le-ladder]').forEach(function(wrap) {
      var qs = [30, 3, 250, 2000, 60, 0.5];
      var idx = -1;
      var ic = wrap.querySelector('.le-ladder-ic');
      var opts = wrap.querySelector('.le-ladder-opts');
      var fb = wrap.querySelector('.le-ladder-fb');
      var rungs = wrap.querySelectorAll('.le-rung');

      function next() {
        idx = (idx + 1) % qs.length;
        var nm = qs[idx];
        var p = lePfromNM(nm);
        var right = Math.round(p * 2) / 2;
        var choices = [right, right + 1, right - 1].sort(function(a, b){ return ((a * 7) % 3) - ((b * 7) % 3); });
        ic.textContent = 'IC50 = ' + leFmtNM(nm);
        fb.textContent = ''; fb.className = 'le-ladder-fb';
        opts.innerHTML = '';
        choices.forEach(function(c) {
          var b = document.createElement('button');
          b.className = 'bi-tab';
          b.textContent = 'pIC50 ≈ ' + c.toFixed(1);
          b.addEventListener('click', function() {
            var ok = c === right;
            b.classList.add('active');
            fb.textContent = (ok ? '✓ ' : '✗ ') + '정밀 계산: pIC50 = −log₁₀(' + nm + '×10⁻⁹) = ' + p.toFixed(2);
            fb.className = 'le-ladder-fb ' + (ok ? 'ok' : 'bad');
          });
          opts.appendChild(b);
        });
        rungs.forEach(function(r){ r.classList.remove('hl'); });
        var near = Math.min(3, Math.max(0, Math.round(p) - 6));
        if (rungs[near]) rungs[near].classList.add('hl');
      }
      wrap.querySelector('[data-next-q]').addEventListener('click', next);
      next();
    });
  }

  /* V3 */
  function initLeAtoms() {
    document.querySelectorAll('[data-le-atoms]').forEach(function(wrap) {
      wrap.querySelectorAll('.le-atoms-row').forEach(function(row) {
        var ha = +row.dataset.ha;
        var le = leLE(6, ha);
        var box = row.querySelector('.le-atoms-blocks');
        for (var i = 0; i < ha; i++) {
          var b = document.createElement('div');
          b.className = 'le-atom';
          var f = document.createElement('div');
          f.className = 'le-atom-fill';
          f.style.height = Math.min(100, le / 0.6 * 100) + '%';
          b.appendChild(f);
          box.appendChild(b);
        }
        row.querySelector('.le-atoms-le').textContent = 'LE ≈ ' + le.toFixed(2);
      });
    });
  }

  /* V4 */
  function initLeGrow() {
    document.querySelectorAll('[data-le-grow]').forEach(function(wrap) {
      var tabs = wrap.querySelectorAll('[data-path]');
      var box = wrap.querySelector('.le-grow-steps');
      var fb = wrap.querySelector('.le-grow-fb');
      var start = { label:'Fragment', kd:200000, ha:12 };
      var P = {
        A: [ { label:'+ small group 1', kd:20000, ha:14 }, { label:'+ small group 2', kd:1500, ha:17 }, { label:'+ small group 3', kd:80, ha:20 } ],
        B: [ { label:'+ phenyl', kd:100000, ha:18 }, { label:'+ second aryl', kd:30000, ha:24 }, { label:'+ large group', kd:8000, ha:30 } ]
      };
      var path = null, n = 0;

      function row(s) {
        var le = leLE(lePfromNM(s.kd), s.ha);
        return '<div class="le-grow-row"><b>' + s.label + '</b><span>Kd ' + leFmtNM(s.kd) + '</span><span>' + s.ha + ' HA</span><span class="le-pill">LE ' + le.toFixed(2) + '</span></div>';
      }
      function render() {
        tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.path === path); });
        var html = row(start);
        if (path) for (var i = 0; i < n; i++) html += row(P[path][i]);
        box.innerHTML = html;
        if (!path) { fb.textContent = 'Route를 먼저 선택하세요.'; return; }
        if (n === 0) { fb.textContent = '“Add group”을 눌러 단계를 진행하세요.'; return; }
        var s = P[path][n - 1];
        var gain = Math.round(start.kd / s.kd), grow = s.ha - start.ha;
        fb.textContent = 'Affinity ' + gain + '× ↑, heavy atom +' + grow + '. ' +
          (path === 'A' ? '추가한 atom이 비교적 생산적으로 affinity를 만든다 (LE 유지).' : '큰 group을 붙였지만 affinity gain이 작아 LE가 빠르게 떨어진다.');
      }

      tabs.forEach(function(t){ t.addEventListener('click', function(){ path = t.dataset.path; n = 0; render(); }); });
      wrap.querySelector('[data-step]').addEventListener('click', function() { if (path && n < 3) { n++; render(); } });
      wrap.querySelector('[data-reset]').addEventListener('click', function(){ path = null; n = 0; render(); });
      render();
    });
  }

  /* V5 */
  function initLeLipe() {
    document.querySelectorAll('[data-le-lipe]').forEach(function(wrap) {
      var icIn = wrap.querySelector('.lc-ic-in'), ldIn = wrap.querySelector('.lc-ld-in');
      var q = function(s){ return wrap.querySelector(s); };

      function update() {
        var nm = Math.pow(10, +icIn.value);
        var ld = +ldIn.value;
        var p = lePfromNM(nm);
        var lipe = p - ld;
        q('.lc-ic').textContent = leFmtNM(nm);
        q('.lc-ld').textContent = ld.toFixed(1);
        q('.lc-p').textContent = p.toFixed(1);
        q('.lc-l').textContent = lipe.toFixed(1);
        var d = lipe - 5;
        q('.lc-d').textContent = (d >= 0 ? '+' : '') + d.toFixed(1);
        var fb = q('.lc-fb');
        if (p > 7 && d < -0.5) { fb.textContent = 'A보다 potent하지만 lipophilicity cost가 더 커서 LipE가 악화됐다.'; fb.className = 'le-fb lc-fb bad'; }
        else if (p > 7 && d >= 0) { fb.textContent = 'Potency는 오르고 LipE도 유지/개선 — 효율적인 potency gain이다.'; fb.className = 'le-fb lc-fb ok'; }
        else if (p <= 7 && d > 0.5) { fb.textContent = 'Potency는 같거나 낮지만 LipE는 더 좋다. Quality 관점의 개선일 수 있다.'; fb.className = 'le-fb lc-fb ok'; }
        else { fb.textContent = 'A와 비슷한 수준이다.'; fb.className = 'le-fb lc-fb'; }
      }
      icIn.addEventListener('input', update);
      ldIn.addEventListener('input', update);
      update();
    });
  }

  /* V6 */
  function initLeTrap() {
    document.querySelectorAll('[data-le-trap]').forEach(function(wrap) {
      var box = wrap.querySelector('.le-trap-rows');
      var fb = wrap.querySelector('.le-trap-fb');
      var rows = [
        { n:'H',        nm:1000, ld:1.5, msg:'시작점이다. 아직 SAR을 탐색할 여지가 많다. 너무 일찍 멈춘 것일 수 있다.' },
        { n:'CH₃',      nm:200,  ld:2.0, msg:'potency 5× ↑에 logD +0.5. LipE는 오히려 개선(4.5 → 4.7). 매우 생산적인 단계다.' },
        { n:'Et',       nm:80,   ld:2.8, msg:'LipE가 4.3으로 하락하기 시작한다. 아직 감당 가능하지만 다른 방향(polar, constrained group)을 시도할 시점이다.' },
        { n:'Phenyl',   nm:10,   ld:5.0, msg:'Potency는 8× 더 올랐지만 logD가 +2.2. LipE 3.0. 여기까지 오면 비용이 크다 — 반드시 property panel을 확인해야 한다.' },
        { n:'Biphenyl', nm:6,    ld:6.4, msg:'Potency는 거의 늘지 않았는데 logD는 6.4. 명백히 over-optimized. Solubility, PPB, off-target 문제가 예상된다.' }
      ];
      rows.forEach(function(r, i) {
        var p = lePfromNM(r.nm), lipe = p - r.ld;
        var el = document.createElement('button');
        el.className = 'le-trap-row';
        el.innerHTML = '<b>' + r.n + '</b><span>IC50 ' + leFmtNM(r.nm) + '</span><span>logD ' + r.ld.toFixed(1) +
          '</span><span class="le-trap-bar"><i style="width:' + Math.min(100, r.ld / 7 * 100) + '%"></i></span><span class="le-pill">LipE ' + lipe.toFixed(1) + '</span>';
        el.addEventListener('click', function() {
          box.querySelectorAll('.le-trap-row').forEach(function(x){ x.classList.remove('stop'); });
          el.classList.add('stop');
          fb.textContent = '“' + r.n + '”에서 멈춤 → ' + r.msg;
          fb.className = 'le-fb le-trap-fb' + (i >= 3 ? ' bad' : (i === 1 ? ' ok' : ''));
        });
        box.appendChild(el);
      });
    });
  }

  /* V7 */
  function initLeMatrix() {
    document.querySelectorAll('[data-le-matrix]').forEach(function(wrap) {
      var svg = wrap.querySelector('.le-matrix-svg');
      var info = wrap.querySelector('.le-matrix-info');
      var cs = [
        { n:'P', mw:280, ha:20, p:7.0, ld:1.8 },
        { n:'Q', mw:410, ha:30, p:8.0, ld:4.2 },
        { n:'R', mw:330, ha:24, p:8.0, ld:2.2 },
        { n:'S', mw:520, ha:38, p:8.0, ld:5.0 }
      ];
      function X(v){ return 40 + (v - 2) / 5 * 280; }
      function Y(v){ return 240 - (v - 0.2) / 0.4 * 220; }

      svgEl('line', { x1:40, y1:240, x2:320, y2:240, stroke:'#c2cede', 'stroke-width':1.5 }, svg);
      svgEl('line', { x1:40, y1:20, x2:40, y2:240, stroke:'#c2cede', 'stroke-width':1.5 }, svg);
      svgEl('rect', { x:X(5), y:20, width:X(7) - X(5), height:Y(0.4) - 20, fill:'#5b3fd4', 'fill-opacity':.07 }, svg);
      svgEl('text', { x:X(5) + 4, y:34 }, svg).textContent = '상대적으로 효율적인 영역';
      svgEl('text', { x:180, y:268, 'text-anchor':'middle' }, svg).textContent = 'LipE  (low → high)';
      var yl = svgEl('text', { x:12, y:130, transform:'rotate(-90 12 130)', 'text-anchor':'middle' }, svg);
      yl.textContent = 'LE  (low → high)';

      cs.forEach(function(c) {
        c.le = leLE(c.p, c.ha); c.lipe = c.p - c.ld;
        var g = svgEl('g', { style:'cursor:pointer' }, svg);
        svgEl('circle', { cx:X(c.lipe), cy:Y(c.le), r:15, fill:'#5b3fd4', 'fill-opacity':.2, stroke:'#5b3fd4', 'stroke-width':2 }, g);
        svgEl('text', { x:X(c.lipe), y:Y(c.le) + 4, 'text-anchor':'middle', style:'fill:#3d28a8;font-size:12px' }, g).textContent = c.n;
        g.addEventListener('click', function() {
          info.innerHTML = '<div class="le-three-c"><span>Compound ' + c.n + '</span><b>MW ' + c.mw + '</b></div>' +
            '<div class="le-three-c"><span>pIC50 · logD</span><b>' + c.p.toFixed(1) + ' · ' + c.ld.toFixed(1) + '</b></div>' +
            '<div class="le-three-c"><span>LE · LipE</span><b>' + c.le.toFixed(2) + ' · ' + c.lipe.toFixed(1) + '</b></div>';
        });
      });
    });
  }

  /* V8 */
  function initLeQuality() {
    document.querySelectorAll('[data-le-quality]').forEach(function(wrap) {
      var btn = wrap.querySelector('[data-cost]');
      var cmp = wrap.querySelector('.le-cmp');
      var fb = wrap.querySelector('.le-cmp-fb');
      fb.textContent = 'Raw potency만 보면: B = C > A. 두 compound를 승자로 볼 수밖에 없다.';
      btn.addEventListener('click', function() {
        var on = cmp.classList.toggle('on');
        btn.textContent = on ? 'Hide molecular cost' : 'Show molecular cost';
        fb.textContent = on ? 'C가 B와 같은 potency를 더 작은 size(MW 330 vs 410)와 더 낮은 lipophilicity(logD 2.2 vs 4.2)로 달성했다. LipE: A 5.2 · B 3.8 · C 5.8.'
                            : 'Raw potency만 보면: B = C > A. 두 compound를 승자로 볼 수밖에 없다.';
      });
    });
  }

  /* V9 */
  function initLeRadar() {
    document.querySelectorAll('[data-le-radar]').forEach(function(wrap) {
      var svg = wrap.querySelector('.le-radar-svg');
      var tabs = wrap.querySelectorAll('[data-proj]');
      var fb = wrap.querySelector('.le-radar-fb');
      var axes = ['Potency','LipE','Solubility','Permeability','Metabolic stability','Selectivity'];
      var X = [.95, .3, .2, .3, .3, .3];
      var Y = [.65, .8, .8, .7, .7, .75];
      var P = {
        oral: { emph:[2,3,4], msg: 'Oral drug: solubility, permeability, metabolic stability가 exposure를 좌우한다. Compound X는 potency가 높아도 이 축들이 약하다.' },
        cns:  { emph:[1,3,5], msg: 'CNS drug: 낮은 lipophilicity 비용(LipE), permeability, off-target selectivity가 특히 중요하다. 과도하게 greasy한 X는 불리하다.' },
        tool: { emph:[0,5],   msg: 'Tool compound: 짧은 실험에서 potency와 selectivity가 핵심이다. 이 경우 X도 쓸 만할 수 있다 — 목적에 따라 해석이 달라진다.' }
      };
      var cx = 170, cy = 150, R = 95;
      function pt(i, v) { var a = -Math.PI / 2 + i * 2 * Math.PI / 6; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; }

      function draw(key) {
        svg.innerHTML = '';
        var em = key ? P[key].emph : [];
        [.33, .66, 1].forEach(function(r) {
          svgEl('polygon', { points: axes.map(function(_, i){ return pt(i, r).join(','); }).join(' '), fill:'none', stroke:'#dce3ef' }, svg);
        });
        axes.forEach(function(nm, i) {
          var e = pt(i, 1), l = pt(i, 1.2);
          svgEl('line', { x1:cx, y1:cy, x2:e[0], y2:e[1], stroke:'#dce3ef' }, svg);
          var on = em.indexOf(i) >= 0;
          var t = svgEl('text', { x:l[0], y:l[1] + 4, 'text-anchor': l[0] < cx - 5 ? 'end' : (l[0] > cx + 5 ? 'start' : 'middle'),
            style: on ? 'fill:#5b3fd4;font-weight:800;font-size:12px' : '' }, svg);
          t.textContent = nm;
        });
        [[X, '#c2410c'], [Y, '#5b3fd4']].forEach(function(s) {
          svgEl('polygon', { points: s[0].map(function(v, i){ return pt(i, v).join(','); }).join(' '), fill:s[1], 'fill-opacity':.16, stroke:s[1], 'stroke-width':2 }, svg);
        });
      }
      tabs.forEach(function(t) {
        t.addEventListener('click', function() {
          tabs.forEach(function(x){ x.classList.toggle('active', x === t); });
          draw(t.dataset.proj);
          fb.textContent = P[t.dataset.proj].msg;
        });
      });
      draw(null);
      fb.textContent = 'Compound X는 potency가 압도적이지만 나머지가 약하고, Y는 balanced하다. Project 유형을 선택하세요.';
    });
  }

  /* V10 */
  function initLeHack() {
    document.querySelectorAll('[data-le-hack]').forEach(function(wrap) {
      var tabs = wrap.querySelectorAll('[data-mode]');
      var mol = wrap.querySelector('.le-hack-mol');
      var fb = wrap.querySelector('.le-hack-fb');
      var q = function(s){ return wrap.querySelector(s); };
      var D = {
        pot: [
          { mol:'core', ic:'10 nM', mw:380, lp:3.1, sol:'good' },
          { mol:'core–Ph', ic:'3 nM', mw:455, lp:4.2, sol:'moderate' },
          { mol:'core–Ph–Ph', ic:'1 nM', mw:530, lp:5.3, sol:'low' },
          { mol:'core–Ph–Ph–CF₃', ic:'0.3 nM', mw:600, lp:6.4, sol:'very low' }
        ],
        mpo: [
          { mol:'core', ic:'10 nM', mw:380, lp:3.1, sol:'good' },
          { mol:'core–pyridyl', ic:'5 nM', mw:392, lp:2.9, sol:'good' },
          { mol:'core–pyridyl–F', ic:'2 nM', mw:410, lp:3.1, sol:'good' },
          { mol:'core–pyridyl–F (cyclopropyl)', ic:'1.5 nM', mw:424, lp:3.3, sol:'good' }
        ]
      };
      var mode = 'pot', i = 0;

      function show() {
        tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.mode === mode); });
        var d = D[mode][i];
        q('.hk-ic').textContent = d.ic; q('.hk-mw').textContent = d.mw;
        q('.hk-lp').textContent = d.lp.toFixed(1); q('.hk-sol').textContent = d.sol;
        mol.textContent = d.mol;
        var last = i === D[mode].length - 1;
        if (mode === 'pot') {
          fb.className = 'le-fb le-hack-fb' + (last ? ' bad' : '');
          fb.textContent = last ? 'High score / Poor molecule — potency 숫자는 좋아졌지만 MW 600, cLogP 6.4.' : (i === 0 ? '시작 분자.' : '모델이 ring과 lipophilic group을 추가해 score를 올리고 있다.');
        } else {
          fb.className = 'le-fb le-hack-fb' + (last ? ' ok' : '');
          fb.textContent = last ? 'MW·cLogP·solubility 제약 안에서 개선 — 더 balanced한 분자. (그래도 mechanistic validation은 필요)' : (i === 0 ? '시작 분자.' : 'Constraint(MW, logD, solubility) 안에서만 modification이 채택된다.');
        }
      }
      tabs.forEach(function(t){ t.addEventListener('click', function(){ mode = t.dataset.mode; i = 0; show(); }); });
      wrap.querySelector('[data-gen]').addEventListener('click', function() {
        if (i < D[mode].length - 1) { i++; show(); }
      });
      wrap.querySelector('[data-reset]').addEventListener('click', function(){ i = 0; show(); });
      show();
    });
  }

  /* V11 */
  function initLePareto() {
    document.querySelectorAll('[data-le-pareto]').forEach(function(wrap) {
      var svg = wrap.querySelector('.le-pareto-svg');
      var inp = wrap.querySelector('.pf-in');
      var lab = wrap.querySelector('.pf-ld');
      var fb = wrap.querySelector('.le-pareto-fb');
      var pts = [
        ['a',9.0,5,5.8],['b',8.7,12,5.2],['c',8.5,30,4.1],['d',8.2,45,3.6],['e',7.9,55,3.2],['f',7.6,70,2.5],
        ['g',7.2,78,2.0],['h',6.8,85,1.6],['i',8.0,25,4.6],['j',7.5,40,3.4],['k',8.4,20,4.7],['l',7.0,60,2.8]
      ].map(function(a){ return { id:a[0], p:a[1], s:a[2], ld:a[3] }; });
      function X(v){ return 40 + (v - 6.5) / 2.8 * 280; }
      function Y(v){ return 220 - v / 100 * 200; }

      function draw() {
        var max = +inp.value;
        lab.textContent = max.toFixed(1);
        svg.innerHTML = '';
        svgEl('line', { x1:40, y1:220, x2:320, y2:220, stroke:'#c2cede', 'stroke-width':1.5 }, svg);
        svgEl('line', { x1:40, y1:20, x2:40, y2:220, stroke:'#c2cede', 'stroke-width':1.5 }, svg);
        svgEl('text', { x:180, y:248, 'text-anchor':'middle' }, svg).textContent = 'Potency (pIC50) →';
        svgEl('text', { x:12, y:120, transform:'rotate(-90 12 120)', 'text-anchor':'middle' }, svg).textContent = 'Solubility →';
        var ok = pts.filter(function(p){ return p.ld <= max; });
        var front = ok.filter(function(a) {
          return !ok.some(function(b){ return b !== a && b.p >= a.p && b.s >= a.s && (b.p > a.p || b.s > a.s); });
        }).sort(function(a, b){ return a.p - b.p; });
        if (front.length > 1) {
          svgEl('polyline', { points: front.map(function(p){ return X(p.p) + ',' + Y(p.s); }).join(' '), fill:'none', stroke:'#5b3fd4', 'stroke-width':2, 'stroke-dasharray':'5 4' }, svg);
        }
        pts.forEach(function(p) {
          var allowed = p.ld <= max, onF = front.indexOf(p) >= 0;
          svgEl('circle', { cx:X(p.p), cy:Y(p.s), r: onF ? 8 : 6, fill: onF ? '#5b3fd4' : (allowed ? '#94a3b8' : '#e2e8f0'), stroke: allowed ? 'none' : '#cbd5e1' }, svg);
          if (onF) svgEl('text', { x:X(p.p) + 11, y:Y(p.s) + 4 }, svg).textContent = p.id;
        });
        fb.textContent = 'logD ≤ ' + max.toFixed(1) + ' 허용 compound ' + ok.length + '개 중 Pareto 후보 ' + front.length + '개 (' +
          front.map(function(p){ return p.id; }).join(', ') + '). 하나의 “최고”가 아니라 trade-off 집합이다.';
      }
      inp.addEventListener('input', draw);
      draw();
    });
  }

  /* V12 */
  function initLeAudit() {
    document.querySelectorAll('[data-le-audit]').forEach(function(wrap) {
      var box = wrap.querySelector('.le-audit-steps');
      var fb = wrap.querySelector('.le-audit-fb');
      var steps = [
        { h:'1. Potency gain', b:'200 nM → 10 nM, 20× 개선. pIC50 6.7 → 8.0, 약 +1.3.' },
        { h:'2. Size cost', b:'MW 320 → 430 (+110), heavy atom 증가. LE는 감소했을 가능성이 있다.' },
        { h:'3. Lipophilicity cost', b:'logD 2.0 → 4.5 (+2.5). LipE: 6.7 − 2.0 = 4.7 → 8.0 − 4.5 = 3.5. Potency gain(+1.3)보다 lipophilicity cost(+2.5)가 크다.' },
        { h:'4. Property consequences', b:'반드시 보고 싶은 데이터: solubility · permeability · PPB · microsomal stability · selectivity panel · hERG · PK.' }
      ];
      var nexts = {
        red:  'B의 새 hydrophobic group이 전부 필요한지 줄여 본다 (예: 작은 aryl, 위치 이동). Potency를 유지하며 cost를 돌려받는 것이 목표다.',
        het:  'Phenyl → pyridyl 등 heteroaryl 치환 (6강). Polarity를 올리고 logD를 낮추되, buried N의 desolvation penalty를 확인한다.',
        cyc:  'Cyclopropyl 같은 작고 constrained한 group으로 hydrophobic pocket을 채우면서 MW/logD 증가를 최소화할 수 있다.',
        keep: 'Property panel 결과가 나오기 전에 B를 확정하는 것은 이르다. 최소한 위 4번의 데이터를 확인한 뒤 결정한다.'
      };
      steps.forEach(function(s, i) {
        var el = document.createElement('div');
        el.className = 'le-audit-card';
        el.innerHTML = '<div class="le-audit-h">' + s.h + '<span>▼</span></div><div class="le-audit-b">' + s.b + '</div>';
        el.querySelector('.le-audit-h').addEventListener('click', function(){ el.classList.toggle('open'); });
        box.appendChild(el);
      });
      wrap.querySelectorAll('[data-n]').forEach(function(b) {
        b.addEventListener('click', function() {
          wrap.querySelectorAll('[data-n]').forEach(function(x){ x.classList.toggle('active', x === b); });
          fb.textContent = nexts[b.dataset.n];
        });
      });
    });
  }

  /* ============================================================
     L08 – SAR을 읽는 법
     ============================================================ */

  function srHex(x, y, r, rot) {
    var out = [];
    for (var i = 0; i < 6; i++) { var a = (60 * i + (rot || 0)) * Math.PI / 180; out.push((x + Math.cos(a) * r) + ',' + (y + Math.sin(a) * r)); }
    return out.join(' ');
  }

  /* V1 – SAR table detective */
  function initSrDetective() {
    document.querySelectorAll('[data-sr-detective]').forEach(function(wrap) {
      var tbl = wrap.querySelector('.sr-det-table');
      var fb = wrap.querySelector('.sr-det-fb');
      var rows = [
        { id:'A', r:'H',      nm:800, ld:1.5, perm:'good',     stab:'high' },
        { id:'B', r:'CH₃',    nm:180, ld:2.0, perm:'good',     stab:'medium' },
        { id:'C', r:'Cl',     nm:70,  ld:2.7, perm:'good',     stab:'medium' },
        { id:'D', r:'OMe',    nm:120, ld:2.1, perm:'moderate', stab:'low' },
        { id:'E', r:'OH',     nm:950, ld:1.2, perm:'poor',     stab:'medium' },
        { id:'F', r:'Phenyl', nm:8,   ld:4.8, perm:'good',     stab:'low' }
      ];
      var st = { logd:false, perm:false, stab:false };
      var pick = null;

      function lipe(r) { return lePfromNM(r.nm) - r.ld; }
      function favorite() {
        var pool = rows.filter(function(r) {
          return !(st.perm && r.perm === 'poor') && !(st.stab && r.stab === 'low');
        });
        if (!st.logd) { // IC50 only (permeability/stability filters still applied)
          return pool.slice().sort(function(a, b){ return a.nm - b.nm; })[0];
        }
        return pool.slice().sort(function(a, b){ return lipe(b) - lipe(a); })[0];
      }
      function render() {
        var cols = ['.5fr', '.8fr', '1fr'];
        if (st.logd) { cols.push('.8fr', '.8fr'); }
        if (st.perm) cols.push('1fr');
        if (st.stab) cols.push('1fr');
        var fav = favorite();
        var h = '<div class="sr-tbl" style="--cols:' + cols.join(' ') + ';"><div class="sr-tr sr-tr--h"><span>Cpd</span><span>R</span><span>IC50</span>' +
          (st.logd ? '<span>logD</span><span>LipE</span>' : '') + (st.perm ? '<span>Perm.</span>' : '') + (st.stab ? '<span>Met. stab.</span>' : '') + '</div>';
        rows.forEach(function(r) {
          var out = (st.perm && r.perm === 'poor') || (st.stab && r.stab === 'low');
          h += '<div class="sr-tr sr-tr--pick' + (r === fav ? ' fav' : '') + (out ? ' out' : '') + (pick === r ? ' picked' : '') + '" data-id="' + r.id + '"><b>' + r.id + '</b><span>' + r.r + '</span><span>' + leFmtNM(r.nm) + '</span>' +
            (st.logd ? '<span>' + r.ld.toFixed(1) + '</span><span>' + lipe(r).toFixed(1) + '</span>' : '') +
            (st.perm ? '<span>' + r.perm + '</span>' : '') + (st.stab ? '<span>' + r.stab + '</span>' : '') + '</div>';
        });
        tbl.innerHTML = h + '</div>';
        tbl.querySelectorAll('.sr-tr--pick').forEach(function(el) {
          el.addEventListener('click', function() { pick = rows.filter(function(r){ return r.id === el.dataset.id; })[0]; render(); });
        });
        var basis = st.logd ? 'LipE 기준' : 'IC50 기준';
        var txt = '이 시점의 유력 후보(' + basis + '): Compound ' + fav.id + ' (R = ' + fav.r + ')';
        if (st.logd) txt += ' · LipE ' + lipe(fav).toFixed(1);
        if (st.logd && !st.perm && !st.stab) txt += '. F는 가장 potent하지만 LipE 3.3으로 가장 낮다.';
        if (st.perm) txt += '. E(OH)는 permeability poor로 탈락 후보.';
        if (st.stab) txt += ' D·F는 대사 안정성이 낮다.';
        if (pick) txt += ' 당신의 선택: ' + pick.id + (pick === fav ? ' (현재 유력 후보와 일치)' : ' (유력 후보와 다름)') + '.';
        fb.textContent = txt;
      }
      wrap.querySelectorAll('[data-add]').forEach(function(b) {
        b.addEventListener('click', function(){ st[b.dataset.add] = true; render(); });
      });
      wrap.querySelector('[data-reset]').addEventListener('click', function(){ st = { logd:false, perm:false, stab:false }; pick = null; render(); });
      render();
    });
  }

  /* V2 – MMP viewer */
  function initSrMmp() {
    document.querySelectorAll('[data-sr-mmp]').forEach(function(wrap) {
      var pairs = [
        { a:'H',      b:'CH₃',        p:'+0.7', l:'+0.5', s:'0.7×', n:'Hydrophobic contact, cavity filling, logD 증가가 섞여 있어 원인을 단정할 수 없다.' },
        { a:'OH',     b:'OMe',        p:'+0.2', l:'+0.6', s:'0.5×', n:'Donor 제거 + size/lipophilicity 증가가 동시에 일어났다. 변수가 분리되지 않았다.' },
        { a:'Phenyl', b:'3-pyridyl',  p:'+0.1', l:'−0.9', s:'4×',   n:'Potency를 유지하며 logD를 낮춘 이상적인 pair. 다른 series에서는 결과가 다를 수 있다.' },
        { a:'NH₂',    b:'NHAc',       p:'−0.4', l:'−1.0', s:'2×',   n:'Basicity/charge가 사라지는 큰 chemistry 변화. “acetyl 하나”가 아니다.' },
        { a:'H',      b:'Cl',         p:'+0.6', l:'+0.7', s:'0.4×', n:'Potency는 오르지만 logD·solubility 비용이 따라온다.' }
      ];
      var i = 0;
      var q = function(s){ return wrap.querySelector(s); };
      function show() {
        var d = pairs[i];
        q('.sr-mmp-r-a').textContent = d.a; q('.sr-mmp-r-b').textContent = d.b;
        q('.mm-p').textContent = d.p; q('.mm-l').textContent = d.l; q('.mm-s').textContent = d.s;
        q('.sr-mmp-count').textContent = (i + 1) + ' / ' + pairs.length;
        q('.sr-mmp-fb').textContent = d.n + ' (한 pair의 결과를 일반 법칙으로 만들지 않는다. 가상 데이터)';
      }
      q('[data-prev]').addEventListener('click', function(){ i = (i + pairs.length - 1) % pairs.length; show(); });
      q('[data-next]').addEventListener('click', function(){ i = (i + 1) % pairs.length; show(); });
      show();
    });
  }

  /* V3 – Steric pocket scanner */
  function initSrSteric() {
    document.querySelectorAll('[data-sr-steric]').forEach(function(wrap) {
      var svg = wrap.querySelector('.sr-steric-svg');
      var tabs = wrap.querySelectorAll('[data-r]');
      var D = {
        H:   { w:6,  h:6,  ic:'1 µM',   fit:'빈 공간 큼',   msg:'Cavity가 거의 비어 있다. Hydrophobic contact 없음.', bad:false },
        Me:  { w:26, h:20, ic:'200 nM', fit:'일부 채움',    msg:'Cavity의 일부를 채워 potency가 5× 개선된다.', bad:false },
        Et:  { w:50, h:24, ic:'60 nM',  fit:'good fill',    msg:'Cavity를 잘 채운다. 이 위치의 favorable한 크기.', bad:false },
        iPr: { w:64, h:46, ic:'2 µM',   fit:'steric clash', msg:'Cavity 경계를 넘어 clash가 생긴다. Pocket volume의 upper limit를 찾았다. 다음 analogue: cyclopropyl로 size/shape를 분리.', bad:true }
      };
      function draw(k) {
        svg.innerHTML = '';
        svgEl('rect', { x:178, y:60, width:100, height:46, rx:16, fill:'#ede9ff', stroke:'#5b3fd4', 'stroke-width':2, 'stroke-dasharray':'6 4' }, svg);
        svgEl('text', { x:228, y:50, 'text-anchor':'middle' }, svg).textContent = 'hydrophobic cavity';
        svgEl('rect', { x:40, y:62, width:130, height:42, rx:8, fill:'#f8fafc', stroke:'#3d4f6b', 'stroke-width':2 }, svg);
        svgEl('text', { x:105, y:88, 'text-anchor':'middle' }, svg).textContent = 'core scaffold';
        if (!k) return;
        var d = D[k];
        svgEl('ellipse', { cx:170 + d.w / 2 + 4, cy:83, rx:d.w / 2, ry:d.h / 2, fill: d.bad ? '#fee2e2' : '#dcfce7', stroke: d.bad ? '#dc2626' : '#15803d', 'stroke-width':2 }, svg);
        svgEl('text', { x:170 + d.w / 2 + 4, y:150, 'text-anchor':'middle', style: d.bad ? 'fill:#dc2626' : '' }, svg).textContent = k === 'Me' ? 'CH₃' : (k === 'iPr' ? 'i-Pr' : k);
      }
      tabs.forEach(function(t) {
        t.addEventListener('click', function() {
          tabs.forEach(function(x){ x.classList.toggle('active', x === t); });
          var d = D[t.dataset.r];
          draw(t.dataset.r);
          wrap.querySelector('.st-ic').textContent = d.ic;
          wrap.querySelector('.st-fit').textContent = d.fit;
          var fb = wrap.querySelector('.sr-steric-fb');
          fb.textContent = d.msg; fb.className = 'le-fb sr-steric-fb' + (d.bad ? ' bad' : '');
        });
      });
      draw(null);
      wrap.querySelector('.sr-steric-fb').textContent = 'Substituent를 선택하세요.';
    });
  }

  /* V6 – Activity cliff */
  function initSrCliff() {
    document.querySelectorAll('[data-sr-cliff]').forEach(function(wrap) {
      var svg = wrap.querySelector('.sr-cliff-svg');
      var fb = wrap.querySelector('.sr-cliff-fb');
      var W = {
        steric: 'meta 위치의 F가 pocket 벽과 clash를 만들었거나, 반대로 para 위치에서만 필요한 contact가 사라졌을 수 있다.',
        conf:   'F의 위치가 ring torsion/preferred conformation을 바꿔 bioactive conformation 도달이 어려워졌을 수 있다.',
        water:  'para-F가 water network의 일부를 치환/안정화했고 meta-F는 그렇지 못했을 수 있다.',
        pka:    'F의 위치에 따라 인접 기능기의 pKa가 달라져 ionization state/H-bond strength가 변했을 수 있다.'
      };
      svgEl('line', { x1:40, y1:190, x2:320, y2:190, stroke:'#c2cede', 'stroke-width':1.5 }, svg);
      svgEl('line', { x1:40, y1:20, x2:40, y2:190, stroke:'#c2cede', 'stroke-width':1.5 }, svg);
      svgEl('text', { x:180, y:212, 'text-anchor':'middle' }, svg).textContent = '2D structural similarity →';
      svgEl('text', { x:12, y:105, transform:'rotate(-90 12 105)', 'text-anchor':'middle' }, svg).textContent = 'Activity →';
      svgEl('path', { d:'M45 150 C 100 140, 150 130, 215 100 L 262 96', fill:'none', stroke:'#94a3b8', 'stroke-width':2 }, svg);
      svgEl('line', { x1:262, y1:96, x2:262, y2:165, stroke:'#dc2626', 'stroke-width':2, 'stroke-dasharray':'4 3' }, svg);
      svgEl('circle', { cx:255, cy:96, r:8, fill:'#15803d' }, svg);
      svgEl('circle', { cx:268, cy:165, r:8, fill:'#dc2626' }, svg);
      svgEl('text', { x:200, y:84 }, svg).textContent = 'para-F · 20 nM';
      svgEl('text', { x:200, y:185 }, svg).textContent = 'meta-F · 5 µM';
      svgEl('text', { x:284, y:135 }, svg).textContent = '250×';
      var hl = svgEl('rect', { x:238, y:76, width:46, height:104, rx:10, fill:'none', stroke:'#5b3fd4', 'stroke-width':2, 'stroke-dasharray':'5 4', opacity:0 }, svg);

      wrap.querySelector('[data-inspect]').addEventListener('click', function() {
        hl.setAttribute('opacity', 1);
        fb.textContent = '차이는 F 위치 하나(para → meta). Similarity는 높지만 activity는 불연속이다. 아래 가설 카드를 탭해 가능한 원인을 보세요.';
      });
      wrap.querySelectorAll('.sr-cliff-card').forEach(function(c) {
        c.addEventListener('click', function() {
          wrap.querySelectorAll('.sr-cliff-card').forEach(function(x){ x.classList.toggle('active', x === c); });
          fb.textContent = W[c.dataset.why];
        });
      });
      fb.textContent = '“Inspect difference”를 눌러 보세요.';
    });
  }

  /* V7 – Flat SAR */
  function initSrFlat() {
    document.querySelectorAll('[data-sr-flat]').forEach(function(wrap) {
      var msg = wrap.querySelector('.sr-flat-msg');
      var use = wrap.querySelector('.sr-flat-use');
      var fb = wrap.querySelector('.sr-flat-fb');
      var U = {
        sol: 'Solubilizing group (예: polar/ionizable group)을 붙여 potency 손실 없이 solubility를 개선할 수 있다. 단 permeability와 PPB 변화는 확인한다.',
        met: 'Metabolic soft spot이 이 위치 근처라면 F, 작은 blocking group으로 clearance를 낮출 수 있다. (metabolic switching 주의)',
        lnk: 'Solvent-exposed라면 linker attachment 위치로 적합하다 — PROTAC, conjugate, probe 설계의 출발점.'
      };
      wrap.querySelector('[data-flat]').addEventListener('click', function() {
        msg.innerHTML = '<b>Property handle discovered.</b> 이 위치는 potency에 거의 영향이 없다 — ADME를 조절할 수 있는 자유도.';
        msg.classList.add('on');
        use.classList.add('show');
      });
      wrap.querySelectorAll('[data-use]').forEach(function(b) {
        b.addEventListener('click', function() {
          wrap.querySelectorAll('[data-use]').forEach(function(x){ x.classList.toggle('active', x === b); });
          fb.textContent = U[b.dataset.use];
        });
      });
    });
  }

  /* V8 – SAR zones */
  function initSrZones() {
    document.querySelectorAll('[data-sr-zones]').forEach(function(wrap) {
      var svg = wrap.querySelector('.sr-zones-svg');
      var fb = wrap.querySelector('.sr-zones-fb');
      var Z = {
        anchor:  { c:'#2563eb', x:102, y:42, w:96, h:108, name:'Anchor (hinge-binding core)', msg: '수정하면 potency가 무너질 가능성이 큰 영역 (modification tolerance 낮음). Core를 바꾸는 것은 scaffold hopping 수준의 결정이다.' },
        pocket:  { c:'#0d8a7a', x:208, y:30, w:110, h:84, name:'Pocket explorer (aniline region)', msg: 'Hydrophobic/selectivity pocket 방향. Moderate tolerance — potency와 selectivity를 조절하지만 logD 증가(LipE)를 함께 본다.' },
        solvent: { c:'#c2410c', x:8,   y:96, w:90,  h:80, name:'Solvent-facing handle', msg: 'Tolerance가 높은 영역. Solubility, permeability, PK를 조절하는 property handle로 사용한다.' }
      };
      svgEl('polygon', { points: srHex(130, 96, 26, 0), fill:'#f8fafc', stroke:'#3d4f6b', 'stroke-width':2 }, svg);
      svgEl('polygon', { points: srHex(175, 96, 26, 0), fill:'#f8fafc', stroke:'#3d4f6b', 'stroke-width':2 }, svg);
      svgEl('line', { x1:188, y1:73, x2:220, y2:60, stroke:'#3d4f6b', 'stroke-width':2 }, svg);
      svgEl('text', { x:216, y:56 }, svg).textContent = 'NH';
      svgEl('line', { x1:236, y1:58, x2:252, y2:58, stroke:'#3d4f6b', 'stroke-width':2 }, svg);
      svgEl('polygon', { points: srHex(278, 58, 24, 30), fill:'#f8fafc', stroke:'#3d4f6b', 'stroke-width':2 }, svg);
      svgEl('polyline', { points:'108,110 80,130 56,128 34,150', fill:'none', stroke:'#3d4f6b', 'stroke-width':2 }, svg);
      svgEl('text', { x:24, y:166 }, svg).textContent = 'R (solvent)';

      Object.keys(Z).forEach(function(k) {
        var z = Z[k];
        var g = svgEl('g', { style:'cursor:pointer' }, svg);
        svgEl('rect', { x:z.x, y:z.y, width:z.w, height:z.h, rx:14, fill:z.c, 'fill-opacity':.12, stroke:z.c, 'stroke-width':2, 'stroke-dasharray':'5 4' }, g);
        g.addEventListener('click', function() {
          fb.innerHTML = '<b>' + z.name + '</b> — What happens if modified? ' + z.msg;
        });
      });
      fb.textContent = '영역을 탭하세요: anchor / pocket / solvent-facing.';
    });
  }

  /* V9 – potency vs LipE overlay */
  function initSrLipe() {
    document.querySelectorAll('[data-sr-lipe]').forEach(function(wrap) {
      var svg = wrap.querySelector('.sr-lipe-svg');
      var info = wrap.querySelector('.sr-lipe-info');
      var pts = [
        { id:'A', r:'H', nm:800, ld:1.5 }, { id:'B', r:'CH₃', nm:180, ld:2.0 }, { id:'C', r:'Cl', nm:70, ld:2.7 },
        { id:'D', r:'OMe', nm:120, ld:2.1 }, { id:'E', r:'OH', nm:950, ld:1.2 }, { id:'F', r:'Phenyl', nm:8, ld:4.8 }
      ];
      function X(v){ return 40 + (v - 0.5) / 5.5 * 280; }
      function Y(v){ return 230 - (v - 5.5) / 3 * 210; }
      svgEl('line', { x1:40, y1:230, x2:320, y2:230, stroke:'#c2cede', 'stroke-width':1.5 }, svg);
      svgEl('line', { x1:40, y1:20, x2:40, y2:230, stroke:'#c2cede', 'stroke-width':1.5 }, svg);
      svgEl('text', { x:180, y:252, 'text-anchor':'middle' }, svg).textContent = 'logD →';
      svgEl('text', { x:12, y:125, transform:'rotate(-90 12 125)', 'text-anchor':'middle' }, svg).textContent = 'pIC50 →';
      [3, 4, 5].forEach(function(k) {
        var x1 = 0.5, x2 = 5.5;
        var y1 = x1 + k, y2 = x2 + k;
        var ya = Math.max(5.5, y1), xa = ya - k;
        var yb = Math.min(8.5, y2), xb = yb - k;
        svgEl('line', { x1:X(xa), y1:Y(ya), x2:X(xb), y2:Y(yb), stroke:'#94a3b8', 'stroke-width':1.2, 'stroke-dasharray':'4 4' }, svg);
        svgEl('text', { x:X(xb) + 3, y:Y(yb) + 12 }, svg).textContent = 'LipE ' + k;
      });
      pts.forEach(function(p) {
        p.p = lePfromNM(p.nm); p.lipe = p.p - p.ld;
        var g = svgEl('g', { style:'cursor:pointer' }, svg);
        svgEl('circle', { cx:X(p.ld), cy:Y(p.p), r:12, fill:'#5b3fd4', 'fill-opacity':.22, stroke:'#5b3fd4', 'stroke-width':2 }, g);
        svgEl('text', { x:X(p.ld), y:Y(p.p) + 4, 'text-anchor':'middle', style:'fill:#3d28a8' }, g).textContent = p.id;
        g.addEventListener('click', function() {
          info.innerHTML = '<div class="le-three-c"><span>Compound ' + p.id + ' (R = ' + p.r + ')</span><b>' + leFmtNM(p.nm) + '</b></div>' +
            '<div class="le-three-c"><span>logD</span><b>' + p.ld.toFixed(1) + '</b></div>' +
            '<div class="le-three-c"><span>LipE</span><b>' + p.lipe.toFixed(1) + '</b></div>';
        });
      });
    });
  }

  /* V5 – biochemical vs cellular split */
  function initSrSplit() {
    document.querySelectorAll('[data-sr-split]').forEach(function(wrap) {
      var box = wrap.querySelector('.sr-split');
      var fb = wrap.querySelector('.sr-split-fb');
      var cs = [
        { id:'A', bio:20, cell:3000, pka:9.8, ld:1.6, perm:'low' },
        { id:'B', bio:30, cell:500,  pka:8.9, ld:2.0, perm:'medium' },
        { id:'C', bio:60, cell:120,  pka:7.8, ld:2.4, perm:'high' }
      ];
      function w(nm) { return Math.max(4, (lePfromNM(nm) - 5) / 4 * 100); }
      cs.forEach(function(c) {
        var el = document.createElement('button');
        el.className = 'sr-split-row';
        el.innerHTML = '<b>' + c.id + '</b><div class="sr-split-bars">' +
          '<div class="sr-bar"><i class="bio" style="width:' + w(c.bio) + '%"></i><span>Biochem ' + leFmtNM(c.bio) + '</span></div>' +
          '<div class="sr-bar"><i class="cell" style="width:' + w(c.cell) + '%"></i><span>Cell ' + leFmtNM(c.cell) + '</span></div></div>';
        el.addEventListener('click', function() {
          box.querySelectorAll('.sr-split-row').forEach(function(x){ x.classList.remove('sel'); });
          el.classList.add('sel');
          var gap = Math.round(c.cell / c.bio);
          fb.innerHTML = '<b>Compound ' + c.id + '</b> — cell/biochem gap <b>' + gap + '×</b> · amine pKa ' + c.pka + ' · logD ' + c.ld + ' · permeability ' + c.perm +
            '. ' + (gap > 50 ? 'Gap이 크다 → 낮은 permeability/exposure 가설.' : (gap > 5 ? 'Gap이 줄어든다 → neutral fraction 증가와 함께 exposure 개선.' : 'Gap이 거의 없다 → cell에서 biochemical potency가 잘 번역된다.'));
        });
        box.appendChild(el);
      });
    });
  }

  /* V4 – competing hypotheses */
  function initSrHyp() {
    document.querySelectorAll('[data-sr-hyp]').forEach(function(wrap) {
      var box = wrap.querySelector('.sr-hyp');
      var fb = wrap.querySelector('.sr-hyp-fb');
      var cands = [
        { n:'F',   ans:'E', why:'크기는 작지만 electron-withdrawing effect가 크다 → electronic 가설을 분리해서 시험한다.' },
        { n:'CH₃', ans:'S', why:'Cl과 비슷한 hydrophobic volume을 주지만 electron-withdrawing하지 않다 → steric/hydrophobic 가설을 시험한다.' },
        { n:'Br',  ans:'S', why:'Cl보다 크고 polarizable하다 → size 의존성(steric/hydrophobic)을 확장해 시험한다.' }
      ];
      var sel = {};
      cands.forEach(function(c) {
        var row = document.createElement('div');
        row.className = 'sr-hyp-row';
        row.innerHTML = '<b>' + c.n + '</b><div class="le-btnrow" style="margin:0;"><button class="bi-tab" data-v="S">Hydrophobic / steric</button><button class="bi-tab" data-v="E">Electronic</button></div>';
        row.querySelectorAll('.bi-tab').forEach(function(b) {
          b.addEventListener('click', function() {
            sel[c.n] = b.dataset.v;
            row.querySelectorAll('.bi-tab').forEach(function(x){ x.classList.toggle('active', x === b); });
          });
        });
        box.appendChild(row);
      });
      wrap.querySelector('[data-check]').addEventListener('click', function() {
        var ok = 0, txt = [];
        cands.forEach(function(c) {
          var good = sel[c.n] === c.ans;
          if (good) ok++;
          txt.push((good ? '✓ ' : (sel[c.n] ? '✗ ' : '– ')) + c.n + ': ' + c.why);
        });
        fb.innerHTML = '<b>' + ok + ' / ' + cands.length + '</b><br>' + txt.join('<br>');
        fb.className = 'le-fb sr-hyp-fb' + (ok === cands.length ? ' ok' : '');
      });
    });
  }

  /* V11 – AI activity cliff */
  function initSrAiCliff() {
    document.querySelectorAll('[data-sr-aicliff]').forEach(function(wrap) {
      var why = wrap.querySelector('.sr-ai-why');
      wrap.querySelector('[data-why]').addEventListener('click', function(){ why.classList.toggle('show'); });
    });
  }

  /* V10 – hypothesis tree */
  function initSrTree() {
    document.querySelectorAll('[data-sr-tree]').forEach(function(wrap) {
      var box = wrap.querySelector('.sr-tree-branches');
      var fb = wrap.querySelector('.sr-tree-fb');
      var B = [
        { h:'Hypothesis 1 · Hydrophobic cavity', a:'CH₃ / Br', msg:'Cl과 비슷한 hydrophobic volume을 가진 CH₃(electronics 다름), 더 큰 Br(size 의존성)로 cavity filling 가설을 시험한다. potency 증가가 logD 증가를 따라가는지 LipE로 확인.' },
        { h:'Hypothesis 2 · Electronics', a:'F / CN', msg:'F, CN은 크기는 작지만 electron-withdrawing effect가 크다. 이들이 Cl처럼 potency를 올리면 electronic 가설을, 올리지 못하면 steric/hydrophobic 가설을 지지한다.' },
        { h:'Hypothesis 3 · Conformational effect', a:'Constrained analogue', msg:'Substituent가 ring/linker의 preferred conformation을 바꿨다면, 같은 위치에 ortho-methyl이나 ring-constrained analogue를 넣어 conformational bias를 직접 시험한다 (4강).' }
      ];
      B.forEach(function(b) {
        var el = document.createElement('button');
        el.className = 'sr-tree-b';
        el.innerHTML = '<b>' + b.h + '</b><span>→ ' + b.a + '</span>';
        el.addEventListener('click', function() {
          box.querySelectorAll('.sr-tree-b').forEach(function(x){ x.classList.toggle('active', x === el); });
          fb.textContent = b.msg;
        });
        box.appendChild(el);
      });
      fb.textContent = 'Branch를 탭하세요.';
    });
  }

  /* V12 – next compound challenge */
  function initSrNext() {
    document.querySelectorAll('[data-sr-next]').forEach(function(wrap) {
      var goals = wrap.querySelectorAll('[data-goal]');
      var box = wrap.querySelector('.sr-next-cands');
      var det = wrap.querySelector('.sr-next-detail');
      var C = [
        { n:'R = F', hyp:'Cl 효과가 steric/hydrophobic인지 electronic인지 구분한다 (mechanistic discriminator).',
          move:'Potency는 중간, logD 증가 작음 → LipE 유지 가능.', risk:'Potency 개선이 작아 보일 수 있다. 결과 해석에 steric 가설과 비교가 필요하다.',
          alt:'CH₃는 같은 질문의 반대편(hydrophobic only)을 시험한다.', s:{ mech:3, pot:1, adme:2, bal:3 } },
        { n:'R = cyclopropyl', hyp:'Et와 비슷한 부피에서 geometry가 다를 때 steric/shape 가설이 유지되는지 시험한다.',
          move:'Potency 개선 가능, logD는 Et보다 약간 낮거나 비슷.', risk:'Cavity 형태가 맞지 않으면 i-Pr처럼 clash가 날 수 있다.',
          alt:'Br은 더 큰 halogen으로 size 한계를 확인한다.', s:{ mech:3, pot:2, adme:1, bal:2 } },
        { n:'R = 3-pyridyl', hyp:'Polar heteroaryl이 hydrophobic pocket과 양립하는지, logD를 낮추면서 potency를 유지할 수 있는지 시험한다.',
          move:'logD 감소, solubility 개선 가능.', risk:'Buried N의 desolvation penalty로 potency 큰 손실 가능 (6강).',
          alt:'CN은 이미 낮은 logD 영역에서 좋은 profile을 보여 안전한 대안이다.', s:{ mech:1, pot:1, adme:3, bal:2 } },
        { n:'R = Br', hyp:'Cl보다 큰 hydrophobic group에서 potency가 더 오르는지 cavity 크기를 확장해 본다.',
          move:'Potency ↑ 가능, logD ↑↑ (Cl보다 더 높음).', risk:'Lipophilic potency trap, solubility/clearance 악화.',
          alt:'Et는 carbon-based 대안으로 비슷한 질문을 던진다.', s:{ mech:2, pot:3, adme:1, bal:1 } }
      ];
      var goal = 'mech', selected = -1;
      var names = { mech:'Mechanism learning', pot:'Potency', adme:'ADME', bal:'Balanced lead' };

      function stars(n) { return '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n); }
      function render() {
        goals.forEach(function(g){ g.classList.toggle('active', g.dataset.goal === goal); });
        box.innerHTML = '';
        C.forEach(function(c, i) {
          var b = document.createElement('button');
          b.className = 'sr-next-c' + (i === selected ? ' sel' : '');
          b.innerHTML = '<b>' + c.n + '</b>' + (selected >= 0 ? '<span class="sr-star">' + stars(c.s[goal]) + '</span>' : '<span class="sr-star">?</span>');
          b.addEventListener('click', function(){ selected = i; render(); });
          box.appendChild(b);
        });
        if (selected < 0) { det.innerHTML = '<div class="le-fb">후보를 하나 선택하세요. 선택하면 해설이 공개됩니다.</div>'; return; }
        var c = C[selected];
        det.innerHTML = '<div class="sr-next-grid">' +
          '<div><b>Hypothesis tested</b>' + c.hyp + '</div>' +
          '<div><b>Expected property movement</b>' + c.move + '</div>' +
          '<div><b>Risk</b>' + c.risk + '</div>' +
          '<div><b>Alternative</b>' + c.alt + '</div></div>' +
          '<div class="le-fb">목표가 “' + names[goal] + '”일 때 ' + c.n + '의 적합도: <b>' + stars(c.s[goal]) + '</b>. 정답은 하나로 고정되지 않고 목표에 따라 달라진다.</div>';
      }
      goals.forEach(function(g){ g.addEventListener('click', function(){ goal = g.dataset.goal; render(); }); });
      render();
    });
  }

  /* ============================================================
     L09 – Solubility
     ============================================================ */

  function slClamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function slFmtUM(v) {
    if (v >= 100) return Math.round(v) + ' µM';
    if (v >= 10) return v.toFixed(0) + ' µM';
    return v.toFixed(1) + ' µM';
  }
  function slAxes(svg, x0, y0, x1, y1) {
    svgEl('line', { x1:x0, y1:y0, x2:x1, y2:y0, stroke:'#c2cede', 'stroke-width':1.5 }, svg);
    svgEl('line', { x1:x0, y1:y0, x2:x0, y2:y1, stroke:'#c2cede', 'stroke-width':1.5 }, svg);
  }

  /* V1 */
  function initSlAdded() {
    document.querySelectorAll('[data-sl-added]').forEach(function(wrap) {
      var q = function(s){ return wrap.querySelector(s); };
      var aIn = q('.ad-a-in'), lIn = q('.ad-l-in');
      function update() {
        var a = +aIn.value, l = +lIn.value;
        var d = Math.min(a, l), p = Math.max(0, a - l);
        q('.ad-a').textContent = a.toFixed(1) + ' µM';
        q('.ad-l').textContent = l.toFixed(1) + ' µM';
        q('.ad-d').textContent = d.toFixed(1) + ' µM';
        q('.ad-p').textContent = p.toFixed(1) + ' µM';
        q('.sl-diss').style.height = (d / 30 * 100) + '%';
        q('.sl-pp').style.height = (p / 30 * 100) + '%';
        var fb = q('.ad-fb');
        if (p > 0) {
          fb.className = 'le-fb ad-fb bad';
          fb.textContent = 'Added ' + a.toFixed(1) + ' µM이지만 실제 dissolved는 최대 ' + l.toFixed(1) + ' µM. 나머지 ' + p.toFixed(1) + ' µM는 precipitate/aggregate — dose–response의 high-concentration 영역이 왜곡된다.';
        } else {
          fb.className = 'le-fb ad-fb ok';
          fb.textContent = 'Solubility limit 아래라서 added ≈ dissolved.';
        }
      }
      aIn.addEventListener('input', update); lIn.addEventListener('input', update);
      update();
    });
  }

  /* V2 */
  function initSlBalance() {
    document.querySelectorAll('[data-sl-balance]').forEach(function(wrap) {
      var q = function(s){ return wrap.querySelector(s); };
      var aIn = q('.bl-a-in'), bIn = q('.bl-b-in');
      function update() {
        var a = +aIn.value, b = +bIn.value;
        q('.bl-a').textContent = a; q('.bl-b').textContent = b;
        q('.bl-ma').style.width = (a * 10) + '%';
        q('.bl-mb').style.width = (b * 10) + '%';
        var net = slClamp((b - a + 10) / 20 * 100, 0, 100);
        q('.bl-mn').style.width = net + '%';
        var fb = q('.bl-fb');
        var d = b - a;
        if (d <= -3) { fb.className = 'le-fb bl-fb bad'; fb.textContent = '강한 lattice + 약한 solvation → poor solubility. (greasy + crystalline)'; }
        else if (d >= 3) { fb.className = 'le-fb bl-fb ok'; fb.textContent = '약한 lattice + 강한 solvation → high solubility 경향.'; }
        else { fb.className = 'le-fb bl-fb'; fb.textContent = '두 힘이 비슷하다. Lattice를 약하게 하거나 solvation을 높이는 어느 쪽도 solubility를 바꾼다.'; }
      }
      aIn.addEventListener('input', update); bIn.addEventListener('input', update);
      update();
    });
  }

  /* V3 */
  function initSlTime() {
    document.querySelectorAll('[data-sl-time]').forEach(function(wrap) {
      var svg = wrap.querySelector('.sl-time-svg');
      var inp = wrap.querySelector('.tm-in');
      var C0 = 40, Ceq = 5, TAU = 35;
      function X(t){ return 40 + t / 120 * 280; }
      function Y(c){ return 190 - c / 45 * 170; }
      function C(t){ return Ceq + (C0 - Ceq) * Math.exp(-t / TAU); }

      function draw(t) {
        svg.innerHTML = '';
        slAxes(svg, 40, 190, 320, 20);
        svgEl('text', { x:180, y:214, 'text-anchor':'middle' }, svg).textContent = 'Time after DMSO dilution (min)';
        svgEl('text', { x:12, y:105, transform:'rotate(-90 12 105)', 'text-anchor':'middle' }, svg).textContent = 'Dissolved (µM)';
        svgEl('rect', { x:X(10), y:20, width:X(30) - X(10), height:170, fill:'#5b3fd4', 'fill-opacity':.08 }, svg);
        svgEl('text', { x:X(20), y:34, 'text-anchor':'middle' }, svg).textContent = 'kinetic readout';
        svgEl('line', { x1:40, y1:Y(Ceq), x2:320, y2:Y(Ceq), stroke:'#15803d', 'stroke-width':2, 'stroke-dasharray':'6 4' }, svg);
        svgEl('text', { x:322, y:Y(Ceq) - 4, 'text-anchor':'end', style:'fill:#15803d' }, svg).textContent = 'thermodynamic (equilibrium)';
        var pts = [];
        for (var i = 0; i <= 120; i += 4) pts.push(X(i) + ',' + Y(C(i)));
        svgEl('polyline', { points:pts.join(' '), fill:'none', stroke:'#5b3fd4', 'stroke-width':2.5 }, svg);
        svgEl('circle', { cx:X(t), cy:Y(C(t)), r:7, fill:'#dc2626' }, svg);
      }
      function update() {
        var t = +inp.value;
        wrap.querySelector('.tm-t').textContent = t + ' min';
        draw(t);
        var c = C(t), fb = wrap.querySelector('.tm-fb');
        fb.className = 'le-fb tm-fb' + (c > Ceq * 1.5 ? ' bad' : ' ok');
        fb.textContent = '현재 dissolved ≈ ' + c.toFixed(1) + ' µM. ' + (c > Ceq * 1.5 ? 'Supersaturated — 평형 solubility(' + Ceq + ' µM)보다 높고, 곧 precipitation이 진행된다.' : '평형에 가까워졌다. 이 값이 thermodynamic solubility 근처다.');
      }
      inp.addEventListener('input', update);
      update();
    });
  }

  /* V4 */
  function initSlPh() {
    document.querySelectorAll('[data-sl-ph]').forEach(function(wrap) {
      var svg = wrap.querySelector('.sl-ph-svg');
      var tabs = wrap.querySelectorAll('[data-type]');
      var kIn = wrap.querySelector('.ph-k-in'), sIn = wrap.querySelector('.ph-s-in');
      var type = 'acid';
      function X(ph){ return 40 + (ph - 1) / 9 * 280; }
      function Y(l){ return 200 - (l + 1) / 6 * 180; }
      function S(ph, k, s0) { return s0 * (1 + Math.pow(10, type === 'acid' ? ph - k : k - ph)); }

      function update() {
        var k = +kIn.value, s0 = Math.pow(10, +sIn.value);
        wrap.querySelector('.ph-k').textContent = k.toFixed(1);
        wrap.querySelector('.ph-s').textContent = slFmtUM(s0);
        tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.type === type); });
        svg.innerHTML = '';
        slAxes(svg, 40, 200, 320, 20);
        svgEl('text', { x:180, y:224, 'text-anchor':'middle' }, svg).textContent = 'pH';
        svgEl('text', { x:12, y:110, transform:'rotate(-90 12 110)', 'text-anchor':'middle' }, svg).textContent = 'log S (µM)';
        [1, 3, 5, 7, 9].forEach(function(ph) { svgEl('text', { x:X(ph) - 3, y:214 }, svg).textContent = ph; });
        svgEl('line', { x1:X(7.4), y1:20, x2:X(7.4), y2:200, stroke:'#94a3b8', 'stroke-dasharray':'4 3' }, svg);
        svgEl('text', { x:X(7.4) + 3, y:32 }, svg).textContent = 'pH 7.4';
        svgEl('line', { x1:40, y1:Y(Math.log(s0) / Math.LN10), x2:320, y2:Y(Math.log(s0) / Math.LN10), stroke:'#15803d', 'stroke-dasharray':'6 4' }, svg);
        svgEl('text', { x:44, y:Y(Math.log(s0) / Math.LN10) - 4, style:'fill:#15803d' }, svg).textContent = 'S₀';
        var pts = [];
        for (var ph = 1; ph <= 10.01; ph += 0.25) {
          var l = Math.log(S(ph, k, s0)) / Math.LN10;
          pts.push(X(ph) + ',' + Y(slClamp(l, -1, 5)));
        }
        svgEl('polyline', { points:pts.join(' '), fill:'none', stroke:'#5b3fd4', 'stroke-width':2.5 }, svg);
        var s74 = S(7.4, k, s0);
        wrap.querySelector('.ph-fb').textContent = 'pH 7.4에서 S ≈ ' + slFmtUM(s74) + ' (S₀의 ' + (s74 / s0).toFixed(s74 / s0 > 10 ? 0 : 1) + '배). ' +
          (type === 'acid' ? 'Weak acid: pH가 pKa를 넘으면 증가.' : 'Weak base: pH가 pKa보다 낮을수록 증가.') + ' (이상적 모델: 실제로는 salt Ksp 등의 한계가 있다)';
      }
      tabs.forEach(function(t){ t.addEventListener('click', function(){ type = t.dataset.type; kIn.value = type === 'acid' ? 5 : 8.5; update(); }); });
      kIn.addEventListener('input', update); sIn.addEventListener('input', update);
      update();
    });
  }

  /* V5 */
  function initSlMatrix() {
    document.querySelectorAll('[data-sl-matrix]').forEach(function(wrap) {
      var fb = wrap.querySelector('.sl-mx-fb');
      var T = {
        ll: 'Low lipophilicity + weak lattice: water solvation도 유리하고 crystal에서 빠져나오기도 쉽다. 가장 좋은 solubility 경향.',
        hl: 'High lipophilicity + weak lattice: lattice 비용은 낮지만 water solvation이 불리하다. Amorphous/낮은 melting point 화합물에서 보인다 (mixed).',
        lg: 'Low lipophilicity + strong lattice: logD만 보면 잘 녹을 것 같지만 intermolecular H-bond, planar packing 때문에 의외로 poor solubility일 수 있다.',
        hh: 'High lipophilicity + strong lattice: 두 힘이 모두 불리한 최고 위험 영역. Greasy + crystalline.'
      };
      wrap.querySelectorAll('.sl-mx-q').forEach(function(b) {
        b.addEventListener('click', function() {
          wrap.querySelectorAll('.sl-mx-q').forEach(function(x){ x.classList.toggle('sel', x === b); });
          fb.textContent = T[b.dataset.q];
        });
      });
    });
  }

  /* V6 */
  function initSlPack() {
    document.querySelectorAll('[data-sl-pack]').forEach(function(wrap) {
      var svg = wrap.querySelector('.sl-pack-svg');
      var btn = wrap.querySelector('[data-sp3]');
      var fb = wrap.querySelector('.sl-pack-fb');
      var on = false;
      function draw() {
        svg.innerHTML = '';
        var rots = [-14, 9, -6, 17, -11, 5, 13, -17, 7, -3, 15, -9, 11, -13, 4];
        for (var r = 0; r < 3; r++) for (var c = 0; c < 5; c++) {
          var cx = 50 + c * (on ? 62 : 58), cy = 40 + r * (on ? 52 : 40);
          var rot = on ? rots[r * 5 + c] : 0;
          var g = svgEl('g', { transform:'translate(' + cx + ',' + cy + ') rotate(' + rot + ')' }, svg);
          svgEl('rect', { x:-24, y:on ? -9 : -7, width:48, height:on ? 18 : 14, rx:4, fill:on ? '#dcfce7' : '#fee2e2', stroke:on ? '#15803d' : '#dc2626', 'stroke-width':1.5 }, g);
          if (on) svgEl('circle', { cx:0, cy:-12, r:5, fill:'#15803d' }, g);
        }
        svgEl('text', { x:170, y:176, 'text-anchor':'middle' }, svg).textContent = on ? 'Nonplanar analogue: packing 흐트러짐' : 'Flat aromatic: 촘촘한 π–π stacking';
      }
      btn.addEventListener('click', function() {
        on = !on;
        btn.textContent = on ? 'Remove sp³ center' : 'Add sp³ center';
        fb.textContent = on ? 'sp³ center가 planarity를 깨 packing 효율이 떨어진다 → crystal lattice 탈출 비용 ↓. Polarity를 크게 바꾸지 않고도 solubility가 좋아질 수 있다 (단, potency/conformation 확인).' : 'Flat molecule은 카드처럼 쌓여 lattice energy가 크다.';
        fb.className = 'le-fb sl-pack-fb' + (on ? ' ok' : '');
        draw();
      });
      draw();
      fb.textContent = 'Flat molecule은 카드처럼 쌓여 lattice energy가 크다.';
    });
  }

  /* V7 */
  function initSlPolar() {
    document.querySelectorAll('[data-sl-polar]').forEach(function(wrap) {
      var tabs = wrap.querySelectorAll('[data-c]');
      var q = function(s){ return wrap.querySelector(s); };
      var D = {
        A: { h:40, c:50, msg:'Compound A: 적당한 hydration과 보통의 lattice. Net solubility tendency는 중간.' },
        B: { h:65, c:85, msg:'Compound B: OH 덕분에 hydration은 좋아졌지만 intermolecular H-bond network가 lattice를 더 크게 안정화했다. Net은 오히려 감소할 수 있다 — logD ↓인데 solubility도 ↓.' }
      };
      function show(k) {
        tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.c === k); });
        var d = D[k];
        q('.po-h').style.width = d.h + '%'; q('.po-c').style.width = d.c + '%';
        var net = slClamp(50 + d.h - d.c, 0, 100);
        q('.po-n').style.width = net + '%';
        var fb = q('.po-fb'); fb.textContent = d.msg; fb.className = 'le-fb po-fb' + (k === 'B' ? ' bad' : '');
      }
      tabs.forEach(function(t){ t.addEventListener('click', function(){ show(t.dataset.c); }); });
      show('A');
    });
  }

  /* V8 */
  function initSlAmorph() {
    document.querySelectorAll('[data-sl-amorph]').forEach(function(wrap) {
      var svg = wrap.querySelector('.sl-am-svg');
      var tabs = wrap.querySelectorAll('[data-f]');
      var fb = wrap.querySelector('.am-fb');
      function X(t){ return 40 + t / 120 * 280; }
      function Y(c){ return 170 - c / 28 * 150; }
      function cry(t){ return 5 * (1 - Math.exp(-t / 20)); }
      function amo(t){ return 5 + 20 * (1 - Math.exp(-t / 8)) * Math.exp(-t / 45); }
      var M = {
        cry: 'Crystalline: 안정하지만 lattice를 깨야 해서 solubility가 낮다. 평형값으로 완만히 도달.',
        amo: 'Amorphous: 빠르게 높은 apparent solubility에 도달하지만 시간이 지나면 recrystallization으로 감소할 수 있다.',
        both: 'Amorphous는 초반에 훨씬 높지만 결국 crystalline solubility로 수렴한다 — solubility gain vs physical stability.'
      };
      function draw(f) {
        tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.f === f); });
        svg.innerHTML = '';
        slAxes(svg, 40, 170, 320, 20);
        svgEl('text', { x:180, y:194, 'text-anchor':'middle' }, svg).textContent = 'Time in water (min)';
        svgEl('text', { x:12, y:95, transform:'rotate(-90 12 95)', 'text-anchor':'middle' }, svg).textContent = 'Dissolved';
        [['cry', cry, '#c2410c'], ['amo', amo, '#5b3fd4']].forEach(function(s) {
          if (f !== 'both' && f !== s[0]) return;
          var pts = [];
          for (var t = 0; t <= 120; t += 3) pts.push(X(t) + ',' + Y(s[1](t)));
          svgEl('polyline', { points:pts.join(' '), fill:'none', stroke:s[2], 'stroke-width':2.5 }, svg);
        });
        if (f !== 'cry') svgEl('text', { x:X(70), y:Y(14), style:'fill:#dc2626' }, svg).textContent = 'recrystallization ↓';
        fb.textContent = M[f];
      }
      tabs.forEach(function(t){ t.addEventListener('click', function(){ draw(t.dataset.f); }); });
      draw('both');
    });
  }

  /* V9 */
  function initSlDmso() {
    document.querySelectorAll('[data-sl-dmso]').forEach(function(wrap) {
      var q = function(s){ return wrap.querySelector(s); };
      var dIn = q('.dm-d-in'), lIn = q('.dm-l-in'), tIn = q('.dm-t-in');
      function update() {
        var d = +dIn.value, lim = +lIn.value, t = +tIn.value;
        var N = 10000 / d;
        var c = N <= lim ? N : lim + (N - lim) * Math.exp(-t / 35);
        q('.dm-d').textContent = d; q('.dm-l').textContent = lim.toFixed(1) + ' µM'; q('.dm-t').textContent = t + ' min';
        q('.dm-n').textContent = slFmtUM(N); q('.dm-c').textContent = slFmtUM(c);
        var state, cls = '';
        if (N <= lim) state = 'dissolved';
        else if (c - lim > lim * 0.5 && t < 10) state = 'supersaturated';
        else if (c - lim > lim * 0.1) state = 'precipitating';
        else state = 'precipitated';
        q('.dm-s').textContent = state;
        var fb = q('.dm-fb');
        if (N <= lim) { fb.className = 'le-fb dm-fb ok'; fb.textContent = 'Nominal이 solubility limit 이하라 안정적으로 녹아 있다.'; }
        else { fb.className = 'le-fb dm-fb bad'; fb.textContent = 'Nominal ' + slFmtUM(N) + ' > limit ' + lim.toFixed(1) + ' µM. 처음엔 투명해 보일 수 있지만 시간이 지나며 ' + slFmtUM(c) + '로 줄어든다. Incubation time에 따라 apparent activity가 달라질 수 있다.'; }
      }
      [dIn, lIn, tIn].forEach(function(i){ i.addEventListener('input', update); });
      update();
    });
  }

  /* V10 */
  function initSlAggr() {
    document.querySelectorAll('[data-sl-aggr]').forEach(function(wrap) {
      var tabs = wrap.querySelectorAll('[data-det]');
      var q = function(s){ return wrap.querySelector(s); };
      function show(det) {
        tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.det === det); });
        var t = det === '1' ? 82 : 85, a = det === '1' ? 12 : 92;
        q('.ag-t').style.width = t + '%'; q('.ag-a').style.width = a + '%';
        q('.ag-tv').textContent = t + '% inhibition'; q('.ag-av').textContent = a + '% inhibition';
        q('.ag-pic').textContent = det === '1' ? '◦ ◦ ◦   enzyme (aggregate 분해)' : '◍◍◍ ▒ enzyme (surface 흡착)';
        var fb = q('.ag-fb');
        fb.className = 'le-fb ag-fb' + (det === '1' ? ' ok' : ' bad');
        fb.textContent = det === '1' ? 'Detergent가 aggregate를 분해 → aggregator의 inhibition은 크게 감소, true inhibitor는 거의 유지. Detergent sensitivity가 중요한 clue.' : 'Detergent 없이는 aggregator도 true inhibitor만큼 강하게 보인다.';
      }
      tabs.forEach(function(t){ t.addEventListener('click', function(){ show(t.dataset.det); }); });
      show('0');
    });
  }

  /* V11 */
  function initSlLab() {
    document.querySelectorAll('[data-sl-lab]').forEach(function(wrap) {
      var btns = wrap.querySelectorAll('[data-m]');
      var q = function(s){ return wrap.querySelector(s); };
      var M = {
        pyr:   { ld:-1.0, ion:0,  pack:-0.3, note:'phenyl → pyridyl: logD ↓, polarity ↑. Buried N이면 potency 손실 위험 (6강).' },
        clf:   { ld:-0.4, ion:0,  pack:0,    note:'Cl → F: 크기·lipophilicity 감소, 효과는 작다.' },
        amine: { ld:-0.8, ion:60, pack:-0.5, note:'Basic amine: pH-dependent solubility ↑. permeability, hERG, distribution 변화 주의 (3강).' },
        sp3:   { ld:-0.2, ion:0,  pack:-1.5, note:'sp³ center: planarity ↓, packing disruption — logD를 크게 바꾸지 않고 solubility ↑ 가능.' },
        sym:   { ld:0,    ion:0,  pack:-1.0, note:'Symmetry break: crystal packing 효율 ↓. Target interaction 유지 여부를 확인.' }
      };
      var on = {};
      function update() {
        var ld = 4.5, ion = 0, pack = 4;
        var notes = [];
        Object.keys(on).forEach(function(k) {
          if (!on[k]) return;
          ld += M[k].ld; ion += M[k].ion; pack += M[k].pack; notes.push(M[k].note);
        });
        ion = slClamp(ion, 0, 100); pack = slClamp(pack, 0, 5);
        var sol = slClamp((6 - ld) / 6 * 0.45 + ion / 100 * 0.3 + (5 - pack) / 5 * 0.25, 0, 1);
        var perm = slClamp(0.5 + ion * 0.03 + (ld < 1.5 ? 1.2 : 0), 0, 5);
        q('.lb-logd').style.width = slClamp(ld / 6 * 100, 0, 100) + '%';
        q('.lb-logd-v').textContent = ld.toFixed(1);
        q('.lb-ion').style.width = ion + '%';
        q('.lb-pack').style.width = (pack / 5 * 100) + '%';
        q('.lb-sol').style.width = (sol * 100) + '%';
        q('.lb-perm').style.width = (perm / 5 * 100) + '%';
        q('.lb-fb').textContent = notes.length ? notes.join(' ') : 'Modification을 선택하세요. (시작: logD 4.5, flat/symmetric lead)';
      }
      btns.forEach(function(b) {
        b.addEventListener('click', function() {
          on[b.dataset.m] = !on[b.dataset.m];
          b.classList.toggle('active', !!on[b.dataset.m]);
          update();
        });
      });
      update();
    });
  }

  /* V12 */
  function initSlSp() {
    document.querySelectorAll('[data-sl-sp]').forEach(function(wrap) {
      var svg = wrap.querySelector('.sl-sp-svg');
      var lIn = wrap.querySelector('.sp-l-in'), iIn = wrap.querySelector('.sp-i-in');
      var refs = [
        { n:'Ionized polar', s:.9, p:.15 }, { n:'Lipophilic neutral', s:.12, p:.9 },
        { n:'Poor both', s:.12, p:.15 }, { n:'Balanced', s:.7, p:.7 }
      ];
      function X(v){ return 40 + v * 280; }
      function Y(v){ return 210 - v * 190; }
      function update() {
        var ld = +lIn.value, ion = +iIn.value / 100;
        wrap.querySelector('.sp-l').textContent = ld.toFixed(1);
        wrap.querySelector('.sp-i').textContent = Math.round(ion * 100) + '%';
        var sol = slClamp(0.55 * (1 - ld / 6) + 0.35 * ion + 0.1, 0, 1);
        var perm = slClamp((0.25 + 0.75 * Math.min(ld, 3.5) / 3.5) * (1 - 0.8 * ion), 0, 1);
        svg.innerHTML = '';
        svgEl('rect', { x:X(.5), y:Y(1), width:X(1) - X(.5), height:Y(.5) - Y(1), fill:'#15803d', 'fill-opacity':.1 }, svg);
        slAxes(svg, 40, 210, 320, 20);
        svgEl('text', { x:180, y:234, 'text-anchor':'middle' }, svg).textContent = 'Solubility →';
        svgEl('text', { x:12, y:115, transform:'rotate(-90 12 115)', 'text-anchor':'middle' }, svg).textContent = 'Permeability →';
        svgEl('text', { x:X(.52), y:Y(.96) }, svg).textContent = 'target region';
        refs.forEach(function(r) {
          svgEl('circle', { cx:X(r.s), cy:Y(r.p), r:6, fill:'#94a3b8' }, svg);
          svgEl('text', { x:X(r.s) + 9, y:Y(r.p) + 4 }, svg).textContent = r.n;
        });
        svgEl('circle', { cx:X(sol), cy:Y(perm), r:9, fill:'#5b3fd4', stroke:'#fff', 'stroke-width':2 }, svg);
        var fb = wrap.querySelector('.sp-fb');
        var good = sol > .5 && perm > .5;
        fb.className = 'le-fb sp-fb' + (good ? ' ok' : '');
        fb.textContent = good ? '내 compound가 우상단 영역에 들어왔다 — dissolution과 membrane crossing의 균형.' :
          (sol <= .5 && perm > .5 ? 'Lipophilic/neutral: permeability는 좋지만 solubility가 limiting.' :
          (perm <= .5 && sol > .5 ? 'Ionized/polar: solubility는 좋지만 permeability가 limiting.' : '두 축 모두 약하다.'));
      }
      lIn.addEventListener('input', update); iIn.addEventListener('input', update);
      update();
    });
  }

  /* V13 */
  function initSlBlind() {
    document.querySelectorAll('[data-sl-blind]').forEach(function(wrap) {
      var btn = wrap.querySelector('[data-show]');
      var box = wrap.querySelector('.sl-bl-hidden');
      var fb = wrap.querySelector('.bl2-fb');
      btn.addEventListener('click', function() {
        var on = box.classList.toggle('show');
        btn.textContent = on ? 'Hide missing context' : 'Show missing context';
        fb.textContent = on ? '측정된 solubility 값은 이 변수들에 모두 의존하지만 2D graph에는 들어 있지 않다. 같은 구조에 여러 label이 공존할 수 있다.' : '';
      });
    });
  }

  /* V14 */
  function initSlFlow() {
    document.querySelectorAll('[data-sl-flow]').forEach(function(wrap) {
      var steps = wrap.querySelectorAll('.sl-fl-step');
      var fb = wrap.querySelector('.sl-fl-fb');
      var T = [
        'Potency는 좋은데 반복 실험이 흔들리거나 curve 모양이 이상하다. Biology 가설을 세우기 전에 compound부터 의심한다.',
        'Assay concentration 범위와 kinetic/thermodynamic solubility를 비교한다. 높은 농도에서 nominal ≠ dissolved일 수 있다.',
        'Solubility가 assay 농도보다 낮다 → turbidity, nephelometry, particle detection, detergent sensitivity로 precipitation/aggregation을 확인한다.',
        'Solubility 문제가 아니라면 permeability, efflux, 대사 등 다른 원인을 본다 (10강 이후).',
        'Buffer/pH 조정(ionizable compound), DMSO 농도·incubation time 통제, 또는 sp³ 추가·symmetry break·pyridyl 등 analogue design.',
        'Potency, solubility, permeability를 함께 측정해 한 property만 개선되지 않았는지 확인한다.'
      ];
      steps.forEach(function(s) {
        s.addEventListener('click', function() {
          steps.forEach(function(x){ x.classList.toggle('active', x === s); });
          fb.textContent = T[+s.dataset.s];
        });
      });
      fb.textContent = '단계를 탭하세요.';
    });
  }

  /* ============================================================
     L10 – Permeability
     ============================================================ */

  function pmW(nm) { return slClamp((lePfromNM(nm) - 4) / 5 * 100, 3, 100); }

  /* V1 */
  function initPmOpen() {
    document.querySelectorAll('[data-pm-open]').forEach(function(wrap) {
      var box = wrap.querySelector('.pm-open-rows');
      var tabs = wrap.querySelectorAll('[data-v]');
      var fb = wrap.querySelector('.pm-open-fb');
      var cs = [
        { n:'Compound A', bio:5,  cell:20000, gate:['solubility ✓', 'passive entry ✗ (낮음)', 'efflux ✗ (높음)'] , cellTxt:'> 10 µM' },
        { n:'Compound B', bio:30, cell:150,   gate:['solubility ✓', 'passive entry ✓', 'efflux ~ (낮음)'], cellTxt:'150 nM' }
      ];
      function show(v) {
        tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.v === v); });
        box.innerHTML = '';
        cs.forEach(function(c) {
          var el = document.createElement('div');
          el.className = 'pm-open-row';
          var h = '<h6>' + c.n + '</h6><div class="pm-bar"><span>Biochemical IC50 ' + leFmtNM(c.bio) + '</span><i style="width:' + pmW(c.bio) + '%"></i></div>';
          if (v === 'journey') {
            h += '<div class="pm-bar"><span>Cell IC50 ' + c.cellTxt + '</span><i class="cell" style="width:' + pmW(c.cell) + '%"></i></div>' +
                 '<div class="pm-gates">' + c.gate.map(function(g){ return '<em class="' + (g.indexOf('✗') >= 0 ? 'bad' : 'ok') + '">' + g + '</em>'; }).join('') + '</div>';
          }
          el.innerHTML = h; box.appendChild(el);
        });
        fb.className = 'le-fb pm-open-fb' + (v === 'journey' ? ' ok' : '');
        fb.textContent = v === 'bind' ? 'Binding만 보면 A가 6배 더 강하다.' : 'Whole journey: A는 membrane 앞(passive entry, efflux)에서 막혀 cell에서는 B가 훨씬 낫다.';
      }
      tabs.forEach(function(t){ t.addEventListener('click', function(){ show(t.dataset.v); }); });
      show('bind');
    });
  }

  /* V2 */
  function initPmCross() {
    document.querySelectorAll('[data-pm-cross]').forEach(function(wrap) {
      var svg = wrap.querySelector('.pm-cross-svg');
      var tabs = wrap.querySelectorAll('[data-ch]');
      var fb = wrap.querySelector('.pm-cross-fb');
      var charged = 0, g, timers = [];
      function build() {
        timers.forEach(clearTimeout); timers = [];
        svg.innerHTML = '';
        svgEl('rect', { x:0, y:0, width:320, height:80, fill:'#dbeafe', 'fill-opacity':.6 }, svg);
        svgEl('rect', { x:0, y:160, width:320, height:80, fill:'#dbeafe', 'fill-opacity':.6 }, svg);
        svgEl('rect', { x:0, y:80, width:320, height:20, fill:'#fde68a' }, svg);
        svgEl('rect', { x:0, y:140, width:320, height:20, fill:'#fde68a' }, svg);
        svgEl('rect', { x:0, y:100, width:320, height:40, fill:'#fef3c7' }, svg);
        svgEl('text', { x:8, y:16 }, svg).textContent = 'Water';
        svgEl('text', { x:8, y:124 }, svg).textContent = 'hydrophobic core';
        svgEl('text', { x:8, y:232 }, svg).textContent = 'Water';
        g = svgEl('g', { style:'transition:transform 1s ease;transform:translate(0px,0px)' }, svg);
        if (charged) svgEl('circle', { cx:160, cy:40, r:26, fill:'none', stroke:'#2563eb', 'stroke-width':2, 'stroke-dasharray':'3 3' }, g);
        svgEl('circle', { cx:160, cy:40, r:13, fill: charged ? '#dc2626' : '#15803d' }, g);
        svgEl('text', { x:160, y:44, 'text-anchor':'middle', style:'fill:#fff' }, g).textContent = charged ? '+' : '0';
        tabs.forEach(function(t){ t.classList.toggle('active', +t.dataset.ch === charged); });
        fb.className = 'le-fb pm-cross-fb';
        fb.textContent = charged ? 'Charged: 강한 hydration shell(점선)을 가지고 있다.' : 'Neutral: hydration shell이 약하다.';
      }
      function move(y) { g.style.transform = 'translate(0px,' + y + 'px)'; }
      tabs.forEach(function(t){ t.addEventListener('click', function(){ charged = +t.dataset.ch; build(); }); });
      wrap.querySelector('[data-run]').addEventListener('click', function() {
        build();
        if (charged) {
          move(42);
          timers.push(setTimeout(function() { fb.className = 'le-fb pm-cross-fb bad'; fb.textContent = 'Hydration shell을 유지한 채 hydrophobic core에 들어가기 어렵다 — membrane 표면에서 정체. (완전히 불가능한 것은 아니다.)'; }, 1000));
        } else {
          move(70);
          timers.push(setTimeout(function(){ move(130); }, 900));
          timers.push(setTimeout(function(){ move(190); fb.className = 'le-fb pm-cross-fb ok'; fb.textContent = 'Neutral molecule은 membrane core로 partition해 반대편 water로 빠져나온다.'; }, 1900));
        }
      });
      build();
    });
  }

  /* V3 */
  function initPmPka() {
    document.querySelectorAll('[data-pm-pka]').forEach(function(wrap) {
      var q = function(s){ return wrap.querySelector(s); };
      var inp = q('.pk-in');
      function update() {
        var pka = +inp.value;
        var ch = 1 / (1 + Math.pow(10, 7.4 - pka)), ne = 1 - ch;
        var perm = slClamp(0.08 + 0.92 * Math.sqrt(ne), 0, 1);
        q('.pk-v').textContent = pka.toFixed(1);
        q('.pk-c').style.width = (ch * 100) + '%'; q('.pk-n').style.width = (ne * 100) + '%'; q('.pk-p').style.width = (perm * 100) + '%';
        q('.pk-cv').textContent = (ch * 100).toFixed(ch > .99 ? 1 : 0) + '%';
        q('.pk-nv').textContent = (ne * 100).toFixed(ne < .01 ? 2 : 0) + '%';
        var fb = q('.pk-fb');
        fb.className = 'le-fb pk-fb' + (perm < .35 ? ' bad' : (perm > .7 ? ' ok' : ''));
        fb.textContent = 'pH 7.4, pKa ' + pka.toFixed(1) + ': neutral 비율이 ' + (perm < .35 ? '매우 작아 passive permeability가 낮을 가능성이 크다.' : (perm > .7 ? '충분해 passive crossing에 유리하다.' : '중간 수준이다.')) + ' (neutral fraction이 binary switch는 아니다.)';
      }
      inp.addEventListener('input', update); update();
    });
  }

  /* V4 */
  function initPmLogd() {
    document.querySelectorAll('[data-pm-logd]').forEach(function(wrap) {
      var svg = wrap.querySelector('.pm-logd-svg');
      var inp = wrap.querySelector('.lg-in');
      function X(v){ return 40 + (v + 1) / 8 * 280; }
      function Y(p){ return 180 - p * 160; }
      function P(l){ return Math.exp(-Math.pow((l - 3) / 1.8, 2)); }
      function update() {
        var l = +inp.value;
        wrap.querySelector('.lg-v').textContent = l.toFixed(1);
        svg.innerHTML = '';
        slAxes(svg, 40, 180, 320, 20);
        svgEl('rect', { x:X(2), y:20, width:X(4) - X(2), height:160, fill:'#15803d', 'fill-opacity':.08 }, svg);
        svgEl('text', { x:X(3), y:34, 'text-anchor':'middle' }, svg).textContent = 'optimal window';
        svgEl('text', { x:180, y:204, 'text-anchor':'middle' }, svg).textContent = 'logD →';
        svgEl('text', { x:12, y:100, transform:'rotate(-90 12 100)', 'text-anchor':'middle' }, svg).textContent = 'Passive permeability (개념)';
        var pts = [];
        for (var v = -1; v <= 7.01; v += 0.2) pts.push(X(v) + ',' + Y(P(v)));
        svgEl('polyline', { points:pts.join(' '), fill:'none', stroke:'#5b3fd4', 'stroke-width':2.5 }, svg);
        svgEl('circle', { cx:X(l), cy:Y(P(l)), r:8, fill:'#dc2626' }, svg);
        var fb = wrap.querySelector('.lg-fb');
        if (l < 1) { fb.className = 'le-fb lg-fb bad'; fb.textContent = 'logD가 너무 낮다 — membrane partition이 약하다.'; }
        else if (l > 5) { fb.className = 'le-fb lg-fb bad'; fb.textContent = '너무 lipophilic — solubility ↓, nonspecific binding ↑, membrane retention, PPB ↑ 경고 (permeability gain 정체).'; }
        else if (l >= 2 && l <= 4) { fb.className = 'le-fb lg-fb ok'; fb.textContent = '적절한 window. 7강 LipE도 함께 확인한다.'; }
        else { fb.className = 'le-fb lg-fb'; fb.textContent = 'Window 가장자리. 약간의 lipophilicity 조정이 permeability를 바꿀 수 있다.'; }
      }
      inp.addEventListener('input', update); update();
    });
  }

  /* V5 */
  function initPmHbd() {
    document.querySelectorAll('[data-pm-hbd]').forEach(function(wrap) {
      var tabs = wrap.querySelectorAll('[data-m]');
      var q = function(s){ return wrap.querySelector(s); };
      var D = {
        base: { hbd:'2', tpsa:'기준 (≈95)', logd:'2.0', perm:'낮음', risk:'—', sol:'기준', msg:'Parent: OH와 NH 두 개의 HBD가 water와 강하게 상호작용한다.' },
        ome:  { hbd:'1', tpsa:'↓ (≈86)', logd:'≈ 2.4', perm:'개선 가능', risk:'OH donor가 critical이면 ↑', sol:'감소 가능', msg:'OH → OMe: HBD 제거, exposed polarity 감소, lipophilicity 증가. Target에서 OH donor가 중요했다면 potency 손실.' },
        nme:  { hbd:'1', tpsa:'↓ (≈90)', logd:'≈ 2.5', perm:'개선 가능', risk:'NH donor/conformation 변화', sol:'감소 가능', msg:'NH → NMe: HBD 감소. N-methylation은 conformation도 바꿀 수 있다 (4강).' }
      };
      function show(k) {
        tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.m === k); });
        var d = D[k];
        q('.hb-hbd').textContent = d.hbd; q('.hb-tpsa').textContent = d.tpsa; q('.hb-logd').textContent = d.logd;
        q('.hb-perm').textContent = d.perm; q('.hb-risk').textContent = d.risk; q('.hb-sol').textContent = d.sol;
        q('.hb-fb').textContent = d.msg;
      }
      tabs.forEach(function(t){ t.addEventListener('click', function(){ show(t.dataset.m); }); });
      show('base');
    });
  }

  /* V6 */
  function initPmImhb() {
    document.querySelectorAll('[data-pm-imhb]').forEach(function(wrap) {
      var svg = wrap.querySelector('.pm-imhb-svg');
      var tabs = wrap.querySelectorAll('[data-env]');
      var bar = wrap.querySelector('.im-bar');
      var fb = wrap.querySelector('.im-fb');
      function draw(folded) {
        svg.innerHTML = '';
        var pts = folded
          ? [[80,110],[110,70],[160,50],[210,70],[240,110]]
          : [[40,95],[95,70],[160,95],[225,70],[280,95]];
        svgEl('polyline', { points:pts.map(function(p){ return p.join(','); }).join(' '), fill:'none', stroke:'#3d4f6b', 'stroke-width':3 }, svg);
        var d = pts[0], a = pts[4];
        svgEl('circle', { cx:d[0], cy:d[1], r:14, fill:'#dbeafe', stroke:'#2563eb', 'stroke-width':2 }, svg);
        svgEl('text', { x:d[0], y:d[1] + 4, 'text-anchor':'middle' }, svg).textContent = 'OH';
        svgEl('circle', { cx:a[0], cy:a[1], r:14, fill:'#fee2e2', stroke:'#dc2626', 'stroke-width':2 }, svg);
        svgEl('text', { x:a[0], y:a[1] + 4, 'text-anchor':'middle' }, svg).textContent = 'C=O';
        if (folded) {
          svgEl('line', { x1:d[0] + 14, y1:d[1], x2:a[0] - 14, y2:a[1], stroke:'#15803d', 'stroke-width':2.5, 'stroke-dasharray':'4 3' }, svg);
          svgEl('text', { x:160, y:128, 'text-anchor':'middle', style:'fill:#15803d' }, svg).textContent = 'intramolecular H-bond';
        } else {
          svgEl('text', { x:d[0], y:d[1] + 30, 'text-anchor':'middle' }, svg).textContent = 'water과 H-bond';
          svgEl('text', { x:a[0], y:a[1] + 30, 'text-anchor':'middle' }, svg).textContent = 'water과 H-bond';
        }
        svgEl('text', { x:160, y:160, 'text-anchor':'middle' }, svg).textContent = folded ? 'Folded (polar groups internalized)' : 'Open (polar groups exposed)';
      }
      function show(env) {
        tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.env === env); });
        var folded = env === 'mem';
        draw(folded);
        bar.style.width = (folded ? 30 : 80) + '%';
        fb.className = 'le-fb im-fb' + (folded ? ' ok' : '');
        fb.textContent = folded ? 'Membrane-like 환경에서는 folded state가 선호될 수 있다 → exposed polarity ↓ → membrane partition ↑ (chameleonicity). 단 solubility와 binding conformation 영향은 따로 확인.' : 'Water에서는 polar group이 노출되어 water와 상호작용한다.';
      }
      tabs.forEach(function(t){ t.addEventListener('click', function(){ show(t.dataset.env); }); });
      show('water');
    });
  }

  /* V7 */
  function initPmAssay() {
    document.querySelectorAll('[data-pm-assay]').forEach(function(wrap) {
      var fb = wrap.querySelector('.pm-assay-fb');
      var T = {
        pass: ['bad', '✗ PAMPA에서 passive permeability가 high이므로 passive diffusion 자체는 문제가 아니다.'],
        eff:  ['ok',  '✓ PAMPA에는 transporter가 없다. Passive는 좋은데 Caco-2 A→B가 낮다면 active efflux 가능성이 크다 → bidirectional Caco-2로 확인.'],
        sol:  ['bad', '✗ 가능한 confounder지만 PAMPA와 Caco-2의 차이를 가장 직접 설명하는 것은 transporter(efflux)다.']
      };
      wrap.querySelectorAll('[data-a]').forEach(function(b) {
        b.addEventListener('click', function() {
          wrap.querySelectorAll('[data-a]').forEach(function(x){ x.classList.toggle('active', x === b); });
          var t = T[b.dataset.a]; fb.className = 'le-fb pm-assay-fb ' + t[0]; fb.textContent = t[1];
        });
      });
    });
  }

  /* V8 */
  function initPmEfflux() {
    document.querySelectorAll('[data-pm-efflux]').forEach(function(wrap) {
      var svg = wrap.querySelector('.pm-ef-svg');
      var tabs = wrap.querySelectorAll('[data-ef]');
      var bar = wrap.querySelector('.ef-bar');
      var fb = wrap.querySelector('.ef-fb');
      function draw(on) {
        svg.innerHTML = '';
        svgEl('rect', { x:0, y:0, width:130, height:190, fill:'#dbeafe', 'fill-opacity':.5 }, svg);
        svgEl('rect', { x:130, y:0, width:36, height:190, fill:'#fde68a' }, svg);
        svgEl('rect', { x:166, y:0, width:154, height:190, fill:'#f1f5f9' }, svg);
        svgEl('text', { x:8, y:16 }, svg).textContent = 'Extracellular';
        svgEl('text', { x:174, y:16 }, svg).textContent = 'Cytosol';
        for (var i = 0; i < 8; i++) svgEl('circle', { cx:25 + (i % 4) * 25, cy:50 + Math.floor(i / 4) * 50, r:6, fill:'#15803d' }, svg);
        var n = on ? 3 : 9;
        for (var j = 0; j < n; j++) svgEl('circle', { cx:190 + (j % 3) * 36, cy:55 + Math.floor(j / 3) * 40, r:6, fill:'#15803d' }, svg);
        if (on) {
          svgEl('rect', { x:136, y:70, width:24, height:56, rx:8, fill:'#dc2626' }, svg);
          svgEl('text', { x:148, y:103, 'text-anchor':'middle', style:'fill:#fff;font-size:9px' }, svg).textContent = 'P-gp';
          svgEl('text', { x:148, y:146, 'text-anchor':'middle' }, svg).textContent = 'ATP';
          svgEl('line', { x1:130, y1:98, x2:60, y2:98, stroke:'#dc2626', 'stroke-width':3 }, svg);
          svgEl('polygon', { points:'60,92 48,98 60,104', fill:'#dc2626' }, svg);
        }
      }
      function show(on) {
        tabs.forEach(function(t){ t.classList.toggle('active', +t.dataset.ef === on); });
        draw(on);
        bar.style.width = (on ? 25 : 85) + '%';
        fb.className = 'le-fb ef-fb' + (on ? ' bad' : ' ok');
        fb.textContent = on ? 'Efflux ON: compound가 들어가도 다시 배출되어 intracellular concentration이 낮다.' : 'Efflux OFF: 같은 compound가 세포 안에 축적된다.';
      }
      tabs.forEach(function(t){ t.addEventListener('click', function(){ show(+t.dataset.ef); }); });
      show(1);
    });
  }

  /* V9 */
  function initPmBidir() {
    document.querySelectorAll('[data-pm-bidir]').forEach(function(wrap) {
      var btn = wrap.querySelector('[data-inh]');
      var q = function(s){ return wrap.querySelector(s); };
      var inh = false;
      function update() {
        var ab = inh ? 8 : 2, ba = inh ? 10 : 24;
        var er = ba / ab;
        q('.bd-ab').style.width = (ab / 30 * 100) + '%'; q('.bd-ba').style.width = (ba / 30 * 100) + '%';
        q('.bd-abv').textContent = ab + ' ×10⁻⁶ cm/s'; q('.bd-bav').textContent = ba + ' ×10⁻⁶ cm/s';
        q('.bd-er').textContent = er.toFixed(1);
        q('.bd-int').textContent = er >= 2 ? 'active efflux 가능' : 'efflux 약함';
        btn.textContent = inh ? 'Remove inhibitor' : 'Add P-gp inhibitor';
        var fb = q('.bd-fb');
        fb.className = 'le-fb bd-fb' + (inh ? ' ok' : ' bad');
        fb.textContent = inh ? 'Inhibitor가 B→A를 줄이고 A→B를 올렸다. ER이 크게 감소 → P-gp 관여를 지지한다. (threshold는 assay system에 따라 해석)' : 'B→A가 A→B보다 훨씬 크다 → ER이 높다. Active efflux를 의심한다.';
      }
      btn.addEventListener('click', function(){ inh = !inh; update(); });
      update();
    });
  }

  /* V10 */
  function initPmMatrix() {
    document.querySelectorAll('[data-pm-matrix]').forEach(function(wrap) {
      var svg = wrap.querySelector('.pm-mx-svg');
      var fb = wrap.querySelector('.pm-mx-fb');
      var start = { s:.4, p:.55 }, pos = { s:.4, p:.55 };
      var M = { amine:[.3, -.25, 'Amine 추가: ionization ↑ → solubility ↑, permeability ↓.'], hbd:[-.1, .2, 'HBD 제거: permeability ↑, solubility는 약간 ↓.'],
                ph:[-.3, .15, 'Phenyl 추가: lipophilicity ↑ → solubility ↓, permeability는 약간 ↑ (정체 가능).'], het:[.15, -.1, 'Heteroatom 추가: polarity ↑ → solubility ↑, permeability ↓.'] };
      function X(v){ return 40 + v * 280; }
      function Y(v){ return 220 - v * 190; }
      function draw() {
        svg.innerHTML = '';
        var Q = [[0,1],[.5,1],[0,.5],[.5,.5]];
        Q.forEach(function(q, i) {
          svgEl('rect', { x:X(q[0]), y:Y(q[1]), width:140, height:95, fill: i === 1 ? '#15803d' : (i === 2 ? '#dc2626' : '#94a3b8'), 'fill-opacity': i === 1 ? .14 : .07, stroke:'#dce3ef' }, svg);
        });
        svgEl('text', { x:48, y:44 }, svg).textContent = 'Low sol / high perm';
        svgEl('text', { x:188, y:44 }, svg).textContent = 'High / high ✓';
        svgEl('text', { x:48, y:210 }, svg).textContent = 'Low / low';
        svgEl('text', { x:188, y:210 }, svg).textContent = 'High sol / low perm';
        svgEl('text', { x:180, y:246, 'text-anchor':'middle' }, svg).textContent = 'Solubility →';
        svgEl('text', { x:12, y:125, transform:'rotate(-90 12 125)', 'text-anchor':'middle' }, svg).textContent = 'Permeability →';
        svgEl('circle', { cx:X(start.s), cy:Y(start.p), r:6, fill:'none', stroke:'#94a3b8', 'stroke-width':2 }, svg);
        svgEl('circle', { cx:X(pos.s), cy:Y(pos.p), r:9, fill:'#5b3fd4', stroke:'#fff', 'stroke-width':2 }, svg);
      }
      function zone() {
        var hs = pos.s >= .5, hp = pos.p >= .5;
        return hs && hp ? 'desirable zone (high/high)' : (hs ? 'too polar/ionized (high sol / low perm)' : (hp ? 'too lipophilic (low sol / high perm)' : 'poor overall'));
      }
      wrap.querySelectorAll('[data-m]').forEach(function(b) {
        b.addEventListener('click', function() {
          var m = M[b.dataset.m];
          pos.s = slClamp(pos.s + m[0], .05, .95); pos.p = slClamp(pos.p + m[1], .05, .95);
          draw(); fb.textContent = m[2] + ' 현재 위치: ' + zone() + '.';
        });
      });
      wrap.querySelector('[data-reset]').addEventListener('click', function(){ pos = { s:start.s, p:start.p }; draw(); fb.textContent = '시작 lead: 중간 영역.'; });
      draw(); fb.textContent = '시작 lead: 중간 영역. Modification을 적용해 보세요.';
    });
  }

  /* V11 */
  function initPmLorla() {
    document.querySelectorAll('[data-pm-lorla]').forEach(function(wrap) {
      var svg = wrap.querySelector('.pm-lo-svg');
      var tabs = wrap.querySelectorAll('[data-st]');
      var D = {
        closed: { conf:'제한된 conformer 수 → bioactive-like shape 유지', pol:'일부 polar group이 ring 안쪽에 가려짐', perm:'passive permeability에 유리한 profile', eff:'P-gp recognition 위험을 낮추는 방향' },
        open:   { conf:'많은 conformer, 큰 entropy penalty', pol:'더 많은 polar group이 노출', perm:'덜 유리하고 예측하기 어려움', eff:'Efflux 위험이 더 높아질 수 있음' }
      };
      function draw(open) {
        svg.innerHTML = '';
        var cx = 160, cy = 85, r = 55, pts = [];
        for (var i = 0; i < 10; i++) { var a = (36 * i - 90) * Math.PI / 180; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
        if (open) {
          var p1 = pts.slice(0, 5).concat([[pts[4][0] + 20, pts[4][1] + 30]]);
          svgEl('polyline', { points:pts.slice(0, 6).map(function(p){ return p.join(','); }).join(' '), fill:'none', stroke:'#3d4f6b', 'stroke-width':3 }, svg);
          svgEl('polyline', { points:[pts[6], [pts[6][0] - 30, pts[6][1] + 20], [pts[7][0] - 50, pts[7][1] + 5], pts[8], pts[9]].map(function(p){ return p.join(','); }).join(' '), fill:'none', stroke:'#3d4f6b', 'stroke-width':3, 'stroke-dasharray':'6 4' }, svg);
          svgEl('text', { x:160, y:170, 'text-anchor':'middle' }, svg).textContent = 'Open analogue: floppy, polar groups exposed';
        } else {
          svgEl('polygon', { points:pts.map(function(p){ return p.join(','); }).join(' '), fill:'#ede9ff', stroke:'#5b3fd4', 'stroke-width':3 }, svg);
          svgEl('text', { x:160, y:170, 'text-anchor':'middle' }, svg).textContent = 'Macrocycle: conformationally restricted';
        }
        [0, 3, 6].forEach(function(i, k) {
          svgEl('circle', { cx:pts[i][0], cy:pts[i][1], r:8, fill: open ? '#fee2e2' : '#dbeafe', stroke: open ? '#dc2626' : '#2563eb', 'stroke-width':2 }, svg);
        });
      }
      function show(st) {
        tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.st === st); });
        draw(st === 'open');
        wrap.querySelectorAll('.pm-co').forEach(function(c){ c.querySelector('span').textContent = D[st][c.dataset.k]; c.classList.toggle('warn', st === 'open'); });
      }
      tabs.forEach(function(t){ t.addEventListener('click', function(){ show(t.dataset.st); }); });
      show('closed');
    });
  }

  /* V12 */
  function initPmFunnel() {
    document.querySelectorAll('[data-pm-funnel]').forEach(function(wrap) {
      var box = wrap.querySelector('.pm-fun');
      var fb = wrap.querySelector('.pm-fun-fb');
      var S = [
        ['Extracellular concentration', 100, 'Nominal dose — 출발점'],
        ['Dissolved fraction', 82, 'Kinetic solubility (9강)'],
        ['Passive entry', 58, 'PAMPA'],
        ['Efflux 후 잔존', 34, 'Caco-2 bidirectional / efflux ratio'],
        ['Intracellular free concentration', 20, 'LC-MS cell-associated + free fraction 보정'],
        ['Target compartment', 13, 'Subcellular distribution (lysosomal trapping 등)'],
        ['Target engagement', 8, 'CETSA / NanoBRET / occupancy assay']
      ];
      S.forEach(function(s) {
        var b = document.createElement('button');
        b.className = 'pm-fun-step';
        b.style.width = s[1] + '%';
        b.innerHTML = '<b>' + s[0] + '</b>';
        b.addEventListener('click', function() {
          box.querySelectorAll('.pm-fun-step').forEach(function(x){ x.classList.toggle('active', x === b); });
          fb.textContent = s[0] + ' → 관련 assay: ' + s[2] + ' (단계별 감소폭은 개념적 예시)';
        });
        box.appendChild(b);
      });
    });
  }

  /* V13 */
  function initPmEndpoint() {
    document.querySelectorAll('[data-pm-endpoint]').forEach(function(wrap) {
      var warn = wrap.querySelector('.pm-ep-warn');
      wrap.querySelector('[data-interp]').addEventListener('click', function(){ warn.classList.toggle('show'); });
    });
  }

  /* V14 */
  function initPmFlow() {
    document.querySelectorAll('[data-pm-flow]').forEach(function(wrap) {
      var pathBox = wrap.querySelector('.pm-flow-path');
      var qBox = wrap.querySelector('.pm-flow-q');
      var fb = wrap.querySelector('.pm-flow-fb');
      var btns = wrap.querySelector('.pm-flow-btns');
      var N = {
        n0: { q:'Solubility sufficient?', y:'n1', n:'Solubility 문제: precipitation/aggregation을 확인하고 assay 조건 조정 또는 analogue design (9강).' },
        n1: { q:'PAMPA (passive permeability) good?', y:'n2', n:'Physicochemical permeability problem: pKa, logD, TPSA, HBD, size 확인 → pKa tuning / HBD masking / IMHB.' },
        n2: { q:'Caco-2 efflux ratio high?', y:'Transporter problem: efflux SAR(shape, polarity, basicity), inhibitor follow-up.', n:'n3' },
        n3: { q:'Intracellular concentration sufficient?', y:'n4', n:'Sequestration/metabolism 확인 (lysosomal trapping, 세포 내 대사).' },
        n4: { q:'Target engagement observed?', y:'Exposure와 engagement가 확인됨 → gap은 assay window, target dependency, biology 쪽을 의심한다.', n:'Target compartment distribution, cellular context(예: ATP 경쟁)에서의 binding을 확인한다.' }
      };
      var cur, path;
      function isEnd(v) { return !N[v]; }
      function render() {
        pathBox.innerHTML = path.map(function(p){ return '<span>' + p + '</span>'; }).join('<i>›</i>');
        if (cur && N[cur]) { qBox.textContent = N[cur].q; btns.querySelectorAll('[data-a]').forEach(function(b){ b.style.display = ''; }); fb.textContent = ''; fb.className = 'le-fb pm-flow-fb'; }
      }
      function answer(a) {
        var node = N[cur]; var nxt = node[a];
        path.push(node.q.replace('?', '') + ' → ' + (a === 'y' ? 'Yes' : 'No'));
        if (isEnd(nxt)) {
          qBox.textContent = '결론';
          btns.querySelectorAll('[data-a]').forEach(function(b){ b.style.display = 'none'; });
          fb.className = 'le-fb pm-flow-fb ok'; fb.textContent = nxt;
          pathBox.innerHTML = path.map(function(p){ return '<span>' + p + '</span>'; }).join('<i>›</i>');
        } else { cur = nxt; render(); }
      }
      function restart() { cur = 'n0'; path = ['Biochemical active / Cell inactive']; render(); }
      btns.querySelectorAll('[data-a]').forEach(function(b){ b.addEventListener('click', function(){ answer(b.dataset.a); }); });
      btns.querySelector('[data-restart]').addEventListener('click', restart);
      restart();
    });
  }

  /* ============================================================
     L11 – Plasma Protein Binding
     ============================================================ */

  function pbFmtFu(f) { return f >= 0.1 ? f.toFixed(2) : (f >= 0.01 ? f.toFixed(3) : f.toPrecision(2)); }
  function pbFmtNM(n) { return n >= 1000 ? (n / 1000).toPrecision(3) + ' µM' : (n >= 10 ? n.toFixed(0) : n.toPrecision(2)) + ' nM'; }

  /* V1 */
  function initPbOpen() {
    document.querySelectorAll('[data-pb-open]').forEach(function(wrap) {
      var box = wrap.querySelector('.pb-open-rows');
      var tabs = wrap.querySelectorAll('[data-v]');
      var fb = wrap.querySelector('.pb-open-fb');
      var cs = [{ n:'Compound A', t:1000, f:1 }, { n:'Compound B', t:200, f:10 }];
      function show(v) {
        tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.v === v); });
        box.innerHTML = '';
        cs.forEach(function(c) {
          var el = document.createElement('div');
          el.className = 'pb-open-row';
          var h = '<h6>' + c.n + '</h6>';
          if (v === 'total') h += '<div class="pb-bar"><i class="tot" style="width:' + (c.t / 1000 * 100) + '%"></i><span>Total ' + c.t + '</span></div>';
          else if (v === 'free') h += '<div class="pb-bar"><i class="free" style="width:' + (c.f / 10 * 100) + '%"></i><span>Free ' + c.f + '</span></div>';
          else h += '<div class="pb-bar"><i class="tot" style="width:' + (c.t / 1000 * 100) + '%"></i><i class="free" style="width:' + Math.max(1.5, c.f / 1000 * 100) + '%"></i><span>Total ' + c.t + ' · Free ' + c.f + '</span></div>';
          el.innerHTML = h; box.appendChild(el);
        });
        fb.className = 'le-fb pb-open-fb' + (v === 'free' ? ' ok' : '');
        fb.textContent = v === 'total' ? 'Total만 보면 A가 5배 압도적이다.' : (v === 'free' ? 'Free만 보면 B가 10배 많다 — 순위가 뒤집힌다.' : 'A는 대부분 protein에 결합(free 0.1%), B는 free 5%. Pharmacologically available한 것은 free pool이다.');
      }
      tabs.forEach(function(t){ t.addEventListener('click', function(){ show(t.dataset.v); }); });
      show('total');
    });
  }

  /* V3 */
  function initPbConv() {
    document.querySelectorAll('[data-pb-conv]').forEach(function(wrap) {
      var inp = wrap.querySelector('.cv-in');
      var q = function(s){ return wrap.querySelector(s); };
      function update() {
        var v = +inp.value, fu = Math.pow(10, v);
        var dec = Math.max(0, Math.round(-v) - 2);
        q('.cv-pb').textContent = (100 * (1 - fu)).toFixed(dec) + '%';
        q('.cv-fu').textContent = pbFmtFu(fu);
        var x = fu / 0.1;
        q('.cv-x').textContent = x >= 0.995 ? '동일' : (1 / x).toFixed(x < 0.01 ? 0 : 1) + '× 적은 free';
        q('.cv-fb').textContent = '% bound의 작은 변화(' + (100 * (1 - fu)).toFixed(dec) + '%)가 fu 척도에서는 ' + pbFmtFu(fu) + '로 크게 달라진다.';
        wrap.querySelectorAll('[data-p]').forEach(function(b){ b.classList.toggle('active', Math.abs(+b.dataset.p - v) < 0.03); });
      }
      inp.addEventListener('input', update);
      wrap.querySelectorAll('[data-p]').forEach(function(b){ b.addEventListener('click', function(){ inp.value = b.dataset.p; update(); }); });
      update();
    });
  }

  /* V6 */
  function initPbTrap() {
    document.querySelectorAll('[data-pb-trap]').forEach(function(wrap) {
      var res = wrap.querySelector('.pb-trap-res');
      var btn = wrap.querySelector('[data-conv]');
      btn.addEventListener('click', function() {
        var on = res.classList.toggle('show');
        btn.textContent = on ? 'Hide free fraction' : 'Convert to free fraction';
      });
    });
  }

  /* V2 */
  function initPbEq() {
    document.querySelectorAll('[data-pb-eq]').forEach(function(wrap) {
      var svg = wrap.querySelector('.pb-eq-svg');
      var q = function(s){ return wrap.querySelector(s); };
      var FU = 0.2, st;
      function reset() { st = { total:10, free:2, tissue:0 }; }
      function draw() {
        svg.innerHTML = '';
        svgEl('circle', { cx:100, cy:100, r:55, fill:'#ede9ff', stroke:'#5b3fd4', 'stroke-width':3 }, svg);
        svgEl('text', { x:100, y:104, 'text-anchor':'middle', style:'fill:#3d28a8;font-size:12px' }, svg).textContent = 'Albumin';
        var bound = st.total - st.free;
        for (var i = 0; i < bound; i++) {
          var a = (360 / 10) * i * Math.PI / 180;
          svgEl('circle', { cx:100 + Math.cos(a) * 62, cy:100 + Math.sin(a) * 62, r:7, fill:'#c2410c' }, svg);
        }
        svgEl('text', { x:185, y:26, style:'font-size:11px' }, svg).textContent = 'Free drug';
        for (var j = 0; j < st.free; j++) svgEl('circle', { cx:200 + (j % 3) * 22, cy:55 + Math.floor(j / 3) * 24, r:7, fill:'#15803d' }, svg);
        svgEl('rect', { x:255, y:20, width:56, height:160, rx:8, fill:'#f1f5f9', stroke:'#94a3b8' }, svg);
        svgEl('text', { x:283, y:38, 'text-anchor':'middle' }, svg).textContent = 'Tissue';
        for (var k = 0; k < st.tissue; k++) svgEl('circle', { cx:270 + (k % 2) * 24, cy:60 + Math.floor(k / 2) * 20, r:6, fill:'#15803d' }, svg);
        q('.eq-b').textContent = bound; q('.eq-f').textContent = st.free; q('.eq-t').textContent = st.tissue;
      }
      wrap.querySelector('[data-remove]').addEventListener('click', function() {
        if (st.free <= 0) { q('.eq-fb').textContent = '더 이상 free drug가 없다.'; return; }
        st.tissue += st.free; st.total -= st.free;
        q('.eq-fb').textContent = 'Free drug가 tissue로 이동했다. 평형이 다시 맞춰지며 bound drug 일부가 dissociate한다 (bound → free).';
        st.free = Math.round(st.total * FU);
        draw();
      });
      wrap.querySelector('[data-reset]').addEventListener('click', function(){ reset(); q('.eq-fb').textContent = ''; draw(); });
      reset(); draw();
      q('.eq-fb').textContent = 'Free drug를 제거해 보세요.';
    });
  }

  /* V4 */
  function initPbProt() {
    document.querySelectorAll('[data-pb-prot]').forEach(function(wrap) {
      var tabs = wrap.querySelectorAll('[data-t]');
      var cards = wrap.querySelectorAll('.pb-prot-c');
      var fb = wrap.querySelector('.pb-prot-fb');
      var D = {
        acid:    { hl:['alb'], msg:'Acidic drug: albumin binding을 먼저 확인한다.' },
        base:    { hl:['aag', 'alb'], msg:'Basic lipophilic drug: AAG가 중요한 경우가 많다 (albumin도 함께). AAG는 inflammation에서 농도가 변할 수 있다.' },
        neutral: { hl:['alb'], msg:'Neutral/lipophilic drug: albumin의 hydrophobic region과 binding하는 경우가 많다.' }
      };
      tabs.forEach(function(t) {
        t.addEventListener('click', function() {
          tabs.forEach(function(x){ x.classList.toggle('active', x === t); });
          var d = D[t.dataset.t];
          cards.forEach(function(c){ c.classList.toggle('hl', d.hl.indexOf(c.dataset.p) >= 0); });
          fb.textContent = d.msg + ' (일반적 경향, 예외 많음)';
        });
      });
      fb.textContent = 'Drug type을 선택하세요.';
    });
  }

  /* V5 */
  function initPbLogd() {
    document.querySelectorAll('[data-pb-logd]').forEach(function(wrap) {
      var svg = wrap.querySelector('.pb-logd-svg');
      var fb = wrap.querySelector('.pb-logd-fb');
      var pts = [[1.5, .20], [2.3, .08], [3.0, .03], [3.6, .008], [4.5, .002], [5.0, .0005]];
      var out = [2.2, .003];
      function X(l){ return 40 + (l - 1) / 4.5 * 280; }
      function Y(f){ return 20 + (-Math.log(f) / Math.LN10) / 4 * 170; }
      slAxes(svg, 40, 190, 320, 20);
      svgEl('text', { x:180, y:216, 'text-anchor':'middle' }, svg).textContent = 'logD →';
      svgEl('text', { x:12, y:105, transform:'rotate(-90 12 105)', 'text-anchor':'middle' }, svg).textContent = 'fu,p (log scale)';
      [1, .1, .01, .001, .0001].forEach(function(f) { svgEl('text', { x:6, y:Y(f) + 4, style:'font-size:9px' }, svg).textContent = f; });
      svgEl('polyline', { points:pts.map(function(p){ return X(p[0]) + ',' + Y(p[1]); }).join(' '), fill:'none', stroke:'#c2cede', 'stroke-width':2, 'stroke-dasharray':'5 4' }, svg);
      pts.forEach(function(p) {
        var c = svgEl('circle', { cx:X(p[0]), cy:Y(p[1]), r:8, fill:'#5b3fd4', style:'cursor:pointer' }, svg);
        c.addEventListener('click', function() { fb.className = 'le-fb pb-logd-fb'; fb.textContent = 'logD ' + p[0] + ' → fu,p ' + p[1] + '. logD가 올라갈수록 fu가 감소하는 lipophilicity-driven trend.'; });
      });
      var o = svgEl('circle', { cx:X(out[0]), cy:Y(out[1]), r:9, fill:'#dc2626', style:'cursor:pointer' }, svg);
      svgEl('text', { x:X(out[0]) + 12, y:Y(out[1]) + 4, style:'fill:#dc2626' }, svg).textContent = 'outlier';
      o.addEventListener('click', function() { fb.className = 'le-fb pb-logd-fb bad'; fb.textContent = 'logD 2.2 정도인데 fu,p 0.003 — trend보다 훨씬 강한 binding. Specific protein recognition(특정 albumin site 등)이 작용했을 수 있다. logD만으로는 설명되지 않는다.'; });
    });
  }

  /* V7 */
  function initPbDist() {
    document.querySelectorAll('[data-pb-dist]').forEach(function(wrap) {
      var q = function(s){ return wrap.querySelector(s); };
      var pI = q('.ds-p-in'), tI = q('.ds-t-in');
      function update() {
        var p = +pI.value, t = +tI.value;
        q('.ds-p').textContent = p; q('.ds-t').textContent = t;
        q('.ds-bp').style.width = (p * 10) + '%'; q('.ds-bt').style.width = (t * 10) + '%'; q('.ds-bf').style.width = '15%';
        var r = t / p, fb = q('.ds-fb');
        if (r > 1.3) { fb.className = 'le-fb ds-fb ok'; fb.textContent = 'Tissue binding이 plasma binding보다 강하다 → drug가 tissue에 더 많이 머문다 → Vd 큼 (plasma binding이 높아도 가능).'; }
        else if (r < 0.77) { fb.className = 'le-fb ds-fb bad'; fb.textContent = 'Plasma binding이 우세 → drug가 plasma에 머문다 → Vd 작음.'; }
        else { fb.className = 'le-fb ds-fb'; fb.textContent = '두 binding이 비슷하다 → plasma와 tissue의 total 농도가 비슷한 수준.'; }
      }
      pI.addEventListener('input', update); tI.addEventListener('input', update);
      update();
    });
  }

  /* V8 */
  function initPbCl() {
    document.querySelectorAll('[data-pb-cl]').forEach(function(wrap) {
      var q = function(s){ return wrap.querySelector(s); };
      var fI = q('.cl-fu-in'), cI = q('.cl-int-in');
      var Q = 20;
      function update() {
        var fu = Math.pow(10, +fI.value), ci = Math.pow(10, +cI.value);
        var prod = fu * ci, clh = Q * prod / (Q + prod), er = clh / Q;
        q('.cl-fu').textContent = pbFmtFu(fu);
        q('.cl-int').textContent = ci >= 10 ? ci.toFixed(0) : ci.toFixed(1);
        q('.cl-prod').textContent = prod >= 10 ? prod.toFixed(0) : prod.toPrecision(2);
        q('.cl-h').textContent = clh >= 10 ? clh.toFixed(1) : clh.toPrecision(2);
        q('.cl-er').textContent = (er * 100).toFixed(0) + '%';
        var fb = q('.cl-fb');
        if (er < 0.3) { fb.className = 'le-fb cl-fb'; fb.textContent = 'Capacity-limited: CLh ≈ fu·CLint. fu와 intrinsic clearance가 모두 clearance를 결정한다.'; }
        else if (er > 0.7) { fb.className = 'le-fb cl-fb bad'; fb.textContent = 'Flow-limited: extraction이 높아 CLh가 hepatic blood flow에 근접. 이 경우 PPB 변화는 CLh에 거의 영향을 주지 않는다.'; }
        else { fb.className = 'le-fb cl-fb'; fb.textContent = '중간 영역. fu와 CLint, blood flow가 모두 관여한다 (13강).'; }
      }
      fI.addEventListener('input', update); cI.addEventListener('input', update);
      update();
    });
  }

  /* V9 */
  function initPbSpecies() {
    document.querySelectorAll('[data-pb-species]').forEach(function(wrap) {
      var inp = wrap.querySelector('.sp2-in');
      var box = wrap.querySelector('.pb-sp-cards');
      var S = [['Rat', .10], ['Dog', .05], ['Human', .01]];
      function update() {
        var t = Math.pow(10, +inp.value);
        wrap.querySelector('.sp2-t').textContent = t.toFixed(t < 1 ? 2 : 1) + ' µM';
        box.innerHTML = S.map(function(s) {
          return '<div class="pb-sp-c"><b>' + s[0] + '</b><span>fu ' + s[1] + '</span><em>' + pbFmtNM(t * 1000 * s[1]) + '</em></div>';
        }).join('');
        wrap.querySelector('.sp2-fb').textContent = '같은 total ' + t.toFixed(1) + ' µM에서 free는 Rat ' + pbFmtNM(t * 100) + ' vs Human ' + pbFmtNM(t * 10) + ' — 10배 차이.';
      }
      inp.addEventListener('input', update); update();
    });
  }

  /* V10 */
  function initPbDial() {
    document.querySelectorAll('[data-pb-dial]').forEach(function(wrap) {
      var svg = wrap.querySelector('.pb-dial-svg');
      var fI = wrap.querySelector('.dl-fu-in'), tI = wrap.querySelector('.dl-t-in');
      function update() {
        var fu = Math.pow(10, +fI.value), t = +tI.value;
        var p = 1 - Math.exp(-t / 100 * 4);
        var buf = fu * p;
        wrap.querySelector('.dl-fu').textContent = pbFmtFu(fu);
        wrap.querySelector('.dl-t').textContent = t + '%';
        svg.innerHTML = '';
        svgEl('rect', { x:20, y:20, width:110, height:120, rx:6, fill:'#fef3c7', stroke:'#3d4f6b', 'stroke-width':2 }, svg);
        svgEl('rect', { x:190, y:20, width:110, height:120, rx:6, fill:'#dbeafe', stroke:'#3d4f6b', 'stroke-width':2 }, svg);
        svgEl('rect', { x:190, y:20 + 120 * (1 - Math.min(1, buf * 6)), width:110, height:120 * Math.min(1, buf * 6), rx:4, fill:'#15803d', 'fill-opacity':.5 }, svg);
        svgEl('line', { x1:160, y1:20, x2:160, y2:140, stroke:'#5b3fd4', 'stroke-width':4, 'stroke-dasharray':'6 4' }, svg);
        svgEl('text', { x:75, y:158, 'text-anchor':'middle' }, svg).textContent = 'Plasma + protein + drug';
        svgEl('text', { x:245, y:158, 'text-anchor':'middle' }, svg).textContent = 'Buffer';
        svgEl('text', { x:160, y:14, 'text-anchor':'middle', style:'fill:#5b3fd4' }, svg).textContent = 'semipermeable membrane';
        for (var i = 0; i < 8; i++) svgEl('circle', { cx:35 + (i % 4) * 25, cy:55 + Math.floor(i / 4) * 35, r:7, fill:'#c2410c' }, svg);
        var est = buf;
        var fb = wrap.querySelector('.dl-fb');
        fb.className = 'le-fb dl-fb' + (p > .97 ? ' ok' : '');
        fb.textContent = '현재 읽는 fu ≈ ' + pbFmtFu(est) + ' (실제 ' + pbFmtFu(fu) + '). ' + (p > .97 ? '평형에 도달 — 정확한 fu.' : '아직 평형 전이라 fu를 과소평가한다. 평형 시간이 부족하면 artifact가 된다.');
      }
      fI.addEventListener('input', update); tI.addEventListener('input', update);
      update();
    });
  }

  /* V11 */
  function initPbSeries() {
    document.querySelectorAll('[data-pb-series]').forEach(function(wrap) {
      var cols = wrap.querySelector('.pb-ser-cols');
      var info = wrap.querySelector('.pb-ser-info');
      var fb = wrap.querySelector('.pb-ser-fb');
      var cs = [['A', 300, 1.5, .20], ['B', 70, 2.3, .08], ['C', 10, 3.6, .008], ['D', 3, 5.0, .0005]];
      cs.forEach(function(c) {
        var p = lePfromNM(c[1]);
        var el = document.createElement('button');
        el.className = 'pb-ser-col';
        el.innerHTML = '<div class="pb-ser-bars"><i class="p" style="height:' + ((p - 5) / 4 * 100) + '%"></i><i class="l" style="height:' + (c[2] / 6 * 100) + '%"></i><i class="f" style="height:' + ((Math.log(c[3]) / Math.LN10 + 4) / 4 * 100) + '%"></i></div><b>' + c[0] + '</b>';
        el.addEventListener('click', function() {
          cols.querySelectorAll('.pb-ser-col').forEach(function(x){ x.classList.toggle('active', x === el); });
          info.innerHTML = '<div class="le-three-c"><span>pIC50</span><b>' + p.toFixed(1) + '</b></div><div class="le-three-c"><span>LipE</span><b>' + (p - c[2]).toFixed(1) + '</b></div><div class="le-three-c"><span>fu,p</span><b>' + pbFmtFu(c[3]) + '</b></div>';
          fb.className = 'le-fb pb-ser-fb' + (c[0] === 'D' ? ' bad' : '');
          fb.textContent = 'Compound ' + c[0] + ': A 대비 free fraction ' + (c[3] / .2 * 100).toFixed(c[3] / .2 < 0.1 ? 1 : 0) + '%. ' + (c[0] === 'D' ? 'Potency는 최고지만 free exposure와 LipE에서 큰 대가를 치렀다.' : (c[0] === 'C' ? '더 balanced한 후보일 수 있다.' : ''));
        });
        cols.appendChild(el);
      });
      cols.insertAdjacentHTML('beforeend', '<div class="pb-ser-legend"><span class="p">pIC50 ↑</span><span class="l">logD ↑</span><span class="f">free fraction</span></div>');
    });
  }

  /* V12 */
  function initPbCalc() {
    document.querySelectorAll('[data-pb-calc]').forEach(function(wrap) {
      var q = function(s){ return wrap.querySelector(s); };
      var tI = q('.ca-t-in'), fI = q('.ca-f-in'), iI = q('.ca-i-in');
      function update() {
        var tot = Math.pow(10, +tI.value) * 1000, fu = Math.pow(10, +fI.value), ic = Math.pow(10, +iI.value);
        var cu = tot * fu, r = cu / ic;
        q('.ca-t').textContent = pbFmtNM(tot); q('.ca-f').textContent = pbFmtFu(fu); q('.ca-i').textContent = pbFmtNM(ic);
        q('.ca-cu').textContent = pbFmtNM(cu); q('.ca-tc').textContent = (tot / ic).toFixed(tot / ic >= 10 ? 0 : 1) + '×';
        q('.ca-r').textContent = r.toFixed(r >= 10 ? 0 : 2) + '×';
        var fb = q('.ca-fb');
        if (r < 1) { fb.className = 'le-fb ca-fb bad'; fb.textContent = 'Total은 IC50의 ' + (tot / ic).toFixed(0) + '배로 충분해 보이지만 unbound는 IC50 미만 — target coverage 부족 가능.'; }
        else if (r < 3) { fb.className = 'le-fb ca-fb'; fb.textContent = 'Unbound가 IC50를 겨우 넘는 수준. Marginal — 필요한 coverage는 target과 pharmacology에 따라 다르다.'; }
        else { fb.className = 'le-fb ca-fb ok'; fb.textContent = 'Unbound coverage가 IC50보다 충분히 높다 (필요한 배수는 project마다 다름).'; }
      }
      [tI, fI, iI].forEach(function(i){ i.addEventListener('input', update); });
      update();
    });
  }

  /* V13 */
  function initPbAi() {
    document.querySelectorAll('[data-pb-ai]').forEach(function(wrap) {
      var box = wrap.querySelector('.pb-ai-rows');
      var fb = wrap.querySelector('.pb-ai-fb');
      var btn = wrap.querySelector('[data-conv]');
      var P = [99.5, 99.8, 99.9], ACT = 99.9, fu = false;
      function render() {
        var h = '';
        P.forEach(function(p, i) {
          if (!fu) h += '<div class="pb-ai-row"><span>Model ' + (i + 1) + '</span><b>' + p + '% bound</b><em>실제 ' + ACT + '% · 오차 ' + Math.abs(p - ACT).toFixed(1) + '%p</em></div>';
          else {
            var f1 = (100 - p) / 100, f0 = (100 - ACT) / 100;
            h += '<div class="pb-ai-row"><span>Model ' + (i + 1) + '</span><b>fu ' + f1.toFixed(3) + '</b><em class="bad">실제 ' + f0.toFixed(3) + ' · ' + (f1 / f0).toFixed(1) + '× 오차</em></div>';
          }
        });
        box.innerHTML = h;
        btn.textContent = fu ? 'Back to % bound' : 'Convert to fu';
        fb.className = 'le-fb pb-ai-fb' + (fu ? ' bad' : '');
        fb.textContent = fu ? '같은 예측이 fu 척도에서는 최대 5배 오차다 — unbound exposure 해석에 큰 영향.' : '% bound MAE는 약 0.17%p로 매우 작아 보인다.';
      }
      btn.addEventListener('click', function(){ fu = !fu; render(); });
      render();
    });
  }

  /* V14 */
  function initPbFlow() {
    document.querySelectorAll('[data-pb-flow]').forEach(function(wrap) {
      var pathBox = wrap.querySelector('.pm-flow-path');
      var qBox = wrap.querySelector('.pm-flow-q');
      var fb = wrap.querySelector('.pm-flow-fb');
      var btns = wrap.querySelector('.pm-flow-btns');
      var N = {
        n0: { q:'Unbound plasma exposure (total × fu,p)가 cellular potency를 충분히 덮는가?', y:'n1', n:'Exposure problem: PPB 때문에 unbound coverage가 부족. Dose/PK 개선 또는 logD를 낮춰 fu를 개선하는 analogue.' },
        n1: { q:'Target tissue로의 distribution이 충분한가? (unbound tissue, tissue/plasma ratio)', y:'n2', n:'Distribution problem: tissue binding, transporter, barrier(BBB 등) 확인 (14강).' },
        n2: { q:'세포 내 target engagement가 확인되는가?', y:'Exposure chain이 모두 확인됨 → efficacy가 약한 이유는 target dependency, PD marker, disease model 등 biology 쪽을 확인한다.', n:'Intracellular free exposure, compartment, permeability/efflux (10강)와 binding in cellular context를 확인한다.' }
      };
      var cur, path;
      function paint() { pathBox.innerHTML = path.map(function(p){ return '<span>' + p + '</span>'; }).join('<i>›</i>'); }
      function render() { paint(); qBox.textContent = N[cur].q; btns.querySelectorAll('[data-a]').forEach(function(b){ b.style.display = ''; }); fb.textContent = ''; fb.className = 'le-fb pm-flow-fb'; }
      function answer(a) {
        var nxt = N[cur][a];
        path.push(N[cur].q.split('(')[0].trim().replace('?', '') + ' → ' + (a === 'y' ? 'Yes' : 'No'));
        if (!N[nxt]) {
          paint(); qBox.textContent = '결론';
          btns.querySelectorAll('[data-a]').forEach(function(b){ b.style.display = 'none'; });
          fb.className = 'le-fb pm-flow-fb ' + (nxt.indexOf('problem') >= 0 ? 'bad' : 'ok'); fb.textContent = nxt;
        } else { cur = nxt; render(); }
      }
      function restart() { cur = 'n0'; path = ['High total exposure / weak efficacy']; render(); }
      btns.querySelectorAll('[data-a]').forEach(function(b){ b.addEventListener('click', function(){ answer(b.dataset.a); }); });
      btns.querySelector('[data-restart]').addEventListener('click', restart);
      restart();
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

    initBiDesigner();
    initBiCompare();
    initBiRadar();
    initBiScan();
    initBiFluor();
    initBiSwitch();
    initBiAmide();
    initBiHop();
    initBiTri();
    initBiMmp();
    initBiGen();
    initBiFlow();

    initLeOpen();
    initLeLadder();
    initLeAtoms();
    initLeGrow();
    initLeLipe();
    initLeTrap();
    initLeMatrix();
    initLeQuality();
    initLeRadar();
    initLeHack();
    initLePareto();
    initLeAudit();

    initSrDetective();
    initSrMmp();
    initSrSteric();
    initSrCliff();
    initSrFlat();
    initSrZones();
    initSrLipe();
    initSrSplit();
    initSrHyp();
    initSrAiCliff();
    initSrTree();
    initSrNext();

    initSlAdded();
    initSlBalance();
    initSlTime();
    initSlPh();
    initSlMatrix();
    initSlPack();
    initSlPolar();
    initSlAmorph();
    initSlDmso();
    initSlAggr();
    initSlLab();
    initSlSp();
    initSlBlind();
    initSlFlow();

    initPmOpen();
    initPmCross();
    initPmPka();
    initPmLogd();
    initPmHbd();
    initPmImhb();
    initPmAssay();
    initPmEfflux();
    initPmBidir();
    initPmMatrix();
    initPmLorla();
    initPmFunnel();
    initPmEndpoint();
    initPmFlow();

    initPbOpen();
    initPbConv();
    initPbTrap();
    initPbEq();
    initPbProt();
    initPbLogd();
    initPbDist();
    initPbCl();
    initPbSpecies();
    initPbDial();
    initPbSeries();
    initPbCalc();
    initPbAi();
    initPbFlow();

    initHub();
  });

})();
