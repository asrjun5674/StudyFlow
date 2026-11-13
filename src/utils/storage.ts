/**
 * Persistent Storage & Demo Seed Data for StudyFlow
 * Saves all user actions, tasks, notes, alarms, and settings locally.
 */

import {
  PlannerTask,
  Subject,
  Note,
  Flashcard,
  SmartAlarm,
  MoodLog,
  FocusRecord,
  StudentProfile,
  ThemeType,
  ColorMode,
  WallpaperType,
  FormulaItem,
  DictionaryItem,
  PlanTier,
  ParentContactConfig,
  UpiPaymentReceipt,
  ParentReportRecord,
  LocalAuthUser,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'studyflow_profile',
  THEME: 'studyflow_theme',
  COLOR_MODE: 'studyflow_color_mode',
  WALLPAPER: 'studyflow_wallpaper',
  TASKS: 'studyflow_tasks',
  SUBJECTS: 'studyflow_subjects',
  NOTES: 'studyflow_notes',
  FLASHCARDS: 'studyflow_flashcards',
  ALARMS: 'studyflow_alarms',
  MOODS: 'studyflow_moods',
  FOCUS: 'studyflow_focus',
  PLAN_TIER: 'studyflow_plan_tier',
  PARENT_CONTACT: 'studyflow_parent_contact',
  UPI_RECEIPTS: 'studyflow_upi_receipts',
  PARENT_REPORTS: 'studyflow_parent_reports',
  GUEST_MODE: 'studyflow_guest_mode',
  USERNAME_MAP: 'studyflow_username_map',
  LOCAL_AUTH_SESSION: 'studyflow_local_auth_session',
  PRO_FREE_PROMO_APPLIED: 'studyflow_free_pro_ultra_v1',
};

// Initial Seed Data
export const INITIAL_PROFILE: StudentProfile = {
  name: 'Aarav',
  grade: 'Class 10 - CBSE',
  school: 'Greenwood High School',
  avatar: '🌱',
  dailyGoalMinutes: 90,
  streakDays: 7,
  lastActiveDate: new Date().toISOString().split('T')[0],
  language: 'en',
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-math',
    name: 'Mathematics',
    code: 'MATH-10',
    color: '#10b981', // Mint Green
    icon: '📐',
    teacher: 'Mrs. Nandhini',
    room: 'Room 204',
    chapters: [
      { id: 'ch-m1', title: 'Real Numbers & Polynomials', completed: true, notesCount: 3 },
      { id: 'ch-m2', title: 'Quadratic Equations & AP', completed: true, notesCount: 4 },
      { id: 'ch-m3', title: 'Triangles & Coordinate Geometry', completed: false, notesCount: 2 },
      { id: 'ch-m4', title: 'Introduction to Trigonometry', completed: false, notesCount: 5 },
    ],
  },
  {
    id: 'sub-sci',
    name: 'Science & Physics',
    code: 'SCI-PHY',
    color: '#0ea5e9', // Sky Blue
    icon: '⚡',
    teacher: 'Dr. Ramesh',
    room: 'Lab 1',
    chapters: [
      { id: 'ch-s1', title: 'Light: Reflection & Refraction', completed: true, notesCount: 4 },
      { id: 'ch-s2', title: 'Human Eye & Colourful World', completed: true, notesCount: 2 },
      { id: 'ch-s3', title: 'Electricity & Circuits', completed: false, notesCount: 3 },
      { id: 'ch-s4', title: 'Magnetic Effects of Current', completed: false, notesCount: 1 },
    ],
  },
  {
    id: 'sub-chem',
    name: 'Chemistry & Biology',
    code: 'SCI-BIO',
    color: '#f97316', // Peach / Coral
    icon: '🧪',
    teacher: 'Mr. Sundar',
    room: 'Bio Lab',
    chapters: [
      { id: 'ch-c1', title: 'Chemical Reactions & Equations', completed: true, notesCount: 3 },
      { id: 'ch-c2', title: 'Acids, Bases and Salts', completed: false, notesCount: 3 },
      { id: 'ch-c3', title: 'Life Processes (Nutrition & Respiration)', completed: true, notesCount: 4 },
      { id: 'ch-c4', title: 'Control and Coordination', completed: false, notesCount: 2 },
    ],
  },
  {
    id: 'sub-eng',
    name: 'English Language & Lit',
    code: 'ENG-10',
    color: '#a855f7', // Lavender
    icon: '📖',
    teacher: 'Ms. Clara',
    room: 'Room 102',
    chapters: [
      { id: 'ch-e1', title: 'A Letter to God & Nelson Mandela', completed: true, notesCount: 2 },
      { id: 'ch-e2', title: 'Poetry: Fire and Ice, A Tiger in the Zoo', completed: true, notesCount: 3 },
      { id: 'ch-e3', title: 'Grammar: Modals & Reported Speech', completed: false, notesCount: 2 },
    ],
  },
  {
    id: 'sub-soc',
    name: 'Social Science',
    code: 'SOC-10',
    color: '#f59e0b', // Amber / Sunset
    icon: '🌍',
    teacher: 'Mr. Karthik',
    room: 'Room 305',
    chapters: [
      { id: 'ch-so1', title: 'Rise of Nationalism in Europe', completed: true, notesCount: 4 },
      { id: 'ch-so2', title: 'Nationalism in India', completed: false, notesCount: 3 },
      { id: 'ch-so3', title: 'Resources and Development', completed: true, notesCount: 2 },
    ],
  },
];

