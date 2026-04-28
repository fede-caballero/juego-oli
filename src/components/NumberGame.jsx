import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useRewards } from '../context/RewardsContext';
import NumberDisplay from './NumberDisplay';
import NumberPad from './NumberPad';
import ConfirmDialog from './ConfirmDialog';
import RainbowPopup from './RainbowPopup';
import { speak } from './AudioFeedback';
import { numberToSpanish, getRandomNumber, DEFAULT_MAX_NUMBER } from '../data/numbers';
import Confetti from 'react-confetti';
import { Volume2, Star, ArrowLeft, Shuffle, ListOrdered, Settings2 } from 'lucide-react';

const NumberGame = () => {
    const { score, addScore, resetGame } = useGame();
    const { addCorrect, addIncorrect, completeSequential, checkUnlocks, checkRainbow, newRainbow, dismissRainbow, stats } = useRewards();

    // Settings
    const [maxNumber, setMaxNumber] = useState(() => {
        const saved = localStorage.getItem('silaba_magica_max_number');
        return saved ? parseInt(saved, 10) : DEFAULT_MAX_NUMBER;
    });
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('silaba_magica_number_mode') || 'random';
    }); // 'random' or 'sequential'
    const [showSettings, setShowSettings] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    // Game state
    const [targetNumber, setTargetNumber] = useState(null);
    const [inputDigits, setInputDigits] = useState('');
    const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', null
    const [disabled, setDisabled] = useState(false);

    // Use ref for sequential counter to avoid re-triggering effects
    const sequentialRef = useRef(1);
    const [sequentialDisplay, setSequentialDisplay] = useState(1); // UI only

    // Use ref to prevent StrictMode double-mount from speaking twice
    const initialized = useRef(false);

    // Refs for current settings (so startNewRound doesn't need them as deps)
    const modeRef = useRef(mode);
    const maxNumberRef = useRef(maxNumber);
    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { maxNumberRef.current = maxNumber; }, [maxNumber]);

    // Calculate max digits for display slots
    const maxDigits = String(maxNumber).length;

    // Start a new round — standalone function, no dependencies that retrigger
    const startNewRound = (overrideNum) => {
        let num;
        if (overrideNum !== undefined) {
            num = overrideNum;
        } else if (modeRef.current === 'sequential') {
            num = sequentialRef.current;
        } else {
            num = getRandomNumber(1, maxNumberRef.current);
        }
        setTargetNumber(num);
        setInputDigits('');
        setFeedback(null);
        setDisabled(false);

        // Cancel any pending speech and dictate the number
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setTimeout(() => {
            speak(`Escribí... ${numberToSpanish(num)}`);
        }, 500);
    };

    // Initial load — only once
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            startNewRound();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('silaba_magica_max_number', String(maxNumber));
    }, [maxNumber]);

    useEffect(() => {
        localStorage.setItem('silaba_magica_number_mode', mode);
    }, [mode]);

    // When mode or maxNumber changes, reset sequential and start fresh
    const prevMode = useRef(mode);
    const prevMax = useRef(maxNumber);
    useEffect(() => {
        if (prevMode.current !== mode || prevMax.current !== maxNumber) {
            prevMode.current = mode;
            prevMax.current = maxNumber;
            sequentialRef.current = 1;
            setSequentialDisplay(1);
            startNewRound();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, maxNumber]);

    // Handle digit input
    const handleDigit = (digit) => {
        if (disabled) return;
        if (inputDigits.length >= maxDigits) return;
        setInputDigits(prev => prev + digit);
    };

    // Handle delete
    const handleDelete = () => {
        if (disabled) return;
        setInputDigits(prev => prev.slice(0, -1));
    };

    // Handle confirm
    const handleConfirm = () => {
        if (disabled || inputDigits.length === 0) return;

        const entered = parseInt(inputDigits, 10);
        if (entered === targetNumber) {
            setFeedback('correct');
            setDisabled(true);
            addScore(1);
            addCorrect('numbers', modeRef.current);
            speak('¡Muy bien!');

            // Check for rewards after a small delay
            setTimeout(() => {
                checkUnlocks();
                if (modeRef.current === 'random') checkRainbow();
            }, 300);

            setTimeout(() => {
                if (modeRef.current === 'sequential') {
                    if (sequentialRef.current >= maxNumberRef.current) {
                        // Completed all numbers!
                        completeSequential();
                        speak('¡Felicidades! ¡Terminaste todos los números!');
                        setTimeout(() => {
                            sequentialRef.current = 1;
                            setSequentialDisplay(1);
                            checkUnlocks();
                            startNewRound();
                        }, 4000);
                        return;
                    }
                    sequentialRef.current += 1;
                    setSequentialDisplay(sequentialRef.current);
                }
                startNewRound();
            }, 2000);
        } else {
            setFeedback('incorrect');
            addIncorrect();
            speak('¡Intentá nuevamente!');
            setTimeout(() => {
                setInputDigits('');
                setFeedback(null);
            }, 1500);
        }
    };

    // Repeat audio
    const handleRepeat = () => {
        if (targetNumber !== null) {
            speak(numberToSpanish(targetNumber));
        }
    };

    // Handle max number change
    const handleMaxChange = (value) => {
        const num = Math.max(1, Math.min(1000, parseInt(value, 10) || 1));
        setMaxNumber(num);
    };

    // Handle back button with confirmation
    const handleBackClick = () => {
        if (score > 0) {
            setShowExitConfirm(true);
        } else {
            resetGame('menu');
        }
    };

    return (
        <div className="flex flex-col h-dvh bg-gradient-to-b from-emerald-200 to-cyan-200 p-2 sm:p-4 overflow-hidden">
            {feedback === 'correct' && <Confetti recycle={false} numberOfPieces={200} />}

            {/* Rainbow milestone popup */}
            <RainbowPopup
                isOpen={newRainbow}
                count={stats.rainbowCount}
                onDismiss={dismissRainbow}
            />

            {/* Exit confirmation */}
            <ConfirmDialog
                isOpen={showExitConfirm}
                onConfirm={() => {
                    setShowExitConfirm(false);
                    resetGame('menu');
                }}
                onCancel={() => setShowExitConfirm(false)}
            />

            {/* Header bar */}
            <div className="flex items-center justify-between w-full shrink-0 mb-1 sm:mb-2">
                <div className="flex items-center gap-2">
                    {/* Back button */}
                    <button
                        onClick={handleBackClick}
                        className="bg-white p-1.5 sm:p-2 rounded-full shadow-md hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5 text-teal-600" />
                    </button>

                    {/* Settings toggle */}
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="bg-white p-1.5 sm:p-2 rounded-full shadow-md hover:bg-gray-100"
                    >
                        <Settings2 className="w-5 h-5 text-teal-600" />
                    </button>

                    {/* Mode and progress display */}
                    <div className="flex items-center gap-1 text-sm sm:text-lg font-bold text-teal-700 bg-white/50 px-2 py-1 rounded-lg">
                        {mode === 'sequential' ? (
                            <>
                                <ListOrdered className="w-4 h-4" />
                                <span>{sequentialDisplay} / {maxNumber}</span>
                            </>
                        ) : (
                            <>
                                <Shuffle className="w-4 h-4" />
                                <span>1 – {maxNumber}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-md">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-xl font-bold text-teal-600">{score}</span>
                </div>
            </div>

            {/* Settings panel */}
            {showSettings && (
                <div className="absolute top-14 left-2 sm:left-4 bg-white rounded-2xl shadow-xl p-4 sm:p-5 z-10 w-64 sm:w-72">
                    <h3 className="text-base sm:text-lg font-bold text-teal-700 mb-3">⚙️ Configuración</h3>

                    {/* Max number */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número máximo
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="1000"
                        value={maxNumber}
                        onChange={(e) => handleMaxChange(e.target.value)}
                        className="w-full p-2 border-2 border-teal-300 rounded-xl text-lg font-bold text-center text-teal-700 focus:ring-2 focus:ring-teal-400 outline-none mb-4"
                    />

                    {/* Mode toggle */}
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Modo de dictado
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode('random')}
                            className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-xl font-bold transition-all text-sm ${
                                mode === 'random'
                                    ? 'bg-teal-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <Shuffle className="w-4 h-4" />
                            Aleatorio
                        </button>
                        <button
                            onClick={() => setMode('sequential')}
                            className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-xl font-bold transition-all text-sm ${
                                mode === 'sequential'
                                    ? 'bg-teal-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <ListOrdered className="w-4 h-4" />
                            En orden
                        </button>
                    </div>
                </div>
            )}

            {/* Game Area — fills remaining space */}
            <div className="flex-1 flex flex-col items-center justify-evenly w-full max-w-lg mx-auto min-h-0">

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-md shrink-0">
                    Números Mágicos
                </h1>

                {/* Listen button */}
                <button
                    onClick={handleRepeat}
                    className="bg-white p-3 sm:p-4 rounded-full shadow-lg hover:scale-105 transition-transform shrink-0"
                    title="Escuchar de nuevo"
                >
                    <Volume2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-teal-500" />
                </button>

                {/* Number display */}
                <NumberDisplay digits={inputDigits} maxDigits={maxDigits} />

                {/* Feedback message */}
                <div className="h-6 sm:h-8 flex items-center justify-center shrink-0">
                    {feedback === 'correct' && (
                        <span className="text-lg sm:text-2xl font-bold text-emerald-600 animate-bounce">
                            ¡Muy bien! ⭐
                        </span>
                    )}
                    {feedback === 'incorrect' && (
                        <span className="text-lg sm:text-2xl font-bold text-red-500 animate-shake">
                            Intentá de nuevo 💪
                        </span>
                    )}
                </div>

                {/* Number pad */}
                <NumberPad
                    onDigit={handleDigit}
                    onDelete={handleDelete}
                    onConfirm={handleConfirm}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export default NumberGame;

