import { QuizQuestion } from '../types';

export interface LessonQuestionSet {
  topicMatch: string[];
  subjectId: string;
  lessonTitle: string;
  questions: QuizQuestion[];
}

export const CURATED_LESSON_QUESTIONS: LessonQuestionSet[] = [
  // 1. Mathematics: Trigonometry
  {
    topicMatch: ['trig', 'trigonometry', 'exercise 8.4', 'identity', 'identities', 'math'],
    subjectId: 'sub-math',
    lessonTitle: 'Trigonometry & Fundamental Identities',
    questions: [
      {
        id: 'trig-q1',
        question: 'Which of the following fundamental trigonometric identities is ALWAYS true for all valid angles θ?',
        options: [
          'sin²(θ) + cos²(θ) = 1',
          'sin²(θ) - cos²(θ) = 1',
          '1 + sin²(θ) = cos²(θ)',
          'tan²(θ) + cot²(θ) = 1',
        ],
        correctIndex: 0,
        explanation: 'sin²(θ) + cos²(θ) = 1 is the primary Pythagorean trigonometric identity derived directly from the unit circle.',
      },
      {
        id: 'trig-q2',
        question: 'If tan(θ) = 4/3, what is the value of sec²(θ)?',
        options: ['16/9', '25/9', '7/9', '9/16'],
        correctIndex: 1,
        explanation: 'Using the identity sec²(θ) = 1 + tan²(θ): 1 + (4/3)² = 1 + 16/9 = 25/9.',
      },
      {
        id: 'trig-q3',
        question: 'What is the value of sin(90° - θ)?',
        options: ['tan(θ)', 'cosec(θ)', 'cos(θ)', '-sin(θ)'],
        correctIndex: 2,
        explanation: 'By complementary angle relationships in right-angled triangles, sin(90° - θ) = cos(θ).',
      },
    ],
  },

  // 2. Science: Light & Ray Diagrams
  {
    topicMatch: ['ray', 'mirror', 'reflection', 'refraction', 'concave', 'convex', 'lens', 'light'],
    subjectId: 'sub-sci',
    lessonTitle: 'Light: Reflection & Ray Diagrams',
    questions: [
      {
        id: 'light-q1',
        question: 'When an object is placed between the Focus (F) and Pole (P) of a concave mirror, the image formed is:',
        options: [
          'Real, inverted and enlarged',
          'Virtual, erect and enlarged behind the mirror',
          'Real, inverted and diminished at C',
          'Virtual, erect and diminished',
        ],
        correctIndex: 1,
        explanation: 'Between F and P of a concave mirror is the unique case where reflected rays diverge, producing a virtual, erect, and magnified image behind the mirror.',
      },
      {
        id: 'light-q2',
        question: 'What is the correct Mirror Formula relating object distance u, image distance v, and focal length f?',
        options: [
          '1/f = 1/v - 1/u',
          '1/f = 1/v + 1/u',
          'f = u · v / (u - v)',
          '1/v = 1/f + 1/u',
        ],
        correctIndex: 1,
        explanation: 'The mirror formula is 1/f = 1/v + 1/u (with negative sign for lens formula 1/f = 1/v - 1/u).',
      },
      {
        id: 'light-q3',
        question: 'According to Cartesian sign conventions, the focal length of a concave mirror is always:',
        options: ['Positive', 'Negative', 'Zero', 'Infinite'],
        correctIndex: 1,
        explanation: 'Because the focus of a concave mirror lies in front of the reflecting surface (to the left of the pole), f is negative.',
      },
    ],
  },

  // 3. Chemistry / Biology: Life Processes & Respiration
  {
    topicMatch: ['respiration', 'krebs', 'life process', 'biology', 'aerobic', 'anaerobic', 'mitochondria'],
    subjectId: 'sub-chem',
    lessonTitle: 'Life Processes: Cellular Respiration',
    questions: [
      {
        id: 'bio-q1',
        question: 'In eukaryotic cells, where does the aerobic breakdown of pyruvate into carbon dioxide, water, and ATP occur?',
        options: ['Cytoplasm', 'Mitochondria', 'Ribosomes', 'Chloroplasts'],
        correctIndex: 1,
        explanation: 'Glycolysis takes place in the cytoplasm, but the Krebs cycle and oxidative phosphorylation occur inside the mitochondria.',
      },
      {
        id: 'bio-q2',
        question: 'During vigorous sprint exercise, lack of oxygen in human muscle cells converts pyruvate into:',
        options: ['Ethanol and CO₂', 'Lactic acid and energy', 'Glucose and water', 'Acetic acid'],
        correctIndex: 1,
        explanation: 'Under anaerobic conditions in muscles, pyruvate is converted into 3-carbon lactic acid, causing cramps and fatigue.',
      },
      {
        id: 'bio-q3',
        question: 'What is the universal high-energy molecule synthesized during cellular respiration?',
        options: ['DNA', 'ATP (Adenosine Triphosphate)', 'Hemoglobin', 'Cellulose'],
        correctIndex: 1,
        explanation: 'ATP is the energy currency of the cell, providing immediate power for cellular metabolic activities.',
      },
    ],
  },

  // 4. English: Madam Rides the Bus
  {
    topicMatch: ['madam', 'rides', 'bus', 'valli', 'english', 'literature'],
    subjectId: 'sub-eng',
    lessonTitle: 'English Literature: "Madam Rides the Bus"',
    questions: [
      {
        id: 'eng-q1',
        question: 'In the story "Madam Rides the Bus", what was eight-year-old Valli\'s deepest, overwhelming desire?',
        options: [
          'To buy toys from the town fair',
          'To ride on the bus that travelled between her village and the town',
          'To visit her relatives in the city',
          'To attend school in another district',
        ],
        correctIndex: 1,
        explanation: 'Valli watched the bus every hour, and riding it just once became her tiny, determined dream.',
      },
      {
        id: 'eng-q2',
        question: 'How much was the one-way bus fare that Valli meticulously saved by resisting peppermint candies and merry-go-rounds?',
        options: ['10 paise', '30 paise', '50 paise', '1 rupee'],
        correctIndex: 1,
        explanation: 'The one-way fare was thirty paise (sixty paise for both journeys), which Valli saved painstakingly.',
      },
      {
        id: 'eng-q3',
        question: 'What event on the return journey deeply saddened Valli and taught her about the harsh reality of mortality?',
        options: [
          'Losing her ticket money',
          'Seeing the playful young cow lying dead by the roadside',
          'Getting scolded by the conductor',
          'Missing her mother\'s afternoon nap window',
        ],
        correctIndex: 1,
        explanation: 'Seeing the same cheerful cow struck dead by a fast vehicle brought home the fragile boundary between life and death.',
      },
    ],
  },

  // 5. Physics: Electricity & Ohm's Law
  {
    topicMatch: ['ohm', 'electricity', 'current', 'resistance', 'circuit', 'voltage', 'joule'],
    subjectId: 'sub-sci',
    lessonTitle: 'Electricity & Ohm\'s Law',
    questions: [
      {
        id: 'elec-q1',
        question: 'According to Ohm\'s Law at constant temperature, the electric current (I) flowing through a metallic conductor is:',
        options: [
          'Inversely proportional to voltage V',
          'Directly proportional to potential difference V',
          'Independent of potential difference V',
          'Equal to V multiplied by resistance R',
        ],
        correctIndex: 1,
        explanation: 'V = I · R; current is directly proportional to potential difference across conductor ends.',
      },
      {
        id: 'elec-q2',
        question: 'If the length of a uniform metallic wire is doubled while keeping its area constant, its electrical resistance will:',
        options: ['Remain halved', 'Double', 'Quadruple', 'Remain unchanged'],
        correctIndex: 1,
        explanation: 'Resistance R is directly proportional to length (R ∝ L), so doubling length doubles resistance.',
      },
      {
        id: 'elec-q3',
        question: 'What is the SI unit of electrical resistivity (ρ)?',
        options: ['Ohm (Ω)', 'Ohm-meter (Ω·m)', 'Ampere (A)', 'Volt (V)'],
        correctIndex: 1,
        explanation: 'From R = ρ(L/A) => ρ = R·A/L = Ω · m² / m = Ω·m.',
      },
    ],
  },
];

