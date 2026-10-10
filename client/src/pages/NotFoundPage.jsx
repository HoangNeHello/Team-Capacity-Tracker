// pages/NotFoundPage.jsx: S10, for bad URLs and for teams that aren't yours.
import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <section className="empty-state">
      <h1>Page not found</h1>
      <p>This page doesn't exist, or you don't have access to it.</p>
      <Link to="/" className="btn btn-primary">Go to my teams</Link>
    </section>
  );
}
