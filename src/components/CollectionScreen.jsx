import React from 'react';
import { useRewards } from '../context/RewardsContext';
import { useGame } from '../context/GameContext';
import { MASCOTS, getStreakTier, STREAK_TIERS } from '../data/rewards';
import { ArrowLeft, Lock, Flame, Rainbow } from 'lucide-react';
import RewardPopup from './RewardPopup';

const CollectionScreen = () => {
    const { stats, unlockedIds } = useRewards();
    const { resetGame } = useGame();
    const [selectedMascot, setSelectedMascot] = React.useState(null);

    const streakTier = getStreakTier(stats.consecutiveDays);

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-200 via-pink-100 to-yellow-100 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => resetGame('menu')}
                    className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                    <ArrowLeft className="w-5 h-5 text-purple-600" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-purple-700 drop-shadow">
                    🏆 Mi Colección
                </h1>
                <div className="w-9" /> {/* Spacer */}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                <div className="bg-white/70 rounded-2xl p-3 text-center shadow">
                    <div className="text-2xl font-bold text-purple-600">{unlockedIds.length}/12</div>
                    <div className="text-xs text-gray-500 font-medium">Mascotas</div>
                </div>
                <div className="bg-white/70 rounded-2xl p-3 text-center shadow">
                    <div className="text-2xl font-bold text-orange-500">🌈 {stats.rainbowCount}</div>
                    <div className="text-xs text-gray-500 font-medium">Arcoíris</div>
                </div>
                <div className="bg-white/70 rounded-2xl p-3 text-center shadow">
                    <div className="text-2xl font-bold text-yellow-500">🌟 {stats.starCount || 0}</div>
                    <div className="text-xs text-gray-500 font-medium">Estrellas</div>
                </div>
                <div className="bg-white/70 rounded-2xl p-3 text-center shadow">
                    <div className="text-2xl font-bold text-cyan-500">💎 {stats.gemCount || 0}</div>
                    <div className="text-xs text-gray-500 font-medium">Gemas</div>
                </div>
                <div className="bg-white/70 rounded-2xl p-3 text-center shadow">
                    <div className="text-2xl font-bold text-red-500 flex items-center justify-center gap-1">
                        <Flame className="w-5 h-5" /> {stats.consecutiveDays}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">Racha días</div>
                </div>
                <div className="bg-white/70 rounded-2xl p-3 text-center shadow">
                    <div className="text-2xl font-bold text-teal-500">{stats.totalCorrect}</div>
                    <div className="text-xs text-gray-500 font-medium">Totales</div>
                </div>
            </div>

            {/* Streak badges */}
            <div className="mb-4">
                <h2 className="text-lg font-bold text-purple-700 mb-2 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" /> Racha de Días
                </h2>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {STREAK_TIERS.map((tier) => {
                        const achieved = stats.consecutiveDays >= tier.days;
                        return (
                            <div
                                key={tier.days}
                                className={`
                                    flex-shrink-0 px-4 py-2 rounded-2xl font-bold text-sm shadow
                                    ${achieved
                                        ? `bg-gradient-to-r ${tier.color} text-white`
                                        : 'bg-gray-200 text-gray-400'
                                    }
                                `}
                            >
                                {tier.label}
                                <div className="text-xs opacity-80">{tier.days} días</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mascot Grid */}
            <h2 className="text-lg font-bold text-purple-700 mb-2">🐾 Mascotas</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 flex-1">
                {MASCOTS.map((mascot) => {
                    const isUnlocked = unlockedIds.includes(mascot.id);
                    return (
                        <div
                            key={mascot.id}
                            onClick={() => isUnlocked && setSelectedMascot(mascot)}
                            className={`
                                relative flex flex-col items-center p-2 rounded-2xl shadow-md
                                transition-all duration-300
                                ${isUnlocked
                                    ? 'bg-white/80 hover:scale-105 cursor-pointer'
                                    : 'bg-gray-200/50 grayscale opacity-60'
                                }
                            `}
                        >
                            {/* Image */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-1">
                                <img
                                    src={mascot.image}
                                    alt={mascot.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Lock overlay */}
                            {!isUnlocked && (
                                <div className="absolute top-1 right-1 bg-gray-500/70 p-1 rounded-full">
                                    <Lock className="w-3 h-3 text-white" />
                                </div>
                            )}

                            {/* Name */}
                            <span className="text-xs font-bold text-center text-gray-700 leading-tight">
                                {isUnlocked ? mascot.name : '???'}
                            </span>

                            {/* Hint for locked */}
                            {!isUnlocked && (
                                <span className="text-[10px] text-gray-400 text-center mt-0.5 leading-tight">
                                    {mascot.unlockHint}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Section stats */}
            <div className="mt-4 bg-white/60 rounded-2xl p-4 shadow">
                <h3 className="font-bold text-purple-700 mb-2">📊 Estadísticas</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Letras:</span>
                        <span className="font-bold text-green-600">{stats.alphabetCorrect}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Sílabas:</span>
                        <span className="font-bold text-blue-600">{stats.syllablesCorrect}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Palabras:</span>
                        <span className="font-bold text-purple-600">{stats.wordsCorrect}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Números:</span>
                        <span className="font-bold text-teal-600">{stats.numbersRandomCorrect + stats.numbersSequentialCorrect}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Mejor racha:</span>
                        <span className="font-bold text-orange-500">{stats.bestStreak} seguidas</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Días jugados:</span>
                        <span className="font-bold text-pink-500">{stats.daysPlayed}</span>
                    </div>
                </div>
            </div>

            {/* Mascot Preview Popup */}
            <RewardPopup 
                mascot={selectedMascot} 
                onDismiss={() => setSelectedMascot(null)} 
                previewMode={true}
            />
        </div>
    );
};

export default CollectionScreen;
