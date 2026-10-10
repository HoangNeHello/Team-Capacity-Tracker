// components/AppShell.jsx: icon rail (bottom bar on phones) plus <Outlet /> for the page beside it.
import { Link, NavLink, Outlet, useMatch, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext.jsx';

function Icon({ path }) {
  return (
    <svg className="rail-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  create: 'M12 5v14M5 12h14',
  teams: 'M4 5h7v6H4zM13 5h7v6h-7zM4 13h7v6H4zM13 13h7v6h-7z',
  tasks: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  members: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18.5 14a6.5 6.5 0 0 1 3 6',
  workload: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11',
};

function RailLink({ to, end, icon, label, disabled }) {
  if (disabled) {
    return (
      <span className="rail-item rail-item-disabled" aria-disabled="true" title="Open a team first">
        <Icon path={ICONS[icon]} />
        <span className="rail-label">{label}</span>
      </span>
    );
  }
  return (
    <NavLink to={to} end={end} className="rail-item">
      <Icon path={ICONS[icon]} />
      <span className="rail-label">{label}</span>
    </NavLink>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const teamMatch = useMatch('/teams/:teamId/*');
  const teamId = teamMatch?.params.teamId;
  const base = teamId ? `/teams/${teamId}` : null;

  function handleCreate() {
    navigate(base ? `${base}?create=task` : '/?create=team');
  }

  return (
    <div className="shell">
      {user && (
        <nav className="rail" aria-label="Main">
          <button type="button" className="rail-create" onClick={handleCreate}>
            <Icon path={ICONS.create} />
            <span className="rail-label">Create</span>
          </button>
          <RailLink to="/" end icon="teams" label="Teams" />
          <RailLink to={base} end icon="tasks" label="Tasks" disabled={!base} />
          <RailLink to={`${base}/members`} icon="members" label="Members" disabled={!base} />
          <RailLink to={`${base}/workload`} icon="workload" label="Workload" disabled={!base} />
          <div className="rail-account">
            <span className="rail-avatar" title={user.email} aria-label={`Signed in as ${user.email}`}>
              {user.email[0].toUpperCase()}
            </span>
            <button type="button" className="rail-item" onClick={logout}>
              <Icon path={ICONS.logout} />
              <span className="rail-label">Log out</span>
            </button>
          </div>
        </nav>
      )}
      <main className="page">
        {!user && (
          <Link to="/" className="brand-link">Team Capacity Tracker</Link>
        )}
        <Outlet />
      </main>
    </div>
  );
}
