Team Task Manager
A task management app for small teams — create projects, assign tasks, and track progress together.
Live

Frontend: https://abundant-growth-production-cd75.up.railway.app
API: https://teamtaskmanager-production-a8e9.up.railway.app/api/health

What it does

Register and log in with a secure account
Create projects and invite teammates by email
Add tasks with deadlines and assignees
Track task status from a shared dashboard
Works on mobile and desktop

Tech
Frontend — React, Vite, Tailwind CSS, Axios
Backend — Node.js, Express, MongoDB, JWT, bcrypt
Deployed on — Railway
Project structure
team_task_manager/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── frontend/
    ├── src/
    └── vite.config.js
Running locally
Backend
bashcd backend
npm install
Create a .env file:
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
PORT=5000
bashnpm run dev
Frontend
bashcd frontend
npm install
npm run dev
API
POST   /api/auth/register
POST   /api/auth/login

GET    /api/projects
POST   /api/projects
POST   /api/projects/:id/members

POST   /api/tasks
GET    /api/tasks/project/:id
PATCH  /api/tasks/:id/status

GET    /api/dashboard/stats
Author
Dhruv Bansal — @dhruvbansal2411