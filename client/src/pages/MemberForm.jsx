// pages/MemberForm.jsx: S08 member add/edit modal. Pass `member` to edit.
import { useState } from 'react';
import Modal from '../components/Modal.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { createMember, updateMember } from '../api/client.js';

function validate({ name, weeklyHours }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Name is required';
  const hours = Number(weeklyHours);
  if (weeklyHours.trim() === '' || !Number.isInteger(hours) || hours < 0) {
    errors.weeklyHours = 'Weekly hours must be a whole number 0 or more';
  }
  return errors;
}

export default function MemberForm({ teamId, member, onSaved, onClose }) {
  const [values, setValues] = useState({
    name: member?.name ?? '',
    weeklyHours: member ? String(member.weeklyHours) : '',
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

    const body = { name: values.name.trim(), weeklyHours: Number(values.weeklyHours) };
    setSubmitting(true);
    try {
      if (member) await updateMember(teamId, member.id, body);
      else await createMember(teamId, body);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <Modal title={member ? 'Edit member' : 'Add member'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <ErrorBanner message={error} />
        <div className="field">
          <label htmlFor="member-name">Name</label>
          <input
            id="member-name"
            autoFocus
            maxLength={100}
            value={values.name}
            onChange={update('name')}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'member-name-error' : undefined}
          />
          {fieldErrors.name && <p id="member-name-error" className="field-error">{fieldErrors.name}</p>}
        </div>
        <div className="field">
          <label htmlFor="member-hours">Weekly hours</label>
          <div className="input-suffix">
            <input
              id="member-hours"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={values.weeklyHours}
              onChange={update('weeklyHours')}
              aria-invalid={Boolean(fieldErrors.weeklyHours)}
              aria-describedby={fieldErrors.weeklyHours ? 'member-hours-error' : 'member-hours-hint'}
            />
            <span aria-hidden="true">h</span>
          </div>
          {fieldErrors.weeklyHours ? (
            <p id="member-hours-error" className="field-error">{fieldErrors.weeklyHours}</p>
          ) : (
            <p id="member-hours-hint" className="field-hint">Use 0 for someone who is away this week.</p>
          )}
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : member ? 'Save' : 'Add member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
