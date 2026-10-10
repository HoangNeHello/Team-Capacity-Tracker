// api/mock.js: MOCK, temporary. In-memory fake of the API so the frontend runs without a backend.
// Enabled with VITE_USE_MOCK=true. Delete this file (and the switch in client.js) once the API routes exist.
// Data mirrors server/seed.sql. Resets on page refresh. Demo login: demo@example.com / demo1234.
import ApiError from './ApiError.js';

// MOCK: local date as YYYY-MM-DD, offset by a number of days.
function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// MOCK: fake network delay so loading states are visible.
function respond(value) {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), 300));
}

function fail(status, message) {
  return new Promise((_, reject) => setTimeout(() => reject(new ApiError(status, message)), 300));
}

// MOCK: seed data.
const db = {
  users: [{ id: 1, email: 'demo@example.com', password: 'demo1234' }],
  teams: [{ id: 1, name: 'Product Team' }],
  members: [
    { id: 1, teamId: 1, name: 'Alice', weeklyHours: 40 },
    { id: 2, teamId: 1, name: 'Ben', weeklyHours: 20 },
    { id: 3, teamId: 1, name: 'Chi', weeklyHours: 10 },
    { id: 4, teamId: 1, name: 'Dana', weeklyHours: 0 },
  ],
  tasks: [
    { id: 1, teamId: 1, title: 'Design login page', estimateHours: 12, deadline: isoDate(1), status: 'doing', assigneeId: 1 },
    { id: 2, teamId: 1, title: 'Write API docs', estimateHours: 8, deadline: isoDate(3), status: 'todo', assigneeId: 1 },
    { id: 3, teamId: 1, title: 'Set up CI', estimateHours: 10, deadline: isoDate(2), status: 'doing', assigneeId: 2 },
    { id: 4, teamId: 1, title: 'Fix dashboard bug', estimateHours: 8, deadline: isoDate(4), status: 'todo', assigneeId: 2 },
    { id: 5, teamId: 1, title: 'Database migration', estimateHours: 14, deadline: isoDate(2), status: 'doing', assigneeId: 3 },
    { id: 6, teamId: 1, title: 'Review pull requests', estimateHours: 2, deadline: isoDate(1), status: 'todo', assigneeId: 4 },
    { id: 7, teamId: 1, title: 'Kick-off meeting notes', estimateHours: 3, deadline: isoDate(-1), status: 'done', assigneeId: 1 },
    { id: 8, teamId: 1, title: 'Research hosting', estimateHours: 5, deadline: isoDate(-2), status: 'done', assigneeId: 3 },
    { id: 9, teamId: 1, title: 'Update README', estimateHours: 4, deadline: isoDate(3), status: 'todo', assigneeId: null },
    { id: 10, teamId: 1, title: 'Plan next sprint', estimateHours: 6, deadline: isoDate(8), status: 'todo', assigneeId: null },
  ],
  nextId: { users: 2, teams: 2, members: 5, tasks: 11 },
};

function nextId(table) {
  return db.nextId[table]++;
}

function findTeam(teamId) {
  return db.teams.find((t) => t.id === Number(teamId));
}

// MOCK: same rules as the API's load.js (architecture.md §3).
function getLoad(weeklyHours, assignedHours) {
  if (weeklyHours === 0) return { percent: null, level: assignedHours > 0 ? 'over' : 'none' };
  const percent = Math.round((assignedHours / weeklyHours) * 100);
  const level = percent > 100 ? 'over' : percent >= 80 ? 'near' : 'under';
  return { percent, level };
}

function toTask(task) {
  const member = db.members.find((m) => m.id === task.assigneeId);
  const { teamId, assigneeId, ...rest } = task;
  return { ...rest, assignee: member ? { id: member.id, name: member.name } : null };
}

function toMember({ teamId, ...member }) {
  return member;
}

function memberError({ name, weeklyHours }) {
  if (typeof name !== 'string' || !name.trim()) return 'Name is required';
  if (!Number.isInteger(weeklyHours) || weeklyHours < 0) return 'Weekly hours must be a whole number 0 or more';
  return null;
}

function taskError(teamId, { title, estimateHours, deadline, status, assigneeId }) {
  if (typeof title !== 'string' || !title.trim()) return 'Title is required';
  if (!Number.isInteger(estimateHours) || estimateHours < 1) return 'Estimate must be a whole number of hours, 1 or more';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline ?? '')) return 'Deadline must be a date (YYYY-MM-DD)';
  if (!['todo', 'doing', 'done'].includes(status)) return 'Status must be todo, doing or done';
  if (assigneeId != null && !db.members.some((m) => m.id === assigneeId && m.teamId === teamId)) {
    return 'Assignee is not a member of this team';
  }
  return null;
}

export function getHealth() {
  return respond({ status: 'ok', db: 'mock' });
}

