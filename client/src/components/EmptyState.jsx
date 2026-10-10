// components/EmptyState.jsx: what a list shows when it has nothing in it.
export default function EmptyState({ title, text, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{text}</p>
      {actionLabel && (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
