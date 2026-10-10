// components/ConfirmDialog.jsx: "Are you sure?" modal before a delete.
import { useState } from 'react';
import Modal from './Modal.jsx';
import ErrorBanner from './ErrorBanner.jsx';

export default function ConfirmDialog({ title, message, onConfirm, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setSubmitting(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <ErrorBanner message={error} />
      <p className="modal-text">{message}</p>
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </button>
        <button type="button" className="btn btn-danger" onClick={handleConfirm} disabled={submitting}>
          {submitting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}
