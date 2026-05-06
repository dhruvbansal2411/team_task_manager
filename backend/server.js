require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ENV VALIDATION 
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingEnvVars.length > 0) {
  console.error('Missing ENV:', missingEnvVars);
  process.exit(1);
}

// MIDDLEWARE
app.use(express.json());
app.use(cors({
  origin: [
  'https://abundant-growth-production-cd75.up.railway.app',
  'http://localhost:5173',
  'http://localhost:5174'
],
  credentials: true
}));

// ROUTES 
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// STATIC (PRODUCTION)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// START SERVER
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' MongoDB connected');

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(' MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

startServer();