// API service for communicating with the backend
// Falls back gracefully to localStorage if backend is unreachable

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456';

const TOKEN_KEY = 'silaba_magica_token';
const USER_KEY = 'silaba_magica_user';

// ─── Token management ─────────────────────────────────────────

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUser = () => {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const saveAuth = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

// ─── HTTP helpers ─────────────────────────────────────────────

const headers = () => {
    const h = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
};

const apiFetch = async (path, options = {}) => {
    try {
        const res = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: headers(),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || `HTTP ${res.status}`);
        }
        return data;
    } catch (err) {
        if (err.message && !err.message.startsWith('HTTP')) {
            // Network error — backend unreachable
            console.warn('API unreachable:', err.message);
        }
        throw err;
    }
};

// ─── Auth ─────────────────────────────────────────────────────

export const register = async (name, pin) => {
    const data = await apiFetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({ name, pin }),
    });
    saveAuth(data.token, { id: data.userId, name: data.name });
    return data;
};

export const login = async (name, pin) => {
    const data = await apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ name, pin }),
    });
    saveAuth(data.token, { id: data.userId, name: data.name, avatar: data.avatar });
    return data;
};

export const listUsers = async () => {
    try {
        const data = await apiFetch('/api/users');
        return data;
    } catch {
        return [];
    }
};

export const logout = () => {
    clearAuth();
};

// ─── Progress ─────────────────────────────────────────────────

export const loadProgress = async () => {
    try {
        const data = await apiFetch('/api/progress');
        return data.stats;
    } catch {
        return null;
    }
};

export const saveProgress = async (stats) => {
    try {
        await apiFetch('/api/progress', {
            method: 'PUT',
            body: JSON.stringify({ stats }),
        });
        return true;
    } catch {
        return false;
    }
};

// ─── Health ───────────────────────────────────────────────────

export const checkHealth = async () => {
    try {
        await apiFetch('/api/health');
        return true;
    } catch {
        return false;
    }
};
