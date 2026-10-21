# AIDD 교재 저작 가이드

약사를 위한 AI 신약개발 모바일 웹 교재의 저작·일관성 관리 문서입니다.
새 강의를 만들기 전에 반드시 이 문서를 확인하세요.

---

## 1. 파일 구조

```
AIDD/
├── index.html                    ← 허브 (두 트랙 카드 + 강의 목록)
├── DESIGN.md                     ← 이 파일
├── assets/
│   ├── fonts/
│   │   ├── SCDream5.otf          ← 본문 폰트 (weight 500)
│   │   ├── SCDream6.otf          ← 강조 폰트 (weight 700)
│   │   └── omyu pretty.ttf       ← 장식 폰트 (kicker, 번호, 요약 등)
│   ├── css/
│   │   └── styles.css            ← 모든 스타일 (2000+ 줄, 수정 주의)
│   ├── js/
│   │   └── main.js               ← 모든 인터랙션 (수정 시 기존 함수 유지)
│   └── data/
│       └── lessons.js            ← 강의 메타데이터 (새 강의 등록 여기)
└── lessons/
    ├── theory/                   ← Track A: theory/01.html … 30.html
    └── case/                     ← Track B: case/01.html … 12.html
```

---

## 2. CSS 디자인 토큰 (styles.css :root)

```css
/* 배경/텍스트 */
--bg: #f4f6fb;
--surface: #ffffff;
--surface-2: #edf0f7;
--ink: #141c2e;
--ink-soft: #3d4f6b;
--ink-faint: #6e7f99;
--line: #dce3ef;
--line-strong: #c2cede;

/* AIDD 브랜드 — 인디고 (Pharm #1f7ae0 파란색과 다름!) */
--brand: #5b3fd4;
--brand-dark: #3d28a8;
--brand-soft: #ede9ff;

/* Track A · Theory — 인디고/바이올렛 */
--ta: #5b3fd4;

/* Track B · Practice — 딥 틸 (ASP #12a594와 다름!) */
--tb: #0d8a7a;

/* 카드 색상 */
--card-concept: #5b3fd4;   /* indigo */
--card-chem: #c2410c;      /* deep orange */
--card-ai: #7c3aed;        /* violet */
--card-bio: #0d8a7a;       /* deep teal */
--card-mistake: #dc2626;   /* red */
--card-case: #b45309;      /* amber-brown */

/* 열역학/에너지 시각화 전용 */
--energy-gain: #2563eb;
--energy-cost: #dc2626;
--energy-net: #0d8a7a;

/* 상태 색상 */
--ok: #0d8a7a;
--warn: #d97706;
--danger: #dc2626;
```

---

## 3. 카드 6종 사용 기준

| 클래스 | 색상 | 언제 사용 |
|--------|------|-----------|
| `card--concept` | 인디고 | 개념 정의, 핵심 원리, 이론 정리 |
| `card--chem` | 딥오렌지 | 화학 구조, 합성, 반응 메커니즘 |
| `card--ai` | 바이올렛 | AI/ML 방법론, computational 도구 |
| `card--bio` | 딥틸 | 생물학적 맥락, 세포/생체 내 현상 |
| `card--mistake` | 빨간색 | 흔한 오해, 함정, 주의사항 |
| `card--case` | 앰버브라운 | 실제 약물 개발 사례, 임상 데이터 |

**카드 HTML 패턴:**
```html
<div class="card card--concept">
  <div class="card__label"><span class="dot"></span>레이블 텍스트</div>
  <p>내용</p>
</div>
```

---

## 4. 강의 HTML 보일러플레이트

Track A 강의 파일을 새로 만들 때 이 구조를 복사하세요.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>L[번호] · [제목] — AIDD</title>
  <link rel="stylesheet" href="../../assets/css/styles.css" />
