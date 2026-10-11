import express from 'express';
import cors from 'cors';
import { query } from './db.js';
import authRouter from './routes/auth.js';
import teamsRouter from './routes/teams.js';

// Built separately from index.js so tests can import the app without starting a server.
const app = express();

// Allow the frontend's origin; parse JSON bodies into req.body
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

// GET /api/health: is the API up, and can it reach the database?
app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', db: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', db: 'down' });
  }
});

// Signup and login (public, no token needed)
app.use('/api/auth', authRouter);

// All team, member and task routes (login required, see requireAuth in teams.js)
app.use('/api/teams', teamsRouter);

// Last stop for unexpected errors: log the real one, send the client a generic message (no stack trace)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

export default app;
