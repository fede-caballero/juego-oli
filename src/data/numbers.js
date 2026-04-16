// Mapeo de números a texto en español (argentino)

const UNIDADES = [
    '', 'uno', 'dos', 'tres', 'cuatro', 'cinco',
    'seis', 'siete', 'ocho', 'nueve', 'diez',
    'once', 'doce', 'trece', 'catorce', 'quince',
    'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
    'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco',
    'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'
];

const DECENAS = [
    '', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta',
    'sesenta', 'setenta', 'ochenta', 'noventa'
];

const CENTENAS = [
    '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
    'seiscientos', 'setecientos', 'ochocientos', 'novecientos'
];

/**
 * Convierte un número (0-1000) a su representación textual en español.
 * @param {number} n - Número entre 0 y 1000.
 * @returns {string} Texto en español.
 */
export const numberToSpanish = (n) => {
    if (n === 0) return 'cero';
    if (n === 100) return 'cien';
    if (n === 1000) return 'mil';

    if (n <= 29) return UNIDADES[n];

    if (n < 100) {
        const decena = Math.floor(n / 10);
        const unidad = n % 10;
        if (unidad === 0) return DECENAS[decena];
        return `${DECENAS[decena]} y ${UNIDADES[unidad]}`;
    }

    if (n < 1000) {
        const centena = Math.floor(n / 100);
        const resto = n % 100;
        if (resto === 0) return CENTENAS[centena];
        return `${CENTENAS[centena]} ${numberToSpanish(resto)}`;
    }

    return String(n);
};

/**
 * Genera un número aleatorio entre min y max (inclusive).
 */
export const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/** Número máximo por defecto */
export const DEFAULT_MAX_NUMBER = 30;
