import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3456;
const JWT_SECRET = process.env.JWT_SECRET || 'silaba-magica-secret-key-cambiar-en-produccion';

// Middleware
app.use(cors());
app.use(express.json());

// ─── Auth middleware ──────────────────────────────────────────
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// ─── Routes ───────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register a new user
app.post('/api/register', (req, res) => {
    const { name, pin } = req.body;

    if (!name || !pin) {
        return res.status(400).json({ error: 'Nombre y PIN son requeridos' });
    }

    if (name.length < 2 || name.length > 20) {
        return res.status(400).json({ error: 'El nombre debe tener entre 2 y 20 caracteres' });
    }

    if (!/^\d{4}$/.test(pin)) {
        return res.status(400).json({ error: 'El PIN debe ser de 4 dígitos' });
    }

    // Check if name already exists
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(name) = LOWER(?)').get(name);
    if (existing) {
        return res.status(409).json({ error: 'Ese nombre ya está registrado' });
    }

    const pinHash = bcrypt.hashSync(pin, 10);

    const result = db.prepare('INSERT INTO users (name, pin_hash) VALUES (?, ?)').run(name, pinHash);
    const userId = result.lastInsertRowid;

    // Create empty progress entry
    db.prepare('INSERT INTO progress (user_id, stats_json) VALUES (?, ?)').run(userId, '{}');

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '365d' });

    res.status(201).json({
        userId,
        name,
        token,
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { name, pin } = req.body;

    if (!name || !pin) {
        return res.status(400).json({ error: 'Nombre y PIN son requeridos' });
    }

    const user = db.prepare('SELECT id, name, pin_hash, avatar FROM users WHERE LOWER(name) = LOWER(?)').get(name);

    if (!user) {
        return res.status(401).json({ error: 'Nombre o PIN incorrecto' });
    }

    if (!bcrypt.compareSync(pin, user.pin_hash)) {
        return res.status(401).json({ error: 'Nombre o PIN incorrecto' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '365d' });

    res.json({
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        token,
    });
});

// Get user list (for login screen — no passwords, just names)
app.get('/api/users', (req, res) => {
    const users = db.prepare('SELECT id, name, avatar FROM users ORDER BY name').all();
    res.json(users);
});

// Get progress
app.get('/api/progress', authenticate, (req, res) => {
    const row = db.prepare('SELECT stats_json, updated_at FROM progress WHERE user_id = ?').get(req.userId);

    if (!row) {
        return res.json({ stats: {} });
    }

    try {
        res.json({
            stats: JSON.parse(row.stats_json),
            updatedAt: row.updated_at,
        });
    } catch {
        res.json({ stats: {} });
    }
});

// Save progress
app.put('/api/progress', authenticate, (req, res) => {
    const { stats } = req.body;

    if (!stats || typeof stats !== 'object') {
        return res.status(400).json({ error: 'Stats inválidos' });
    }

    const statsJson = JSON.stringify(stats);

    db.prepare(`
        INSERT INTO progress (user_id, stats_json, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
            stats_json = excluded.stats_json,
            updated_at = CURRENT_TIMESTAMP
    `).run(req.userId, statsJson);

    res.json({ success: true });
});

// Save progress via sendBeacon (no auth header, token in body)
app.post('/api/progress-beacon', (req, res) => {
    const { stats, token } = req.body;

    if (!stats || !token) {
        return res.status(400).json({ error: 'Stats y token requeridos' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const statsJson = JSON.stringify(stats);

        db.prepare(`
            INSERT INTO progress (user_id, stats_json, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                stats_json = excluded.stats_json,
                updated_at = CURRENT_TIMESTAMP
        `).run(decoded.userId, statsJson);

        res.json({ success: true });
    } catch {
        res.status(401).json({ error: 'Token inválido' });
    }
});

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 Sílaba Mágica API corriendo en http://0.0.0.0:${PORT}`);
});
