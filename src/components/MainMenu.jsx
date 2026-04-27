import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useRewards } from '../context/RewardsContext';
import { getStreakTier } from '../data/rewards';
import { getUser } from '../services/api';
import { Book, Type, MessageSquare, Hash, Trophy, Flame, LogOut, ArrowLeft } from 'lucide-react';
import VoiceSelector from './VoiceSelector';
import { unlockAudio } from './AudioFeedback';

const MainMenu = () => {
    const { resetGame } = useGame();
    const { stats, registerPlayDay, handleLogout } = useRewards();
    const user = getUser();

    // Register today as a play day
    useEffect(() => {
        registerPlayDay();
    }, [registerPlayDay]);

    const streakTier = getStreakTier(stats.consecutiveDays);

    const menuItems = [
        { id: 'alphabet', label: 'Abecedario', icon: Type, color: 'bg-green-400' },
        { id: 'syllables', label: 'Sílabas', icon: Book, color: 'bg-blue-400' },
        { id: 'words', label: 'Palabras', icon: MessageSquare, color: 'bg-purple-400' },
        { id: 'numbers', label: 'Números', icon: Hash, color: 'bg-teal-400' },
    ];

    const [showAlphabetOptions, setShowAlphabetOptions] = React.useState(false);

    const handleMenuClick = (id) => {
        unlockAudio();
        if (id === 'alphabet') {
            setShowAlphabetOptions(true);
        } else {
            resetGame(id);
        }
    };

    if (showAlphabetOptions) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-200 to-teal-200 p-4 relative">
                <button
                    onClick={() => setShowAlphabetOptions(false)}
                    className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                    <ArrowLeft className="w-6 h-6 text-green-600" />
                </button>
                <h1 className="text-4xl font-bold text-green-700 mb-8 drop-shadow-md text-center">
                    Modo Abecedario
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mb-6">
                    <button
                        onClick={() => resetGame('alphabet', 'ordered')}
                        className="bg-green-500 flex flex-col items-center justify-center p-8 rounded-3xl shadow-xl hover:scale-105 transition-all text-white"
                    >
                        <span className="text-4xl mb-4">A-B-C</span>
                        <span className="text-2xl font-bold">En Orden</span>
                    </button>
                    <button
                        onClick={() => resetGame('alphabet', 'random')}
                        className="bg-teal-500 flex flex-col items-center justify-center p-8 rounded-3xl shadow-xl hover:scale-105 transition-all text-white"
                    >
                        <span className="text-4xl mb-4">M-Z-F</span>
                        <span className="text-2xl font-bold">Desordenadas</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-200 to-orange-200 p-4">
            {/* User greeting + logout */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="text-sm font-bold text-orange-600 bg-white/80 px-3 py-1.5 rounded-full shadow-md">
                    👋 {user?.name || 'Jugador'}
                </span>
                <button
                    onClick={handleLogout}
                    className="bg-white/80 p-1.5 rounded-full shadow-md hover:bg-red-100 transition-colors"
                    title="Cambiar jugador"
                >
                    <LogOut className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {/* Streak badge */}
            {stats.consecutiveDays > 0 && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full shadow-md">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-bold text-orange-600">{stats.consecutiveDays} día{stats.consecutiveDays !== 1 ? 's' : ''}</span>
                </div>
            )}

            <h1 className="text-5xl font-bold text-orange-600 mb-8 drop-shadow-md text-center">
                ¡Vamos a Jugar!
            </h1>

            <div className="grid grid-cols-2 gap-6 w-full max-w-3xl mb-6">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleMenuClick(item.id)}
                        className={`
              ${item.color}
              flex flex-col items-center justify-center
              p-6 sm:p-8 rounded-3xl shadow-xl
              transform transition-all duration-300 hover:scale-105 hover:rotate-2
              text-white
            `}
                    >
                        <item.icon className="w-16 h-16 sm:w-24 sm:h-24 mb-3" />
                        <span className="text-2xl sm:text-3xl font-bold">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Collection button */}
            <button
                onClick={() => resetGame('collection')}
                className="
                    flex items-center gap-2
                    bg-gradient-to-r from-yellow-400 to-orange-400
                    text-white font-bold text-lg
                    px-6 py-3 rounded-2xl shadow-lg
                    transform transition-all duration-300 hover:scale-105
                    border-b-4 border-orange-500/30
                    mb-3
                "
            >
                <Trophy className="w-6 h-6" />
                Mi Colección ({stats.unlockedMascots.length}/12)
            </button>

            <VoiceSelector />
        </div>
    );
};

export default MainMenu;