</head>
<body>

  <!-- MOBILE TOP BAR -->
  <div class="topbar">
    <button class="hamburger" aria-label="목차 열기" aria-expanded="false"><span></span></button>
    <div class="topbar__title">L[번호] · [제목]</div>
  </div>
  <div class="scrim" aria-hidden="true"></div>

  <div class="app">
    <!-- SIDEBAR -->
    <aside class="sidebar" aria-label="강의 목차">
      <div class="sidebar__brand">
        <div class="sidebar__logo">L[번호]</div>
        <div class="sidebar__title">AIDD · Track A
          <small>[제목]</small>
        </div>
      </div>
      <nav>
        <ul class="toc">
          <li><a href="#q0"><span class="num">0</span> Opening Case</a></li>
          <!-- 섹션마다 항목 추가 -->
          <li><a href="#summary"><span class="num">S</span> 핵심 요약</a></li>
          <li><a href="#quiz"><span class="num">Q</span> 자기점검</a></li>
        </ul>
      </nav>
      <a class="sidebar__back" href="../../index.html">← 강의 목록으로</a>
    </aside>

    <!-- CONTENT -->
    <div class="content">
      <div class="wrap">

        <!-- HERO (Track A = lesson-hero, Track B = lesson-hero lesson-hero--b) -->
        <header class="lesson-hero">
          <div class="kicker">AIDD · Track A — Theory &nbsp;·&nbsp; Lecture [번호]</div>
          <h1>[제목]</h1>
          <p>[부제목]</p>
        </header>

        <!-- 섹션들 ... -->

        <!-- 핵심 요약 -->
        <div class="summary-card" id="summary">
          <h3>핵심 요약</h3>
          <ol>
            <li><b>포인트 1.</b> <span>설명</span></li>
            <!-- ... -->
          </ol>
        </div>

        <!-- 자기점검 -->
        <section id="quiz" class="section">
          <h2><span class="sec-no">Q</span> 자기점검</h2>
          <!-- qcard 컴포넌트 -->
        </section>

        <!-- 클로징 -->
        <div class="closing">
          <h3>다음 강의 예고</h3>
          <div class="big">[다음 강의 제목]</div>
          <a class="next-link" href="[다음].html">다음 강의 →</a>
        </div>

        <!-- BOTTOM NAV -->
        <nav class="bottomnav">
          <a href="[이전].html">← 이전</a>
          <button data-open-toc>☰ 목차</button>
          <a href="[다음].html">다음 →</a>
        </nav>

      </div>
    </div>
  </div>

  <script src="../../assets/js/main.js"></script>
</body>
</html>
```

---

## 5. 시각화 컴포넌트 카탈로그

모든 시각화는 `data-*` 속성으로 트리거됩니다. 외부 라이브러리 없음. SVG/CSS만 사용.

### V1 — Binding Free-energy Balance
```html
<div class="viz" data-balance>
  <div class="viz__title">제목</div>
  <div class="balance__wrap">
    <div class="balance__pans">
      <div class="balance__pan balance__pan--gain">...</div>
      <div class="balance__pan balance__pan--cost">...</div>
    </div>
    <div class="balance__beam-wrap">
      <div style="width:100%;height:6px;position:relative;">
        <div class="balance__beam" id="balanceBeam"></div>
      </div>
      <div class="balance__pivot"></div>
    </div>
    <div class="balance__state-btns">
      <button class="balance__btn active" data-state="unbound">Unbound</button>
      <button class="balance__btn" data-state="partial">결합 진행</button>
      <button class="balance__btn" data-state="bound">결합 완료</button>
    </div>
    <div class="balance__result"></div>
  </div>
</div>
```

### V2 — Kd Interactive Slider
```html
<div class="viz" data-kd-slider>
  <div class="kd__wrap">
    <div class="kd__slider-row">
      <input class="kd__range" type="range" min="0" max="6" step="0.05" value="2" />
    </div>
    <div class="kd__display">
      <div class="kd__bar-group">
        <div class="kd__bar-track"><div class="kd__bar-fill kd__bar-fill--bound"></div></div>
        <div class="kd__bar-track"><div class="kd__bar-fill kd__bar-fill--free"></div></div>
      </div>
      <div>
        <div class="kd__value"></div>
        <div class="kd__dg"></div>
      </div>
    </div>
  </div>
</div>
```

### V3 — Stepthrough (4단계)
```html
<div class="viz" data-hbond-steps>
  <div class="stepthrough">
    <div class="stepthrough__steps">
      <div class="stepthrough__step active" data-step="1">...</div>
      <div class="stepthrough__step" data-step="2">...</div>
    </div>
    <div class="stepthrough__nav">
      <button class="stepthrough__btn stepthrough__prev" disabled>← 이전</button>
      <span class="stepthrough__counter">1 / N</span>
      <button class="stepthrough__btn stepthrough__next">다음 →</button>
    </div>
  </div>