const today = new Date().toISOString().split('T')[0];

export const INITIAL_TASKS: PlannerTask[] = [
  {
    id: 'task-1',
    title: 'Solve Trigonometry Exercise 8.4 (Q1 to Q10)',
    subjectId: 'sub-math',
    type: 'homework',
    date: today,
    time: '16:30',
    durationMinutes: 45,
    priority: 'high',
    completed: true,
    notes: 'Focus on trigonometric identities and algebraic substitutions.',
  },
  {
    id: 'task-2',
    title: 'Draw and label Ray Diagrams for Concave Mirrors',
    subjectId: 'sub-sci',
    type: 'assignment',
    date: today,
    time: '17:30',
    durationMinutes: 30,
    priority: 'medium',
    completed: false,
    notes: 'Remember sign conventions (Cartesian coordinates).',
  },
  {
    id: 'task-3',
    title: 'Revise Life Processes: Respiration & Krebs Cycle',
    subjectId: 'sub-chem',
    type: 'revision',
    date: today,
    time: '19:00',
    durationMinutes: 40,
    priority: 'high',
    completed: false,
    notes: 'Compare aerobic vs anaerobic respiration pathways.',
  },
  {
    id: 'task-4',
    title: 'Mathematics Midterm Examination',
    subjectId: 'sub-math',
    type: 'exam',
    date: '2026-11-18',
    time: '09:00',
    durationMinutes: 180,
    priority: 'high',
    completed: false,
    notes: 'Comprehensive exam covering Chapters 1 to 8.',
  },
  {
    id: 'task-5',
    title: 'Science Board Pre-Board Practical Assessment',
    subjectId: 'sub-sci',
    type: 'exam',
    date: '2026-11-25',
    time: '10:00',
    durationMinutes: 120,
    priority: 'high',
    completed: false,
    notes: 'Ohm\'s Law verification and focal length experiment.',
  },
  {
    id: 'task-6',
    title: 'Read & Annotate "Madam Rides the Bus"',
    subjectId: 'sub-eng',
    type: 'homework',
    date: today,
    time: '20:15',
    durationMinutes: 25,
    priority: 'low',
    completed: true,
    notes: 'Highlight themes of curiosity and innocence.',
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Trigonometric Identities Quick Reference',
    subjectId: 'sub-math',
    content: `# Trigonometric Fundamental Identities\n\n- sin²(θ) + cos²(θ) = 1\n- 1 + tan²(θ) = sec²(θ)\n- 1 + cot²(θ) = cosec²(θ)\n\n### Ratio Relationships\n- tan(θ) = sin(θ) / cos(θ)\n- cot(θ) = cos(θ) / sin(θ)\n\n### Strategy for Proofs:\n1. Convert all terms to sin(θ) and cos(θ) first.\n2. Look for common denominators and conjugate multiplication.`,
    tags: ['Formula', 'Math', 'Identities'],
    updatedAt: today,
    isPinned: true,
  },
  {
    id: 'note-2',
    title: 'Ohm\'s Law & Resistance Factors',
    subjectId: 'sub-sci',
    content: `# Ohm's Law\nAt constant temperature, potential difference V is directly proportional to current I.\n**V = I · R**\n\n### Factors affecting Resistance (R):\n1. Length (L): R ∝ L\n2. Cross-sectional Area (A): R ∝ 1/A\n3. Material Resistivity (ρ): R = ρ(L/A)\n4. Temperature: Increases with temperature for metallic conductors.`,
    tags: ['Physics', 'Electricity'],
    updatedAt: today,
    isPinned: true,
  },
  {
    id: 'note-3',
    title: 'Acids & Bases: Important Salt Formations',
    subjectId: 'sub-chem',
    content: `# Common Salts & Chemical Formulas\n- **Baking Soda:** NaHCO₃ (Sodium Hydrogen Carbonate)\n- **Washing Soda:** Na₂CO₃ · 10H₂O\n- **Bleaching Powder:** CaOCl₂ (Calcium Oxychloride)\n- **Plaster of Paris:** CaSO₄ · ½H₂O\n\n*Note:* Heating Gypsum at 373K produces POP.`,
    tags: ['Chemistry', 'Salts'],
    updatedAt: today,
  },
];

