# Team Capacity Tracker — Project Brief

## Goal
A small web app that shows a team lead who is overloaded and which deadlines are at risk.
Built solo by Hoang as a portfolio project for junior full-stack developer roles.

## Who it's for
Student project teams and small teams (3–8 people) who need a quick answer to:
"Who has too much on, and what's going to slip?"

## Why I'm building it
On my ICT Capstone I was the coordinator. I tracked my team's timeline and capacity by hand.
This app does that job properly, and I build every part of it myself.

## Core features (must have)
1. Sign up and log in
2. Create a team
3. Add members, each with weekly available hours
4. Add tasks, each with an hour estimate, a deadline, an assignee and a status (to do / doing / done)
5. Workload dashboard: each member's load this week = assigned hours ÷ available hours
   - Green under 80%, amber 80–100%, red over 100%
6. Edit and delete members and tasks

## Limitations (known, by design)
- The app only tracks *estimates and status*, not real work. It can't tell whether an "assigned" task has actually been started — if the whole team procrastinates until the deadline, every bar stays green until it's too late to rebalance.
- It depends on honest, regular updates. If the lead doesn't keep it current, or members don't move tasks to "doing"/"done", the dashboard shows a false sense of safety — worse than no tool at all.
- It solves a visibility problem for a lead who already checks in regularly. It does not solve a motivation or accountability problem — that's a team/leadership issue, not a software one.
- It doesn't replace a code-level workflow (branches, pull requests). Capacity tracking (who owns what, how many hours) and code integration (how work merges into main) are separate concerns — this app only does the first. Small/uni/indie teams often skip tools like this and just free-style with branches + PRs, because the overhead of keeping estimates and hours updated only pays off once a team is big enough, or at-risk enough, to need it.

## Stretch goals (only after the core is finished)
- Deadline-risk warning: flag tasks where remaining hours don't fit before the deadline
- Spread a task's hours across the weeks until its deadline, instead of counting it all in one week
- Skills on members, and a suggested assignee for a task (right skill + most free hours)
- Invite teammates, with roles (lead can edit, members can view)

## Suggested stack 
- Front end: React (Vite)
- Back end: Node.js + Express (REST API, JSON)
- Database: PostgreSQL
- Charts: a simple chart library for the workload bars
- Testing: unit tests for the load calculation
- Version control: GitHub, with small commits and clear messages

## Architecture
Browser (React) → API server (Express) → Database (PostgreSQL)
- React handles pages, forms and the dashboard
- Express handles login, validation and the load calculation
- PostgreSQL stores users, teams, members and tasks

## Data model (first version)
- users: id, email, password_hash, created_at
- teams: id, name, owner_id → users
- members: id, team_id → teams, name, weekly_hours
- tasks: id, team_id → teams, title, estimate_hours, deadline, assignee_id → members, status

## Definition of done
- Live link that works
- README: what it does, why I built it, how to run it, screenshots
- Tests pass for the load calculation
- I can explain every file and every decision without notes

## Progress log
(Paste the end-of-session note here after each session, then re-upload this file.)
