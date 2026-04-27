import React from 'react';
import Confetti from 'react-confetti';

const RewardPopup = ({ mascot, onDismiss }) => {
    if (!mascot) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Confetti recycle={false} numberOfPieces={300} />

            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Dialog */}
            <div className="relative bg-gradient-to-b from-yellow-100 to-orange-100 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full animate-pop-in">
                {/* Sparkle header */}
                <div className="text-center text-3xl mb-2">✨ ¡Nueva Mascota! ✨</div>

                {/* Mascot image */}
                <div className="flex justify-center mb-3">
                    <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden bg-white shadow-lg border-4 border-yellow-300 animate-bounce-in">
                        <img
                            src={mascot.image}
                            alt={mascot.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Mascot name */}
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-orange-600 mb-1">
                    {mascot.emoji} {mascot.name}
                </h2>

                {/* Description */}
                <p className="text-center text-gray-600 mb-4 text-sm sm:text-base">
                    {mascot.description}
                </p>

                {/* Dismiss button */}
                <button
                    onClick={onDismiss}
                    className="
                        w-full py-3 px-4 rounded-2xl font-bold text-lg
                        bg-gradient-to-br from-yellow-400 to-orange-500
                        text-white shadow-lg
                        transform transition-all duration-150
                        hover:scale-105 active:scale-95
                        border-b-4 border-orange-600/30
                    "
                >
                    ¡Genial! 🎉
                </button>
            </div>
        </div>
    );
};

export default RewardPopup;
