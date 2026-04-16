import React from 'react';
import { Delete } from 'lucide-react';

const BUTTON_COLORS = [
    'from-red-400 to-red-500',       // 0
    'from-orange-400 to-orange-500',  // 1
    'from-amber-400 to-amber-500',    // 2
    'from-yellow-400 to-yellow-500',  // 3
    'from-lime-400 to-lime-500',      // 4
    'from-green-400 to-green-500',    // 5
    'from-emerald-400 to-emerald-500',// 6
    'from-teal-400 to-teal-500',      // 7
    'from-cyan-400 to-cyan-500',      // 8
    'from-blue-400 to-blue-500',      // 9
];

const NumberPad = ({ onDigit, onDelete, onConfirm, disabled }) => {
    // Layout: 4 columns
    // Row 1: 0, 1, 2, 3
    // Row 2: _, 4, 5, 6
    // Row 3: _, 7, 8, 9
    const rows = [
        [0, 1, 2, 3],
        [null, 4, 5, 6],
        [null, 7, 8, 9],
    ];

    return (
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
            {/* Number grid: 4 columns */}
            {rows.map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-1.5 sm:gap-2">
                    {row.map((digit, colIdx) => (
                        digit !== null ? (
                            <button
                                key={digit}
                                onClick={() => onDigit(String(digit))}
                                disabled={disabled}
                                className={`
                                    w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20
                                    rounded-xl sm:rounded-2xl shadow-lg
                                    text-2xl sm:text-3xl md:text-4xl font-bold text-white
                                    bg-gradient-to-br ${BUTTON_COLORS[digit]}
                                    transform transition-all duration-150
                                    hover:scale-110 hover:shadow-xl
                                    active:scale-95 active:shadow-md
                                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                    border-b-4 border-black/20
                                `}
                            >
                                {digit}
                            </button>
                        ) : (
                            <div key={`empty-${colIdx}`} className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20" />
                        )
                    ))}
                </div>
            ))}

            {/* Action buttons */}
            <div className="flex gap-2 mt-1">
                <button
                    onClick={onDelete}
                    disabled={disabled}
                    className="
                        flex items-center justify-center gap-1
                        px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg
                        bg-gradient-to-br from-slate-400 to-slate-500
                        text-white text-base sm:text-lg font-bold
                        transform transition-all duration-150
                        hover:scale-105 hover:shadow-xl
                        active:scale-95
                        disabled:opacity-50 disabled:cursor-not-allowed
                        border-b-4 border-black/20
                    "
                    title="Borrar"
                >
                    <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
                    Borrar
                </button>

                <button
                    onClick={onConfirm}
                    disabled={disabled}
                    className="
                        flex items-center justify-center gap-1
                        px-5 py-2.5 sm:px-7 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg
                        bg-gradient-to-br from-emerald-400 to-emerald-600
                        text-white text-base sm:text-lg font-bold
                        transform transition-all duration-150
                        hover:scale-105 hover:shadow-xl
                        active:scale-95
                        disabled:opacity-50 disabled:cursor-not-allowed
                        border-b-4 border-black/20
                    "
                    title="Confirmar"
                >
                    ✓ Listo
                </button>
            </div>
        </div>
    );
};

export default NumberPad;
