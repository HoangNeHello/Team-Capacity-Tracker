# Team Capacity Tracker

Track each team member's workload against their capacity.

## Structure

Directory structure:
    ├── README.md
    ├── client/
    │   ├── index.html
    │   ├── package.json
    │   ├── vite.config.js
    │   └── src/
    │       ├── App.jsx
    │       ├── formatDate.js
    │       ├── index.css
    │       ├── main.jsx
    │       ├── api/
    │       │   ├── ApiError.js
    │       │   ├── client.js
    │       │   └── mock.js
    │       ├── auth/
    │       │   ├── AuthContext.jsx
    │       │   └── RequireAuth.jsx
    │       ├── components/
    │       │   ├── AppShell.jsx
    │       │   ├── AuthForm.jsx
    │       │   ├── Avatar.jsx
    │       │   ├── ConfirmDialog.jsx
    │       │   ├── EmptyState.jsx
    │       │   ├── ErrorBanner.jsx
    │       │   ├── Modal.jsx
    │       │   ├── Spinner.jsx
    │       │   ├── StatusLozenge.jsx
    │       │   └── WorkloadBar.jsx
    │       └── pages/
    │           ├── LoginPage.jsx
    │           ├── MemberForm.jsx
    │           ├── MembersTab.jsx
    │           ├── NotFoundPage.jsx
    │           ├── SignUpPage.jsx
    │           ├── TaskForm.jsx
    │           ├── TasksTab.jsx
    │           ├── TeamForm.jsx
    │           ├── TeamLayout.jsx
    │           ├── TeamsPage.jsx
    │           └── WorkloadTab.jsx
    └── server/
        ├── package.json
        ├── schema.sql
        ├── seed.sql
        └── src/
            ├── app.js
            ├── db.js
            ├── index.js
            ├── load.js
            ├── load.test.js
            └── routes/
                ├── auth.js
                ├── members.js
                ├── tasks.js
                ├── teams.js
                └── workload.js


## Running locally

Requires Node (current LTS) and PostgreSQL.

```bash
# API: http://localhost:3001
cd server
npm install
npm run dev

# Client: http://localhost:5173 (in a second terminal)
cd client
npm install
npm run dev
```

Check the API is up: `GET http://localhost:3001/api/health` returns `{ "status": "ok" }`.
