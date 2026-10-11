// routes/tasks.js: list, create, update and delete tasks of one team
import { Router } from 'express';
import { query } from '../db.js';

// mergeParams: lets this router read :teamId from the parent URL (/api/teams/:teamId/tasks)
const router = Router({ mergeParams: true });

// Shared SELECT that shapes a task the way the frontend expects:
// - camelCase keys (estimateHours)
// - deadline as 'YYYY-MM-DD' text, so pg doesn't turn it into a Date and shift it a day
// - assignee as { id, name } or null; LEFT JOIN keeps unassigned tasks in the list
const TASK_SELECT = `
    SELECT t.id, t.title, t.estimate_hours AS "estimateHours",
           to_char(t.deadline, 'YYYY-MM-DD') AS deadline, t.status,
           CASE WHEN m.id IS NULL THEN NULL ELSE json_build_object('id', m.id, 'name', m.name) END AS assignee
    FROM tasks t
    LEFT JOIN members m ON m.id = t.assignee_id`;

// Checks the request body. Returns the first error message, or null if all good.
// The assignee check stops assigning a task to a member of another team.
async function taskError(teamId, { title, estimateHours, deadline, status, assigneeId }) {
    if (typeof title !== 'string' || !title.trim()) return 'Title is required';
    if (!Number.isInteger(estimateHours) || estimateHours < 1) return 'Estimate must be a whole number of hours, 1 or more';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline ?? '')) return 'Deadline must be a date (YYYY-MM-DD)';
    if (!['todo', 'doing', 'done'].includes(status)) return 'Status must be todo, doing or done';
    if (assigneeId != null) {
        if (!Number.isInteger(assigneeId)) return 'Assignee is not a member of this team';
        const result = await query('SELECT 1 FROM members WHERE id = $1 AND team_id = $2', [assigneeId, teamId]);
        if (result.rowCount === 0) return 'Assignee is not a member of this team';
    }
    return null;
}

// Reads one task back in the frontend's shape (used after create/update to include the assignee name)
async function findTask(teamId, id) {
    const result = await query(`${TASK_SELECT} WHERE t.id = $1 AND t.team_id = $2`, [id, teamId]);
    return result.rows[0];
}

// GET /api/teams/:teamId/tasks: all tasks of the team, soonest deadline first
async function listTasks(req, res) {
    const result = await query(
        `${TASK_SELECT} WHERE t.team_id = $1 ORDER BY t.deadline, t.id`,
        [req.params.teamId]
    );
    res.json(result.rows);
}

// POST /api/teams/:teamId/tasks: validate, insert, return the new task (201)
async function createTask(req, res) {
    const { teamId } = req.params;
    const error = await taskError(teamId, req.body);
    if (error) return res.status(400).json({ error });

    const { title, estimateHours, deadline, status, assigneeId } = req.body;
    const result = await query(
        'INSERT INTO tasks (team_id, title, estimate_hours, deadline, status, assignee_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [teamId, title.trim(), estimateHours, deadline, status, assigneeId ?? null]
    );
    res.status(201).json(await findTask(teamId, result.rows[0].id));
}

// PUT /api/teams/:teamId/tasks/:id: validate, update; 404 if the task isn't in this team
async function updateTask(req, res) {
    const { teamId, id } = req.params;
    const error = await taskError(teamId, req.body);
    if (error) return res.status(400).json({ error });

    const { title, estimateHours, deadline, status, assigneeId } = req.body;
    const result = await query(
        'UPDATE tasks SET title = $1, estimate_hours = $2, deadline = $3, status = $4, assignee_id = $5 WHERE id = $6 AND team_id = $7',
        [title.trim(), estimateHours, deadline, status, assigneeId ?? null, id, teamId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(await findTask(teamId, id));
}

// DELETE /api/teams/:teamId/tasks/:id: 204 on success, 404 if the task isn't in this team
async function deleteTask(req, res) {
    const result = await query(
        'DELETE FROM tasks WHERE id = $1 AND team_id = $2',
        [req.params.id, req.params.teamId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });
    res.status(204).end();
}

// URL → function
router.get('/', listTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
