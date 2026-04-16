import React from 'react';

const NumberDisplay = ({ digits, maxDigits }) => {
    // Show placeholders for remaining digits
    const displaySlots = [];
    for (let i = 0; i < maxDigits; i++) {
        if (i < digits.length) {
            displaySlots.push(digits[i]);
        } else {
            displaySlots.push(null);
        }
    }

    return (
        <div className="flex items-center justify-center gap-2 sm:gap-3">
            {displaySlots.map((digit, index) => (
                <div
                    key={index}
                    className={`
                        w-14 h-16 sm:w-18 sm:h-20 md:w-20 md:h-24
                        rounded-xl sm:rounded-2xl border-4
                        flex items-center justify-center
                        text-3xl sm:text-4xl md:text-5xl font-bold
                        transition-all duration-300
                        ${digit !== null
                            ? 'bg-white border-teal-400 text-teal-700 scale-100 shadow-lg'
                            : 'bg-white/30 border-dashed border-teal-300/50 text-teal-300'
                        }
                        ${digit !== null ? 'animate-pop-in' : ''}
                    `}
                >
                    {digit !== null ? digit : '?'}
                </div>
            ))}
        </div>
    );
};

export default NumberDisplay;
