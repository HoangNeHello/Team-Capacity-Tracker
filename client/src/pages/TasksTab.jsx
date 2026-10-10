// pages/TasksTab.jsx: S05 task list for a team, opens the task create/edit modal.
import { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router';
import { deleteTask, getMembers, getTasks } from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Avatar from '../components/Avatar.jsx';
import StatusLozenge from '../components/StatusLozenge.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import formatDate, { todayIso } from '../formatDate.js';
import TaskForm from './TaskForm.jsx';

export default function TasksTab() {
  const { team } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('create') === 'task') {
      setDialog({ mode: 'create' });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [taskList, memberList] = await Promise.all([getTasks(team.id), getMembers(team.id)]);
      setTasks(taskList);
      setMembers(memberList);
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

  const today = todayIso();
  const unassignedCount = tasks.filter((t) => !t.assignee && t.status !== 'done').length;

  let content;
  if (loading) content = <Spinner />;
  else if (error) content = <ErrorBanner message={error} onRetry={load} />;
  else if (tasks.length === 0) {
    content = (
      <EmptyState
        title="No tasks yet"
        text="Add the work your team has on, with an estimate in hours and a deadline."
        actionLabel="Create task"
        onAction={() => setDialog({ mode: 'create' })}
      />
    );
  } else {
    content = (
      <>
        {unassignedCount > 0 && (
          <p className="notice">
            {unassignedCount} open {unassignedCount === 1 ? 'task is' : 'tasks are'} unassigned.
          </p>
        )}
        <table className="table table-tasks">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Assignee</th>
              <th scope="col">Estimate</th>
              <th scope="col">Deadline</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const overdue = task.status !== 'done' && task.deadline < today;
              return (
                <tr key={task.id} className="row-clickable" onClick={() => setDialog({ mode: 'edit', task })}>
                  <td data-label="Title">
                    <button type="button" className="link-button" onClick={() => setDialog({ mode: 'edit', task })}>
                      <span className="muted">#{task.id}</span> {task.title}
                    </button>
                  </td>
                  <td data-label="Assignee"><Avatar name={task.assignee?.name} /></td>
                  <td data-label="Estimate" className="num">{task.estimateHours} h</td>
                  <td data-label="Deadline" className={overdue ? 'overdue num' : 'num'}>
                    {formatDate(task.deadline)}
                    {overdue && ' · Overdue'}
                  </td>
                  <td data-label="Status"><StatusLozenge status={task.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button type="button" className="btn btn-subtle create-row" onClick={() => setDialog({ mode: 'create' })}>
          + Create
        </button>
      </>
    );
  }

  return (
    <>
      <div className="section-header">
        <h2>Tasks</h2>
        <button type="button" className="btn btn-primary create-phone" onClick={() => setDialog({ mode: 'create' })}>
          Create task
        </button>
      </div>
      {content}

      {(dialog?.mode === 'create' || dialog?.mode === 'edit') && (
        <TaskForm
          teamId={team.id}
          task={dialog.task}
          members={members}
          onSaved={saved}
          onDelete={() => setDialog({ mode: 'delete', task: dialog.task })}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.mode === 'delete' && (
        <ConfirmDialog
          title={`Delete "${dialog.task.title}"?`}
          message="This task will be removed from the team. This can't be undone."
          onConfirm={async () => {
            await deleteTask(team.id, dialog.task.id);
            saved();
          }}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}
