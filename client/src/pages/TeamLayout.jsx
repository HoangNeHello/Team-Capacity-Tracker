// pages/TeamLayout.jsx: team header; renders Tasks / Members / Workload with <Outlet />; 404 shows the not-found page.
import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router';
import { getTeam } from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import NotFoundPage from './NotFoundPage.jsx';

export default function TeamLayout() {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setTeam(null);
    setError(null);
    try {
      setTeam(await getTeam(teamId));
    } catch (err) {
      setError(err);
    }
  }, [teamId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error?.status === 404) return <NotFoundPage />;
  if (error) return <ErrorBanner message={error.message} onRetry={load} />;
  if (!team) return <Spinner />;

  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">My teams</Link>
        <span aria-hidden="true">/</span>
        <span>{team.name}</span>
      </nav>
      <h1 className="team-title">{team.name}</h1>
      <Outlet context={{ team }} />
    </>
  );
}