export const INITIAL_ALARMS: SmartAlarm[] = [
  {
    id: 'alarm-1',
    title: 'Morning Energizer & Wakeup',
    time: '06:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    type: 'wakeup',
    enabled: true,
    label: 'Drink a glass of warm water & stretch!',
  },
  {
    id: 'alarm-2',
    title: 'Afternoon Deep Focus Session',
    time: '16:30',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    type: 'study',
    enabled: true,
    label: 'Time for Mathematics & Science homework',
  },
  {
    id: 'alarm-3',
    title: 'Hydration & Posture Break',
    time: '18:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    type: 'homework',
    enabled: true,
    label: 'Stand up, hydrate, and rest your eyes',
  },
  {
    id: 'alarm-4',
    title: 'Night Review & Wind Down',
    time: '22:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    type: 'bedtime',
    enabled: true,
    label: 'Review tomorrow\'s timetable & sleep peacefully',
  },
];

export const INITIAL_MOODS: MoodLog[] = [
  { id: 'm-1', date: today, mood: 'focused', energyLevel: 4, note: 'Had a productive morning session on Trigonometry!' },
];

export const INITIAL_FOCUS: FocusRecord[] = [
  { id: 'f-1', date: today, minutes: 25, mode: 'focus', taskName: 'Math Trigonometry practice', timestamp: '16:30' },
  { id: 'f-2', date: today, minutes: 25, mode: 'focus', taskName: 'Physics ray diagram study', timestamp: '17:15' },
];

