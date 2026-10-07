import { Routes, Route } from 'react-router';
import HomePage from './pages/HomePage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
