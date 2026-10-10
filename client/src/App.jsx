// App.jsx: the route table.
import { Routes, Route } from 'react-router';
import RequireAuth, { GuestOnly } from './auth/RequireAuth.jsx';
import AppShell from './components/AppShell.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import TeamsPage from './pages/TeamsPage.jsx';
import TeamLayout from './pages/TeamLayout.jsx';
import TasksTab from './pages/TasksTab.jsx';
import MembersTab from './pages/MembersTab.jsx';
import WorkloadTab from './pages/WorkloadTab.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<AppShell />}>
        <Route element={<RequireAuth />}>
          <Route path="/" element={<TeamsPage />} />
          <Route path="/teams/:teamId" element={<TeamLayout />}>
            <Route index element={<TasksTab />} />
            <Route path="members" element={<MembersTab />} />
            <Route path="workload" element={<WorkloadTab />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
