import React from 'react';
import { useGame } from '../context/GameContext';
import { Book, Type, MessageSquare, Hash } from 'lucide-react';
import VoiceSelector from './VoiceSelector';

const MainMenu = () => {
    const { resetGame } = useGame();

    const menuItems = [
        { id: 'alphabet', label: 'Abecedario', icon: Type, color: 'bg-green-400' },
        { id: 'syllables', label: 'Sílabas', icon: Book, color: 'bg-blue-400' },
        { id: 'words', label: 'Palabras', icon: MessageSquare, color: 'bg-purple-400' },
        { id: 'numbers', label: 'Números', icon: Hash, color: 'bg-teal-400' },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-200 to-orange-200 p-4">
            <h1 className="text-5xl font-bold text-orange-600 mb-12 drop-shadow-md text-center">
                ¡Vamos a Jugar!
            </h1>

            <div className="grid grid-cols-2 gap-8 w-full max-w-3xl">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => resetGame(item.id)}
                        className={`
              ${item.color}
              flex flex-col items-center justify-center
              p-8 rounded-3xl shadow-xl
              transform transition-all duration-300 hover:scale-105 hover:rotate-2
              text-white
            `}
                    >
                        <item.icon className="w-24 h-24 mb-4" />
                        <span className="text-3xl font-bold">{item.label}</span>
                    </button>
                ))}
            </div>

            <VoiceSelector />
        </div>
    );
};

export default MainMenu;