export function signup(email, password) {
  const clean = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return fail(400, 'Enter a valid email address');
  if (String(password).length < 8) return fail(400, 'Password must be at least 8 characters');
  if (db.users.some((u) => u.email === clean)) return fail(409, 'That email is already in use');
  const user = { id: nextId('users'), email: clean, password };
  db.users.push(user);
  return respond({ token: `mock-token-${user.id}`, user: { id: user.id, email: user.email } });
}

export function login(email, password) {
  const clean = String(email).trim().toLowerCase();
  const user = db.users.find((u) => u.email === clean && u.password === password);
  if (!user) return fail(401, 'Email or password is incorrect');
  return respond({ token: `mock-token-${user.id}`, user: { id: user.id, email: user.email } });
}

export function getTeams() {
  return respond([...db.teams].sort((a, b) => a.name.localeCompare(b.name)));
}

export function createTeam(name) {
  if (typeof name !== 'string' || !name.trim()) return fail(400, 'Team name is required');
  const team = { id: nextId('teams'), name: name.trim() };
  db.teams.push(team);
  return respond(team);
}

export function getTeam(teamId) {
  const team = findTeam(teamId);
  return team ? respond(team) : fail(404, 'Team not found');
}

export function getMembers(teamId) {
  const team = findTeam(teamId);
  if (!team) return fail(404, 'Team not found');
  return respond(db.members.filter((m) => m.teamId === team.id).map(toMember));
}

export function createMember(teamId, body) {
  const team = findTeam(teamId);
  if (!team) return fail(404, 'Team not found');
  const error = memberError(body);
  if (error) return fail(400, error);
  const member = { id: nextId('members'), teamId: team.id, name: body.name.trim(), weeklyHours: body.weeklyHours };
  db.members.push(member);
  return respond(toMember(member));
}

export function updateMember(teamId, id, body) {
  const member = db.members.find((m) => m.id === Number(id) && m.teamId === Number(teamId));
  if (!member) return fail(404, 'Member not found');
  const error = memberError(body);
  if (error) return fail(400, error);
  member.name = body.name.trim();
  member.weeklyHours = body.weeklyHours;
  return respond(toMember(member));
}

export function deleteMember(teamId, id) {
  const index = db.members.findIndex((m) => m.id === Number(id) && m.teamId === Number(teamId));
  if (index === -1) return fail(404, 'Member not found');
  const [member] = db.members.splice(index, 1);
  db.tasks.forEach((t) => {
    if (t.assigneeId === member.id) t.assigneeId = null;
  });
  return respond(null);
}

export function getTasks(teamId) {
  const team = findTeam(teamId);
  if (!team) return fail(404, 'Team not found');
  const tasks = db.tasks
    .filter((t) => t.teamId === team.id)
    .sort((a, b) => a.deadline.localeCompare(b.deadline) || a.id - b.id);
  return respond(tasks.map(toTask));
}

export function createTask(teamId, body) {
  const team = findTeam(teamId);
  if (!team) return fail(404, 'Team not found');
  const error = taskError(team.id, body);
  if (error) return fail(400, error);
  const task = { id: nextId('tasks'), teamId: team.id, ...body, title: body.title.trim(), assigneeId: body.assigneeId ?? null };
  db.tasks.push(task);
  return respond(toTask(task));
}

export function updateTask(teamId, id, body) {
  const task = db.tasks.find((t) => t.id === Number(id) && t.teamId === Number(teamId));
  if (!task) return fail(404, 'Task not found');
  const error = taskError(task.teamId, body);
  if (error) return fail(400, error);
  Object.assign(task, body, { title: body.title.trim(), assigneeId: body.assigneeId ?? null });
  return respond(toTask(task));
}

export function deleteTask(teamId, id) {
  const index = db.tasks.findIndex((t) => t.id === Number(id) && t.teamId === Number(teamId));
  if (index === -1) return fail(404, 'Task not found');
  db.tasks.splice(index, 1);
  return respond(null);
}

// MOCK: unfinished tasks due before today + 7, overdue included (architecture.md §3).
export function getWorkload(teamId) {
  const team = findTeam(teamId);
  if (!team) return fail(404, 'Team not found');
  const cutoff = isoDate(7);
  const open = db.tasks.filter((t) => t.teamId === team.id && t.status !== 'done' && t.deadline < cutoff);
  const hoursFor = (assigneeId) =>
    open.filter((t) => t.assigneeId === assigneeId).reduce((sum, t) => sum + t.estimateHours, 0);

  const members = db.members
    .filter((m) => m.teamId === team.id)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((m) => {
      const assignedHours = hoursFor(m.id);
      return { ...toMember(m), assignedHours, ...getLoad(m.weeklyHours, assignedHours) };
    });

  // MOCK: unassignedTasks is not in architecture.md §3 yet; the design's "across 2 tasks" needs it from the API.
  const unassignedTasks = open.filter((t) => t.assigneeId === null).length;
  return respond({ from: isoDate(0), to: isoDate(6), members, unassignedHours: hoursFor(null), unassignedTasks });
}
