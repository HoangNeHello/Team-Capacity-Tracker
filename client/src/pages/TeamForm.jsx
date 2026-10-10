// pages/TeamForm.jsx: S04 create-team modal (name only).
import { useState } from 'react';
import Modal from '../components/Modal.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { createTeam } from '../api/client.js';

export default function TeamForm({ onSaved, onClose }) {
  const [name, setName] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setFieldError('Team name is required');
      return;
    }
    setFieldError('');
    setSubmitting(true);
    try {
      onSaved(await createTeam(name.trim()));
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Create team" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <ErrorBanner message={error} />
        <div className="field">
          <label htmlFor="team-name">Team name</label>
          <input
            id="team-name"
            autoFocus
            maxLength={100}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFieldError('');
            }}
            aria-invalid={Boolean(fieldError)}
            aria-describedby={fieldError ? 'team-name-error' : undefined}
          />
          {fieldError && <p id="team-name-error" className="field-error">{fieldError}</p>}
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
