import React from 'react';
import { GameProvider } from './context/GameContext';
import GameCanvas from './components/GameCanvas';
import 'regenerator-runtime/runtime';

function App() {
  return (
    <GameProvider>
      <GameCanvas />
    </GameProvider>
  );
}

export default App;
