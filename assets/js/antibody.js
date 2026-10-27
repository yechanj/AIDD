/* =========================================================
   AIDD — Track C · Antibody Drug Discovery 인터랙션 (바닐라 JS)
   main.js(사이드바/스크롤스파이/MCQ) 뒤에 로드한다.
   ========================================================= */
(function () {
  "use strict";

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var NS = "http://www.w3.org/2000/svg";

  /* Y자 항체 아이콘 (개념도용, 원점=분기점, 팁 = (±22,-34)) */
  function yIcon(color, withCup) {
    var c = color || "#2f5fd0";
    return '<g>' +
      '<path d="M0 32 L0 0 M0 0 L-22 -34 M0 0 L22 -34" stroke="' + c + '" stroke-width="9" stroke-linecap="round" fill="none"/>' +
      (withCup ? '<path d="M-31 -37 L-22 -26 L-13 -37" stroke="#f97316" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' : '') +
      '</g>';
  }

  /* =========================================================
     S01. 항체의 표적 인식
     ========================================================= */
  function patchPoly(type, dx, s) {
    var p;
    if (type === "tri")  p = [[dx - s, 35], [dx, 47], [dx + s, 35]];
    if (type === "sq")   p = [[dx - s, 35], [dx - s, 45], [dx + s, 45], [dx + s, 35]];
    if (type === "trap") p = [[dx - s, 35], [dx - s / 2, 46], [dx + s / 2, 46], [dx + s, 35]];
    return '<polygon points="' + p.map(function (q) { return q.join(","); }).join(" ") +
      '" fill="#fde2c7" stroke="#f97316" stroke-width="2" stroke-linejoin="round"/>';
  }

  var AGS = {
    A: { x: 52,  patches: [["tri", 0, 10]], cls: "ok",
         title: "Antigen A — 결합 가능한 구조",
         msg: "항체의 결합 부위(paratope)와 상보적인 표면 영역(epitope)을 가진다. 결합 부위의 모양·전하·수소결합 가능 위치가 함께 맞아야 결합이 성립한다." },
    B: { x: 138, patches: [["sq", 0, 10]], cls: "bad",
         title: "Antigen B — 구조적으로 맞지 않음",
         msg: "표면 형태가 이 항체의 결합 부위와 맞지 않는다. 항체는 단백질 전체를 무작위로 붙잡는 것이 아니라 특정 표면 영역만 인식한다." },
    C: { x: 224, patches: [["trap", 0, 10]], cls: "warn",
         title: "Antigen C — 부분적으로 유사, 결합 여부 불확실",
         msg: "모양이 부분적으로 비슷해 접근은 가능하지만, 실제 결합 여부는 세부 구조·전하·유연성에 달려 있다. 이런 경우는 눈으로 판단할 수 없고 SPR/BLI 같은 실험이 필요하다." },
    D: { x: 308, patches: [["sq", -14, 8], ["tri", 14, 8]], cls: "ok",
         title: "Antigen D — 결합 가능한 다른 표면이 존재할 수 있음",
         msg: "처음 접근한 면(사각 돌기)에는 맞지 않지만, 항원은 3차원 단백질이므로 다른 표면(삼각 돌기)에 결합 가능한 epitope가 있을 수 있다. 하나의 항원에도 여러 epitope가 존재한다." }
  };
  var AG_Y = 84;

  function initRecognition() {
    var root = $("[data-ab-recog]");
    if (!root) return;
    var svgHost = $(".rec-svg", root);
    var fb = $(".rec-fb", root);
    var effBox = $(".rec-effects-host", root);
    var bindBtn = $("[data-act='bind']", root);
    var effBtn = $("[data-act='effect']", root);

    var h = '<svg class="ab-svg" viewBox="0 0 360 320" role="img" aria-label="항체와 4개 항원 단백질의 개념도">';
    Object.keys(AGS).forEach(function (k) {
      var a = AGS[k];
      h += '<g class="rec-ag" data-ag="' + k + '" transform="translate(' + a.x + ',' + AG_Y + ')" tabindex="0" role="button" aria-label="Antigen ' + k + ' 선택">' +
        '<g class="ag-shake"><rect class="ag-body" x="-36" y="-35" width="72" height="70" rx="18"/>';
      a.patches.forEach(function (p) { h += patchPoly(p[0], p[1], p[2]); });
      h += '</g><text y="-44">Antigen ' + k + '</text></g>';
    });
    h += '<g class="mv rec-ab" style="transform:translate(74px,250px)"><g class="rec-ab-in">' + yIcon("#2f5fd0", true) + '</g></g>';
    h += '<text x="180" y="312" text-anchor="middle" font-size="11" fill="#6e7f99">개념 설명용 모델 · 실제 결합 예측이 아님</text>';
    h += '</svg>';
    svgHost.innerHTML = h;

    var abG = $(".rec-ab", svgHost);
    var sel = null, docked = false, token = 0;

    function moveAb(x, y) { abG.style.transform = "translate(" + x + "px," + y + "px)"; }
    function setFb(cls, html) { fb.className = "ab-fb rec-fb" + (cls ? " ab-fb--" + cls : ""); fb.innerHTML = html; }

    function select(k) {
      token++;
      sel = k; docked = false; effBox.innerHTML = "";
      $$(".rec-ag", svgHost).forEach(function (g) { g.classList.toggle("sel", g.getAttribute("data-ag") === k); });
      moveAb(AGS[k].x + 22, 250);
      bindBtn.disabled = false;
      setFb("", "<b>Antigen " + k + "</b> 선택됨 — <b>Binding</b> 버튼을 눌러 항체를 접근시켜 보세요.");
    }
    $$(".rec-ag", svgHost).forEach(function (g) {
      g.addEventListener("click", function () { select(g.getAttribute("data-ag")); });
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(g.getAttribute("data-ag")); } });
    });

    function shake(k) {
      var s = $(".rec-ag[data-ag='" + k + "'] .ag-shake", svgHost);
      s.classList.remove("rec-shake"); void s.getBBox(); s.classList.add("rec-shake");
    }

    bindBtn.addEventListener("click", function () {
      if (!sel) { setFb("warn", "먼저 위의 항원 중 하나를 눌러 선택하세요."); return; }
      var my = ++token, a = AGS[sel], ax = a.x, up = AG_Y + 75;
      effBox.innerHTML = "";
      function done(cls) { setFb(cls, "<b>" + a.title + "</b><br>" + a.msg); }
      if (sel === "A") {
        moveAb(ax + 22, up); docked = true;
        setTimeout(function () { if (my === token) done("ok"); }, 700);
      } else if (sel === "B") {
        moveAb(ax + 22, up + 6);
        setTimeout(function () { if (my !== token) return; shake("B"); moveAb(ax + 22, 250); done("bad"); }, 750);
      } else if (sel === "C") {
        moveAb(ax + 22, up + 16);
        setTimeout(function () { if (my === token) done("warn"); }, 750);
      } else if (sel === "D") {
        moveAb(ax - 14 + 22, up + 6);
        setTimeout(function () {
          if (my !== token) return;
          shake("D"); moveAb(ax - 14 + 22, 250);
          setTimeout(function () {
            if (my !== token) return;
            moveAb(ax + 14 + 22, up); docked = true;
            setTimeout(function () { if (my === token) done("ok"); }, 700);
          }, 650);
        }, 750);
      }
    });

    effBtn.addEventListener("click", function () {
      if (!docked) {
        effBox.innerHTML = "";
        setFb("warn", "결합이 성립한 항원(A 또는 D)에서만 결합 이후의 효과를 논할 수 있다. 먼저 <b>Binding</b>으로 결합을 확인하세요.");
        return;
      }
      effBox.innerHTML =
        '<div class="rec-effects">' +
        '<div class="rec-eff"><span class="ico">🚫</span><b>① Ligand–receptor 상호작용 차단</b>항체가 리간드나 수용체의 결합면을 가려 원래의 분자 간 상호작용이 일어나지 못하게 한다.</div>' +
        '<div class="rec-eff"><span class="ico">🎛️</span><b>② Receptor signaling 조절</b>수용체에 결합해 신호를 억제하거나, 경우에 따라 활성화한다. epitope와 결합 방향에 따라 달라진다.</div>' +
        '<div class="rec-eff"><span class="ico">🛡️</span><b>③ 면역세포에 의한 제거 유도</b>표적세포 표면에 결합한 항체의 Fc를 면역세포가 인식해 표적세포를 제거한다 (ADCC, CDC 등).</div>' +
        '</div>';
      setFb("warn", "<b>결합 ≠ 생물학적 효과.</b> 결합했다는 사실만으로 치료 효과가 보장되지는 않는다. 어떤 효과가 나타나는지는 epitope, 표적의 기능, 항체의 Fc 기능에 따라 달라진다.");
    });

    select("A");
  }

  /* =========================================================
     S02. Clonal selection
     ========================================================= */
  var CLONES = [
    { c: "#e11d48", s: '<circle cx="20" cy="20" r="12"/>' },
    { c: "#f97316", s: '<rect x="9" y="9" width="22" height="22" rx="2"/>' },
    { c: "#7c3aed", s: '<polygon points="20,6 34,32 6,32"/>' },
    { c: "#0d8a7a", s: '<polygon points="20,5 33,13 33,27 20,35 7,27 7,13"/>' },
    { c: "#2563eb", s: '<polygon points="20,5 36,20 20,35 4,20"/>' },
    { c: "#ca8a04", s: '<polygon points="20,4 24.7,15 36,16 27.5,23.5 30,35 20,29 10,35 12.5,23.5 4,16 15.3,15"/>' },
    { c: "#db2777", s: '<polygon points="14,6 26,6 26,14 34,14 34,26 26,26 26,34 14,34 14,26 6,26 6,14 14,14"/>' },
    { c: "#475569", s: '<polygon points="20,5 34,16 29,33 11,33 6,16"/>' }
  ];
  var CL_AG = { A: 2, B: 4, C: 6 }; // 항원 → 일치 클론 index

  function glyph(i, size) {
    var cl = CLONES[i];
    return '<svg viewBox="0 0 40 40" width="' + (size || 44) + '" height="' + (size || 44) + '"><g fill="' + cl.c + '" opacity=".92">' + cl.s + '</g></svg>';
  }

  function initClonal() {
    var root = $("[data-ab-clonal]");
    if (!root) return;
    var row = $(".clone-row", root), out = $(".clone-out", root), fb = $(".clonal-fb", root);
    var nextBtn = $("[data-act='next']", root);
    var agBtns = $$("[data-ag]", root);
    var ag = null, stage = 0;

    row.innerHTML = CLONES.map(function (c, i) {
      return '<div class="clone" data-i="' + i + '">' + glyph(i) + 'Clone ' + (i + 1) + '</div>';
    }).join("");
    var cards = $$(".clone", row);

    function cells(n, cls, label, color) {
      var s = "";
      for (var i = 0; i < n; i++) s += '<span class="cell ' + cls + '"><i style="background:' + color + '"></i>' + label + '</span>';
      return s;
    }

    function render() {
      var m = ag ? CL_AG[ag] : -1;
      cards.forEach(function (cd, i) {
        cd.classList.toggle("dim", stage > 0 && i !== m);
        cd.classList.toggle("pick", stage > 0 && i === m);
      });
      nextBtn.disabled = !ag || stage >= 3;
      if (!ag) { out.innerHTML = ""; fb.innerHTML = "항원을 하나 선택하면 일치하는 BCR을 가진 클론이 선택됩니다. 면역계는 항원이 오기 전에 이미 다양한 클론을 갖고 있습니다."; return; }
      var color = CLONES[m].c;
      if (stage === 0) { out.innerHTML = ""; fb.innerHTML = "<b>Antigen " + ag + "</b> 등장 — <b>다음 단계</b>를 눌러 진행하세요."; }
      if (stage === 1) {
        out.innerHTML = cells(1, "cell--b", "선택된 B세포", color);
        fb.innerHTML = "<b>① Clonal selection.</b> 항원과 결합할 수 있는 BCR을 가진 클론만 선택된다. 나머지 클론은 이 항원에 반응하지 않는다. (실제로는 BCR 결합 외에 적절한 활성화 신호, 보통 T 세포 도움이 필요하다.)";
      }
      if (stage === 2) {
        out.innerHTML = cells(6, "cell--b", "B세포", color);
        fb.innerHTML = "<b>② Clonal expansion.</b> 선택된 클론이 증식한다. 같은 BCR(같은 항원 인식 특성)을 가진 자손 세포가 늘어난다.";
      }
      if (stage === 3) {
        out.innerHTML = cells(3, "cell--p", "Plasma cell", color) + cells(2, "cell--m", "Memory B", color);
        fb.innerHTML = "<b>③ 분화.</b> Plasma cell은 같은 항원 인식 특성의 항체를 대량 분비하고, Memory B cell은 남아 같은 항원을 다시 만났을 때 더 빠르게 반응한다.";
      }
    }

    agBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        ag = b.getAttribute("data-ag"); stage = 1;
        agBtns.forEach(function (x) { x.classList.toggle("active", x === b); });
        render();
      });
    });
    nextBtn.addEventListener("click", function () { if (ag && stage < 3) { stage++; render(); } });
    $("[data-act='reset']", root).addEventListener("click", function () {
      ag = null; stage = 0; agBtns.forEach(function (x) { x.classList.remove("active"); }); render();
    });
    // 항원 버튼에 매칭 글리프 표시
    agBtns.forEach(function (b) {
      var k = b.getAttribute("data-ag");
      b.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;">' + glyph(CL_AG[k], 18) + 'Antigen ' + k + '</span>';
    });
    render();
  }

  /* =========================================================
     S03. IgG 구조 (SVG 생성)
     ========================================================= */
  var IGG_INFO = {
    heavy: {
      t: "Heavy chain (중쇄)",
      loc: "Y자 한 쌍의 긴 사슬. 팔 쪽에서 VH–CH1, 가운데 hinge, 줄기에서 CH2–CH3 도메인으로 이어진다. (그림에서 Fab 쪽은 파란색, Fc 쪽은 보라색)",
      fn: "항원 인식(VH)과 Fc 기능(CH2–CH3)을 한 사슬 안에 함께 가진다. 두 heavy chain이 hinge와 CH3 부위에서 서로 결합해 항체의 뼈대를 만든다.",
      dd: "IgG subclass(IgG1/2/4 등)는 주로 heavy chain constant region의 차이다. 항체의 isotype과 Fc 기능을 결정하는 서열 정보가 여기에 있다."
    },
    light: {
      t: "Light chain (경쇄)",
      loc: "각 Fab 팔의 바깥쪽. VL–CL 두 도메인으로 이루어지며 heavy chain의 VH–CH1과 짝을 이룬다.",
      fn: "VL이 VH와 함께 항원 결합 부위를 만든다. 즉 결합 특성은 heavy chain 하나가 아니라 VH–VL 쌍이 함께 정한다.",
      dd: "AI 모델에서 항체 서열은 보통 VH와 VL을 모두 입력한다. 한쪽 사슬만 보면 결합 특성을 잘못 해석할 수 있다."
    },
    fab: {
      t: "Fab (Fragment antigen-binding)",
      loc: "Y자의 두 팔. VH–CH1 + VL–CL 로 구성되며 두 개가 있다.",
      fn: "항원 인식을 담당한다. 한 IgG 분자는 두 개의 Fab를 가지므로 항원 결합 부위가 두 개(2가, bivalent)다.",
      dd: "Discovery와 affinity 최적화의 중심 영역이다. 서열 변화가 결합력뿐 아니라 안정성·응집·전하에도 영향을 준다."
    },
    fc: {
      t: "Fc (Fragment crystallizable)",
      loc: "Y자의 아래 줄기. 두 heavy chain의 CH2–CH3 도메인으로 이루어진다. CH2 사이에는 N-glycan이 위치한다.",
      fn: "Fc receptor와의 상호작용, 면역세포·보체 기능(effector function), FcRn에 의한 재활용과 반감기 조절에 관여한다.",
      dd: "Fc 영역은 항체의 effector function과 FcRn-mediated recycling에 관여하므로 치료 기전과 반감기를 설계할 때 중요하다."
    },
    site: {
      t: "Antigen-binding site (항원 결합 부위)",
      loc: "각 Fab 팔의 끝, VH와 VL이 맞닿는 곳. 한 항체에 두 개 있다.",
      fn: "항원의 특정 표면(epitope)과 직접 접촉해 결합한다. 이 부위의 아미노산 서열이 항체의 특이성과 친화도를 좌우한다.",
      dd: "항체 AI 설계의 핵심 대상이다. 상세 구조(CDR)는 L03에서 다룬다."
    }
  };

  function rect(x, y, w, h, fill, parts, label, extra) {
    return '<g class="part" data-parts="' + parts + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="7" fill="' + fill + '" stroke="#fff" stroke-width="1.5"' + (extra || "") + '/>' +
      (label ? '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 3.5) + '" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">' + label + '</text>' : '') + '</g>';
  }

  function buildIgg() {
    var H = "#2f5fd0", Hl = "#4d7be8", L = "#14a39a", Ll = "#33bdb3", FC = "#8b5cf6", HG = "#7f93c9";
    var s = '<svg class="ab-svg igg-svg" viewBox="30 36 300 316" role="img" aria-label="IgG 항체의 개념적 구조도">';

    // halos
    s += '<rect class="halo" data-halo="fc" x="140" y="208" width="80" height="112" rx="14"/>';
    [-1, 1].forEach(function (sd) {
      var px = sd < 0 ? 160 : 200;
      s += '<g class="halo" data-halo="fab" transform="translate(' + px + ',190) rotate(' + (sd * 35) + ')">' +
        '<rect x="' + (sd < 0 ? -52 : -16) + '" y="-124" width="68" height="124" rx="14" fill="none"/></g>';
    });

    // Fc stem
    s += rect(147, 214, 26, 48, FC, "heavy fc", "CH2") + rect(187, 214, 26, 48, FC, "heavy fc", "CH2");
    s += rect(152, 266, 26, 48, FC, "heavy fc", "CH3") + rect(182, 266, 26, 48, FC, "heavy fc", "CH3");
    s += '<g class="part" data-parts="fc"><circle cx="177" cy="238" r="4.2" fill="#f59e0b"/><circle cx="183" cy="238" r="4.2" fill="#f59e0b"/></g>';
    // hinge
    s += rect(154, 186, 12, 30, HG, "heavy", "") + rect(194, 186, 12, 30, HG, "heavy", "");
    s += '<g class="part" data-parts="heavy"><path d="M166 197 H194 M166 205 H194" stroke="#eab308" stroke-width="3" stroke-linecap="round"/></g>';

    // arms
    [-1, 1].forEach(function (sd) {
      var px = sd < 0 ? 160 : 200;
      var lx = sd < 0 ? -45 : 19;
      s += '<g transform="translate(' + px + ',192) rotate(' + (sd * 35) + ')">';
      s += rect(-13, -58, 26, 54, H, "heavy fab", "CH1");
      s += rect(-13, -114, 26, 54, Hl, "heavy fab", "VH");
      s += rect(lx, -58, 26, 54, L, "light fab", "CL");
      s += rect(lx, -114, 26, 54, Ll, "light fab", "VL");
      s += '<g class="part" data-parts="heavy light fab"><path d="M' + (sd * 13) + ' -12 H' + (sd * 19) + '" stroke="#eab308" stroke-width="3.5" stroke-linecap="round"/></g>';
      s += '<g class="part" data-parts="site fab"><ellipse cx="' + (sd * 16) + '" cy="-118" rx="15" ry="7" fill="#f97316" stroke="#fff" stroke-width="1.5"/></g>';
      s += '</g>';
    });

    // labels
    s += '<text class="lbl" x="40" y="66">Fab</text><text class="lbl" x="298" y="66">Fab</text>';
    s += '<text class="lbl" x="226" y="292">Fc</text>';
    s += '<text class="lbl" x="214" y="204">hinge</text>';
    s += '<text class="lbl" x="34" y="344" font-weight="500" fill="#6e7f99" font-size="10">개념도 · 도메인 배열과 사슬 연결을 단순화함</text>';
    s += '</svg>';
    return s;
  }

  function initIgg() {
    var root = $("[data-ab-igg]");
    if (!root) return;
    var host = $(".igg-svg-host", root), info = $(".igg-info", root);
    host.innerHTML = buildIgg();
    var svg = $(".igg-svg", host);
    var btns = $$("[data-part]", root);

    function show(k) {
      btns.forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-part") === k); });
      svg.classList.add("focus");
      $$(".part", svg).forEach(function (p) {
        p.classList.toggle("on", p.getAttribute("data-parts").split(" ").indexOf(k) > -1);
      });
      $$(".halo", svg).forEach(function (hh) {
        hh.classList.toggle("on", hh.getAttribute("data-halo") === k);
      });
      var d = IGG_INFO[k];
      info.innerHTML = '<h4>' + d.t + '</h4><dl>' +
        '<div><dt>위치</dt><dd>' + d.loc + '</dd></div>' +
        '<div><dt>주요 기능</dt><dd>' + d.fn + '</dd></div>' +
        '<div><dt>Drug discovery relevance</dt><dd>' + d.dd + '</dd></div></dl>';
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-part")); }); });
    $("[data-act='all']", root).addEventListener("click", function () {
      btns.forEach(function (b) { b.classList.remove("active"); });
      svg.classList.remove("focus");
      $$(".halo", svg).forEach(function (hh) { hh.classList.remove("on"); });
      info.innerHTML = '<h4>구조의 큰 그림</h4><p style="margin:0;font-size:14px;">위 버튼을 눌러 각 영역을 확인하세요. 이번 강의에서는 큰 그림만 다룹니다.</p>';
    });
    show("fc");
  }

  /* =========================================================
     S04. 작용 기전 카드 토글
     ========================================================= */
  function initMech() {
    $$(".mech").forEach(function (m) {
      var b = $(".mech__toggle", m);
      if (!b) return;
      b.addEventListener("click", function () {
        var open = m.classList.toggle("open");
        b.textContent = open ? "작동 원리 접기" : "작동 원리 보기";
      });
    });
  }

  /* =========================================================
     S05. 승인 항체 사례
     ========================================================= */
  var DRUGS = {
    ada: {
      name: "Adalimumab (Humira)",
      meta: [["Target", "TNF-α"], ["Modality", "Human monoclonal IgG1"], ["핵심 기전", "신호 차단 (Neutralization)"]],
      steps: [["Target", "TNF-α — 여러 염증성 질환에서 중요한 사이토카인"], ["Antibody Binding", "TNF-α에 결합"], ["Biological Effect", "TNF 수용체와의 상호작용을 방해 → 염증성 신호 억제"], ["Therapeutic Outcome", "염증성 질환의 질환 활동 조절"]],
      point: "핵심 개념: 항체가 표적세포를 직접 죽이지 않아도 치료 효과를 낼 수 있다."
    },
    tras: {
      name: "Trastuzumab (Herceptin)",
      meta: [["Target", "HER2"], ["Modality", "Humanized IgG1"], ["핵심 기전", "신호 조절 + 면역 매개 (ADCC)"]],
      steps: [["Target", "HER2 세포외 영역 — HER2 양성 암세포 표면"], ["Antibody Binding", "HER2 세포외 영역에 결합"], ["Biological Effect", "종양 성장 관련 신호에 영향 + Fc를 통한 ADCC 기여"], ["Therapeutic Outcome", "HER2 양성 암의 종양 성장 억제"]],
      point: "핵심 개념: 하나의 항체가 복수의 작용 기전(신호 조절 + Fc 기능)을 가질 수 있다."
    },
    pembro: {
      name: "Pembrolizumab (Keytruda)",
      meta: [["Target", "PD-1"], ["Modality", "Humanized IgG4"], ["핵심 기전", "Immune checkpoint blockade"]],
      steps: [["Target", "PD-1 — T세포에서 면역반응을 억제하는 신호에 관여"], ["Antibody Binding", "PD-1에 결합"], ["Biological Effect", "PD-L1 및 PD-L2와의 상호작용 차단"], ["Therapeutic Outcome", "일부 상황에서 T세포의 항종양 면역반응 회복"]],
      point: "핵심 개념: 암세포를 직접 공격하기보다 면역계의 억제 신호를 차단한다."
    }
  };

  function initDrugs() {
    var root = $("[data-ab-drugs]");
    if (!root) return;
    var btns = $$("[data-drug]", root), out = $(".drug-out", root);
    function show(k) {
      var d = DRUGS[k];
      btns.forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-drug") === k); });
      out.innerHTML =
        '<h4 style="margin:6px 0;color:var(--tc-dark);">' + d.name + '</h4>' +
        '<div class="drug-meta">' + d.meta.map(function (m) { return '<span><b>' + m[0] + '</b> ' + m[1] + '</span>'; }).join("") + '</div>' +
        '<div class="drug-steps">' + d.steps.map(function (s, i) { return '<div class="drug-step"><b>' + (i + 1) + '. ' + s[0] + '</b>' + s[1] + '</div>'; }).join("") + '</div>' +
        '<div class="ab-fb ab-fb--ok"><b>' + d.point + '</b></div>' +
        '<div class="ab-note">실제 환자에서의 치료 효과는 표적 발현, 질병 특성, 종양 미세환경 등 여러 조건에 의존한다.</div>';
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-drug")); }); });
    show("ada");
  }

  /* =========================================================
     S06. Monoclonal vs Polyclonal (SVG)
     ========================================================= */
  function miniAb(x, y, rot, color) {
    // (x,y) = 두 팔 끝의 중점. rot=0이면 팁이 위를 향한다.
    return '<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ')"><g transform="translate(0,21) scale(.62)">' +
      '<path d="M0 32 L0 0 M0 0 L-22 -34 M0 0 L22 -34" stroke="' + color + '" stroke-width="10" stroke-linecap="round" fill="none"/></g></g>';
  }

  function initMonoPoly() {
    var mono = $("[data-mp-mono]"), poly = $("[data-mp-poly]");
    if (!mono || !poly) return;
    // Monoclonal: 같은 항원 분자 3개의 동일한 epitope(위쪽 삼각 돌기)에 같은 색 항체
    var m = '<svg class="ab-svg" viewBox="0 0 300 230" role="img" aria-label="Monoclonal antibody: 동일 epitope에 동일 항체">';
    [55, 150, 245].forEach(function (cx) {
      m += '<g transform="translate(' + cx + ',160)"><rect x="-32" y="-26" width="64" height="52" rx="16" fill="#e8ecf6" stroke="#9aa7c4" stroke-width="2"/>' +
        '<polygon points="-9,-26 0,-37 9,-26" fill="#fde2c7" stroke="#f97316" stroke-width="2"/></g>';
      m += miniAb(cx, 116, 180, "#2f5fd0");
    });
    m += '</svg>';
    mono.innerHTML = m;

    // Polyclonal: 한 항원의 서로 다른 epitope 3곳에 서로 다른 색 항체
    var p = '<svg class="ab-svg" viewBox="0 0 300 230" role="img" aria-label="Polyclonal antibody: 서로 다른 epitope에 서로 다른 항체">';
    p += '<g transform="translate(150,135)"><ellipse rx="62" ry="46" fill="#e8ecf6" stroke="#9aa7c4" stroke-width="2"/>' +
      '<polygon points="-9,-44 0,-55 9,-44" fill="#fde2c7" stroke="#f97316" stroke-width="2"/>' +
      '<polygon points="-62,-8 -73,0 -62,8" fill="#fde2c7" stroke="#f97316" stroke-width="2"/>' +
      '<polygon points="62,-8 73,0 62,8" fill="#fde2c7" stroke="#f97316" stroke-width="2"/></g>';
    p += miniAb(150, 74, 180, "#e11d48");
    p += miniAb(71, 135, 90, "#0d8a7a");
    p += miniAb(229, 135, -90, "#ca8a04");
    p += '</svg>';
    poly.innerHTML = p;
  }

  /* =========================================================
     S08. AI 파이프라인
     ========================================================= */
  var PIPE = [
    { t: "Target Definition",
      i: "질환 생물학, 표적 발현 데이터, 표적 구조/서열, 원하는 작용 기전(차단·조절·면역 유도)",
      p: "표적의 어느 영역(domain, epitope)을 노릴지, 어떤 기전을 목표로 할지 우선순위화",
      v: "표적 발현 확인, 기능 분석, 표적 단백질 품질(발현·접힘) 확인",
      f: "표적 생물학 자체가 틀리면 이후 모든 단계가 의미를 잃는다. 표적 항원의 형태(재조합 vs 세포 표면)가 달라 epitope 접근성이 다를 수 있다." },
    { t: "Sequence Generation / Discovery",
      i: "기존 항체 서열 데이터, 면역·라이브러리 선택 결과, 생성 모델의 학습 서열",
      p: "새로운 항체 서열이나 변이 후보 제안, 서열 표현(embedding) 학습",
      v: "발현, 정제, 표적 결합 여부 확인",
      f: "그럴듯한 서열이 실제로 발현·접힘되지 않을 수 있다. 학습 데이터에 없던 항원에는 일반화가 약하다." },
    { t: "Structure & Binding Prediction",
      i: "항체 서열(VH/VL), 항원 구조 또는 서열",
      p: "항체 3D 구조 예측, 항원–항체 복합체 모델링, 가능한 epitope 추정",
      v: "X-ray/cryo-EM 구조, epitope mapping, 돌연변이 기반 확인",
      f: "복합체 구조 예측은 CDR 루프의 유연성과 결합 모드 때문에 불확실하다. 예측 신뢰도 점수가 높아도 결합 모드가 틀릴 수 있다." },
    { t: "Affinity / Specificity / Developability Assessment",
      i: "Antibody sequence + antigen information",
      p: "Relative binding score 또는 affinity estimate, 응집·용해도·점도·전하 위험 예측",
      v: "SPR/BLI 등의 결합 측정, polyspecificity assay, 응집·안정성 분석",
      f: "잘못된 복합체 구조, 데이터 편향, assay 조건 차이, 구조 유연성 등. 서열만으로 모든 표적에 대한 절대적인 결합 친화도를 신뢰성 있게 예측한다고 보기 어렵다." },
    { t: "Experimental Validation",
      i: "선별된 후보 항체(발현·정제된 시료)",
      p: "— (실험 단계: 예측을 검증하는 단계)",
      v: "결합 측정(SPR/BLI), 세포 기반 기능 분석, 안정성·응집 분석",
      f: "시료 품질 문제(응집, 순도), assay 조건, 표적 단백질 형태 차이로 결과 해석이 달라질 수 있다. 예측 불일치의 원인이 모델이 아니라 시료일 수도 있다." },
    { t: "Data Feedback & Model Improvement",
      i: "실험 결과(성공·실패 모두), assay 조건 메타데이터",
      p: "새 데이터로 모델 재학습·보정, 불확실성 추정 개선",
      v: "hold-out 항원/클론에 대한 재예측 성능",
      f: "실패 데이터 미기록, assay 간 배치 효과, 소량 데이터에 대한 과적합." },
    { t: "Candidate Optimization",
      i: "검증된 hit, 결합·기능·개발 가능성 데이터",
      p: "affinity, developability, 면역원성 위험을 함께 고려한 변이 제안과 후보 우선순위화",
      v: "개선 변이체의 결합·기능·물성 재측정",
      f: "한 특성을 개선하면 다른 특성이 악화되는 trade-off (예: 친화도↑ → 소수성·응집 위험↑)." }
  ];

  function initPipe() {
    var root = $("[data-ab-pipe]");
    if (!root) return;
    var list = $(".pipe", root), det = $(".pipe-detail-host", root);
    list.innerHTML = PIPE.map(function (s, i) {
      return '<button class="pipe__btn" data-i="' + i + '"><span class="n">' + (i + 1) + '</span>' + s.t + '</button>' +
        (i < PIPE.length - 1 ? '<div class="pipe__arrow">↓</div>' : '');
    }).join("") + '<div class="pipe__loop">↺ 단방향 파이프라인이 아니라 설계 → 실험 → 학습을 반복하는 순환 과정</div>';
    var btns = $$(".pipe__btn", list);
    function show(i) {
      btns.forEach(function (b, j) { b.classList.toggle("active", i === j); });
      var s = PIPE[i];
      det.innerHTML = '<div class="pipe-detail"><h4>' + (i + 1) + '. ' + s.t + '</h4><dl>' +
        '<div><dt>Input data</dt><dd>' + s.i + '</dd></div>' +
        '<div><dt>AI prediction</dt><dd>' + s.p + '</dd></div>' +
        '<div><dt>Experimental validation</dt><dd>' + s.v + '</dd></div>' +
        '<div><dt>Possible prediction failure</dt><dd class="fail">' + s.f + '</dd></div></dl></div>';
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { show(+b.getAttribute("data-i")); }); });
    show(3);
  }

  /* =========================================================
     S09. Candidate thinking
     ========================================================= */
  function initCandidate() {
    var root = $("[data-ab-cand]");
    if (!root) return;
    var btns = $$("[data-pick]", root), out = $(".cand-out", root);
    var crit = [
      ["KD (결합 친화도)", "A", "A 0.2 nM이 더 강함"],
      ["Aggregation risk", "B", "B가 낮음"],
      ["Expression", "B", "B가 높음"],
      ["Viscosity", "B", "B가 낮음"],
      ["Functional inhibition", "=", "둘 다 충분"]
    ];
    function critHtml() {
      return '<div class="cand-crit">' + crit.map(function (c) {
        return '<div class="cand-crit__row"><b>' + c[0] + '</b><div class="bar">' +
          '<span class="' + (c[1] === "A" ? "win" : (c[1] === "=" ? "tie" : "")) + '">A</span>' +
          '<span class="' + (c[1] === "B" ? "win" : (c[1] === "=" ? "tie" : "")) + '">B</span>' +
          '<span class="tie" style="flex:2;background:none;text-align:left;font-weight:500;">' + c[2] + '</span></div></div>';
      }).join("") + '</div>';
    }
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-pick");
        btns.forEach(function (x) { x.classList.toggle("picked", x === b); });
        var lead = k === "B"
          ? '<div class="ab-fb ab-fb--ok"><b>Candidate B를 선택하셨습니다.</b> 제시된 조건에서 합리적인 판단입니다. 기능적 억제 활성이 이미 충분하므로, 0.2 nM → 2 nM의 친화도 차이가 주는 이득보다 개발 가능성의 이점이 클 수 있습니다.</div>'
          : '<div class="ab-fb ab-fb--warn"><b>Candidate A를 선택하셨습니다.</b> “가장 강하게 결합하는 항체”라는 직관은 이해되지만, 두 항체의 기능 활성이 이미 충분하다면 추가 친화도의 이득은 제한적입니다. 반면 응집·점도·발현 문제는 제조와 제형 단계에서 비용과 위험으로 되돌아옵니다.</div>';
        out.innerHTML = lead +
          '<h4 style="margin:16px 0 6px;">특성별로 보면</h4>' + critHtml() +
          '<div class="ab-fb" style="margin-top:14px;">제시된 조건에서는 <b>Candidate B를 우선 진행하는 판단이 합리적일 수 있다.</b> Candidate A는 결합 친화도가 더 높지만, 응집 위험과 높은 점도, 낮은 발현량 때문에 제조 및 제형 개발에 어려움이 있을 수 있다. Candidate B는 결합 친화도가 상대적으로 낮더라도 기능적 억제 활성이 충분하며 개발 가능성 측면에서 유리하다.</div>' +
          '<div class="ab-fb ab-fb--warn" style="margin-top:10px;"><b>그래도 결정 전에 필요한 추가 데이터:</b> 세포 기반 효능, off-target binding, 안정성, 약동학, 안전성. (A의 응집 위험이 서열 수정으로 해결 가능한지 검토하는 것도 하나의 선택지입니다.)</div>' +
          '<div class="ab-key" style="margin-top:14px;">Best Binder ≠ Best Drug Candidate</div>';
      });
    });
  }

  /* =========================================================
     퀴즈 점수 (main.js의 MCQ 핸들러보다 먼저 capture)
     ========================================================= */
  function initQuizScore() {
    var board = $(".qscore");
    var lists = $$(".mcq");
    if (!board || !lists.length) return;
    var total = lists.length, done = 0, right = 0;
    document.addEventListener("click", function (e) {
      var li = e.target.closest && e.target.closest(".mcq li");
      if (!li) return;
      var list = li.parentElement;
      if (list.getAttribute("data-done")) return;
      done++;
      if (li.getAttribute("data-opt") === list.getAttribute("data-answer")) right++;
      if (done === total) {
        board.classList.add("show");
        board.textContent = "점수 " + right + " / " + total + (right === total ? " — 완벽합니다!" : " — 해설을 다시 읽어 보세요.");
      }
    }, true);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initRecognition();
    initClonal();
    initIgg();
    initMech();
    initDrugs();
    initMonoPoly();
    initPipe();
    initCandidate();
    initQuizScore();
  });
})();
