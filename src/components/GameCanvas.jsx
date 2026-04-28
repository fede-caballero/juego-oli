import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useRewards } from '../context/RewardsContext';
import { useGameLogic } from '../hooks/useGameLogic';
import SyllableCard from './SyllableCard';
import MicrophoneButton from './MicrophoneButton';
import MainMenu from './MainMenu';
import NumberGame from './NumberGame';
import CollectionScreen from './CollectionScreen';
import ConfirmDialog from './ConfirmDialog';
import RewardPopup from './RewardPopup';
import { speak } from './AudioFeedback';
import Confetti from 'react-confetti';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Volume2, Star, ArrowLeft } from 'lucide-react';
import StarPopup from './StarPopup';
import { STAR_MILESTONE } from '../data/rewards';

const GameCanvas = () => {
    const { section, score, gameMode, currentLevel, nextLevel, resetGame } = useGame();
    const { 
        addCorrect, addIncorrect, checkUnlocks, checkStarMilestone, 
        newlyUnlocked, dismissUnlock, newStarPopup, dismissStarPopup 
    } = useRewards();
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [showAlphabetComplete, setShowAlphabetComplete] = useState(false);

    // Check for unlocks after any score change
    useEffect(() => {
        if (score > 0) {
            checkUnlocks();
            if (section === 'words' || section === 'syllables') {
                checkStarMilestone(section);
            }
        }
    }, [score, checkUnlocks, section, checkStarMilestone]);

    // Hooks for Syllable/Alphabet/Word games (must be before early returns)
    const { currentSyllable, options, feedback, checkAnswer } = useGameLogic();
    const [selectedOption, setSelectedOption] = useState(null);
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

    // Auto-play audio when a new syllable/letter/word is loaded
    useEffect(() => {
        if (gameMode === 'listening' && currentSyllable) {
            const timer = setTimeout(() => {
                speak(`Seleccioná... ${currentSyllable}`);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [currentSyllable, gameMode]);

    // Handle speech recognition result
    useEffect(() => {
        if (gameMode === 'speaking' && transcript) {
            const normalizedTranscript = transcript.toUpperCase().trim();
            if (normalizedTranscript.includes(currentSyllable)) {
                checkAnswer(currentSyllable);
                resetTranscript();
            }
        }
    }, [transcript, gameMode, currentSyllable, checkAnswer, resetTranscript]);

    // Automatic Level Progression (Syllables)
    useEffect(() => {
        if (section === 'syllables' && currentLevel === 'level1' && score >= 10) {
            speak('¡Felicidades! ¡Ganaste! Pasamos al siguiente nivel.');

            const timer = setTimeout(() => {
                nextLevel();
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [section, currentLevel, score, nextLevel]);

    // Alphabet Completion
    useEffect(() => {
        if (section === 'alphabet' && score >= 27 && !showAlphabetComplete) {
            setShowAlphabetComplete(true);
            speak('¡Felicidades! ¡Completaste el abecedario!');
        }
    }, [section, score, showAlphabetComplete]);

    if (section === 'menu') {
        return (
            <>
                <RewardPopup mascot={newlyUnlocked} onDismiss={dismissUnlock} />
                <MainMenu />
            </>
        );
    }

    if (section === 'collection') {
        return <CollectionScreen />;
    }

    if (section === 'numbers') {
        return (
            <>
                <RewardPopup mascot={newlyUnlocked} onDismiss={dismissUnlock} />
                <NumberGame />
            </>
        );
    }

    const handleCardClick = (syllable) => {
        if (gameMode === 'listening') {
            setSelectedOption(syllable);
            
            // Prevent '¡Muy bien!' from overlapping with level up or completion sounds
            const newScore = score + 1;
            const isLevelUp = (section === 'syllables' && currentLevel === 'level1' && newScore >= 10);
            const isAlphabetComplete = (section === 'alphabet' && newScore >= 27);
            const isLevelComplete = isLevelUp || isAlphabetComplete;
            
            const isCorrect = checkAnswer(syllable, isLevelComplete);
            
            if (isCorrect) {
                if (!isLevelComplete) {
                    speak('¡Muy bien!');
                }
                addCorrect(section);
            } else {
                speak('¡Intentá nuevamente!');
                addIncorrect();
            }
            setTimeout(() => setSelectedOption(null), 1500);
        }
    };

    const handleBackClick = () => {
        if (score > 0) {
            setShowExitConfirm(true);
        } else {
            resetGame('menu');
        }
    };

    if (!browserSupportsSpeechRecognition && gameMode === 'speaking') {
        return <div>Tu navegador no soporta reconocimiento de voz.</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-200 to-purple-200 p-4">
            {feedback === 'correct' && <Confetti recycle={false} numberOfPieces={200} />}

            {/* Reward popup */}
            <RewardPopup mascot={newlyUnlocked} onDismiss={dismissUnlock} />

            {/* Star Milestone popup */}
            <StarPopup 
                isOpen={!!newStarPopup} 
                section={newStarPopup?.section} 
                count={newStarPopup?.count} 
                onDismiss={dismissStarPopup} 
            />

            {/* Exit confirmation */}
            <ConfirmDialog
                isOpen={showExitConfirm}
                message={score >= STAR_MILESTONE ? "¿Querés salir? Tus premios están guardados en Colecciones." : "Si salís, vas a perder el avance de esta partida."}
                onConfirm={() => {
                    setShowExitConfirm(false);
                    resetGame('menu');
                }}
                onCancel={() => setShowExitConfirm(false)}
            />

            {/* Alphabet Completion Popup */}
            {showAlphabetComplete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="relative bg-gradient-to-b from-green-100 to-yellow-100 rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-pop-in text-center">
                        <div className="text-7xl mb-4 animate-bounce">🏆</div>
                        <h2 className="text-3xl font-bold text-green-600 mb-2">¡Increíble!</h2>
                        <p className="text-gray-600 mb-6 font-medium">¡Completaste todas las letras del abecedario!</p>
                        <button
                            onClick={() => {
                                setShowAlphabetComplete(false);
                                resetGame('menu');
                            }}
                            className="w-full py-3 px-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-green-400 to-teal-400 text-white shadow-lg transform transition-all hover:scale-105 border-b-4 border-teal-600/30"
                        >
                            Volver al Menú
                        </button>
                    </div>
                </div>
            )}

            {/* Header / Score */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                <Star className="text-yellow-400 fill-current" />
                <span className="text-2xl font-bold text-purple-600">{score}</span>
            </div>

            <button
                onClick={handleBackClick}
                className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            >
                <ArrowLeft className="text-purple-600" />
            </button>

            <div className="absolute top-4 left-20 text-xl font-bold text-purple-700 bg-white/50 px-3 py-1 rounded-lg">
                {section === 'syllables' ? (
                    currentLevel === 'level1' ? 'Nivel 1: 2 Letras' : 'Nivel 2: 3 Letras'
                ) : (
                    `Nivel: ${typeof currentLevel === 'string' ? currentLevel.toUpperCase() : currentLevel}`
                )}
            </div>

            <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-md mt-12">
                {section === 'alphabet' ? 'Abecedario' : section === 'words' ? 'Palabras' : 'Sílaba Mágica'}
            </h1>

            {/* Game Area */}
            <div className="w-full max-w-5xl flex flex-col items-center gap-8">

                {gameMode === 'listening' ? (
                    <>
                        <button
                            onClick={() => speak(currentSyllable)}
                            className="bg-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform"
                        >
                            <Volume2 className="w-12 h-12 text-blue-500" />
                        </button>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {options.map((syllable, index) => (
                                <SyllableCard
                                    key={index}
                                    syllable={syllable}
                                    onClick={handleCardClick}
                                    isSelected={selectedOption === syllable}
                                    feedback={selectedOption === syllable ? feedback : null}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    /* Speaking Mode */
                    <div className="flex flex-col items-center gap-8">
                        <div className="bg-white px-12 py-8 rounded-3xl shadow-xl flex flex-col items-center">
                            <span className="text-7xl font-bold text-purple-600 mb-2">{currentSyllable.toUpperCase()}</span>
                            <span className="text-5xl font-semibold text-purple-400">{currentSyllable.toLowerCase()}</span>
                        </div>
                        <p className="text-white text-xl">Mantené apretado y decí la palabra</p>
                        <MicrophoneButton
                            listening={listening}
                            startListening={() => SpeechRecognition.startListening({ language: 'es-ES' })}
                            stopListening={SpeechRecognition.stopListening}
                        />
                        <div className="h-8 text-white font-mono">{transcript}</div>
                    </div>
                )}

            </div>

            {/* Level Control */}
            {section !== 'alphabet' && (
                <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
                    {section === 'syllables' && currentLevel === 'level1' && (
                        <span className="text-white font-bold bg-black/20 px-2 py-1 rounded">
                            {score}/10 para desbloquear
                        </span>
                    )}
                    <button
                        onClick={nextLevel}
                        disabled={section === 'syllables' && currentLevel === 'level1' && score < 10}
                        className={`
                            px-4 py-2 rounded-lg transition-colors
                            ${section === 'syllables' && currentLevel === 'level1' && score < 10
                                ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                : 'bg-white/20 hover:bg-white/40 text-white'}
                        `}
                    >
                        Siguiente Nivel &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameCanvas;