export function getQuestionsForLesson(lessonTitle: string, subjectId?: string): { lessonTitle: string; questions: QuizQuestion[] } {
  const normalizedTitle = lessonTitle.toLowerCase();

  // Try to match specific topic
  for (const set of CURATED_LESSON_QUESTIONS) {
    if (set.topicMatch.some((t) => normalizedTitle.includes(t))) {
      return { lessonTitle: set.lessonTitle, questions: set.questions };
    }
  }

  // Fallback based on subjectId
  if (subjectId === 'sub-math') {
    return {
      lessonTitle: `${lessonTitle} (Mathematics Recall)`,
      questions: [
        {
          id: 'gen-math-1',
          question: `In this Mathematics lesson on "${lessonTitle}", what is key to verifying your final result?`,
          options: [
            'Plugging calculated values back into original equations',
            'Skipping intermediate algebraic simplification steps',
            'Assuming variables are always equal to 0',
            'Disregarding unit and sign conventions',
          ],
          correctIndex: 0,
          explanation: 'Substituting solved values into original expressions is the gold standard for verifying mathematical proofs and equations.',
        },
        {
          id: 'gen-math-2',
          question: 'What is the standard discriminant formula for determining the nature of roots in ax² + bx + c = 0?',
          options: ['D = b² - 4ac', 'D = b² + 4ac', 'D = 2a - 4bc', 'D = 4ac - b²'],
          correctIndex: 0,
          explanation: 'The discriminant D = b² - 4ac determines real (D > 0), equal (D = 0), or non-real roots (D < 0).',
        },
        {
          id: 'gen-math-3',
          question: 'Which problem-solving strategy maximizes recall speed during exams?',
          options: [
            'Identifying known formulas and sketching diagram coordinates first',
            'Rushing straight to calculations without reading constraints',
            'Memorizing specific numbers instead of algebraic rules',
            'Skipping rough column margin verification',
          ],
          correctIndex: 0,
          explanation: 'Deconstructing the problem and writing down formulas establishes a clean mental map before algebraic execution.',
        },
      ],
    };
  }

  if (subjectId === 'sub-sci' || subjectId === 'sub-chem') {
    return {
      lessonTitle: `${lessonTitle} (Science Concept Recall)`,
      questions: [
        {
          id: 'gen-sci-1',
          question: `What fundamental scientific principle underpins the reactions/mechanisms in "${lessonTitle}"?`,
          options: [
            'Law of Conservation of Mass and Energy',
            'Arbitrary change of physical constants',
            'Spontaneous disappearance of reactants',
            'Complete violation of thermodynamic balance',
          ],
          correctIndex: 0,
          explanation: 'Mass and energy are conserved in all standard physical and chemical transformations.',
        },
        {
          id: 'gen-sci-2',
          question: 'When analyzing scientific experiments or physical diagrams, what is the first critical step?',
          options: [
            'Identifying dependent, independent, and controlled variables',
            'Guessing the outcome without recording initial conditions',
            'Ignoring measurement units',
            'Changing multiple variables at once',
          ],
          correctIndex: 0,
          explanation: 'Isolating variables ensures valid, reproducible, and verifiable scientific conclusions.',
        },
        {
          id: 'gen-sci-3',
          question: 'Why are balanced chemical or physical equations essential in science?',
          options: [
            'To ensure the number of atoms of each element remains equal on both sides',
            'To arbitrarily increase product yield',
            'Because atoms can be created out of nothing',
            'They are purely aesthetic recommendations',
          ],
          correctIndex: 0,
          explanation: 'Balancing equations satisfies the Law of Conservation of Mass; atoms are neither created nor destroyed.',
        },
      ],
    };
  }

  // General Academic Recall Fallback
  return {
    lessonTitle: `${lessonTitle} (Active Recall Check)`,
    questions: [
      {
        id: 'gen-q1',
        question: `What is the core takeaway or central concept introduced in "${lessonTitle}"?`,
        options: [
          'Understanding foundational principles and applying them systematically',
          'Memorizing isolated keywords without connecting their relationships',
          'Ignoring the definitions of core terminology',
          'Only focusing on exam question patterns without conceptual comprehension',
        ],
        correctIndex: 0,
        explanation: 'Deep conceptual comprehension allows you to solve both textbook exercises and unexpected novel problem variations.',
      },
      {
        id: 'gen-q2',
        question: 'Which cognitive recall technique is scientifically proven to strengthen retention most effectively after completing a lesson?',
        options: [
          'Active retrieval testing and summarizing concepts in your own words',
          'Passive re-reading of the textbook 10 times',
          'Immediately moving on without reviewing key terms',
          'Cramming right before sleep without sleep rest',
        ],
        correctIndex: 0,
        explanation: 'Active recall and spaced repetition strengthen neural synaptic pathways significantly more than passive re-reading.',
      },
      {
        id: 'gen-q3',
        question: 'What is the recommended next action after marking this study session complete?',
        options: [
          'Take a 5-minute hydration and eye rest break, then celebrate your progress!',
          'Immediately start a stressful 3-hour marathon without resting',
          'Skip checking tomorrow\'s schedule',
          'Erase your revision notes',
        ],
        correctIndex: 0,
        explanation: 'Taking a 5-minute Pomodoro break allows memory consolidation and prevents mental fatigue.',
      },
    ],
  };
}
