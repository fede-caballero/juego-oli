import React, { createContext, useContext, useState, useEffect } from 'react';
import { LEVEL_ORDER } from '../data/syllables';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [section, setSection] = useState('menu'); // 'menu', 'alphabet', 'syllables', 'words', 'numbers', 'collection'
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameMode, setGameMode] = useState('listening'); // 'listening' or 'speaking'

    // Determine current level data based on section
    let currentLevelData = null;
    let maxLevels = 0;

    if (section === 'syllables') {
        currentLevelData = LEVEL_ORDER[currentLevelIndex];
        maxLevels = LEVEL_ORDER.length;
    } else if (section === 'words') {
        // For words, level index maps to word lengths: 0 -> 3 letters, 1 -> 4 letters, etc.
        // We can use a simple mapping or just store the length directly.
        // Let's map index 0 to length 3, index 1 to length 4, etc.
        currentLevelData = 3 + currentLevelIndex;
        maxLevels = 4; // 3, 4, 5, 6
    } else if (section === 'alphabet') {
        currentLevelData = 'alphabet';
        maxLevels = 1;
    } else if (section === 'numbers') {
        currentLevelData = 'numbers';
        maxLevels = 1; // Single level, difficulty controlled via max number in UI
    }

    const nextLevel = () => {
        if (section === 'alphabet') return; // Only one level for alphabet

        // Syllables progression check
        if (section === 'syllables' && currentLevelIndex === 0) {
            if (score < 15) {
                // Logic to show feedback could go here, or just return
                return;
            }
        }

        if (currentLevelIndex < maxLevels - 1) {
            setCurrentLevelIndex(prev => prev + 1);
            setScore(0); // Reset score for new level? Or keep cumulative? User said "win 10 points with 2 syllables", implies reset or check delta. Let's keep cumulative but check absolute score for now, or maybe reset is clearer for "level up". Let's reset score on level change to make it clear.
        }
    };

    const [alphabetMode, setAlphabetMode] = useState('random');

    const resetGame = (newSection, newAlphabetMode = 'random') => {
        setSection(newSection);
        setCurrentLevelIndex(0);
        setScore(0);
        setGameMode('listening');
        if (newSection === 'alphabet') {
            setAlphabetMode(newAlphabetMode);
        }
    };

    const addScore = (points) => {
        setScore(prev => prev + points);
    };

    const toggleGameMode = () => {
        setGameMode(prev => prev === 'listening' ? 'speaking' : 'listening');
    };

    return (
        <GameContext.Provider value={{
            section,
            currentLevel: currentLevelData,
            score,
            gameMode,
            alphabetMode,
            nextLevel,
            addScore,
            toggleGameMode,
            resetGame
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
