import React from 'react';

const StarPopup = ({ isOpen, count, section, onDismiss }) => {
    if (!isOpen) return null;

    const emoji = section === 'words' ? '💎' : '🌟';
    const typeName = section === 'words' ? 'Gema' : 'Estrella';
    const colorFrom = section === 'words' ? 'from-cyan-100' : 'from-yellow-100';
    const colorTo = section === 'words' ? 'to-blue-100' : 'to-orange-100';
    const titleColor = section === 'words' ? 'text-blue-600' : 'text-yellow-600';
    const btnColor = section === 'words' ? 'from-cyan-400 to-blue-500' : 'from-yellow-400 to-orange-500';
    const btnBorder = section === 'words' ? 'border-blue-600/30' : 'border-orange-600/30';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Dialog */}
            <div className={`relative bg-gradient-to-b ${colorFrom} ${colorTo} rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full animate-pop-in`}>
                <div className="text-center text-7xl mb-3 animate-bounce">{emoji}</div>

                <h2 className={`text-2xl sm:text-3xl font-bold text-center ${titleColor} mb-2`}>
                    ¡{typeName} #{count}!
                </h2>

                <p className="text-center text-gray-600 mb-5 text-sm sm:text-base">
                    ¡Conseguiste un premio especial! Ya tenés <strong>{count}</strong> en total.
                </p>

                <button
                    onClick={onDismiss}
                    className={`
                        w-full py-3 px-4 rounded-2xl font-bold text-lg
                        bg-gradient-to-r ${btnColor}
                        text-white shadow-lg
                        transform transition-all duration-150
                        hover:scale-105 active:scale-95
                        border-b-4 ${btnBorder}
                    `}
                >
                    ¡Genial! ✨
                </button>
            </div>
        </div>
    );
};

export default StarPopup;