export const FORMULA_COLLECTION: FormulaItem[] = [
  {
    id: 'f-1',
    category: 'Mathematics',
    title: 'Quadratic Formula',
    formula: 'x = (-b ± √(b² - 4ac)) / (2a)',
    explanation: 'Solves quadratic equation ax² + bx + c = 0. Discriminant D = b² - 4ac determines root nature.',
    variables: 'a, b, c = coefficients (a ≠ 0)',
  },
  {
    id: 'f-2',
    category: 'Mathematics',
    title: 'Arithmetic Progression n-th Term & Sum',
    formula: 'aₙ = a + (n - 1)d  |  Sₙ = (n/2)[2a + (n - 1)d]',
    explanation: 'Finds the nth term and sum of first n terms in an AP series.',
    variables: 'a = first term, d = common difference, n = number of terms',
  },
  {
    id: 'f-3',
    category: 'Physics',
    title: 'Mirror Formula & Magnification',
    formula: '1/f = 1/v + 1/u  |  m = -v/u = h\'/h',
    explanation: 'Relates object distance u, image distance v, and focal length f of spherical mirrors.',
    variables: 'u = object distance, v = image distance, f = focal length',
  },
  {
    id: 'f-4',
    category: 'Physics',
    title: 'Joule\'s Law of Heating',
    formula: 'H = I² · R · t = V · I · t',
    explanation: 'Amount of heat generated in a resistor carrying electric current over time.',
    variables: 'I = current (A), R = resistance (Ω), t = time (s), V = voltage (V)',
  },
  {
    id: 'f-5',
    category: 'Chemistry',
    title: 'pH Value Calculation',
    formula: 'pH = -log₁₀[H⁺]  |  pH + pOH = 14',
    explanation: 'Measures hydrogen ion concentration. pH < 7 is acidic, pH = 7 is neutral, pH > 7 is basic.',
    variables: '[H⁺] = molar concentration of hydrogen ions',
  },
];

export const DICTIONARY_COLLECTION: DictionaryItem[] = [
  {
    word: 'Mitochondria',
    phonetic: '/ˌmaɪ.təˈkɒn.dri.ə/',
    partOfSpeech: 'noun',
    definition: 'Organelles found in large numbers in most eukaryotic cells, responsible for cellular respiration and energy (ATP) production.',
    example: 'Mitochondria are often referred to as the powerhouse of the cell.',
    tamilMeaning: 'மைட்டோகாண்ட்ரியா (செல்லின் ஆற்றல் மையம்)',
  },
  {
    word: 'Refraction',
    phonetic: '/rɪˈfræk.ʃən/',
    partOfSpeech: 'noun',
    definition: 'The bending of a wave when it enters a medium where its speed is different, such as light travelling from air into glass.',
    example: 'Refraction causes the pencil placed in a glass of water to appear bent.',
    tamilMeaning: 'ஒளிவிலகல் (கதிர் வளைவு)',
  },
  {
    word: 'Catalyst',
    phonetic: '/ˈkæt.əl.ɪst/',
    partOfSpeech: 'noun',
    definition: 'A substance that increases the rate of a chemical reaction without itself undergoing any permanent chemical change.',
    example: 'Enzymes act as biological catalysts in human digestion.',
    tamilMeaning: 'வினைவேக மாற்றி',
  },
  {
    word: 'Procrastination',
    phonetic: '/prəˌkræs.tɪˈneɪ.ʃən/',
    partOfSpeech: 'noun',
    definition: 'The act of delaying or postponing something, especially tasks that require immediate attention.',
    example: 'Using the Pomodoro technique helps overcome procrastination during study hours.',
    tamilMeaning: 'தாமதப்படுத்துதல் (நாளை பார்க்கலாம் என தள்ளிப்போடுதல்)',
  },
  {
    word: 'Equilibrium',
    phonetic: '/ˌek.wɪˈlɪb.ri.əm/',
    partOfSpeech: 'noun',
    definition: 'A state in which opposing forces or influences are balanced.',
    example: 'Chemical equilibrium occurs when the forward and reverse reactions proceed at equal rates.',
    tamilMeaning: 'சமநிலை',
  },
];

// Helper functions for LocalStorage
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error loading storage key ${key}:`, e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving storage key ${key}:`, e);
  }
}

