// components/Spinner.jsx: loading indicator with a cold-start message.
import { useEffect, useState } from 'react';

export default function Spinner() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="spinner-wrap" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{slow ? 'Waking up the server… this can take up to a minute.' : 'Loading…'}</span>
    </div>
  );
}
