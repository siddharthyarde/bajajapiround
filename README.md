# TaskFlow

A smart task manager with server-side priority scoring.

## Stack

- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Frontend**: React + Vite
- **Database**: MongoDB Atlas

## Priority Score Formula

```
priority = (importance × 10) + (100 / max(daysUntilDue, 1))
```

Computed at read time, never stored. Completed tasks always score 0.

## Running Locally

### Backend
```bash
cd backend
cp .env.example .env   # fill in MONGO_URI
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` in `frontend/.env.local` to your deployed backend URL.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/bfhl/tasks` | List tasks sorted by priorityScore DESC |
| POST | `/bfhl/tasks` | Create a task |
| PATCH | `/bfhl/tasks/:id` | Update a task |
| DELETE | `/bfhl/tasks/:id` | Delete a task |
| GET | `/bfhl/tasks/stats` | Aggregated analytics (MongoDB pipeline) |

### Query Filters
- `?status=pending` or `?status=completed`
- `?minImportance=3`
- Combinable: `?status=pending&minImportance=3`
