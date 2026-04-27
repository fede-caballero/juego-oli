import React from 'react';

const RainbowPopup = ({ isOpen, count, onDismiss }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Dialog */}
            <div className="relative bg-gradient-to-b from-purple-100 to-pink-100 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full animate-pop-in">
                {/* Rainbow emoji */}
                <div className="text-center text-7xl mb-3 animate-bounce">🌈</div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-purple-600 mb-2">
                    ¡Arcoíris #{count}!
                </h2>

                {/* Message */}
                <p className="text-center text-gray-600 mb-5 text-sm sm:text-base">
                    ¡Conseguiste un nuevo arcoíris coleccionable! Ya tenés <strong>{count}</strong> en total.
                </p>

                {/* Dismiss button */}
                <button
                    onClick={onDismiss}
                    className="
                        w-full py-3 px-4 rounded-2xl font-bold text-lg
                        bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400
                        text-white shadow-lg
                        transform transition-all duration-150
                        hover:scale-105 active:scale-95
                        border-b-4 border-purple-600/30
                    "
                >
                    ¡Increíble! ✨
                </button>
            </div>
        </div>
    );
};

export default RainbowPopup;
