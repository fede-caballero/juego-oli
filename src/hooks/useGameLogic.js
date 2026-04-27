import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { SYLLABLE_LEVELS } from '../data/syllables';
import { ALPHABET_DATA } from '../data/alphabet';
import { WORD_LEVELS } from '../data/words';

export const useGameLogic = () => {
    const { section, currentLevel, addScore, alphabetMode } = useGame();
    const [currentSyllable, setCurrentSyllable] = useState('');
    const [options, setOptions] = useState([]);
    const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', null
    const alphabetIndexRef = useRef(0);

    useEffect(() => {
        if (section === 'alphabet' && alphabetMode === 'ordered') {
            alphabetIndexRef.current = 0;
        }
    }, [section, alphabetMode]);

    const generateNewRound = useCallback(() => {
        let pool = [];

        if (section === 'alphabet') {
            pool = ALPHABET_DATA;
        } else if (section === 'syllables') {
            pool = SYLLABLE_LEVELS[currentLevel] || [];
        } else if (section === 'words') {
            pool = WORD_LEVELS[currentLevel] || [];
        }

        if (pool.length === 0) return;

        let target = '';
        if (section === 'alphabet' && alphabetMode === 'ordered') {
            target = pool[alphabetIndexRef.current % pool.length];
        } else {
            target = pool[Math.floor(Math.random() * pool.length)];
        }
        
        setCurrentSyllable(target);

        // Generate options
        const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);
        if (!shuffled.includes(target)) {
            shuffled[0] = target;
        }
        setOptions(shuffled.sort(() => 0.5 - Math.random()));
        setFeedback(null);
    }, [section, currentLevel, alphabetMode]);

    useEffect(() => {
        generateNewRound();
    }, [generateNewRound]);

    const checkAnswer = (answer) => {
        if (answer === currentSyllable) {
            setFeedback('correct');
            addScore(1);
            if (section === 'alphabet' && alphabetMode === 'ordered') {
                alphabetIndexRef.current += 1;
            }
            setTimeout(generateNewRound, 1500); // Wait for animation
            return true;
        } else {
            setFeedback('incorrect');
            return false;
        }
    };

    return {
        currentSyllable,
        options,
        feedback,
        checkAnswer,
        generateNewRound
    };
};
