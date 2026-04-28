import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { MASCOTS, DEFAULT_STATS, RAINBOW_MILESTONE, STAR_MILESTONE } from '../data/rewards';
import { loadProgress, saveProgress } from '../services/api';

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

export const RewardsProvider = ({ children, userId, onLogout }) => {
    const [stats, setStats] = useState(loadFromStorage);
    const [newlyUnlocked, setNewlyUnlocked] = useState(null); // mascot object or null
    const [newRainbow, setNewRainbow] = useState(false);
    const [newStarPopup, setNewStarPopup] = useState(null); // { section: 'words'|'syllables', count: number } or null
    const [synced, setSynced] = useState(false);
    const saveTimer = useRef(null);

    // Load from backend on mount (merge with local)
    useEffect(() => {
        if (!userId) return;

        loadProgress().then(serverStats => {
            if (serverStats && Object.keys(serverStats).length > 0) {
                setStats(prev => {
                    // Merge: take the higher value for each numeric stat
                    const merged = { ...DEFAULT_STATS };
                    const sources = [prev, serverStats];

                    for (const key of Object.keys(DEFAULT_STATS)) {
                        if (typeof DEFAULT_STATS[key] === 'number') {
                            merged[key] = Math.max(
                                ...sources.map(s => (s[key] ?? 0))
                            );
                        } else if (key === 'playDates') {
                            // Union of play dates
                            const allDates = new Set([
                                ...(prev.playDates || []),
                                ...(serverStats.playDates || []),
                            ]);
                            merged.playDates = [...allDates].sort();
                            merged.daysPlayed = merged.playDates.length;
                        } else if (key === 'unlockedMascots') {
                            // Union of unlocked mascots
                            const byId = {};
                            for (const m of [...(prev.unlockedMascots || []), ...(serverStats.unlockedMascots || [])]) {
                                if (!byId[m.id]) byId[m.id] = m;
                            }
                            merged.unlockedMascots = Object.values(byId);
                        } else if (key === 'lastPlayDate') {
                            merged.lastPlayDate = [prev.lastPlayDate, serverStats.lastPlayDate]
                                .filter(Boolean)
                                .sort()
                                .pop() || null;
                        }
                    }

                    return merged;
                });
                setSynced(true);
            }
        }).catch(() => {
            console.warn('Could not load progress from server');
        });
    }, [userId]);

    // Save to localStorage whenever stats change
    useEffect(() => {
        saveToStorage(stats);
    }, [stats]);

    // Debounced save to backend (every 5 seconds after changes)
    useEffect(() => {
        if (!userId || !synced) return;

        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            saveProgress(stats).catch(() => {
                console.warn('Could not save progress to server');
            });
        }, 5000);

        return () => {
            if (saveTimer.current) clearTimeout(saveTimer.current);
        };
    }, [stats, userId, synced]);

    // Save immediately on unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (userId) {
                // Use sendBeacon for reliable save on page close
                const token = localStorage.getItem('silaba_magica_token');
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3456';
                if (token) {
                    navigator.sendBeacon(
                        `${apiUrl}/api/progress-beacon`,
                        new Blob([JSON.stringify({ stats, token })], { type: 'application/json' })
                    );
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [stats, userId]);

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

    // Award prizes explicitly based on session milestones
    const awardPrize = useCallback((prizeType) => {
        setStats(prev => {
            const newStats = { ...prev };
            if (prizeType === 'star') {
                newStats.starCount += 1;
                setTimeout(() => setNewStarPopup({ section: 'syllables', count: newStats.starCount }), 500);
            } else if (prizeType === 'gem') {
                newStats.gemCount += 1;
                setTimeout(() => setNewStarPopup({ section: 'words', count: newStats.gemCount }), 500);
            } else if (prizeType === 'rainbow') {
                newStats.rainbowCount += 1;
                setTimeout(() => setNewRainbow(true), 500);
            }
            return newStats;
        });
    }, []);

    // Dismiss the popup
    const dismissUnlock = useCallback(() => {
        setNewlyUnlocked(null);
    }, []);

    const dismissRainbow = useCallback(() => {
        setNewRainbow(false);
    }, []);

    const dismissStarPopup = useCallback(() => {
        setNewStarPopup(null);
    }, []);

    // Logout handler
    const handleLogout = useCallback(() => {
        // Save final state to server before logout
        if (userId) {
            saveProgress(stats).catch(() => {});
        }
        setStats({ ...DEFAULT_STATS });
        localStorage.removeItem(STORAGE_KEY);
        if (onLogout) onLogout();
    }, [userId, stats, onLogout]);

    // Get unlocked mascot ids
    const unlockedIds = stats.unlockedMascots.map(m => m.id);

    return (
        <RewardsContext.Provider value={{
            stats,
            unlockedIds,
            newlyUnlocked,
            newRainbow,
            newStarPopup,
            addCorrect,
            addIncorrect,
            completeSequential,
            registerPlayDay,
            checkUnlocks,
            awardPrize,
            dismissUnlock,
            dismissRainbow,
            dismissStarPopup,
            handleLogout,
        }}>
            {children}
        </RewardsContext.Provider>
    );
};

export const useRewards = () => useContext(RewardsContext);
