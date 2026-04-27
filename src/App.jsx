import React, { useState, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { RewardsProvider } from './context/RewardsContext';
import GameCanvas from './components/GameCanvas';
import LoginScreen from './components/LoginScreen';
import { getToken, getUser, logout as apiLogout } from './services/api';
import 'regenerator-runtime/runtime';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

    // Check for existing auth on mount
    useEffect(() => {
        const token = getToken();
        const savedUser = getUser();
        if (token && savedUser) {
            setIsLoggedIn(true);
            setUser(savedUser);
        }
        setChecking(false);
    }, []);

    const handleLogin = (data) => {
        setUser({ id: data.userId, name: data.name });
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        apiLogout();
        setIsLoggedIn(false);
        setUser(null);
    };

    // Show nothing while checking auth
    if (checking) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-200 to-pink-100">
                <div className="text-3xl font-bold text-purple-500 animate-pulse">
                    ✨ Cargando...
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <RewardsProvider userId={user?.id} onLogout={handleLogout}>
            <GameProvider>
                <GameCanvas />
            </GameProvider>
        </RewardsProvider>
    );
}

export default App;
