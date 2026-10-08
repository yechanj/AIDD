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
    desc:  "약물–단백질 결합 기초부터 AI/전산 방법론, 신약개발 파이프라인까지 체계적으로 학습합니다.",
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
        title: "비공유결합 — Hydrogen bond, ionic, π, hydrophobic",
        desc: "Binding free-energy를 구성하는 4가지 비공유결합의 원자 수준 기하학, 강도, 그리고 각 interaction의 숨겨진 비용.",
        tags: ["H-bond", "Electrostatics", "π interaction", "Hydrophobic effect"],
        status: "soon"
      },
      {
        no: 3,
        href: "lessons/theory/03.html",
        title: "pKa, ionization, logP / logD",
        desc: "pH에 따라 molecule이 바뀐다. Ionization이 binding, permeability, distribution에 미치는 영향.",
        tags: ["pKa", "Ionization", "logP", "logD", "pH effect"],
        status: "soon"
      },
      {
        no: 4,
        href: "lessons/theory/04.html",
        title: "Stereochemistry와 conformation",
        desc: "Chirality, conformational restriction, ring system이 binding에 미치는 영향. Bioactive conformation의 개념.",
        tags: ["Chirality", "Conformation", "Atropisomer", "Ring"],
        status: "soon"
      },
      {
        no: 5,
        href: "lessons/theory/05.html",
        title: "Functional group — 결합과 성질의 연결",
        desc: "흔한 functional group이 pKa, logP, H-bond capacity, metabolic liability에 미치는 영향.",
        tags: ["Functional group", "SAR", "Bioisostere"],
        status: "soon"
      },
      {
        no: 6,
        href: "lessons/theory/06.html",
        title: "Scaffold, pharmacophore, privileged structure",
        desc: "Drug-like scaffold의 개념, pharmacophore 모델링, privileged structure가 drug discovery에서 갖는 의미.",
        tags: ["Scaffold", "Pharmacophore", "Privileged structure"],
        status: "soon"
      },
      {
        no: 7,
        href: "lessons/theory/07.html",
        title: "Ligand efficiency — LE, LLE, LELP",
        desc: "Potency per atom, potency per logP. 작고 효율적인 molecule이 왜 유리한가.",
        tags: ["LE", "LLE", "LELP", "Fragment"],
        status: "soon"
      },
      {
        no: 8,
        href: "lessons/theory/08.html",
        title: "Rule of Five와 drug-likeness",
        desc: "Lipinski의 Ro5부터 현대 drug-likeness 개념까지. 왜 규칙은 rule이지 law가 아닌가.",
        tags: ["Ro5", "Drug-likeness", "Oral bioavailability"],
        status: "soon"
      },
      {
        no: 9,
        href: "lessons/theory/09.html",
        title: "ADMET 개론 — Absorption, Distribution",
        desc: "경구흡수의 결정요인 (permeability × solubility), distribution의 Vd, plasma protein binding.",
        tags: ["Absorption", "Bioavailability", "Vd", "PPB"],
        status: "soon"
      },
      {
        no: 10,
        href: "lessons/theory/10.html",
        title: "ADMET — Metabolism, Excretion, Toxicity",
        desc: "CYP450 산화, glucuronidation, renal/biliary excretion, reactive metabolite, hERG.",
        tags: ["CYP450", "Metabolism", "hERG", "Toxicity"],
        status: "soon"
      },
      {
        no: 11,
        href: "lessons/theory/11.html",
        title: "QSAR의 기초 — 구조와 활성의 관계",
        desc: "Hansch 방정식부터 MLR-QSAR까지. 2D descriptor란 무엇인가.",
        tags: ["QSAR", "Descriptor", "Hansch"],
        status: "soon"
      },
      {
        no: 12,
        href: "lessons/theory/12.html",
        title: "Molecular fingerprint과 유사도",
        desc: "ECFP, MACCS, RDKit Morgan fingerprint. Tanimoto similarity. Virtual screening의 기초.",
        tags: ["Fingerprint", "ECFP", "Tanimoto", "Similarity"],
        status: "soon"
      },
      {
        no: 13,
        href: "lessons/theory/13.html",
        title: "Docking — 원리, 한계, 사용법",
        desc: "Docking의 pose prediction과 scoring function. 앞서 배운 '다이야 방정식'로 docking의 한계를 정확히 이해합니다.",
        tags: ["Docking", "Scoring function", "AutoDock", "Glide"],
        status: "soon"
      },
      {
        no: 14,
        href: "lessons/theory/14.html",
        title: "Molecular dynamics — 단백질이 움직인다",
        desc: "MD simulation의 원리. Protein flexibility, water, entropy를 docking이 어떻게 근사하는가.",
        tags: ["MD", "Force field", "Sampling", "Ensemble"],
        status: "soon"
      },
      {
        no: 15,
        href: "lessons/theory/15.html",
        title: "FEP와 alchemical methods",
        desc: "Free energy perturbation, thermodynamic integration. ΔΔG 계산이 실제로 무엇을 하는가.",
        tags: ["FEP", "TI", "ΔΔG", "Binding free energy"],
        status: "soon"
      },
      {
        no: 16,
        href: "lessons/theory/16.html",
        title: "Protein structure prediction — AlphaFold2와 그 이후",
        desc: "AlphaFold2의 작동 원리, 신뢰도 (pLDDT), drug discovery에서의 활용과 한계.",
        tags: ["AlphaFold2", "Structure prediction", "pLDDT", "MSA"],
        status: "soon"
      },
      {
        no: 17,
        href: "lessons/theory/17.html",
        title: "Pocket detection과 druggability",
        desc: "FPocket, SiteMap. Pocket volume, hydrophobicity. Druggable target이란 무엇인가.",
        tags: ["Pocket detection", "Druggability", "FPocket"],
        status: "soon"
      },
      {
        no: 18,
        href: "lessons/theory/18.html",
        title: "Target engagement와 covalent inhibitor",
        desc: "Target engagement의 측정 (CETSA, SPR). Covalent binding의 설계 원리와 warhead.",
        tags: ["Target engagement", "CETSA", "Covalent", "Warhead"],
        status: "soon"
      },
      {
        no: 19,
        href: "lessons/theory/19.html",
        title: "Protein flexibility, water network, induced fit",
        desc: "Pocket water의 energetics. WaterMap. IFD의 원리. Entropy trapping.",
        tags: ["Water network", "WaterMap", "IFD", "Cryptic pocket"],
        status: "soon"
      },
      {
        no: 20,
        href: "lessons/theory/20.html",
        title: "Allosteric binding과 protein–protein interaction",
        desc: "Orthosteric vs allosteric. PPI 억제의 도전. Molecular glue와 PROTAC.",
        tags: ["Allosteric", "PPI", "PROTAC", "Molecular glue"],
        status: "soon"
      },
      {
        no: 21,
        href: "lessons/theory/21.html",
        title: "GNN — Graph Neural Network으로 molecule 학습",
        desc: "Molecule을 graph로 표현하는 방법. Message passing. MPNN, D-MPNN, ChemProp.",
        tags: ["GNN", "Graph", "MPNN", "ChemProp"],
        status: "soon"
      },
      {
        no: 22,
        href: "lessons/theory/22.html",
        title: "Generative model — VAE, GAN, flow-based",
        desc: "Latent space에서 molecule을 생성하는 방법. Property optimization. Chemical validity.",
        tags: ["VAE", "GAN", "Generative", "Latent space"],
        status: "soon"
      },
      {
        no: 23,
        href: "lessons/theory/23.html",
        title: "Language model — SMILES, SELFIES, molecular transformer",
        desc: "SMILES를 sequence로 취급. Transformer 기반 molecule generation과 property prediction.",
        tags: ["SMILES", "SELFIES", "Transformer", "ChemBERTa"],
        status: "soon"
      },
      {
        no: 24,
        href: "lessons/theory/24.html",
        title: "3D-aware model — EquiBind, DiffDock, SE(3)",
        desc: "SE(3)-equivariant network. 3D structure를 직접 다루는 모델들의 원리와 한계.",
        tags: ["SE(3)", "EquiBind", "DiffDock", "3D"],
        status: "soon"
      },
      {
        no: 25,
        href: "lessons/theory/25.html",
        title: "ADMET AI prediction — 무엇을 믿고 무엇을 의심할까",
        desc: "ADMET AI 모델의 종류, 벤치마크, applicability domain. 실제 data gap.",
        tags: ["ADMET AI", "SwissADME", "pkCSM", "Applicability domain"],
        status: "soon"
      },
      {
        no: 26,
        href: "lessons/theory/26.html",
        title: "Virtual screening 파이프라인 설계",
        desc: "Docking-based, ligand-based, ML-based screening의 조합. Funnel 설계와 hit rate.",
        tags: ["Virtual screening", "Funnel", "Hit rate", "Filter"],
        status: "soon"
      },
      {
        no: 27,
        href: "lessons/theory/27.html",
        title: "Lead optimization — SAR에서 candidate까지",
        desc: "SAR의 체계적 분석. matched molecular pair. Property-activity relationship. Optimization strategy.",
        tags: ["Lead optimization", "SAR", "MMP", "PAR"],
        status: "soon"
      },
      {
        no: 28,
        href: "lessons/theory/28.html",
        title: "Multi-parameter optimization와 Pareto front",
        desc: "Potency × selectivity × ADMET를 동시에 최적화하는 방법. Pareto front와 desirability function.",
        tags: ["MPO", "Pareto", "Desirability", "Multi-objective"],
        status: "soon"
      },
      {
        no: 29,
        href: "lessons/theory/29.html",
        title: "AI 예측 실패 분석 — 왜 wet-lab에서 틀렸는가",
        desc: "1강에서 시작한 'binding은 자유에너지 문제'라는 프레임으로 AI 예측 실패의 유형을 종합 분석합니다.",
        tags: ["Failure analysis", "AI limitation", "OOD", "Activity cliff"],
        status: "soon"
      },
      {
        no: 30,
        href: "lessons/theory/30.html",
        title: "AI Drug Discovery Translational Scientist의 역할",
        desc: "30강 전체를 종합. Wet-lab과 AI 팀 사이에서 번역가로 일하는 방법. 커리어 로드맵.",
        tags: ["Translational", "Career", "Integration", "Summary"],
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
        title: "Imatinib — kinase selectivity의 기원",
        desc: "BCR-ABL inhibitor imatinib이 어떻게 특정 conformational state를 인식해 selectivity를 달성했는가. DFG-out과 AI binding prediction의 도전.",
        tags: ["Imatinib", "ABL", "DFG-out", "Selectivity"],
        status: "soon"
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
