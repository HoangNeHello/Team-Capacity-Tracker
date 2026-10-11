// routes/workload.js: per-member load for one team over the next 7 days
import { Router } from 'express';
import { query } from '../db.js';
import { getLoad } from '../load.js';

// mergeParams: lets this router read :teamId from the parent URL (/api/teams/:teamId/workload)
const router = Router({ mergeParams: true });

// Which tasks count: not done AND deadline before today + 7 (rolling 7 days; overdue unfinished work counts too).
// Same rule in both queries below, so member hours + unassigned hours always add up.
const COUNTS = "t.status <> 'done' AND t.deadline < CURRENT_DATE + 7";

// GET /api/teams/:teamId/workload: { from, to, members[], unassignedHours, unassignedTasks }
async function getWorkload(req, res) {
    // Hours per member, A–Z.
    // Filter sits in the ON clause, not WHERE: a member with no counting tasks still gets a row (0 h) instead of vanishing.
    // COALESCE turns "no tasks" (NULL) into 0. ::int because pg returns SUM as a string (bigint).
    const members = await query(
        `SELECT m.id, m.name, m.weekly_hours AS "weeklyHours",
                COALESCE(SUM(t.estimate_hours), 0)::int AS "assignedHours"
         FROM members m
         LEFT JOIN tasks t ON t.assignee_id = m.id AND ${COUNTS}
         WHERE m.team_id = $1
         GROUP BY m.id
         ORDER BY m.name`,
        [req.params.teamId]
    );

    // Tasks nobody owns yet: total hours + how many. Also returns the date range as YYYY-MM-DD strings
    // (to_char, so pg doesn't turn them into JS Dates and shift a day).
    const extra = await query(
        `SELECT COALESCE(SUM(t.estimate_hours), 0)::int AS "unassignedHours",
                COUNT(t.id)::int AS "unassignedTasks",
                to_char(CURRENT_DATE, 'YYYY-MM-DD') AS "from",
                to_char(CURRENT_DATE + 6, 'YYYY-MM-DD') AS "to"
         FROM tasks t
         WHERE t.team_id = $1 AND t.assignee_id IS NULL AND ${COUNTS}`,
        [req.params.teamId]
    );
    const { from, to, unassignedHours, unassignedTasks } = extra.rows[0];

    // Add percent + level to each member (load.js does the maths)
    res.json({
        from,
        to,
        members: members.rows.map((m) => ({ ...m, ...getLoad(m.weeklyHours, m.assignedHours) })),
        unassignedHours,
        unassignedTasks,
    });
}

router.get('/', getWorkload);

export default router;
