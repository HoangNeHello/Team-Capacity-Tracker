// routes/auth.js: signup and login, returning a JWT
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = Router();

// Signed token saying "this is user X". Only the server knows JWT_SECRET, so nobody can forge one.
function makeToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Same email check as the frontend mock: something@something.something
function isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/signup: validate, hash password, create user, return 201 { token, user }
// Email is trimmed + lowercased so "Demo@x.com" and "demo@x.com" are the same account.
async function signup(req, res) {
    const email = String(req.body.email ?? '').trim().toLowerCase();
    const password = String(req.body.password ?? '');
    if (!isEmail(email)) return res.status(400).json({ error: 'Enter a valid email address' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    // Save the hash, never the password. 10 = cost: slow enough to make cracking leaked hashes expensive.
    const hash = await bcrypt.hash(password, 10);
    try {
        const result = await query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
            [email, hash]
        );
        const user = result.rows[0];
        res.status(201).json({ token: makeToken(user.id), user });
    } catch (err) {
        // 23505 = Postgres "unique violation": the email column already has this value
        if (err.code === '23505') return res.status(409).json({ error: 'That email is already in use' });
        throw err;
    }
}

// POST /api/auth/login: find user by email, compare password with the saved hash, return { token, user }
// Unknown email and wrong password get the SAME message, so nobody can probe which emails have accounts.
async function login(req, res) {
    const email = String(req.body.email ?? '').trim().toLowerCase();
    const password = String(req.body.password ?? '');

    const result = await query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Email or password is incorrect' });
    }
    res.json({ token: makeToken(user.id), user: { id: user.id, email: user.email } });
}

// URL → function
router.post('/signup', signup);
router.post('/login', login);

export default router;
