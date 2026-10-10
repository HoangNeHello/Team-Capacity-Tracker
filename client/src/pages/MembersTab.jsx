// pages/MembersTab.jsx: S07 member list with add, edit and delete.
import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { deleteMember, getMembers } from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Avatar from '../components/Avatar.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import MemberForm from './MemberForm.jsx';

export default function MembersTab() {
  const { team } = useOutletContext();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setMembers(await getMembers(team.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [team.id]);

  useEffect(() => {
    load();
  }, [load]);

  function saved() {
    setDialog(null);
    load();
  }

  let content;
  if (loading) content = <Spinner />;
  else if (error) content = <ErrorBanner message={error} onRetry={load} />;
  else if (members.length === 0) {
    content = (
      <EmptyState
        title="No members yet"
        text="Add the people on this team and how many hours they can work each week."
        actionLabel="Add member"
        onAction={() => setDialog({ mode: 'add' })}
      />
    );
  } else {
    content = (
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Weekly hours</th>
            <th scope="col"><span className="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td data-label="Name"><Avatar name={member.name} /></td>
              <td data-label="Weekly hours" className="num">
                {member.weeklyHours} h
                {member.weeklyHours === 0 && <span className="muted"> · not available</span>}
              </td>
              <td className="row-actions">
                <button type="button" className="btn btn-subtle" onClick={() => setDialog({ mode: 'edit', member })}>
                  Edit
                </button>
                <button type="button" className="btn btn-subtle btn-subtle-danger" onClick={() => setDialog({ mode: 'delete', member })}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <>
      <div className="section-header">
        <h2>Members</h2>
        {!loading && !error && members.length > 0 && (
          <button type="button" className="btn btn-primary" onClick={() => setDialog({ mode: 'add' })}>
            Add member
          </button>
        )}
      </div>
      {content}

      {(dialog?.mode === 'add' || dialog?.mode === 'edit') && (
        <MemberForm teamId={team.id} member={dialog.member} onSaved={saved} onClose={() => setDialog(null)} />
      )}
      {dialog?.mode === 'delete' && (
        <ConfirmDialog
          title={`Delete ${dialog.member.name}?`}
          message="Their tasks stay on the team and become Unassigned."
          onConfirm={async () => {
            await deleteMember(team.id, dialog.member.id);
            saved();
          }}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}
