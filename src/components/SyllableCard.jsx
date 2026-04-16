import React from 'react';

const SyllableCard = ({ syllable, onClick, isSelected, feedback }) => {
    let bgColor = 'bg-white';
    if (feedback === 'correct' && isSelected) bgColor = 'bg-green-400';
    if (feedback === 'incorrect' && isSelected) bgColor = 'bg-red-400';

    return (
        <button
            onClick={() => onClick(syllable)}
            className={`
        ${bgColor}
        text-6xl font-bold text-purple-600
        w-40 h-40 rounded-3xl shadow-lg
        transform transition-all duration-200 hover:scale-110
        border-4 border-purple-200
        flex items-center justify-center
      `}
        >
            {syllable}
        </button>
    );
};

export default SyllableCard;
