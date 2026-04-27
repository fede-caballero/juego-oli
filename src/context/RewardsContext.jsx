import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MASCOTS, DEFAULT_STATS, RAINBOW_MILESTONE } from '../data/rewards';

const RewardsContext = createContext();

const STORAGE_KEY = 'silaba_magica_rewards';

const loadFromStorage = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge with defaults to handle new fields added in updates
            return { ...DEFAULT_STATS, ...parsed };
        }
    } catch (e) {
        console.error('Error loading rewards:', e);
    }
    return { ...DEFAULT_STATS };
};

const saveToStorage = (stats) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
        console.error('Error saving rewards:', e);
    }
};

export const RewardsProvider = ({ children }) => {
    const [stats, setStats] = useState(loadFromStorage);
    const [newlyUnlocked, setNewlyUnlocked] = useState(null); // mascot object or null
    const [newRainbow, setNewRainbow] = useState(false);

    // Save to localStorage whenever stats change
    useEffect(() => {
        saveToStorage(stats);
    }, [stats]);

    // Register today as a play day (call on app load or game start)
    const registerPlayDay = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];

        setStats(prev => {
            if (prev.playDates.includes(today)) return prev; // Already registered today

            const newPlayDates = [...prev.playDates, today];
            const daysPlayed = newPlayDates.length;

            // Calculate consecutive days
            let consecutiveDays = 1;
            if (prev.lastPlayDate) {
                const lastDate = new Date(prev.lastPlayDate);
                const todayDate = new Date(today);
                const diffMs = todayDate - lastDate;
                const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    consecutiveDays = prev.consecutiveDays + 1;
                } else if (diffDays === 0) {
                    consecutiveDays = prev.consecutiveDays;
                }
                // else: streak broken, reset to 1
            }

            const bestConsecutiveDays = Math.max(prev.bestConsecutiveDays, consecutiveDays);

            return {
                ...prev,
                playDates: newPlayDates,
                daysPlayed,
                lastPlayDate: today,
                consecutiveDays,
                bestConsecutiveDays,
            };
        });
    }, []);

    // Add a correct answer for a specific section
    const addCorrect = useCallback((section, mode) => {
        setStats(prev => {
            const newStats = { ...prev };
            newStats.totalCorrect += 1;
            newStats.currentStreak += 1;
            newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);

            switch (section) {
                case 'alphabet':
                    newStats.alphabetCorrect += 1;
                    break;
                case 'syllables':
                    newStats.syllablesCorrect += 1;
                    break;
                case 'words':
                    newStats.wordsCorrect += 1;
                    break;
                case 'numbers':
                    if (mode === 'random') {
                        newStats.numbersRandomCorrect += 1;
                        // Check rainbow milestone
                        if (newStats.numbersRandomCorrect % RAINBOW_MILESTONE === 0) {
                            newStats.rainbowCount += 1;
                        }
                    } else {
                        newStats.numbersSequentialCorrect += 1;
                    }
                    break;
            }

            return newStats;
        });
    }, []);

    // Record a wrong answer (breaks current streak)
    const addIncorrect = useCallback(() => {
        setStats(prev => ({
            ...prev,
            currentStreak: 0,
        }));
    }, []);

    // Record completing sequential mode
    const completeSequential = useCallback(() => {
        setStats(prev => ({
            ...prev,
            sequentialCompleted: prev.sequentialCompleted + 1,
        }));
    }, []);

    // Check for newly unlocked mascots
    const checkUnlocks = useCallback(() => {
        setStats(prev => {
            const unlockedIds = prev.unlockedMascots.map(m => m.id);
            let newUnlock = null;

            for (const mascot of MASCOTS) {
                if (unlockedIds.includes(mascot.id)) continue;

                if (mascot.check(prev, unlockedIds)) {
                    newUnlock = mascot;
                    break; // Only unlock one at a time for the popup
                }
            }

            if (newUnlock) {
                const updatedMascots = [
                    ...prev.unlockedMascots,
                    { id: newUnlock.id, date: new Date().toISOString() },
                ];

                // Trigger popup after state update
                setTimeout(() => setNewlyUnlocked(newUnlock), 500);

                return {
                    ...prev,
                    unlockedMascots: updatedMascots,
                };
            }

            return prev;
        });
    }, []);

    // Check rainbow milestone notification
    const checkRainbow = useCallback(() => {
        setStats(prev => {
            if (prev.numbersRandomCorrect > 0 && prev.numbersRandomCorrect % RAINBOW_MILESTONE === 0) {
                setTimeout(() => setNewRainbow(true), 500);
            }
            return prev;
        });
    }, []);

    // Dismiss the popup
    const dismissUnlock = useCallback(() => {
        setNewlyUnlocked(null);
    }, []);

    const dismissRainbow = useCallback(() => {
        setNewRainbow(false);
    }, []);

    // Get unlocked mascot ids
    const unlockedIds = stats.unlockedMascots.map(m => m.id);

    return (
        <RewardsContext.Provider value={{
            stats,
            unlockedIds,
            newlyUnlocked,
            newRainbow,
            addCorrect,
            addIncorrect,
            completeSequential,
            registerPlayDay,
            checkUnlocks,
            checkRainbow,
            dismissUnlock,
            dismissRainbow,
        }}>
            {children}
        </RewardsContext.Provider>
    );
};

export const useRewards = () => useContext(RewardsContext);
