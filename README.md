# Team Task Manager

A full-stack task management application built with React, Node.js, Express, and MongoDB.

## Features

* User authentication (JWT)
* Dashboard with task statistics
* Project management
* Team collaboration (add members)
* Task creation and status tracking
* Responsive design

## Tech Stack

Frontend:

* React (Vite)
* Tailwind CSS
* Axios

Backend:

* Node.js
* Express
* MongoDB (Mongoose)
* JWT Authentication
* bcrypt

## Installation

### Backend Setup

cd backend
npm install

Create `.env`:

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

Run:
npm run dev

---

### Frontend Setup

cd frontend
npm install
npm run dev

---

## Running

Frontend:
http://localhost:5174

Backend:
http://localhost:5000

---

## API Endpoints

Auth:
POST /api/auth/signup
POST /api/auth/login

Projects:
GET /api/projects
POST /api/projects
POST /api/projects/add-member

Tasks:
POST /api/tasks
GET /api/tasks/project/:id
PUT /api/tasks/:id

Dashboard:
GET /api/dashboard

---

## Project Structure

team-task-manager/
├── backend/
├── frontend/
└── README.md

---

## Author

Dhruv Bansal
