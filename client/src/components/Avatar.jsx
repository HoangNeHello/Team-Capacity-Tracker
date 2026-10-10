// components/Avatar.jsx: initials circle for a member, or an "Unassigned" placeholder.
function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function Avatar({ name }) {
  if (!name) {
    return (
      <span className="person person-unassigned">
        <span className="avatar avatar-empty" aria-hidden="true" />
        Unassigned
      </span>
    );
  }
  return (
    <span className="person">
      <span className="avatar" aria-hidden="true">{initials(name)}</span>
      {name}
    </span>
  );
}
