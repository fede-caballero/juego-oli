import React, { useState, useEffect } from 'react';
import { listUsers, login, register } from '../services/api';
import { UserCircle, Plus, ArrowLeft, Lock, Loader2 } from 'lucide-react';

const LoginScreen = ({ onLogin }) => {
    const [mode, setMode] = useState('pick'); // 'pick', 'pin', 'register'
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Load user list on mount
    useEffect(() => {
        listUsers().then(setUsers).catch(() => setUsers([]));
    }, []);

    const handleUserPick = (user) => {
        setSelectedUser(user);
        setPin('');
        setError('');
        setMode('pin');
    };

    const handlePinDigit = (digit) => {
        if (pin.length >= 4) return;
        const newPin = pin + digit;
        setPin(newPin);

        // Auto-submit when 4 digits
        if (newPin.length === 4) {
            handleLogin(selectedUser?.name || name, newPin);
        }
    };

    const handlePinDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError('');
    };

    const handleLogin = async (loginName, loginPin) => {
        setLoading(true);
        setError('');
        try {
            const data = await login(loginName, loginPin);
            onLogin(data);
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
            setPin('');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (name.length < 2) {
            setError('El nombre debe tener al menos 2 letras');
            return;
        }
        if (pin.length !== 4) {
            setError('El PIN debe ser de 4 dígitos');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const data = await register(name, pin);
            onLogin(data);
        } catch (err) {
            setError(err.message || 'Error al registrar');
            setPin('');
        } finally {
            setLoading(false);
        }
    };

    const pinDots = Array.from({ length: 4 }, (_, i) => (
        <div
            key={i}
            className={`
                w-5 h-5 rounded-full transition-all duration-200
                ${i < pin.length
                    ? 'bg-purple-500 scale-110 shadow-lg shadow-purple-300'
                    : 'bg-gray-200 border-2 border-gray-300'
                }
            `}
        />
    ));

    const numpadButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'];
    const numpadColors = [
        'from-red-400 to-pink-500',
        'from-orange-400 to-red-400',
        'from-amber-400 to-orange-400',
        'from-yellow-400 to-amber-400',
        'from-lime-400 to-green-400',
        'from-green-400 to-emerald-400',
        'from-teal-400 to-cyan-400',
        'from-cyan-400 to-blue-400',
        'from-blue-400 to-indigo-400',
        '',
        'from-purple-400 to-pink-400',
        '',
    ];

    // ─── User picker screen ──────────────────────
    if (mode === 'pick') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-200 via-pink-100 to-yellow-100 p-4">
                <h1 className="text-4xl sm:text-5xl font-bold text-purple-600 mb-2 drop-shadow text-center">
                    ¡Hola! 👋
                </h1>
                <p className="text-lg text-purple-400 mb-8">¿Quién va a jugar?</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-lg mb-6">
                    {users.map(user => (
                        <button
                            key={user.id}
                            onClick={() => handleUserPick(user)}
                            className="
                                flex flex-col items-center gap-2
                                bg-white/80 p-4 rounded-2xl shadow-lg
                                hover:scale-105 active:scale-95
                                transition-all duration-200
                                border-2 border-purple-100
                            "
                        >
                            <UserCircle className="w-14 h-14 text-purple-400" />
                            <span className="text-lg font-bold text-purple-700">{user.name}</span>
                        </button>
                    ))}

                    {/* New user button */}
                    <button
                        onClick={() => {
                            setMode('register');
                            setName('');
                            setPin('');
                            setError('');
                        }}
                        className="
                            flex flex-col items-center gap-2
                            bg-gradient-to-br from-yellow-300 to-orange-300
                            p-4 rounded-2xl shadow-lg
                            hover:scale-105 active:scale-95
                            transition-all duration-200
                            border-2 border-orange-200
                        "
                    >
                        <Plus className="w-14 h-14 text-orange-600" />
                        <span className="text-lg font-bold text-orange-700">Nuevo</span>
                    </button>
                </div>

                {users.length === 0 && (
                    <p className="text-purple-400 text-sm">
                        No hay jugadores todavía. ¡Creá uno nuevo!
                    </p>
                )}
            </div>
        );
    }

    // ─── PIN entry screen ────────────────────────
    if (mode === 'pin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-200 via-pink-100 to-yellow-100 p-4">
                {/* Back button */}
                <button
                    onClick={() => setMode('pick')}
                    className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                    <ArrowLeft className="w-5 h-5 text-purple-600" />
                </button>

                <UserCircle className="w-20 h-20 text-purple-400 mb-2" />
                <h2 className="text-3xl font-bold text-purple-600 mb-1">
                    {selectedUser?.name}
                </h2>
                <p className="text-purple-400 mb-6 flex items-center gap-1">
                    <Lock className="w-4 h-4" /> Ingresá tu PIN
                </p>

                {/* PIN dots */}
                <div className="flex gap-4 mb-6">{pinDots}</div>

                {/* Error */}
                {error && (
                    <p className="text-red-500 font-bold mb-3 text-sm animate-shake">{error}</p>
                )}

                {/* Loading */}
                {loading && (
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
                )}

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                    {numpadButtons.map((btn, i) => {
                        if (btn === null) return <div key={i} />;
                        if (btn === 'del') {
                            return (
                                <button
                                    key="del"
                                    onClick={handlePinDelete}
                                    className="
                                        py-3 rounded-2xl font-bold text-lg
                                        bg-gray-200 text-gray-500
                                        hover:bg-gray-300 active:scale-95
                                        transition-all
                                    "
                                >
                                    ←
                                </button>
                            );
                        }
                        return (
                            <button
                                key={btn}
                                onClick={() => handlePinDigit(String(btn))}
                                disabled={loading}
                                className={`
                                    py-3 rounded-2xl font-bold text-2xl text-white
                                    bg-gradient-to-br ${numpadColors[i]}
                                    shadow-md border-b-4 border-black/10
                                    hover:scale-105 active:scale-95
                                    transition-all duration-150
                                    disabled:opacity-50
                                `}
                            >
                                {btn}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ─── Register screen ─────────────────────────
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-200 via-orange-100 to-pink-100 p-4">
            {/* Back button */}
            <button
                onClick={() => setMode('pick')}
                className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
            >
                <ArrowLeft className="w-5 h-5 text-orange-600" />
            </button>

            <h2 className="text-3xl font-bold text-orange-600 mb-6 drop-shadow">
                ✨ Nuevo Jugador
            </h2>

            {/* Name input */}
            <div className="w-full max-w-xs mb-4">
                <label className="block text-sm font-bold text-orange-500 mb-1">
                    ¿Cómo te llamás?
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre..."
                    maxLength={20}
                    className="
                        w-full p-3 rounded-2xl text-xl text-center font-bold
                        border-3 border-orange-300 text-orange-700
                        focus:ring-4 focus:ring-orange-200 outline-none
                        bg-white/80 shadow
                    "
                />
            </div>

            {/* PIN label */}
            <p className="text-orange-500 font-bold mb-3 flex items-center gap-1">
                <Lock className="w-4 h-4" /> Elegí un PIN de 4 dígitos
            </p>

            {/* PIN dots */}
            <div className="flex gap-4 mb-4">{pinDots}</div>

            {/* Error */}
            {error && (
                <p className="text-red-500 font-bold mb-3 text-sm animate-shake">{error}</p>
            )}

            {/* Loading */}
            {loading && (
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
            )}

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mb-4">
                {numpadButtons.map((btn, i) => {
                    if (btn === null) return <div key={i} />;
                    if (btn === 'del') {
                        return (
                            <button
                                key="del"
                                onClick={handlePinDelete}
                                className="
                                    py-3 rounded-2xl font-bold text-lg
                                    bg-gray-200 text-gray-500
                                    hover:bg-gray-300 active:scale-95
                                    transition-all
                                "
                            >
                                ←
                            </button>
                        );
                    }
                    return (
                        <button
                            key={btn}
                            onClick={() => handlePinDigit(String(btn))}
                            disabled={loading}
                            className={`
                                py-3 rounded-2xl font-bold text-2xl text-white
                                bg-gradient-to-br ${numpadColors[i]}
                                shadow-md border-b-4 border-black/10
                                hover:scale-105 active:scale-95
                                transition-all duration-150
                                disabled:opacity-50
                            `}
                        >
                            {btn}
                        </button>
                    );
                })}
            </div>

            {/* Register button */}
            {pin.length === 4 && name.length >= 2 && (
                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="
                        w-full max-w-[280px] py-3 rounded-2xl font-bold text-xl
                        bg-gradient-to-r from-orange-400 to-pink-400
                        text-white shadow-lg
                        hover:scale-105 active:scale-95
                        transition-all duration-200
                        border-b-4 border-pink-600/30
                        disabled:opacity-50
                        animate-pop-in
                    "
                >
                    ¡Crear cuenta! 🎉
                </button>
            )}
        </div>
    );
};

export default LoginScreen;
