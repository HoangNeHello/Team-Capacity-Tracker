import { useEffect, useState } from 'react';
import { getHealth } from '../api/client.js';

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState('checking…');

  useEffect(() => {
    getHealth()
      .then((data) => setApiStatus(data.status))
      .catch((err) => setApiStatus(`unreachable (${err.message})`));
  }, []);

  return (
    <main>
      <h1>Team Capacity Tracker</h1>
      <p>API: {apiStatus}</p>
    </main>
  );
}
