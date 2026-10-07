# Team Capacity Tracker

Track each team member's workload against their capacity.

## Structure

```
team-capacity-tracker/
├── client/            React (Vite)
│   └── src/
│       ├── pages/
│       ├── components/
│       └── api/       all fetch calls here
├── server/            Express
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── db/        connection + queries
│   │   └── load.js
│   ├── tests/
│   └── schema.sql
└── README.md
```

## Running locally

Requires Node (current LTS) and PostgreSQL.

```bash
# API: http://localhost:3001
cd server
cp .env.example .env
npm install
npm run dev

# Client: http://localhost:5173 (in a second terminal)
cd client
cp .env.example .env
npm install
npm run dev
```

Check the API is up: `GET http://localhost:3001/api/health` returns `{ "status": "ok" }`.
