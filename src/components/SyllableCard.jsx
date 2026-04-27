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
        w-40 h-40 rounded-3xl shadow-lg
        transform transition-all duration-200 hover:scale-110
        border-4 border-purple-200
        flex flex-col items-center justify-center
      `}
        >
            <span className="text-5xl font-bold text-purple-600 leading-none mb-2">{syllable.toUpperCase()}</span>
            <span className="text-3xl font-semibold text-purple-400 leading-none">{syllable.toLowerCase()}</span>
        </button>
    );
};

export default SyllableCard;
