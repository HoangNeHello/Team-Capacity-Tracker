// formatDate.js: "2026-10-12" → "12 Oct 2026", without time-zone shifts.
export default function formatDate(iso, withYear = true) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    ...(withYear && { year: 'numeric' }),
  });
}

export function todayIso() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