</div>
```

### V4 — Conformational Ensemble
```html
<div class="viz" data-conf-ensemble>
  <div class="ensemble__wrap">
    <div class="ensemble__cards">
      <div class="ensemble__card" data-conf="A">...</div>
      <div class="ensemble__card" data-conf="B">...</div>
      <div class="ensemble__card" data-conf="C">...</div>
    </div>
    <div class="ensemble__result"></div>
  </div>
</div>
```

### V5 — Three-Layer Pocket (SVG)
```html
<div class="viz" data-pocket-layers>
  <div class="pocket-layers__btns">
    <button class="pocket-layers__btn active" data-layer="geometry">Layer 1</button>
    <button class="pocket-layers__btn" data-layer="chemistry">Layer 2</button>
    <button class="pocket-layers__btn" data-layer="energetics">Layer 3</button>
  </div>
  <div class="pocket-layers__svg-wrap">
    <svg viewBox="0 0 200 180">
      <g data-layer="geometry">...</g>
      <g data-layer="chemistry" style="display:none;">...</g>
      <g data-layer="energetics" style="display:none;">...</g>
    </svg>
  </div>
  <div class="pocket-layers__legend"></div>
</div>
```

### V6 — DFG Slider
```html
<div class="viz" data-dfg-slider>
  <div class="dfg__wrap">
    <div class="dfg__state-label"></div>
    <div class="dfg__slider-row">
      <input class="dfg__range" type="range" min="0" max="100" value="0" />
    </div>
    <div class="dfg__info"></div>
  </div>
</div>
```

### V7 — Tier Ladder (3단 accordion)
```html
<div class="viz" data-tier-ladder>
  <div class="tier-progress">
    <div class="tier-progress__dot"></div>
    <!-- N개 -->
  </div>
  <div class="tier-ladder">
    <div class="tier-ladder__rung">
      <div class="tier-ladder__head">
        <div class="tier-ladder__head-left">
          <span class="tier-ladder__num">1</span>
          <div>
            <div class="tier-ladder__head-title">제목</div>
            <div class="tier-ladder__head-sub">부제</div>
          </div>
        </div>
        <span class="tier-ladder__chevron">▾</span>
      </div>
      <div class="tier-ladder__body">
        <div class="tier-ladder__body-inner">내용</div>
      </div>
    </div>
    <div class="tier-ladder__connect">→ 연결 설명</div>
    <!-- 반복 -->
  </div>
</div>
```

### V8 — Docking Reveal Flip Cards
```html
<div class="viz" data-docking-reveal>
  <div class="docking-reveal__grid">
    <div class="reveal-flip">
      <div class="reveal-flip__inner">
        <div class="reveal-flip__front">
          <div class="flip-ico">🔄</div>
          <div class="flip-label">앞면 레이블</div>
        </div>
        <div class="reveal-flip__back">
          <div class="flip-label">뒷면 레이블</div>
          <div class="flip-body">설명 텍스트</div>
        </div>
      </div>
    </div>
    <!-- 카드 반복 -->
  </div>
  <div class="docking-reveal__count">0 / N 확인됨</div>
</div>
```

### V9 — Failure Simulator (3 meters)
```html
<div class="viz" data-failure-sim>
  <div class="failure-sim__verdict"></div>
  <div class="failure-sim__meters">
    <div data-meter="gain">
      <div class="meter meter--gain">
        <span class="meter__label">레이블</span>
        <div class="meter__track"><div class="meter__fill" style="width:0%;"></div></div>
        <span class="meter__val">0%</span>
      </div>
      <input class="meter__range" type="range" min="0" max="100" value="0" />
    </div>
    <div data-meter="cost">
      <div class="meter meter--cost">...</div>
      <input class="meter__range" type="range" />
    </div>
    <div data-meter="strain">
      <div class="meter meter--strain">...</div>
      <input class="meter__range" type="range" />
    </div>
  </div>
  <button class="failure-sim__reset">초기화</button>
