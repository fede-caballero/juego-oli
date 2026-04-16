import React from 'react';
import { Mic, MicOff } from 'lucide-react';

const MicrophoneButton = ({ listening, startListening, stopListening }) => {
    return (
        <button
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            className={`
        p-6 rounded-full shadow-xl transition-all duration-300
        ${listening ? 'bg-red-500 scale-110 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'}
      `}
        >
            {listening ? (
                <Mic className="w-12 h-12 text-white" />
            ) : (
                <MicOff className="w-12 h-12 text-white" />
            )}
        </button>
    );
};

export default MicrophoneButton;
