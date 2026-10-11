// routes/teams.js: list, create and get-one routes for the user's teams
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import membersRouter from './members.js';
import tasksRouter from './tasks.js';
import workloadRouter from './workload.js';

const router = Router();

// Login check. Runs before EVERY /api/teams route (registered first below).
// Reads "Authorization: Bearer <token>", verifies it with JWT_SECRET, puts the user id on req.userId.
// Missing, fake or expired token → 401; the frontend logs the user out on that.
function requireAuth(req, res, next) {
    const [scheme, token] = (req.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Please log in again' });
    try {
        req.userId = jwt.verify(token, process.env.JWT_SECRET).userId;
    } catch {
        return res.status(401).json({ error: 'Please log in again' });
    }
    next();
}

// GET /api/teams: only the logged-in user's teams, A–Z
async function listTeams(req, res) {
    const result = await query(
        'SELECT id, name FROM teams WHERE owner_id = $1 ORDER BY name',
        [req.userId]
    );
    res.json(result.rows);
}

// POST /api/teams: validate name, create team owned by the user (201)
async function createTeam(req, res) {
    const { name } = req.body;
    if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ error: 'Team name is required' });

    const result = await query(
        'INSERT INTO teams (name, owner_id) VALUES ($1, $2) RETURNING id, name',
        [name.trim(), req.userId]
    );
    res.status(201).json(result.rows[0]);
}

// Ownership check. Runs before every /api/teams/:teamId/... route.
// Team doesn't exist OR belongs to someone else → same 404, so strangers can't tell which ids exist.
// Non-number id ('abc') → 404 too, instead of a Postgres error.
async function loadTeam(req, res, next) {
    if (!/^\d+$/.test(req.params.teamId)) return res.status(404).json({ error: 'Team not found' });

    const result = await query(
        'SELECT id, name FROM teams WHERE id = $1 AND owner_id = $2',
        [req.params.teamId, req.userId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Team not found' });
    req.team = result.rows[0];
    next();
}

// GET /api/teams/:teamId: loadTeam already fetched it
function getTeam(req, res) {
    res.json(req.team);
}

// URL → function. Order matters: requireAuth first (every route needs a login),
// then loadTeam before the /:teamId routes (every team route needs ownership).
router.use(requireAuth);
router.get('/', listTeams);
router.post('/', createTeam);
router.use('/:teamId', loadTeam);
router.get('/:teamId', getTeam);
router.use('/:teamId/members', membersRouter);
router.use('/:teamId/tasks', tasksRouter);
router.use('/:teamId/workload', workloadRouter);

export default router;
