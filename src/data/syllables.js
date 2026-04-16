const CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
const VOWELS = ['A', 'E', 'I', 'O', 'U'];

const generateTwoLetterSyllables = () => {
  const syllables = [];
  CONSONANTS.forEach(consonant => {
    VOWELS.forEach(vowel => {
      // Handle special cases if needed (e.g., Q usually goes with U, but for simple CV we might skip or include)
      // For simplicity in Spanish:
      if (consonant === 'Q') {
        if (vowel === 'E' || vowel === 'I') syllables.push(`QU${vowel}`);
      } else if (consonant === 'G') {
        // GA, GE, GI, GO, GU - keep simple for now
        syllables.push(`${consonant}${vowel}`);
      } else {
        syllables.push(`${consonant}${vowel}`);
      }
    });
  });
  return syllables;
};

export const SYLLABLE_LEVELS = {
  level1: generateTwoLetterSyllables(), // 2 letters (CV)
  level2: [ // 3 letters (CVC, CCV, etc.)
    'BLA', 'BLE', 'BLI', 'BLO', 'BLU',
    'BRA', 'BRE', 'BRI', 'BRO', 'BRU',
    'CLA', 'CLE', 'CLI', 'CLO', 'CLU',
    'CRA', 'CRE', 'CRI', 'CRO', 'CRU',
    'DRA', 'DRE', 'DRI', 'DRO', 'DRU',
    'FLA', 'FLE', 'FLI', 'FLO', 'FLU',
    'FRA', 'FRE', 'FRI', 'FRO', 'FRU',
    'GLA', 'GLE', 'GLI', 'GLO', 'GLU',
    'GRA', 'GRE', 'GRI', 'GRO', 'GRU',
    'PLA', 'PLE', 'PLI', 'PLO', 'PLU',
    'PRA', 'PRE', 'PRI', 'PRO', 'PRU',
    'TRA', 'TRE', 'TRI', 'TRO', 'TRU',
    'MAR', 'SOL', 'PAN', 'LUZ', 'DOS', 'SAL', 'GOL', 'SUR', 'POR', 'CON',
    // Inversas y Diptongos
    'AD', 'AE', 'AI', 'AO', 'AU', 'AL', 'AM', 'AN', 'AR', 'AS',
    'ED', 'EL', 'EN', 'EO', 'ER', 'ES', 'EA', 'EI', 'EU',
    'ID', 'IA', 'IE', 'IO', 'IU', 'IL', 'IR', 'IZ',
    'OA', 'OE', 'OI', 'OU', 'OL', 'OM', 'ON', 'OR', 'OS',
    'UA', 'UE', 'UI', 'UO', 'UL', 'UM', 'UN', 'UR'
  ]
};

export const LEVEL_ORDER = ['level1', 'level2'];
