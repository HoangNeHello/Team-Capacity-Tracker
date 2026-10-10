// components/Modal.jsx: shared modal wrapper (native <dialog>) for every form and confirm dialog.
import { useEffect, useRef } from 'react';

export default function Modal({ title, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button type="button" className="btn btn-subtle btn-icon" aria-label="Close" onClick={onClose}>
          ✕
        </button>
      </div>
      {children}
    </dialog>
  );
}
