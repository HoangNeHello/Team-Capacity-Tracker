-- Team Capacity Tracker schema (matches team-capacity-tracker-erd.pdf).
-- Safe to run repeatedly: drops tables first, children before parents.

DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE teams (
  id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name     TEXT NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id)
);

CREATE TABLE members (
  id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id      INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  weekly_hours INTEGER NOT NULL CHECK (weekly_hours >= 0)
);

CREATE TABLE tasks (
  id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id        INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  estimate_hours INTEGER NOT NULL CHECK (estimate_hours > 0),
  deadline       DATE NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('to do', 'doing', 'done')),
  assignee_id    INTEGER REFERENCES members(id) ON DELETE SET NULL
);
