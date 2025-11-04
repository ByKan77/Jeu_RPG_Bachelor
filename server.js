const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./backend/config/database');

const app = express();

// Middleware CORS - doit être avant les routes
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
const itemRoutes = require('./backend/routes/itemRoutes');
const questRoutes = require('./backend/routes/questRoutes');
const authRoutes = require('./backend/routes/authRoutes');
const playerRoutes = require('./backend/routes/playerRoutes');

app.use('/api/items', itemRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/player', playerRoutes);

// Routes de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      items: '/api/items',
      quests: '/api/quests',
      auth: '/api/auth',
      player: '/api/player'
    }
  });
});

// Gestion d'erreur 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Port
const PORT = process.env.PORT || 5000;

// Connexion à la base de données puis démarrage du serveur
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
