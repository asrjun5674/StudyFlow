/**
 * Curated study prompts and visual diagrams for immediate 1-click testing
 */

// SVG Diagram: Organic Chemistry SN2 Substitution Transition State
const chemistrySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="600" height="350">
  <rect width="100%" height="100%" fill="#0f172a" />
  <text x="30" y="45" fill="#38bdf8" font-size="20" font-family="sans-serif" font-weight="bold">Organic Chemistry: Bimolecular Nucleophilic Substitution (SN2)</text>
  <text x="30" y="75" fill="#94a3b8" font-size="14" font-family="sans-serif">Backside attack with pentacoordinate carbon transition state &amp; inversion of configuration</text>
  
  <!-- Reactants -->
  <circle cx="100" cy="180" r="24" fill="#ef4444" opacity="0.85" />
  <text x="90" y="186" fill="#ffffff" font-size="18" font-family="sans-serif" font-weight="bold">Nu⁻</text>
  
  <path d="M 130 180 Q 180 160 210 180" stroke="#f59e0b" stroke-width="3" fill="none" stroke-dasharray="6,4" />
  <polygon points="215,180 205,173 207,185" fill="#f59e0b" />

  <!-- Substrate -->
  <circle cx="260" cy="180" r="28" fill="#6366f1" />
  <text x="254" y="186" fill="#ffffff" font-size="20" font-family="sans-serif" font-weight="bold">C</text>
  <line x1="260" y1="152" x2="260" y2="105" stroke="#cbd5e1" stroke-width="4" />
  <text x="254" y="98" fill="#e2e8f0" font-size="16" font-family="sans-serif">R₁</text>
  <line x1="280" y1="198" x2="315" y2="230" stroke="#cbd5e1" stroke-width="4" />
  <text x="320" y="242" fill="#e2e8f0" font-size="16" font-family="sans-serif">R₂</text>
  <line x1="240" y1="198" x2="210" y2="230" stroke="#cbd5e1" stroke-width="4" />
  <text x="195" y="242" fill="#e2e8f0" font-size="16" font-family="sans-serif">H</text>

  <!-- Leaving group -->
  <line x1="288" y1="180" x2="340" y2="180" stroke="#cbd5e1" stroke-width="4" />
  <circle cx="365" cy="180" r="24" fill="#10b981" />
  <text x="355" y="186" fill="#ffffff" font-size="18" font-family="sans-serif" font-weight="bold">Br</text>

  <!-- Arrow -->
  <line x1="410" y1="180" x2="460" y2="180" stroke="#f8fafc" stroke-width="3" />
  <polygon points="465,180 455,174 455,186" fill="#f8fafc" />
  <text x="415" y="165" fill="#a5b4fc" font-size="12" font-family="sans-serif">Polar Aprotic</text>

  <!-- Product -->
  <circle cx="510" cy="180" r="28" fill="#6366f1" />
  <text x="504" y="186" fill="#ffffff" font-size="20" font-family="sans-serif" font-weight="bold">C</text>
  <circle cx="555" cy="180" r="20" fill="#ef4444" />
  <text x="546" y="185" fill="#ffffff" font-size="14" font-family="sans-serif">Nu</text>
  <text x="495" y="290" fill="#38bdf8" font-size="14" font-family="sans-serif">Walden Inversion: (R) ➔ (S)</text>
</svg>`;

// SVG Diagram: Calculus & Physics Damped Harmonic Oscillator
const mathPhysicsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="600" height="350">
  <rect width="100%" height="100%" fill="#0f172a" />
  <text x="30" y="45" fill="#818cf8" font-size="20" font-family="sans-serif" font-weight="bold">Physics &amp; ODEs: Underdamped Harmonic Oscillator</text>
  <text x="30" y="75" fill="#94a3b8" font-size="14" font-family="sans-serif">Equation: m(d²x/dt²) + b(dx/dt) + kx = 0 | Solution: x(t) = A·e^(-γt)·cos(ωt + φ)</text>
  
  <!-- Axes -->
  <line x1="60" y1="200" x2="560" y2="200" stroke="#475569" stroke-width="2" />
  <line x1="60" y1="90" x2="60" y2="310" stroke="#475569" stroke-width="2" />
  <text x="565" y="205" fill="#94a3b8" font-size="14" font-family="sans-serif">Time (t)</text>
  <text x="30" y="90" fill="#94a3b8" font-size="14" font-family="sans-serif">x(t)</text>

  <!-- Envelope curves -->
  <path d="M 60 100 Q 160 145 280 180 T 540 198" stroke="#f43f5e" stroke-width="2" fill="none" stroke-dasharray="5,5" />
  <path d="M 60 300 Q 160 255 280 220 T 540 202" stroke="#f43f5e" stroke-width="2" fill="none" stroke-dasharray="5,5" />
  <text x="290" y="160" fill="#f43f5e" font-size="13" font-family="sans-serif">e^(-γt) Envelope</text>

  <!-- Damped sine wave -->
  <path d="M 60 100 Q 110 95 140 200 T 220 200 T 300 200 T 380 200 T 460 200 T 540 200" 
        stroke="#38bdf8" stroke-width="3" fill="none" />
  
  <text x="70" y="325" fill="#22c55e" font-size="13" font-family="sans-serif">Condition: b² &lt; 4mk (Damping factor γ = b/2m &lt; ω₀)</text>
</svg>`;

