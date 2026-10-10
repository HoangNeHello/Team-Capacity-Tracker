// pages/TeamsPage.jsx: S03 "My teams" home page, lists teams and opens the create-team modal.
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { getTeams } from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TeamForm from './TeamForm.jsx';

export default function TeamsPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (searchParams.get('create') === 'team') {
      setCreating(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setTeams(await getTeams());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  let content;
  if (loading) content = <Spinner />;
  else if (error) content = <ErrorBanner message={error} onRetry={load} />;
  else if (teams.length === 0) {
    content = (
      <EmptyState
        title="No teams yet"
        text="Create a team, add its members and their weekly hours, then see who has too much on."
        actionLabel="Create team"
        onAction={() => setCreating(true)}
      />
    );
  } else {
    content = (
      <ul className="team-list">
        {teams.map((team) => (
          <li key={team.id}>
            <Link to={`/teams/${team.id}`} className="team-row">
              <span className="team-icon" aria-hidden="true">{team.name[0].toUpperCase()}</span>
              <span className="team-name">{team.name}</span>
              <span className="team-arrow" aria-hidden="true">›</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>My teams</h1>
        <button type="button" className="btn btn-primary create-phone" onClick={() => setCreating(true)}>
          Create team
        </button>
      </div>
      {content}
      {creating && (
        <TeamForm onClose={() => setCreating(false)} onSaved={(team) => navigate(`/teams/${team.id}`)} />
      )}
    </>
  );
}
