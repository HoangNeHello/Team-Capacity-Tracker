// routes/members.js: list, create, update and delete members of one team
import { Router } from 'express';
import { query } from '../db.js';

// mergeParams: lets this router read :teamId from the parent URL (/api/teams/:teamId/members)
const router = Router({ mergeParams: true });

// Checks the request body. Returns the first error message, or null if all good.
// Number.isInteger rejects "20" (text) and 20.5.
function memberError({ name, weeklyHours }) {
    if (typeof name !== 'string' || !name.trim()) return 'Name is required';
    if (!Number.isInteger(weeklyHours) || weeklyHours < 0) return 'Weekly hours must be a whole number 0 or more';
    return null;
}

// GET /api/teams/:teamId/members: all members of the team, A–Z.
// AS "weeklyHours": DB uses snake_case, frontend expects camelCase.
async function listMembers(req, res) {
    const result = await query(
        'SELECT id, name, weekly_hours AS "weeklyHours" FROM members WHERE team_id = $1 ORDER BY name',
        [req.params.teamId]
    );
    res.json(result.rows);
}

// POST /api/teams/:teamId/members: validate, insert, return the new member (201)
async function createMember(req, res) {
    const error = memberError(req.body);
    if (error) return res.status(400).json({ error });

    const result = await query(
        'INSERT INTO members (team_id, name, weekly_hours) VALUES ($1, $2, $3) RETURNING id, name, weekly_hours AS "weeklyHours"',
        [req.params.teamId, req.body.name.trim(), req.body.weeklyHours]
    );
    res.status(201).json(result.rows[0]);
}

// PUT /api/teams/:teamId/members/:id: validate, update; 404 if the member isn't in this team
async function updateMember(req, res) {
    const error = memberError(req.body);
    if (error) return res.status(400).json({ error });

    const result = await query(
        'UPDATE members SET name = $1, weekly_hours = $2 WHERE id = $3 AND team_id = $4 RETURNING id, name, weekly_hours AS "weeklyHours"',
        [req.body.name.trim(), req.body.weeklyHours, req.params.id, req.params.teamId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Member not found' });
    res.json(result.rows[0]);
}

// DELETE /api/teams/:teamId/members/:id: 204 on success, 404 if not in this team.
// Their tasks stay but become unassigned (ON DELETE SET NULL in schema.sql).
async function deleteMember(req, res) {
    const result = await query(
        'DELETE FROM members WHERE id = $1 AND team_id = $2',
        [req.params.id, req.params.teamId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Member not found' });
    res.status(204).end();
}

// Runs before any route with :id. Non-number id ('abc') → 404, instead of a Postgres error (500).
router.param('id', (req, res, next, id) => {
    if (!/^\d+$/.test(id)) return res.status(404).json({ error: 'Member not found' });
    next();
});

// URL → function
router.get('/', listMembers);
router.post('/', createMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

export default router;