// Convert SVG to Data URL for image upload simulation
export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export const SAMPLE_IMAGES = [
  {
    id: 'chem-sn2',
    title: 'Organic Chemistry: SN2 Reaction Mechanism & Inversion',
    subject: 'Chemistry',
    dataUrl: svgToDataUrl(chemistrySvg),
    description: 'Transition state, nucleophilic backside attack, and stereochemical inversion of chiral center.',
    recommendedPrompt: 'Explain the mechanism shown in this diagram. What solvent conditions favor this reaction, and why does optical inversion occur at the chiral carbon?',
  },
  {
    id: 'math-physics-ode',
    title: 'Physics & ODE: Underdamped Harmonic Oscillator',
    subject: 'Physics & Calculus',
    dataUrl: svgToDataUrl(mathPhysicsSvg),
    description: 'Second-order linear ODE with damping, characteristic roots, and exponential decay envelope.',
    recommendedPrompt: 'Derive the general solution from the differential equation m*x" + b*x\' + k*x = 0 for the underdamped case. Explain how the envelope curve is determined.',
  },
];

export const COMPLEX_THINKING_PROMPTS = [
  {
    title: 'Stokes\' Theorem & Maxwell Equations',
    subject: 'Multivariable Calculus & Electromagnetism',
    prompt: 'Provide a rigorous, step-by-step derivation connecting Stokes\' Theorem in vector calculus (∮ E·dr = ∬ (∇×E)·dA) to Faraday\'s Law of Induction. Discuss the physical significance of magnetic flux rate-of-change and why the negative sign (Lenz\'s law) enforces energy conservation.',
  },
  {
    title: 'Cauchy-Schwarz Inequality in Hilbert Space',
    subject: 'Pure Mathematics & Linear Algebra',
    prompt: 'Prove the Cauchy-Schwarz inequality |⟨u, v⟩|² ≤ ⟨u, u⟩·⟨v, v⟩ for arbitrary vectors in an inner product space over the complex field C. Then show under exactly what condition equality holds, and interpret its geometric meaning in quantum mechanics (Heisenberg uncertainty principle relation).',
  },
  {
    title: 'Michaelis-Menten Kinetics Derivation',
    subject: 'Biochemistry & Physical Chemistry',
    prompt: 'Derive the Michaelis-Menten rate equation v = (Vmax [S]) / (Km + [S]) starting from the enzyme-substrate mechanism E + S ⇌ ES → E + P. Explicitly state the Briggs-Haldane pseudo-steady-state assumption, explain the physical meaning of Km, and demonstrate what occurs when [S] ≪ Km vs [S] ≫ Km.',
  },
  {
    title: 'Quicksort Worst-Case vs Randomized Proof',
    subject: 'Computer Science & Algorithmics',
    prompt: 'Formally prove that standard deterministic Quicksort with first-element pivot has an O(n²) worst-case runtime using the recurrence relation T(n) = T(n-1) + O(n). Then, prove using indicator random variables that Randomized Quicksort guarantees an expected running time of O(n log n) regardless of initial array ordering.',
  },
];

export const TUTOR_PERSONAS = [
  {
    id: 'socratic',
    name: 'Socratic Tutor',
    tagline: 'Guiding through strategic inquiry',
    avatar: '🏛️',
    description: 'Never gives the answer away; asks probing questions to help you uncover the solution yourself.',
    instruction: 'You are StudyFlow Socratic Tutor. Your core principle: NEVER directly give the final answer or write complete homework solutions for the student. Instead, diagnose their current understanding, ask one or two focused guiding questions, provide gentle analogies or counterexamples, and guide them to reason through each step on their own. Be encouraging, warm, and intellectually stimulating.',
  },
  {
    id: 'exam_coach',
    name: 'Exam & Test Coach',
    tagline: 'High-yield exam prep & diagnostic feedback',
    avatar: '🎯',
    description: 'Drills practice questions, grades your reasoning against scoring rubrics, and targets blindspots.',
    instruction: 'You are StudyFlow Exam Coach. You train students for university midterms, AP exams, MCAT, and technical interviews. Present realistic exam questions, analyze student responses critically, grade against strict rubrics, pinpoint conceptual pitfalls, and share high-yield memory shortcuts and time management tactics.',
  },
  {
    id: 'feynman',
    name: 'Feynman Simplifier',
    tagline: 'Deep intuition through simple analogies',
    avatar: '💡',
    description: 'Breaks down complex, intimidating theories into intuitive everyday analogies without jargon.',
    instruction: 'You are StudyFlow Feynman Simplifier, inspired by Richard Feynman. Your goal is to explain the most complex scientific, mathematical, or humanities concepts in plain English using vivid everyday analogies, simple diagrams described in text, and zero academic gatekeeping. If a 10-year-old wouldn\'t understand the intuition, simplify it further while preserving factual correctness.',
  },
  {
    id: 'stem_proof',
    name: 'STEM & Proof Specialist',
    tagline: 'Formal mathematical rigor & proofs',
    avatar: '📐',
    description: 'Provides exact formal proofs, dimensional checks, algorithmic analysis, and LaTeX-style clarity.',
    instruction: 'You are StudyFlow STEM & Proof Specialist. You prioritize mathematical precision, formal theorems, clear lemmas, boundary case tests, and structured algorithmic analysis. Present equations cleanly with step-by-step logic and explicit justifications.',
  },
];
