# Team Task Manager 🚀

A full-stack task management application for teams, built with React, Node.js, Express, and MongoDB.

## 🌐 Live Demo

**Frontend:** https://abundant-growth-production-cd75.up.railway.app  
**Backend API:** https://teamtaskmanager-production-a8e9.up.railway.app/api/health

## ✨ Features

- 🔐 User authentication (JWT)
- 📊 Dashboard with task statistics
- 📁 Project management
- 👥 Team collaboration (add members by email)
- ✅ Task creation and status tracking
- 📱 Responsive design

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── src/
│   └── vite.config.js
└── README.md
```

## ⚙️ Installation

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Run:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔗 API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
```

### Projects
```
GET  /api/projects
POST /api/projects
POST /api/projects/:id/members
```

### Tasks
```
POST  /api/tasks
GET   /api/tasks/project/:id
PATCH /api/tasks/:id/status
```

### Dashboard
```
GET /api/dashboard/stats
```

## 👤 Author

**Dhruv Bansal**  
GitHub: [@dhruvbansal2411](https://github.com/dhruvbansal2411)