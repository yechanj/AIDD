/* =========================================================
   AIDD 강의 메타데이터
   - 새 강의: 해당 track.lessons 배열에 항목 추가
   - status: "ready" | "soon"
   ========================================================= */
window.AIDD_TRACKS = [
  {
    id:    "a",
    label: "Track A · Theory",
    name:  "AI 신약개발 이론",
    ko:    "30강 도메인 지식 과정",
    icon:  "🧬",
    desc:  "AI 신약개발에 필요한 도메인 지식을 체계적으로 학습하는 30강 이론 과정입니다.",
    lessons: [
      {
        no: 1,
        href: "lessons/theory/01.html",
        title: "약물–단백질 결합의 기본",
        desc: "Binding은 왜 interaction 개수의 문제가 아니라 자유에너지의 문제인가? Kd, ΔG, desolvation, conformational ensemble 개념을 잡습니다.",
        tags: ["Kd", "ΔG", "Desolvation", "Protein dynamics", "Docking 한계"],
        status: "ready"
      },
      {
        no: 2,
        href: "lessons/theory/02.html",
        title: "비공유결합: H-bond, ionic, π-interaction, hydrophobic interaction",
        desc: "Binding free-energy를 구성하는 4가지 비공유결합의 원자 수준 기하학, 강도, 그리고 각 interaction의 숨겨진 비용.",
        tags: ["H-bond", "Electrostatics", "π interaction", "Hydrophobic effect"],
        status: "ready"
      },
      {
        no: 3,
        href: "lessons/theory/03.html",
        title: "pKa, ionization, logP, logD",
        desc: "pH에 따라 molecule이 바뀐다. Ionization이 binding, permeability, distribution에 미치는 영향.",
        tags: ["pKa", "Ionization", "logP", "logD", "pH effect"],
        status: "ready"
      },
      {
        no: 4,
        href: "lessons/theory/04.html",
        title: "입체화학과 conformational restriction",
        desc: "Chirality, conformational restriction, ring system이 binding에 미치는 영향. Bioactive conformation의 개념.",
        tags: ["Chirality", "Conformation", "Atropisomer", "Ring"],
        status: "ready"
      },
      {
        no: 5,
        href: "lessons/theory/05.html",
        title: "Functional group별 성질",
        desc: "흔한 functional group이 pKa, logP, H-bond capacity, metabolic liability에 미치는 영향.",
        tags: ["Functional group", "SAR", "Bioisostere"],
        status: "ready"
      },
      {
        no: 6,
        href: "lessons/theory/06.html",
        title: "Bioisostere",
        desc: "원자·작용기를 바꿔도 activity는 유지하면서 ADME·toxicity·IP를 개선하는 방법. Classical/non-classical bioisostere의 trade-off.",
        tags: ["Bioisostere", "Amide isostere", "Acid isostere", "Scaffold hopping"],
        status: "ready"
      },
      {
        no: 7,
        href: "lessons/theory/07.html",
        title: "Ligand efficiency / Lipophilic efficiency",
        desc: "Potency per heavy atom, potency per logP. 크고 기름진 molecule로 얻은 potency가 왜 비싼가.",
        tags: ["LE", "LLE", "LipE", "LELP", "Fragment"],
        status: "ready"
      },
      {
        no: 8,
        href: "lessons/theory/08.html",
        title: "SAR을 읽는 법",
        desc: "SAR table에서 신호와 noise를 구분하기. Matched molecular pair, activity cliff, additivity로 다음 analog를 결정합니다.",
        tags: ["SAR", "MMP", "Activity cliff", "Additivity"],
        status: "ready"
      },
      {
        no: 9,
        href: "lessons/theory/09.html",
        title: "Solubility",
        desc: "Kinetic vs thermodynamic solubility, crystal packing, pH-dependent solubility. Assay 결과와 oral absorption을 망치는 첫 번째 원인.",
        tags: ["Solubility", "Kinetic", "Thermodynamic", "Crystal packing"],
        status: "ready"
      },
      {
        no: 10,
        href: "lessons/theory/10.html",
        title: "Permeability",
        desc: "Passive diffusion과 efflux. PAMPA, Caco-2, MDCK 데이터를 읽는 법과 TPSA·HBD의 영향.",
        tags: ["Permeability", "PAMPA", "Caco-2", "Efflux", "TPSA"],
        status: "ready"
      },
      {
        no: 11,
        href: "lessons/theory/11.html",
        title: "Plasma protein binding",
        desc: "Fraction unbound와 free drug hypothesis. PPB가 높으면 정말 나쁜가?",
        tags: ["PPB", "fu", "Free drug", "Albumin"],
        status: "ready"
      },
      {
        no: 12,
        href: "lessons/theory/12.html",
        title: "Metabolism / CYP",
        desc: "CYP450 산화, phase II conjugation, metabolic soft spot. CYP inhibition과 DDI.",
        tags: ["CYP450", "Soft spot", "Phase II", "DDI"],
        status: "soon"
      },
      {
        no: 13,
        href: "lessons/theory/13.html",
        title: "Clearance와 half-life",
        desc: "CL, Vd, t½의 관계. Hepatic extraction과 in vitro–in vivo extrapolation.",
        tags: ["Clearance", "Half-life", "Vd", "IVIVE"],
        status: "soon"
      },
      {
        no: 14,
        href: "lessons/theory/14.html",
        title: "Transporter와 tissue distribution",
        desc: "P-gp, BCRP, OATP. Kp,uu와 BBB 투과. Total concentration ≠ target-site concentration.",
        tags: ["Transporter", "P-gp", "Kp,uu", "BBB"],
        status: "soon"
      },
      {
        no: 15,
        href: "lessons/theory/15.html",
        title: "Toxicity, hERG, reactive metabolite",
        desc: "hERG blockade의 구조적 원인, structural alert, reactive metabolite와 idiosyncratic toxicity.",
        tags: ["hERG", "Structural alert", "Reactive metabolite", "DILI"],
        status: "soon"
      },
      {
        no: 16,
        href: "lessons/theory/16.html",
        title: "Target validation",
        desc: "이 target을 건드리면 질병이 바뀌는가? Genetic evidence, tool compound, target engagement로 가설을 검증하는 법.",
        tags: ["Target validation", "Genetics", "Tool compound", "Target engagement"],
        status: "soon"
      },
      {
        no: 17,
        href: "lessons/theory/17.html",
        title: "Enzyme / receptor / PPI의 차이",
        desc: "Target class에 따라 binding site, assay, 성공 확률이 어떻게 달라지는가.",
        tags: ["Enzyme", "Receptor", "PPI", "Mechanism of action"],
        status: "soon"
      },
      {
        no: 18,
        href: "lessons/theory/18.html",
        title: "Protein structure와 binding pocket",
        desc: "X-ray, cryo-EM 구조를 읽는 법. Pocket의 shape, polarity, druggability 평가.",
        tags: ["Protein structure", "PDB", "Binding pocket", "Druggability"],
        status: "soon"
      },
      {
        no: 19,
        href: "lessons/theory/19.html",
        title: "Protein flexibility, water network, induced fit",
        desc: "Pocket water의 energetics, induced fit, cryptic pocket. 정적 구조 하나로 설명되지 않는 binding.",
        tags: ["Flexibility", "Water network", "Induced fit", "Cryptic pocket"],
        status: "soon"
      },
      {
        no: 20,
        href: "lessons/theory/20.html",
        title: "Mutation, resistance, allostery",
        desc: "Resistance mutation이 binding을 깨는 방식과 allosteric site를 이용한 우회 전략.",
        tags: ["Mutation", "Resistance", "Gatekeeper", "Allostery"],
        status: "soon"
      },
      {
        no: 21,
        href: "lessons/theory/21.html",
        title: "QSAR / classical ML",
        desc: "Descriptor와 fingerprint에서 RF·XGBoost까지. Classical ML이 여전히 강한 이유와 applicability domain.",
        tags: ["QSAR", "Fingerprint", "Random forest", "Applicability domain"],
        status: "soon"
      },
      {
        no: 22,
        href: "lessons/theory/22.html",
        title: "Molecular representation와 GNN",
        desc: "SMILES, fingerprint, graph, 3D — molecule을 숫자로 바꾸는 방법과 message passing GNN의 원리.",
        tags: ["SMILES", "Representation", "GNN", "MPNN"],
        status: "soon"
      },
      {
        no: 23,
        href: "lessons/theory/23.html",
        title: "Generative model",
        desc: "VAE, RL, diffusion 기반 molecule 생성. Property optimization과 synthesizability 문제.",
        tags: ["Generative", "VAE", "Diffusion", "Synthesizability"],
        status: "soon"
      },
      {
        no: 24,
        href: "lessons/theory/24.html",
        title: "Protein language model / structure prediction",
        desc: "ESM 계열 protein language model과 AlphaFold. pLDDT·PAE 해석과 drug discovery에서의 한계.",
        tags: ["Protein LM", "ESM", "AlphaFold", "pLDDT"],
        status: "soon"
      },
      {
        no: 25,
        href: "lessons/theory/25.html",
        title: "AI 모델 validation과 failure mode",
        desc: "Random split의 함정, data leakage, out-of-distribution. 모델 성능 숫자를 의심하는 법.",
        tags: ["Validation", "Scaffold split", "Data leakage", "OOD"],
        status: "soon"
      },
      {
        no: 26,
        href: "lessons/theory/26.html",
        title: "Hit → Lead → Candidate 전체 흐름",
        desc: "Hit identification부터 candidate nomination까지 각 단계의 질문과 통과 기준.",
        tags: ["Hit-to-lead", "Lead optimization", "Candidate", "Pipeline"],
        status: "soon"
      },
      {
        no: 27,
        href: "lessons/theory/27.html",
        title: "Multi-parameter optimization",
        desc: "Potency × selectivity × ADMET를 동시에 최적화하기. MPO score, desirability function, Pareto front.",
        tags: ["MPO", "Desirability", "Pareto", "Multi-objective"],
        status: "soon"
      },
      {
        no: 28,
        href: "lessons/theory/28.html",
        title: "Assay cascade와 experimental design",
        desc: "Primary → secondary → counter-screen. Assay window, 재현성, 다음 실험을 고르는 기준.",
        tags: ["Assay cascade", "Counter-screen", "Experimental design", "Reproducibility"],
        status: "soon"
      },
      {
        no: 29,
        href: "lessons/theory/29.html",
        title: "AI prediction vs wet-lab discrepancy",
        desc: "AI 예측과 실험 결과가 어긋날 때 — assay noise, domain shift, activity cliff 중 무엇이 원인인가.",
        tags: ["Failure analysis", "Assay noise", "Domain shift", "Activity cliff"],
        status: "soon"
      },
      {
        no: 30,
        href: "lessons/theory/30.html",
        title: "실제 drug discovery project를 종합적으로 평가하는 방법",
        desc: "30강 전체를 종합해 실제 project의 target, chemistry, ADME, data, risk를 평가하는 프레임.",
        tags: ["Project review", "Risk", "Go/No-go", "Synthesis"],
        status: "soon"
      }
    ]
  },
  {
    id:    "b",
    label: "Track B · Practice",
    name:  "실무 케이스 분석",
    ko:    "실제 신약개발 문제 연구",
    icon:  "⚗️",
    desc:  "실제 승인된 약물 또는 임상 단계 molecule의 개발 과정을 AI 관점에서 분석합니다.",
    lessons: [
      {
        no: 1,
        href: "lessons/case/01.html",
        title: "Gefitinib — 구조를 읽고, 분석 사이클과 다음 실험을 설계하기",
        desc: "승인된 EGFR inhibitor gefitinib의 분자 해부학, PDB 결합 구조 확인, 가상 analog 설계, AI endpoint 해석, failure case 분석 사이클을 실습합니다.",
        tags: ["Gefitinib", "EGFR", "Molecular anatomy", "Analog design", "RDKit", "PDB 4WKQ"],
        status: "ready"
      },
      {
        no: 2,
        href: "lessons/case/02.html",
        title: "Osimertinib — mutation-selective covalent inhibitor",
        desc: "EGFR T790M 내성 돌연변이를 선택적으로 표적하는 covalent inhibitor. Warhead 설계와 AI 활용.",
        tags: ["Osimertinib", "EGFR", "Covalent", "Mutation selectivity"],
        status: "soon"
      },
      {
        no: 3,
        href: "lessons/case/03.html",
        title: "Venetoclax — PPI 억제제 개발",
        desc: "BCL-2 protein-protein interaction 억제제. Fragment 기반 접근법과 1,000배 potency 향상의 여정.",
        tags: ["Venetoclax", "BCL-2", "PPI", "FBDD"],
        status: "soon"
      },
      {
        no: 4,
        href: "lessons/case/04.html",
        title: "Sotorasib — KRAS G12C의 첫 표적 치료",
        desc: "한때 'undruggable'했던 KRAS. Covalent approach와 cryptic pocket 발견. AI가 기여한 부분.",
        tags: ["Sotorasib", "KRAS G12C", "Cryptic pocket", "Undruggable"],
        status: "soon"
      },
      {
        no: 5,
        href: "lessons/case/05.html",
        title: "Nirmatrelvir — AI-assisted COVID protease inhibitor",
        desc: "팬데믹 대응 초고속 개발. Structure-based design과 AI scoring이 어디에 기여했는가.",
        tags: ["Nirmatrelvir", "SARS-CoV-2", "Mpro", "Rapid development"],
        status: "soon"
      },
      {
        no: 6,
        href: "lessons/case/06.html",
        title: "Semaglutide — GLP-1 peptide optimization",
        desc: "천연 GLP-1에서 weekly dosing peptide로. Albumin binding, fatty acid linkage의 rational design.",
        tags: ["Semaglutide", "GLP-1", "Peptide", "Half-life extension"],
        status: "soon"
      },
      {
        no: 7,
        href: "lessons/case/07.html",
        title: "halicin — AI-discovered antibiotic",
        desc: "Chexpert 모델로 발굴된 항생제. 어떤 데이터로 학습했고, 실제 mechanism은 무엇이며, generalizability 한계는.",
        tags: ["Halicin", "AI discovery", "Antibiotic", "GNN"],
        status: "soon"
      },
      {
        no: 8,
        href: "lessons/case/08.html",
        title: "Afatinib vs Erlotinib — selectivity pattern 분석",
        desc: "같은 EGFR을 표적하는 두 molecule. 왜 selectivity와 off-target profile이 다른가. AI SAR 모델의 해석.",
        tags: ["Afatinib", "Erlotinib", "EGFR", "Selectivity"],
        status: "soon"
      },
      {
        no: 9,
        href: "lessons/case/09.html",
        title: "Clinical trial failure 역분석 — 3가지 케이스",
        desc: "AI가 promising하다고 평가한 molecule이 임상에서 실패한 3가지 사례의 원인 분석.",
        tags: ["Clinical failure", "Failure analysis", "Translation gap"],
        status: "soon"
      },
      {
        no: 10,
        href: "lessons/case/10.html",
        title: "Fragment screening + AI expansion",
        desc: "FBDD와 AI generative model을 결합한 lead generation 워크플로우.",
        tags: ["Fragment", "FBDD", "AI expansion", "Generative"],
        status: "soon"
      },
      {
        no: 11,
        href: "lessons/case/11.html",
        title: "PROTAC 설계 — ternary complex를 AI로 모델링",
        desc: "Target protein + E3 ligase + linker의 ternary complex 모델링. AI-guided PROTAC optimization.",
        tags: ["PROTAC", "Ternary complex", "E3 ligase", "Linker"],
        status: "soon"
      },
      {
        no: 12,
        href: "lessons/case/12.html",
        title: "1년 실무 종합 — 나만의 분석 report 작성",
        desc: "Track B 12편의 케이스를 종합하여 자신만의 AI Drug Discovery 분석 프레임을 구축합니다.",
        tags: ["Synthesis", "Framework", "Report", "Capstone"],
        status: "soon"
      }
    ]
  }
];
