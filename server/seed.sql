-- seed.sql
TRUNCATE users, teams, members, tasks RESTART IDENTITY CASCADE;

INSERT INTO "users" (email, password_hash)
VALUES ('demo@example.com', 'placeholder');

INSERT INTO teams (name, owner_id)
VALUES ('Product Team', 1);

-- Open hours due in the next 7 days: Alice 20/40 (green), Ben 18/20 (amber), Chi 14/10 (red), Dana 2/0
INSERT INTO members (team_id, name, weekly_hours)
VALUES
  (1, 'Alice', 40),
  (1, 'Ben', 20),
  (1, 'Chi', 10),
  (1, 'Dana', 0);

-- Deadlines are relative to today so the seed never goes stale.
INSERT INTO tasks (team_id, title, estimate_hours, deadline, status, assignee_id)
VALUES
  (1, 'Design login page',     12, CURRENT_DATE + 1, 'doing', 1),
  (1, 'Write API docs',         8, CURRENT_DATE + 3, 'todo',  1),
  (1, 'Set up CI',             10, CURRENT_DATE + 2, 'doing', 2),
  (1, 'Fix dashboard bug',      8, CURRENT_DATE + 4, 'todo',  2),
  (1, 'Database migration',    14, CURRENT_DATE + 2, 'doing', 3),
  (1, 'Review pull requests',   2, CURRENT_DATE + 1, 'todo',  4),
  (1, 'Kick-off meeting notes', 3, CURRENT_DATE - 1, 'done',  1),
  (1, 'Research hosting',       5, CURRENT_DATE - 2, 'done',  3),
  (1, 'Update README',          4, CURRENT_DATE + 3, 'todo',  NULL),
  (1, 'Plan next sprint',       6, CURRENT_DATE + 8, 'todo',  NULL);
