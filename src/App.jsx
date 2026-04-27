import React from 'react';
import { GameProvider } from './context/GameContext';
import { RewardsProvider } from './context/RewardsContext';
import GameCanvas from './components/GameCanvas';
import 'regenerator-runtime/runtime';

function App() {
  return (
    <RewardsProvider>
      <GameProvider>
        <GameCanvas />
      </GameProvider>
    </RewardsProvider>
  );
}

export default App;
