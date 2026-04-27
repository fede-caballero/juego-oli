import React from 'react';

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full animate-pop-in">
                {/* Emoji */}
                <div className="text-center text-6xl mb-3">🥺</div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-2">
                    {title || '¿Querés salir?'}
                </h2>

                {/* Message */}
                <p className="text-center text-gray-500 mb-6 text-sm sm:text-base">
                    {message || 'Si salís, vas a perder el avance de esta partida.'}
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="
                            flex-1 py-3 px-4 rounded-2xl font-bold text-base
                            bg-gradient-to-br from-emerald-400 to-emerald-600
                            text-white shadow-lg
                            transform transition-all duration-150
                            hover:scale-105 active:scale-95
                            border-b-4 border-emerald-700/30
                        "
                    >
                        Seguir jugando 💪
                    </button>
                    <button
                        onClick={onConfirm}
                        className="
                            flex-1 py-3 px-4 rounded-2xl font-bold text-base
                            bg-gradient-to-br from-gray-300 to-gray-400
                            text-gray-700 shadow-lg
                            transform transition-all duration-150
                            hover:scale-105 active:scale-95
                            border-b-4 border-gray-500/30
                        "
                    >
                        Sí, salir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
