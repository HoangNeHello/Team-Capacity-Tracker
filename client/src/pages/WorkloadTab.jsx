// pages/WorkloadTab.jsx: S09 workload dashboard, one card with a bar per member.
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router';
import { getWorkload } from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import WorkloadBar from '../components/WorkloadBar.jsx';
import formatDate from '../formatDate.js';

export default function WorkloadTab() {
  const { team } = useOutletContext();
  const navigate = useNavigate();
  const [workload, setWorkload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setWorkload(await getWorkload(team.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [team.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;

  if (workload.members.length === 0) {
    return (
      <EmptyState
        title="No members yet"
        text="Add members and their weekly hours to see everyone's workload."
        actionLabel="Add members"
        onAction={() => navigate(`/teams/${team.id}/members`)}
      />
    );
  }

  const { unassignedHours, unassignedTasks } = workload;

  return (
    <>
      <div className="section-header">
        <h2>Workload</h2>
        <p className="muted">
          Next 7 days · {formatDate(workload.from, false)} – {formatDate(workload.to)}
        </p>
      </div>

      <section className="card workload-card" aria-label="Workload per member">
        <div className="workload-row workload-scale" aria-hidden="true">
          <span />
          <span />
          <div className="workload-bar">
            <span className="scale-label scale-80">80%</span>
            <span className="scale-label scale-full">Full</span>
          </div>
          <span />
          <span />
        </div>
        {workload.members.map((member) => (
          <WorkloadBar key={member.id} member={member} />
        ))}
      </section>

      <p className="workload-unassigned">
        <strong className="num">{unassignedHours} h</strong> unassigned
        {unassignedTasks !== undefined && ` across ${unassignedTasks} ${unassignedTasks === 1 ? 'task' : 'tasks'}`}
        {unassignedHours > 0 && (
          <>
            {' · '}
            <Link to={`/teams/${team.id}`}>Go to Tasks</Link>
          </>
        )}
      </p>
      <p className="field-hint">Counts unfinished tasks due in the next 7 days, including overdue ones.</p>
    </>
  );
}