</div>
```

### V10 — Scientist's Thinking Flow (accordion)
```html
<div class="viz" data-scientist-flow>
  <div class="accord-flow__actions">
    <button class="accord-flow__toggle-all">모두 펼치기</button>
  </div>
  <div class="accord-flow">
    <div class="accord-flow__step">
      <div class="accord-flow__head">
        <span class="accord-flow__num">1</span>
        <span class="accord-flow__head-title">제목</span>
        <span class="accord-flow__chevron">▾</span>
      </div>
      <div class="accord-flow__body">
        <div class="accord-flow__body-inner">내용</div>
      </div>
    </div>
    <!-- 반복 -->
  </div>
</div>
```

---

## 6. lessons.js 강의 등록 방법

`assets/data/lessons.js`의 `window.AIDD_TRACKS` 배열에서 적절한 track을 찾아 lessons 배열에 항목을 추가합니다.

```js
{
  no: 2,
  title: "비공유결합: H-bond, ionic, π-interaction, hydrophobic interaction",
  desc: "Binding을 구성하는 실제 interaction 유형과 각각의 에너지 특성.",
  tags: ["H-bond", "Hydrophobic", "π-stack", "Desolvation"],
  status: "ready",            // "ready" 또는 "soon"
  href: "lessons/theory/02.html"
}
```

`status: "soon"` 상태면 허브에서 비활성화 카드로 표시됩니다.

---

## 7. Track A — 30강 목차

AI 신약개발에 필요한 도메인 지식을 체계적으로 학습하는 30강 이론 과정입니다.

| Part | 강의 | 제목 | 핵심 토픽 |
|------|------|------|-----------|
| **1. Medicinal Chemistry** | L01 | 약물–단백질 결합의 기본 | Kd, ΔG, Desolvation, Ensemble, Docking 한계 |
| | L02 | 비공유결합: H-bond, ionic, π-interaction, hydrophobic interaction | H-bond, Electrostatics, π interaction, Hydrophobic effect |
| | L03 | pKa, ionization, logP, logD | pKa, Ionization, logP, logD, pH effect |
| | L04 | 입체화학과 conformational restriction | Chirality, Conformation, Atropisomer, Ring |
| | L05 | Functional group별 성질 | pKa/logP/H-bond 영향, Metabolic liability |
| | L06 | Bioisostere | Classical/non-classical, Amide·acid isostere, Scaffold hopping |
| | L07 | Ligand efficiency / Lipophilic efficiency | LE, LLE(LipE), LELP, Fragment |
| | L08 | SAR을 읽는 법 | SAR table, MMP, Activity cliff, Additivity |
| **2. Drug-like Property & ADME** | L09 | Solubility | Kinetic vs thermodynamic, Crystal packing, pH-solubility |
| | L10 | Permeability | Passive diffusion, PAMPA/Caco-2, Efflux, TPSA/HBD |
| | L11 | Plasma protein binding | fu, Free drug hypothesis, Albumin/AGP |
| | L12 | Metabolism / CYP | CYP3A4/2D6, Soft spot, Phase II, DDI/TDI |
| | L13 | Clearance와 half-life | CL, Vd, t½, Hepatic extraction, IVIVE |
| | L14 | Transporter와 tissue distribution | P-gp, BCRP, OATP, Kp,uu, BBB |
| | L15 | Toxicity, hERG, reactive metabolite | hERG, Structural alert, GSH adduct, DILI |
| **3. Target & Structural Biology** | L16 | Target validation | Genetic evidence, Tool compound, Target engagement |
| | L17 | Enzyme / receptor / PPI의 차이 | Enzyme kinetics, Agonist/antagonist, PPI hot spot |
| | L18 | Protein structure와 binding pocket | X-ray/cryo-EM, Pocket detection, Druggability |
| | L19 | Protein flexibility, water network, induced fit | Water network, WaterMap, IFD, Cryptic pocket |
| | L20 | Mutation, resistance, allostery | Gatekeeper, Resistance mutation, Allosteric site |
| **4. AI Drug Discovery** | L21 | QSAR / classical ML | Descriptor, Fingerprint, RF/XGBoost, Applicability domain |
| | L22 | Molecular representation와 GNN | SMILES/SELFIES, Graph, MPNN, 3D representation |
| | L23 | Generative model | VAE, RL, Diffusion, Synthesizability |
| | L24 | Protein language model / structure prediction | ESM, AlphaFold, pLDDT/PAE, Co-folding |
| | L25 | AI 모델 validation과 failure mode | Scaffold split, Data leakage, OOD, Uncertainty |
| **5. Translational Drug Discovery** | L26 | Hit → Lead → Candidate 전체 흐름 | Hit-to-lead, Lead optimization, Candidate criteria |
| | L27 | Multi-parameter optimization | MPO score, Desirability, Pareto front |
| | L28 | Assay cascade와 experimental design | Primary/secondary assay, Counter-screen, Assay window |
| | L29 | AI prediction vs wet-lab discrepancy | Assay noise, Domain shift, Activity cliff, 원인 분석 |
| | L30 | 실제 drug discovery project를 종합적으로 평가하는 방법 | Project review, Risk, Go/No-go, 30강 종합 |

---

## 8. Track B — 케이스 목록 (~12편)

| 케이스 | 제목 | 타깃 | 포인트 |
|--------|------|------|--------|
| C01 | Imatinib 개발사 | BCR-ABL | DFG-out selectivity, ADMET |
| C02 | Osimertinib (3세대 EGFR) | EGFR T790M | Covalent warhead, resistance |
| C03 | Venetoclax | BCL-2 | Fragment-based, BH3 mimetic |
| C04 | Sotorasib — KRAS G12C | KRAS | Covalent, undruggable target |
| C05 | ARV-110 (PROTAC) | AR | Ternary complex, linker design |
| C06 | Nirmatrelvir (Paxlovid) | SARS-CoV-2 3CLpro | Rapid response, covalent inhibitor |
| C07 | Larotrectinib (TRK) | TRK A/B/C | Pan-kinase, basket trial |
| C08 | Alpelisib | PI3Kα | Isoform selectivity, resistance |
| C09 | Ribociclib | CDK4/6 | Cell cycle, combination therapy |
| C10 | AI 발견 케이스 (Insilico) | CDK20 | AI de novo → clinical |
| C11 | AI 발견 케이스 (Recursion) | RB1 pathway | Phenotypic AI + structure |
| C12 | 아직 미정 — TBD | — | — |

---

## 9. 강의 품질 체크리스트

강의 파일 완성 전 확인:

- [ ] 모바일 뷰포트 (360px–430px)에서 레이아웃 깨짐 없는가
- [ ] 사이드바 TOC가 모든 `id` 섹션을 커버하는가
- [ ] 모든 `data-*` 시각화가 인터랙션 동작하는가
- [ ] 카드 6종 색상이 의미에 맞게 사용되었는가 (`card--mistake`로 단순 설명 금지)
- [ ] 수식에 `.eq` 클래스 사용했는가 (plain text로 수식 작성 금지)
- [ ] 자기점검 문제 최소 3개 이상인가
- [ ] `.summary-card`에 5개 이하 핵심 요약이 있는가
- [ ] `.closing` 섹션에 다음 강의 예고가 있는가
- [ ] `lessons.js`에 해당 강의가 `status: "ready"`로 등록되었는가
- [ ] `</body>` 바로 위에 `<script src="../../assets/js/main.js">` 로드되었는가

---

## 10. 사용 금지 색상 (Pharm/ASP와 혼용 방지)

다음 색상은 AIDD에서 절대 사용하지 마세요:

| 금지 색상 | 사용 중인 프로젝트 | 이유 |
|-----------|-------------------|------|
| `#1f7ae0` | Pharm (파란색) | 브랜드 충돌 |
| `#1565c0` | Pharm (진한 파란색) | 브랜드 충돌 |
| `#12a594` | ASP (틸) | 브랜드 충돌 |
| `#0f766e` | ASP (진한 틸) | 브랜드 충돌 |

AIDD 전용:
- Brand: `#5b3fd4` (인디고)
- Track B: `#0d8a7a` (딥틸, ASP와 충분히 다름)

---

## 11. CSS custom property 빠른 참조

이 중 `styles.css` 외부(개별 강의 HTML `<style>` 블록)에서 직접 쓸 일은 없습니다.
그러나 inline style 사용 시 참조:

```
색상:   var(--brand), var(--ta), var(--tb)
카드:   var(--card-concept/chem/ai/bio/mistake/case)
에너지: var(--energy-gain), var(--energy-cost), var(--energy-net)
상태:   var(--ok), var(--warn), var(--danger)
폰트:   var(--font-body), var(--font-cute), var(--font-mono)
```