// Storage Manager
export const StorageManager = {
  getProfile: (): StudentProfile => loadFromStorage(STORAGE_KEYS.PROFILE, INITIAL_PROFILE),
  setProfile: (p: StudentProfile) => saveToStorage(STORAGE_KEYS.PROFILE, p),

  getTheme: (): ThemeType => loadFromStorage(STORAGE_KEYS.THEME, 'mint'),
  setTheme: (t: ThemeType) => saveToStorage(STORAGE_KEYS.THEME, t),

  getColorMode: (): ColorMode => loadFromStorage(STORAGE_KEYS.COLOR_MODE, 'dark'),
  setColorMode: (m: ColorMode) => saveToStorage(STORAGE_KEYS.COLOR_MODE, m),

  getWallpaper: (): WallpaperType => loadFromStorage(STORAGE_KEYS.WALLPAPER, 'meadow'),
  setWallpaper: (w: WallpaperType) => saveToStorage(STORAGE_KEYS.WALLPAPER, w),

  getTasks: (): PlannerTask[] => loadFromStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS),
  setTasks: (tasks: PlannerTask[]) => saveToStorage(STORAGE_KEYS.TASKS, tasks),

  getSubjects: (): Subject[] => loadFromStorage(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS),
  setSubjects: (subs: Subject[]) => saveToStorage(STORAGE_KEYS.SUBJECTS, subs),

  getNotes: (): Note[] => loadFromStorage(STORAGE_KEYS.NOTES, INITIAL_NOTES),
  setNotes: (notes: Note[]) => saveToStorage(STORAGE_KEYS.NOTES, notes),

  getAlarms: (): SmartAlarm[] => loadFromStorage(STORAGE_KEYS.ALARMS, INITIAL_ALARMS),
  setAlarms: (alarms: SmartAlarm[]) => saveToStorage(STORAGE_KEYS.ALARMS, alarms),

  getMoods: (): MoodLog[] => loadFromStorage(STORAGE_KEYS.MOODS, INITIAL_MOODS),
  setMoods: (moods: MoodLog[]) => saveToStorage(STORAGE_KEYS.MOODS, moods),

  getFocus: (): FocusRecord[] => loadFromStorage(STORAGE_KEYS.FOCUS, INITIAL_FOCUS),
  setFocus: (focus: FocusRecord[]) => saveToStorage(STORAGE_KEYS.FOCUS, focus),

  // Aliases for compatibility
  getFocusRecords: (): FocusRecord[] => loadFromStorage(STORAGE_KEYS.FOCUS, INITIAL_FOCUS),
  saveFocusRecords: (focus: FocusRecord[]) => saveToStorage(STORAGE_KEYS.FOCUS, focus),
  saveTasks: (tasks: PlannerTask[]) => saveToStorage(STORAGE_KEYS.TASKS, tasks),
  saveSubjects: (subs: Subject[]) => saveToStorage(STORAGE_KEYS.SUBJECTS, subs),
  saveNotes: (notes: Note[]) => saveToStorage(STORAGE_KEYS.NOTES, notes),
  saveAlarms: (alarms: SmartAlarm[]) => saveToStorage(STORAGE_KEYS.ALARMS, alarms),
  saveMoods: (moods: MoodLog[]) => saveToStorage(STORAGE_KEYS.MOODS, moods),
  saveProfile: (p: StudentProfile) => saveToStorage(STORAGE_KEYS.PROFILE, p),

  getPlanTier: (): PlanTier => {
    const promoApplied = loadFromStorage<boolean>(STORAGE_KEYS.PRO_FREE_PROMO_APPLIED, false);
    const stored = loadFromStorage<PlanTier>(STORAGE_KEYS.PLAN_TIER, 'pro_ultra');
    if (!promoApplied) {
      saveToStorage(STORAGE_KEYS.PRO_FREE_PROMO_APPLIED, true);
      if (stored !== 'pro_ultra') {
        saveToStorage(STORAGE_KEYS.PLAN_TIER, 'pro_ultra');
        return 'pro_ultra';
      }
    }
    return stored;
  },
  setPlanTier: (tier: PlanTier) => saveToStorage(STORAGE_KEYS.PLAN_TIER, tier),

  getParentContact: (): ParentContactConfig =>
    loadFromStorage<ParentContactConfig>(STORAGE_KEYS.PARENT_CONTACT, {
      parentName: '',
      parentEmail: '',
      parentWhatsapp: '',
    }),
  setParentContact: (cfg: ParentContactConfig) => saveToStorage(STORAGE_KEYS.PARENT_CONTACT, cfg),

  getUpiReceipts: (): UpiPaymentReceipt[] =>
    loadFromStorage<UpiPaymentReceipt[]>(STORAGE_KEYS.UPI_RECEIPTS, []),
  setUpiReceipts: (receipts: UpiPaymentReceipt[]) => saveToStorage(STORAGE_KEYS.UPI_RECEIPTS, receipts),

  getParentReports: (): ParentReportRecord[] =>
    loadFromStorage<ParentReportRecord[]>(STORAGE_KEYS.PARENT_REPORTS, []),
  setParentReports: (reports: ParentReportRecord[]) => saveToStorage(STORAGE_KEYS.PARENT_REPORTS, reports),

  getGuestMode: (): boolean => loadFromStorage<boolean>(STORAGE_KEYS.GUEST_MODE, false),
  setGuestMode: (isGuest: boolean) => saveToStorage(STORAGE_KEYS.GUEST_MODE, isGuest),

  getUsernameMap: (): Record<string, string> =>
    loadFromStorage<Record<string, string>>(STORAGE_KEYS.USERNAME_MAP, {}),
  registerUsernameMapping: (username: string, email: string) => {
    const map = loadFromStorage<Record<string, string>>(STORAGE_KEYS.USERNAME_MAP, {});
    map[username.trim().toLowerCase()] = email.trim().toLowerCase();
    saveToStorage(STORAGE_KEYS.USERNAME_MAP, map);
  },

  getLocalAuthSession: (): LocalAuthUser | null =>
    loadFromStorage<LocalAuthUser | null>(STORAGE_KEYS.LOCAL_AUTH_SESSION, null),
  setLocalAuthSession: (session: LocalAuthUser | null) => {
    try {
      if (!session) {
        localStorage.removeItem(STORAGE_KEYS.LOCAL_AUTH_SESSION);
      } else {
        saveToStorage(STORAGE_KEYS.LOCAL_AUTH_SESSION, session);
      }
    } catch (e) {
      console.warn('Error updating local auth session:', e);
    }
  },

  exportAllData: (): string => {
    const data = {
      profile: StorageManager.getProfile(),
      theme: StorageManager.getTheme(),
      wallpaper: StorageManager.getWallpaper(),
      tasks: StorageManager.getTasks(),
      subjects: StorageManager.getSubjects(),
      notes: StorageManager.getNotes(),
      alarms: StorageManager.getAlarms(),
      moods: StorageManager.getMoods(),
      focus: StorageManager.getFocus(),
      exportedAt: new Date().toISOString(),
      appVersion: 'StudyFlow 3.0',
    };
    return JSON.stringify(data, null, 2);
  },

  importData: (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.profile) StorageManager.setProfile(parsed.profile);
      if (parsed.theme) StorageManager.setTheme(parsed.theme);
      if (parsed.wallpaper) StorageManager.setWallpaper(parsed.wallpaper);
      if (parsed.tasks) StorageManager.setTasks(parsed.tasks);
      if (parsed.subjects) StorageManager.setSubjects(parsed.subjects);
      if (parsed.notes) StorageManager.setNotes(parsed.notes);
      if (parsed.alarms) StorageManager.setAlarms(parsed.alarms);
      if (parsed.moods) StorageManager.setMoods(parsed.moods);
      if (parsed.focus) StorageManager.setFocus(parsed.focus);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },

  resetAllData: () => {
    StorageManager.setProfile(INITIAL_PROFILE);
    StorageManager.setTheme('mint');
    StorageManager.setWallpaper('meadow');
    StorageManager.setTasks(INITIAL_TASKS);
    StorageManager.setSubjects(INITIAL_SUBJECTS);
    StorageManager.setNotes(INITIAL_NOTES);
    StorageManager.setAlarms(INITIAL_ALARMS);
    StorageManager.setMoods(INITIAL_MOODS);
    StorageManager.setFocus(INITIAL_FOCUS);
    StorageManager.setPlanTier('pro_ultra');
  },
};
