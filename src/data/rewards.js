// Reward definitions for the mascot collection system

const BASE_URL = import.meta.env.BASE_URL || '/';

export const MASCOTS = [
    {
        id: 'estrellita',
        name: 'Estrellita',
        emoji: '🌟',
        image: `${BASE_URL}mascots/estrellita.png`,
        description: 'Una estrella dorada con carita feliz',
        unlockHint: 'Respondé correctamente por primera vez',
        check: (stats) => stats.totalCorrect >= 1,
    },
    {
        id: 'mariposa',
        name: 'Mariposa Arcoíris',
        emoji: '🦋',
        image: `${BASE_URL}mascots/mariposa.png`,
        description: 'Mariposa multicolor brillante',
        unlockHint: 'Conseguí 10 respuestas correctas seguidas',
        check: (stats) => stats.bestStreak >= 10,
    },
    {
        id: 'unicornio',
        name: 'Unicornio Chispa',
        emoji: '🦄',
        image: `${BASE_URL}mascots/unicornio.png`,
        description: 'Unicornio pastel con cuerno brillante',
        unlockHint: 'Completá el modo secuencial 1-30',
        check: (stats) => stats.sequentialCompleted >= 1,
    },
    {
        id: 'gatito',
        name: 'Gatito Letras',
        emoji: '🐱',
        image: `${BASE_URL}mascots/gatito.png`,
        description: 'Gatito con collar de letras ABC',
        unlockHint: 'Acertá 50 letras del abecedario',
        check: (stats) => stats.alphabetCorrect >= 50,
    },
    {
        id: 'perrito',
        name: 'Perrito Sílabas',
        emoji: '🐶',
        image: `${BASE_URL}mascots/perrito.png`,
        description: 'Perrito con gorro de graduación',
        unlockHint: 'Acertá 50 sílabas',
        check: (stats) => stats.syllablesCorrect >= 50,
    },
    {
        id: 'conejito',
        name: 'Conejito Palabras',
        emoji: '🐰',
        image: `${BASE_URL}mascots/conejito.png`,
        description: 'Conejito leyendo un libro',
        unlockHint: 'Acertá 30 palabras',
        check: (stats) => stats.wordsCorrect >= 30,
    },
    {
        id: 'arcoiris',
        name: 'Arcoíris Mágico',
        emoji: '🌈',
        image: `${BASE_URL}mascots/arcoiris.png`,
        description: 'Arcoíris con nubecitas kawaii',
        unlockHint: 'Acertá 30 números en modo aleatorio',
        check: (stats) => stats.numbersRandomCorrect >= 30,
    },
    {
        id: 'panda',
        name: 'Panda Sabio',
        emoji: '🐼',
        image: `${BASE_URL}mascots/panda.png`,
        description: 'Panda con anteojos y lápiz',
        unlockHint: 'Jugá 3 días distintos',
        check: (stats) => stats.daysPlayed >= 3,
    },
    {
        id: 'zorrito',
        name: 'Zorrito Veloz',
        emoji: '🦊',
        image: `${BASE_URL}mascots/zorrito.png`,
        description: 'Zorrito con capa de superhéroe',
        unlockHint: 'Jugá 7 días distintos',
        check: (stats) => stats.daysPlayed >= 7,
    },
    {
        id: 'dragon',
        name: 'Dragón Dorado',
        emoji: '🐉',
        image: `${BASE_URL}mascots/dragon.png`,
        description: 'Dragoncito amigable dorado',
        unlockHint: 'Jugá 14 días distintos',
        check: (stats) => stats.daysPlayed >= 14,
    },
    {
        id: 'hada',
        name: 'Hada Brillante',
        emoji: '🧚',
        image: `${BASE_URL}mascots/hada.png`,
        description: 'Hada con varita mágica',
        unlockHint: 'Desbloqueá al menos 1 mascota de cada sección',
        check: (stats) => {
            // Must have at least one mascot from each section
            return stats.alphabetCorrect >= 50 &&
                   stats.syllablesCorrect >= 50 &&
                   stats.wordsCorrect >= 30 &&
                   stats.numbersRandomCorrect >= 30;
        },
    },
    {
        id: 'corona',
        name: 'Corona Mágica',
        emoji: '👑',
        image: `${BASE_URL}mascots/corona.png`,
        description: 'Corona dorada con gemas mágicas',
        unlockHint: 'Desbloqueá las 11 mascotas anteriores',
        check: (stats, unlockedIds) => {
            const allOthers = MASCOTS.filter(m => m.id !== 'corona').map(m => m.id);
            return allOthers.every(id => unlockedIds.includes(id));
        },
    },
];

export const STREAK_TIERS = [
    { days: 1, label: '⭐ Bronce', color: 'from-amber-600 to-amber-700' },
    { days: 3, label: '⭐⭐ Plata', color: 'from-gray-300 to-gray-400' },
    { days: 7, label: '⭐⭐⭐ Oro', color: 'from-yellow-400 to-yellow-500' },
    { days: 14, label: '💎 Diamante', color: 'from-cyan-400 to-blue-500' },
    { days: 30, label: '🏆 Campeón', color: 'from-purple-500 to-pink-500' },
];

export const getStreakTier = (days) => {
    let tier = null;
    for (const t of STREAK_TIERS) {
        if (days >= t.days) tier = t;
    }
    return tier;
};

// Rainbow rewards: earned every 15 points in random number mode
export const RAINBOW_MILESTONE = 15;
export const STAR_MILESTONE = 15; // For syllables (stars) and words (gems)

// Default stats shape
export const DEFAULT_STATS = {
    totalCorrect: 0,
    bestStreak: 0,
    currentStreak: 0,
    alphabetCorrect: 0,
    syllablesCorrect: 0,
    wordsCorrect: 0,
    numbersRandomCorrect: 0,
    numbersSequentialCorrect: 0,
    sequentialCompleted: 0,
    daysPlayed: 0,
    playDates: [],        // array of 'YYYY-MM-DD' strings
    consecutiveDays: 0,
    bestConsecutiveDays: 0,
    lastPlayDate: null,
    rainbowCount: 0,
    starCount: 0,
    gemCount: 0,
    unlockedMascots: [],  // array of mascot ids with unlock dates
};
