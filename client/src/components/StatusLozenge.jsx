// components/StatusLozenge.jsx: small pill showing a task's status.
export const STATUS_LABELS = { todo: 'To do', doing: 'Doing', done: 'Done' };

export default function StatusLozenge({ status }) {
  return <span className={`lozenge lozenge-${status}`}>{STATUS_LABELS[status]}</span>;
}
