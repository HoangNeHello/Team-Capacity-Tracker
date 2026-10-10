// pages/TaskForm.jsx: S06 task create/edit modal. Pass `task` to edit.
import { useState } from 'react';
import Modal from '../components/Modal.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { STATUS_LABELS } from '../components/StatusLozenge.jsx';
import { createTask, updateTask } from '../api/client.js';
import { todayIso } from '../formatDate.js';

function validate({ title, estimateHours, deadline }) {
  const errors = {};
  if (!title.trim()) errors.title = 'Title is required';
  const hours = Number(estimateHours);
  if (estimateHours.trim() === '' || !Number.isInteger(hours) || hours < 1) {
    errors.estimateHours = 'Estimate must be a whole number of hours, 1 or more';
  }
  if (!deadline) errors.deadline = 'Pick a deadline';
  return errors;
}

export default function TaskForm({ teamId, task, members, onSaved, onDelete, onClose }) {
  const [values, setValues] = useState({
    title: task?.title ?? '',
    assigneeId: task?.assignee ? String(task.assignee.id) : '',
    estimateHours: task ? String(task.estimateHours) : '',
    deadline: task?.deadline ?? '',
    status: task?.status ?? 'todo',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => {
      setValues({ ...values, [field]: e.target.value });
      setFieldErrors({ ...fieldErrors, [field]: undefined });
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate(values);
    setFieldErrors(errors);
    setError('');
    if (Object.keys(errors).length > 0) return;

    const body = {
      title: values.title.trim(),
      estimateHours: Number(values.estimateHours),
      deadline: values.deadline,
      status: values.status,
      assigneeId: values.assigneeId === '' ? null : Number(values.assigneeId),
    };
    setSubmitting(true);
    try {
      if (task) await updateTask(teamId, task.id, body);
      else await createTask(teamId, body);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  const isPast = values.deadline && values.deadline < todayIso() && values.status !== 'done';

  return (
    <Modal title={task ? `Edit task #${task.id}` : 'Create task'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <ErrorBanner message={error} />
        <div className="field">
          <label htmlFor="task-title">Title</label>
          <input
            id="task-title"
            autoFocus
            maxLength={200}
            value={values.title}
            onChange={update('title')}
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={fieldErrors.title ? 'task-title-error' : undefined}
          />
          {fieldErrors.title && <p id="task-title-error" className="field-error">{fieldErrors.title}</p>}
        </div>

        <div className="field">
          <label htmlFor="task-assignee">Assignee</label>
          <select id="task-assignee" value={values.assigneeId} onChange={update('assigneeId')}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          {members.length === 0 && <p className="field-hint">Add members on the Members tab to assign work.</p>}
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="task-estimate">Estimate</label>
            <div className="input-suffix">
              <input
                id="task-estimate"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={values.estimateHours}
                onChange={update('estimateHours')}
                aria-invalid={Boolean(fieldErrors.estimateHours)}
                aria-describedby={fieldErrors.estimateHours ? 'task-estimate-error' : undefined}
              />
              <span aria-hidden="true">h</span>
            </div>
            {fieldErrors.estimateHours && (
              <p id="task-estimate-error" className="field-error">{fieldErrors.estimateHours}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="task-deadline">Deadline</label>
            <input
              id="task-deadline"
              type="date"
              value={values.deadline}
              onChange={update('deadline')}
              aria-invalid={Boolean(fieldErrors.deadline)}
              aria-describedby={fieldErrors.deadline ? 'task-deadline-error' : isPast ? 'task-deadline-hint' : undefined}
            />
            {fieldErrors.deadline ? (
              <p id="task-deadline-error" className="field-error">{fieldErrors.deadline}</p>
            ) : (
              isPast && <p id="task-deadline-hint" className="field-hint">This date is in the past.</p>
            )}
          </div>
        </div>

        <div className="field">
          <label htmlFor="task-status">Status</label>
          <select id="task-status" value={values.status} onChange={update('status')}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          {task && (
            <button type="button" className="btn btn-subtle btn-subtle-danger modal-actions-start" onClick={onDelete} disabled={submitting}>
              Delete
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : task ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
